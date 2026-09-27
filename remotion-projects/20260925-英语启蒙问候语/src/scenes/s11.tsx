import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { type SlideSpec } from "../config";
import { cueFrame, easeOutCubic, zhFrame } from "../utils";
import { Cloud, Critter, Enter, Flower, Ground, Sky, Stage, Tree } from "./parts";

/** 早上好 good morning —— 太阳从地平线升起，大公鸡打鸣 */
export const S11: React.FC<{ slide: SlideSpec }> = ({ slide }) => {
  const frame = useCurrentFrame();
  const morningAt = zhFrame(slide, "早上好");
  const goodAt = cueFrame(slide, "good", 0);

  // 太阳升起
  const riseP = interpolate(frame, [0, 62], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: easeOutCubic,
  });
  // 停在 y=580，别让太阳光晕压到字幕区（字幕底约 y=390）
  const sunY = 1230 - riseP * 650;

  // 打鸣：念到 good morning 时仰头
  const crowAt = goodAt;
  const crow = interpolate(frame, [crowAt, crowAt + 10, crowAt + 34], [0, -1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <Stage>
      <Sky id="s11" top="#FFE0A8" bottom="#FFF8E8" />

      {/* 朝阳 + 光晕 */}
      <g transform={`translate(540, ${sunY})`}>
        <circle r={190} fill="#FFD97A" opacity={0.3} />
        <circle r={124} fill="#FFC94D" />
        <circle r={92} fill="#FFE08A" />
      </g>

      <Cloud x={230} y={200} scale={0.86} phase={1.3} color="#FFF6E4" />
      <Cloud x={820} y={310} scale={0.62} phase={2.8} color="#FFF6E4" opacity={0.88} />

      <Ground y={1035} color="#B6DC96" shade="#9ED084" />

      <Tree x={120} y={1190} scale={1.05} leaf="#79C07A" />
      <Tree x={960} y={1210} scale={0.92} leaf="#88C880" />
      <Flower x={240} y={1145} scale={0.78} petal="#FFC46B" />
      <Flower x={860} y={1160} scale={0.66} petal="#FF9BB3" />

      {/* 大公鸡 */}
      <Enter at={morningAt} dy={36}>
        <Critter
          x={680}
          y={1150}
          scale={1.0}
          body="#FFF6EC"
          belly="#FFFFFF"
          ear="none"
          mouth="none"
          tilt={crow * 9}
          bob={3}
        >
          {/* 鸡冠 */}
          <path
            d="M-30,-104 C-44,-152 -12,-166 -4,-134 C6,-172 40,-162 30,-124 C58,-146 70,-112 44,-98 Z"
            fill="#EE5C5C"
          />
          {/* 喙：朝下的三角，别碰到右眼（眼睛在 cx=±32） */}
          <path d="M-15,-14 L15,-14 L0,16 Z" fill="#F5B942" />
          {/* 尾羽 */}
          <path d="M-84,-16 C-152,-58 -166,16 -108,22 Z" fill="#F0A45C" />
          <path d="M-86,10 C-160,-6 -158,64 -104,46 Z" fill="#E8913F" />
        </Critter>
      </Enter>
    </Stage>
  );
};
