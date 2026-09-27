# card-slides-video 模板（育儿卡片轮播骨架）

育儿口诀卡片视频的起手骨架：**横屏 1280×720 + 卡片轮播 + 音频调度 + 卡片皮肤库**，复制即用，不依赖任何外部仓库。

视觉规格全部来自**参考视频逐帧实测**（详见 `CLAUDE.md`「视觉体系」）：浅灰噪点底 + 白色圆角卡托黑线简笔图标 + 深蓝序号/提示语 + 赭橙口诀。

## 用法

```bash
# 1. 复制为新项目（目录名格式：YYYYMMDD-项目名）
cp -R templates/card-slides-video remotion-projects/<YYYYMMDD-项目名>
cd remotion-projects/<YYYYMMDD-项目名>
npm install
# ⚠️ 复制带 node_modules 的项目后先 rm -rf out 清旧产物

# 2. 改 package.json 的 name、Root.tsx 的 Composition id

# 3. 预览调试
npx remotion studio
```

## 数据结构

**一切都在 `src/SceneSwitcher.tsx` 的 `CARDS` 数组里**，改数据即可出片：

```tsx
{
  index: "一",              // 槽 1：中文序号（小号蓝字）
  // lead: "不追着喂",      // 或 槽 1：首行提示语（大号蓝字）—— 与 index 互斥
  icon: "bowl",            // 图标名，见 components/BoardIcon.tsx
  badge: "check",          // 右上角装饰：check / warn / cross / heart / none
  text: "喂饭七分饱",       // 槽 2：橙色口诀（单行；两句用 / 分隔）
  dur: 68,                 // 本卡时长（帧）= 音频帧数 + 缓冲 12-16
  audio: "card02",         // public/audio/card02.mp3，不填 = 静默卡
  sfx: [{ at: 0, file: "whoosh.wav", volume: 0.12 }],  // 可选
}
```

`LAYOUT_CARDS` 会自动累加算出每张卡的 `inAt / outAt`，`TOTAL_FRAMES` 自动同步给 Root —— **不用手写帧号表**。

## 加图标

`src/components/BoardIcon.tsx` 里加一个 `case`。风格铁律（决定质感，别破）：

- 纯黑粗线 + `strokeLinecap="round"` + `fill="none"`
- 图形**画满 viewBox**（约 10-90 区间），画小了白卡会显得空
- 加拟人小表情（用 `<Face cx cy />`）
- ⚠️ **不要混用外部图标素材** —— 一张风格不统一整条片子就廉价了

## 配音

参考流程见 `CLAUDE.md`「音频先行」。

```bash
# 速创猫（推荐，音色多）
python3 ../../tools/tts/generate_tts.py     # 读 scripts/batch_config.json

# whisper 词级对齐（改文案后必须重跑）
/tmp/asr_venv/bin/python ../../tools/audio-align/align.py public/audio
```

⚠️ 本模板的 `public/audio/card*.mp3` 是**macOS `say` 生成的占位音**（用于打通链路），音质远不如 TTS，正式出片必须替换。

## 渲染

```bash
# ⚠️ 别用 npx（会先解析 registry 并可能卡在下载 chrome-headless-shell）
./node_modules/.bin/remotion render parenting-cards out/sample.mp4 \
  --browser-executable="/Users/zhanglei/软件下载/chrome-headless-shell-mac-arm64/chrome-headless-shell" \
  --concurrency=1
```
