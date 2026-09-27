import React from "react";
import { AbsoluteFill } from "remotion";
import { THEME, SCREEN } from "./theme";

// ===== 育儿卡片背景（浅灰噪点底）=====
// 参考实测：底色不是纯平色 —— 角落 #EDEDED、中部 #F3F3F3（极轻径向渐变），
// 且带细颗粒噪点。噪点是"质感"的来源，去掉会显得廉价。
// ⚠️ feTurbulence 是静态的（不随时间变），不会产生帧间闪烁。

export const CardBackground: React.FC<{
  width?: number;
  height?: number;
  /** 噪点强度，参考实测约 0.05 */
  grain?: number;
}> = ({ width = SCREEN.width, height = SCREEN.height, grain = 0.055 }) => (
  <AbsoluteFill>
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      <defs>
        {/* 极轻径向渐变：中心略亮、四角略暗 */}
        <radialGradient id="card-bg-grad" cx="50%" cy="46%" r="78%">
          <stop offset="0%" stopColor={THEME.bgCenter} />
          <stop offset="100%" stopColor={THEME.bgCorner} />
        </radialGradient>
        {/* 细颗粒噪点 */}
        <filter id="card-bg-grain" x="0" y="0" width="100%" height="100%">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.9"
            numOctaves="4"
            stitchTiles="stitch"
          />
          <feColorMatrix type="saturate" values="0" />
        </filter>
      </defs>
      <rect width={width} height={height} fill="url(#card-bg-grad)" />
      <rect width={width} height={height} filter="url(#card-bg-grain)" opacity={grain} />
    </svg>
  </AbsoluteFill>
);

export default CardBackground;
