---
name: word-grid-card
description: >-
  单词网格高亮型视频完整开发流程（抖音/视频号，3×4 网格单词卡常驻 + 念到哪张哪张变橙，卡内带音标）。
  流程：形态判断 → 拆解参考片（下载/双模式转写/逐像素量版式）→ 词汇表 → 音频先行 → 图片素材
  （授权名标在总览图上）→ 写代码 → 渲染/响度 → 封面/发布。
  是 word-list-card（单列列表型）的网格变体 —— 动画逻辑同源，布局与卡内排布不同。
  触发词：单词网格、网格单词卡、3×4 单词卡、九宫格单词、带音标单词卡、
  味道单词、水果/蔬菜/动物/颜色类单词视频。
metadata:
  type: workflow
---

# 单词网格高亮型视频开发流程

给定主题（如「味道类 12 个单词」）后，严格按流程顺序推进，**不跳步**，上一阶段确认后才进下一步。
视觉细节的事实源是 `CLAUDE.md` 的「单词网格高亮型结构」，本 skill 是**可执行流程**。

**这个形态是什么**：整屏 **3 列 × 4 行 = 12 张单词卡**常驻不动，念到哪一张，
那一张的底色从米白渐变成橙。不是「一段一景」，也不是「卡片轮播」——全片只有高亮在移动。

**和 `word-list-card` 的关系**：**同源**。动画逻辑逐字相同（起点 +6 帧、15 帧渐变、退出硬切、
每卡 `ceil(秒×30)+8` 帧），差别只有三点：

| | `word-list-card`（列表型） | 本 skill（网格型） |
|---|---|---|
| 布局 | 单列 N 行（N=6~10） | **3 列 × 4 行**（12 张） |
| 卡内 | 英文+音标 ｜ 缩略图 ｜ 中文（横向三段） | 图 → 英文 → 音标 → 中文（**纵向四段**） |
| 外层容器 | 有浅色大圆角容器 | **无**，卡直接排在底色上 |

选择标准：**词少（≤10）用列表，词多（12+）或想强调分类感用网格。**
12 个词在单列里行高会被压得很小，网格才放得下。

---

## 流程总览

```
第 0 步 形态判断（网格 or 列表）
第 1 步 拆解参考片（下载 → 双模式转写 → 逐像素量版式）
第 2 步 词汇表（12 组「英文 + 音标 + 中文 + 配图」）
第 3 步 音频先行（TTS + atempo + 逐段核验）    ← 返工源头，先出真实帧数
第 4 步 图片素材（图库 + **授权过滤**）        ← 本次最大的坑在授权
第 5 步 写代码（网格布局 + 卡内四段压缩）
第 6 步 渲染 + 响度归一化
第 7 步 封面（横竖两套尺寸）+ 发布信息 + 回写 CLAUDE.md
```

## 验收标准总表

| 阶段 | 产出物 | 验收标准（通过才进下一步） |
|------|--------|--------------------------|
| 0 形态判断 | 形态归属结论 | 内容是「整屏网格 + 逐卡高亮」→ 本流程；单列 N 行 → `word-list-card` |
| 1 拆解参考片 | `docs/storyboard.md` | 版式**逐像素实测**；确认音频模式（英文念几遍？） |
| 2 词汇表 | storyboard 内容表 | 12 组音标/中文齐全；**与参考片有差异化**（换图 + 换配色即可，词表可沿用） |
| 3 音频先行 | `public/audio/vo/*.mp3` + 帧数表 | 每段 ffprobe 实测；**whisper 双模式核验英文没被当中文念**；用户试听确认 |
| 4 图片素材 | `public/thumbs/*.png` | 12 张主体清晰、方裁后能认出来；**授权无 SA**；发布简介备好署名 |
| 5 写代码 | `src/` | `tsc --noEmit` 零错误；**渲染后放大 2× 核对卡内四段间距** |
| 6 渲染 | `out/final-loud.mp4` | **跑过 loudnorm**；抽帧核对高亮卡与口播词一致；相邻帧差分无异常 |
| 7 封面+发布 | `out/cover*.png` + `docs/release-info.md` | **双封面都渲染**；授权清单逐张列进发布清单 |

---

## 第 0 步 · 形态判断

