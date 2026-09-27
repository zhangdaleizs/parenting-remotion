import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { type SlideSpec } from "../config";
import { cueFrame, easeOutCubic, zhFrame } from "../utils";
import { Bush, Cloud, Critter, Enter, Flower, Ground, Sky, Stage, Sun, Tree } from "./parts";

/** 客人来了快请坐 —— 主人伸手相请，客人走到小椅子前坐下 */
export const S09: React.FC<{ slide: SlideSpec }> = ({ slide }) => {
  const frame = useCurrentFrame();
  const guestAt = zhFrame(slide, "客人来了");
  const sitAt = zhFrame(slide, "快请坐");
  const downAt = cueFrame(slide, "down", 0);

  // 客人从右侧走到椅子前
  const walkP = interpolate(frame, [guestAt + 10, downAt], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: easeOutCubic,
  });
  const guestX = 1020 - walkP * 400;

  // 念到 down 时落座（下沉一点 + 缩小一点，暗示坐下的姿态）
  const sitP = interpolate(frame, [downAt, downAt + 14], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: easeOutCubic,
  });

  // 主人伸手做「请」的手势
  const reach = interpolate(frame, [sitAt, sitAt + 16], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: easeOutCubic,
  });

  return (
    <Stage>
      <Sky id="s09" top="#D9EFF7" bottom="#FBF3E4" />

      <Sun x={170} y={200} r={62} color="#FFD97A" />
      <Cloud x={660} y={150} scale={0.88} phase={1.9} />
      <Cloud x={330} y={340} scale={0.58} phase={0.5} opacity={0.82} />

      <Ground y={1035} color="#A8D89E" shade="#91CB8A" />

      <Tree x={110} y={1190} scale={1.02} leaf="#6CC07C" />
      <Bush x={880} y={1092} scale={0.6} color="#94D290" />
      <Flower x={250} y={1145} scale={0.76} petal="#FFC46B" />
      <Flower x={620} y={1170} scale={0.6} petal="#FF9BB3" />

      {/* 小椅子 */}
      <Enter at={guestAt} dy={24}>
        <g transform="translate(760, 1150)">
          <rect x={-92} y={-176} width={26} height={170} rx={12} fill="#C98F5C" />
          <rect x={-92} y={-190} width={184} height={30} rx={14} fill="#DDA46F" />
          <rect x={-104} y={-70} width={208} height={30} rx={14} fill="#DDA46F" />
          <rect x={-96} y={-44} width={22} height={58} rx={10} fill="#C98F5C" />
          <rect x={74} y={-44} width={22} height={58} rx={10} fill="#C98F5C" />
        </g>
      </Enter>

      {/* 主人：伸手相请 */}
      <Enter at={0} dy={38}>
        <Critter x={300} y={1150} scale={1.0} body="#F3C97E" belly="#FFEDCB" ear="round" mouth="open">
          <g transform={`translate(86, -14) rotate(${6 + reach * 58})`}>
            <rect x={-13} y={-78} width={26} height={86} rx={13} fill="#F3C97E" />
            <circle cy={-82} r={19} fill="#F3C97E" />
          </g>
        </Critter>
      </Enter>

      {/* 客人：走到椅子前坐下 */}
      <Enter at={guestAt + 6} dy={38}>
        <Critter
          x={guestX}
          y={1150 + sitP * 40}
          scale={0.92 - sitP * 0.08}
          body="#A9D5F2"
          belly="#E3F1FD"
          ear="pointy"
          eyes={sitP > 0.5 ? "happy" : "open"}
        />
      </Enter>
    </Stage>
  );
};
