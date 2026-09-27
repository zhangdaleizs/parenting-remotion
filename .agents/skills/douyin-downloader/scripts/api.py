"""
抖音 API 客户端
负责与抖音服务端通信，获取视频元数据
支持 A-Bogus（主）+ X-Bogus（回退）两种签名方式
"""

import random
import re
import string
import time
from typing import Any, Dict, Optional, Tuple
from urllib.parse import urlencode

import requests

from xbogus import XBogus

try:
    from abogus import ABogus, BrowserFingerprintGenerator
    _ABOGUS_AVAILABLE = True
except ImportError:
    _ABOGUS_AVAILABLE = False

BASE_URL = "https://www.douyin.com"

_USER_AGENTS = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36",
]

_WATERMARK_HINTS = (
    "tplv-dy-water",
    "dy-water",
    "owner_watermark",
    "watermark_image",
    "watermark=1",
    "playwm",
)


def _is_watermarked(url: str) -> bool:
    return any(hint in url.lower() for hint in _WATERMARK_HINTS)


def _gen_fake_ms_token() -> str:
    return "".join(random.choice(string.ascii_letters + string.digits) for _ in range(182)) + "=="


class DouyinAPI:
    def __init__(self, cookies: Optional[Dict[str, str]] = None):
        self.cookies = cookies or {}
        self._user_agent = random.choice(_USER_AGENTS)
        self._xb_signer = XBogus(self._user_agent)

        if _ABOGUS_AVAILABLE:
            self._ab_fp = BrowserFingerprintGenerator.generate_fingerprint("Chrome")
            self._ab_signer = ABogus(fp=self._ab_fp, user_agent=self._user_agent)
        else:
            self._ab_fp = None
            self._ab_signer = None

        if not self.cookies.get("msToken"):
            self.cookies["msToken"] = _gen_fake_ms_token()

    @property
    def headers(self) -> Dict[str, str]:
        return {
            "User-Agent": self._user_agent,
            "Referer": f"{BASE_URL}/?recommend=1",
            "Accept": "*/*",
            "Accept-Language": "zh-CN,zh;q=0.9",
        }

    def _build_default_params(self) -> Dict[str, Any]:
        return {
            "device_platform": "webapp",
            "aid": "6383",
            "channel": "channel_pc_web",
            "update_version_code": "170400",
            "pc_client_type": "1",
            "pc_libra_divert": "Windows",
            "version_code": "290100",
            "version_name": "29.1.0",
            "cookie_enabled": "true",
            "screen_width": "1536",
            "screen_height": "864",
            "browser_language": "zh-CN",
            "browser_platform": "Win32",
            "browser_name": "Chrome",
            "browser_version": "139.0.0.0",
            "browser_online": "true",
            "engine_name": "Blink",
            "engine_version": "139.0.0.0",
            "os_name": "Windows",
            "os_version": "10",
            "cpu_core_num": "16",
            "device_memory": "8",
            "platform": "PC",
            "downlink": "10",
            "effective_type": "4g",
            "round_trip_time": "200",
            "support_h265": "1",
            "support_dash": "1",
            "msToken": self.cookies.get("msToken", ""),
        }

    def _sign_url(self, url: str) -> Tuple[str, str]:
        """优先用 A-Bogus，回退到 X-Bogus"""
        if self._ab_signer:
            query = url.split("?", 1)[1] if "?" in url else ""
            if query:
                params_with_ab, _, ua, _ = self._ab_signer.generate_abogus(query, "")
                base = url.split("?", 1)[0]
                return f"{base}?{params_with_ab}", ua
        signed_url, _, ua = self._xb_signer.sign(url)
        return signed_url, ua

    def _build_signed_url(self, path: str, params: Dict[str, Any]) -> Tuple[str, str]:
        query = urlencode(params)
        full_url = f"{BASE_URL}{path}?{query}"
        return self._sign_url(full_url)

    def _api_get(self, path: str, params: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        signed_url, ua = self._build_signed_url(path, params)
        headers = {**self.headers, "User-Agent": ua}

        for attempt in range(3):
            try:
                resp = requests.get(
                    signed_url,
                    headers=headers,
                    cookies=self.cookies,
                    timeout=30,
                )
                if resp.status_code == 200 and resp.text.strip():
                    try:
                        data = resp.json()
                    except Exception:
                        data = {}
                    if isinstance(data, dict) and data:
                        return data
                    # Empty 200 = anti-bot, fallback to X-Bogus
                    if attempt == 0 and self._ab_signer:
                        self._ab_signer = None
                elif resp.status_code < 500 and resp.status_code != 429:
                    return None
            except Exception:
                pass

            if attempt < 2:
                time.sleep(1 + attempt)
        return None

    def resolve_short_url(self, short_url: str) -> Optional[str]:
        """解析抖音短链接，返回完整URL"""
        try:
            resp = requests.get(
                short_url,
                headers=self.headers,
                allow_redirects=True,
                timeout=15,
            )
            if resp.status_code < 400:
                return resp.url
        except Exception:
            pass
        return None

    def get_video_detail(self, aweme_id: str) -> Optional[Dict[str, Any]]:
        """获取作品详情"""
        for aid in ("6383", "1128"):
            params = self._build_default_params()
            params.update({"aweme_id": aweme_id, "aid": aid})

            data = self._api_get("/aweme/v1/web/aweme/detail/", params)
            if not data:
                continue

            detail = data.get("aweme_detail")
            if detail:
                return detail

        return None

    def get_watermark_free_url(self, aweme_data: Dict[str, Any]) -> Optional[Tuple[str, Dict[str, str]]]:
        """从作品数据中提取无水印视频URL"""
        video = aweme_data.get("video", {}) or {}

        play_addr = self._pick_best_play_addr(video)
        if not play_addr:
            play_addr = video.get("play_addr") or {}

        url_list = play_addr.get("url_list") or []
        url_list_sorted = sorted(url_list, key=lambda u: 1 if _is_watermarked(u) else 0)

        for url in url_list_sorted:
            if not url:
                continue
            headers = {
                "Referer": f"{BASE_URL}/",
                "Origin": BASE_URL,
                "Accept": "*/*",
                "User-Agent": self._user_agent,
            }

            if "douyin.com" in url and "X-Bogus=" not in url:
                signed_url, ua = self._sign_url(url)
                headers["User-Agent"] = ua
                if _is_watermarked(url):
                    continue
                return signed_url, headers

            if _is_watermarked(url):
                continue
            return url, headers

        uri = play_addr.get("uri") or video.get("vid") or (video.get("download_addr") or {}).get("uri")
        if uri:
            params = {
                "video_id": uri,
                "ratio": "1080p",
                "line": "0",
                "is_play_url": "1",
                "watermark": "0",
                "source": "PackSourceEnum_PUBLISH",
            }
            signed_url, ua = self._build_signed_url("/aweme/v1/play/", params)
            return signed_url, {
                "Referer": f"{BASE_URL}/",
                "Origin": BASE_URL,
                "Accept": "*/*",
                "User-Agent": ua,
            }

        return None

    @staticmethod
    def _pick_best_play_addr(video: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        bit_rates = video.get("bit_rate")
        if not isinstance(bit_rates, list) or not bit_rates:
            return None

        best = None
        best_br = -1
        for entry in bit_rates:
            if not isinstance(entry, dict):
                continue
            pa = entry.get("play_addr")
            if not isinstance(pa, dict):
                continue
            try:
                br = int(entry.get("bit_rate") or 0)
            except (TypeError, ValueError):
                br = 0
            if br > best_br:
                best_br = br
                best = pa
        return best


def parse_aweme_id(url: str) -> Optional[str]:
    """从抖音链接中提取 aweme_id"""
    match = re.search(r"/video/(\d{15,20})", url)
    if match:
        return match.group(1)
    match = re.search(r"modal_id=(\d{15,20})", url)
    if match:
        return match.group(1)
    match = re.search(r"/note/(\d{15,20})", url)
    if match:
        return match.group(1)
    return None
