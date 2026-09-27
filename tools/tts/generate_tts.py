#!/usr/bin/env python3
"""
速创猫 TTS 语音合成脚本
基于 agent.ai-tools.cn 语音合成 API 封装

使用方式:
  # 在项目目录下运行（自动检测项目根，读取 scripts/batch_config.json）
  cd remotion-projects/<项目名>
  python3 ../../tools/tts/generate_tts.py

  # 搜索音色
  python3 ../../tools/tts/generate_tts.py --search "少儿"

  # 列出全部音色
  python3 ../../tools/tts/generate_tts.py --list-voices

  # 单条生成
  python3 ../../tools/tts/generate_tts.py --text "你好世界" --voice scm_hd_clic0dkg

环境变量:
  SPEECH_API_KEY - x-api-key header（从 agent.ai-tools.cn F12 → Network → x-api-key 获取）
"""

import argparse
import json
import os
import re
import sys
import time
from pathlib import Path
from urllib.request import Request, urlopen
from urllib.error import URLError

API_URL = "https://agent.ai-tools.cn/api/v1/plugins/speech-synthesis"
PAGE_URL = "https://agent.ai-tools.cn/speech-synthesis"
KEY_FILE = Path(__file__).with_name(".env")


def load_api_key() -> str:
    """按「环境变量 → tools/tts/.env」的顺序取 key。

    key 不进版本库（同目录有 .env.example 说明格式），避免提交到 GitHub 后被扫描利用。
    """
    key = os.environ.get("SPEECH_API_KEY")
    if key:
        return key.strip()
    if KEY_FILE.exists():
        for line in KEY_FILE.read_text(encoding="utf-8").splitlines():
            line = line.strip()
            if line.startswith("SPEECH_API_KEY="):
                return line.split("=", 1)[1].strip().strip("'\"")
    return ""
VOICES_FILE = Path(__file__).parent / "voices.json"
FPS = 30
BUFFER_FRAMES = 16


def find_project_root(start_path: Path = None) -> Path:
    """从当前目录向上查找 Remotion 项目根目录"""
    current = (start_path or Path.cwd()).resolve()
    for _ in range(10):
        pkg = current / "package.json"
        if pkg.exists():
            try:
                data = json.loads(pkg.read_text())
                deps = {**data.get("dependencies", {}), **data.get("devDependencies", {})}
                if "remotion" in deps or "@remotion" in str(deps):
                    return current
            except Exception:
                pass
        if (current / "batch_config.json").exists() or \
           (current / "scripts" / "batch_config.json").exists():
            return current
        if current.parent == current:
            break
        current = current.parent
    return Path.cwd()


def resolve_project_path(project_root: Path, path_str: str) -> Path:
    """解析路径：绝对路径直接返回，相对路径相对于项目根"""
    p = Path(path_str)
    if p.is_absolute():
        return p
    return project_root / p


def call_speech_api(text: str, voice_id: str, speed_ratio: float,
                    api_key: str) -> dict:
    """调用语音合成 API，返回 {link, duration}"""

    body = json.dumps({
        "text": text,
        "voice_id": voice_id,
        "speed_ratio": speed_ratio,
    }).encode("utf-8")

    req = Request(API_URL, data=body, method="POST")
    req.add_header("Accept", "application/json")
    req.add_header("Content-Type", "application/json;charset=UTF-8")
    req.add_header("x-api-key", api_key)

    try:
        with urlopen(req, timeout=120) as resp:
            result = json.loads(resp.read().decode("utf-8"))
    except URLError as e:
        print(f"❌ API 请求失败: {e}", file=sys.stderr)
        sys.exit(1)

    if result.get("code") != 0:
        print(f"❌ API 返回错误: {result.get('msg', '未知错误')}", file=sys.stderr)
        sys.exit(1)

    data = result.get("data", {})
    return {
        "link": data.get("link"),
        "duration": data.get("duration"),
    }


def download_mp3(url: str, output_path: Path) -> int:
    """下载 MP3 文件，返回文件大小(bytes)"""
    req = Request(url, method="GET")
    with urlopen(req, timeout=120) as resp:
        data = resp.read()
    output_path.write_bytes(data)
    return len(data)


