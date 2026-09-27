import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { CROSSFADE_FRAMES, type SlideSpec } from "../config";
import { NumberScene } from "../scenes/NumberScene";
import { Caption } from "./Caption";

/** 字幕比画面晚一点硬切：等新画面基本盖住旧画面再换字，
 *  否则 crossfade 中段会出现「新字幕压在旧画面上」 */
const CAPTION_SWITCH = 8;

/**
 * 一段场景 = 画面层（crossfade）+ 字幕层（硬切）。
 * 画面层：新段淡入盖旧段，旧段保持不透明垫在下面 → 没有「旧淡出露背景」的闪帧窗口。
 * 字幕层：两段字幕布局相同，做 crossfade 会重影，所以硬切。
 */
export const Scene: React.FC<{ slide: SlideSpec; index: number }> = ({ slide, index }) => {
  const frame = useCurrentFrame();

  const opacity =
    index === 0
      ? 1
      : interpolate(frame, [0, CROSSFADE_FRAMES], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });

  const captionFrom = index === 0 ? 0 : CAPTION_SWITCH;
  const captionTo = slide.durationInFrames - CROSSFADE_FRAMES + CAPTION_SWITCH;
  const showCaption = frame >= captionFrom && frame < captionTo;

  return (
    <AbsoluteFill style={{ opacity }}>
      <NumberScene slide={slide} />
      {showCaption ? <Caption slide={slide} /> : null}
    </AbsoluteFill>
  );
};
