---
name: douyin-downloader
description: "下载抖音无水印视频。Use this skill when the user wants to download 抖音 (Douyin) videos without watermark (无水印), save Douyin videos, or extract Douyin video download links. Triggers on: 抖音下载, 无水印, 去水印, douyin download, 抖音视频保存, 抖音解析, or when the user shares a v.douyin.com link and asks to download it. This skill uses a lightweight API-based approach (X-Bogus signing) — no browser needed."
license: Apache-2.0
metadata:
    version: "1.0.0"
---

# 抖音无水印视频下载

轻量级抖音无水印视频下载工具，基于 API + A-Bogus + X-Bogus 签名方案，无需浏览器。

## 与 video-batch-download 的对比

| 特性 | douyin-downloader (本 skill) | video-batch-download |
|---|---|---|
| 方案 | API + A-Bogus + X-Bogus 签名 | Playwright 浏览器自动化 |
| 依赖 | Python + requests | Node.js + Playwright + ffmpeg |
| 去水印 | 直接从 API 获取无水印源地址 | 浏览器截获 |
| 转录 | 不支持 | 支持 Whisper 转录 |
| 平台 | 仅抖音 | 抖音/B站/小红书 |
| 速度 | 快（无需启动浏览器） | 较慢（需启动浏览器） |

**选择本 skill 的场景**: 只需下载抖音无水印视频，不需要转录，追求速度和轻量。

## 依赖安装

```bash
pip install requests gmssl
```

## 工作流程

1. 接收抖音分享链接（短链接或完整链接）
2. 解析短链接获取完整 URL，提取 aweme_id
3. 调用抖音 API `/aweme/v1/web/aweme/detail/` 获取视频元数据
4. 从 `video.bit_rate` 中提取无水印视频流地址
5. 对 CDN 地址追加 X-Bogus 签名后直接下载

## 使用方式

### 下载视频

```bash
cd scripts && python main.py "https://v.douyin.com/xxxxx/"
```

### 指定保存目录

```bash
python scripts/main.py "https://v.douyin.com/xxxxx/" -o ./my_videos
```

### 仅查看视频信息（不下载）

```bash
python scripts/main.py "https://v.douyin.com/xxxxx/" --info
```

### 带 Cookie 下载（提高成功率）

```bash
python scripts/main.py "https://v.douyin.com/xxxxx/" --cookie "ttwid=xxx; odin_tt=xxx; msToken=xxx"
```

## Cookie 获取方法

部分视频需要登录态 Cookie 才能获取详情:

1. 浏览器打开 douyin.com 并登录
2. F12 → Application → Cookies → douyin.com
3. 复制关键字段: `ttwid`, `odin_tt`, `passport_csrf_token`, `sid_guard`
4. 保存到 `scripts/cookies.txt`，格式: `key1=value1; key2=value2`

大部分公开视频不需要 Cookie 也能下载。

## 去水印原理

抖音返回的视频数据中包含多个码率的视频流（`video.bit_rate`），其中部分流是去水印的原始视频。本工具自动选择最高码率且无水印的视频流——不是在已渲染视频上抹除水印，而是在请求阶段就获取原始无水印源文件。

关键实现见 `scripts/api.py` 中的 `get_watermark_free_url()` 方法。
