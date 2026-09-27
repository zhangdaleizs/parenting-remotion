# 进度追踪

## 当前状态
当前阶段：已完成（7/7）｜ 成片 `out/final-loud.mp4`（714 帧 / 23.85s）

## 阶段清单
| 阶段 | 状态 | 产出物 | 备注 |
|------|:----:|--------|------|
| 0 拆解参考片 | ✅ completed | `docs/storyboard.md` | 新形态「单词网格高亮型」（3×4 网格）；版式逐像素实测 |
| 1 定稿文案 | ✅ completed | storyboard 内容表 | 12 组英/音标/中；**音标为本次新增**（参考片无音标），取英式 |
| 2 音频先行 | ✅ completed | `public/audio/vo/s01-12.mp3` | Tina老师 + 1.1，再 atempo 1.35 → 合计 20.41s（参考片 20.53s） |
| 3 图片素材 | ✅ completed | `public/thumbs/` | 图库实拍（Wikimedia Commons），**已按授权过滤掉 CC BY-SA** |
| 4 排帧 | ✅ completed | `src/config.ts` | 按 ffprobe 实测时长排；总 714 帧 / 23.85s |
| 5 写代码 | ✅ completed | `src/` | 网格组件 `WordGrid.tsx` 替换原单列 `WordList.tsx` |
| 6 渲染 + 核验 | ✅ completed | `out/final.mp4` | 抽帧核对高亮同步；相邻帧差分扫描无异常帧 |
| 7 封面 + 发布 | ✅ completed | `out/cover*.png` + `docs/release-info.md` | 双封面 4:3 / 3:4；响度 −12.5 LUFS |

## 变更日志

- **第 0 步**：`douyin-downloader` 被风控（403），回退 `video_batch_download/douyin_oneshot.mjs` 秒下。
  参考片 576×768 / 30fps / 20.53s。whisper 双语言模式转写确认音频是「英文单词 + 中文释义」，
  并用英文模式拿 12 个词的起始时刻。逐像素量版式：卡 139×135、列步进 157.5、行步进 160.5，
  高亮色 `#DEB6A8`，底色 `#FCF9E3`。

- **形态判定**：与已有的「单词列表高亮型」（`20260927-英语启蒙蔬菜`，单列 9 行）同源但布局不同 ——
  本片是 **3 列 × 4 行网格**。归为「单词网格高亮型」，已回写 `CLAUDE.md`。

- **第 2 步**：TTS 沿用蔬菜项目验证过的路线（Tina老师 + `speed_ratio 1.1`，再 `atempo=1.35`）。
  ⚠️ 不能靠抬 `speed_ratio` 提速 —— 实测 1.3 以上会让英文词被念回中文。
  加速后 12 段合计 20.41s，与参考片 20.53s 几乎一致。

- **第 3 步（踩坑）**：第一轮搜图直接用 Commons 搜索结果，**选完才发现 11/12 张是 CC BY-SA**
  （share-alike 对商用账号有传染性）。回去给 `search_thumbs.py` 加了授权过滤
  （批量查 `extmetadata.LicenseShortName`，含 SA 一律丢弃），重搜重选。
  过滤后部分关键词候选骤减（`sweet` 只剩 3 张、`sour` 的好图全被滤掉变成复古插画），
  靠 `sour` 换关键词为 `lemon slices` 解决。
  最终 12 张：CC0 ×3、PD ×1、CC BY ×8，无 SA。

- **第 3 步（踩坑）**：辣椒图是**透明 PNG**，`Image.convert("RGB")` 把透明区变成黑块，
  在浅色卡片上是一坨黑方块。修法：先 `alpha_composite` 到白底再转 RGB。

- **第 5 步**：卡内比源片**多一行音标**，源片的图高（107px）和英文位置（卡顶下 179px）放不下，
  压缩为图 104px / 英文中心 138px；音标紧跟英文成一组，中文单独一行并与这组拉开 52px，
  否则三行会糊在一起。第一版音标与中文贴太紧，渲染后放大核对才发现并调整。

- **第 6/7 步**：响度 `-25.1 → -12.5 LUFS`（真峰值 −1.7 dBFS，不削波）。
  测了参考片本身：**−11.07 LUFS、真峰值 +0.39 dBFS（已削波）**，本片轻 1.4dB 但更干净。
