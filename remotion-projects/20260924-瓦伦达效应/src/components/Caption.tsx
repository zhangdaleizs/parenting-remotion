import React from "react";
import { useCurrentFrame } from "remotion";
import { THEME, LAYOUT, FONT, FONT_FAMILY } from "./theme";

/**
 * 底部字幕：深蓝黑大字，居中，透明底（浮在米色底上）。
 * ⚠️ 硬切（不做淡入）—— 两行宽度不同的文字叠加淡入会发虚重影，参考片也是硬切。
 * 长句在文案里用 \n 手动断行（断点落在标点后）。
 */
export const Caption: React.FC<{
  text: string;
  inAt: number;
  outAt: number;
}> = ({ text, inAt, outAt }) => {
  const frame = useCurrentFrame();
  if (frame < inAt || frame >= outAt) return null;

  const lines = text.split("\n");
  const maxLen = Math.max(...lines.map((l) => l.length));
  const isMulti = lines.length > 1;
  // 两行时：字号更小、整体上移（否则两行会顶到画面底边被切）
  const base = isMulti ? FONT.captionSmall : FONT.caption;
  // 兜底：按最长行估算宽度（全角字宽≈字号，容器可用 1680px），超长就收缩
  const fit = Math.floor(1650 / maxLen) - 1;
  const finalSize = Math.min(base, fit);
  const centerY = isMulti ? LAYOUT.captionY - 29 : LAYOUT.captionY;

  return (
    <div
      style={{
        position: "absolute",
        top: centerY - 90,
        left: 0,
        width: "100%",
        height: 180,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "0 120px",
        boxSizing: "border-box",
        fontFamily: FONT_FAMILY,
      }}
    >
      <span
        style={{
          fontSize: finalSize,
          fontWeight: 700,
          color: THEME.ink,
          letterSpacing: 1,
          textAlign: "center",
          lineHeight: 1.24,
          whiteSpace: "pre-line",
        }}
      >
        {text}
      </span>
    </div>
  );
};

export default Caption;
