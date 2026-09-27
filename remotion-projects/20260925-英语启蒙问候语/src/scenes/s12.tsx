import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { type SlideSpec } from "../config";
import { easeInOutSine, easeOutCubic, zhFrame } from "../utils";
import { Cloud, Critter, Enter, Flower, Ground, Moon, Sky, Stage, Tree } from "./parts";

/** 晚上好 good evening —— 夕阳落下、月亮升起，晚霞铺满天空 */
export const S12: React.FC<{ slide: SlideSpec }> = ({ slide }) => {
  const frame = useCurrentFrame();
  const eveningAt = zhFrame(slide, "晚上好");

  // 太阳落下
  const setP = interpolate(frame, [0, 96], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: easeInOutSine,
  });
  const sunY = 620 + setP * 610;
  const sunOpacity = interpolate(frame, [70, 100], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // 月亮升起
  const moonP = interpolate(frame, [24, 110], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: easeOutCubic,
  });
  const moonY = 1280 - moonP * 900;

  return (
    <Stage>
      <Sky id="s12" top="#9B8AD0" bottom="#FFC08A" />

      {/* 晚霞带 */}
      <ellipse cx={540} cy={1020} rx={760} ry={300} fill="#FFD79B" opacity={0.5} />

      {/* 落日 */}
      <g transform={`translate(300, ${sunY})`} opacity={sunOpacity}>
        <circle r={150} fill="#FFB765" opacity={0.34} />
        <circle r={98} fill="#FF9E4D" />
      </g>

      {/* 月亮 */}
      <g opacity={moonP}>
        <Moon x={790} y={moonY} r={62} />
      </g>

      <Cloud x={250} y={230} scale={0.9} phase={1.5} color="#FFE3C4" opacity={0.8} />
      <Cloud x={700} y={380} scale={0.62} phase={3.2} color="#FFE9D2" opacity={0.7} />

      <Ground y={1035} color="#8FB88E" shade="#79A47C" />

      <Tree x={115} y={1190} scale={1.05} leaf="#5E8F6A" trunk="#7A5A42" />
      <Tree x={965} y={1210} scale={0.92} leaf="#6A9A72" trunk="#7A5A42" />
      <Flower x={250} y={1145} scale={0.76} petal="#FF9BB3" />
      <Flower x={850} y={1160} scale={0.66} petal="#FFC46B" />

      {/* 看晚霞的小熊 */}
      <Enter at={eveningAt} dy={36}>
        <Critter x={520} y={1150} scale={1.0} body="#D9A97C" belly="#F3DFC6" ear="round" eyes="happy" />
      </Enter>
    </Stage>
  );
};
