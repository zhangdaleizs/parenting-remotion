import React from "react";
import { THEME } from "./theme";

/**
 * 简笔图标库（育儿主题）。
 *
 * 风格铁律（照参考视频实测）：
 *  - 纯黑粗线 + 圆头端点 + 圆角连接 + 无填充
 *  - 圆润曲线，不出现尖锐直角
 *  - 拟人小表情（两点眼 + 弧线嘴）
 *  - 可选小装饰符号（✓ ⚠ ✗ ♥）
 *
 * ⚠️ 所有图标共用同一 viewBox(100×100) 与同一 strokeWidth，
 *    **不要为单个图标单独调粗细**——一致性才是质感来源。
 * ⚠️ 图形要画满 viewBox（约 10-90），参考图标占白卡约 60%；
 *    画太小会让白卡显得空、整体变廉价。
 */

/** viewBox 内的线宽。100 单位映射到白卡内 ~220px，缩放 2.2 → 实际约 6px（与参考一致） */
const SW = 2.7;

export type IconName =
  | "bowl" // 饭碗（喂饭 / 七分饱）
  | "pear" // 梨（寒凉水果）
  | "veggie" // 蔬菜盘（肉菜搭配）
  | "baby" // 婴儿（标题 / 通则）
  | "babySleep" // 婴儿睡觉（作息）
  | "belly" // 摸肚子（揉肚皮）
  | "onion" // 穿衣小孩（洋葱式穿衣）
  | "sun" // 太阳（户外活动）
  | "pill"; // 药瓶（不要随便喂药）

/** 拟人表情：两点眼 + 弧线嘴 */
const Face: React.FC<{ cx: number; cy: number; r?: number }> = ({ cx, cy, r = 2.9 }) => (
  <g fill={THEME.ink} stroke="none">
    <circle cx={cx - 9} cy={cy} r={r} />
    <circle cx={cx + 9} cy={cy} r={r} />
    <path
      d={`M${cx - 5} ${cy + 8} Q${cx} ${cy + 12} ${cx + 5} ${cy + 8}`}
      fill="none"
      stroke={THEME.ink}
      strokeWidth={SW}
      strokeLinecap="round"
    />
  </g>
);

/** 闭眼睡觉的弧线眼 */
const SleepEyes: React.FC<{ cx: number; cy: number }> = ({ cx, cy }) => (
  <g fill="none" stroke={THEME.ink} strokeWidth={SW} strokeLinecap="round">
    <path d={`M${cx - 13} ${cy} Q${cx - 9} ${cy + 4.5} ${cx - 5} ${cy}`} />
    <path d={`M${cx + 5} ${cy} Q${cx + 9} ${cy + 4.5} ${cx + 13} ${cy}`} />
  </g>
);

/** 装饰符号：右上角小标记（与图标同线宽） */
export type IconBadge = "check" | "warn" | "cross" | "heart" | "none";

const Badge: React.FC<{ badge: IconBadge }> = ({ badge }) => {
  if (badge === "none") return null;
  const common = {
    stroke: THEME.ink,
    strokeWidth: SW,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    fill: "none",
  };
  switch (badge) {
    case "check":
      return <path d="M73 22 L79 29 L92 11" {...common} />;
    case "warn":
      return (
        <g {...common}>
          <path d="M83 8 L96 32 H70 Z" />
          <path d="M83 16 V23" />
          <path d="M83 27.5 V28" strokeWidth={SW + 1.6} />
        </g>
      );
    case "cross":
      return (
        <g {...common}>
          <path d="M73 10 L93 32" />
          <path d="M93 10 L73 32" />
        </g>
      );
    case "heart":
      return (
        <path
          d="M83 33 Q70 23 70 15 Q70 7.5 77.5 7.5 Q83 7.5 83 14 Q83 7.5 88.5 7.5 Q96 7.5 96 15 Q96 23 83 33 Z"
          {...common}
        />
      );
  }
};

