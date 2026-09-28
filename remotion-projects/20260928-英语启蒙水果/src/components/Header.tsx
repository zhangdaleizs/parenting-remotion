import React from "react";
import { AbsoluteFill } from "remotion";
import { COLORS, LAYOUT } from "../config";
import { ZH_FONT } from "./fonts";

/** 按「墨迹中心 y」定位的居中文字行 */
const CenterLine: React.FC<{ centerY: number; size: number; weight: number; color: string; children: React.ReactNode }> = ({
  centerY,
  size,
  weight,
  color,
  children,
}) => (
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
      fontFamily: ZH_FONT,
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

/** 顶部标题常驻全片，无入场动画（参考片第 0 帧即在场） */
export const Header: React.FC = () => (
  <AbsoluteFill>
    <CenterLine centerY={LAYOUT.titleCenterY} size={LAYOUT.titleFontSize} weight={700} color={COLORS.ink}>
      每天30秒打卡亲子英语
    </CenterLine>
    <CenterLine
      centerY={LAYOUT.subtitleCenterY}
      size={LAYOUT.subtitleFontSize}
      weight={600}
      color={COLORS.subtitle}
    >
      【水果】
    </CenterLine>
  </AbsoluteFill>
);
