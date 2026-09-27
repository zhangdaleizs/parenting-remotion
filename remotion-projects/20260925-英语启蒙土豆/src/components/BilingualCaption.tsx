import React from "react";
import { LAYOUT } from "../config";
import { EN_FONT, ZH_FONT } from "./fonts";

/** 白色外描边 + paintOrder: stroke，让描边画在字形之下 —— 字既不变细，
 *  压在插画上也能读清（素材构图不受控，字幕难免会盖到角色） */
const stroke = {
  WebkitTextStroke: `${LAYOUT.captionStrokeWidth}px ${LAYOUT.captionStrokeColor}`,
  paintOrder: "stroke fill",
} as React.CSSProperties;

/** 左上角双语字幕：英文句型在上、中文翻译在下，左对齐、纯黑 */
export const BilingualCaption: React.FC<{ en: string; zh: string }> = ({ en, zh }) => (
  <div
    style={{
      position: "absolute",
      top: LAYOUT.captionBoxTop,
      left: LAYOUT.captionLeft,
      width: LAYOUT.captionWidth,
      height: LAYOUT.captionBoxHeight,
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
    }}
  >
    <div
      style={{
        fontFamily: EN_FONT,
        fontWeight: 700,
        fontSize: LAYOUT.enFontSize,
        lineHeight: LAYOUT.enLineHeight,
        color: "#000000",
        whiteSpace: "pre-line",
        ...stroke,
      }}
    >
      {en}
    </div>
    <div
      style={{
        fontFamily: ZH_FONT,
        fontSize: LAYOUT.zhFontSize,
        lineHeight: LAYOUT.zhLineHeight,
        color: "#000000",
        marginTop: LAYOUT.zhMarginTop,
        ...stroke,
      }}
    >
      {zh}
    </div>
  </div>
);
