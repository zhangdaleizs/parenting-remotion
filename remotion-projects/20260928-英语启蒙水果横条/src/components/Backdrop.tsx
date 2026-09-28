import React from "react";
import { AbsoluteFill } from "remotion";
import { COLORS } from "../config";

/**
 * 薰衣草紫背景。
 *
 * ⚠️ 参考片底部的暖色虚化照片在本配色下会与紫底打架（橙 vs 紫是补色），
 * 所以这一版**去掉照片**，改用「径向渐变 + 颗粒噪点」撑质感 ——
 * 底色太干净会显廉价（见 CLAUDE.md），噪点是关键。
 */
export const Backdrop: React.FC = () => (
  <>
    <AbsoluteFill
      style={{
        background: `radial-gradient(ellipse 78% 62% at 50% 34%, #F0EAF9 0%, ${COLORS.bg} 52%, #D9CDEC 100%)`,
      }}
    />
    <AbsoluteFill>
      <svg width="100%" height="100%" style={{ opacity: 0.16, mixBlendMode: "overlay" }}>
        <filter id="bg-noise">
          <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="3" stitchTiles="stitch" />
        </filter>
        <rect width="100%" height="100%" filter="url(#bg-noise)" />
      </svg>
    </AbsoluteFill>
  </>
);
