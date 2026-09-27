import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import type { SlideSpec } from "../config";
import { cueFrame, easeOutBack } from "../utils";
import { ITEMS } from "./items";
import { Cloud, Ground, Sky, Stage, Sun } from "./parts";

/**
 * 数字段场景（10 段共用同一个组件）
 *
 * 与问候语篇的区别：**没有角色**。数字主题的视觉主体是「物件的数量」，
 * 加角色会分散对数量的注意力（这正是「每段换物件」方案的代价）。
 * 背景零件 + 排列规则全部固定，唯一的变量是「物件种类」和「数量」。
 */

const BOX = 180; // 物件虚拟框边长（见 items.tsx 的风格约束）
const GAP = 20; // 物件间距
const ROW_Y_SINGLE = 930; // 一行时的高度
const ROW_Y_TOP = 800; // 两行时上行
const ROW_Y_BOTTOM = 1060; // 两行时下行

/** 算每个物件的坐标：n≤5 一行；n>5 两行（上行 5 个） */
const layout = (n: number): { x: number; y: number }[] => {
  const rowW = (k: number) => k * BOX + (k - 1) * GAP;
  const rowX = (k: number, i: number) => 540 - rowW(k) / 2 + i * (BOX + GAP) + BOX / 2;

  if (n <= 5) return Array.from({ length: n }, (_, i) => ({ x: rowX(n, i), y: ROW_Y_SINGLE }));

  const top = 5;
  const bottom = n - top;
  return [
    ...Array.from({ length: top }, (_, i) => ({ x: rowX(top, i), y: ROW_Y_TOP })),
    ...Array.from({ length: bottom }, (_, i) => ({ x: rowX(bottom, i), y: ROW_Y_BOTTOM })),
  ];
};

export const NumberScene: React.FC<{ slide: SlideSpec }> = ({ slide }) => {
  const frame = useCurrentFrame();
  const { count, item } = slide;
  const Item = ITEMS[item];
  const word = slide.en.split(" ")[0];

  // 物件弹入：从第 1 遍念到数字词开始，到第 3 遍结束，均匀铺开
  const t0 = cueFrame(slide, word, 0);
  const t2 = cueFrame(slide, word, 2);
  const step = count > 1 ? (t2 - t0) / (count - 1) : 0;
  const enterAt = (i: number) => t0 + step * i;

  // 第 2、3 遍念到时，已入场的物件一起弹一下
  const pulseAt = [cueFrame(slide, word, 1), t2];
  const pulse = pulseAt.reduce((acc, t) => {
    const d = frame - t;
    return d >= 0 && d < 14 ? Math.max(acc, Math.sin((d / 14) * Math.PI)) : acc;
  }, 0);


  return (
    <Stage>
      <Sky id={`num-${item}`} top="#BFE6F7" bottom="#FDF6E6" />

      <Sun x={880} y={200} r={68} />
      <Cloud x={250} y={150} scale={0.92} phase={0.4} />
      <Cloud x={700} y={320} scale={0.6} phase={2.3} opacity={0.85} />

      {/* 数字主题的画面要干净 —— 不放树/花/灌木，让「物件 + 数量」当唯一主体 */}
      <Ground y={1035} color="#93D18C" shade="#7CC47A" />

      {/* 物件逐个弹入 */}
      {layout(count).map((p, i) => {
        const at = enterAt(i);
        const p1 = interpolate(frame, [at, at + 12], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: easeOutBack,
        });
        if (p1 <= 0) return null;
        const scale = p1 * (1 + pulse * 0.12);
        return (
          <g key={i} opacity={Math.min(1, p1 * 1.5)}>
            {/* 落地影子 */}
            <ellipse cx={p.x} cy={p.y + BOX * 0.46} rx={BOX * 0.34} ry={BOX * 0.09}
              fill="#2B2B2B" opacity={0.1 * p1} />
            <g transform={`translate(${p.x}, ${p.y}) scale(${scale})`}>
              <Item />
            </g>
          </g>
        );
      })}
    </Stage>
  );
};
