---
name: english-rhyme-card
description: >-
  英语启蒙歌谣卡视频完整开发流程（抖音/视频号母婴赛道，中英双语字幕 + 全 SVG 手绘卡通场景）。
  流程：形态判断 → 歌词文案（N 组双语短句）→ 音频先行（TTS + whisper 词级对齐）→ 场景设计（SVG 零件库）→ 写代码 → BGM/渲染/响度 → 封面/发布。
  素材零成本（不用 AI 生图），13 个场景全部手写 SVG。
  触发词：英语启蒙、磨耳朵、英文儿歌、英文歌、歌谣、双语字幕、英语问候语、儿童英语、早教英语、做一条英语启蒙视频。
metadata:
  type: workflow
---

# 英语启蒙歌谣卡视频开发流程（SVG 卡通场景 + 双语字幕）

给定主题后，严格按以下流程顺序推进，**不跳步、不并行**，上一阶段确认后才进入下一阶段。

> **本流程是本仓专属**：形态是「中英双语歌词 / 一句一景 / 全 SVG 手绘卡通场景」。
> 视觉细节以本仓 `CLAUDE.md`「英语启蒙歌谣卡（SVG 卡通场景）结构」为唯一事实源。
> **禁止**引入其它形态的皮肤（深蓝序号/赭橙口诀/白圆角卡托是「口诀罗列型」的，本形态一点用不上）。

## 流程总览

```
第 0 步 形态判断（英语启蒙歌谣 → 本流程；其它形态见 CLAUDE.md）
第 1 步 歌词文案（N 组「中文提示 + 英文重复 2-3 遍」）
第 2 步 音频先行（TTS 生成 + whisper 词级对齐）   ← 返工源头，先出真实帧数
第 3 步 场景设计（SVG 零件库 + 版式）             ← 按实际音频帧数排动画锚点
第 4 步 写代码（零件库 + crossfade + 逐词点亮）
第 5 步 BGM + 渲染导出 + 响度归一化
第 6 步 封面 + 发布信息
```

### 阶段验收标准总表（每阶段 = 产出物 + 验收标准，全部满足才进下一步）

| 阶段 | 产出物 | 验收标准（通过才进下一步） |
|------|--------|--------------------------|
| 第 0 步 形态判断 | 形态归属结论 | 内容是「短句 + 反复念」→ 本流程；需要讲因果链 → 走「插画讲解型」；静态口诀平铺 → 走「口诀罗列型」 |
| 第 1 步 歌词文案 | `docs/storyboard.md` | N 组双语短句齐全；**中英混排用逗号断句**；每组中文 ≤12 字；**合规自查过**（育儿健康类特有）；**用户确认** |
| 第 2 步 音频先行 | `public/audio/vo/*.mp3` + 帧数表 | 每段拿到真实 duration；**逐段 whisper 核验实际念的遍数**；帧数表按实测重排；**用户确认**（试听音色 + 确认时长） |
| 第 3 步 场景设计 | storyboard 的场景章节 | 每段一个场景方案（角色 + 道具 + 走位）；**动画锚点全部钉到词的帧号**；用户确认 |
| 第 4 步 写代码 | `src/` 全部场景 | 零件库复用（不新造画风）；`./node_modules/.bin/tsc --noEmit` 零错误；抽帧核对版式 |
| 第 5 步 BGM+渲染 | `out/<成片>-loud.mp4` | 渲染成功；**已跑 `tools/loudness/loudnorm.sh`（−21 → −10 LUFS）**；转场无闪白（相邻帧差分 <8）；抽帧看全片 |
| 第 6 步 封面+发布 | `out/cover*.png` + `docs/release-info.md` | **双封面都已渲染并确认**；发布清单逐项打勾 |

### 进度追踪 checkpoint（中断 / 换需求后从此续跑）

每项目维护 `docs/progress.md`，改需求或中断后读它接上，**不重跑已完成阶段**。

````markdown
# 进度追踪

## 当前状态
当前阶段：第 1 步 歌词文案（in_progress）｜ 已完成：1/7 阶段

