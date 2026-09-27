// 抖音无水印视频一次性下载：开一次页面 → 读 <video> 的 currentSrc → 带着 cookie/referer 直接下。
// 不走 skill 的「失败重试 10 次」循环 —— 重复开页会触发抖音验证码。
// 用法：node douyin_oneshot.mjs "<分享链接>" <输出目录>
import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";

const [shareUrl, outDir] = process.argv.slice(2);
if (!shareUrl || !outDir) {
  console.error("用法: node douyin_oneshot.mjs <url> <outDir>");
  process.exit(1);
}

const SKILL_DIR = path.dirname(new URL(import.meta.url).pathname);
const STATE = path.join(SKILL_DIR, "douyin-storage-state.json");
const UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36";

fs.mkdirSync(outDir, { recursive: true });

const browser = await chromium.launch({ headless: true, args: ["--disable-blink-features=AutomationControlled"] });
const ctx = await browser.newContext({
  storageState: fs.existsSync(STATE) ? STATE : undefined,
  userAgent: UA,
  viewport: { width: 1280, height: 900 },
});
const page = await ctx.newPage();

// 拦 CDN 流（MSE 页面的兜底来源）
const netUrls = [];
page.on("response", (r) => {
  const u = r.url();
  if (/douyinvod\.com|\/aweme\/v1\/play\//.test(u)) netUrls.push(u);
});

let title = "";
let awemeId = shareUrl.match(/\/(?:video|note)\/(\d+)/)?.[1] ?? "unknown";

console.log("[1/3] 打开页面…");
await page.goto(shareUrl, { waitUntil: "domcontentloaded", timeout: 60_000 });

// 轮询等待播放器挂载并起播
console.log("[2/3] 等待播放器…");
let videoUrl = "";
// ⚠️ 有的抖音页用 MSE 播放，<video>.currentSrc 是 blob: 开头 —— 取不到直链，必须跳过
const usable = (u) => u && !u.startsWith("blob:") && !u.startsWith("data:");
const deadline = Date.now() + 30_000;
while (Date.now() < deadline) {
  const info = await page.evaluate(() => {
    const v = document.querySelector("video");
    if (!v) return { urls: [], title: document.title, href: location.href };
    return {
      urls: [v.currentSrc, v.src, ...[...v.querySelectorAll("source")].map((s) => s.src)].filter(Boolean),
      title: document.title,
      href: location.href,
    };
  });
  if (info.href && /\/video\//.test(info.href)) awemeId = info.href.match(/\/video\/(\d+)/)?.[1] ?? awemeId;
  title = info.title || title;
  const hit = info.urls.find(usable);
  if (hit) { videoUrl = hit; break; }
  await page.waitForTimeout(500);
}

// 网络兜底：MSE 页面拿不到直链时，用拦到的 CDN 流地址
if (!videoUrl) videoUrl = netUrls.find(usable) ?? "";
if (!videoUrl) {
  console.error("未找到视频流 —— 页面可能要求验证。title=", title);
  await browser.close();
  process.exit(2);
}
console.log("     流地址:", videoUrl.slice(0, 110), "…");

// 拿 cookie 用于下载
const cookies = await ctx.cookies();
const cookieHeader = cookies.map((c) => `${c.name}=${c.value}`).join("; ");
await browser.close();

console.log("[3/3] 下载中…");
const resp = await fetch(videoUrl, {
  headers: { "User-Agent": UA, Referer: "https://www.douyin.com/", Cookie: cookieHeader },
  redirect: "follow",
});
if (!resp.ok) {
  console.error("下载失败 HTTP", resp.status);
  process.exit(3);
}
const buf = Buffer.from(await resp.arrayBuffer());

// 用视频标题做文件名（去掉话题标签和平台后缀）
const safeTitle = title.replace(/#[^\s#]+/g, "").replace(/-\s*抖音\s*$/, "").trim() || awemeId;
const file = path.join(outDir, `${safeTitle}.mp4`);
fs.writeFileSync(file, buf);

console.log(`完成: ${file}`);
console.log(`      ${(buf.length / 1024 / 1024).toFixed(2)} MB`);
