#!/usr/bin/env python3
"""图库搜图工具 —— 给「单词列表高亮型」找单词卡缩略图。

两个**免 key** 来源（都在意商用授权，可筛 CC0 / Public Domain / CC BY）：
  1. Wikimedia Commons  https://commons.wikimedia.org/w/api.php
     ⚠️ 缩略图只有固定尺寸档；把 URL 里的 250px 改成 400/640/800 会被
        `400 Use thumbnail sizes listed on ...` 拒绝。用 API 给的尺寸即可
        （缩略图最终只显示 ~92px，250px 源足够）。
  2. Openverse          https://api.openverse.org/v1/images/
     支持 `license=cc0,pdm,by` 过滤，不用 key。图多来自 Flickr，质量参差，
     常有「料理成品/田间植株」混进来。

**为什么两步走**：搜出来的东西光看标题判断不了（搜 `loofah` 会返回一堆
丝瓜藤和菜架子）。必须先拼成 contact sheet 人眼看一遍，再按编号取原图。

用法：
  # 第 1 步：每个词出一张候选总览图（6 列），Read 它来挑
  python3 find_images.py sheet --out /tmp/cand \\
      --terms "daikon=daikon radish" "carrot=carrot vegetable" "loofah=luffa"

  # 第 2 步：按挑中的编号下载原图、中心裁方、缩到 --size
  python3 find_images.py fetch --out /tmp/cand \\
      --picks "daikon=0" "carrot=3" "loofah=0" --size 256 --dest ./public/thumbs

  # 词名可用 --prefix 加统一前缀（如 s01_ / s02_）
  ... --picks "daikon=0" --prefix-map "daikon=s01_daikon"

候选清单存在 <out>/cands.json，`fetch` 读它取原图 URL。
"""
import argparse
import json
import os
import pathlib
import sys
import time
import urllib.parse
import urllib.request
from concurrent.futures import ThreadPoolExecutor

UA = {"User-Agent": "parenting-remotion/1.0 (educational video)"}
# 长宽比过滤：太宽的图中心裁方后只剩一条，主体会丢。
# ⚠️ 阈值不能卡太死：相机原生比例就是 **3:2(1.5) 和 2:3(0.667)**，
#    曾经用 0.72–1.4 把 Pexels 78–88% 的图直接滤掉（实测 40 张只过 5-9 张）。
#    3:2 裁方还能保留 67% 宽度，不算极端，所以放宽到 0.6–1.8。
AR_MIN, AR_MAX = 0.6, 1.8


def load_key(name):
    """按「环境变量 → 向上逐级找 .env」的顺序取 key。

    .env 放在仓库根（已被 .gitignore 排除），脚本从自身位置向上找，
    所以不管从哪个目录调用都能读到。
    """
    v = os.environ.get(name)
    if v:
        return v.strip()
    here = pathlib.Path(__file__).resolve().parent
    for d in [here, *here.parents]:
        f = d / ".env"
        if not f.exists():
            continue
        for line in f.read_text(encoding="utf-8").splitlines():
            line = line.strip()
            if line.startswith(name + "="):
                return line.split("=", 1)[1].strip().strip("'\"")
    return ""


def fetch(url, tries=3, timeout=35):
    for i in range(tries):
        try:
            req = urllib.request.Request(url, headers=UA)
            return urllib.request.urlopen(req, timeout=timeout).read()
        except Exception:
            if i == tries - 1:
                raise
            time.sleep(1.0 * (i + 1))


def _commons_pages(d, src):
    """Commons 返回结构 → 候选列表（search 与 categorymembers 两种来源共用）。"""
    out = []
    for p in (d.get("query", {}).get("pages", {}) or {}).values():
        ii = (p.get("imageinfo") or [{}])[0]
        t = ii.get("thumburl")
        if not t or t.lower().endswith((".svg", ".gif")):
            continue
        em = ii.get("extmetadata", {})
        lic = em.get("LicenseShortName", {}).get("value", "?")
        # 不做授权过滤：全部返回，授权名标在 contact sheet 上由人工审。
        # ⚠️ 但要知道 Commons 结果里 CC BY-SA 占比很高，share-alike 对商用账号有传染性
        # （见 CLAUDE.md 坑表），挑图时留意 sheet 上的标注。
        out.append({
            "title": p["title"][5:],
            "thumb": t.split("?")[0],          # 去 query，否则后续会 400
            # orig 必须是**原图**：曾经这里也填 thumb（240px 缩略图），
            # 导致最终落地图只有 240px，缩略图一放大就糊
            "orig": (ii.get("url") or t).split("?")[0],
            "lic": lic,
            "src": src,
        })
    return out


