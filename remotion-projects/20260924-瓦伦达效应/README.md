# 瓦伦达效应（信息图动画型样板）

复刻抖音科普片「瓦伦达效应」。本项目**第一个「信息图动画型」片子**，视觉体系与主力的「口诀卡片型」不同。

- 规格：**1920×1080 @30fps**，109.9s，17 段
- 形态：顶部场景标题（中文大字 + 英文衬线副标题）/ 中部 SVG 线条信息图 / 底部大字幕
- 视觉：暖米色径向渐变噪点底（`#F7F1EA` → `#E6DBD0`），深蓝黑字 `#232838`，赭红强调 `#C0563C`

## 文件结构

| 文件 | 作用 |
|---|---|
| `src/SceneSwitcher.tsx` | 17 段场景表（`title/sub/text/dur/audio/Comp`），自动排帧 |
| `src/components/theme.ts` | 色板 / 版式 / 字号（全部为参考片实测值） |
| `src/components/primitives.tsx` | 图元库：`Stage` `Reveal` `Frame` `Txt` `Chip` `Line` `Arrow` `Dot` `Ring` `Bar` `Person` `Formula` |
| `src/scenes/part{1,2,3}.tsx` | 17 个场景的图示 |
| `src/components/Background.tsx` | 暖米色渐变 + 颗粒噪点 + 右下装饰弧 |
| `src/components/SceneTitle.tsx` / `Caption.tsx` | 顶部标题 / 底部字幕（**都硬切**，只有图示层 crossfade） |

## 时间轴

```
dur_i   = 音频帧数 + 12
inAt_i  = outAt_{i-1}          (首段 inAt = -12，保证帧 0 整段在场)
outAt_i = inAt_i + dur_i
TOTAL_FRAMES 自动同步给 Root
```

⚠️ **场景内每个图元的 `at`（局部帧）= 对应口播词开始时刻 × 30**，时间戳来自 whisper 词级转写。
这是本项目的硬要求 —— 图元按固定节奏出现会导致「画面比口播提前 3-5s」。改文案后必须重跑转写并重排 `at`。

## 重新生成

```bash
# 1. 配音（曼波 scm_hd_clic0dkg，speed 1.1）
python3 ../../tools/tts/generate_tts.py

# 2. 词级转写（输出到 /tmp/asr/，用于校准图元 at）
/tmp/asr_venv/bin/python ../../tools/audio-align/align.py public/audio

# 3. 渲染（⚠️ 别用 npx，会卡在解析 registry）
./node_modules/.bin/remotion render src/index.ts wallenda-effect out/wallenda-effect.mp4 \
  --browser-executable="/Users/zhanglei/软件下载/chrome-headless-shell-mac-arm64/chrome-headless-shell" \
  --concurrency=2
```

⚠️ 速创猫偶发返回**长静音音频**（曾遇到 60s / 26s 全静音），生成后必须核验：

```bash
ffprobe -v error -show_entries format=duration -of csv=p=0 public/audio/s04.mp3
ffmpeg -i public/audio/s04.mp3 -af "silencedetect=noise=-45dB:d=1.2" -f null - 2>&1 | grep silence_start
```
