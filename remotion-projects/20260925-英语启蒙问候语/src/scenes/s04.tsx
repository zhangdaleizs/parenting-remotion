import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { FPS, type SlideSpec } from "../config";
import { cueFrame, easeOutBack, easeOutCubic, zhFrame } from "../utils";
import { Bush, Cloud, Critter, Enter, Flower, Ground, Sky, Stage, Sun, Tree } from "./parts";

/** 见面问好说 hello —— 两只小动物从两侧走近，每念一遍 hello 就弹一次气泡 */
export const S04: React.FC<{ slide: SlideSpec }> = ({ slide }) => {
  const frame = useCurrentFrame();
  const meetAt = zhFrame(slide, "见面问好");
  // 音频实际只念了 3 遍 hello（cueFrame 取不到第 4 次会回落到 0，把 filter/pop 弄坏）
  const helloAt = [0, 1, 2].map((n) => cueFrame(slide, "hello", n));

  // 两只从画面两侧走到中间
  const walk = interpolate(frame, [meetAt, meetAt + 40], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: easeOutCubic,
  });
  const leftX = -120 + walk * 480;
  const rightX = 1200 - walk * 480;

  // 每念到一次 hello，气泡重新弹一次
  const lastHello = helloAt.filter((t) => frame >= t).pop();
  const since = lastHello === undefined ? -1 : frame - lastHello;
  const popP =
    since < 0 ? 0 : interpolate(since, [0, 12], [0, 1], { extrapolateRight: "clamp", easing: easeOutBack });

  const wave = Math.sin(frame * 0.34) * 20;

  return (
    <Stage>
      <Sky id="s04" top="#BFE6F7" bottom="#FDF6E6" />

      <Sun x={160} y={205} r={66} color="#FFD34D" />
      <Cloud x={620} y={150} scale={0.92} phase={0.4} />
      <Cloud x={880} y={340} scale={0.6} phase={2.4} opacity={0.82} />

      <Ground y={1030} color="#93D18C" shade="#7CC47A" />

      <PineTreeRow />

      {/* hello 气泡：每念一遍弹一次 */}
      {popP > 0 ? (
        <g transform={`translate(540, ${830 - popP * 24}) scale(${0.6 + 0.42 * popP})`} opacity={Math.min(1, popP * 1.6)}>
          <rect x={-206} y={-72} width={412} height={140} rx={66} fill="#FFFFFF" />
          <path d="M-26,66 L0,110 L28,66 Z" fill="#FFFFFF" />
          <text
            x={0}
            y={22}
            textAnchor="middle"
            fontSize={68}
            fill="#F08A5D"
            fontWeight={700}
            fontFamily="Baloo2"
          >
            hello
          </text>
        </g>
      ) : null}

      <Enter at={meetAt} dy={30}>
        <Critter x={leftX} y={1150} scale={0.92} body="#F2C879" belly="#FFF0CE" ear="round">
          <g transform={`translate(84, -16) rotate(${-34 - wave})`}>
            <rect x={-13} y={-74} width={26} height={82} rx={13} fill="#F2C879" />
            <circle cy={-78} r={19} fill="#F2C879" />
          </g>
        </Critter>
      </Enter>

      <Enter at={meetAt + 6} dy={30}>
        <Critter x={rightX} y={1150} scale={0.92} body="#A8D8F0" belly="#E2F2FC" ear="round">
          <g transform={`translate(-84, -16) rotate(${34 + wave})`}>
            <rect x={-13} y={-74} width={26} height={82} rx={13} fill="#A8D8F0" />
            <circle cy={-78} r={19} fill="#A8D8F0" />
          </g>
        </Critter>
      </Enter>
    </Stage>
  );
};

/** 远景一排小松树，增加纵深 */
const PineTreeRow: React.FC = () => (
  <g opacity={0.9}>
    <Tree x={90} y={1120} scale={0.62} leaf="#7CC47F" />
    <Tree x={990} y={1140} scale={0.58} leaf="#7CC47F" />
    <Bush x={250} y={1075} scale={0.45} color="#8BCE87" />
    <Bush x={840} y={1085} scale={0.42} color="#8BCE87" />
    <Flower x={430} y={1090} scale={0.5} petal="#FFC46B" />
    <Flower x={680} y={1095} scale={0.5} petal="#FF9BB3" />
  </g>
);
