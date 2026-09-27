---
name: bgm
description: Search and download background music (BGM) from NetEase Cloud Music. Use this skill whenever the user wants to find, search, or download background music, BGM, 背景音乐, 配乐, 纯音乐, or instrumental music. Triggers on mentions of "bgm", "背景音乐", "配乐", "纯音乐", "轻音乐", "古风音乐", or when the user asks to find/download music by mood, genre, style, or name — especially Chinese/instrumental music.
---

# BGM Search & Download (网易云音乐)

Search for background music on NetEase Cloud Music and download free tracks.

## Workflow

### Step 1: Gather search criteria

Ask the user what kind of BGM they want. If they haven't specified, ask about:
- **Type/Mood/Style**: e.g., 古风, 中国风, 轻音乐, 钢琴, 吉他, 电子, 史诗, 治愈, 欢快, 悲伤, 大气, 古筝, 笛子, 禅意
- **Usage scenario**: 视频配乐, 演讲背景, 游戏, 学习, 瑜伽冥想, 广告

### Step 2: Search for music

Run the search script:

```bash
python3 <skill_dir>/scripts/bgm_search.py search "<query>" --limit 15
```

This searches NetEase Cloud Music and returns free tracks as JSON.

### Step 3: Present results

Show the top 10 **downloadable** results as a table:

```
## 搜索结果: "<query>"

| # | 歌名 | 时长 | 艺人 |
|---|------|------|------|
| 1 | xxx  | 3:21 | xxx  |
| 2 | xxx  | 4:15 | xxx  |
| ... | ... | ... | ... |

输入序号 (1-10) 下载对应歌曲，或输入 "换一批" 查看更多。
```

### Step 4: Download selected track

```bash
python3 <skill_dir>/scripts/bgm_search.py download <song_id> --output "<歌名>"
```

Report the saved file path to the user.

## Notes

- Only free songs (fee=0) can be downloaded. The script automatically filters to show only downloadable tracks.
- Downloaded files are MP3 format at the best available quality
- Files are saved to `./bgm/` under the project directory by default
- If search returns too few free results, broaden the query or try different keywords
