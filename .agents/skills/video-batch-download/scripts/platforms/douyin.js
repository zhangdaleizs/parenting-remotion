import { PlatformParser } from "./base.js";
import { sanitizeName, itemKey, sleep, settleWithin } from "../utils/common.js";

const URL_PATTERNS = [
  /^https?:\/\/v\.douyin\.com\//i,
  /^https?:\/\/(?:www\.)?douyin\.com\//i,
  /^https?:\/\/(?:www\.)?iesdouyin\.com\//i,
];

const WATERMARK_PATTERNS = [
  /playwm/i,
  /watermark=1/i,
  /watermark_image/i,
  /owner_watermark/i,
  /tplv-dy-water/i,
];

function _isWatermarkedUrl(url) {
  return WATERMARK_PATTERNS.some((p) => p.test(url));
}

export class DouyinParser extends PlatformParser {
  static getPlatformName() {
    return "抖音";
  }

  static matchesUrl(url) {
    return URL_PATTERNS.some((pattern) => pattern.test(url));
  }

  async parse(browserManager, url, options) {
    const browser = await browserManager.start();
    const contextOptions = DouyinParser.getBrowserContextOptions(browserManager, options);

    const context = await browser.newContext(contextOptions);
    const page = await context.newPage();
    const candidates = [];
    const _pendingResponsePromises = [];
    let detailStatus = null;
    let permanentReason = null;
    let detailMeta = null;

    const addCandidate = (candidate) => {
      if (!candidate.url || candidates.some((item) => item.url === candidate.url)) {
        return;
      }
      candidates.push(candidate);
    };

    page.on("response", (response) => {
      const promise = (async () => {
        const responseUrl = response.url();
        const headers = response.headers();
        const contentType = headers["content-type"] ?? "";

        // Intercept CDN video/audio responses.
        // 只认正文流：douyinvod.com（CDN 视频）与 aweme/v1/play（官方播放端点）。
        // douyinstatic.com / byteeffecttos.com / byteimg 等是 PC 站 UI 资源（占位 mp4、特效素材），
        // 常带 video/* content-type 且体积很小，按 content-type 收会把它们误当正文视频。
        if (/douyinvod\.com/i.test(responseUrl) || /\/aweme\/v1\/play\//i.test(responseUrl)) {
          const total = Number(
            headers["content-range"]?.match(/\/(\d+)$/)?.[1] ?? headers["content-length"] ?? 0
          );
          addCandidate({
            url: responseUrl,
            totalBytes: total,
            source: "media-response",
            fromDownloadAddr: false,
            isWatermarked: _isWatermarkedUrl(responseUrl),
          });
        }

        // Intercept detail API — extract watermark-free download_addr URLs
        if (/\/aweme\/v1\/web\/aweme\/detail\//.test(responseUrl)) {
          detailStatus = response.status();
          if (response.ok()) {
            try {
              const json = await response.json();
              this._collectMediaUrls(json, candidates);
              this._extractDownloadUrls(json, candidates);
              const statusCode = json?.status_code ?? json?.aweme_detail?.status?.is_delete;
              if (statusCode && statusCode !== 0) {
                permanentReason = `Douyin detail status: ${statusCode}`;
              }
              detailMeta = this._extractDetailMeta(json);
            } catch (e) { console.warn(`[douyin] failed to parse detail API response: ${e.message}`); }
          }
        }
      })();
      _pendingResponsePromises.push(promise);
    });

    try {
      await page.goto(url, {
        waitUntil: "domcontentloaded",
        timeout: options.pageTimeoutMs,
      });

      // Wait for media + API responses, settling all pending async handlers
      const deadline = Date.now() + options.mediaWaitMs;
      let firstSeenAt = null;
      while (Date.now() < deadline) {
        if (candidates.length > 0) {
          firstSeenAt ??= Date.now();
          if (Date.now() - firstSeenAt >= 5_000) break;
        }
        await sleep(250);
      }

      // CRITICAL: wait for all async response handlers to complete
      // (response.json() is async, download_addr URLs arrive here)
      await Promise.allSettled(_pendingResponsePromises);

      // DOM 兜底：直接读 <video> 元素的实际播放地址。
      // 最可靠 —— 浏览器正在播的就是正文流，不依赖拦截时机，也不受 detail API 解析失败影响。
      // 轮询等待：播放器挂载 + 起播需要几秒，读太早 currentSrc 还是空的。
      const readDomVideoUrls = () =>
        page
          .evaluate(() =>
            [...document.querySelectorAll("video")].flatMap((v) => [
              v.currentSrc,
              v.src,
              ...[...v.querySelectorAll("source")].map((s) => s.src),
            ])
          )
          .catch(() => []);

      let domVideoUrls = [];
      const domDeadline = Date.now() + 20_000;
      while (Date.now() < domDeadline) {
        domVideoUrls = (await readDomVideoUrls()).filter(Boolean);
        if (domVideoUrls.length > 0) break;
        await sleep(500);
      }

      for (const domUrl of domVideoUrls) {
        if (!domUrl) continue;
        // fromDownloadAddr 标记 = 排序优先（无水印正文流，优先于 CDN 拦截到的候选）
        addCandidate({
          url: domUrl,
          totalBytes: 0,
          source: "dom-video",
          fromDownloadAddr: true,
          isWatermarked: _isWatermarkedUrl(domUrl),
        });
      }

      const finalUrl = page.url();
      const pageTitle = sanitizeName(await page.title().catch(() => ""));
      const bodyText = await page.locator("body").innerText({ timeout: 3_000 }).catch(() => "");

      if (/作品不存在|视频不见了|已删除|暂无权限|私密作品/u.test(bodyText)) {
        permanentReason = bodyText.match(/作品不存在|视频不见了|已删除|暂无权限|私密作品/u)?.[0];
      }

      if (candidates.length === 0) {
        const challenge = /验证码|安全验证|完成验证|captcha/i.test(bodyText);
        const reason = permanentReason ?? (challenge
          ? "Douyin verification challenge"
          : `No media response (detail status ${detailStatus ?? "unknown"})`);
        const error = new Error(reason);
        error.permanent = Boolean(permanentReason);
        throw error;
      }

      // Sort: watermark-free download_addr first, then by quality
      candidates.sort((a, b) => {
        if (a.fromDownloadAddr && !b.fromDownloadAddr) return -1;
        if (!a.fromDownloadAddr && b.fromDownloadAddr) return 1;
        if (!a.isWatermarked && b.isWatermarked) return -1;
        if (a.isWatermarked && !b.isWatermarked) return 1;
        return this._candidateScore(b) - this._candidateScore(a);
      });

      const mediaStreams = this._selectMediaStreams(candidates);

      console.log("[douyin] selected:", mediaStreams.map(s => s.url?.slice(0,120)));
      if (mediaStreams.length === 0) {
        throw new Error("No valid Douyin media streams found");
      }

      const videoId = this._extractVideoId(finalUrl) ?? itemKey(url);

      return {
        platform: DouyinParser.getPlatformName(),
        sourceUrl: url,
        canonicalUrl: finalUrl,
        videoId,
        title: pageTitle,
        author: detailMeta?.author ?? { nickname: null, uid: null, url: null },
        description: detailMeta?.description ?? null,
        postTime: detailMeta?.post_time ?? null,
        duration: detailMeta?.duration ?? null,
        statistics: detailMeta?.statistics ?? {},
        referer: "https://www.douyin.com/",
        mediaStreams: mediaStreams.map((stream) => ({
          ...stream,
          referer: "https://www.douyin.com/",
        })),
      };
    } finally {
      await settleWithin(context.close(), 5_000);
    }
  }

