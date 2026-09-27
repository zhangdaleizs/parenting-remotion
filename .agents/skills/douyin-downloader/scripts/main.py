#!/usr/bin/env python3
"""
抖音无水印视频下载工具

使用方法:
    python main.py <抖音分享链接>

    python main.py "https://v.douyin.com/xxxxx/"
    python main.py "https://v.douyin.com/xxxxx/" -o ./my_videos
    python main.py "https://v.douyin.com/xxxxx/" --info    # 只查看信息不下载

Cookie 设置:
    将 Cookie 字符串写入 cookies.txt 文件，或通过环境变量 DOUYIN_COOKIE 设置
    需要的关键 Cookie: ttwid, odin_tt, passport_csrf_token, sid_guard

    获取方法: 浏览器打开 douyin.com 登录后，F12 -> Application -> Cookies 复制
"""

import argparse
import os
import sys

from api import DouyinAPI
from downloader import VideoDownloader


def load_cookies() -> dict:
    """从 cookies.txt 或环境变量加载 Cookie"""
    cookie_str = ""

    # 1. 尝试从 cookies.txt 读取
    cookie_file = os.path.join(os.path.dirname(__file__), "cookies.txt")
    if os.path.exists(cookie_file):
        with open(cookie_file, "r") as f:
            cookie_str = f.read().strip()

    # 2. 尝试从环境变量
    if not cookie_str:
        cookie_str = os.environ.get("DOUYIN_COOKIE", "")

    if not cookie_str:
        return {}

    # 解析 Cookie 字符串: "key1=value1; key2=value2"
    cookies = {}
    for item in cookie_str.split(";"):
        item = item.strip()
        if "=" in item:
            key, value = item.split("=", 1)
            cookies[key.strip()] = value.strip()
    return cookies


def main():
    parser = argparse.ArgumentParser(
        description="抖音无水印视频下载工具",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
示例:
  python main.py "https://v.douyin.com/xxxxx/"
  python main.py "https://v.douyin.com/xxxxx/" -o ./videos
  python main.py "https://v.douyin.com/xxxxx/" --info

Cookie 设置:
自动获取: python get_cookie.py  (打开浏览器扫码登录，自动保存)
  手动获取: 浏览器打开 douyin.com -> F12 -> Application -> Cookies
        """,
    )
    parser.add_argument("url", help="抖音分享链接")
    parser.add_argument("-o", "--output", default="./downloads", help="保存目录 (默认: ./downloads)")
    parser.add_argument("--cookie", help="Cookie 字符串 (key1=value1; key2=value2)")
    parser.add_argument("--info", action="store_true", help="仅查看视频信息，不下载")
    args = parser.parse_args()

    # 加载 Cookie
    cookies = {}
    if args.cookie:
        for item in args.cookie.split(";"):
            if "=" in item:
                k, v = item.split("=", 1)
                cookies[k.strip()] = v.strip()
    else:
        cookies = load_cookies()

    if not cookies:
        print("提示: 未设置 Cookie，可能无法获取部分视频。")
        print("将 cookies.txt 放在脚本同目录下，或使用 --cookie 参数。")
        print()

    api = DouyinAPI(cookies=cookies)
    downloader = VideoDownloader(api, save_dir=args.output)

    if args.info:
        info = downloader.get_video_info(args.url)
        if info:
            print(f"视频ID: {info['aweme_id']}")
            print(f"作者: {info['author']}")
            print(f"描述: {info['desc']}")
            print(f"无水印地址: {info['video_url']}")
        else:
            print("获取视频信息失败")
            sys.exit(1)
    else:
        result = downloader.download(args.url)
        if not result:
            print("\n下载失败!")
            sys.exit(1)
        print("\n下载完成!")


if __name__ == "__main__":
    main()
