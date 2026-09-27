import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { type SlideSpec } from "../config";
import { cueFrame, easeOutCubic, zhFrame } from "../utils";
import { Bush, Cloud, Critter, Enter, Flower, Ground, Sky, Stage, Sun, Tree } from "./parts";

/** 客人来了请喝茶 —— 小桌上摆一壶茶，念到 tea 时热气升起 */
export const S10: React.FC<{ slide: SlideSpec }> = ({ slide }) => {
  const frame = useCurrentFrame();
  const guestAt = zhFrame(slide, "客人来了");
  const teaAt = cueFrame(slide, "tea", 0);

  // 主人把茶壶往客人那边推一点
  const pushP = interpolate(frame, [teaAt, teaAt + 20], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: easeOutCubic,
  });

  // 热气：念到 tea 之后持续上升
  const steamP = interpolate(frame, [teaAt + 4, teaAt + 40], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <Stage>
      <Sky id="s10" top="#FCE7C2" bottom="#FFF8EC" />

      <Sun x={880} y={205} r={64} color="#FFCE6B" />
      <Cloud x={240} y={155} scale={0.9} phase={1.0} />
      <Cloud x={660} y={335} scale={0.58} phase={2.7} opacity={0.85} />

      <Ground y={1035} color="#B4DC98" shade="#9CD086" />

      <Tree x={105} y={1190} scale={1.02} leaf="#78C078" />
      <Tree x={975} y={1210} scale={0.9} leaf="#88C880" />
      <Bush x={540} y={1090} scale={0.58} color="#9BD48C" />
      <Flower x={215} y={1142} scale={0.76} petal="#FFB0C4" />
      <Flower x={860} y={1158} scale={0.66} petal="#FFD46B" />

      {/* 小桌 */}
      <Enter at={guestAt} dy={24}>
        <g transform="translate(560, 1150)">
          <ellipse cx={0} cy={-96} rx={186} ry={40} fill="#DBA36C" />
          <rect x={-186} y={-96} width={372} height={22} rx={11} fill="#C98F5C" />
          <rect x={-134} y={-76} width={24} height={80} rx={11} fill="#C98F5C" />
          <rect x={110} y={-76} width={24} height={80} rx={11} fill="#C98F5C" />
        </g>
      </Enter>

      {/* 茶壶 */}
      <Enter at={guestAt + 6} dy={20}>
        <g transform={`translate(${540 + pushP * 40}, ${1052})`}>
          <ellipse cx={0} cy={0} rx={62} ry={50} fill="#7FC4D8" />
          <path d="M62,-10 L116,-36" stroke="#7FC4D8" strokeWidth={20} strokeLinecap="round" />
          <path d="M-58,-16 C-104,-16 -104,26 -58,26" stroke="#7FC4D8" strokeWidth={17} fill="none" strokeLinecap="round" />
          <rect x={-20} y={-74} width={40} height={16} rx={8} fill="#5FAEC6" />
          <circle cy={-84} r={15} fill="#5FAEC6" />

          {/* 热气 */}
          {steamP > 0 ? (
            <g opacity={steamP * 0.85}>
              {[0, 1, 2].map((i) => {
                const off = i * 22 - 22;
                const rise = ((frame - teaAt - 4) * 1.5 + i * 24) % 130;
                return (
                  <path
                    key={i}
                    d={`M${off},-100 C${off - 18},${-130 - rise * 0.4} ${off + 18},${-160 - rise * 0.4} ${off},${-190 - rise}`}
                    stroke="#FFFFFF"
                    strokeWidth={11}
                    fill="none"
                    strokeLinecap="round"
                    opacity={1 - rise / 150}
                  />
                );
              })}
            </g>
          ) : null}
        </g>
      </Enter>

      <Enter at={0} dy={38}>
        <Critter x={240} y={1150} scale={0.98} body="#F0C58A" belly="#FFEDD0" ear="round" mouth="open" />
      </Enter>
      <Enter at={guestAt + 4} dy={38}>
        <Critter x={900} y={1150} scale={0.94} body="#CFA6E8" belly="#F0E2FA" ear="pointy" eyes="happy" />
      </Enter>
    </Stage>
  );
};
