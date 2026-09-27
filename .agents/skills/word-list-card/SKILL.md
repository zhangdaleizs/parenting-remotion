---
name: word-list-card
description: >-
  单词列表高亮型视频完整开发流程（抖音/视频号，N 行单词卡常驻 + 念到哪行哪行变橙）。
  流程：形态判断 → 拆解参考片（下载/转写/逐像素量版式）→ 词汇表 → 音频先行（TTS + 逐段核验）
  → 图片素材（Commons/Openverse 免 key 图库，含可复用脚本）→ 写代码 → 渲染/响度 → 封面/发布。
  素材零 AI 成本（图库 + 程序化噪点背景）。
  触发词：单词卡、单词列表、单词速记、记单词、单词高亮、10秒记住一串单词、蔬菜类/水果类/动物类单词。
  要做的是 3×4 网格布局（不是单列列表）时，改用 word-grid-card。
metadata:
  type: workflow
---

# 单词列表高亮型视频开发流程

给定主题（如「蔬菜类 9 个单词」）后，严格按以下流程顺序推进，**不跳步、不并行**，
上一阶段确认后才进入下一阶段。视觉细节的事实源是 `CLAUDE.md` 的「单词列表高亮型结构」，
本 skill 是**可执行流程**。

**这个形态是什么**：整屏 N 行单词卡常驻不动，念到哪一行，那一行的底色从近白渐变成橙。
不是「一段一景」，也不是「卡片轮播」—— 全片只有高亮在移动。

---

## 流程总览

```
第 0 步 形态判断
第 1 步 拆解参考片（下载 → 转写 → 逐像素量版式）
第 2 步 词汇表（N 组「英文 + 音标 + 中文 + 配图」）
第 3 步 音频先行（TTS + 逐段核验）           ← 返工源头，先出真实帧数
第 4 步 图片素材（Commons/Openverse 图库）   ← 见 scripts/find_images.py
第 5 步 写代码（版式常量 + 高亮逻辑）
第 6 步 渲染 + 响度归一化
第 7 步 封面 + 发布信息 + 回写 CLAUDE.md
```

## 验收标准总表

| 阶段 | 产出物 | 验收标准（通过才进下一步） |
|------|--------|--------------------------|
| 0 形态判断 | 形态归属结论 | 内容是「整屏 N 行 + 逐行高亮」→ 本流程；一句一景 → 走 `english-rhyme-card` |
| 1 拆解参考片 | `docs/storyboard.md` | 版式**逐像素实测**（不靠眼睛估）；音频模式确认（有英文吗？念几遍？） |
| 2 词汇表 | storyboard 内容表 | 每组音标/中文齐全；**与参考片有差异化**（别逐字照搬）；合规自查 |
| 3 音频先行 | `public/audio/vo/*.mp3` + 帧数表 | 每段 ffprobe 实测时长；**whisper 双模式核验英文没被当中文念**；用户试听确认 |
| 4 图片素材 | `public/thumbs/*.png` | 9 张风格基本统一；**授权可商用**；缩略图直角、正方形、主体清晰 |
| 5 写代码 | `src/` | 复用零件；`tsc --noEmit` 零错误；抽帧与原片并排比对过 |
| 6 渲染 | `out/final-loud.mp4` | 渲染成功；**跑过 loudnorm**；逐秒抽帧核验高亮行与音频对齐 |
| 7 封面+发布 | `out/cover*.png` + `docs/release-info.md` | **双封面都渲染**；发布清单待办（含素材署名）逐项确认 |

---

## 第 0 步 · 形态判断

| 内容特征 | 走哪条 |
|---------|-------|
| 整屏**单列** N 行词卡常驻 + 念到哪行哪行变橙 | **本流程** |
| 整屏 **3×4 网格**词卡常驻 + 念到哪张哪张变橙（卡内带音标） | `word-grid-card` —— 本流程的网格变体 |
| 一句一景、中英双语歌词、SVG 卡通场景 | `english-rhyme-card` |
| AI 手绘插画 + 左上角双语字幕 | 「英语启蒙绘本卡」（`20260925-英语启蒙土豆`） |
| 静态口诀平铺、每条 2-3s 一张卡 | 「口诀罗列型」（默认卡片皮肤） |

