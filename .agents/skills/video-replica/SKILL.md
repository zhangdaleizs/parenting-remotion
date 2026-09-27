---
name: video-replica
description: 复刻抖音/B站/小红书参考片为 Remotion 成片。**当用户发来视频链接并说「复刻」「仿一下」「照着做个」「拆解重做」时，务必先调用本 skill**——参考片的版面参数必须实测、素材必须按帧抠取、时长必须按音频反排，凭感觉直接开做会白费几十分钟渲染。触发场景：抖音/B站链接 + 复刻、爆款拆解、参考视频仿制、video replica、照着这条做一条。
---

# 复刻参考片（video-replica）

把一条参考短视频拆解成可复用的结构，重做成本项目的 Remotion 成片。

**核心原则**：复刻不是"照着看一遍再拍脑袋做"，而是**把参考片当数据源**——版式量出精确值，素材按帧抠出，节奏按音频反排。任何"大概齐"都会在成片里放大成肉眼可见的廉价感。

---

## 第 0 步（必做）：先跟用户对齐两个决策

动手前必须问清楚，这两个选择会让工作量差 5-10 倍：

**A. 复刻范围**
| 选项 | 说明 |
|---|---|
| 等长全量 | 逐句还原。最接近原片，但插画/素材量巨大（一条 199s 的片可能有 60 张） |
| **压缩重构**（多数情况推荐） | 保留骨架和核心表达，压到 60-100s。抖音完播率优先，工作量可控 |
| 只复刻结构 | 内容照搬，视觉换成本项目现有皮肤。工作量最小 |

**B. 素材来源**
| 选项 | 风险 |
|---|---|
| 从参考片抠 | 最快最还原，但**属于他人作品，公开发布有搬运/侵权风险**——必须向用户明确提示 |
| AI 生成 | 风格一致性难保证，需大量筛选 |
| 自有/简笔 SVG | 最安全，工作量最大 |

⚠️ 提示版权风险是**必做动作**，不能因为用户选了就跳过。用户接受后照做，但要留痕。

---

## 七步流程

### 1. 下载参考片

```bash
# 先试 douyin-downloader（API 签名，快，无需浏览器）
cd .claude/skills/douyin-downloader && python3 scripts/main.py "<链接>" -o ../../reference

# 被风控 403（Blocked by ArgusSecurityPlugin）就回退 Playwright 方案
cd .claude/skills/video-batch-download && \
  node scripts/download.mjs "<链接>" --output ../../reference \
  --no-transcribe --storage-state ./douyin-storage-state.json
```

- `--no-transcribe` 是**提速关键**：Playwright 只管抓取，转写另跑（下一步）
- 产物在 `reference/<时间戳>_<平台>_<作者>_<id>/`，**mp4 实际在 `reference/.temp/<id>.mp4`**
- JSON 里有标题、作者、时长、点赞/分享/收藏——**分享数 > 点赞数**通常意味着强共鸣传播型，值得复刻

### 2. 转写拿完整文案

```bash
mkdir -p /tmp/ref_audio
ffmpeg -y -i reference/.temp/<id>.mp4 -vn -ac 1 -ar 16000 /tmp/ref_audio/ref.mp3
/tmp/asr_venv/bin/python tools/audio-align/align.py /tmp/ref_audio small   # → /tmp/asr/ref.txt
```

输出带**词级时间戳**，一石二鸟：既读全文案，又能把每个段落定位回原片时间轴（第 5 步抠图要用）。

### 3. 逐帧看画面 + 量出版式

```bash
ffmpeg -y -i <mp4> -vf "fps=1/6,scale=768:-1" /tmp/frames/f%02d.png
```

- **直接 Read 图片**判断布局/配色/文字（当前模型有视觉）
- ⚠️ 精确值**必须用 Python 采样，不能靠眼睛估**。要被测的量：
  - 背景色（可能是纯白，视觉上却像浅灰）
  - 顶部栏/标题栏的**真实底边**（会比你以为的更低）
  - 分隔线 y、字幕区范围、元素边界

```bash
python3 -c "
import numpy as np; from PIL import Image
g = np.array(Image.open('/tmp/full.png').convert('L'))
rows = (g < 160).sum(axis=1)
for y in range(len(rows)):
    if rows[y]: print(y, rows[y])   # 看内容分布在哪些行
"
```

### 4. 定结构 → 压缩文案

- 先把原片的**叙事骨架**写出来（钩子 → 共情 → 归因 → 方法 → 升华 之类）
- 再按骨架压缩：**保留叙事链，砍重复论证**。别为卡时长砍断逻辑——内容完整比秒数重要
- 分段粒度 = **口播自然句**，一段 3-6s。别切碎，碎段会让画面疯狂闪烁
- **过一遍 `CLAUDE.md`「内容合规」自查**（育儿/健康类的最大风险点）

### 5. 抠素材

**找切换点**——关键是**只对素材区域做检测**，先把字幕区 crop 掉，否则字幕每换一句都被判成切换：

```bash
ffmpeg -i <mp4> -filter:v "crop=<w>:<素材区高>:0:<素材区起点>,select='gt(scene,0.03)',showinfo" -f null - 2>&1 \
  | grep -o 'pts_time:[0-9.]*' | cut -d: -f2
```

