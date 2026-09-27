#!/usr/bin/env python3
"""用火山方舟 AgentPlan 的 Seedream 批量生成英语启蒙插画。

用法：python3 scripts/gen_slides.py
需要环境变量 ANTHROPIC_AUTH_TOKEN（ark- 开头的方舟 key）。

⚠️ 端点必须是 /api/plan/v3/images/generations（AgentPlan 专用）。
   走标准方舟的 /api/v3/... 会 401 —— 这类 key 只对 AgentPlan 有效。

角色一致性靠两级：
  1) 先出一张无道具的「定妆图」assets/character_ref.png（已存在则复用）
  2) 5 张场景图都以定妆图为 image 参考图
纯靠 prompt 描述做不到一致 —— 实测同一段角色描述会产出胖/瘦/斑点疏密都不同的版本。
"""
import base64
import io
import json
import os
import sys
import time
import urllib.error
import urllib.request

from PIL import Image

ENDPOINT = "https://ark.cn-beijing.volces.com/api/plan/v3/images/generations"
MODEL = "doubao-seedream-5.0-lite"
# 3:4 竖屏。Seedream 要求 ≥3686400 像素，直接传 1080x1440 会被拒
SIZE = "1728x2304"

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT_DIR = os.path.join(ROOT, "assets", "slides_src")
REF_PATH = os.path.join(ROOT, "assets", "character_ref.png")

STYLE = "儿童英语启蒙绘本插画，蜡笔手绘质感，粗黑描边，扁平涂色，暖色调，可爱卡通风格"

REF_PROMPT = (
    f"{STYLE}。一个拟人化的土豆角色，圆润的椭圆形身体，淡黄色偏米色，"
    "表面分布棕色小斑点，黑色圆点眼睛，弯弯的笑嘴，粉色腮红。"
    "手臂和腿是纯黑色的细线条，像火柴人一样只有黑色描线、线条内部没有填充色。"
    "正面站立，双手自然下垂，全身完整可见。纯净的浅蓝色背景，无任何道具。"
)

SCENES = {
    "s1": "土豆戴一顶棕色草帽，站在绿色草地上，张开双臂，全身完整可见，居中",
    "s2": "土豆戴白色厨师帽，站在一张木桌旁，一只手托着一个小土豆，桌上有白色餐盘和刀叉",
    "s3": "土豆不戴帽子，正面站直，双手自然下垂，全身完整可见，居中，身体呈椭圆",
    "s4": "土豆戴白色厨师帽，站在画面左侧，伸手指向右侧蓝色桌子上一盘金黄的薯条",
    "s5": "土豆戴棕色草帽，坐在一辆红色小汽车里，双手握着方向盘，汽车停在草地上",
}


def post(body: dict) -> dict:
    key = os.environ.get("ANTHROPIC_AUTH_TOKEN")
    if not key:
        sys.exit("缺少环境变量 ANTHROPIC_AUTH_TOKEN")
    req = urllib.request.Request(
        ENDPOINT,
        data=json.dumps(body).encode(),
        headers={"Authorization": f"Bearer {key}", "Content-Type": "application/json"},
    )
    try:
        with urllib.request.urlopen(req, timeout=300) as resp:
            data = json.load(resp)
    except urllib.error.HTTPError as exc:
        raise RuntimeError(f"HTTP {exc.code}: {exc.read().decode()[:300]}") from exc
    if "error" in data:
        raise RuntimeError(data["error"])
    return data


def retry(fn, label):
    for attempt in range(3):
        try:
            return fn()
        except Exception as exc:
            print(f"  {label} 第 {attempt + 1} 次失败: {exc}")
            time.sleep(3 * (attempt + 1))
    return None


def ref_as_base64() -> str:
    """定妆图压成 JPEG 再转 base64 —— 原始 PNG 太大，请求体会超限。"""
    im = Image.open(REF_PATH)
    im.thumbnail((1024, 1365))
    buf = io.BytesIO()
    im.convert("RGB").save(buf, "JPEG", quality=88)
    return base64.b64encode(buf.getvalue()).decode()


def main() -> None:
    os.makedirs(OUT_DIR, exist_ok=True)

    if not os.path.exists(REF_PATH):
        print("① 生成角色定妆图…")
        data = retry(lambda: post({"model": MODEL, "prompt": REF_PROMPT, "size": SIZE}), "定妆图")
        if not data:
            sys.exit("定妆图生成失败")
        urllib.request.urlretrieve(data["data"][0]["url"], REF_PATH)
        print(f"   ✓ {os.path.relpath(REF_PATH)}")
    else:
        print(f"① 复用已有定妆图 {os.path.relpath(REF_PATH)}")

    ref = ref_as_base64()
    print(f"② 以定妆图为参考生成 5 张场景图（参考图 base64 {len(ref)} 字符）…")

    failed = []
    for name, scene in SCENES.items():
        prompt = (
            f"{STYLE}。画面中是参考图里同一个土豆角色，{scene}。"
            "四肢保持纯黑色细线条，无填充色。"
            "角色完整可见、位于画面中下部，画面上方三分之一留出纯净天空，不放置任何物体"
        )
        data = retry(
            lambda p=prompt: post({"model": MODEL, "prompt": p, "size": SIZE, "watermark": False,
                                   "image": f"data:image/jpeg;base64,{ref}"}),
            name,
        )
        if not data:
            failed.append(name)
            print(f"✗ {name}")
            continue
        dest = os.path.join(OUT_DIR, f"{name}.png")
        urllib.request.urlretrieve(data["data"][0]["url"], dest)
        print(f"✓ {name} → {os.path.relpath(dest)}")

    if failed:
        sys.exit(f"以下未生成：{', '.join(failed)}")


if __name__ == "__main__":
    main()
