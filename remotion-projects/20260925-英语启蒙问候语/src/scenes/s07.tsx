import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { type SlideSpec } from "../config";
import { cueFrame, easeOutBack, zhFrame } from "../utils";
import { Cloud, Critter, Enter, Ground, Sky, Stage, Sun } from "./parts";

/** 熟人见面说 hi —— 两只企鹅碰面挥手，每念一遍 hi 弹一次气泡 */
export const S07: React.FC<{ slide: SlideSpec }> = ({ slide }) => {
  const frame = useCurrentFrame();
  const meetAt = zhFrame(slide, "熟人见面说");
  const hiAt = [0, 1, 2].map((n) => cueFrame(slide, "hi", n));

  const lastHi = hiAt.filter((t) => frame >= t).pop();
  const since = lastHi === undefined ? -1 : frame - lastHi;
  const popP =
    since < 0 ? 0 : interpolate(since, [0, 12], [0, 1], { extrapolateRight: "clamp", easing: easeOutBack });

  const wave = Math.sin(frame * 0.36) * 24;

  // 打招呼时两只轻轻跳一下
  const hop = since >= 0 && since < 14 ? Math.sin((since / 14) * Math.PI) * 16 : 0;

  return (
    <Stage>
      <Sky id="s07" top="#BDE9DC" bottom="#F1FBF6" />

      <Sun x={870} y={190} r={62} color="#FFE07A" />
      <Cloud x={240} y={150} scale={0.9} phase={1.1} />
      <Cloud x={700} y={330} scale={0.58} phase={2.9} opacity={0.82} />

      {/* 冰面 */}
      <Ground y={1040} color="#D6F0EA" shade="#BCE4DC" />

      {/* 浮冰 */}
      <ellipse cx={180} cy={1105} rx={110} ry={30} fill="#FFFFFF" opacity={0.85} />
      <ellipse cx={920} cy={1120} rx={96} ry={26} fill="#FFFFFF" opacity={0.8} />

      {popP > 0 ? (
        <g
          transform={`translate(540, ${800 - popP * 26}) scale(${0.55 + 0.45 * popP})`}
          opacity={Math.min(1, popP * 1.6)}
        >
          <rect x={-160} y={-74} width={320} height={142} rx={68} fill="#FFFFFF" />
          <path d="M-26,68 L0,112 L28,68 Z" fill="#FFFFFF" />
          <text
            x={0}
            y={24}
            textAnchor="middle"
            fontSize={82}
            fill="#3FA9C9"
            fontWeight={700}
            fontFamily="Baloo2"
          >
            hi
          </text>
        </g>
      ) : null}

      <Enter at={meetAt} dy={34}>
        <Critter x={300} y={1145 - hop} scale={0.98} body="#3E4C5C" belly="#FFFFFF" ear="none" mouth="none">
          {/* 喙 —— 没有它一眼看不出是企鹅 */}
          <path d="M-20,-4 L0,24 L20,-4 Z" fill="#F5B942" />
          {/* 挥起的翅膀 */}
          <g transform={`translate(88, -20) rotate(${-38 - wave})`}>
            <rect x={-12} y={-70} width={24} height={78} rx={12} fill="#33404E" />
          </g>
          {/* 垂着的翅膀 */}
          <ellipse cx={-86} cy={16} rx={20} ry={58} fill="#33404E" transform="rotate(12, -86, 16)" />
        </Critter>
      </Enter>

      <Enter at={meetAt + 5} dy={34}>
        <Critter x={780} y={1145 - hop} scale={0.98} body="#33404E" belly="#FFFFFF" ear="none" mouth="none">
          <path d="M-20,-4 L0,24 L20,-4 Z" fill="#F5B942" />
          <g transform={`translate(-88, -20) rotate(${38 + wave})`}>
            <rect x={-12} y={-70} width={24} height={78} rx={12} fill="#3E4C5C" />
          </g>
          <ellipse cx={86} cy={16} rx={20} ry={58} fill="#3E4C5C" transform="rotate(-12, 86, 16)" />
        </Critter>
      </Enter>
    </Stage>
  );
};
