import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { type SlideSpec } from "../config";
import { cueFrame, easeOutCubic, easeOutBack, zhFrame } from "../utils";
import { Bush, Cloud, Critter, Enter, Flower, Ground, Sky, Stage, Sun, Tree } from "./parts";

/** 领走分手说 bye bye —— 小兔子一路走远，边走边回头挥手 */
export const S08: React.FC<{ slide: SlideSpec }> = ({ slide }) => {
  const frame = useCurrentFrame();
  const leaveAt = zhFrame(slide, "领走分手说");
  const byeAt = [0, 1, 2].map((n) => cueFrame(slide, "bye", n));

  // 一路往右走远，同时略微缩小
  const walkP = interpolate(frame, [leaveAt + 8, byeAt[2] + 20], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: easeOutCubic,
  });
  const x = 300 + walkP * 620;
  const scale = 1.0 - walkP * 0.26;

  const lastBye = byeAt.filter((t) => frame >= t).pop();
  const since = lastBye === undefined ? -1 : frame - lastBye;
  const popP =
    since < 0 ? 0 : interpolate(since, [0, 12], [0, 1], { extrapolateRight: "clamp", easing: easeOutBack });
  const wave = Math.sin(frame * 0.38) * 30;

  return (
    <Stage>
      <Sky id="s08" top="#FFD9B0" bottom="#FFF4E4" />

      <Sun x={880} y={230} r={70} color="#FFB25E" />
      <Cloud x={230} y={165} scale={0.9} phase={1.4} color="#FFF3E2" />
      <Cloud x={640} y={345} scale={0.6} phase={3.0} color="#FFF3E2" opacity={0.85} />

      <Ground y={1030} color="#B9D98F" shade="#A2CB7E" />

      <Tree x={100} y={1185} scale={1.05} leaf="#79BE72" />
      <Tree x={960} y={1205} scale={0.92} leaf="#88C87F" />
      <Bush x={560} y={1088} scale={0.6} color="#9BD18B" />
      <Flower x={200} y={1140} scale={0.75} petal="#FFC46B" />
      <Flower x={800} y={1155} scale={0.66} petal="#FF9BB3" />

      {/* bye 气泡跟着角色走 */}
      {popP > 0 ? (
        <g
          transform={`translate(${x}, ${860 - popP * 24}) scale(${0.55 + 0.45 * popP})`}
          opacity={Math.min(1, popP * 1.6)}
        >
          <rect x={-176} y={-72} width={352} height={138} rx={66} fill="#FFFFFF" />
          <path d="M-26,66 L0,108 L28,66 Z" fill="#FFFFFF" />
          <text
            x={0}
            y={22}
            textAnchor="middle"
            fontSize={74}
            fill="#E8794A"
            fontWeight={700}
            fontFamily="Baloo2"
          >
            bye bye
          </text>
        </g>
      ) : null}

      <Enter at={0} dy={40}>
        <Critter x={x} y={1150} scale={scale} body="#F5EFE6" belly="#FFFFFF" ear="long" mouth="open">
          <g transform={`translate(78, -30) rotate(${-44 - wave})`}>
            <rect x={-12} y={-66} width={24} height={74} rx={12} fill="#F5EFE6" />
            <circle cy={-70} r={17} fill="#F5EFE6" />
          </g>
        </Critter>
      </Enter>
    </Stage>
  );
};
