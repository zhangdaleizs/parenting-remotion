"""
视频下载器
"""

import os
import re
import time
from pathlib import Path
from typing import Any, Dict, Optional, Tuple

import requests

from api import BASE_URL, DouyinAPI, parse_aweme_id


def sanitize_filename(name: str) -> str:
    """清理文件名中的非法字符"""
    name = re.sub(r'[\\/:*?"<>|]', "_", name)
    return name[:200]


class VideoDownloader:
    def __init__(
        self,
        api: DouyinAPI,
        save_dir: str = "./downloads",
        timeout: int = 120,
    ):
        self.api = api
        self.save_dir = Path(save_dir)
        self.timeout = timeout
        self.save_dir.mkdir(parents=True, exist_ok=True)

    def download(self, share_url: str) -> Optional[Path]:
        """下载抖音无水印视频，返回保存路径"""
        # 1. 解析短链接
        print(f"[1/4] 解析分享链接...")
        full_url = self.api.resolve_short_url(share_url)
        if not full_url:
            print("错误: 无法解析短链接")
            return None
        print(f"      完整URL: {full_url}")

        # 2. 提取 aweme_id
        aweme_id = parse_aweme_id(full_url)
        if not aweme_id:
            print("错误: 无法提取视频ID")
            return None
        print(f"[2/4] 视频ID: {aweme_id}")

        # 3. 获取视频详情
        print(f"[3/4] 获取视频信息...")
        aweme_data = self.api.get_video_detail(aweme_id)
        if not aweme_data:
            print("错误: 无法获取视频详情，可能需要更新 Cookie")
            return None

        desc = (aweme_data.get("desc") or "无标题").strip()
        author = (aweme_data.get("author") or {}).get("nickname", "未知作者")
        print(f"      作者: {author}")
        print(f"      描述: {desc[:60]}")

        # 4. 获取无水印视频地址并下载
        print(f"[4/4] 下载无水印视频...")
        video_info = self.api.get_watermark_free_url(aweme_data)
        if not video_info:
            print("错误: 无法获取无水印视频地址")
            return None

        video_url, headers = video_info
        filename = f"{sanitize_filename(author)}-{sanitize_filename(desc)}_{aweme_id}.mp4"
        filepath = self.save_dir / filename

        return self._download_file(video_url, filepath, headers)

    def _download_file(
        self, url: str, filepath: Path, headers: Dict[str, str]
    ) -> Optional[Path]:
        """带进度条的下载"""
        for attempt in range(3):
            try:
                with requests.get(
                    url, headers=headers, stream=True, timeout=self.timeout
                ) as resp:
                    if resp.status_code != 200:
                        print(f"      HTTP {resp.status_code}, 重试 {attempt + 1}/3")
                        time.sleep(1 + attempt)
                        continue

                    total_size = int(resp.headers.get("content-length", 0))
                    downloaded = 0
                    start_time = time.time()

                    with open(filepath, "wb") as f:
                        for chunk in resp.iter_content(chunk_size=8192):
                            if chunk:
                                f.write(chunk)
                                downloaded += len(chunk)
                                if total_size > 0:
                                    pct = downloaded / total_size * 100
                                    speed = downloaded / max(time.time() - start_time, 0.1) / 1024
                                    print(
                                        f"\r      进度: {pct:5.1f}%  "
                                        f"({downloaded / 1024 / 1024:.1f}MB / {total_size / 1024 / 1024:.1f}MB, "
                                        f"{speed:.0f} KB/s)",
                                        end="",
                                    )

                    print()
                    file_size = filepath.stat().st_size
                    if total_size > 0 and file_size < total_size * 0.9:
                        print(f"      文件不完整, 重试 {attempt + 1}/3")
                        time.sleep(1 + attempt)
                        continue

                    print(f"      保存至: {filepath}")
                    print(f"      文件大小: {file_size / 1024 / 1024:.1f} MB")
                    return filepath

            except Exception as e:
                print(f"\n      下载失败: {e}, 重试 {attempt + 1}/3")
                time.sleep(1 + attempt)

        return None

    def get_video_info(self, share_url: str) -> Optional[Dict[str, Any]]:
        """只获取视频信息，不下载"""
        full_url = self.api.resolve_short_url(share_url)
        if not full_url:
            return None

        aweme_id = parse_aweme_id(full_url)
        if not aweme_id:
            return None

        aweme_data = self.api.get_video_detail(aweme_id)
        if not aweme_data:
            return None

        video_info = self.api.get_watermark_free_url(aweme_data)

        return {
            "aweme_id": aweme_id,
            "desc": (aweme_data.get("desc") or "").strip(),
            "author": (aweme_data.get("author") or {}).get("nickname", ""),
            "create_time": aweme_data.get("create_time"),
            "duration": (aweme_data.get("video") or {}).get("duration"),
            "video_url": video_info[0] if video_info else None,
        }