  _extractVideoId(url) {
    return url.match(/\/(?:video|note)\/(\d+)/)?.[1] ?? null;
  }

  _candidateScore(candidate) {
    let bitrate = 0;
    try {
      bitrate = Number(new URL(candidate.url).searchParams.get("br") ?? 0);
    } catch {}
    let score = (candidate.totalBytes ?? 0) * 10 + bitrate;
    if (candidate.isWatermarked && !candidate.fromDownloadAddr) score *= 0.5;
    return score;
  }

  _selectMediaStreams(candidates) {
    const mergedCandidates = candidates.filter((candidate) =>
      !this._isDashVideoUrl(candidate.url) && !this._isDashAudioUrl(candidate.url)
    );
    const dashVideos = candidates.filter((candidate) => this._isDashVideoUrl(candidate.url));
    const dashAudios = candidates.filter((candidate) => this._isDashAudioUrl(candidate.url));

    // Always prefer watermark-free (fromDownloadAddr) over CDN-intercepted
    const bestMerged = mergedCandidates.find((c) => c.fromDownloadAddr || !c.isWatermarked) ?? mergedCandidates[0];
    const bestDashVideo = dashVideos.find((c) => c.fromDownloadAddr || !c.isWatermarked) ?? dashVideos[0];
    const bestDashAudio = dashAudios[0];

    if (bestMerged) return [this._mergedStream(bestMerged)];

    if (bestDashVideo) {
      const audio = bestDashAudio ?? this._deriveDashAudioCandidate(bestDashVideo);
      if (audio) return this._dashStreams(bestDashVideo, audio);
    }

    if (bestDashAudio && mergedCandidates[0]) {
      return [this._mergedStream(mergedCandidates[0])];
    }

    if (bestDashAudio) {
      return [{ url: bestDashAudio.url, type: "audio", format: "mp4" }];
    }

    return [];
  }

  _mergedStream(candidate) {
    return { url: candidate.url, type: "video+audio", format: "mp4" };
  }

  _dashStreams(video, audio) {
    return [
      { url: video.url, type: "video", format: "mp4" },
      { url: audio.url, type: "audio", format: "mp4" },
    ];
  }

