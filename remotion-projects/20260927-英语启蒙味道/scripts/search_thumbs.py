#!/usr/bin/env python3
"""从 Wikimedia Commons 搜候选缩略图，拼成 contact sheet 供人工挑选。

用法:
  python3 scripts/search_thumbs.py search          # 按 KEYWORDS 搜一遍 → /tmp/thumbsearch/*.jpg + sheet_*.png
  python3 scripts/search_thumbs.py crop            # 把 picks.json 选中的原图裁成方形 → public/thumbs/

为什么不能只看搜索结果标题：Commons 搜 `loofah` 全是丝瓜藤/菜地，搜食材常出料理成品。
必须拼 sheet 用肉眼过一遍（见 CLAUDE.md 坑表「图库选图」）。
"""
import json
import os
import sys
import time
import urllib.parse
import urllib.request

from PIL import Image

UA = "parenting-remotion-thumb-picker/1.0 (local educational project)"
OUT = "/tmp/thumbsearch"
API = "https://commons.wikimedia.org/w/api.php"

# 每张卡的主题词。key 与 config.ts 里的 img 字段前缀对应。
KEYWORDS = {
    "s01_sweet": "colorful macarons",
    "s02_sour": "lemon slices",
    "s03_bitter": "bitter melon momordica",
    "s04_spicy": "red chili pepper",
    "s05_salty": "table salt",
    "s06_crispy": "cookies biscuits baked",
    "s07_soft": "marshmallow candy",
    "s08_juicy": "watermelon slice",
    "s09_greasy": "fried chicken",
    "s10_tough": "steak beef grilled",
    "s11_mild": "congee rice porridge",
    "s12_burned": "two pieces of burnt toast",
}

PER_KEY = 12
SEARCH_LIMIT = 48  # 先多搜再按授权过滤，过滤后候选才不会太少
MIN_W = 400
ASPECT = (0.72, 1.4)


def api(params):
    url = API + "?" + urllib.parse.urlencode(params)
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    with urllib.request.urlopen(req, timeout=40) as r:
        return json.load(r)


def licenses(titles):
    """批量取授权短名。一次可查 40 个标题，避免逐张请求。"""
    out = {}
    for i in range(0, len(titles), 40):
        d = api({"action": "query", "format": "json",
                 "titles": "|".join(titles[i:i + 40]),
                 "prop": "imageinfo", "iiprop": "extmetadata"})
        for p in ((d.get("query") or {}).get("pages") or {}).values():
            em = (p.get("imageinfo") or [{}])[0].get("extmetadata", {})
            out[p["title"]] = em.get("LicenseShortName", {}).get("value", "?")
    time.sleep(1.0)
    return out


def search(kw, limit=24):
    data = api({
        "action": "query", "format": "json",
        "generator": "search", "gsrsearch": f"filetype:bitmap {kw}",
        "gsrnamespace": "6", "gsrlimit": str(limit),
        "prop": "imageinfo", "iiprop": "url|size|mime", "iiurlwidth": "400",
    })
    pages = (data.get("query") or {}).get("pages") or {}
    cand = []
    for p in pages.values():
        ii = (p.get("imageinfo") or [{}])[0]
        w, h = ii.get("width"), ii.get("height")
        if not w or not h:
            continue
        if w < MIN_W or h < MIN_W:
            continue
        if not (ASPECT[0] <= w / h <= ASPECT[1]):
            continue
        cand.append({"title": p["title"], "w": w, "h": h,
                     "thumb": ii.get("thumburl"), "full": ii.get("url")})

    # 授权过滤：CC BY-SA 的 share-alike 对商用账号有传染性，一律排除
    lic = licenses([c["title"] for c in cand])
    out = []
    for c in cand:
        name = lic.get(c["title"], "?")
        if "SA" in name.upper():
            continue
        c["license"] = name
        out.append(c)
    return out


def download(url, path, tries=4):
    """Commons 对连续请求会回 429，退避重试。"""
    last = None
    for i in range(tries):
        try:
            req = urllib.request.Request(url, headers={"User-Agent": UA})
            with urllib.request.urlopen(req, timeout=60) as r, open(path, "wb") as f:
                f.write(r.read())
            return path
        except Exception as e:
            last = e
            time.sleep(2 * (i + 1))
    raise last


def contact_sheet(key, items, cell=260, cols=4):
    rows = (len(items) + cols - 1) // cols
    if not rows:
        return None
    sheet = Image.new("RGB", (cols * cell, rows * cell), (245, 245, 245))
    for i, it in enumerate(items):
        p = os.path.join(OUT, f"{key}_{i}.jpg")
        try:
            im = Image.open(p).convert("RGB")
        except Exception:
            continue
        im.thumbnail((cell - 8, cell - 8))
        x = (i % cols) * cell + (cell - im.width) // 2
        y = (i // cols) * cell + (cell - im.height) // 2
        sheet.paste(im, (x, y))
    path = os.path.join(OUT, f"sheet_{key}.png")
    sheet.save(path)
    return path


def do_search(only=None):
    os.makedirs(OUT, exist_ok=True)
    index = {}
    idx_path = os.path.join(OUT, "index.json")
    if only and os.path.exists(idx_path):
        with open(idx_path) as f:
            index = json.load(f)
    for key, kw in KEYWORDS.items():
        if only and key not in only:
            continue
        try:
            items = search(kw, SEARCH_LIMIT)[:PER_KEY]
        except Exception as e:
            print(f"  ! {key}: {e}")
            continue
        for i, it in enumerate(items):
            try:
                download(it["thumb"], os.path.join(OUT, f"{key}_{i}.jpg"))
            except Exception:
                pass
        s = contact_sheet(key, items)
        index[key] = items
        print(f"{key:12s} {len(items):2d} 张 → {s}")
    with open(os.path.join(OUT, "index.json"), "w") as f:
        json.dump(index, f, ensure_ascii=False, indent=2)


def do_crop():
    """按 picks.json（{key: 候选下标}）下载原图并方形裁切到 public/thumbs/"""
    with open(os.path.join(OUT, "index.json")) as f:
        index = json.load(f)
    with open(os.path.join(OUT, "picks.json")) as f:
        picks = json.load(f)
    dst = os.path.join(os.path.dirname(__file__), "..", "public", "thumbs")
    os.makedirs(dst, exist_ok=True)
    for key, idx in picks.items():
        it = index[key][idx]
        # 用搜图时已拿到的 400px 缩略图：最终只显示 96px，够用且不会被 429
        raw = os.path.join(OUT, f"{key}_pick.jpg")
        download(it["thumb"], raw)
        im = Image.open(raw)
        # 透明 PNG 直接 convert("RGB") 会把透明区变成黑块，必须先在白底上合成
        if im.mode in ("RGBA", "LA", "P"):
            im = im.convert("RGBA")
            bg = Image.new("RGBA", im.size, (255, 255, 255, 255))
            im = Image.alpha_composite(bg, im)
        im = im.convert("RGB")
        # 中心方裁（坑表：宽幅原图裁方后常常只剩中段，所以要肉眼确认过再裁）
        side = min(im.size)
        l = (im.width - side) // 2
        t = (im.height - side) // 2
        im = im.crop((l, t, l + side, t + side)).resize((320, 320), Image.LANCZOS)
        path = os.path.join(dst, f"{key}.png")
        im.save(path)
        print(f"{key} ← #{idx} {it['title']} → {path}")


if __name__ == "__main__":
    mode = sys.argv[1] if len(sys.argv) > 1 else "search"
    if mode == "search":
        do_search(set(sys.argv[2:]) or None)
    else:
        do_crop()
