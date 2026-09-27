#!/usr/bin/env python3
"""
自动获取抖音 Cookie
打开浏览器 -> 扫码登录 -> 自动检测登录成功 -> 保存 Cookie
"""

import os
import sys
import time

from playwright.sync_api import sync_playwright

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
COOKIE_FILE = os.path.join(SCRIPT_DIR, "cookies.txt")

REQUIRED_KEYS = ["ttwid", "odin_tt", "passport_csrf_token", "sid_guard"]
LOGIN_INDICATOR = "odin_tt"
POLL_INTERVAL = 2
TIMEOUT = 300


def has_logged_in(context) -> bool:
    cookies = {c["name"]: c["value"] for c in context.cookies()}
    return LOGIN_INDICATOR in cookies and len(cookies[LOGIN_INDICATOR]) > 20


def main():
    print("正在启动浏览器...")

    with sync_playwright() as p:
        browser = p.chromium.launch(
            headless=False,
            args=["--disable-blink-features=AutomationControlled"],
        )
        context = browser.new_context(
            viewport={"width": 1280, "height": 800},
            user_agent=(
                "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
                "AppleWebKit/537.36 (KHTML, like Gecko) "
                "Chrome/139.0.0.0 Safari/537.36"
            ),
        )
        context.add_init_script("""
            Object.defineProperty(navigator, 'webdriver', {get: () => undefined});
            Object.defineProperty(navigator, 'plugins', {get: () => [1, 2, 3, 4, 5]});
            Object.defineProperty(navigator, 'languages', {get: () => ['zh-CN', 'zh']});
        """)

        page = context.new_page()
        page.goto("https://www.douyin.com/?recommend=1", wait_until="domcontentloaded")

        print()
        print("=" * 50)
        print("  请在浏览器窗口中扫码登录抖音")
        print("  登录成功后脚本将自动检测并关闭")
        print(f"  等待超时: {TIMEOUT} 秒")
        print("=" * 50)

        elapsed = 0
        while elapsed < TIMEOUT:
            if has_logged_in(context):
                print("\n检测到登录成功! 正在保存 Cookie...")
                break
            dots = "." * ((elapsed // POLL_INTERVAL) % 4 + 1)
            print(f"\r等待登录{dots}   ({elapsed}s/{TIMEOUT}s)", end="")
            time.sleep(POLL_INTERVAL)
            elapsed += POLL_INTERVAL
        else:
            print("\n\n登录超时，请重试")
            browser.close()
            sys.exit(1)

        time.sleep(1)
        all_cookies = context.cookies()
        cookies_dict = {c["name"]: c["value"] for c in all_cookies}

        cookie_parts = []
        for key in REQUIRED_KEYS:
            if key in cookies_dict:
                cookie_parts.append(f"{key}={cookies_dict[key]}")
        for name, value in cookies_dict.items():
            if name not in REQUIRED_KEYS:
                cookie_parts.append(f"{name}={value}")

        cookie_str = "; ".join(cookie_parts)

        with open(COOKIE_FILE, "w") as f:
            f.write(cookie_str)

        print(f"\nCookie 已保存到: {COOKIE_FILE}")
        print(f"包含 {len(cookies_dict)} 个字段")

        found = [k for k in REQUIRED_KEYS if k in cookies_dict]
        missing = [k for k in REQUIRED_KEYS if k not in cookies_dict]
        if found:
            print(f"  已获取关键字段: {', '.join(found)}")
        if missing:
            print(f"  缺少字段: {', '.join(missing)} (可能影响下载)")

        browser.close()

    print()
    print("现在可运行下载:")
    print(f"  python {os.path.join(SCRIPT_DIR, 'main.py')} '<抖音链接>'")


if __name__ == "__main__":
    main()