## 阶段清单
| 阶段 | 状态 | 产出物 | 备注 |
|------|:----:|--------|------|
| 第 0 步 形态判断 | ✅ completed | 形态归属 | 英语启蒙歌谣 → 本流程 |
| 第 1 步 歌词文案 | 🔄 in_progress | — | 写 storyboard 中 |
| 第 2 步 音频先行 | ⏳ pending | — | — |
| 第 3 步 场景设计 | ⏳ pending | — | — |
| 第 4 步 写代码 | ⏳ pending | — | — |
| 第 5 步 BGM+渲染 | ⏳ pending | — | — |
| 第 6 步 封面+发布 | ⏳ pending | — | — |

## 变更日志
- YYYY-MM-DD 创建项目，开始第 0 步
````

**状态约定**：`⏳ pending` → `🔄 in_progress` → `✅ completed`。

---

## 第 0 步：形态判断（分流入口）

| 内容特征 | 走哪条 |
|---------|-------|
| 短句 + 反复念（英语儿歌 / 磨耳朵 / 问候语 / 单词） | **本流程** |
| 需要讲清因果链、一段一图讲解 | 「插画讲解型」（`20260919-情绪引导三步法`） |
| 静态口诀平铺、每条 2-3s | 「口诀罗列型」（默认卡片皮肤） |
| 顶部标题 + 中部信息图 + 底部字幕 | 「信息图动画型」（`20260924-瓦伦达效应`） |
| 不确定 | 问自己：**内容是「念了又念」还是「讲了又讲」？** 前者走本流程 |

### 拿到参考视频时：换皮不换骨

用户丢一条抖音参考说"复刻一下"时，要的是**它的内容结构和重复节奏**，不是它的画面。

| 层 | 处理 |
|---|---|
| **结构层**（选词范围、重复遍数、字幕中英排布、段落节奏） | ✅ **照抄** |
| **表面层**（画面形态、配色、角色、字体效果） | ❌ **全换** |

> ⚠️ 参考片若用 AI 手绘插画，**别跟着做插画** —— 本仓的差异化正是「零素材成本的 SVG 卡通场景」，
> 这个形态相对插画型省掉的是整个 AI 生图流水线（逐条手工跑、无法自动化、风格还容易飘）。

**下载 + 拆解参考视频**：

```bash
# 1) 下载（playwright 开一次页面直接下；别用会重试的 skill，重复开页会触发验证码）
cd .agents/skills/video-batch-download && node douyin_oneshot.mjs "<分享链接>" /tmp/ref
# 2) 抽帧看画面结构
ffmpeg -y -v error -i /tmp/ref/*.mp4 -vf "fps=1/3,scale=540:-1" /tmp/ref/f%03d.png
# 3) 词级转写看口播（先抽音轨）
ffmpeg -y -i /tmp/ref/*.mp4 -vn -ac 1 -ar 16000 /tmp/ref/mp3/ref.mp3
/tmp/asr_venv/bin/python tools/audio-align/align.py /tmp/ref/mp3 small
```

---

## 第 1 步：歌词文案

**产出：** `docs/storyboard.md`。

分镜表列：**序号 | 中文提示行 | 英文行 | 英文重复遍数 | 画面要点 | 预估时长**。

### 文案铁律

| 规则 | 说明 |
|---|---|
| **一组 = 中文提示 + 英文重复** | 如「来是 come 去是 go」+「come come go go」。中文给语义，英文给磨耳朵的重复 |
| **中文提示 ≤ 12 字** | 长了字幕压边；参考片最长 7 字 |
| **英文重复 2-3 遍** | 少于 2 遍磨不出效果，多于 3 遍拖时长 |
| **中英混排必须用逗号断句** | ⚠️ 见下方大坑，写错整句会被当中文念 |
| **组数 10-15 组** | 参考片 13 组 / 63s；本仓 13 组 / 54s |

### ⚠️ 头号大坑：TTS 对中英混排 + 重复短语的处理极不稳定

**症状**：文案写 `good morning good morning`，TTS 只念一遍；写 `hi。hi hi。` 反而念三遍。

**对策（按优先级）**：

