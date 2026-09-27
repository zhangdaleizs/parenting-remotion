import React from "react";
import { AbsoluteFill, useVideoConfig } from "remotion";
import { EN_FONT, ZH_FONT } from "../components/fonts";
import { Bush, Cloud, Critter, Flower, Sun, Tree } from "./parts";

/**
 * 封面（横 4:3 / 竖 3:4 双版）
 *
 * 视觉沿用本片的 SVG 卡通场景（不套本项目其它形态的卡片皮肤 —— 封面要和视频里看到的一致）。
 * 点击率法则（沿用 remotion-cover skill）：
 *  1. 主视觉具象点题：两只小动物互相招手 + hello 气泡
 *  2. 标题用疑问句，不用感叹句
 *  3. 画面只传达一件事：一个主视觉 + 一个疑问句 + 一行条件句
 *  4. 颜色 ≤3 种：天空蓝 + 深蓝标题 + 赭橙强调
 *
 * 版式（自上而下，全部用画面高度比例，横竖版各一套）：
 *   眉标 → 标题两行 → hello 气泡 → 主视觉角色 → 条件句
 * ⚠️ 气泡底（含箭头）必须落在角色头顶之上、标题墨迹之下，三者不能互相压
 */

const INK = "#004480"; // 本项目序号色，作标题
const ACCENT = "#CB5300"; // 本项目口诀色，作强调
const SKY_TOP = "#BFE6F7";
const SKY_BOTTOM = "#FDF6E6";

const LAYOUT = {
  landscape: {
    k: 1.4,
    eyebrow: 0.1,
    title1: 0.21,
    title2: 0.308,
    bubble: 0.487,
    critter: 0.708,
    condition: 0.945,
    critterScale: 1.4,
    critterGap: 340,
    titleSize: 142,
    conditionSize: 72,
  },
  vertical: {
    k: 1.0,
    eyebrow: 0.078,
    title1: 0.215,
    title2: 0.297,
    bubble: 0.44,
    critter: 0.72,
    condition: 0.94,
    critterScale: 1.25,
    critterGap: 240,
    titleSize: 104,
    conditionSize: 56,
  },
} as const;

export const CoverScene: React.FC<{ vertical?: boolean }> = ({ vertical = false }) => {
  const { width, height } = useVideoConfig();
  const L = vertical ? LAYOUT.vertical : LAYOUT.landscape;
  const cx = width / 2;
  const { k } = L;

  return (
    <AbsoluteFill>
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
        <defs>
          <linearGradient id="cover-sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={SKY_TOP} />
            <stop offset="100%" stopColor={SKY_BOTTOM} />
          </linearGradient>
          <radialGradient id="cover-glow" cx="50%" cy="45%" r="60%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity={0.7} />
            <stop offset="100%" stopColor="#FFFFFF" stopOpacity={0} />
          </radialGradient>
        </defs>

        <rect x={0} y={0} width={width} height={height} fill="url(#cover-sky)" />
        <rect x={0} y={0} width={width} height={height} fill="url(#cover-glow)" />

        {/* 背景字母水印：避开主视觉所在的中间带 */}
        <g opacity={0.075} fontFamily={EN_FONT} fontWeight={700} fill={INK}>
          <text x={width * 0.055} y={height * 0.34} fontSize={170 * k}>
            A
          </text>
          <text x={width * 0.86} y={height * 0.44} fontSize={190 * k}>
            B
          </text>
          <text x={width * 0.08} y={height * 0.63} fontSize={150 * k}>
            C
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

        <Tree x={width * 0.035} y={height * 0.855} scale={0.78 * k} leaf="#63BB74" />
        <Tree x={width * 0.965} y={height * 0.868} scale={0.72 * k} leaf="#74C780" />
        <Bush x={cx} y={height * 0.795} scale={0.46 * k} color="#86CB84" />
        <Flower x={width * 0.19} y={height * 0.84} scale={0.66 * k} petal="#FFC46B" />
        <Flower x={width * 0.81} y={height * 0.85} scale={0.6 * k} petal="#FF9BB3" />

        {/* ── 主视觉：两只小动物互相招手 ── */}
        <Critter
          x={cx - L.critterGap}
          y={height * L.critter}
          scale={L.critterScale}
          body="#F7F3EA"
          belly="#FFFFFF"
          ear="long"
          mouth="open"
        >
          {/* 耳内侧粉色，否则白兔子在浅底上像雪人 */}
          <ellipse cx={-30} cy={-146} rx={9} ry={36} fill="#FFB7C5" transform="rotate(-10, -30, -146)" />
          <ellipse cx={30} cy={-146} rx={9} ry={36} fill="#FFB7C5" transform="rotate(10, 30, -146)" />
          <g transform="translate(84, -20) rotate(-46)">
            <rect x={-13} y={-78} width={26} height={86} rx={13} fill="#F7F3EA" />
            <circle cy={-82} r={19} fill="#F7F3EA" />
          </g>
        </Critter>

        <Critter
          x={cx + L.critterGap}
          y={height * L.critter}
          scale={L.critterScale}
          body="#3E4C5C"
          belly="#FFFFFF"
          ear="none"
          mouth="none"
        >
          <path d="M-20,-4 L0,24 L20,-4 Z" fill="#F5B942" />
          <g transform="translate(-84, -20) rotate(46)">
            <rect x={-13} y={-78} width={26} height={86} rx={13} fill="#3E4C5C" />
          </g>
        </Critter>

        {/* hello 气泡 */}
        <g transform={`translate(${cx}, ${height * L.bubble})`}>
          <rect x={-250 * k} y={-92 * k} width={500 * k} height={176 * k} rx={88 * k} fill="#FFFFFF" />
          <path d={`M${-38 * k},${84 * k} L0,${138 * k} L${40 * k},${84 * k} Z`} fill="#FFFFFF" />
          <text
            x={0}
            y={30 * k}
            textAnchor="middle"
            fontSize={100 * k}
            fill={ACCENT}
            fontWeight={700}
            fontFamily={EN_FONT}
          >
            hello!
          </text>
        </g>

        {/* ── 文字层 ── */}
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
          宝宝英语开口
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
          第一句说什么？
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
          13 句礼貌问候语 · 跟着念就会
        </text>
      </svg>
    </AbsoluteFill>
  );
};
