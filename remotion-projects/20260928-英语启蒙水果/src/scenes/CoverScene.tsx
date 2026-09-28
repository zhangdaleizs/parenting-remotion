import React from "react";
import { AbsoluteFill, Img, staticFile, useVideoConfig } from "remotion";
import { COLORS, ROWS } from "../config";
import { EN_FONT, ZH_FONT } from "../components/fonts";

/**
 * 封面（横 4:3 / 竖 3:4 双版）
 *
 * 视觉必须和视频里看到的一致（紫底 + 米白卡 + 橙色高亮），否则点进来会「货不对板」。
 * 主视觉直接复用「网格卡片」这个本片最有辨识度的元素，其中一张保持高亮。
 *
 * 点击率法则：主视觉具象点题 / 底部用疑问句 / 只传达一件事 / 颜色 ≤3 种
 */

/** 封面上露脸的 6 张卡（值为 ROWS 下标），第 2 张（i=1）保持高亮 */
const SHOWN = [0, 3, 1, 7, 8, 11];
const HOT_INDEX = 1;

type Cfg = {
  eyebrowY: number; eyebrowSize: number;
  titleY: number; titleSize: number;
  panelY: number; cardW: number; cardH: number; colStep: number; rowStep: number;
  imgSize: number; cardRadius: number; enSize: number; ipaSize: number; zhSize: number;
  footY: number; footSize: number;
};

export const CoverScene: React.FC<{ vertical?: boolean }> = ({ vertical = false }) => {
  const { width } = useVideoConfig();

  const C: Cfg = vertical
    ? { eyebrowY: 200, eyebrowSize: 46, titleY: 312, titleSize: 92,
        panelY: 560, cardW: 300, cardH: 366, colStep: 335, rowStep: 400,
        imgSize: 110, cardRadius: 28, enSize: 50, ipaSize: 28, zhSize: 40,
        footY: 1660, footSize: 62 }
    : { eyebrowY: 90, eyebrowSize: 42, titleY: 175, titleSize: 100,
        panelY: 310, cardW: 340, cardH: 300, colStep: 375, rowStep: 320,
        imgSize: 96, cardRadius: 26, enSize: 44, ipaSize: 25, zhSize: 34,
        footY: 980, footSize: 54 };

  const COLS = 3;
  const { imgSize, cardRadius, enSize, ipaSize, zhSize } = C;
  const gridX = (width - (C.cardW + (COLS - 1) * C.colStep)) / 2;

  // 卡内纵向排布按比例算，横竖两版共用一套规则
  const imgTop = Math.round(C.cardH * 0.055);
  const enTop = imgTop + imgSize + Math.round(enSize * 0.22);
  const ipaTop = enTop + enSize + Math.round(ipaSize * 0.35);
  const zhTop = C.cardH - zhSize - Math.round(C.cardH * 0.06);

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.bg }}>
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse 78% 62% at 50% 34%, #F0EAF9 0%, ${COLORS.bg} 52%, #D9CDEC 100%)`,
        }}
      />
      <AbsoluteFill>
        <svg width="100%" height="100%" style={{ opacity: 0.16, mixBlendMode: "overlay" }}>
          <filter id="cover-noise">
            <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="3" stitchTiles="stitch" />
          </filter>
          <rect width="100%" height="100%" filter="url(#cover-noise)" />
        </svg>
      </AbsoluteFill>

      <div
        style={{
          position: "absolute", top: C.eyebrowY, left: 0, width: "100%", textAlign: "center",
          fontFamily: ZH_FONT, fontWeight: 600, fontSize: C.eyebrowSize, color: "#6B5B4A",
        }}
      >
        英语启蒙 · 每日磨耳朵
      </div>

      <div
        style={{
          position: "absolute", top: C.titleY, left: 0, width: "100%", textAlign: "center",
          fontFamily: ZH_FONT, fontWeight: 700, fontSize: C.titleSize, lineHeight: 1,
          color: COLORS.ink, whiteSpace: "nowrap",
        }}
      >
        每天30秒打卡亲子英语
      </div>

      {/* 主视觉：3×2 网格卡片，其中一张橙色高亮 */}
      {SHOWN.map((rowIndex, i) => {
        const card = ROWS[rowIndex];
        const col = i % COLS;
        const row = Math.floor(i / COLS);
        const hot = i === HOT_INDEX;
        return (
          <div
            key={card.en}
            style={{
              position: "absolute",
              left: gridX + col * C.colStep,
              top: C.panelY + row * C.rowStep,
              width: C.cardW,
              height: C.cardH,
              borderRadius: cardRadius,
              backgroundColor: hot ? COLORS.cardActive : COLORS.card,
            }}
          >
            <Img
              src={staticFile(`thumbs/${card.img}`)}
              style={{
                position: "absolute", left: (C.cardW - imgSize) / 2, top: imgTop,
                width: imgSize, height: imgSize,
                borderRadius: Math.round(imgSize * 0.15), objectFit: "cover",
              }}
            />
            <div style={{
              position: "absolute", left: 0, top: enTop, width: "100%",
              textAlign: "center", fontFamily: EN_FONT, fontWeight: 600,
              fontSize: enSize, lineHeight: 1, color: COLORS.ink,
            }}>
              {card.en}
            </div>
            <div style={{
              position: "absolute", left: 0, top: ipaTop, width: "100%",
              textAlign: "center", fontFamily: EN_FONT, fontWeight: 400,
              fontSize: ipaSize, lineHeight: 1, color: COLORS.ink,
            }}>
              {card.ipa}
            </div>
            <div style={{
              position: "absolute", left: 0, top: zhTop, width: "100%",
              textAlign: "center", fontFamily: ZH_FONT, fontWeight: 700,
              fontSize: zhSize, lineHeight: 1, color: COLORS.ink,
            }}>
              {card.zh}
            </div>
          </div>
        );
      })}

      <div
        style={{
          position: "absolute", top: C.footY, left: 0, width: "100%", textAlign: "center",
          fontFamily: ZH_FONT, fontWeight: 600, fontSize: C.footSize, color: "#4A3A2A",
          textShadow: "0 0 18px rgba(255,255,255,0.95), 0 0 36px rgba(255,255,255,0.8)",
        }}
      >
        12 个水果单词 · 你家娃能记住几个？
      </div>
    </AbsoluteFill>
  );
};