1. **重复短语的每一个都要用逗号分隔** —— 这是唯一稳定的写法：

   | 写法 | 结果 |
   |---|---|
   | `六是 six，six six six。`（重复部分空格分隔） | ✗ 被念成「六十六」 |
   | `六是 six。six，six，six。`（句号分隔） | ✗ 提示里的 six 被吞 |
   | **`六是 six，six，six，six。`（全逗号）** | ✅ 正确 |

2. **中英混排的句子用逗号断句**：`我是 I，你是 you，I love you` ——
   写成句号会给 TTS 错误的语种判断窗口，整句可能被当中文念成「我爱你」
3. **换写法重生成**：逗号也不是万能（实测「少儿故事」音色下 `good morning，good morning` 仍只念一遍，
   改成 `早上好，good morning，good morning。`（开头就用逗号）才念对两遍）
4. **兜底**：逐段核验，**字幕一律按实际音频写，不按文案写**

> ⚠️ 这不是某个音色的问题，**换音色也一样**（Tina 老师同样中招）。别指望换音色解决。

### ⚠️ whisper 判不出「英文数字 / 单词」念对没念对

数字类内容尤其明显：whisper 会把英文数字识别成**中文数字**（one→"万"、six→"六"）、
**阿拉伯数字**（"6"）、或**音译字**（ten→"碟"、nine→"nai"）——**三种输出都不能作为判据**。

**对策**：
- 用 **英文模式**（`language="en"`）和**中文模式**各转写一遍，对比时间戳**个数**是否等于文案里的英文词数
  （个数对得上通常就没吞词；个数对不上一定要重生成）
- **发音正确性只能靠人耳**：把 `public/audio/vo/` 用 `open` 打开让用户听，这是**强制确认点**
- 时间戳取**中文模式**的（它按中文音素切，对「中文提示 + 英文词」的边界更完整）；
  个别段中文模式切碎了就换英文模式的

### 内容合规（育儿类特有，必过）

| 风险 | 做法 |
|---|---|
| 医疗建议 | 涉及疾病/用药的**只做常识提示**，不做诊断/剂量/替代就医 |
| 绝对化表述 | 「一定/必须/绝对不能」→ 改「建议/一般/多数情况」 |
| 伪科学 | 选题要有可追溯的常识来源，不编 |
| 评论区反噬 | 发布前自查：这条会不会被专业家长挑错？ |

> 英语启蒙类天然低风险（问候语/颜色/数字），但仍要过一遍清单。

### 确认点

把分镜表给用户确认：**组数 / 中英文案 / 每组重复遍数**。确认后再进第 2 步。

---

## 第 2 步：音频先行（TTS 生成 + 量实际时长）

**产出：** `public/audio/vo/sNN.mp3`（逐条独立生成）+ 真实帧数表 + whisper 词级锚点。

### 2.1 音色

| 内容 | 音色 | 参数 |
|---|---|---|
| **中英混合（首选）** | `zh_female_shaoergushi_mars_bigtts`（少儿故事） | `speed_ratio: 1.1` |
| 中英混合（备选） | `zh_female_yingyujiaoyu_mars_bigtts`（Tina老师） | 同上，语速更快 |
| ❌ 纯中文音色 | 曼波 `scm_hd_clic0dkg` 等 | ⚠️ **会把英文吞掉**（同句 2.7s vs 5.1s） |

> 童声语调最贴「磨耳朵」，但语速慢（13 组约 54s vs Tina 版 47s）。
> **务必让用户试听选音色** —— 生 3-5 个候选到 `public/audio/test_*.mp3`，`open` 打开目录让他听。

### 2.2 生成音频

```bash
# 写 scripts/batch_config.json（见下方格式）→ 从项目目录跑
python3 ../../tools/tts/generate_tts.py
```

```json
[
  { "text": "来是 come，去是 go。come come go go。", "voice_id": "zh_female_shaoergushi_mars_bigtts", "speed_ratio": 1.1, "output": "vo/s01.mp3" }
]
```

### 2.3 词级对齐（动画锚点 = 词时刻 · 音画同步标准法）

