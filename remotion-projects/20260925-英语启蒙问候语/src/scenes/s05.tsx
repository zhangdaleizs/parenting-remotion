import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { FPS, type SlideSpec } from "../config";
import { cueFrame, easeOutBack, zhFrame } from "../utils";
import { Bush, Cloud, Critter, Enter, Flower, Ground, Sky, Stage, Sun, Tree } from "./parts";

/** 你好吗 how are you —— 小狐狸歪头发问，念到 how 时冒出一个问号 */
export const S05: React.FC<{ slide: SlideSpec }> = ({ slide }) => {
  const frame = useCurrentFrame();
  const askAt = cueFrame(slide, "how", 0);

  const qP = interpolate(frame, [askAt, askAt + 12], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: easeOutBack,
  });

  // 歪头：整体轻微左右晃，像是在等回答
  const tilt = -10 + Math.sin(frame * 0.05) * 3;

  return (
    <Stage>
      <Sky id="s05" top="#C6ECF2" bottom="#F4FBF3" />

      <Sun x={880} y={195} r={60} color="#FFD97A" />
      <Cloud x={250} y={145} scale={0.88} phase={1.6} />
      <Cloud x={660} y={320} scale={0.58} phase={3.4} opacity={0.82} />

      <Ground y={1035} color="#9AD692" shade="#84C87F" />

      <Tree x={120} y={1185} scale={1.0} leaf="#66BE76" />
      <Tree x={965} y={1205} scale={0.88} leaf="#76C882" />
      <Bush x={810} y={1090} scale={0.58} color="#8BCE87" />
      <Flower x={230} y={1140} scale={0.78} petal="#FFC46B" />
      <Flower x={620} y={1165} scale={0.62} petal="#FF9BB3" />

      {/* 问号：念到 how 时弹出 */}
      {qP > 0 ? (
        <g
          transform={`translate(770, ${720 - qP * 26}) scale(${0.5 + 0.6 * qP})`}
          opacity={Math.min(1, qP * 1.5)}
        >
          <text
            x={0}
            y={0}
            textAnchor="middle"
            fontSize={210}
            fill="#5AA9E6"
            fontWeight={700}
            fontFamily="Baloo2"
          >
            ?
          </text>
        </g>
      ) : null}

      <Enter at={0} dy={40}>
        <Critter
          x={470}
          y={1150}
          scale={1.08}
          body="#F0A45C"
          belly="#FFE0BE"
          ear="pointy"
          earColor="#E8913F"
          mouth="o"
          tilt={tilt}
          bob={5}
        />
      </Enter>
    </Stage>
  );
};
