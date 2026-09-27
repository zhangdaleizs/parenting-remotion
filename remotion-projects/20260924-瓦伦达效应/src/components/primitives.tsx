import React from "react";
import { useCurrentFrame } from "remotion";
import { THEME, STROKE, FONT, FONT_FAMILY } from "./theme";

// ===== 信息图图元库 =====
// 所有图元都按「局部帧 local」做淡入（easeOutCubic + 轻微上浮），符合参考片的静态调性。

/** 场景局部帧（由 SceneSwitcher 注入） */
export const LocalFrameCtx = React.createContext(0);
export const useLocal = () => React.useContext(LocalFrameCtx);

const easeOutCubic = (p: number) => 1 - Math.pow(1 - p, 3);

/** 进度 0→1（at 帧开始，dur 帧完成） */
export const prog = (local: number, at: number, dur = 12) => {
  if (local < at) return 0;
  return easeOutCubic(Math.min(1, (local - at) / dur));
};

/** 图元通用包裹：淡入 + 轻微上浮 */
export const Reveal: React.FC<{
  at: number;
  dur?: number;
  /** 上浮像素（默认 8） */
  rise?: number;
  children: React.ReactNode;
}> = ({ at, dur = 12, rise = 8, children }) => {
  const local = useLocal();
  const p = prog(local, at, dur);
  if (p <= 0) return null;
  return (
    <g
      opacity={p}
      style={{
        transform: `translateY(${(1 - p) * rise}px)`,
        transformBox: "fill-box",
      }}
    >
      {children}
    </g>
  );
};

/** 圆角矩形框（信息图卡片/区域） */
export const Frame: React.FC<{
  x: number;
  y: number;
  w: number;
  h: number;
  r?: number;
  stroke?: string;
  fill?: string;
  sw?: number;
  dash?: string;
}> = ({ x, y, w, h, r = 14, stroke = THEME.frame, fill = "none", sw = STROKE.normal, dash }) => (
  <rect
    x={x}
    y={y}
    width={w}
    height={h}
    rx={r}
    fill={fill}
    stroke={stroke}
    strokeWidth={sw}
    strokeDasharray={dash}
  />
);

/** 文字 */
export const Txt: React.FC<{
  x: number;
  y: number;
  text: string;
  size?: number;
  color?: string;
  anchor?: "start" | "middle" | "end";
  weight?: number;
  family?: string;
  spacing?: number;
}> = ({
  x,
  y,
  text,
  size = FONT.label,
  color = THEME.ink,
  anchor = "middle",
  weight = 600,
  family = FONT_FAMILY,
  spacing = 0,
}) => (
  <text
    x={x}
    y={y}
    fontSize={size}
    fill={color}
    textAnchor={anchor}
    fontWeight={weight}
    fontFamily={family}
    letterSpacing={spacing}
    dominantBaseline="middle"
  >
    {text}
  </text>
);

/** 小标签块（填充底 + 文字） */
export const Chip: React.FC<{
  x: number;
  y: number;
  text: string;
  size?: number;
  color?: string;
  bg?: string;
  padX?: number;
  padY?: number;
  stroke?: string;
}> = ({ x, y, text, size = FONT.labelSmall, color = THEME.inkSoft, bg = "#FFFFFF", padX = 16, padY = 9, stroke = THEME.frame }) => {
  const w = text.length * size + padX * 2;
  const h = size + padY * 2;
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={8} fill={bg} stroke={stroke} strokeWidth={STROKE.thin} />
      <Txt x={x + w / 2} y={y + h / 2 + 1} text={text} size={size} color={color} weight={500} />
    </g>
  );
};

/** 直线 */
export const Line: React.FC<{
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  color?: string;
  sw?: number;
  dash?: string;
}> = ({ x1, y1, x2, y2, color = THEME.line, sw = STROKE.normal, dash }) => (
  <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={color} strokeWidth={sw} strokeDasharray={dash} strokeLinecap="round" />
);

