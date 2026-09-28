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
  type FruitRow,
} from "../config";
import { EN_FONT, ZH_FONT } from "./fonts";

/**
 * 单行横条。底色从米白渐变到亮橙（15 帧），
 * 到下一行开始时**硬切**回米白 —— 参考片实测是硬切，不是反向渐变。
 */
const Row: React.FC<{ row: FruitRow; index: number }> = ({ row, index }) => {
  const frame = useCurrentFrame();
  const inAt = ROW_STARTS[index] + HILITE_DELAY;
  const outAt = index + 1 < ROW_STARTS.length ? ROW_STARTS[index + 1] : TOTAL_FRAMES;

  const t = interpolate(frame, [inAt, inAt + HILITE_FADE], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const backgroundColor =
    frame >= outAt ? COLORS.card : interpolateColors(t, [0, 1], [COLORS.card, COLORS.cardActive]);

  return (
    <div
      style={{
        position: "absolute",
        left: LAYOUT.cardX,
        top: LAYOUT.cardTop + index * LAYOUT.cardStep,
        width: LAYOUT.cardW,
        height: LAYOUT.cardH,
        borderRadius: LAYOUT.cardRadius,
        backgroundColor,
        willChange: "background-color",
      }}
    >
      {/* 英文 + 音标：整块在左列居中 */}
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: LAYOUT.enCenterX * 2,
          height: LAYOUT.cardH,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            fontFamily: EN_FONT,
            fontWeight: 400,
            fontSize: LAYOUT.enFontSize,
            lineHeight: 1,
            color: COLORS.ink,
            whiteSpace: "nowrap",
          }}
        >
          {row.en}
        </div>
        <div
          style={{
            fontFamily: EN_FONT,
            fontWeight: 400,
            fontSize: LAYOUT.ipaFontSize,
            lineHeight: 1,
            color: COLORS.ink,
            marginTop: LAYOUT.ipaGap,
            whiteSpace: "nowrap",
          }}
        >
          {row.ipa}
        </div>
      </div>

      {/* 中缝缩略图：与行卡垂直居中 */}
      <Img
        src={staticFile(`thumbs/${row.img}`)}
        style={{
          position: "absolute",
          left: LAYOUT.thumbCenterX - LAYOUT.thumbSize / 2,
          top: (LAYOUT.cardH - LAYOUT.thumbSize) / 2,
          width: LAYOUT.thumbSize,
          height: LAYOUT.thumbSize,
          objectFit: "cover",
        }}
      />

      {/* 中文：右列居中 */}
      <div
        style={{
          position: "absolute",
          left: LAYOUT.zhCenterX - 200,
          top: 0,
          width: 400,
          height: LAYOUT.cardH,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: ZH_FONT,
          fontWeight: 700,
          fontSize: LAYOUT.zhFontSize,
          lineHeight: 1,
          color: COLORS.ink,
          whiteSpace: "nowrap",
        }}
      >
        {row.zh}
      </div>
    </div>
  );
};

/** 浅黄大圆角容器 + 9 张行卡，全片常驻 */
export const WordList: React.FC = () => (
  <>
    <div
      style={{
        position: "absolute",
        left: LAYOUT.panelX,
        top: LAYOUT.panelY,
        width: LAYOUT.panelW,
        height: LAYOUT.panelH,
        borderRadius: LAYOUT.panelRadius,
        backgroundColor: COLORS.panel,
      }}
    />
    {ROWS.map((row, i) => (
      <Row key={row.en} row={row} index={i} />
    ))}
  </>
);
