import React from "react";
import { useCurrentFrame } from "remotion";
import { THEME, LAYOUT, FONT, FONT_FAMILY, FONT_SERIF } from "./theme";

/**
 * 顶部场景标题：中文大字 + 英文衬线副标题（居中）。
 * ⚠️ 硬切（与字幕同步），不做淡入 —— 相邻标题宽度不同，crossfade 会发虚重影。
 */
export const SceneTitle: React.FC<{
  title: string;
  subtitle: string;
  inAt: number;
  outAt: number;
}> = ({ title, subtitle, inAt, outAt }) => {
  const frame = useCurrentFrame();
  if (frame < inAt || frame >= outAt) return null;

  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        textAlign: "center",
        fontFamily: FONT_FAMILY,
      }}
    >
      <div
        style={{
          position: "absolute",
          top: LAYOUT.titleY - FONT.title * 0.72,
          left: 0,
          width: "100%",
          fontSize: FONT.title,
          fontWeight: 700,
          color: THEME.ink,
          letterSpacing: 2,
          lineHeight: 1.1,
        }}
      >
        {title}
      </div>
      <div
        style={{
          position: "absolute",
          top: LAYOUT.subTitleY - FONT.subTitle * 0.72,
          left: 0,
          width: "100%",
          fontSize: FONT.subTitle,
          fontFamily: FONT_SERIF,
          color: THEME.sub,
          letterSpacing: 3,
          textTransform: "uppercase",
          lineHeight: 1.1,
        }}
      >
        {subtitle}
      </div>
    </div>
  );
};

export default SceneTitle;
