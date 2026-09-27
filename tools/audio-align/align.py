#!/usr/bin/env python3
"""Whisper 词级转写对齐工具 —— 音画同步质检标准法。

TTS 口播生成后，把每段 mp3 转成「[起-止]字」词级时间戳，动画 rel 锚点直接钉到关键词
（如 "[8.86-9.74]六分之一" → rel = 秒×30 = 266-292）。silencedetect 只给句边界，
估词位置会整体偏 1-4s（见 CLAUDE.md「音频先行·词级对齐」）。

用法:
  1) 装依赖（首次）:
     python3 -m venv /tmp/asr_venv
     /tmp/asr_venv/bin/pip install faster-whisper socksio   # socksio: 走 SOCKS 代理必须
  2) 转写（在仓库根跑）:
     /tmp/asr_venv/bin/python tools/audio-align/align.py remotion-projects/<项目>/public/audio [model]
  3) 输出: /tmp/asr/<音频名>.txt  （如 derive.txt），读词级时间戳排动画 rel

model 默认 small（中文够准）；嫌慢可 base，要更准用 medium。
模型首次自动下载到 ~/.cache/huggingface。
"""
import sys, os
from faster_whisper import WhisperModel


def main():
    if len(sys.argv) < 2:
        print(__doc__)
        sys.exit(1)
    audio_dir = sys.argv[1]
    model_name = sys.argv[2] if len(sys.argv) > 2 else "small"
    out_dir = "/tmp/asr"
    os.makedirs(out_dir, exist_ok=True)
    model = WhisperModel(model_name, device="cpu", compute_type="int8")

    for f in sorted(os.listdir(audio_dir)):
        if not f.endswith(".mp3"):
            continue
        name = f[:-4]
        segments, info = model.transcribe(
            os.path.join(audio_dir, f), language="zh", word_timestamps=True, vad_filter=True
        )
        lines = []
        for seg in segments:
            words = getattr(seg, "words", None)
            if words:
                wline = " ".join(f"[{w.start:.2f}-{w.end:.2f}]{w.word}" for w in words)
                lines.append(f"{seg.start:.2f}-{seg.end:.2f} | {wline}")
            else:
                lines.append(f"{seg.start:.2f}-{seg.end:.2f} | [{seg.start:.2f}-{seg.end:.2f}]{seg.text}")
        with open(os.path.join(out_dir, f"{name}.txt"), "w") as fh:
            fh.write("\n".join(lines))
        print(f"{name}: {info.duration:.2f}s → /tmp/asr/{name}.txt")
    print("ALL_DONE")


if __name__ == "__main__":
    main()
