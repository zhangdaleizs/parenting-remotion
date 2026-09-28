#!/usr/bin/env python3
"""从 emoji 矢量库取素材 —— 给单词卡找白底 / 透明底缩略图。

**什么时候该用这个，而不是 find_images.py（图库实拍图）**

  emoji 覆盖**具象词**：水果 / 蔬菜 / 动物 / 天气 / 交通 / 日常物品。
  这类词用 emoji 完胜实拍图 ——
    · 风格绝对统一（同一套设计语言），不会像 Commons 那样混进料理成品、田间植株
    · 天然透明底，直接浮在卡片底色上，不用抠图、不会留白方块
    · 矢量可缩放，104px 小图不糊；单张 ~1KB（实拍 PNG 要 190KB）
    · 授权干净（Twemoji CC-BY 4.0 / OpenMoji CC-BY-SA 4.0）

  emoji **覆盖不了抽象词**：`sour` / `crispy` / `greasy` / `mild` 这类味道、
  性质词基本没有对应 emoji（实测 gemoji 索引里 `sour` 命中 0 条）。
  这类词仍走 `word-list-card/scripts/find_images.py` 图库或 AI 生图。

**两个源的区别**（同一批词各出一张 sheet 对比，别凭感觉选）
  twemoji   扁平纯色块，无描边。小尺寸下最清晰，是事实标准
  openmoji  填色 + 深色描边（stroke-width 2），更「手绘卡通」
  两者风格不兼容，**一条片子只用一套**。

用法：
  # 1. 查候选：按名称 / 别名 / 标签模糊搜 gemoji 索引
  python3 fetch_emoji.py list apple banana "green apple" carrot

  # 2. 拼总览图：下载 → 转 PNG → 贴 contact sheet，Read 它确认风格
  python3 fetch_emoji.py sheet --out /tmp/emoji --set twemoji \\
      --picks "s01_apple=🍎" "s02_banana=🍌" "s03_orange=🍊"

  # 3. 下载到项目（默认 SVG；加 --png 转位图）
  python3 fetch_emoji.py fetch --dest ./public/thumbs \\
      --picks "s01_apple=🍎" "s02_banana=🍌" "s03_orange=🍊"

  # picks 的值写 emoji 字符或名称都行：`s01_apple=🍎` 等价于 `s01_apple=apple`

**为什么默认出 SVG**：Remotion 的 `<Img>` 直接吃 SVG，无需任何转换工具，
文件还小两个数量级。`--png` 只在需要兼容 `objectFit: cover` 的旧写法时用，
且**依赖 macOS 的 qlmanage**（本机没有 rsvg-convert / cairosvg / inkscape）。
"""
import argparse
import json
import os
import pathlib
import shutil
import subprocess
import sys
import tempfile
import time
import urllib.request

UA = {"User-Agent": "parenting-remotion/1.0 (educational video)"}

# ⚠️ 两源的命名规则都是**去掉 FE0F**（变体选择符），只是大小写不同：
#    实测 twemoji/1f336.svg 200 而 1f336-fe0f.svg 404；
#    openmoji/1F336.svg 200 而 1F336-FE0F.svg 403。
#    ZWJ(U+200D) 保留 —— 组合 emoji（👨👩👧 这类）靠它连接。
SOURCES = {
    "twemoji": "https://cdn.jsdelivr.net/gh/jdecked/twemoji@latest/assets/svg/{}.svg",
    "openmoji": "https://cdn.jsdelivr.net/gh/hfg-gmuend/openmoji@latest/color/svg/{}.svg",
}
GEMOJI_URL = "https://raw.githubusercontent.com/github/gemoji/master/db/emoji.json"
CACHE = pathlib.Path(tempfile.gettempdir()) / "emoji_cache"


def fetch(url, tries=3, timeout=30):
    for i in range(tries):
        try:
            req = urllib.request.Request(url, headers=UA)
            return urllib.request.urlopen(req, timeout=timeout).read()
        except urllib.error.HTTPError as e:
            if e.code == 404:
                raise            # 命名不对，别重试，交给上层换一个名字试
            if i == tries - 1:
                raise
            time.sleep(1.0 * (i + 1))
        except Exception:
            if i == tries - 1:
                raise
            time.sleep(1.0 * (i + 1))


