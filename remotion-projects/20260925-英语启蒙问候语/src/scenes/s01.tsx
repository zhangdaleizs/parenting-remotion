import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import type { SlideSpec } from "../config";
import { cueFrame, zhFrame } from "../utils";
import { Bush, Cloud, Critter, Enter, Flower, Ground, Pine, Sky, Stage, Sun, Tree } from "./parts";

/** 来是 come 去是 go —— 小兔子在草地上来回走，「来」朝左「去」朝右 */
export const S01: React.FC<{ slide: SlideSpec }> = ({ slide }) => {
  const frame = useCurrentFrame();
  const come1 = cueFrame(slide, "come", 0);
  const come2 = cueFrame(slide, "come", 1);
  const go1 = cueFrame(slide, "go", 0);
  const go2 = cueFrame(slide, "go", 1);
  // 箭头跟中文提示走：「来」/「去」在中文行里出现得更早
  const arrowCome = zhFrame(slide, "来");
  const arrowGo = zhFrame(slide, "去");

  // 兔子横向轨迹：每念一个词就往反方向走一步（来回踱步 = 来 / 去）。
  // ⚠️ 关键帧必须严格递增，所以按词的**实际先后**（come1→come2→go1→go2）排，不能按词形分组
  const x = interpolate(
    frame,
    [0, come1, come1 + 12, come2, come2 + 12, go1, go1 + 8, go2],
    [540, 540, 310, 310, 720, 720, 310, 310],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  return (
    <Stage>
      <Sky id="s01" top="#BFE6F7" bottom="#E9F7FD" />

      <Sun x={880} y={210} r={70} />
      <Cloud x={250} y={150} scale={0.95} phase={0} />
      <Cloud x={700} y={330} scale={0.66} phase={2.1} opacity={0.85} />

      <Ground y={1020} color="#8FD08A" shade="#79C079" />

      <Pine x={100} y={1150} scale={1.15} />
      <Tree x={960} y={1180} scale={1.05} />
      <Bush x={540} y={1075} scale={0.72} color="#7CC47F" />
      <Flower x={210} y={1130} scale={0.85} />
      <Flower x={880} y={1150} scale={0.7} petal="#FFC46B" />

      {/* 「来」的箭头：口播 come 时指向兔子 */}
      <Enter at={arrowCome} dy={16}>
        <g transform="translate(160, 770)" opacity={0.9}>
          <path
            d="M-72,0 L14,0 M-14,-26 L14,0 L-14,26"
            stroke="#5AA9E6"
            strokeWidth={16}
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        </g>
      </Enter>

      {/* 「去」的箭头：口播 go 时背离兔子 */}
      <Enter at={arrowGo} dy={16}>
        <g transform="translate(920, 770)" opacity={0.9}>
          <path
            d="M72,0 L-14,0 M14,-26 L-14,0 L14,26"
            stroke="#F08A5D"
            strokeWidth={16}
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        </g>
      </Enter>

      <Enter at={0} dy={40}>
        <Critter x={x} y={1130} scale={1.02} body="#F3F1EC" belly="#FFFFFF" ear="long" mouth="open" />
      </Enter>
    </Stage>
  );
};
