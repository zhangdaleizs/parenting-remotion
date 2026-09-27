#!/usr/bin/env python3
"""把生成好的插画排版成成片素材：垂直压缩 + 底部对齐，把角色压到字幕之下。

Seedream 不听「上方留出天空」这类构图指令，角色头顶会顶进字幕区。画布和插画同为 3:4，
想在不露白的前提下把角色压低，就只剩垂直压缩这一条路：宽度铺满、高度压到 84%、
底部对齐，顶部露出的那条用插画自己的天空色补（天空本来就均匀，接缝看不出来）。

试过但不收敛的两个方向，别再走：
  - 模糊放大层填留白 → 主体边缘会留一圈看得出来的「画中画」边界
  - 四周镜像填充   → 镜像条会把角色头顶一起翻上去，顶部出现重影

代价：角色垂直方向被压扁约 16%。土豆本来就圆，实测观感可接受。

输出：public/slides/s*.png（1080×1440，铺满，Remotion 里直接 objectFit: cover）

用法：python3 scripts/layout_slides.py
"""
import os

from PIL import Image, ImageStat

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, "assets", "slides_src")
DST = os.path.join(ROOT, "public", "slides")

W, H = 1080, 1440
# scale 由最坏情况反推：s4 的厨师帽最高（占画布 8%），要压到 y>320px（字幕底）就得 ≤0.845
DEFAULT = {"scale": 0.84}
# s2 的厨师帽特别高，需要压得更狠
OVERRIDES = {"s2": {"scale": 0.78}}


def sky_color(im: Image.Image) -> tuple[int, int, int]:
    """取插画顶部 60 行的平均色 —— 天空在这个形态里是均匀的，纯色补上不会有色差"""
    return tuple(int(v) for v in ImageStat.Stat(im.crop((0, 0, W, 60))).mean)


def main() -> None:
    os.makedirs(DST, exist_ok=True)
    for name in ["s1", "s2", "s3", "s4", "s5"]:
        src_path = os.path.join(SRC, f"{name}.png")
        if not os.path.exists(src_path):
            raise SystemExit(f"缺少 {src_path} —— 先跑 gen_slides.py")
        fit = OVERRIDES.get(name, DEFAULT)
        im = Image.open(src_path).convert("RGB")
        ih = int(H * fit["scale"])
        canvas = Image.new("RGB", (W, H), sky_color(im))
        canvas.paste(im.resize((W, ih), Image.LANCZOS), (0, H - ih))
        canvas.save(os.path.join(DST, f"{name}.png"))
        print(f"✓ {name}  scale={fit['scale']} → public/slides/{name}.png")


if __name__ == "__main__":
    main()