def index():
    """gemoji 索引：名称 / 别名 / 标签 → emoji 字符。首次下载后缓存。"""
    CACHE.mkdir(parents=True, exist_ok=True)
    f = CACHE / "gemoji.json"
    if not f.exists():
        f.write_bytes(fetch(GEMOJI_URL))
    data = json.loads(f.read_text(encoding="utf-8"))
    by_name = {}
    for e in data:
        for k in [e.get("description", ""), *e.get("aliases", []), *e.get("tags", [])]:
            k = (k or "").strip().lower()
            if k and k not in by_name:
                by_name[k] = e["emoji"]
    return data, by_name


def is_emoji_char(s):
    """picks 的值是 emoji 字符还是名称。emoji 基本都在 U+2000 以上。"""
    return any(ord(c) > 0x2000 for c in s)


def codepoints(ch, upper, keep_fe0f=False):
    cps = [ord(c) for c in ch if keep_fe0f or ord(c) != 0xFE0F]
    fmt = "%04X" if upper else "%x"
    return "-".join(fmt % c for c in cps)


def download_svg(ch, source):
    """下载该 emoji 的 SVG。命名规则可能因 emoji 类型而异，去 FE0F 与保留各试一次。"""
    tpl, upper = SOURCES[source], source == "openmoji"
    last = None
    for keep in (False, True):
        url = tpl.format(codepoints(ch, upper, keep))
        try:
            return url, fetch(url)
        except Exception as e:
            last = e
    raise RuntimeError(f"{source} 取不到 {ch!r}（{codepoints(ch, upper)}）: {last}")


def svg_to_png(svg_bytes, size, out_dir):
    """SVG → PNG（透明底）。走 macOS 的 qlmanage —— 本机没装 rsvg-convert/cairosvg。"""
    if not shutil.which("qlmanage"):
        raise RuntimeError(
            "本机没有 qlmanage，无法转 PNG。改用默认的 SVG 输出（Remotion 直接支持），"
            "或自行安装 cairosvg：pip install cairosvg"
        )
    out_dir.mkdir(parents=True, exist_ok=True)
    with tempfile.NamedTemporaryFile(suffix=".svg", delete=False) as t:
        t.write(svg_bytes)
        tmp_svg = t.name
    try:
        subprocess.run(
            ["qlmanage", "-t", "-s", str(size), "-o", str(out_dir), tmp_svg],
            check=True, capture_output=True,
        )
        # qlmanage 产物名 = <原文件名>.png
        return out_dir / (os.path.basename(tmp_svg) + ".png")
    finally:
        os.unlink(tmp_svg)


def parse_picks(picks, by_name):
    """`key=🍎` / `key=apple` → [(key, emoji 字符)]"""
    out = []
    for spec in picks:
        key, _, val = spec.partition("=")
        val = val.strip()
        if not val:
            sys.exit(f"picks 格式错误：{spec!r}（应为 key=emoji字符或key=名称）")
        if not is_emoji_char(val):
            hit = by_name.get(val.lower())
            if not hit:
                sys.exit(f"gemoji 里没有 {val!r}。跑 `list {val}` 看候选，或直接写 emoji 字符")
            val = hit
        out.append((key, val))
    return out


def cmd_list(a):
    """按名称 / 别名 / 标签搜候选。抽象词命中少是正常的 —— 那说明该走图库。"""
    data, by_name = index()
    for q in a.terms:
        q = q.lower()
        hits = [(k, v) for k, v in by_name.items() if q in k]
        # 精确命中排前面，再按名称长度（短的更通用）
        hits.sort(key=lambda kv: (kv[0] != q, len(kv[0])))
        print(f"\n{q!r} → {len(hits)} 条")
        for k, v in hits[:a.limit]:
            print(f"  {v}  {k}")
        if not hits:
            print("  （无命中 —— 抽象词/生僻词 emoji 覆盖不到，走 find_images.py 图库）")


