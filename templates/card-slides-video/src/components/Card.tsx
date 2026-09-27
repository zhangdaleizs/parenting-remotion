import React from "react";
import { AbsoluteFill } from "remotion";
import { THEME, LAYOUT, FONT, FONT_FAMILY, SCREEN } from "./theme";
import { BoardIcon } from "./BoardIcon";
import type { IconName, IconBadge } from "./BoardIcon";
import { useCardIn, useCardOut } from "./utils";

/**
 * 单张口诀卡版式（实测对齐参考视频）：
 *
 *      ┌──────────┐      ← 白圆角卡 252×252，y=42，带轻投影
 *      │   图标    │
 *      └──────────┘
 *          [三]           ← 序号（深蓝），中心 y=390
 *      肉要适量吃蔬菜要管够   ← 口诀（赭橙），中心 y=522
 *         账号名          ← 水印，y=660
 */
export const Card: React.FC<{
  /** 中文序号，如「一」。hideIndex 为 true 时不显示 */
  index?: string;
  /** 首行提示语（蓝色、与口诀同字号）。有它时顶替序号占槽 1 */
  lead?: string;
  icon: IconName;
  badge?: IconBadge;
  /** 口诀文案。用 \n 手动断行 */
  text: string;
  /** 全局帧：入场起点 */
  inAt?: number;
  /** 全局帧：出场起点 */
  outAt?: number;
  /** 标题卡 / 钩子卡：不显示序号 */
  hideIndex?: boolean;
  /** 底部水印账号名 */
  watermark?: string;
}> = ({ index, lead, icon, badge = "none", text, inAt, outAt, hideIndex = false, watermark }) => {
  const enter = useCardIn(inAt ?? -9999);
  const exit = useCardOut(outAt ?? 99999);

  const opacity = enter.opacity * exit;
  const ty = enter.translateY;

  // ⚠️ 参考版式（实测）：
  //   槽 1 = 序号（蓝，小）或 首行提示语（蓝，大）—— 二选一
  //   槽 2 = 橙色口诀，**单行**；多句用 `/` 分隔（如「肉要适量吃/蔬菜要管够」），不要换行
  //   两槽中心固定 y=386 / y=518，内容多也不要挪动它们
  const top = lead ?? (hideIndex ? undefined : index);
  const topIsBody = Boolean(lead);

  return (
    <AbsoluteFill style={{ opacity, fontFamily: FONT_FAMILY }}>
      {/* 白卡 + 图标 */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: LAYOUT.cardY,
          display: "flex",
          justifyContent: "center",
          transform: `translateY(${Math.round(ty)}px)`,
          willChange: "transform",
        }}
      >
        <div
          style={{
            width: LAYOUT.cardSize,
            height: LAYOUT.cardSize,
            background: THEME.card,
            borderRadius: LAYOUT.cardRadius,
            boxShadow: `0 8px 26px ${THEME.cardShadow}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <BoardIcon
            name={icon}
            size={LAYOUT.cardSize - LAYOUT.iconPad * 2}
            badge={badge}
          />
        </div>
      </div>

      {/* 槽 1：首行提示语（蓝，大）/ 双行文案首行（橙，大）/ 序号（蓝，小） */}
      {top ? (
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: LAYOUT.indexY,
            transform: `translateY(-50%) translateY(${Math.round(ty)}px)`,
            textAlign: "center",
            color: THEME.index,
            fontSize: topIsBody ? FONT.text : FONT.index,
            fontWeight: topIsBody ? 700 : 600,
            lineHeight: 1,
            whiteSpace: "pre-line",
            paddingLeft: 60,
            paddingRight: 60,
            letterSpacing: 1,
            willChange: "transform",
          }}
        >
          {top}
        </div>
      ) : null}

      {/* 槽 2：口诀（橙） */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: LAYOUT.textY,
          transform: `translateY(-50%) translateY(${Math.round(ty)}px)`,
          textAlign: "center",
          color: THEME.text,
          fontSize: FONT.text,
          fontWeight: 700,
          lineHeight: 1,
          whiteSpace: "pre-line",
          paddingLeft: 60,
          paddingRight: 60,
          letterSpacing: 1,
          willChange: "transform",
        }}
      >
        {text}
      </div>

      {/* 水印 */}
      {watermark ? (
        <div
          style={{
            position: "absolute",
            left: 0,
            right: SCREEN.width - 1180,
            top: LAYOUT.watermarkY,
            textAlign: "center",
            color: THEME.watermark,
            fontSize: FONT.watermark,
            fontWeight: 500,
          }}
        >
          {watermark}
        </div>
      ) : null}
    </AbsoluteFill>
  );
};

export default Card;
