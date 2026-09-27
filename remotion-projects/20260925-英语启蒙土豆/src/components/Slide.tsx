import React from "react";
import { AbsoluteFill, Img, OffthreadVideo, interpolate, staticFile, useCurrentFrame } from "remotion";
import { CROSSFADE_FRAMES, type SlideSpec } from "../config";
import { BilingualCaption } from "./BilingualCaption";

export const Slide: React.FC<{ slide: SlideSpec; index: number }> = ({ slide, index }) => {
  // Sequence 内拿到的是局部帧
  const frame = useCurrentFrame();

  // 层叠 crossfade：新段淡入盖住旧段，旧段始终保持 opacity 1 垫在下面。
  // 因此不存在"旧段淡出露背景、新段才开始淡入"的闪帧窗口。首段直接满不透明。
  const opacity =
    index === 0
      ? 1
      : interpolate(frame, [0, CROSSFADE_FRAMES], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });

  const src = staticFile(slide.media);
  const isVideo = slide.media.endsWith(".mp4");

  return (
    <AbsoluteFill style={{ opacity, backgroundColor: "#000000" }}>
      {isVideo ? (
        <OffthreadVideo
          src={src}
          muted
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      ) : (
        <Img src={src} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      )}
      <BilingualCaption en={slide.en} zh={slide.zh} />
    </AbsoluteFill>
  );
};
