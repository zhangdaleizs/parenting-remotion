#!/usr/bin/env python3
"""用火山方舟 AgentPlan 的 Seedream 批量生成英语启蒙插画。

用法：python3 scripts/gen_slides.py
需要环境变量 ANTHROPIC_AUTH_TOKEN（ark- 开头的方舟 key）。

⚠️ 端点必须是 /api/plan/v3/images/generations（AgentPlan 专用）。
   走标准方舟的 /api/v3/... 会 401 —— 这类 key 只对 AgentPlan 有效。
"""
import json
import os
import sys
import time
import urllib.request

ENDPOINT = "https://ark.cn-beijing.volces.com/api/plan/v3/images/generations"
MODEL = "doubao-seedream-5.0-lite"
# 3:4 竖屏。Seedream 要求 ≥3686400 像素，直接传 1080x1440 会被拒
SIZE = "1728x2304"

# 角色描述逐字固定、5 张共用 —— 这是角色一致性的主要手段，改一处就要 5 张全重跑
CHARACTER = (
    "一个拟人化的土豆角色，圆润的椭圆形身体，淡黄色偏米色，表面分布棕色小斑点，"
    "黑色圆点眼睛，弯弯的笑嘴，粉色腮红，黑色细线手臂和腿"
)
STYLE = (
    "儿童英语启蒙绘本插画，蜡笔手绘质感，粗黑描边，扁平涂色，"
    "蓝天和绿色草地背景，暖色调，可爱卡通风格"
)

SCENES = {
    "s1": "戴一顶棕色草帽，站在草地上张开双臂",
    "s2": "戴白色厨师帽，一手托着一个小土豆，站在白色餐盘旁，桌上有刀叉",
    "s3": "不戴帽子，站直，身体呈明显的椭圆形，双手自然下垂",
    "s4": "戴白色厨师帽，站在蓝色桌子旁，桌上放一盘金黄薯条",
    "s5": "戴棕色草帽，坐在一辆红色小汽车里，手握方向盘",
}

OUT_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "assets", "slides_src")


def generate(prompt: str) -> str:
    key = os.environ.get("ANTHROPIC_AUTH_TOKEN")
    if not key:
        sys.exit("缺少环境变量 ANTHROPIC_AUTH_TOKEN")
    body = json.dumps({"model": MODEL, "prompt": prompt, "size": SIZE}).encode()
    req = urllib.request.Request(
        ENDPOINT,
        data=body,
        headers={"Authorization": f"Bearer {key}", "Content-Type": "application/json"},
    )
    with urllib.request.urlopen(req, timeout=300) as resp:
        data = json.load(resp)
    if "error" in data:
        raise RuntimeError(data["error"])
    return data["data"][0]["url"]


def main() -> None:
    os.makedirs(OUT_DIR, exist_ok=True)
    failed = []
    for name, scene in SCENES.items():
        prompt = f"{STYLE}。{CHARACTER}，{scene}"
        url = None
        for attempt in range(3):
            try:
                url = generate(prompt)
                break
            except Exception as exc:  # 网络抖动或限流，退避重试
                print(f"  {name} 第 {attempt + 1} 次失败: {exc}")
                time.sleep(3 * (attempt + 1))
        if not url:
            failed.append(name)
            print(f"✗ {name} 生成失败")
            continue
        dest = os.path.join(OUT_DIR, f"{name}.png")
        urllib.request.urlretrieve(url, dest)
        print(f"✓ {name} → {os.path.relpath(dest)}")
    if failed:
        sys.exit(f"以下未生成：{', '.join(failed)}")


if __name__ == "__main__":
    main()