判据是**「画面是不是一整屏都不变」**。变的是高亮位置，不是画面内容。

---

## 第 1 步 · 拆解参考片

### 1.1 下载

```bash
# 先试 API 签名方案（快）
python3 .agents/skills/douyin-downloader/scripts/main.py "<链接>" -o reference
# 被风控 403（Blocked by ArgusSecurityPlugin）就回退：开一次页面直接读 <video>.currentSrc
node .agents/skills/video-batch-download/douyin_oneshot.mjs "<链接>" reference/.temp
```

产物 mp4 在 `reference/.temp/<标题>.mp4`。**文件名常带中文和引号，命令里务必加引号**。

### 1.2 转写（关键是**跑两遍**）

```bash
ffmpeg -y -i "<mp4>" -vn -ac 1 -ar 16000 /tmp/ref_audio/ref.mp3
/tmp/asr_venv/bin/python tools/audio-align/align.py /tmp/ref_audio small   # 中文模式
```

`align.py` 写死 `language="zh"`。**必须再用英文模式跑一遍**——本形态的音频是
「英文单词 + 中文释义」，中文模式会把英文整段吞掉或识别成汉字。

```python
# /tmp/asr_en.py
from faster_whisper import WhisperModel
m = WhisperModel("small", device="cpu", compute_type="int8")
segs, info = m.transcribe(audio, language="en", word_timestamps=True, vad_filter=True)
for s in segs:
    print(f"{s.start:.2f}-{s.end:.2f} | " + " ".join(w.word for w in s.words))
```

**两个模式的用途不同**：英文模式给**英文词的时刻**（排高亮锚点用），
中文模式确认**中文释义确实念了**。别只看一个。

### 1.3 逐像素量版式

```bash
ffmpeg -y -i "<mp4>" -vf "select=eq(n\,0)" -vframes 1 /tmp/f0.png     # 原始分辨率，别 scale
```

用 Python 采样，**每一项都量**：

| 要量什么 | 怎么量 |
|---|---|
| 容器色 / 行卡色 / 高亮色 | 在行卡内空白处取像素质 |
| 行卡的 y 范围与步进 | 沿**行卡外侧**的空白列扫，找「容器色 ↔ 行卡色」的切换点 |
| 行内三元素的**中心** | ⚠️ 见下方大坑 |
| 高亮渐入时长 / 退出方式 | 逐帧取行卡底色，看它几帧到顶、是渐变还是硬切 |

**大坑：行内元素是「各自居中」，不是左对齐。**
只量左边界会误判 —— 不同行的词长短不同，`daikon` 占 104–199、`white gourd` 占 66–237，
左边界差 38px，但**中心都落在 151.5**。判断对齐方式要量中心。

**大坑：高亮退出是硬切。** 实测某行从 `(254,144,44)` 一帧之内跳回 `(254,244,226)`，
没有反向渐变。渐入是 15 帧，退出是 0 帧。

---

## 第 2 步 · 词汇表

产出 `docs/storyboard.md` 的内容表：**英文 | 音标 | 中文 | 缩略图文件名**。

| 规则 | 说明 |
|---|---|
| 音标**照抄参考片** | 别自己查词典 —— 参考片若用英式（`tomato /təˈmɑːtəʊ/`），照抄才能选对音色 |
| **与参考片差异化** | 用户明确要「不能和别人一模一样」：换掉若干个词（本片换了第 2 个 carrot → broccoli），或用不同配色 |
| 配图要**视觉区分度** | 选词时看「9 张图摆一起会不会混」—— 都是绿色叶菜就很难一眼分辨 |
| 组数 6-10 | 参考片 9 个；再多单屏放不下（行高会被压得很小） |

---

## 第 3 步 · 音频先行

### 3.1 音色（**本形态最容易翻车的地方**）