def get_duration_seconds(file_path: Path) -> float:
    """获取 MP3 文件时长（秒），优先 mutagen，兜底 ffprobe"""
    try:
        from mutagen.mp3 import MP3
        audio = MP3(file_path)
        return audio.info.length
    except ImportError:
        import subprocess
        try:
            result = subprocess.run(
                ["ffprobe", "-v", "quiet", "-show_entries", "format=duration",
                 "-of", "default=noprint_wrappers=1:nokey=1", str(file_path)],
                capture_output=True, text=True
            )
            return float(result.stdout.strip())
        except (FileNotFoundError, ValueError):
            return 0.0


def format_frame_info(duration_s: float) -> str:
    """格式化时长和帧数信息"""
    frames = int(duration_s * FPS) + BUFFER_FRAMES
    return f"{duration_s:.1f}s → {frames}f ({duration_s:.1f}s×{FPS}fps+{BUFFER_FRAMES})"


def load_voices() -> list[dict]:
    """加载音色列表"""
    if not VOICES_FILE.exists():
        print(f"⚠️ 音色列表文件不存在: {VOICES_FILE}", file=sys.stderr)
        print("  运行 --refresh-voices 从官网抓取最新音色", file=sys.stderr)
        return []
    with open(VOICES_FILE, "r", encoding="utf-8") as f:
        return json.load(f)


def list_voices(voices: list[dict], search: str = None):
    """显示音色列表，可按关键词搜索"""
    if not voices:
        print("暂无音色数据")
        return

    if search:
        keyword = search.lower()
        voices = [v for v in voices
                  if keyword in v.get("voice_name", "").lower()
                  or keyword in v.get("voice_type", "").lower()
                  or keyword in v.get("scene", "").lower()
                  or keyword in v.get("language", "").lower()
                  or keyword in v.get("emotions", "").lower()]

        if not voices:
            print(f"未找到匹配 '{search}' 的音色")
            return
        print(f"搜索 '{search}' 找到 {len(voices)} 个音色:\n")

    scenes = {}
    for v in voices:
        scene = v.get("scene", "未知")
        scenes.setdefault(scene, []).append(v)

    for scene, items in scenes.items():
        print(f"【{scene}】({len(items)}个)")
        for v in items:
            name = v["voice_name"]
            vid = v["voice_type"]
            lang = v.get("language", "")
            gender = v.get("gender", "")
            emo = v.get("emotions", "")
            parts = [f"  {vid}"]
            parts.append(name)
            extras = []
            if gender:
                extras.append(gender)
            if lang:
                extras.append(lang)
            if emo:
                extras.append(f"[{emo}]")
            if extras:
                parts.append("| " + " | ".join(extras))
            print("  ".join(parts))
        print()


def refresh_voices():
    """从 agent.ai-tools.cn 页面抓取最新音色列表"""
    print("1/3 获取页面...")
    page_html = urlopen(PAGE_URL, timeout=30).read().decode("utf-8")
    main_match = re.search(r'src="(/assets/js/index-[^"]+\.js)"', page_html)
    if not main_match:
        print("❌ 未找到主 JS bundle", file=sys.stderr)
        return None
    main_js_url = f"https://agent.ai-tools.cn{main_match.group(1)}"

    print(f"2/3 获取主 bundle: {main_match.group(1)}")
    main_js = urlopen(main_js_url, timeout=30).read().decode("utf-8")
    chunk_match = re.search(r'speech_synthesis.+?import\("\./(index-[^"]+\.js)"', main_js)
    if not chunk_match:
        print("❌ 未找到 speech synthesis chunk 引用", file=sys.stderr)
        return None
    chunk_url = f"https://agent.ai-tools.cn/assets/js/{chunk_match.group(1)}"

    print(f"3/3 获取音色数据: {chunk_match.group(1)}")
    js_data = urlopen(chunk_url, timeout=30).read().decode("utf-8")

    pos = js_data.find("ne=JSON.parse('")
    if pos == -1:
        pos = js_data.find("JSON.parse('[")
    if pos == -1:
        print("❌ 未在 JS 中找到音色数据", file=sys.stderr)
        return None

    json_start = js_data.index("[", pos)
    depth = 0
    json_end = json_start
    for i in range(json_start, len(js_data)):
        if js_data[i] == "[":
            depth += 1
        elif js_data[i] == "]":
            depth -= 1
            if depth == 0:
                json_end = i + 1
                break

    voices = json.loads(js_data[json_start:json_end])
    with open(VOICES_FILE, "w", encoding="utf-8") as f:
        json.dump(voices, f, ensure_ascii=False, indent=2)

    print(f"✅ 已更新 {len(voices)} 个音色 → {VOICES_FILE}")
    return voices