def cmd_sheet(a):
    from PIL import Image, ImageDraw
    picks = parse_picks(a.picks, index()[1])
    out = pathlib.Path(a.out)
    out.mkdir(parents=True, exist_ok=True)
    tiles = []
    for key, ch in picks:
        try:
            _, svg = download_svg(ch, a.set)
            png = svg_to_png(svg, a.cell * 2, out / "_tmp")
            im = Image.open(png).convert("RGBA")
            im.thumbnail((a.cell - 8, a.cell - 8))
            tiles.append((key, ch, im))
        except Exception as e:
            print(f"  ! {key}: {e}", file=sys.stderr)
            tiles.append((key, ch, None))

    cols, cell, lbl = a.cols, a.cell, 24
    rows = max(1, (len(tiles) + cols - 1) // cols)
    sheet = Image.new("RGB", (cols * cell, rows * (cell + lbl)), (245, 245, 245))
    dr = ImageDraw.Draw(sheet)
    for i, (key, ch, im) in enumerate(tiles):
        cx, cy = (i % cols) * cell, (i // cols) * (cell + lbl)
        if im:
            # 透明底贴在浅灰上：emoji 是彩色的，边缘透明不影响辨认
            sheet.paste(im, (cx + (cell - im.width) // 2, cy + 4), im)
        else:
            dr.rectangle([cx + 2, cy + 2, cx + cell - 2, cy + cell - 2], fill=(228, 205, 205))
        # 标签只写 key —— PIL 默认字体渲染不出 emoji，硬写会变成豆腐块
        dr.text((cx + 4, cy + cell + 4), key, fill=(0, 0, 0))
    path = out / f"sheet_{a.set}.png"
    sheet.save(path)
    shutil.rmtree(out / "_tmp", ignore_errors=True)
    print(f"\n{len(tiles)} 张 → {path}   （Read 它确认风格；{a.set}）")
    print("风格不满意就换 --set openmoji / twemoji 再出一张对比")


def cmd_fetch(a):
    picks = parse_picks(a.picks, index()[1])
    dest = pathlib.Path(a.dest)
    dest.mkdir(parents=True, exist_ok=True)
    for key, ch in picks:
        url, svg = download_svg(ch, a.set)
        if a.png:
            png = svg_to_png(svg, a.size, dest / "_tmp")
            png.rename(dest / f"{key}.png")
            shutil.rmtree(dest / "_tmp", ignore_errors=True)
            print(f"  {ch} {key} → {dest}/{key}.png  ({a.size}px, 透明底)")
        else:
            (dest / f"{key}.svg").write_bytes(svg)
            print(f"  {ch} {key} → {dest}/{key}.svg  ({len(svg)}B, 矢量)")
    print(f"\n授权：{'Twemoji CC-BY 4.0' if a.set == 'twemoji' else 'OpenMoji CC-BY-SA 4.0'}"
          f"（免费用，商用需按协议署名，写进 docs/release-info.md）")
    if not a.png:
        print("Remotion 里直接把 config 的 img 字段写成 `<key>.svg` 即可，无需转换")


def main():
    ap = argparse.ArgumentParser(description="从 emoji 矢量库取单词卡素材")
    sub = ap.add_subparsers(dest="cmd", required=True)

    l = sub.add_parser("list", help="按名称/别名/标签搜候选")
    l.add_argument("terms", nargs="+", help="关键词，如 apple carrot")
    l.add_argument("--limit", type=int, default=12, help="每个词最多显示多少条（默认 12）")
    l.set_defaults(func=cmd_list)

    s = sub.add_parser("sheet", help="拼总览图供肉眼确认风格")
    s.add_argument("--picks", nargs="+", required=True, help='如 "s01_apple=🍎"')
    s.add_argument("--out", required=True, help="输出目录")
    s.add_argument("--set", default="twemoji", choices=list(SOURCES), help="emoji 库")
    s.add_argument("--cell", type=int, default=160, help="每格边长（默认 160）")
    s.add_argument("--cols", type=int, default=6, help="列数（默认 6）")
    s.set_defaults(func=cmd_sheet)

    f = sub.add_parser("fetch", help="下载到项目")
    f.add_argument("--picks", nargs="+", required=True, help='如 "s01_apple=🍎"')
    f.add_argument("--dest", required=True, help="输出目录（如 ./public/thumbs）")
    f.add_argument("--set", default="twemoji", choices=list(SOURCES), help="emoji 库")
    f.add_argument("--png", action="store_true",
                   help="转 PNG 而非 SVG（依赖 macOS qlmanage）")
    f.add_argument("--size", type=int, default=320, help="--png 时的边长（默认 320）")
    f.set_defaults(func=cmd_fetch)

    a = ap.parse_args()
    a.func(a)


if __name__ == "__main__":
    main()
