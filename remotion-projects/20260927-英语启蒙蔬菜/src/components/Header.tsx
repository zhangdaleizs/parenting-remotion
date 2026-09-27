import React from "react";
import { AbsoluteFill } from "remotion";
import { COLORS, LAYOUT } from "../config";
import { ZH_FONT } from "./fonts";

/** 顶部标题常驻全片，无入场动画（参考片第 0 帧即在场） */
export const Header: React.FC = () => (
  <AbsoluteFill>
    <div
      style={{
        position: "absolute",
        top: LAYOUT.titleTop,
        left: 0,
        width: "100%",
        textAlign: "center",
        fontFamily: ZH_FONT,
        fontWeight: 700,
        fontSize: LAYOUT.titleFontSize,
        lineHeight: 1.1,
        color: COLORS.ink,
      }}
    >
      10秒记住一串单词
    </div>
    <div
      style={{
        position: "absolute",
        top: LAYOUT.subtitleTop,
        left: 0,
        width: "100%",
        textAlign: "center",
        fontFamily: ZH_FONT,
        fontWeight: 600,
        fontSize: LAYOUT.subtitleFontSize,
        lineHeight: 1.1,
        color: COLORS.subtitle,
      }}
    >
      蔬菜类
    </div>
  </AbsoluteFill>
);
