import React from "react";
import { useCurrentFrame } from "remotion";
import type { SlideSpec } from "../config";
import { zhFrame } from "../utils";
import { Bush, Cloud, Critter, Enter, Flower, Ground, Sky, Stage, Sun, Tree } from "./parts";

/** 点头 yes 摇头 no —— 小猫点头配 ✓，摇头配 ✗ */
export const S02: React.FC<{ slide: SlideSpec }> = ({ slide }) => {
  const frame = useCurrentFrame();
  const nodAt = zhFrame(slide, "点头");
  const shakeAt = zhFrame(slide, "摇头");

  // 点头：念到「点头」时上下点三下
  const nodT = frame - nodAt;
  const nod = nodT >= 0 && nodT < 46 ? Math.abs(Math.sin(nodT * 0.32)) * 26 : 0;
  // 摇头：念到「摇头」时左右摆
  const shakeT = frame - shakeAt;
  const shake = shakeT >= 0 && shakeT < 58 ? Math.sin(shakeT * 0.3) * 9 : 0;

  return (
    <Stage>
      <Sky id="s02" top="#C7E9F7" bottom="#F3F0E4" />

      <Sun x={170} y={190} r={64} color="#FFDE6B" />
      <Cloud x={640} y={140} scale={0.9} phase={0.8} />
      <Cloud x={300} y={350} scale={0.6} phase={2.6} opacity={0.8} />

      <Ground y={1030} color="#9BD48F" shade="#83C57E" />

      <Tree x={130} y={1180} scale={1.0} leaf="#5EB56E" />
      <Tree x={950} y={1200} scale={0.9} leaf="#6FC47C" />
      <Bush x={790} y={1085} scale={0.6} color="#86CB84" />
      <Flower x={250} y={1135} scale={0.8} petal="#FFB0C4" />
      <Flower x={640} y={1160} scale={0.65} petal="#FFD46B" />

      {/* ✓ —— 念到「点头」时出现 */}
      <Enter at={nodAt + 2} dy={18}>
        <g transform="translate(840, 640)" opacity={0.95}>
          <path
            d="M-38,4 L-8,38 L44,-32"
            stroke="#3FBF6B"
            strokeWidth={22}
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        </g>
      </Enter>

      {/* ✗ —— 念到「摇头」时出现 */}
      <Enter at={shakeAt + 2} dy={18}>
        <g transform="translate(840, 640)" opacity={0.95}>
          <path
            d="M-32,-32 L32,32 M32,-32 L-32,32"
            stroke="#EE6C6C"
            strokeWidth={22}
            strokeLinecap="round"
            fill="none"
          />
        </g>
      </Enter>

      <Enter at={0} dy={40}>
        <Critter
          x={520}
          y={1140 - nod}
          scale={1.06}
          body="#FFB877"
          belly="#FFE2C6"
          ear="pointy"
          eyes="open"
          mouth="open"
          tilt={shake}
          bob={4}
        />
      </Enter>
    </Stage>
  );
};
