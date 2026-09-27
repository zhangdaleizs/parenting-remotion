import React from "react";
import { AbsoluteFill, Img, staticFile, useVideoConfig } from "remotion";
import { COLORS } from "../config";
import { EN_FONT, ZH_FONT } from "../components/fonts";

/**
 * 封面（横 16:9 / 竖 9:16 双版）
 *
 * 视觉必须和视频里看到的一致（米色底 + 浅黄容器 + 白行卡 + 橙色高亮），
 * 否则点进来会「货不对板」。主视觉直接复用「高亮行」这个本片最有辨识度的元素。
 *
 * 点击率法则：主视觉具象点题 / 底部用疑问句 / 只传达一件事 / 颜色 ≤3 种
 */

const PREVIEW = [
  { en: "broccoli", ipa: "/ˈbrɒkəli/", zh: "西兰花", img: "s02_broccoli.png", hot: false },
  { en: "tomato", ipa: "/təˈmɑːtəʊ/", zh: "西红柿", img: "s05_tomato.png", hot: true },
  { en: "eggplant", ipa: "/ˈeɡplænt/", zh: "茄子", img: "s07_eggplant.png", hot: false },
];

type Cfg = {
  eyebrowY: number; eyebrowSize: number;
  titleY: number; titleSize: number;
  subY: number; subSize: number;
  panelY: number; panelH: number; panelW: number;
  cardH: number; cardGap: number; hotH: number;
  footY: number; footSize: number;
  thumb: number;
};

const CFG: { vertical: Cfg; landscape: Cfg } = {
  vertical: {
    eyebrowY: 150, eyebrowSize: 44,
    titleY: 330, titleSize: 100,
    subY: 476, subSize: 78,
    panelY: 640, panelH: 700, panelW: 940,
    cardH: 168, cardGap: 20, hotH: 168,
    footY: 1570, footSize: 52,
    thumb: 130,
  },
  landscape: {
    eyebrowY: 118, eyebrowSize: 40,
    titleY: 262, titleSize: 100,
    subY: 388, subSize: 70,
    panelY: 486, panelH: 420, panelW: 1180,
    cardH: 110, cardGap: 14, hotH: 110,
    footY: 990, footSize: 44,
    thumb: 92,
  },
};

export const CoverScene: React.FC<{ vertical?: boolean }> = ({ vertical = false }) => {
  const { width, height } = useVideoConfig();
  const C = vertical ? CFG.vertical : CFG.landscape;
  const cx = width / 2;
  const panelX = cx - C.panelW / 2;

  let y = C.panelY + 26;
  const cards = PREVIEW.map((p) => {
    const top = y;
    y += C.cardH + C.cardGap;
    return { ...p, top };
  });

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.bg }}>
      {/* 和正片同一套背景语言：薰衣草紫径向渐变 + 噪点 */}
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(ellipse 78% 62% at 50% 34%, #F0EAF9 0%, #E8E0F4 52%, #D9CDEC 100%)",
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
        10秒记住一串单词
      </div>

      <div
        style={{
          position: "absolute", top: C.subY, left: 0, width: "100%", textAlign: "center",
          fontFamily: ZH_FONT, fontWeight: 700, fontSize: C.subSize, lineHeight: 1,
          color: COLORS.ink,
        }}
      >
        蔬菜类
      </div>

      {/* 主视觉：浅黄容器里的高亮行 —— 本片最有辨识度的画面 */}
      <div
        style={{
          position: "absolute", left: panelX, top: C.panelY, width: C.panelW, height: C.panelH,
          borderRadius: 64, backgroundColor: COLORS.panel,
        }}
      />
      {cards.map((p) => (
        <div
          key={p.en}
          style={{
            position: "absolute",
            left: panelX + 30,
            top: p.top,
            width: C.panelW - 60,
            height: C.hotH,
            borderRadius: 40,
            backgroundColor: p.hot ? COLORS.cardActive : COLORS.card,
            display: "flex",
            alignItems: "center",
          }}
        >
          <div
            style={{
              width: "40%", textAlign: "center", fontFamily: EN_FONT, fontWeight: 700,
              fontSize: C.cardH * 0.44, lineHeight: 1, color: COLORS.ink, whiteSpace: "nowrap",
            }}
          >
            {p.en}
          </div>
          <Img
            src={staticFile(`thumbs/${p.img}`)}
            style={{
              width: C.thumb, height: C.thumb, borderRadius: 10, objectFit: "cover",
            }}
          />
          <div
            style={{
              flex: 1, textAlign: "center", fontFamily: ZH_FONT, fontWeight: 700,
              fontSize: C.cardH * 0.5, lineHeight: 1, color: COLORS.ink, whiteSpace: "nowrap",
            }}
          >
            {p.zh}
          </div>
        </div>
      ))}

      <div
        style={{
          position: "absolute", top: C.footY, left: 0, width: "100%", textAlign: "center",
          fontFamily: ZH_FONT, fontWeight: 600, fontSize: C.footSize, color: "#4A3A2A",
          textShadow: "0 0 18px rgba(255,255,255,0.95), 0 0 36px rgba(255,255,255,0.8)",
        }}
      >
        9 个蔬菜 · 你家娃能记住几个？
      </div>
    </AbsoluteFill>
  );
};