```bash
# 首次装 faster-whisper（走 SOCKS 代理必须带 socksio）
python3 -m venv /tmp/asr_venv && /tmp/asr_venv/bin/pip install faster-whisper socksio
# 从仓库根跑 → /tmp/asr/*.txt，形如 [0.93-1.33]come
/tmp/asr_venv/bin/python tools/audio-align/align.py remotion-projects/<项目>/public/audio/vo small
```

### 2.4 核验 + 排帧数表

⚠️ **必须逐段核验实际念的内容**（尤其重复遍数），然后：

```
音频帧数 = ceil(时长 × 30)
dur_i    = 音频帧数 + 缓冲(16)
start_i  = start_{i-1} + dur_{i-1} − CROSSFADE(15)
```

把 `durationInFrames` / `enWords[].at` / `zhWords[].at` 全部填进 `src/config.ts`。

> ⚠️ **改任何一段音频后，除了重排帧数，还要回头看场景里有没有写死遍数** ——
> 场景里 `[0,1,2,3].map(n => cueFrame(slide,"hello",n))` 这种写法，
> 若音频实际只念 3 遍，第 4 个会**静默回落到 0**，把后面的 `filter().pop()` 逻辑弄坏。

### 确认点

用户试听音色 + 确认总时长。确认后进第 3 步。

---

## 第 3 步：场景设计

**产出：** storyboard 的场景章节（每段一张方案表）。

### 画面结构（实测值，1080×1440）

```
y=217   字幕块（**居中**，容器宽 920）
y=225     中文提示行墨迹顶（站酷快乐体 78px，行内夹的英文词换 Baloo2 渲染）
y=335     英文行墨迹顶（Baloo2 70px，**逐词点亮**）
y~580   天象（太阳 / 月亮 / 晚霞）
y=1035  地面线
y~1150  角色中心（通用小动物 Critter）
```

⚠️ **字幕是居中的，不是左对齐** —— 判对齐要量**每行墨迹的中心**（源片都落在 x≈528），
量左边界只能得出「起始位置」，不同字数的行左起点本来就不同。

⚠️ **英文行 70px 是「最长一行不折行」的上限**：`good morning good morning` 在 76px 下要 982px，容器只有 920。
定字号前先量**最长那一行**。

### 每段的场景方案

一段一景，写清楚三件事：

| 项 | 说明 |
|---|---|
| **角色** | 从 `Critter` 参数里挑（`body` 色 + `ear` 形状），别新造画风 |
| **道具** | 椅子 / 茶杯 / 床 / 门…，用基础形状拼 |
| **走位** | 锚点写「念到第几个词时做什么」，**不写帧号**（帧号由 `cueFrame` 算） |

**语义化设计示例**（本次实践）：

| 段落 | 角色 | 走位 |
|---|---|---|
| 来是 come 去是 go | 兔子 | 每念一个词就换方向走一步（来回踱步） |
| 点头 yes 摇头 no | 小猫 | 念「点头」上下点，念「摇头」左右摆，配 ✓ / ✗ |
| 熟人见面说 hi | 两只企鹅 | 每念一遍 hi 就跳一下 + 弹一次气泡 |
| 客人来了快请坐 | 熊 + 猫 | 主人伸手相请，客人走到椅子旁 |

### 配色

每段给一套色（天空上/下 + 草地 + 角色），**同一支片子里色相统一**，但段落之间要有区分度。
参考本次的 13 套：草绿 / 浅黄 / 粉 / 橙 / 青 / 紫 / 薄荷 / 夕阳橙 / 暖棕 / 暖黄 / 朝阳 / 晚霞 / 夜空。

> ⚠️ 夜晚段（good night）天空偏深会让黑字看不清 —— 字幕已带白色光晕 `textShadow` 兜底。

---

## 第 4 步：写代码

### 4.1 创建项目

```bash
cd remotion-projects
rsync -a --exclude 'out' 20260925-英语启蒙问候语/ <新项目名>/   # ⚠️ 必须 rsync，cp -r 会解引用 .bin 符号链接
cd <新项目名> && rm -rf out
# 改 package.json name、Root.tsx 的 Composition id
```

新建项目后把 `node_modules` 加进 PyCharm 排除（改 `.idea/parenting-remotion.iml`）。

### 4.2 项目结构