/** 箭头（带箭头头部） */
export const Arrow: React.FC<{
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  color?: string;
  sw?: number;
  head?: number;
  dash?: string;
}> = ({ x1, y1, x2, y2, color = THEME.inkSoft, sw = STROKE.normal, head = 12, dash }) => {
  const ang = Math.atan2(y2 - y1, x2 - x1);
  const a1 = ang + Math.PI - 0.42;
  const a2 = ang + Math.PI + 0.42;
  return (
    <g>
      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={color} strokeWidth={sw} strokeDasharray={dash} strokeLinecap="round" />
      <path
        d={`M ${x2} ${y2} L ${x2 + head * Math.cos(a1)} ${y2 + head * Math.sin(a1)} M ${x2} ${y2} L ${x2 + head * Math.cos(a2)} ${y2 + head * Math.sin(a2)}`}
        stroke={color}
        strokeWidth={sw}
        strokeLinecap="round"
        fill="none"
      />
    </g>
  );
};

/** 实心圆点 */
export const Dot: React.FC<{
  cx: number;
  cy: number;
  r?: number;
  color?: string;
  stroke?: string;
  sw?: number;
}> = ({ cx, cy, r = 7, color = THEME.accent, stroke, sw = 0 }) => (
  <circle cx={cx} cy={cy} r={r} fill={color} stroke={stroke} strokeWidth={sw} />
);

/** 空心圆环 */
export const Ring: React.FC<{
  cx: number;
  cy: number;
  r: number;
  color?: string;
  sw?: number;
}> = ({ cx, cy, r, color = THEME.inkSoft, sw = STROKE.normal }) => (
  <circle cx={cx} cy={cy} r={r} fill="none" stroke={color} strokeWidth={sw} />
);

/** 数据条（底槽 + 填充 + 可选数值） */
export const Bar: React.FC<{
  x: number;
  y: number;
  w: number;
  h: number;
  /** 填充比例 0-1 */
  ratio: number;
  color?: string;
  track?: string;
  value?: string;
  valueColor?: string;
  valueSize?: number;
}> = ({ x, y, w, h, ratio, color = THEME.bar, track = "#DCD5CA", value, valueColor = THEME.ink, valueSize = FONT.label }) => (
  <g>
    <rect x={x} y={y} width={w} height={h} rx={h / 2} fill={track} />
    <rect x={x} y={y} width={Math.max(h, w * ratio)} height={h} rx={h / 2} fill={color} />
    {value ? (
      <Txt x={x + w + 26} y={y + h / 2 + 1} text={value} size={valueSize} color={valueColor} anchor="start" weight={600} />
    ) : null}
  </g>
);

/** 公式/说明行（居中，斜体变量感） */
export const Formula: React.FC<{
  x: number;
  y: number;
  text: string;
  size?: number;
  color?: string;
  family?: string;
}> = ({ x, y, text, size = FONT.formula, color = THEME.inkSoft, family = FONT_FAMILY }) => (
  <Txt x={x} y={y} text={text} size={size} color={color} weight={500} family={family} />
);

/** 小人（圆头 + 肩线），用于"关系"类图示 */
export const Person: React.FC<{
  x: number;
  y: number;
  scale?: number;
  color?: string;
  sw?: number;
}> = ({ x, y, scale = 1, color = THEME.inkSoft, sw = STROKE.normal }) => (
  <g transform={`translate(${x},${y}) scale(${scale})`}>
    <circle cx={0} cy={-34} r={20} fill="none" stroke={color} strokeWidth={sw} />
    <path d="M -38 42 C -38 2, -18 -8, 0 -8 C 18 -8, 38 2, 38 42" fill="none" stroke={color} strokeWidth={sw} strokeLinecap="round" />
  </g>
);

/**
 * 场景通用容器：全屏 svg + 局部帧 Context。
 * 图示层做 crossfade（新图淡入盖旧图），旧图延后到「下一张完全淡入之后」才卸载，
 * 否则过渡瞬间会露出背景（见 CLAUDE.md 坑表「切换瞬间闪一帧白」）。
 */
export const Stage: React.FC<{
  /** 全局入场帧 */
  inAt: number;
  /** 全局出场帧（= inAt + dur） */
  outAt: number;
  /** 淡入帧数 */
  fade?: number;
  children: React.ReactNode;
}> = ({ inAt, outAt, fade = 12, children }) => {
  const frame = useCurrentFrame();
  const local = frame - inAt;
  if (frame >= outAt + fade) return null;
  const p = prog(local, 0, fade);
  if (p <= 0) return null;
  return (
    <LocalFrameCtx.Provider value={local}>
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 1920 1080"
        style={{ position: "absolute", top: 0, left: 0, opacity: p }}
      >
        {children}
      </svg>
    </LocalFrameCtx.Provider>
  );
};