| 内容特征 | 走哪条 |
|---------|-------|
| 3 列 × 4 行网格 + 念到哪张哪张变橙 | **本流程** |
| 单列 N 行词卡常驻 + 念到哪行哪行变橙 | `word-list-card` |
| 一句一景、中英双语歌词、SVG 卡通场景 | `english-rhyme-card` |
| AI 手绘插画 + 左上角双语字幕 | 「英语启蒙绘本卡」（`20260925-英语启蒙土豆`） |

---

## 第 1 步 · 拆解参考片

### 1.1 下载

```bash
python3 .agents/skills/douyin-downloader/scripts/main.py "<链接>" -o /tmp/dy_ref
# 被风控 403（Blocked by ArgusSecurityPlugin）就回退：
node .agents/skills/video-batch-download/douyin_oneshot.mjs "<链接>" /tmp/dy_ref
```

⚠️ **文件名常带中文和引号，命令里务必加引号**。

### 1.2 转写（**必须跑两遍**）

```bash
ffmpeg -y -i "<mp4>" -vn -ac 1 -ar 16000 /tmp/ref_audio/ref.mp3
/tmp/asr_venv/bin/python tools/audio-align/align.py /tmp/ref_audio small   # 中文模式（写死 zh）
```

中文模式**会把英文整段吞掉**。必须再跑英文模式拿英文词的时刻 —— 高亮锚点要靠它。

```python
# /tmp/asr_en.py
from faster_whisper import WhisperModel
m = WhisperModel("small", device="cpu", compute_type="int8")
segs, info = m.transcribe(audio, language="en", word_timestamps=True, vad_filter=True)
for s in segs:
    print(" ".join(f"[{w.start:.2f}-{w.end:.2f}]{w.word.strip()}" for w in s.words))
```

**两个模式用途不同**：英文模式给**英文词起始时刻**（排锚点），中文模式确认**中文释义念了**。

### 1.3 逐像素量版式

抽**原始分辨率**的帧（别 scale），用 Python 采样，**每一项都量**：

| 要量什么 | 怎么量 |
|---|---|
| 底色 / 卡色 / 高亮色 | 卡内空白处取像素质（避开图与文字） |
| 网格的列边界与行边界 | 沿一条**穿过整列卡**的竖线扫 y 找切换点；沿一条穿过整行的横线扫 x |
| 卡内各段位置 | 卡区域内「与卡底色差异 > 阈值」的行分布，找分段 |
| 标题/副标题 | 顶部区域的暗像素行带（`gray < 120`） |

**大坑：判断对齐方式要量「墨迹中心」，不是左边界。**
源片每行左起点会差 30-40px，那是**字数不同**造成的，不代表左对齐。

**大坑：高亮退出是硬切，不是反向渐变。**
渐入 15 帧，退出 0 帧（一帧之内跳回米白）。

参考片实测（576×768）：卡 139×135、列步进 157.5、行步进 160.5、高亮 `#DEB6A8`、底 `#FCF9E3`。

---

## 第 2 步 · 词汇表

产出 `docs/storyboard.md` 的内容表：**英文 | 音标 | 中文 | 缩略图文件名**。

| 规则 | 说明 |
|---|---|
| **音标是这类视频最值得加的增量** | 参考片往往只有「英文 + 中文」，加音标是最自然的差异化，也符合家长「要发音准」的需求 |
| 音标**跟音色定** | 用 Tina老师（中/英式英语）就取**英式**，按牛津体例去掉可选 (r)：`sour /ˈsaʊə/`、`bitter /ˈbɪtə/`、`burned /bɜːnd/` |
| **与参考片差异化** | 换个底色 + 换配图就够（本次词表沿用了参考片，用户要的差异化落在视觉上）。若要换词，改 `config.ts` + `batch_config.json` 重跑即可，架构通用 |
| 配图要**视觉区分度** | 12 张摆一起会不会混？都是浅色圆片（饼干 / 咸饼干 / 面包）就分不出来 |
| 卡内中文≤4 字 | 中文槽窄，`酥脆的` 已是上限 |

---

## 第 3 步 · 音频先行

### 3.1 音色（**最容易翻车**）

文案是 `Sweet，甜的。` 这种**中英混排**，音色必须同时会英文：