```
src/
├── config.ts              # FPS / LAYOUT / SLIDES（含 enWords/zhWords 锚点）
├── utils.ts               # easeOutCubic / cueFrame / zhFrame
├── Flashcards.tsx         # 主组件：crossfade 序列 + 音频 + BGM + 音效
├── Root.tsx               # Composition 注册（正片 + 双封面）
├── components/
│   ├── fonts.ts           # Baloo2（英）/ ZCOOLKuaiLe 站酷快乐体（中）
│   ├── Caption.tsx        # 居中双语字幕 + 逐词点亮
│   └── Scene.tsx          # 画面 crossfade + 字幕硬切
└── scenes/
    ├── parts.tsx          # ★ 零件库：所有场景只从这里拿件
    ├── CoverScene.tsx     # 封面（单组件 vertical prop 切横竖）
    ├── index.ts           # scene id → 组件映射
    └── s01.tsx … sNN.tsx  # 每段一个场景
```

### 4.3 零件库（风格统一的关键）

`scenes/parts.tsx` 提供：`Stage` / `Sky` / `Ground` / `Cloud` / `Sun` / `Moon` /
`Tree` / `Pine` / `Bush` / `Flower` / `Critter` / `Bubble` / `Enter`。

**`Critter` 是通用小动物，所有角色都由它换参数生成**：

```tsx
<Critter body="#F3F1EC" belly="#FFFFFF" ear="long" mouth="open" />
// ear: round | pointy | long | none | tuft
// eyes: open | happy | closed     mouth: smile | open | o | none
// feet / blush / tilt / bob 均可调
```

| 角色 | 参数 |
|---|---|
| 兔子 | `ear="long"` + 白身 |
| 猫 / 熊 | `ear="round"` |
| 狐狸 | `ear="pointy"` |
| 企鹅 | `ear="none"` + `mouth="none"` + children 里加黄喙 `M-20,-4 L0,24 L20,-4 Z` |
| 公鸡 | `ear="none"` + children 里加鸡冠 path + 黄喙 + 尾羽 |

> ⚠️ **`CHAR_SCALE = 1.5` 是全局角色缩放系数** —— 改这一个值让所有场景的角色同步变大。
> 直觉上会画小：参考片的角色占画面高度约 1/3。
> ⚠️ 13 个场景**风格绝对统一靠的是「只复用零件、不新造画风」**，一个场景里手搓的角色就会让整条片子廉价。

### 4.4 核心编码模式

**动画锚点一律钉到词的帧号，不硬编码帧号**：

```tsx
const hello1 = cueFrame(slide, "hello", 0);  // 该词在 enWords 里的第 0 次出现
const meetAt = zhFrame(slide, "见面问好");
```

⚠️ `cueFrame` 取的是**词在 enWords 里的第几次出现**，不是中文行里的位置 —— 写场景前先看 config 里的 at 值。

⚠️ **`interpolate` 的 inputRange 必须严格递增**：关键帧要按词的**实际时间先后**排，
不能按「词形」分组排（`come1, come1+12, go1, go2` 这种顺序常会撞车）。

**画面 crossfade + 字幕硬切**（见 `components/Scene.tsx`）：

```tsx
const opacity = index === 0 ? 1 : interpolate(frame, [0, CROSSFADE_FRAMES], [0, 1], {clamp});
const showCaption = frame >= CAPTION_SWITCH && frame < slide.durationInFrames - CROSSFADE_FRAMES + CAPTION_SWITCH;
```

⚠️ 字幕**不能**跟着 crossfade —— 两段字幕布局相同，叠化会重影。

**双语字幕 + 逐词点亮**（见 `components/Caption.tsx`）：
未念到的词 22% 灰、念到变黑并弹一下（6 帧内）。这是本形态相对参考片的主要差别，
把「磨耳朵」的重复节奏在画面上可视化。

### 4.5 代码质检

- `./node_modules/.bin/tsc --noEmit` 零错误
- 渲染若干 still 抽帧核对版式（字幕居中、不折行、不压角色）
- 场景里所有 `scale` 值 × `CHAR_SCALE` 后角色是否出界/重叠

---

## 第 5 步：BGM + 渲染 + 响度