def main():
    parser = argparse.ArgumentParser(description="速创猫 TTS 语音合成脚本")
    parser.add_argument("--text", type=str, help="要合成语音的文本")
    parser.add_argument("--voice", type=str, default="scm_hd_clic0dkg",
                        help="音色 ID（默认: scm_hd_clic0dkg 曼波）")
    parser.add_argument("--speed", type=float, default=1.0,
                        help="语速比例（默认: 1.0）")
    parser.add_argument("--output", type=str, default="output.mp3",
                        help="输出文件名（默认: output.mp3）")
    parser.add_argument("--out-dir", type=str, default=None,
                        help="输出目录（默认: 自动检测项目根/public/audio/）")
    parser.add_argument("--batch", type=str, default=None,
                        help="批量配置文件路径（默认: 自动查找 batch_config.json）")
    parser.add_argument("--list-voices", action="store_true",
                        help="列出所有音色（按场景分组）")
    parser.add_argument("--search", type=str, metavar="关键词",
                        help="搜索音色（匹配名称、ID、场景、语言、情感）")
    parser.add_argument("--refresh-voices", action="store_true",
                        help="从官网抓取最新音色列表")
    args = parser.parse_args()

    # 刷新音色列表
    if args.refresh_voices:
        refresh_voices()
        return

    # 音色查看/搜索不需要 API key
    if args.list_voices or args.search:
        voices = load_voices()
        list_voices(voices, search=args.search)
        return

    # 检测项目根目录
    project_root = find_project_root()

    # 确定输出目录
    if args.out_dir:
        out_dir = resolve_project_path(project_root, args.out_dir)
    else:
        out_dir = project_root / "public" / "audio"
    out_dir.mkdir(parents=True, exist_ok=True)

    # 获取 API 凭据
    api_key = load_api_key()
    if not api_key:
        print(
            "未找到 SPEECH_API_KEY —— 请设置同名环境变量，"
            "或按 tools/tts/.env.example 的格式写进 tools/tts/.env",
            file=sys.stderr,
        )
        sys.exit(1)

    if args.batch:
        batch_path = resolve_project_path(project_root, args.batch)
    else:
        # 自动查找 batch_config.json
        candidates = [
            project_root / "batch_config.json",
            project_root / "scripts" / "batch_config.json",
        ]
        batch_path = None
        for c in candidates:
            if c.exists():
                batch_path = c
                break

        if batch_path is None:
            # 没有 batch config，检查是否提供了 --text
            if not args.text:
                print("❌ 未找到 batch_config.json，请提供 --text 或 --batch 参数", file=sys.stderr)
                print(f"   已检测项目根: {project_root}", file=sys.stderr)
                print(f"   期望位置: {candidates[0]} 或 {candidates[1]}", file=sys.stderr)
                sys.exit(1)
            batch_path = None

    if batch_path:
        # 批量模式
        with open(batch_path, "r", encoding="utf-8") as f:
            items = json.load(f)

        print(f"📋 批量配置: {batch_path}")
        print(f"📁 输出目录: {out_dir}")
        print(f"🎬 项目根目录: {project_root}\n")

        total = len(items)
        for i, item in enumerate(items):
            text = item["text"]
            voice_id = item.get("voice_id", "scm_hd_clic0dkg")
            speed_ratio = item.get("speed_ratio", 1.0)
            output_name = item.get("output", f"batch_{i:02d}.mp3")

            print(f"[{i+1}/{total}] 生成: {text[:40]}...")
            result = call_speech_api(text, voice_id, speed_ratio, api_key)
            output_path = out_dir / output_name
            size = download_mp3(result["link"], output_path)
            duration = get_duration_seconds(output_path)
            print(f"  → {output_name} ({size/1024:.1f} KB, {format_frame_info(duration)})")

            if i < total - 1:
                time.sleep(0.5)

        print(f"\n✅ 全部完成！共 {total} 个文件 → {out_dir.resolve()}")

    else:
        # 单条模式
        if not args.text:
            print("❌ 请提供 --text 参数或使用 --batch 批量模式", file=sys.stderr)
            sys.exit(1)

        print(f"生成: {args.text[:50]}...")
        result = call_speech_api(args.text, args.voice, args.speed, api_key)
        output_path = out_dir / args.output
        size = download_mp3(result["link"], output_path)
        duration = get_duration_seconds(output_path)
        print(f"→ {args.output} ({size/1024:.1f} KB, {format_frame_info(duration)})")
        print(f"✅ 生成完成！")


if __name__ == "__main__":
    main()