| 可选 | 说明 |
|---|---|
| `zh_female_yingyujiaoyu_mars_bigtts`（Tina老师） | **首选**。中/英式英语，教育场景专用 |
| ~~`scm_hd_clic0dkg`（曼波）~~ | ✗ 纯中文音色，会把 `daikon` 念成「待會拜拜」 |
| ~~`zh_female_shaoergushi_mars_bigtts`（少儿故事）~~ | ✗ 单个英文单词不可靠 |

### 3.2 三条硬规则

| 规则 | 原因 |
|---|---|
| 中英之间用**全角逗号** `Sweet，甜的。` | 中英混排用逗号断句 |
| 英文词**首字母大写** | 小写会被当中文念 |
| `speed_ratio` 保持 **1.1** | ⚠️ 抬到 **1.3 会让部分英文词退回中文**（实测 white gourd / loofah / green bean 全中招） |

### 3.3 语速靠 atempo，别抬 speed_ratio

```bash
cd public/audio/vo && for f in s*.mp3; do
  ffmpeg -y -v error -i "$f" -filter:a atempo=1.35 /tmp/f.mp3 && mv /tmp/f.mp3 "$f"
done
```

atempo 只改时长不改音素，**不破坏已校验过的发音**。1.35 是这条赛道的经验值 ——
TTS 原速每段有效语音约 2.3s，参考片只要 1.7s；加速后 12 段合计 20.4s，与原片 20.5s 几乎一致。

### 3.4 逐段核验（必做，两个模式都看）

- **英文模式**：输出拉丁字母（`Sweet`）= 对；输出汉字（「栽孔」）= 被当中文念了
- **中文模式**：确认中文释义也念了
- ⚠️ whisper 对 atempo 后的短音频会产生**重复幻觉**；异常时单独放干净目录再转一次
- 发音最终判断**只能靠人耳** —— 把 `public/audio/vo/` 打开让用户听，是本阶段的强制确认点

### 3.5 排帧

```
卡帧数 dur_i = ceil(音频实测秒数 × 30) + 8      # 8 帧缓冲
卡起点 start_i = start_{i-1} + dur_{i-1}
高亮起点 = start_i + 6
```

⚠️ **改任何一段音频后，全部卡重排**（后续所有卡的起点都会平移）。

---

## 第 4 步 · 图片素材（`scripts/find_images.py`）

**默认走免 key 图库，不从参考片抠**（搬运他人素材有版权风险）。
脚本在 `word-list-card/scripts/find_images.py`（两个 skill 共用）：

```bash
# 出候选总览图（Pexels + Commons + Openverse 三源；Pexels 需 key 见下）
python3 .agents/skills/word-list-card/scripts/find_images.py sheet \
  --out /tmp/cand --limit 18 --per-source 12 \
  --terms "sweet=colorful macarons" "sour=lemon slices"

# 人眼挑完（Read sheet_*.png）再取图
python3 .agents/skills/word-list-card/scripts/find_images.py fetch \
  --out /tmp/cand --picks "sweet=2" "sour=9" --size 320 \
  --dest remotion-projects/<项目>/public/thumbs \
  --prefix-map "sweet=s01_sweet" "sour=s02_sour"
```

### 4.1 Pexels key（质量最好的一路）

**Pexels 是专业图库，食物/日常物品的图质远高于 Commons**，且 Pexels License
**免费商用、不要求署名**，比 Commons 的 CC BY 省事。免费 key 去 https://www.pexels.com/api/ 申请。

key 写仓库根 `.env`（已被 .gitignore 排除），脚本从自身位置向上逐级查找：

```
PEXELS_API_KEY=xxxxxxxx
```

没配 key 时这一路**静默跳过**，不影响其它源。

### 4.2 检索方式：优先 `cat:` 分类

自由文本匹配的是**词**不是**主体** —— 搜 `apple` 会返回苹果**叶**、苹果树、糖苹果，
搜 `grape` 会返回英国**酒吧**（"Bunch of Grapes" 是酒吧常见店名，实测栽过）。

加 `cat:` 前缀走 Commons 分类检索，精确得多：

```bash
--terms "apple=cat:Apples on white background|red apple" --quality
```

