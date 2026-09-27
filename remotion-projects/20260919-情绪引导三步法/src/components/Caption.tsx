import React from "react";
import { useCurrentFrame } from "remotion";

const FONT = '"PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif';

/**
 * 底部字幕条：黑色大字，居中。
 * ⚠️ 字幕**硬切**（不做淡入）——两行宽度不同的文字叠加淡入会发虚重影，
 *    原片也是硬切。插画那边才用 crossfade。
 */
export const Caption: React.FC<{
  text: string;
  inAt: number;
  outAt: number;
}> = ({ text, inAt, outAt }) => {
  const frame = useCurrentFrame();

  if (frame < inAt || frame >= outAt) return null;

  // 长句在文案里用 \n 手动断行（断点落在标点后）；字号按最长一行定，保证不溢出
  const maxLen = Math.max(...text.split("\n").map((l) => l.length));
  const fontSize = maxLen > 22 ? 42 : 50;

  return (
    <div
      style={{
        position: "absolute",
        top: 596,
        left: 0,
        width: "100%",
        height: 124,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "0 40px",
        boxSizing: "border-box",
        background: "#FFFFFF",
        fontFamily: FONT,
      }}
    >
      <span
        style={{
          fontSize,
          fontWeight: 600,
          color: "#111111",
          letterSpacing: 1,
          textAlign: "center",
          lineHeight: 1.28,
          whiteSpace: "pre-line",
        }}
      >
        {text}
      </span>
    </div>
  );
};

export default Caption;
