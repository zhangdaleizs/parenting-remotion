#!/usr/bin/env python3
"""BGM search and download — NetEase Cloud Music + multi-platform search."""

import argparse
import json
import os
import re
import sys
import urllib.parse
import urllib.request
from typing import Dict, List, Optional

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
        "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    ),
    "Referer": "https://music.163.com",
}
DEFAULT_OUTDIR = os.path.join(os.getcwd(), "bgm")

# ============================================================
# NetEase API
# ============================================================

API_SEARCH = "https://music.163.com/api/search/get"
API_SONG_URL = "https://music.163.com/song/media/outer/url?id={}.mp3"


def search_netease(query: str, limit: int = 15) -> List[Dict]:
    """Search NetEase. Returns all results with fee info."""
    params = {"type": "1", "limit": str(limit), "s": query}
    url = API_SEARCH + "?" + urllib.parse.urlencode(params)
    req = urllib.request.Request(url, headers=HEADERS)
    with urllib.request.urlopen(req, timeout=10) as resp:
        data = json.loads(resp.read().decode("utf-8"))
    if data.get("code") != 200:
        return []

    tracks = []
    for s in data.get("result", {}).get("songs", []):
        song_id = s.get("id", 0)
        fee = s.get("fee", 0)
        artists = ",".join([a["name"] for a in s.get("artists", [])])
        album = s.get("album", {}).get("name", "")
        duration_ms = s.get("duration", 0)
        m, sec = divmod(duration_ms // 1000, 60)

        tracks.append({
            "id": song_id,
            "title": s.get("name", "Unknown"),
            "artist": artists,
            "album": album,
            "duration": f"{m}:{sec:02d}",
            "duration_sec": duration_ms // 1000,
            "fee": fee,
            "downloadable": fee == 0,
            "source": "netease",
        })
    return tracks


def download_netease(song_id: int, output_dir: str, filename: str = None):
    os.makedirs(output_dir, exist_ok=True)
    url = API_SONG_URL.format(song_id)
    filename = re.sub(r'[<>:"/\\|?*]', "_", filename or str(song_id))
    if not filename.endswith(".mp3"):
        filename += ".mp3"
    filepath = os.path.join(output_dir, filename)
    req = urllib.request.Request(url, headers=HEADERS)
    with urllib.request.urlopen(req, timeout=60) as resp:
        data = resp.read()
    if len(data) < 1024:
        print("Download failed: song not available (VIP/restricted)", file=sys.stderr)
        sys.exit(1)
    with open(filepath, "wb") as f:
        f.write(data)
    print(f"Downloaded: {filepath} ({len(data) // 1024} KB)")


# ============================================================
# Multi-platform search (for discovery; download only via NetEase)
# ============================================================

def _init_musicdl():
    try:
        from music_dl import config
        config.init()
        return True
    except Exception:
        return False


def search_multisource(query: str, limit: int = 15) -> List[Dict]:
    """Search via music-dl across QQ, Kugou, NetEase for discovery."""
    if not _init_musicdl():
        return []

    from concurrent.futures import ThreadPoolExecutor, as_completed
    import importlib

    sources = ["qq", "kugou", "netease"]
    all_songs = []

    def _search_one(name):
        try:
            mod = importlib.import_module(f"music_dl.addons.{name}")
            return mod.search(query)
        except Exception:
            return []

    with ThreadPoolExecutor(max_workers=3) as ex:
        futures = {ex.submit(_search_one, s): s for s in sources}
        for f in as_completed(futures):
            try:
                all_songs.extend(f.result())
            except Exception:
                pass

    seen = set()
    unique = []
    for s in all_songs:
        try:
            if float(s.size) <= 0:
                continue
        except (ValueError, TypeError):
            continue
        key = (s.title.strip().lower(), s.singer.strip().lower())
        if key in seen:
            continue
        seen.add(key)
        duration = str(getattr(s, "duration", ""))
        unique.append({
            "id": getattr(s, "id", ""),
            "title": s.title,
            "artist": s.singer,
            "album": getattr(s, "album", ""),
            "duration": duration,
            "size": f"{s.size}MB",
            "source": getattr(s, "source", "unknown"),
            "downloadable": getattr(s, "source", "") == "netease",
        })

    # Prefer QQ/Kugou for discovery but flag non-NetEase as non-downloadable
    source_rank = {"qq": 0, "kugou": 1, "netease": 2}
    unique.sort(key=lambda t: (source_rank.get(t["source"], 9), -float(t.get("size", "0MB").replace("MB", "") or 0)))
    return unique[:limit]


# ============================================================
# CLI
# ============================================================

def main():
    parser = argparse.ArgumentParser(description="BGM search and download")
    sub = parser.add_subparsers(dest="command", required=True)

    p_search = sub.add_parser("search", help="Search BGM")
    p_search.add_argument("query", help="Search query")
    p_search.add_argument("--limit", type=int, default=10, help="Max results")
    p_search.add_argument("--all", action="store_true", help="Show all results including non-downloadable")

    p_dl = sub.add_parser("download", help="Download a track")
    p_dl.add_argument("song_id", type=int, help="NetEase song ID")
    p_dl.add_argument("--output", "-o", help="Output filename")
    p_dl.add_argument("--dir", default=DEFAULT_OUTDIR, help="Output directory")

    args = parser.parse_args()

    if args.command == "search":
        # Try multi-source first for better discovery
        if args.all:
            tracks = search_multisource(args.query, args.limit)
            if not tracks:
                tracks = search_netease(args.query, args.limit)
        else:
            # Default: NetEase free tracks only (actually downloadable)
            tracks = search_netease(args.query, args.limit)
            if len(tracks) < 5:
                # Supplement with multi-source results
                extra = search_multisource(args.query, args.limit)
                seen = {(t["title"].strip().lower(), t["artist"].strip().lower()) for t in tracks}
                for t in extra:
                    key = (t["title"].strip().lower(), t["artist"].strip().lower())
                    if key not in seen:
                        seen.add(key)
                        tracks.append(t)
                tracks = tracks[:args.limit]

        # Remove internal fields for output
        clean = [{k: v for k, v in t.items() if k != "fee"} for t in tracks[:args.limit]]

        if not clean:
            print(json.dumps({
                "error": "No tracks found — try different keywords",
                "query": args.query,
            }, ensure_ascii=False, indent=2))
        else:
            print(json.dumps(clean, ensure_ascii=False, indent=2))

    elif args.command == "download":
        download_netease(args.song_id, args.dir, args.output)


if __name__ == "__main__":
    main()
