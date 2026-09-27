import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { type SlideSpec } from "../config";
import { cueFrame, easeOutCubic, zhFrame } from "../utils";
import { Cloud, Critter, Enter, Ground, Moon, Sky, Stage, Tree } from "./parts";

/** 临睡之前道晚安 good night —— 星星月亮下，小兔子躺在小床上睡着，头顶飘 Z */
export const S13: React.FC<{ slide: SlideSpec }> = ({ slide }) => {
  const frame = useCurrentFrame();
  const nightAt = zhFrame(slide, "临睡之前");
  const sleepAt = zhFrame(slide, "道晚安");
  const nightCue = cueFrame(slide, "night", 0);

  // 念到「道晚安」时闭眼
  const asleep = frame >= sleepAt + 8;
  // Z 从念 good night 开始飘
  const zP = interpolate(frame, [nightCue, nightCue + 30], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: easeOutCubic,
  });

  return (
    <Stage>
      <Sky id="s13" top="#6E7FC4" bottom="#A9B6E4" />

      {/* 星星 */}
      {STARS.map((s, i) => {
        const tw = 0.45 + 0.55 * Math.sin(frame * 0.07 + i * 1.7);
        return <circle key={i} cx={s[0]} cy={s[1]} r={s[2]} fill="#FFF8DC" opacity={tw} />;
      })}

      <Moon x={830} y={300} r={72} />

      <Cloud x={230} y={260} scale={0.78} phase={1.8} color="#C9D3F2" opacity={0.55} />

      <Ground y={1035} color="#5E6BA8" shade="#4E5A92" />

      <Tree x={120} y={1190} scale={1.0} leaf="#4A6E8E" trunk="#3E4A70" />
      <Tree x={960} y={1210} scale={0.88} leaf="#54768F" trunk="#3E4A70" />

      {/* 小床：床垫 + 床头板 + 半床被子 */}
      <Enter at={nightAt} dy={24}>
        <g transform="translate(540, 1150)">
          <rect x={-206} y={-44} width={30} height={54} rx={14} fill="#8C6244" />
          <rect x={176} y={-44} width={30} height={54} rx={14} fill="#8C6244" />
          <rect x={-266} y={-240} width={44} height={210} rx={20} fill="#C08A5A" />
          <rect x={-240} y={-118} width={480} height={86} rx={28} fill="#F0E4D4" />
          <rect x={-40} y={-128} width={280} height={102} rx={28} fill="#7FC4D8" />
          <rect x={-40} y={-128} width={280} height={28} rx={14} fill="#A8DCEC" />
        </g>
      </Enter>

      {/* 睡着的小兔子：坐在床上，下半身随后被被角盖住 */}
      <Enter at={nightAt + 6} dy={30}>
        <Critter
          x={470}
          y={920}
          scale={0.72}
          body="#F3EFE6"
          belly="#FFFFFF"
          ear="long"
          eyes={asleep ? "closed" : "open"}
          mouth={asleep ? "smile" : "o"}
          bob={3}
        />
      </Enter>

      {/* 被角：盖住兔子下半身，画在兔子之后 */}
      <rect x={346} y={940} width={308} height={114} rx={30} fill="#7FC4D8" />
      <rect x={346} y={940} width={308} height={30} rx={15} fill="#A8DCEC" />

      {/* 飘起的 Z */}
      {zP > 0
        ? [0, 1, 2].map((i) => {
            const t = (frame - nightCue - i * 16) / 60;
            if (t < 0 || t > 1) return null;
            return (
              <text
                key={i}
                x={520 + i * 46 + t * 24}
                y={790 - t * 200}
                fontSize={44 + i * 12}
                fill="#FFFFFF"
                opacity={(1 - t) * 0.95}
                fontWeight={700}
                fontFamily="Baloo2"
              >
                z
              </text>
            );
          })
        : null}
    </Stage>
  );
};

const STARS: [number, number, number][] = [
  [130, 210, 5],
  [300, 130, 4],
  [470, 260, 6],
  [640, 150, 4],
  [980, 180, 5],
  [880, 470, 4],
  [180, 480, 5],
  [390, 620, 4],
  [1010, 620, 4],
  [80, 720, 4],
];
