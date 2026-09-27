import React from "react";
import { Img, interpolate, staticFile, useCurrentFrame } from "remotion";

const FADE_IN = 12;

/**
 * 中间插画。不用 <Sequence> 包裹 —— 按全局帧算 opacity，local<0 自然不可见。
 *
 * 转场用「层叠 crossfade」：新图淡入盖住旧图，旧图**不淡出**，
 * 否则会出现「旧图淡出露白底 → 新图淡入」的一闪（见 CLAUDE.md 坑表）。
 */
export const Illustration: React.FC<{
  img: string;
  inAt: number;
  outAt: number;
}> = ({ img, inAt, outAt }) => {
  const frame = useCurrentFrame();

  const opacity = interpolate(frame, [inAt, inAt + FADE_IN], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // ⚠️ 必须等下一张**完全淡入**后再卸载：若在 outAt 就卸载，而下一张还在淡入，
  //    中间会露出白底闪一下（fade-through，见 CLAUDE.md 坑表）。
  if (frame >= outAt + FADE_IN) return null;

  return (
    <Img
      src={staticFile(img)}
      style={{
        position: "absolute",
        top: 70,
        left: 0,
        width: 1280,
        height: 525,
        opacity,
        willChange: "opacity",
      }}
    />
  );
};

export default Illustration;
