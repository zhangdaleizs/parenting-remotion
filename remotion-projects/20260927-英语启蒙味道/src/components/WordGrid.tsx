import React from "react";
import { Img, interpolate, interpolateColors, staticFile, useCurrentFrame } from "remotion";
import {
  COLORS,
  HILITE_DELAY,
  HILITE_FADE,
  LAYOUT,
  ROWS,
  ROW_STARTS,
  TOTAL_FRAMES,
  type TasteCard,
} from "../config";
import { EN_FONT, ZH_FONT } from "./fonts";

/** 卡内单行文字，按「墨迹中心 y」定位（flex 居中，中心 ≈ 墨迹中心） */
const Line: React.FC<{
  centerY: number;
  size: number;
  font: string;
  weight: number;
  color?: string;
  children: React.ReactNode;
}> = ({ centerY, size, font, weight, color = COLORS.ink, children }) => (
  <div
    style={{
      position: "absolute",
      left: 0,
      top: centerY - size * 0.75,
      width: "100%",
      height: size * 1.5,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: font,
      fontWeight: weight,
      fontSize: size,
      lineHeight: 1,
      color,
      whiteSpace: "nowrap",
    }}
  >
    {children}
  </div>
);

/**
 * 单张味道卡。底色从米白渐变到亮橙（15 帧），
 * 到下一张开始时**硬切**回米白 —— 参考片实测是硬切，不是反向渐变。
 */
const Card: React.FC<{ card: TasteCard; index: number }> = ({ card, index }) => {
  const frame = useCurrentFrame();
  const inAt = ROW_STARTS[index] + HILITE_DELAY;
  const outAt = index + 1 < ROW_STARTS.length ? ROW_STARTS[index + 1] : TOTAL_FRAMES;

  const t = interpolate(frame, [inAt, inAt + HILITE_FADE], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const backgroundColor =
    frame >= outAt ? COLORS.card : interpolateColors(t, [0, 1], [COLORS.card, COLORS.cardActive]);

  const col = index % LAYOUT.cols;
  const row = Math.floor(index / LAYOUT.cols);

  return (
    <div
      style={{
        position: "absolute",
        left: LAYOUT.gridX + col * LAYOUT.colStep,
        top: LAYOUT.gridY + row * LAYOUT.rowStep,
        width: LAYOUT.cardW,
        height: LAYOUT.cardH,
        borderRadius: LAYOUT.cardRadius,
        backgroundColor,
        willChange: "background-color",
      }}
    >
      <Img
        src={staticFile(`thumbs/${card.img}`)}
        style={{
          position: "absolute",
          left: (LAYOUT.cardW - LAYOUT.imgSize) / 2,
          top: LAYOUT.imgCenterY - LAYOUT.imgSize / 2,
          width: LAYOUT.imgSize,
          height: LAYOUT.imgSize,
          borderRadius: LAYOUT.imgRadius,
          objectFit: "cover",
        }}
      />
      <Line centerY={LAYOUT.enCenterY} size={LAYOUT.enFontSize} font={EN_FONT} weight={600}>
        {card.en}
      </Line>
      <Line centerY={LAYOUT.ipaCenterY} size={LAYOUT.ipaFontSize} font={EN_FONT} weight={400}>
        {card.ipa}
      </Line>
      <Line centerY={LAYOUT.zhCenterY} size={LAYOUT.zhFontSize} font={ZH_FONT} weight={700}>
        {card.zh}
      </Line>
    </div>
  );
};

/** 3×4 网格，全片常驻，只有高亮在移动 */
export const WordGrid: React.FC = () => (
  <>
    {ROWS.map((card, i) => (
      <Card key={card.en} card={card} index={i} />
    ))}
  </>
);
