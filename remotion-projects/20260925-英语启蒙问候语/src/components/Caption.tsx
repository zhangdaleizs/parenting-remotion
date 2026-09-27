import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { FPS, LAYOUT, VIDEO_WIDTH, type SlideSpec } from "../config";
import { EN_FONT, ZH_FONT } from "./fonts";

const CAPTION_COLOR = "#1A1A1A";
/** 浅色天空上几乎看不出，深色夜空场景（good night）靠它保证黑字可读 */
const HALO = "0 0 26px rgba(255,255,255,0.95), 0 0 54px rgba(255,255,255,0.72)";

/** 中文行里夹着英文单词（"来是come 去是go"），按语种切段分别套字体 */
const tokenizeZh = (zh: string): { text: string; latin: boolean }[] =>
  zh
    .split(/([A-Za-z]+)/)
    .filter((s) => s.length > 0)
    .map((s) => ({ text: s, latin: /^[A-Za-z]+$/.test(s) }));

/**
 * 左上角双语字幕：中文提示行在上、英文行在下。
 * 英文行逐词点亮（未念到 22% 灰，念到即变黑并轻微弹起）—— 这是本片相对源片的主要差别，
 * 让「磨耳朵」的重复节奏在画面上可见。
 */
export const Caption: React.FC<{ slide: SlideSpec }> = ({ slide }) => {
  const frame = useCurrentFrame();

  const zhParts = tokenizeZh(slide.zh);
  const enWords = slide.en.split(" ");

  // 中文行整体淡入（前 8 帧）
  const zhOpacity = interpolate(frame, [0, 8], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        position: "absolute",
        top: LAYOUT.captionTop,
        left: (VIDEO_WIDTH - LAYOUT.captionWidth) / 2,
        width: LAYOUT.captionWidth,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <div
        style={{
          fontFamily: ZH_FONT,
          fontSize: LAYOUT.zhFontSize,
          lineHeight: LAYOUT.zhLineHeight,
          color: CAPTION_COLOR,
          opacity: zhOpacity,
          textShadow: HALO,
          textAlign: "center",
          whiteSpace: "pre",
        }}
      >
        {zhParts.map((p, i) =>
          p.latin ? (
            <span
              key={i}
              style={{
                fontFamily: EN_FONT,
                fontWeight: 700,
                fontSize: LAYOUT.zhFontSize * 1.06,
              }}
            >
              {p.text}
            </span>
          ) : (
            <span key={i} style={{ WebkitTextStroke: `${LAYOUT.zhStrokeWidth}px ${CAPTION_COLOR}` }}>
              {p.text}
            </span>
          ),
        )}
      </div>

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          gap: `0 ${LAYOUT.enFontSize * 0.26}px`,
          marginTop: LAYOUT.zhEnGap,
          fontFamily: EN_FONT,
          fontWeight: 700,
          fontSize: LAYOUT.enFontSize,
          lineHeight: LAYOUT.enLineHeight,
          color: CAPTION_COLOR,
          textShadow: HALO,
        }}
      >
        {enWords.map((w, i) => {
          const cue = slide.enWords[i];
          const litAt = cue ? Math.round(cue.at * FPS) : 0;
          // 未念到：22% 灰；念到：6 帧内变黑并弹起
          const p = interpolate(frame, [litAt, litAt + 6], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });
          const pop = Math.sin(p * Math.PI) * 0.06;
          return (
            <span
              key={i}
              style={{
                opacity: 0.22 + 0.78 * p,
                transform: `scale(${1 + pop})`,
                transformOrigin: "center center",
                willChange: "transform",
                display: "inline-block",
              }}
            >
              {w}
            </span>
          );
        })}
      </div>
    </div>
  );
};