文案是 `broccoli，西兰花。` 这种**中英混排**，音色必须同时会英文：

| 可选 | 说明 |
|---|---|
| `zh_female_yingyujiaoyu_mars_bigtts`（Tina老师） | **首选**。中/英式英语，教育场景专用 |
| `zh_female_shuangkuaisisi_*`（爽快思思） | 中/美式英语，语速快 |
| ~~`scm_hd_clic0dkg`（曼波）~~ | ✗ **纯中文复刻音色，会把 `daikon` 念成「待會拜拜」** |
| ~~`zh_female_shaoergushi_mars_bigtts`（少儿故事）~~ | ✗ 童谣整句没问题，但**单个英文单词不可靠**（`daikon` → 「呆孔」） |

### 3.2 三条硬规则

| 规则 | 原因 |
|---|---|
| 中英之间用**全角逗号** `broccoli，西兰花。` | 中英混排用逗号断句，别用句号/空格 |
| 英文词**首字母大写** | `daikon` 小写会被当中文念成「栽孔」，改成 `Daikon` 才念英文 |
| `speed_ratio` 保持 **1.1** | ⚠️ 抬到 **1.3 会让部分英文词退回中文**（实测 white gourd / loofah / green bean 全中招） |

### 3.3 语速不够靠后期，别抬 speed_ratio

TTS 念中英混排天生慢（每段有效语音 2.3s，参考片只要 1.35s）。要提速就**生成后用 atempo**：

```bash
ffmpeg -y -i public/audio/vo/s02.mp3 -filter:a "atempo=1.35" /tmp/fast.mp3 && mv /tmp/fast.mp3 public/audio/vo/s02.mp3
```

atempo 只改时长不改音素，**不会破坏已经校验过的发音**。

### 3.4 逐段核验（必做，且要看两个模式）

```bash
# 英文模式：输出是拉丁字母（Broccoli）= 对；是汉字（「栽孔」）= 被当中文念了
/tmp/asr_venv/bin/python /tmp/asr_dir.py public/audio/vo en
# 中文模式：确认中文释义也念了（Bro ccoli 西 兰 花）
/tmp/asr_venv/bin/python /tmp/asr_dir.py public/audio/vo zh
```

⚠️ **whisper 对 atempo 后的短音频会产生重复幻觉**（把一句 broccoli 转成几十遍）。
遇到明显不合理的输出，**单独把那个文件放到干净目录再转一次**，或看中文模式交叉验证。
发音的最终判断**只能靠人耳** —— 把 `public/audio/vo/` 打开让用户听，是本阶段的强制确认点。

### 3.5 排帧

```
行帧数 dur_i = ceil(音频实测秒数 × 30) + 8      # 8 帧缓冲 ≈ 0.27s
行起点 start_i = start_{i-1} + dur_{i-1}
```

⚠️ **改任何一段音频后，全部行重排**（后续所有行的起点都会平移）。

---

## 第 4 步 · 图片素材（图库方案）

**默认走免 key 的图库，不从参考片抠**（搬运他人素材有版权风险）。用本 skill 自带脚本：

### 4.1 出候选总览图

```bash
python3 .agents/skills/word-list-card/scripts/find_images.py sheet \
  --out /tmp/cand \
  --terms "daikon=daikon radish|white radish" "carrot=carrot vegetable" "loofah=luffa gourd"
```

- 两个来源自动都搜：**Wikimedia Commons**（质量高、偏标准照）+ **Openverse**（量大、质量参差）
- 一个词可给**多个查询式**（`|` 分隔）—— 单个词常搜不准，多给几个覆盖
- 脚本已按**长宽比 0.72–1.4 过滤**（宽幅图中心裁方后只剩一条，主体会丢）
- 输出 `sheet_<词>.png`（6 列网格，每格标了编号和授权）

### 4.2 人眼挑 + 取原图

Read 各 `sheet_*.png` 挑编号，然后：

