---
name: emoji-assets
description: >-
  从 emoji 矢量库（Twemoji / OpenMoji）取单词卡缩略图素材 —— 具象词（水果/蔬菜/动物/
  颜色/天气/交通）的首选，比图库实拍图风格统一得多、天然透明底、单张 1KB。
  三个子命令：list 查候选 / sheet 拼总览图确认风格 / fetch 下载到 public/thumbs。
  抽象词（sour/crispy/greasy 这类味道、性质词）emoji 覆盖不到，那类走 word-list-card
  的 find_images.py 图库。
  触发词：emoji 素材、emoji 图标、Twemoji、OpenMoji、单词卡配图、白底图、透明底图、
  免费图标素材、具象词配图。
metadata:
  type: tool
---

# emoji 矢量素材工具

单词卡（`word-list-card` / `word-grid-card`）第 4 步「图片素材」的**首选来源**。
脚本：`.agents/skills/emoji-assets/scripts/fetch_emoji.py`（纯标准库 + Pillow，无外部 key）。

## 先用这个，还是先用图库？

| 词的类型 | 例子 | 走哪条 |
|---|---|---|
| **具象词** | 水果、蔬菜、动物、颜色、天气、交通、日常物品 | **本工具（emoji）** |
| **抽象词** | `sour` `crispy` `greasy` `mild` `tough` 这类味道 / 性质词 | `word-list-card/scripts/find_images.py` 图库实拍图，或 AI 生图 |

**为什么具象词优先 emoji**（实测对比同一批 12 个水果词）：

| | 图库实拍图 | emoji |
|---|---|---|
| 风格统一 | ✗ 深浅不一、角度各异 | ✓ 同一套设计语言 |
| 主体正确 | ✗ 常混进料理成品（切开的苹果/桃/猕猴桃） | ✓ 就是那个水果 |
| 小尺寸清晰度 | ✗ 104px 下细节糊成一团 | ✓ 扁平色块，边缘锐利 |
| 抠图 | 需要，且白底合成会有色差 | 天然透明底 |
| 体积 | ~190KB/张（12 张 2.2MB） | **~1KB/张（12 张 16KB，小 140 倍）** |
| 授权 | Commons 常混 CC BY-SA（有传染性） | CC-BY 4.0 / CC-BY-SA 4.0，规则清晰 |

⚠️ **抽象词不要硬套 emoji** —— 实测 gemoji 索引里 `sour` 命中 **0 条**。
先跑 `list <词>` 看有没有命中，没有就老实走图库。

## 用法

```bash
# 1. 查候选（按名称/别名/标签模糊搜 gemoji 索引）
python3 .agents/skills/emoji-assets/scripts/fetch_emoji.py list apple carrot "red apple"

# 2. 拼总览图 —— Read 它确认风格（Read sheet 上的图，不是看文字）
python3 .agents/skills/emoji-assets/scripts/fetch_emoji.py sheet \
  --out /tmp/emoji --set twemoji \
  --picks "s01_apple=🍎" "s02_banana=🍌" "s03_orange=🍊"

# 3. 下载到项目
python3 .agents/skills/emoji-assets/scripts/fetch_emoji.py fetch \
  --dest remotion-projects/<项目>/public/thumbs --set twemoji \
  --picks "s01_apple=🍎" "s02_banana=🍌" "s03_orange=🍊"
```

`--picks` 的**值写 emoji 字符或名称都行**：`s01_apple=🍎` 等价于 `s01_apple=apple`。
名称有多义时（`apple` 命中 5 条）用 `list` 看清再定，或直接贴字符最精确。

## 两个源：先出两张 sheet 对比，别凭感觉选

| | twemoji（默认） | openmoji |
|---|---|---|
| 观感 | 扁平纯色块，**无描边** | 填色 + **深色描边**，手绘卡通感 |
| 小尺寸 | 更清晰（无描边不会糊） | 描边在 104px 下略糊 |
| 协议 | CC-BY 4.0 | CC-BY-SA 4.0（**有传染性**，商用账号注意） |

两者风格**绝不混用** —— 一条片子只用一套。切换就是 `--set openmoji`。

## 接到 Remotion

**默认出 SVG，无需任何转换** —— Remotion 的 `<Img>` 直接吃，已实测通过：

```ts
// config.ts：把 img 字段写成 .svg
{ en: "apple", ipa: "/ˈæpl/", zh: "苹果", img: "s01_apple.svg", audioSeconds: 1.37 },
```

组件一行都不用改（`objectFit: "cover"` + `borderRadius` 对透明底 SVG 无影响）。

- **换素材不必删旧图** —— SVG 和旧 PNG 换后缀并存，改 config 一行即可切回对比
- 要 PNG（旧写法 / 需要位图）加 `--png`，**依赖 macOS 的 `qlmanage`**
  （本机没装 rsvg-convert / cairosvg / inkscape，脚本会自动检查并报错）

## 坑

| 坑 | 真相 |
|---|---|
| **命名带 `-fe0f` 一律 404** | Twemoji 与 OpenMoji 都**去掉变体选择符 FE0F**：`1f336.svg` ✓ / `1f336-fe0f.svg` ✗。脚本先试去 FE0F、再试保留，两层兜底 |
| **拿抽象词去搜，命中 0 条** | 这是**正常信号**，说明该走图库，不是脚本坏了 |
| **总览图标签显示成豆腐块** | PIL 默认字体渲染不出 emoji → sheet 标签只写 key，不写 emoji 字符 |
| **透明底 PNG 在 PIL 里变黑** | 拼 sheet 时必须 `paste(im, pos, im)` 传 mask 保留 alpha；转 RGB 会把透明区填黑 |
| **OpenMoji 是 CC-BY-SA** | share-alike 有传染性，商用账号优先用默认的 Twemoji（CC-BY 4.0） |
| **改 JSX 仍不生效** | 记得改的是 `src/config.ts` 的 `img` 字段，不是组件 |

## 授权署名

无论哪个源都**要求署名**，写进 `docs/release-info.md`：

- Twemoji：`Emoji graphics from Twemoji (CC-BY 4.0)`
- OpenMoji：`Emoji graphics from OpenMoji (CC-BY-SA 4.0)`
