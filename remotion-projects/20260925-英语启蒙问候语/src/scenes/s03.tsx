import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { FPS, type SlideSpec } from "../config";
import { cueFrame, easeOutCubic, zhFrame } from "../utils";
import { Bubble, Bush, Cloud, Critter, Enter, Flower, Ground, Sky, Stage, Sun, Tree } from "./parts";

/** 我是 I 你是 you —— 左边冒 I、右边冒 you，然后两只之间升起爱心 */
export const S03: React.FC<{ slide: SlideSpec }> = ({ slide }) => {
  const frame = useCurrentFrame();
  const iAt = zhFrame(slide, "我是");
  const youAt = zhFrame(slide, "你是");
  const loveAt = cueFrame(slide, "love", 0);

  // 念到 I love you 时两只靠近一点
  const lean = interpolate(frame, [loveAt, loveAt + 16], [0, 34], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: easeOutCubic,
  });

  // 爱心升起
  const heartP = interpolate(frame, [loveAt + 4, loveAt + 30], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: easeOutCubic,
  });

  return (
    <Stage>
      <Sky id="s03" top="#FBD9E4" bottom="#FFF3F6" />

      <Sun x={890} y={200} r={62} color="#FFCF6B" />
      <Cloud x={230} y={160} scale={0.85} phase={1.2} />
      <Cloud x={720} y={330} scale={0.55} phase={3.1} opacity={0.8} />

      <Ground y={1040} color="#A3D89A" shade="#8CCB86" />

      <Tree x={110} y={1190} scale={1.05} leaf="#63BB74" />
      <Tree x={980} y={1210} scale={0.92} leaf="#74C780" />
      <Bush x={540} y={1095} scale={0.6} color="#8ED08B" />
      <Flower x={820} y={1150} scale={0.75} petal="#FF9BB3" />
      <Flower x={200} y={1160} scale={0.68} petal="#FFC46B" />

      <Enter at={0} dy={40}>
        <Critter x={330 + lean} y={1150} scale={0.94} body="#F6E7A8" belly="#FFF7DC" ear="pointy" />
      </Enter>
      <Enter at={4} dy={40}>
        <Critter x={750 - lean} y={1150} scale={0.94} body="#B7D8F5" belly="#E4F1FD" ear="round" />
      </Enter>

      <Bubble at={iAt + 4} x={300 + lean} y={880} text="I" color="#FFFFFF" fontSize={64} />
      <Bubble at={youAt + 4} x={790 - lean} y={880} text="you" color="#FFFFFF" fontSize={64} />

      {/* 爱心：念到 love 时从两只中间升起 */}
      {heartP > 0 ? (
        <g
          transform={`translate(540, ${960 - heartP * 90}) scale(${0.7 + 0.5 * heartP})`}
          opacity={heartP}
        >
          <path
            d="M0,34 C-46,-16 -104,18 -58,66 L0,116 L58,66 C104,18 46,-16 0,34 Z"
            fill="#FF7A93"
          />
        </g>
      ) : null}
    </Stage>
  );
};
