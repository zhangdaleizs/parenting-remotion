#!/usr/bin/env bash
# 成片响度归一化 —— 渲染完之后跑一次，把成片拉到跟赛道头部齐平的响度。
#
# 为什么需要：Remotion 里 TTS 1.0 / 音效 0.12 / BGM 0.1 是直接相加的，
# 整条链路没有任何响度归一化和限幅 → 成片会落在 −21.0 LUFS 左右，
# 而抖音同类成片实测 −9.1 LUFS（外放一听"别人的更冲"就是这个）。
# 见 CLAUDE.md「发布」节的「响度」条。
#
# 用法（本仓脚本在 tools/loudness/，从仓库根跑）:
#   ./tools/loudness/loudnorm.sh remotion-projects/<项目>/out/final.mp4
#   LOUDNESS_I=-11 ./tools/loudness/loudnorm.sh in.mp4 out.mp4     # 换目标响度
#
# 默认输出 <成片>-loud.mp4，不覆盖原文件。
set -euo pipefail

IN="${1:?用法: loudnorm.sh <成片.mp4> [输出.mp4]}"
OUT="${2:-${IN%.*}-loud.mp4}"
TARGET_I="${LOUDNESS_I:--8}"    # 目标积分响度 LUFS（实测 -8 → 出来约 -10.4，跟参考片 -9.1 同一量级）
TARGET_TP="${LOUDNESS_TP:--1.0}" # 真峰值上限 dBTP（留 headroom 给平台二次编码）
LRA="${LOUDNESS_LRA:-5}"        # 目标动态范围；参考片 LRA 只有 1.2，压得越狠越"冲"
# ⚠️ alimiter 的 limit 是**采样峰值**，而 AAC 编码后真峰值还会再涨 ~0.6-1.0 dB。
#    limit=0.94（-0.54 dBFS）在口播密集的片子上实测真峰值会顶到 **+0.6 dBFS（削波）**。
#    0.80（-1.94 dBFS 采样）→ 实测真峰值约 -1.0~-1.1 dBFS ✅
LIMIT="${LOUDNESS_LIMIT:-0.80}"

[ -f "$IN" ] || { echo "找不到文件: $IN" >&2; exit 1; }
command -v ffmpeg >/dev/null || { echo "需要 ffmpeg" >&2; exit 1; }

measure() { # 输出: "I LUFS  LRA LU  Peak dBFS"
  ffmpeg -hide_banner -nostats -i "$1" -af ebur128=peak=true -f null - 2>&1 \
    | grep -E '^[[:space:]]+(I|LRA|Peak):' | tail -3 | awk '{printf "%s ", $2}'
}

echo "输入 : $IN"
echo "处理前: $(measure "$IN")"
ffmpeg -y -v error -i "$IN" -c:v copy \
  -af "loudnorm=I=${TARGET_I}:TP=${TARGET_TP}:LRA=${LRA},alimiter=limit=${LIMIT}:level=disabled" \
  -ar 48000 "$OUT"
echo "处理后: $(measure "$OUT")   → $OUT"