`--quality` 叠加 Commons 人工评审的 `incategory:"Quality images"`。
⚠️ 白底分类**覆盖不全**（苹果/香蕉有，橙子/葡萄/樱桃/猕猴桃没有），此时只能靠自由文本 + 人眼。

### 4.3 授权：脚本不过滤，靠总览图人工审

**Commons 搜索结果里 CC BY-SA 往往占大多数**（实测某轮 12 张里 11 张是 BY-SA）。
share-alike 有传染性 —— 严格说会要求整条视频以同协议发布，对商用账号是坑。

**脚本不做过滤**，授权名直接标在 contact sheet 每格下方，挑图时自己看。

产出要求：**Pexels License 最省事**；CC0 / Public Domain 次之；**CC BY 要在发布简介里署名**
（逐张列进 `release-info.md` 的授权表）；CC BY-SA 尽量避开。

### 4.4 其它坑

| 坑 | 真相 |
|---|---|
| **长宽比阈值卡太死会砍掉大半图** | 曾用 0.72–1.4，实测把 **Pexels 78–88% 的图滤掉**（相机原生就是 3:2 / 2:3）→ 已放宽到 **0.6–1.8** |
| **自动质量打分分不出主体对不对** | 试过按「背景干净+主体对比强」排序，结果给"白底上的苹果叶"打最高分。**别走这条路，靠人眼** |
| **透明 PNG 变黑块** | 图库的 PNG（如辣椒）带 alpha，`convert("RGB")` 会把透明区填成**黑色** → 先 `convert("RGBA")` → `alpha_composite(白底)` → `convert("RGB")` |
| **Commons 限速 429** | 连续请求会被挡 → 请求间隔 1s + 退避重试（脚本已内置）；缩略图够用就别拉原图 |
| **搜食材出来的是料理成品 / 田间植株** | 必须拼 contact sheet **人眼看**，光看标题判断不了 |

---

## 第 5 步 · 写代码

```bash
rsync -a --exclude 'out' remotion-projects/20260927-英语启蒙味道/ remotion-projects/<新项目>/
cd <新项目> && rm -rf out && rm -f public/thumbs/*.png public/audio/vo/*.mp3
# 改 package.json 的 name / build，改 Root.tsx 的 Composition id
```

⚠️ **必须用 `rsync -a`**，`cp -r` 会把 `.bin/` 的符号链接解引用成实体文件，CLI 全挂。

### 5.1 版式常量（1080×1440，源片 ×1.875）

```ts
gridX: 114, gridY: 206, cols: 3,
cardW: 261, cardH: 253, colStep: 295, rowStep: 302, cardRadius: 22,
```

### 5.2 卡内四段（**本形态最需要调的地方**）

源片卡内只有三段（图 / 英文 / 中文），**多一行音标就放不下了**。压缩规则：

```ts
imgSize: 104, imgCenterY: 58,    // 源片图高 107px → 压到 104
enCenterY: 138, enFontSize: 54,  // 源片英文中心在卡顶下 179px → 提到 138
ipaCenterY: 176, ipaFontSize: 30,
zhCenterY: 228, zhFontSize: 40,
```

- **音标紧跟英文成一组**（它是英文的注音），中文单独一行并与这组**拉开约 52px**
- ⚠️ **第一版把音标和中文排得太近，缩略图上看不出来，渲染后放大 2× 才发现糊在一起** ——
  这一步必须放大核对。相邻两段的中心距要 > 两者半高之和（英文 ≈ 0.38×字号、
  音标含 `/` `ˈ` ≈ 0.45×字号、中文 ≈ 0.5×字号）

### 5.3 高亮逻辑（与列表型逐字相同）

```tsx
const inAt  = ROW_STARTS[index] + HILITE_DELAY;   // 该卡音频起点 + 6 帧
const outAt = index + 1 < ROW_STARTS.length ? ROW_STARTS[index + 1] : TOTAL_FRAMES;
const t = interpolate(frame, [inAt, inAt + HILITE_FADE], [0, 1],
  { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
const backgroundColor = frame >= outAt                      // ← 退出硬切
  ? COLORS.card
  : interpolateColors(t, [0, 1], [COLORS.card, COLORS.cardActive]);

const col = index % LAYOUT.cols, row = Math.floor(index / LAYOUT.cols);
// left = gridX + col * colStep,  top = gridY + row * rowStep
```

