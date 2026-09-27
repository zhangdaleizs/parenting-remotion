#!/usr/bin/env python3
"""抹掉参考视频插画上方的旁白小字（背景纯白，填白即可）。

参考片的插画区构图规律：旁白小字在上、插画主体在下，中间留白。
所以「顶部连续文字带 + 其后有明显空白带」可判定为旁白小字。

用法:
  python3 clean_caption.py <输入目录> <输出目录> [--dry-run]
  python3 clean_caption.py in/ out/ --dry-run   # 只报告检测结果不写文件
"""
import sys
from pathlib import Path

import numpy as np
from PIL import Image

DARK = 160          # 灰度阈值：低于此值算「有内容」
BLANK_ROWS = 15     # 连续多少空白行算文字带结束
MAX_BAND_H = 90     # 文字带最大高度，超过认为不是旁白小字
PAD = 8             # 填白外扩像素


def content_blocks(rows, h):
    """按空白带把图像切成若干内容块，返回 [(y0, y1), ...]"""
    blocks, y = [], 0
    while y < h:
        if rows[y] == 0:
            y += 1
            continue
        start = y
        blank = 0
        while y < h:
            if rows[y] == 0:
                blank += 1
                if blank >= BLANK_ROWS:
                    break
            else:
                blank = 0
            y += 1
        blocks.append((start, y - blank))
        y += 1
    return blocks


def detect_text_band(img: Image.Image):
    """返回 (y0, y1, x0, x1) 旁白小字外接框；判定不出来返回 None

    旁白小字特征：一个独立内容块、位于上半部、高度 1-2 行、
    且横向铺开（不像插画那样的实心块）。
    """
    g = np.array(img.convert("L"))
    h, w = g.shape
    dark = g < DARK
    rows = dark.sum(axis=1)

    for y0, y1 in content_blocks(rows, h):
        if y0 >= h * 0.55:          # 只看上半部
            break
        bh = y1 - y0
        if bh < 8 or bh > MAX_BAND_H:
            continue
        band = dark[y0:y1, :]
        cols = np.where(band.sum(axis=0) > 0)[0]
        if len(cols) == 0:
            continue
        x0, x1 = int(cols[0]), int(cols[-1])
        # 文字是细笔画：块内深色像素占比低；插画/色块占比高
        density = band.sum() / max(1, bh * (x1 - x0 + 1))
        if density > 0.45:
            continue
        return (y0, y1, x0, x1)
    return None


def whiten(img: Image.Image, box) -> Image.Image:
    y0, y1, x0, x1 = box
    a = np.array(img)
    ya, yb = max(0, y0 - PAD), min(a.shape[0], y1 + PAD)
    xa, xb = max(0, x0 - PAD), min(a.shape[1], x1 + PAD)
    a[ya:yb, xa:xb, :3] = 255
    return Image.fromarray(a)


def main():
    if len(sys.argv) < 3:
        print(__doc__)
        sys.exit(1)
    in_dir, out_dir = Path(sys.argv[1]), Path(sys.argv[2])
    dry = "--dry-run" in sys.argv
    out_dir.mkdir(parents=True, exist_ok=True)

    for f in sorted(in_dir.glob("*.png")):
        img = Image.open(f)
        box = detect_text_band(img)
        if box is None:
            print(f"{f.name}: 未检测到旁白小字（原样输出）")
            out = img
        else:
            print(f"{f.name}: 抹除 y={box[0]}-{box[1]} x={box[2]}-{box[3]}")
            out = whiten(img, box)
        if not dry:
            out.save(out_dir / f.name)


if __name__ == "__main__":
    main()