```bash
python3 .agents/skills/word-list-card/scripts/find_images.py fetch \
  --out /tmp/cand --picks "daikon=0" "carrot=6" --size 256 \
  --dest remotion-projects/<项目>/public/thumbs \
  --prefix-map "daikon=s01_daikon" "carrot=s02_carrot"
```

### 4.3 踩过的坑

| 坑 | 真相 |
|---|---|
| **搜食材出来的是料理成品 / 田间植株** | 搜 `daikon radish` 返回一堆炖菜和汤；搜 `loofah` 全是丝瓜藤和菜架子。**必须拼 contact sheet 人眼看**，光看标题判断不了 |
| **小图看不出问题** | 挑中的「丝瓜」放大后是干丝瓜络。**下载原图再确认一次**（脚本的 fetch 就是干这个） |
| **Commons 缩略图尺寸改不动** | 把 URL 里的 `250px` 改成 400/640/800 一律 `400 Use thumbnail sizes listed on ...`。别折腾，用 API 给的尺寸即可（最终只显示 ~92px） |
| **Commons 连续请求会被限流** | 搜出来 0 结果。脚本已内置 `sleep`，自己写脚本时也要加 |
| **授权** | 脚本**不做过滤**，授权名印在 contact sheet 每格下方，挑图时自己审。CC0 / Public Domain 最干净；**CC BY 要在发布简介里署名**；CC BY-SA 有 copyleft 争议，尽量避开。`release-info.md` 的发布清单里留一条待办 |

### 4.4 背景

样板用的是**程序化渐变 + 噪点**，不用图片：

```tsx
// 径向渐变撑层次，feTurbulence 撑质感（纯平色会显廉价）
<AbsoluteFill style={{ background: "radial-gradient(ellipse 78% 62% at 50% 34%, #F0EAF9 0%, #E8E0F4 52%, #D9CDEC 100%)" }} />
<svg style={{ opacity: 0.16, mixBlendMode: "overlay" }}>
  <filter id="n"><feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="3" /></filter>
  <rect width="100%" height="100%" filter="url(#n)" />
</svg>
```

⚠️ 参考片底部那张**暖色虚化食材照别照搬** —— 换成紫色系背景后，橙紫是补色会打架。

---

## 第 5 步 · 写代码

复制任一英语启蒙样板（推荐 `20260927-英语启蒙蔬菜`，就是本形态的成品）：

```bash
rsync -a --exclude 'out' remotion-projects/20260927-英语启蒙蔬菜/ remotion-projects/<新项目>/
cd <新项目> && rm -rf out && rm -f public/thumbs/*.png public/audio/vo/*.mp3
# 改 package.json 的 name / build，改 Root.tsx 的 Composition id
```

⚠️ **必须用 `rsync -a`**，`cp -r` 会把 `.bin/` 里的符号链接解引用成实体文件，CLI 全挂。

核心文件：

| 文件 | 干什么 |
|---|---|
| `src/config.ts` | `ROWS`（词表）+ `LAYOUT`（版式实测值）+ `COLORS` + 排帧（`ROW_FRAMES`/`ROW_STARTS`/`TOTAL_FRAMES`） |
| `src/components/WordList.tsx` | 容器 + N 张行卡 + **高亮逻辑** |
| `src/components/Backdrop.tsx` | 渐变 + 噪点背景 |
| `src/components/Header.tsx` | 标题 + 副标题（全程常驻，无入场动画） |
| `src/Flashcards.tsx` | 组装；音频必须 `<Sequence from={ROW_STARTS[i]}>` 包 |
| `src/scenes/CoverScene.tsx` | 横竖双封面，靠 `vertical` prop 切布局 |

**高亮逻辑**（本形态的全部动效）：

```tsx
const inAt  = ROW_STARTS[index] + HILITE_DELAY;                       // 该行音频起点 + 6 帧
const outAt = index + 1 < ROW_STARTS.length ? ROW_STARTS[index + 1] : TOTAL_FRAMES;
const t = interpolate(frame, [inAt, inAt + HILITE_FADE], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
const backgroundColor = frame >= outAt                                  // ← 退出硬切
  ? COLORS.card
  : interpolateColors(t, [0, 1], [COLORS.card, COLORS.cardActive]);
```

