---
name: tts
description: TTS 配音生成。在制作 Remotion 视频需要生成配音时使用。负责引导用户选择合适的 TTS 平台（豆包/速创猫）、搜索音色、生成音频文件。触发场景：需要配音、生成语音、TTS、机器音、音频生成。
---

# TTS 配音生成

为 Remotion 视频项目生成场景配音。**生成前必须先确认平台和音色**。

## 平台选择

先根据视频需求帮用户选择合适的平台：

| 维度 | 豆包 TTS | 速创猫 TTS |
|------|---------|-----------|
| 音色数量 | 1 种（咪仔童趣女声） | 299 种（10 个分类） |
| 适合场景 | 单人讲解、数学课 | 角色对话、多情感、方言外语 |
| 音色质量 | 稳定、童趣 | 多样、可选 |
| API Key | `DOUBAO_API_KEY` | `SPEECH_API_KEY` |
| 脚本位置 | 项目内 `scripts/generate_tts.py` | 共享 `tools/tts/generate_tts.py` |
| 配置方式 | 文案硬编码在脚本中 | JSON 配置文件 `scripts/batch_config.json` |

**推荐规则**：
- 单人老师讲解、小学数学动画 → 豆包（简单够用）
- 多角色对话、需要不同音色 → 速创猫
- 需要方言（北京/四川/广东...）、外语 → 速创猫
- 需要特定情感（开心/悲伤/惊讶...） → 速创猫

### 如果选豆包

确认项目内的 `scripts/generate_tts.py` 存在，检查 `NARRATIONS` 列表中的文案是否已更新为当前视频的口播文案，然后运行：

```bash
cd remotion-projects/<项目名>
python3 scripts/generate_tts.py
```

### 如果选速创猫

按以下步骤操作：

## 速创猫工作流

### Step 1: 搜索/确认音色

根据视频风格搜索合适的音色：

```bash
# 在项目目录下运行
cd remotion-projects/<项目名>
python3 ../../tools/tts/generate_tts.py --search "少儿"
```

常用推荐（小学知识视频）：
| 音色 ID | 名称 | 场景 |
|---------|------|------|
| `zh_female_shaoergushi_mars_bigtts` | 少儿故事 | 讲故事 |
| `zh_male_tiancaitongsheng_mars_bigtts` | 天才童声 | 儿童配音 |
| `zh_female_yingyujiaoyu_mars_bigtts` | Tina 老师 | 教学讲解 |
| `zh_female_peiqi_mars_bigtts` | 佩奇猪 | 趣味配音 |
| `zh_female_tianmeitaozi_mars_bigtts` | 甜美桃子 | 通用女声 |
| `zh_male_qingshuangnanda_mars_bigtts` | 清爽男大 | 通用男声 |

如需查看全部 299 种音色：`python3 ../../tools/tts/generate_tts.py --list-voices`

### Step 2: 编辑文案配置

确认 `scripts/batch_config.json` 中每场景的文案、音色、语速：

```json
[
  {
    "text": "口播文案内容",
    "voice_id": "zh_female_shaoergushi_mars_bigtts",
    "speed_ratio": 1.0,
    "output": "title.mp3"
  }
]
```

- `voice_id`：从 Step 1 搜索到的音色 ID
- `speed_ratio`：0.8-1.2，默认 1.0
- `output`：文件名，需与 SceneSwitcher.tsx 中 `staticFile("audio/xxx.mp3")` 一致

### Step 3: 生成音频

```bash
python3 ../../tools/tts/generate_tts.py
```

生成日志会显示每段音频的时长和对应帧数：
```
→ title.mp3 (45.3 KB, 5.2s → 172f (5.2s×30fps+16))
```

### Step 4: 更新帧数

把每场景的帧数填入 `SceneSwitcher.tsx` 的 SCENES 表，更新 `Root.tsx` 的 `durationInFrames`。

## API Key

两个平台的 Key 已写死在对应脚本中，无需手动设置环境变量。如需更换 Key，可通过环境变量覆盖：

- **豆包**：`DOUBAO_API_KEY`
- **速创猫**：`SPEECH_API_KEY`