### 5.1 BGM

全程铺满、**不要有留白**，音量 0.1。音效本赛道几乎不用（参考片只有口播 + BGM）——
段切换挂一个 `whoosh` 0.12 做质感即可，**别每个卡片都挂音效**。

### 5.2 渲染

```bash
./node_modules/.bin/remotion render src/index.ts <composition-id> out/final.mp4 \
  --browser-executable="/Users/zhanglei/软件下载/chrome-headless-shell-mac-arm64/chrome-headless-shell" --concurrency=2
```

⚠️ **别用 `npx`**（会先解析 registry，新项目首次渲染还要下 chrome-headless-shell，网络卡住会无限等）。

### 5.3 响度归一化（渲染后必做）

Remotion 直出稳定在 **−21 LUFS**，抖音同类成片实测 **−9.1 LUFS** —— 差 12dB，外放一听就是「别人的更冲」。

```bash
./tools/loudness/loudnorm.sh remotion-projects/<项目>/out/final.mp4
# → out/final-loud.mp4
```

⚠️ **跑完必须看输出的真峰值，> 0 dBFS 就是削波了**。脚本默认 `I=-8`，音频动态大的片子
（实测数字篇 LRA 3.9）会顶到 **+1.0 dBFS**，此时降目标响度重跑：

```bash
LOUDNESS_I=-10 ./tools/loudness/loudnorm.sh <成片>.mp4   # → 峰值 −1.1 dBFS ✓
```

约定：`<name>.mp4` 是原始渲染，**`<name>-loud.mp4` 才是发布版**（脚本不覆盖原件）。

### 5.4 渲染核验（三步都不能省）

```bash
# 转场无闪白：算全片相邻帧差分，转场边界处最大值应 <8
ffmpeg -y -v error -i out/final.mp4 -vf "scale=64:86" -f rawvideo -pix_fmt gray /tmp/f.raw
# 再抽帧拼图看全片（每 3s 一帧铺开）
ffmpeg -y -v error -i out/final.mp4 -vf "fps=0.34,scale=330:-1" /tmp/ck/c%02d.png
```

---

## 第 6 步：封面 + 发布信息

### 6.1 封面（横竖双版）

用 `/remotion-cover` 的**点击率法则**，但**视觉要换成本片自己的**（skill 自带的是黑板版，直接套会和视频打架）：

1. 写 `src/scenes/CoverScene.tsx`，**单组件靠 `vertical` prop 切横竖布局**
2. Root 注册 `cover` 1920×1440 + `cover-vertical` 1080×1440，`durationInFrames={1}`
3. 渲染：

```bash
./node_modules/.bin/remotion still src/index.ts cover out/cover.png --browser-executable="..."
./node_modules/.bin/remotion still src/index.ts cover-vertical out/cover-vertical.png --browser-executable="..."
```

⚠️ **改内容后双封面都要重渲**（最容易漏渲其中一张）。
⚠️ 版式铁律：**气泡底（含箭头）必须落在角色头顶之上、标题墨迹之下** —— 三者会互相压。

### 6.2 发布信息文档

写 `docs/release-info.md`，五节：
`## 标题` / `## 简介`（分点 + 话题标签）/ `## 发布清单`（勾选 + 待确认项）/
`## 关键参数存档`（帧数/音频/音效/响度/锚点）/ `## 差异化（vs 参考）`。

---

## 附：本形态的成本直觉

| 环节 | 相对成本 |
|---|---|
| 文案 + 合规 | 低 |
| **TTS + whisper 对齐** | **中（音色试听 + 逐段核验遍数最费时）** |
| **13 个 SVG 场景** | **高（本形态最大的工作量，但一次性投入，改一个字符就能重渲）** |
| 编码 + 渲染 | 中 |
| 封面 | 低 |

> ⚠️ 与「插画讲解型」对比：那个形态的成本在 AI 生图（逐条手工跑，**无法在 Remotion 里自动化**），
> 本形态把这个成本换成了「手写 SVG」—— 后者是**可复用、可参数化、可批量改**的，
> 所以第一个场景最慢，后面 12 个会越来越快（零件已经在库里了）。