**字体**（用 Google Fonts，别用系统字体栈）：

```ts
// 系统字体栈在 chrome-headless-shell 里会 fallback 成过粗字形，
// fontWeight 从 400 调到 700 几乎无变化，字重参数形同虚设
export const EN_FONT = loadArimo("normal", { weights: ["400","700"], subsets: ["latin"] }).fontFamily;
export const ZH_FONT = '"PingFang SC", "Hiragino Sans GB", "Heiti SC", sans-serif';
```

- 英文字重 **400**（用**墨迹占比**校准：渲染帧缩到与源片同分辨率，算暗像素占比，调到与源片一致）
- **音标是正体**（`fontWeight: 400`，**不加** `fontStyle: "italic"`）—— 源片音标不是斜体
- 中文苹方 700
- **缩略图直角**，别顺手加 `borderRadius`

质检：`./node_modules/.bin/tsc --noEmit` 零错误。
渲染一帧与参考片**并排比对**（缩放到同一分辨率再比，否则分辨率差会造成错误判断）。

---

## 第 6 步 · 渲染 + 响度

```bash
./node_modules/.bin/remotion render src/index.ts <composition-id> out/final.mp4 \
  --browser-executable="/Users/zhanglei/软件下载/chrome-headless-shell-mac-arm64/chrome-headless-shell" \
  --concurrency=2
```

⚠️ **别用 `npx`**（会先解析 registry，容易卡）。

```bash
./tools/loudness/loudnorm.sh remotion-projects/<项目>/out/final.mp4   # → final-loud.mp4
```

Remotion 直出约 −24 LUFS，抖音同类 −12 LUFS 左右，**差 12dB，必须归一化**。
约定 `<name>.mp4` 是原件，**`<name>-loud.mp4` 才是发布版**。

**逐秒抽帧核验高亮行**（本形态最该查的一项）：

```bash
ffmpeg -y -v error -i out/final-loud.mp4 -vf "fps=1" /tmp/vchk/f%02d.png
# 对每帧检查 N 个行卡区域，取「红-蓝通道差」最大的那行 = 当前高亮行
```

正确结果是**每行连续占 2 个抽帧、顺序与词表一致**；某一秒标「过渡帧」是正常的
（正好落在高亮切换的瞬间）。

---

## 第 7 步 · 封面 + 发布

```bash
./node_modules/.bin/remotion still src/index.ts cover out/cover.png --browser-executable="..."
./node_modules/.bin/remotion still src/index.ts cover-vertical out/cover-vertical.png --browser-executable="..."
```

- **视觉必须和视频一致**（同款紫背景 + 同款行卡 + 一行高亮），否则点进来「货不对板」
- ⚠️ 改了词表/配色/删了图，**双封面都要重渲**
- ⚠️ `CoverScene` 里的预览词若引用了**已删除的图**（如换词后删掉的 `s02_carrot.png`），
  `<Img>` 会让渲染**整个崩掉** —— 换词时记得同步改 `PREVIEW`

`docs/release-info.md` 五节：`## 标题` / `## 简介`（分点 + 话题标签）/ `## 发布清单` /
`## 关键参数存档` / `## 差异化（vs 参考片）`。

**最后回写 `CLAUDE.md`**：版式实测值、新踩的坑、样板路径。

---

## 常见返工点（按出现频率排）

1. **英文被当中文念** → 音色选错（用了曼波/少儿故事）、词没大写、或 `speed_ratio` 抬太高
2. **素材授权** → 图库里混了 CC BY，发布简介要署名
3. **行内对齐判断错** → 量了左边界而不是中心
4. **字体过粗** → 用了系统字体栈；或音标加了斜体
5. **封面引用了已删除的图** → 渲染直接崩，报 React 错误堆栈
6. **改了音频没重排帧** → 后续所有行起点错位
