# 进度追踪

## 当前状态
当前阶段：第 7 步 渲染 ｜ 已完成：6/7

## 阶段清单
| 阶段 | 状态 | 产出物 | 备注 |
|------|:----:|--------|------|
| 0 拆解参考片 | ✅ completed | `docs/storyboard.md` | 新形态「单词列表高亮型」；版式逐像素实测 |
| 1 定稿文案 | ✅ completed | storyboard 内容表 | 9 组英/音标/中，音标照抄参考片（英式） |
| 2 音频先行 | ✅ completed | `public/audio/vo/s01-09.mp3` | Tina老师 + 1.1，再 atempo 1.35；用户试听确认发音全对 |
| 3 图片素材 | ✅ completed | `public/thumbs/` | 图库方案：Wikimedia Commons + Openverse（CC0/PDM/CC-BY） |
| 4 排帧 | ✅ completed | `src/config.ts` | 按 ffprobe 实测时长排；总 577 帧 / 19.23s |
| 5 写代码 | ✅ completed | `src/` | tsc 零错误；抽帧与原片并排校准过 |
| 6 渲染 + 响度 | 🔄 in_progress | `out/final.mp4` | — |
| 7 封面 + 发布 | ⏳ pending | `out/cover*.png` + `docs/release-info.md` | — |

## 变更日志

- 2026-09-27 第 0 步：下载参考片（douyin-downloader 被风控 403，回退
  `video_batch_download/douyin_oneshot.mjs` 秒下）。whisper 双语言模式转写确认音频是
  「英文单词 + 中文释义」。逐帧量版式（容器/行卡/高亮色/元素居中方式）。
- 2026-09-27 第 2 步：音色筛选实测 —— **曼波和少儿故事是纯中文音色，把 `daikon`
  念成「待會拜拜」「呆孔」，直接排除**；Tina老师 / 爽快思思念对英文。
  用户选 Tina老师。⚠️ `speed_ratio 1.3` 会让 s03/s04/s09 的英文退回中文，
  最终用 **1.1 生成 + atempo 1.35 后期变速**（用户选的加速版）。
  `daikon` 是小写时也会被当中文念，改大写 `Daikon` 才念英文。
- 2026-09-27 第 3 步：图片素材踩坑 —— Commons 的 `iiurlwidth` 只产出 250px 且
  **URL 层面的尺寸替换会被 400 拒绝**（`Use thumbnail sizes listed on ...`），
  最终直接用 API 给的 250px（最终只显示 92px，够用）。
  搜「daikon radish」出来一堆料理成品、搜「loofah」全是田间植株 —— 挑选时按
  **长宽比 0.72–1.4 过滤**再挑，避免宽幅图裁方后只剩一根胡萝卜。
- 2026-09-27 第 5 步：字体踩坑 —— 系统字体栈 `"Helvetica Neue"` 在
  chrome-headless-shell 里 fallback 成了过粗的字形（墨迹占比 0.361 vs 原片 0.292）。
  改用 `@remotion/google-fonts/Arimo`（Arial 度量兼容）+ **fontWeight 400**
  才匹配（0.308 vs 0.292，宽度 92 vs 96）。
- 2026-09-27 全部完成；形态与三条新坑回写 `CLAUDE.md`。