def search_commons(q, n, quality=False):
    """自由文本搜索。

    ⚠️ 自由文本匹配的是**词**不是**主体** —— 搜 `apple` 会返回苹果叶、苹果树、
    糖苹果、甚至 Apple 公司产品；搜 `grape` 会返回英国酒吧（"Bunch of Grapes"
    是常见店名）。要精确命中主体，优先用 search_commons_category()。
    """
    if quality:
        # Commons 的「Quality images」是人工评审过的认证分类，叠加后基本能滤掉随手拍
        q = f'{q} incategory:"Quality images"'
    url = "https://commons.wikimedia.org/w/api.php?" + urllib.parse.urlencode({
        "action": "query", "generator": "search", "gsrsearch": q,
        "gsrnamespace": "6", "gsrlimit": str(n), "prop": "imageinfo",
        "iiprop": "url|extmetadata", "iiurlwidth": "240", "format": "json",
    })
    try:
        d = json.loads(fetch(url))
    except Exception as e:
        print(f"    commons 搜索失败 {q!r}: {e}", file=sys.stderr)
        return []
    return _commons_pages(d, "commons")


def search_commons_category(cat, n):
    """按 Commons 分类取图 —— 比自由文本精确得多。

    常用分类形态（实测）：
      `Apples on white background`(84)  `Bananas on white background`(63)
        → 干净的白底产品图，做缩略图最理想
      `Malus domestica (fruit)`(44)  `Mangifera indica`(343)  `Citrus sinensis`(167)
        → 物种分类，量大但混有花/叶/树，配 quality=True 的自由文本查询一起用更好
    ⚠️ 白底分类**覆盖不全** —— 苹果香蕉有，橙子/葡萄/樱桃/猕猴桃实测没有。
    """
    url = "https://commons.wikimedia.org/w/api.php?" + urllib.parse.urlencode({
        "action": "query", "generator": "categorymembers",
        "gcmtitle": f"Category:{cat}", "gcmtype": "file", "gcmlimit": str(n),
        "prop": "imageinfo", "iiprop": "url|extmetadata", "iiurlwidth": "240",
        "format": "json",
    })
    try:
        d = json.loads(fetch(url))
    except Exception as e:
        print(f"    commons 分类失败 {cat!r}: {e}", file=sys.stderr)
        return []
    return _commons_pages(d, "commons-cat")


def search_pexels(q, n):
    """Pexels —— 专业图库，食物/日常物品的图质远高于 Commons。

    需要免费 key（https://www.pexels.com/api/），写在仓库根 `.env` 的
    `PEXELS_API_KEY=` 或同名环境变量里。没有 key 时静默跳过（不影响其它源）。

    ⚠️ Pexels License 允许免费商用且**不要求署名**，比 Commons 的 CC BY 省事。
    """
    key = load_key("PEXELS_API_KEY")
    if not key:
        return []
    url = "https://api.pexels.com/v1/search?" + urllib.parse.urlencode({
        "query": q, "per_page": str(min(n, 80)),
    })
    try:
        req = urllib.request.Request(url, headers={**UA, "Authorization": key})
        d = json.loads(urllib.request.urlopen(req, timeout=35).read())
    except Exception as e:
        print(f"    pexels 搜索失败 {q!r}: {e}", file=sys.stderr)
        return []
    out = []
    for r in d.get("photos", []):
        src = r.get("src") or {}
        if not src.get("medium"):
            continue
        out.append({
            "title": (r.get("alt") or f"pexels {r.get('id')}")[:60],
            "thumb": src["medium"],            # 350px，拼 contact sheet 用
            "orig": src.get("large") or src["original"],   # 940px，落地够用
            "lic": "Pexels License",
            "src": "pexels",
        })
    return out


def search_openverse(q, n):
    url = "https://api.openverse.org/v1/images/?" + urllib.parse.urlencode({
        "q": q, "license": "cc0,pdm,by", "page_size": str(n), "mature": "false",
    })
    try:
        d = json.loads(fetch(url))
    except Exception as e:
        print(f"    openverse 搜索失败 {q!r}: {e}", file=sys.stderr)
        return []
    out = []
    for r in d.get("results", []):
        if (r.get("width") or 0) < 400:
            continue
        out.append({
            "title": (r.get("title") or "")[:48],
            "thumb": r.get("thumbnail") or r["url"],
            "orig": r["url"],
            "lic": r.get("license", "?"),
            "src": "openverse",
        })
    return out


