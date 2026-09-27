import React from "react";
import { AbsoluteFill } from "remotion";
import { THEME, SCREEN } from "./theme";

// ===== 信息图底（暖米色径向渐变 + 细颗粒噪点 + 右下装饰弧）=====
// 参考实测：中心 #F7F1EA、四角 #E6DBD0（径向渐变），且带细颗粒噪点（std≈2）。
// ⚠️ feTurbulence 静态不随时间变，不会产生帧间闪烁。

export const InfoBackground: React.FC<{
  width?: number;
  height?: number;
  grain?: number;
}> = ({ width = SCREEN.width, height = SCREEN.height, grain = 0.06 }) => (
  <AbsoluteFill>
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      <defs>
        <radialGradient id="info-bg-grad" cx="50%" cy="44%" r="80%">
          <stop offset="0%" stopColor={THEME.bgCenter} />
          <stop offset="100%" stopColor={THEME.bgCorner} />
        </radialGradient>
        <filter id="info-bg-grain" x="0" y="0" width="100%" height="100%">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.9"
            numOctaves="4"
            stitchTiles="stitch"
          />
          <feColorMatrix type="saturate" values="0" />
        </filter>
      </defs>
      <rect width={width} height={height} fill="url(#info-bg-grad)" />
      {/* 右下装饰弧（参考片边缘有极淡的大圆弧） */}
      <circle
        cx={width - 60}
        cy={height + 120}
        r={430}
        fill="none"
        stroke={THEME.deco}
        strokeWidth={1.5}
      />
      <circle
        cx={width - 60}
        cy={height + 120}
        r={560}
        fill="none"
        stroke={THEME.deco}
        strokeWidth={1.5}
      />
      <rect width={width} height={height} filter="url(#info-bg-grain)" opacity={grain} />
    </svg>
  </AbsoluteFill>
);

export default InfoBackground;