const Shape: React.FC<{ name: IconName }> = ({ name }) => {
  const s = {
    stroke: THEME.ink,
    strokeWidth: SW,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    fill: "none",
  };
  switch (name) {
    case "bowl":
      return (
        <g {...s}>
          {/* 碗口 */}
          <path d="M16 48 H84" />
          {/* 碗身 */}
          <path d="M22 48 Q24 88 50 88 Q76 88 78 48" />
          {/* 冒尖的饭 */}
          <path d="M26 48 Q30 26 42 34 Q50 18 58 34 Q70 26 74 48" />
          <Face cx={50} cy={64} />
        </g>
      );
    case "pear":
      return (
        <g {...s}>
          {/* 梗 */}
          <path d="M50 22 Q57 12 54 2" />
          {/* 果身：上窄下宽的水滴形（顶部收窄才是梨，画成椭圆会像蛋） */}
          <path d="M50 24 Q38 29 33 47 Q22 76 40 87 Q50 92 60 87 Q78 76 67 47 Q62 29 50 24" />
          {/* 果皮纹理 */}
          <path d="M57 73 Q65 70 68 61" />
          <Face cx={50} cy={56} r={3.1} />
        </g>
      );
    case "veggie":
      return (
        <g {...s}>
          {/* 椭圆浅盘（参考是平盘不是碗） */}
          <ellipse cx={50} cy={72} rx={36} ry={12} />
          {/* 盘中一簇菜叶 */}
          <path d="M31 64 Q25 53 33 44 Q41 36 50 45 Q59 36 67 44 Q75 53 69 64" />
          {/* 叶脉 */}
          <path d="M50 64 V48" />
          {/* 旁边一根胡萝卜 */}
          <path d="M70 43 L79 28" />
          <path d="M75 27 Q82 24 85 31" />
        </g>
      );
    case "baby":
      return (
        <g {...s}>
          {/* 头 */}
          <circle cx={50} cy={36} r={26} />
          {/* 呆毛 */}
          <path d="M50 11 Q55 3 63 2" />
          <Face cx={50} cy={33} r={3.2} />
          {/* 襁褓 */}
          <path d="M23 66 Q24 89 50 91 Q76 89 77 66" />
          {/* 襁褓褶皱（防止下半身太空） */}
          <path d="M37 78 Q50 84 63 78" />
          {/* 两只小手 */}
          <path d="M23 66 Q18 75 24 81" />
          <path d="M77 66 Q82 75 76 81" />
        </g>
      );
    case "babySleep":
      return (
        <g {...s}>
          {/* 趴睡的身形 */}
          <path d="M18 82 Q20 58 40 55 Q68 52 75 72 Q78 84 68 84" />
          <path d="M18 82 H66" />
          {/* 头 */}
          <circle cx={41} cy={41} r={20} />
          <SleepEyes cx={41} cy={40} />
          {/* 睡意泡泡 */}
          <path d="M74 28 a6 6 0 1 0 -6 -6" />
        </g>
      );
    case "belly":
      return (
        <g {...s}>
          {/* 头 */}
          <circle cx={50} cy={27} r={19} />
          <Face cx={50} cy={25} r={2.6} />
          {/* 身体 */}
          <path d="M30 51 Q28 84 50 88 Q72 84 70 51" />
          {/* 肚子 + 揉的手 */}
          <circle cx={50} cy={68} r={10} />
          <path d="M31 62 Q36 76 50 79 Q64 76 69 62" />
        </g>
      );
    case "onion":
      return (
        <g {...s}>
          {/* 头 */}
          <circle cx={50} cy={23} r={16} />
          <Face cx={50} cy={21} r={2.4} />
          {/* 身体 + 分层衣（洋葱式） */}
          <path d="M34 42 Q32 64 32 86 H68 Q68 64 66 42" />
          <path d="M34 57 H66" />
          <path d="M33 71 H67" />
          {/* 手臂 */}
          <path d="M34 51 L20 61" />
          <path d="M66 51 L80 61" />
        </g>
      );
    case "sun":
      return (
        <g {...s}>
          <circle cx={50} cy={50} r={21} />
          <Face cx={50} cy={48} r={2.7} />
          {/* 光芒 */}
          <path d="M50 10 V20" />
          <path d="M50 80 V90" />
          <path d="M10 50 H20" />
          <path d="M80 50 H90" />
          <path d="M22 22 L29 29" />
          <path d="M71 71 L78 78" />
          <path d="M78 22 L71 29" />
          <path d="M29 71 L22 78" />
        </g>
      );
    case "pill":
      return (
        <g {...s}>
          {/* 瓶盖 */}
          <path d="M24 10 H76 V25 H24 Z" />
          {/* 瓶身 */}
          <path d="M27 25 V79 Q27 90 38 90 H62 Q73 90 73 79 V25" />
          {/* 标签 */}
          <path d="M27 47 H73" />
          <path d="M27 61 H73" />
        </g>
      );
  }
};

export const BoardIcon: React.FC<{
  name: IconName;
  /** 绘制边长（px）。默认填满白卡内缩后的区域 */
  size?: number;
  badge?: IconBadge;
}> = ({ name, size = 220, badge = "none" }) => (
  <svg width={size} height={size} viewBox="0 0 100 100">
    <Shape name={name} />
    <Badge badge={badge} />
  </svg>
);

export default BoardIcon;
