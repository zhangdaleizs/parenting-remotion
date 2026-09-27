import React from "react";
import { AbsoluteFill, useVideoConfig } from "remotion";
import { EN_FONT, ZH_FONT } from "../components/fonts";
import { ITEMS } from "./items";
import { Cloud, Sun } from "./parts";

/**
 * 封面（横 4:3 / 竖 3:4 双版）
 *
 * 视觉沿用本片的画面语言（不套其它形态的卡片皮肤 —— 封面要和视频里看到的一致）。
 * 点击率法则（沿用 remotion-cover skill）：
 *  1. 主视觉具象点题：1→5 的物件排成一行、越来越多也越来越小，一眼看懂是数字启蒙
 *  2. 标题用疑问句，不用感叹句
 *  3. 画面只传达一件事
 *  4. 颜色 ≤3 种：天空蓝 + 深蓝标题 + 赭橙强调
 */

const INK = "#004480";
const ACCENT = "#CB5300";

const LAYOUT = {
  landscape: {
    k: 1.4,
    eyebrow: 0.1,
    title1: 0.215,
    title2: 0.315,
    items: 0.6,
    condition: 0.945,
    titleSize: 142,
    conditionSize: 72,
    itemBox: 340,
    itemGap: 14,
  },
  vertical: {
    k: 1.0,
    eyebrow: 0.078,
    title1: 0.215,
    title2: 0.297,
    items: 0.62,
    condition: 0.94,
    titleSize: 104,
    conditionSize: 56,
    itemBox: 210,
    itemGap: 12,
  },
} as const;

/** 封面主视觉的 5 个物件（和视频里同源，各取一个） */
const COVER_ITEMS = ["apple", "bird", "flower", "star", "heart"] as const;
const COVER_COUNTS = [1, 2, 3, 4, 5];

export const CoverScene: React.FC<{ vertical?: boolean }> = ({ vertical = false }) => {
  const { width, height } = useVideoConfig();
  const L = vertical ? LAYOUT.vertical : LAYOUT.landscape;
  const cx = width / 2;
  const { k } = L;

  // 物件大小随数量温和递减（1 个最大 → 5 个略小）—— 用 0.28 次方而不是开方，
  // 否则 1 个的那只苹果会大到压掉整行；「数量在递增」主要靠个数表达
  const boxes = COVER_COUNTS.map((n) => L.itemBox / Math.pow(n, 0.42));
  const totalW = boxes.reduce((a, b) => a + b, 0) + L.itemGap * (boxes.length - 1);
  let cursor = cx - totalW / 2;

  return (
    <AbsoluteFill>
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
        <defs>
          <linearGradient id="cv-sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#BFE6F7" />
            <stop offset="100%" stopColor="#FDF6E6" />
          </linearGradient>
          <radialGradient id="cv-glow" cx="50%" cy="45%" r="60%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity={0.7} />
            <stop offset="100%" stopColor="#FFFFFF" stopOpacity={0} />
          </radialGradient>
        </defs>

        <rect x={0} y={0} width={width} height={height} fill="url(#cv-sky)" />
        <rect x={0} y={0} width={width} height={height} fill="url(#cv-glow)" />

        {/* 背景数字水印：强化「这是数字课」 */}
        <g opacity={0.08} fontFamily={EN_FONT} fontWeight={700} fill={INK}>
          <text x={width * 0.05} y={height * 0.42} fontSize={200 * k}>
            1
          </text>
          <text x={width * 0.85} y={height * 0.5} fontSize={230 * k}>
            2
          </text>
          <text x={width * 0.11} y={height * 0.72} fontSize={170 * k}>
            3
          </text>
        </g>

        <Sun x={width * 0.88} y={height * 0.14} r={70 * k} />
        <Cloud x={width * 0.13} y={height * 0.185} scale={0.9 * k} />
        <Cloud x={width * 0.76} y={height * 0.3} scale={0.62 * k} opacity={0.85} />

        {/* 草地 */}
        <path
          d={`M0,${height * 0.76} Q${width * 0.26},${height * 0.7} ${width * 0.52},${height * 0.765} T${width},${height * 0.72} L${width},${height} L0,${height} Z`}
          fill="#93D18C"
        />
        <path
          d={`M0,${height * 0.845} Q${width * 0.3},${height * 0.795} ${width * 0.62},${height * 0.845} T${width},${height * 0.815} L${width},${height} L0,${height} Z`}
          fill="#7CC47A"
          opacity={0.6}
        />

        {/* 主视觉：1 → 5 个，越来越多、越来越小 */}
        {COVER_ITEMS.map((id, i) => {
          const box = boxes[i];
          const x = cursor + box / 2;
          cursor += box + L.itemGap;
          const Item = ITEMS[id];
          const y = height * L.items;
          return (
            <g key={id}>
              <ellipse
                cx={x}
                cy={y + box * 0.48}
                rx={box * 0.3}
                ry={box * 0.075}
                fill="#2B2B2B"
                opacity={0.1}
              />
              <g transform={`translate(${x}, ${y}) scale(${box / 170})`}>
                <Item />
              </g>
              <text
                x={x}
                y={y + box * 0.92}
                textAnchor="middle"
                fontSize={46 * k}
                fill={INK}
                fontWeight={700}
                fontFamily={EN_FONT}
                opacity={0.7}
              >
                {COVER_COUNTS[i]}
              </text>
            </g>
          );
        })}

        {/* 眉标 */}
        <g transform={`translate(${cx}, ${height * L.eyebrow})`}>
          <rect
            x={-320 * k}
            y={-44 * k}
            width={640 * k}
            height={88 * k}
            rx={44 * k}
            fill="none"
            stroke={INK}
            strokeWidth={4 * k}
            opacity={0.7}
          />
          <text
            x={0}
            y={20 * k}
            textAnchor="middle"
            fontSize={44 * k}
            fill={INK}
            fontFamily={ZH_FONT}
            opacity={0.9}
          >
            英语启蒙 · 每日磨耳朵
          </text>
        </g>

        <text
          x={cx}
          y={height * L.title1}
          textAnchor="middle"
          fontSize={L.titleSize}
          fill={INK}
          fontWeight={700}
          fontFamily={ZH_FONT}
          stroke={INK}
          strokeWidth={1.6}
        >
          宝宝会数数
        </text>
        <text
          x={cx}
          y={height * L.title2}
          textAnchor="middle"
          fontSize={L.titleSize}
          fill={ACCENT}
          fontWeight={700}
          fontFamily={ZH_FONT}
          stroke={ACCENT}
          strokeWidth={1.6}
        >
          英文一到十怎么说？
        </text>

        <text
          x={cx}
          y={height * L.condition}
          textAnchor="middle"
          fontSize={L.conditionSize}
          fill={INK}
          fontWeight={700}
          fontFamily={ZH_FONT}
          opacity={0.92}
        >
          10 个数字 · 跟着念就会
        </text>
      </svg>
    </AbsoluteFill>
  );
};