  _isDashVideoUrl(url) {
    return /media-video-avc1/i.test(url);
  }

  _isDashAudioUrl(url) {
    return /media-audio-mp4a/i.test(url);
  }

  _deriveDashAudioCandidate(videoCandidate) {
    if (!this._isDashVideoUrl(videoCandidate.url)) return null;
    const audioUrl = videoCandidate.url.replace(/media-video-avc1/ig, "media-audio-mp4a");
    if (audioUrl === videoCandidate.url) return null;
    return {
      url: audioUrl,
      totalBytes: 0,
      source: "derived-dash-audio",
      fromDownloadAddr: false,
      isWatermarked: false,
    };
  }

  _extractDownloadUrls(json, results) {
    const video = json?.aweme_detail?.video;
    if (!video) return;

    // 1. download_addr = watermark-free, play_addr variants = may have watermark
    const addrFields = ["download_addr", "play_addr", "play_addr_h264", "play_addr_265"];
    for (const field of addrFields) {
      const addr = video[field];
      if (!addr?.url_list?.length) continue;
      const noWatermark = field === "download_addr";
      for (const rawUrl of addr.url_list) {
        if (typeof rawUrl !== "string" || !/^https?:\/\//.test(rawUrl)) continue;
        const url = rawUrl.replaceAll("\\u0026", "&");
        const existing = results.find((r) => r.url === url);
        if (existing) {
          existing.fromDownloadAddr = noWatermark || existing.fromDownloadAddr;
          if (noWatermark) existing.isWatermarked = false;
        } else if (/(douyinvod\.com|aweme\/v1\/play)/i.test(url)) {
          results.push({
            url,
            totalBytes: 0,
            source: noWatermark ? "download-addr" : "play-addr",
            fromDownloadAddr: noWatermark,
            isWatermarked: !noWatermark && _isWatermarkedUrl(url),
          });
        }
      }
    }

    // 2. bit_rate[].play_addr.url_list — multi-quality, often watermark-free streams
    const bitRates = video.bit_rate;
    if (Array.isArray(bitRates)) {
      for (const entry of bitRates) {
        if (!entry?.play_addr?.url_list) continue;
        for (const rawUrl of entry.play_addr.url_list) {
          if (typeof rawUrl !== "string" || !/^https?:\/\//.test(rawUrl)) continue;
          const url = rawUrl.replaceAll("\\u0026", "&");
          if (!/(douyinvod\.com|aweme\/v1\/play)/i.test(url)) continue;
          const existing = results.find((r) => r.url === url);
          if (existing) {
            existing.isWatermarked = existing.isWatermarked && _isWatermarkedUrl(url);
          } else {
            results.push({
              url,
              totalBytes: 0,
              source: "bitrate-play-addr",
              fromDownloadAddr: false,
              isWatermarked: _isWatermarkedUrl(url),
            });
          }
        }
      }
    }
  }

  _collectMediaUrls(value, results, depth = 0) {
    if (depth > 12 || value == null) return;
    if (typeof value === "string") {
      if (/^https?:\/\//.test(value) && /(douyinvod\.com|aweme\/v1\/play)/i.test(value)) {
        results.push({
          url: value.replaceAll("\\u0026", "&"),
          totalBytes: 0,
          source: "detail-json",
          fromDownloadAddr: false,
          isWatermarked: _isWatermarkedUrl(value),
        });
      }
      return;
    }
    if (Array.isArray(value)) {
      for (const child of value) this._collectMediaUrls(child, results, depth + 1);
      return;
    }
    if (typeof value === "object") {
      for (const child of Object.values(value)) {
        this._collectMediaUrls(child, results, depth + 1);
      }
    }
  }

  _extractDetailMeta(json) {
    const detail = json?.aweme_detail ?? json;
    if (!detail || typeof detail !== "object") return null;

    const author = detail.author ?? {};
    const stats = detail.statistics ?? detail.stats ?? {};
    const createTime = detail.create_time;

    return {
      author: {
        nickname: author.nickname ?? null,
        uid: author.uid ?? author.sec_uid ?? null,
        url: author.sec_uid ? `https://www.douyin.com/user/${author.sec_uid}` : null,
      },
      description: detail.desc ?? null,
      duration: (() => {
        const raw = detail.duration ?? detail.video?.duration ?? null;
        return raw != null ? Math.round(raw / 1000) : null;
      })(),
      post_time: createTime
        ? new Date(createTime * 1000).toISOString().replace("T", " ").slice(0, 19)
        : null,
      statistics: {
        play_count: stats.play_count ?? stats.vv ?? null,
        digg_count: stats.digg_count ?? stats.digg ?? null,
        comment_count: stats.comment_count ?? null,
        share_count: stats.share_count ?? stats.share ?? null,
        collect_count: stats.collect_count ?? null,
      },
    };
  }
}