**抽帧**——在切换点 +1s 处抽（避开淡入过程），并裁掉原片自己的顶栏和字幕：

```bash
ffmpeg -y -ss <t+1> -i <mp4> -frames:v 1 -vf "crop=<w>:<高>:0:<y起点>" /tmp/final/s01.png
```

**抹掉素材自带的旁白小字**（否则会和自己的底部字幕撞车、措辞还不一样）：

```bash
python3 tools/image/clean_caption.py <输入目录> <输出目录>          # 先 --dry-run 看检测框
```

- 该脚本按「空白带」切内容块，挑出「上半部 + 高度 8-90 + 像素密度低」的块填白
- **气泡台词要保留**——那是角色台词，属于画面叙事，信息有增量
- ⚠️ 纯文字卡（整张就是一句话的过渡卡）会被误判成旁白小字而抹空，**这类帧要单独跳过**

### 6. TTS + 排帧

```bash
# 1) 文案写进 <项目>/scripts/batch_config.json（数组：text / voice_id / speed_ratio / output）
# 2) 跑 TTS（速创猫 key 已内置于脚本）
cd remotion-projects/<项目> && python3 ../../tools/tts/generate_tts.py

# 3) 实测每段时长，反排帧
for f in s*.mp3; do ffprobe -v error -show_entries format=duration -of csv=p=0 "$f"; done
```

- **dur = 音频帧数 + 16**（缓冲必须 ≥ FADE_IN，否则话没说完画面就切了）
- `inAt_i` = 前一段结束；首段 `inAt = -FADE_IN`（帧 0 就整段在场，别从 opacity 0 淡入）
- **先音频后帧号**。反过来做必然节奏错位

### 7. 渲染 + 三步核验

```bash
./node_modules/.bin/remotion render src/index.ts <composition-id> out/final.mp4 \
  --browser-executable="/Users/zhanglei/软件下载/chrome-headless-shell-mac-arm64/chrome-headless-shell" \
  --concurrency=2
```

核验**一步都不能省**：

1. **查转场** —— 抽 scene 边界 ±6 帧，确认没有闪白：
   `remotion still --frame=<边界帧>`（⚠️ `--frame` 是**全局帧号**）
2. **查字幕** —— 长句是否断在标点后、有没有压边。长句要在文案里用 `\n` 手动断行
3. **查全片** —— 抽 10 帧铺开看一遍，别只看出片成功

---

## 版面实测参数（插画讲解型，2026-09-19 实测自抖音爆款）

原片 1024×576 → 本项目 1280×720：

| 元素 | 位置/值 |
|---|---|
| 背景 | 纯白 `#FFFFFF`（不是浅灰） |
| 顶部栏 | y=0-78：左「📚 + 选题标题」44px 粗体，右「栏目导航」31px |
| 素材区 | y=70-595，1024×420 原图按 1280×525 显示 |
| 分隔线 | y=595，1.5px `#8C8C8C`（原片 y=476@576） |
| 字幕条 | y=596-720，黑字居中，单行 50px / 长句 42px 两行 |

**转场规则**：素材层做层叠 crossfade（新淡入盖旧，**旧的不淡出**）；**文字层硬切**（两行宽度不同的字做 crossfade 会发虚重影）。

---

## 必须避开的坑

| 坑 | 根因 | 做法 |
|---|---|---|
| **切换瞬间闪一帧白** | 旧元素 `frame >= outAt` 就卸载，而新元素此刻才 opacity 0 开始淡入 | 卸载条件放宽到 `frame >= outAt + FADE_IN`——等下一张完全淡入后再卸 |
| **字幕重影发虚** | 文字层做了 crossfade | 文字层硬切：`frame < inAt \|\| frame >= outAt` → null |
| **场景检测出一堆假切换点** | 字幕区没 crop 掉，字幕每句变化都被算作场景变化 | 检测前先 crop 掉字幕区，只测素材区 |
| **抠出的素材顶部被切** | 顶栏真实底边比预估更低 | 裁切起点比量到的底边再多留 5-10px |
| **复制项目后 CLI 全挂** | `cp -r` 把 `.bin/` 的符号链接**解引用成实体文件**，内部相对 require 失效 | `ln -sf ../@remotion/cli/remotion-cli.js node_modules/.bin/remotion` 或 `npm install` 重建 |
| **时段对不上/节奏滞后** | 先定帧再生成音频，或动画锚点用估算帧号 | 音频先行，ffprobe 实测反排；改任一段音频后全部重排 |

其余通用坑（React #309、`<Audio>` 必须包 `<Sequence>`、`npx remotion` 挂起等）见项目根 `CLAUDE.md` 的「常踩的坑」。

---

## 交付时要说清的三件事

1. **成片路径** + 时长/分辨率/体积
2. **实际时长 vs 目标时长**的偏差及原因（若超了，给出"删哪几段能压到目标"的选项，别自作主张砍）
3. **素材版权风险** —— 若素材来自参考片，提醒发布前需二次处理或替换