def square(im, size=None):
    """中心裁方；只在比 size 大时缩小（不放大，放大只会糊）"""
    from PIL import Image
    w, h = im.size
    s = min(w, h)
    im = im.crop(((w - s) // 2, (h - s) // 2, (w - s) // 2 + s, (h - s) // 2 + s))
    if size and s > size:
        im = im.resize((size, size), Image.LANCZOS)
    return im


def cmd_sheet(a):
    from PIL import Image, ImageDraw
    from io import BytesIO
    out = pathlib.Path(a.out)
    out.mkdir(parents=True, exist_ok=True)
    allc = {}
    for spec in a.terms:
        name, _, q = spec.partition("=")
        rows = []
        for one in q.split("|"):                      # 一个词可给多个查询式
            one = one.strip()
            if one.startswith("cat:"):                # cat:Apples on white background
                # 分类检索：精确命中主体，是质量最好的一路
                rows += search_commons_category(one[4:].strip(), a.per_source)
            else:
                rows += search_pexels(one, a.per_source)     # 有 key 才生效，质量最好
                rows += search_commons(one, a.per_source, quality=a.quality)
                time.sleep(1.0)                        # 别把 Commons 打限流
                rows += search_openverse(one, a.per_source)
            time.sleep(0.8)
        seen, uniq = set(), []
        for r in rows:
            if r["thumb"] in seen:
                continue
            seen.add(r["thumb"])
            uniq.append(r)
        uniq = uniq[:a.limit]
        allc[name] = uniq

        def load(r):
            try:
                im = Image.open(BytesIO(fetch(r["thumb"], tries=2))).convert("RGB")
                w, h = im.size
                if not (AR_MIN <= w / h <= AR_MAX):
                    return None
                return square(im, 200)
            except Exception:
                return None

        with ThreadPoolExecutor(6) as ex:
            tiles = list(ex.map(load, uniq))

        COLS, CELL, PAD, LBL = 6, 200, 6, 20
        n = len(tiles)
        rn = max(1, (n + COLS - 1) // COLS)
        sheet = Image.new("RGB", (COLS * (CELL + PAD) + PAD, rn * (CELL + PAD + LBL) + PAD), (245, 245, 245))
        d = ImageDraw.Draw(sheet)
        for i, t in enumerate(tiles):
            cx = PAD + (i % COLS) * (CELL + PAD)
            cy = PAD + (i // COLS) * (CELL + PAD + LBL)
            if t:
                sheet.paste(t, (cx, cy))
            else:
                d.rectangle([cx, cy, cx + CELL, cy + CELL], fill=(228, 205, 205))
            d.text((cx + 3, cy + CELL + 3), f"{i} {uniq[i]['lic'][:16]}", fill=(0, 0, 0))
        sheet.save(out / f"sheet_{name}.png")
        print(f"  {name}: {n} 张候选 → {out}/sheet_{name}.png"
              f"（灰块 = 长宽比不合格被跳过）")

    json.dump(allc, open(out / "cands.json", "w"), ensure_ascii=False, indent=1)
    print(f"\n候选清单 → {out}/cands.json")
    print("下一步：Read 各 sheet_*.png 挑图，然后跑 `fetch --picks \"<词>=<编号>\"`")


def cmd_fetch(a):
    from PIL import Image
    from io import BytesIO
    out = pathlib.Path(a.out)
    cands = json.load(open(out / "cands.json"))
    dest = pathlib.Path(a.dest)
    dest.mkdir(parents=True, exist_ok=True)
    name_map = {}
    for spec in (a.prefix_map or []):
        k, _, v = spec.partition("=")
        name_map[k] = v

    for spec in a.picks:
        name, _, idx = spec.partition("=")
        idx = int(idx)
        row = cands[name][idx]
        im = Image.open(BytesIO(fetch(row["orig"]))).convert("RGB")
        im = square(im, a.size)
        out_name = name_map.get(name, name) + ".png"
        im.save(dest / out_name)
        print(f"  {name}#{idx} → {dest}/{out_name}  {im.size}  [{row['lic']}] {row['title'][:40]}")


def main():
    ap = argparse.ArgumentParser(description="图库搜图（Commons + Openverse，免 key）")
    sub = ap.add_subparsers(dest="cmd", required=True)

    s = sub.add_parser("sheet", help="出候选总览图")
    s.add_argument("--out", required=True, help="候选目录")
    s.add_argument("--terms", nargs="+", required=True,
                   help='词名=查询式，多个查询式用 | 分隔。'
                        '查询式加 cat: 前缀走 Commons 分类检索（最精确），'
                        '如 "apple=cat:Apples on white background|red apple fruit"')
    s.add_argument("--limit", type=int, default=24, help="每词最多留多少候选（默认 24）")
    s.add_argument("--per-source", type=int, default=12, help="每个来源每次取多少（默认 12）")
    s.add_argument("--quality", action="store_true",
                   help='叠加 Commons 的 incategory:"Quality images" 人工认证，滤掉随手拍')
    s.set_defaults(func=cmd_sheet)

    f = sub.add_parser("fetch", help="按编号取原图裁方")
    f.add_argument("--out", required=True, help="候选目录（含 cands.json）")
    f.add_argument("--picks", nargs="+", required=True, help='词名=编号，如 "daikon=0"')
    f.add_argument("--size", type=int, default=256, help="输出边长（默认 256，只缩不放）")
    f.add_argument("--dest", required=True, help="输出目录")
    f.add_argument("--prefix-map", nargs="*", help='改名，如 "daikon=s01_daikon"')
    f.set_defaults(func=cmd_fetch)

    a = ap.parse_args()
    a.func(a)


if __name__ == "__main__":
    main()