**卡片不用 `<Sequence>` 包裹**，内部按全局帧算 opacity/颜色即可；**音频必须** `<Sequence from={ROW_STARTS[i]}>` 包。

### 5.4 字体

```ts
export const EN_FONT = loadArimo("normal", { weights: ["400","600"], subsets: ["latin"] }).fontFamily;
export const ZH_FONT = '"PingFang SC", "Hiragino Sans GB", "Heiti SC", sans-serif';
```

- 别用系统字体栈（headless Chrome 里会 fallback 成过粗字形，字重参数形同虚设）
- 英文 600 / 音标 400 / 中文苹方 700

质检：`./node_modules/.bin/tsc --noEmit` 零错误。

---

## 第 6 步 · 渲染 + 响度

```bash
./node_modules/.bin/remotion render src/index.ts <composition-id> out/final.mp4 \
  --browser-executable="/Users/zhanglei/软件下载/chrome-headless-shell-mac-arm64/chrome-headless-shell" \
  --concurrency=2
./tools/loudness/loudnorm.sh remotion-projects/<项目>/out/final.mp4   # → final-loud.mp4
```

⚠️ **别用 `npx`**（会先解析 registry，容易卡）。

Remotion 直出约 −25 LUFS，参考片同类成片约 −11 LUFS，**差 14dB，必须归一化**。
约定 `<name>.mp4` 是原件，**`<name>-loud.mp4` 才是发布版**。

**两项核验**：

1. **高亮同步** —— 抽帧核对该时刻高亮的是不是当前口播的那个词
   （用词表起止帧算：帧 30 → 第 1 张、帧 500 → 第 9 张 …）
2. **异常帧** —— 相邻帧差分扫描：

   ```bash
   ffmpeg -y -v error -i out/final.mp4 -vf "scale=90:120,format=gray" -f rawvideo /tmp/f.raw
   # 用 numpy 算每帧与前一帧的平均绝对差
   ```

   本形态画面静止，差分均值应在 **0.1 以下**；峰值**只应落在 12 个高亮切回时刻**，
   别处出现尖峰就是 chrome-headless-shell 喂了过期帧（换 `--concurrency=1` 重渲）。

---

## 第 7 步 · 封面 + 发布

```bash
./node_modules/.bin/remotion still src/index.ts cover out/cover.png --browser-executable="..."
./node_modules/.bin/remotion still src/index.ts cover-vertical out/cover-vertical.png --browser-executable="..."
```

- **视觉必须和视频一致**（同款紫底 + 同款卡 + 一张高亮），否则点进来「货不对板」
- 主视觉用 **3×2 的卡片阵列**（露 6 张，其中一张高亮），比单张卡更有本形态的辨识度
- ⚠️ **横竖两版的卡片尺寸要各配一套** —— 横版 1920×1440 只套竖版的 261px 卡会显得很小、
  底部空一大片。建议：竖版卡 286×264、横版卡 372×338，卡内字号按比例放大
- ⚠️ 改了词表/配色/删了图，**双封面都要重渲**

`docs/release-info.md` 五节：`## 标题` / `## 简介`（分点 + 话题标签）/ `## 发布清单` /
`## 素材授权`（逐张列授权 + Commons 链接）/ `## 关键参数存档` / `## 差异化（vs 参考片）`。

**最后回写 `CLAUDE.md`**：版式实测值、新踩的坑、样板路径。

---

## 常见返工点（按出现频率排）

1. **素材混进 CC BY-SA** → share-alike 有传染性。授权名标在总览图上，挑图时看清再选
2. **英文被当中文念** → 音色选错、词没大写、或 `speed_ratio` 抬太高
3. **卡内四段糊在一起** → 音标和中文挨太近；缩略图看不出，**渲染后放大 2× 核对**
4. **网格放不下** → 词数 >12 或中文 >4 字，卡高被压得太小
5. **透明 PNG 变黑块** → 没做白底合成
6. **横版封面卡片太小** → 横竖两版没分开配尺寸
7. **改了音频没重排帧** → 后续所有卡起点错位
