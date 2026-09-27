import React from "react";
import type { ItemId } from "../config";

/**
 * 10 个计数物件。
 *
 * ⚠️ **风格统一靠两条硬约束**（见 storyboard「画面物件」节）：
 *   1. 全部画在**同一个 120×120 的虚拟框**内（圆心在 0,0，半径 60）——
 *      这样不同形状的视觉重量一致，排列起来「数量」才是唯一变量
 *   2. 同一套画法：扁平色块、无描边、圆润形状、左上方向的高光/亮部
 *
 * 形状差异只体现在轮廓，不体现在风格上 —— 这是「每段换物件」不翻车的前提。
 */

const R = 85; // 虚拟框内半径（虚拟框 180，相邻中心距 200，留 30px 间隙）

/** 左上高光：所有物件共用的「同一套画法」标记 */
const Gloss: React.FC<{ cx?: number; cy?: number; rx?: number; ry?: number }> = ({
  cx = -R * 0.34,
  cy = -R * 0.4,
  rx = R * 0.26,
  ry = R * 0.34,
}) => <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill="#FFFFFF" opacity={0.42} />;

export const ITEMS: Record<ItemId, React.FC> = {
  apple: () => (
    <g>
      <path d={`M0,${-R * 0.62} C${-R * 0.18},${-R * 1.05} ${R * 0.18},${-R * 1.05} 0,${-R * 0.62}`}
        stroke="#8C6244" strokeWidth={9} fill="none" strokeLinecap="round" />
      <ellipse cx={R * 0.42} cy={-R * 0.86} rx={R * 0.36} ry={R * 0.2} fill="#6FBF73"
        transform={`rotate(-24, ${R * 0.42}, ${-R * 0.86})`} />
      <circle r={R * 0.96} fill="#EE5C5C" />
      <circle cx={-R * 0.5} cy={R * 0.34} r={R * 0.52} fill="#EE5C5C" />
      <circle cx={R * 0.5} cy={R * 0.34} r={R * 0.52} fill="#EE5C5C" />
      <Gloss />
    </g>
  ),

  bird: () => (
    <g>
      <ellipse cx={-R * 0.62} cy={R * 0.1} rx={R * 0.42} ry={R * 0.24} fill="#5AA9E6"
        transform={`rotate(-22, ${-R * 0.62}, ${R * 0.1})`} />
      <ellipse r={R * 0.9} cy={R * 0.1} fill="#7FC4F0" />
      <ellipse cx={R * 0.16} cy={R * 0.28} rx={R * 0.44} ry={R * 0.34} fill="#FFFFFF" opacity={0.5} />
      <circle cx={R * 0.62} cy={-R * 0.2} r={R * 0.1} fill="#2B2B2B" />
      <circle cx={R * 0.66} cy={-R * 0.24} r={R * 0.04} fill="#FFFFFF" />
      <path d={`M${R * 0.92},${-R * 0.06} L${R * 1.16},${R * 0.06} L${R * 0.92},${R * 0.2} Z`} fill="#F5B942" />
      <Gloss cx={-R * 0.3} cy={-R * 0.34} />
    </g>
  ),

  flower: () => (
    <g>
      {/* 茎短一点、花头大一点 —— 否则整朵细长像棒棒糖 */}
      <rect x={-7} y={-R * 0.1} width={14} height={R * 0.95} rx={7} fill="#5FA463" />
      <ellipse cx={-R * 0.34} cy={R * 0.4} rx={R * 0.28} ry={R * 0.16} fill="#5FA463"
        transform={`rotate(-24, ${-R * 0.34}, ${R * 0.4})`} />
      {Array.from({ length: 6 }).map((_, i) => (
        <ellipse key={i} cy={-R * 0.34} rx={R * 0.34} ry={R * 0.5} fill="#FF8FA3"
          transform={`rotate(${i * 60}, 0, ${-R * 0.34})`} />
      ))}
      <circle cy={-R * 0.34} r={R * 0.34} fill="#FFD34D" />
      <Gloss cx={-R * 0.12} cy={-R * 0.5} rx={R * 0.12} ry={R * 0.14} />
    </g>
  ),

  balloon: () => (
    <g>
      <path d={`M0,${R * 0.5} C${-R * 0.3},${R * 0.9} ${R * 0.3},${R * 1.2} 0,${R * 1.5}`}
        stroke="#B0B0B0" strokeWidth={5} fill="none" strokeLinecap="round" />
      <path d={`M0,${R * 0.62} L${R * 0.16},${R * 0.42} L${-R * 0.16},${R * 0.42} Z`} fill="#E8794A" />
      <ellipse cy={-R * 0.2} rx={R * 0.78} ry={R * 0.88} fill="#E8794A" />
      <Gloss cx={-R * 0.28} cy={-R * 0.54} rx={R * 0.16} ry={R * 0.24} />
    </g>
  ),

  star: () => {
    const pts = Array.from({ length: 10 }, (_, i) => {
      const ang = (Math.PI / 5) * i - Math.PI / 2;
      const r = i % 2 === 0 ? R : R * 0.46;
      return `${(Math.cos(ang) * r).toFixed(1)},${(Math.sin(ang) * r).toFixed(1)}`;
    }).join(" ");
    return (
      <g>
        <polygon points={pts} fill="#FFCE4D" />
        <Gloss cx={-R * 0.2} cy={-R * 0.34} rx={R * 0.16} ry={R * 0.24} />
      </g>
    );
  },

  strawberry: () => (
    <g>
      <path d={`M${-R * 0.7},${-R * 0.3} L${-R * 0.44},${-R * 0.86} L${-R * 0.14},${-R * 0.44}
        L${R * 0.16},${-R * 0.9} L${R * 0.44},${-R * 0.44} L${R * 0.72},${-R * 0.86} L${R * 0.78},${-R * 0.24} Z`}
        fill="#6FBF73" />
      <path d={`M0,${-R * 0.42} C${R * 0.92},${-R * 0.42} ${R * 0.72},${R * 0.62} 0,${R * 1.0}
        C${-R * 0.72},${R * 0.62} ${-R * 0.92},${-R * 0.42} 0,${-R * 0.42} Z`} fill="#EE5C5C" />
      {[[-0.3, 0.1], [0.28, 0.06], [-0.06, 0.44], [0.36, 0.5], [-0.4, 0.52]].map(([px, py], i) => (
        <ellipse key={i} cx={R * px} cy={R * py} rx={5} ry={8} fill="#FFE08A" />
      ))}
      <Gloss cx={-R * 0.34} cy={-R * 0.16} rx={R * 0.14} ry={R * 0.2} />
    </g>
  ),

  fish: () => (
    <g>
      <path d={`M${-R * 0.82},0 L${-R * 1.14},${-R * 0.52} L${-R * 1.14},${R * 0.52} Z`} fill="#E8794A" />
      <ellipse rx={R * 0.94} ry={R * 0.62} fill="#5AA9E6" />
      <path d={`M${-R * 0.1},${-R * 0.6} L${R * 0.3},${-R * 1.04} L${R * 0.42},${-R * 0.44} Z`} fill="#7FC4F0" />
      <path d={`M${-R * 0.3},${R * 0.5} Q0,${R * 0.9} ${R * 0.3},${R * 0.42} Z`} fill="#7FC4F0" />
      <circle cx={R * 0.54} cy={-R * 0.14} r={R * 0.13} fill="#FFFFFF" />
      <circle cx={R * 0.56} cy={-R * 0.14} r={R * 0.07} fill="#2B2B2B" />
      <Gloss cx={-R * 0.2} cy={-R * 0.3} rx={R * 0.18} ry={R * 0.14} />
    </g>
  ),

  duck: () => (
    <g>
      <ellipse cy={R * 0.34} rx={R * 0.94} ry={R * 0.56} fill="#FFE08A" />
      <circle cx={R * 0.34} cy={-R * 0.42} r={R * 0.54} fill="#FFE08A" />
      <path d={`M${R * 0.8},${-R * 0.42} L${R * 1.16},${-R * 0.28} L${R * 0.8},${-R * 0.12} Z`} fill="#F5B942" />
      <circle cx={R * 0.48} cy={-R * 0.52} r={R * 0.1} fill="#2B2B2B" />
      <circle cx={R * 0.52} cy={-R * 0.56} r={R * 0.04} fill="#FFFFFF" />
      <ellipse cx={-R * 0.36} cy={R * 0.3} rx={R * 0.4} ry={R * 0.3} fill="#FFD34D"
        transform={`rotate(-16, ${-R * 0.36}, ${R * 0.3})`} />
      <Gloss cx={-R * 0.3} cy={R * 0.1} rx={R * 0.2} ry={R * 0.14} />
    </g>
  ),

  candy: () => (
    <g>
      <path d={`M${-R * 0.68},0 L${-R * 1.15},${-R * 0.42} L${-R * 1.15},${R * 0.42} Z`} fill="#FF9BB3" />
      <path d={`M${R * 0.68},0 L${R * 1.15},${-R * 0.42} L${R * 1.15},${R * 0.42} Z`} fill="#FF9BB3" />
      <circle r={R * 0.72} fill="#FF9BB3" />
      <path d={`M0,${-R * 0.72} A${R * 0.72},${R * 0.72} 0 0 1 ${R * 0.5},${R * 0.52}
        L${-R * 0.5},${R * 0.52} A${R * 0.72},${R * 0.72} 0 0 1 0,${-R * 0.72} Z`} fill="#FFFFFF" opacity={0.85} />
      <circle r={R * 0.72} fill="none" stroke="#EE7C99" strokeWidth={5} />
      <Gloss cx={-R * 0.26} cy={-R * 0.4} rx={R * 0.16} ry={R * 0.2} />
    </g>
  ),

  heart: () => (
    <g>
      <path d={`M0,${R * 0.28} C${-R * 0.42},${-R * 0.18} ${-R * 0.96},${R * 0.14} ${-R * 0.54},${R * 0.58}
        L0,${R * 1.0} L${R * 0.54},${R * 0.58} C${R * 0.96},${R * 0.14} ${R * 0.42},${-R * 0.18} 0,${R * 0.28} Z`}
        fill="#FF7A93" />
      <Gloss cx={-R * 0.3} cy={R * 0.02} rx={R * 0.14} ry={R * 0.2} />
    </g>
  ),
};
