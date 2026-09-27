import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { easeOutCubic } from "../utils";

export const W = 1080;
export const H = 1440;

/** 统一风格：扁平色块、无描边、圆润轮廓。所有场景只用这里的零件拼装，
 *  保证 13 个场景像同一个人画的。 */

// ── 背景 ──────────────────────────────────────────────
export const Sky: React.FC<{ top: string; bottom: string; id: string }> = ({
  top,
  bottom,
  id,
}) => (
  <>
    <defs>
      <linearGradient id={`sky-${id}`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor={top} />
        <stop offset="100%" stopColor={bottom} />
      </linearGradient>
    </defs>
    <rect x={0} y={0} width={W} height={H} fill={`url(#sky-${id})`} />
  </>
);

/** 地面：一条起伏的草地/雪地/沙地曲线 */
export const Ground: React.FC<{ y: number; color: string; shade?: string }> = ({
  y,
  color,
  shade,
}) => (
  <>
    <path
      d={`M0,${y + 40} Q${W * 0.22},${y - 55} ${W * 0.5},${y + 8} T${W},${y - 30} L${W},${H} L0,${H} Z`}
      fill={color}
    />
    {shade ? (
      <path
        d={`M0,${y + 130} Q${W * 0.3},${y + 60} ${W * 0.62},${y + 120} T${W},${y + 80} L${W},${H} L0,${H} Z`}
        fill={shade}
        opacity={0.55}
      />
    ) : null}
  </>
);

// ── 天象 ──────────────────────────────────────────────
export const Cloud: React.FC<{
  x: number;
  y: number;
  scale?: number;
  drift?: number;
  phase?: number;
  color?: string;
  opacity?: number;
}> = ({ x, y, scale = 1, drift = 26, phase = 0, color = "#FFFFFF", opacity = 0.92 }) => {
  const frame = useCurrentFrame();
  const dx = Math.sin((frame / 420) * Math.PI * 2 + phase) * drift;
  return (
    <g transform={`translate(${x + dx}, ${y}) scale(${scale})`} opacity={opacity}>
      <ellipse cx={0} cy={0} rx={74} ry={48} fill={color} />
      <ellipse cx={-62} cy={16} rx={48} ry={33} fill={color} />
      <ellipse cx={62} cy={13} rx={54} ry={37} fill={color} />
      <ellipse cx={16} cy={-28} rx={46} ry={36} fill={color} />
    </g>
  );
};

export const Sun: React.FC<{ x: number; y: number; r?: number; color?: string }> = ({
  x,
  y,
  r = 76,
  color = "#FFD34D",
}) => {
  const frame = useCurrentFrame();
  const rot = frame * 0.22;
  return (
    <g transform={`translate(${x}, ${y})`}>
      <g transform={`rotate(${rot})`} opacity={0.85}>
        {Array.from({ length: 12 }).map((_, i) => (
          <rect
            key={i}
            x={-7}
            y={-r - 40}
            width={14}
            height={30}
            rx={7}
            fill={color}
            transform={`rotate(${i * 30})`}
          />
        ))}
      </g>
      <circle r={r} fill={color} />
    </g>
  );
};

export const Moon: React.FC<{ x: number; y: number; r?: number; color?: string }> = ({
  x,
  y,
  r = 70,
  color = "#FFF3C4",
}) => {
  const frame = useCurrentFrame();
  const twinkle = 0.6 + 0.4 * Math.sin(frame * 0.06);
  return (
    <g transform={`translate(${x}, ${y})`}>
      <circle r={r * 1.5} fill={color} opacity={0.14} />
      <path
        d={`M ${r * 0.45},${-r} A ${r},${r} 0 1 0 ${r * 0.45},${r} A ${r * 0.78},${r * 0.78} 0 1 1 ${r * 0.45},${-r} Z`}
        fill={color}
      />
      <circle cx={-110} cy={-70} r={7} fill={color} opacity={twinkle} />
      <circle cx={-150} cy={30} r={5} fill={color} opacity={0.8} />
      <circle cx={90} cy={-100} r={5} fill={color} opacity={0.7} />
    </g>
  );
};

// ── 植被 ──────────────────────────────────────────────
export const Tree: React.FC<{
  x: number;
  y: number;
  scale?: number;
  leaf?: string;
  trunk?: string;
  sway?: number;
}> = ({ x, y, scale = 1, leaf = "#6FBF73", trunk = "#A9744F", sway = 0.5 }) => {
  const frame = useCurrentFrame();
  const rot = Math.sin(frame * 0.02) * sway;
  return (
    <g transform={`translate(${x}, ${y}) scale(${scale})`}>
      <rect x={-11} y={-60} width={22} height={70} rx={9} fill={trunk} />
      <g transform={`rotate(${rot}, 0, -60)`}>
        <ellipse cx={0} cy={-130} rx={86} ry={78} fill={leaf} />
        <ellipse cx={-58} cy={-88} rx={56} ry={50} fill={leaf} />
        <ellipse cx={58} cy={-92} rx={54} ry={48} fill={leaf} />
      </g>
    </g>
  );
};

export const Pine: React.FC<{
  x: number;
  y: number;
  scale?: number;
  leaf?: string;
  trunk?: string;
}> = ({ x, y, scale = 1, leaf = "#4E9E6A", trunk = "#8C6244" }) => (
  <g transform={`translate(${x}, ${y}) scale(${scale})`}>
    <rect x={-9} y={-46} width={18} height={56} rx={7} fill={trunk} />
    <path d="M0,-250 L74,-140 L-74,-140 Z" fill={leaf} />
    <path d="M0,-190 L88,-72 L-88,-72 Z" fill={leaf} />
    <path d="M0,-124 L100,-8 L-100,-8 Z" fill={leaf} />
  </g>
);

export const Bush: React.FC<{ x: number; y: number; scale?: number; color?: string }> = ({
  x,
  y,
  scale = 1,
  color = "#7CC47F",
}) => (
  <g transform={`translate(${x}, ${y}) scale(${scale})`}>
    <ellipse cx={0} cy={0} rx={72} ry={50} fill={color} />
    <ellipse cx={-52} cy={10} rx={46} ry={34} fill={color} />
    <ellipse cx={52} cy={8} rx={48} ry={36} fill={color} />
  </g>
);

export const Flower: React.FC<{
  x: number;
  y: number;
  scale?: number;
  petal?: string;
  core?: string;
}> = ({ x, y, scale = 1, petal = "#FF8FA3", core = "#FFD34D" }) => (
  <g transform={`translate(${x}, ${y}) scale(${scale})`}>
    <rect x={-4} y={-46} width={8} height={50} rx={4} fill="#5FA463" />
    {Array.from({ length: 6 }).map((_, i) => (
      <ellipse
        key={i}
        cx={0}
        cy={-58}
        rx={13}
        ry={22}
        fill={petal}
        transform={`rotate(${i * 60}, 0, -58)`}
      />
    ))}
    <circle cy={-58} r={13} fill={core} />
  </g>
);

// ── 角色 ──────────────────────────────────────────────
type Ear = "round" | "pointy" | "long" | "none" | "tuft";

/** 角色统一放大系数 —— 参考片的角色占画面高度约 1/3，比单看组件时直觉要大得多。
 *  改这一个值就能让 13 个场景的角色同步变大/变小 */
const CHAR_SCALE = 1.5;

/**
 * 通用小动物。所有场景的角色都从这里出，只换颜色 / 耳朵 / 表情，
 * 保证 13 个场景的角色是同一套画风。
 */
export const Critter: React.FC<{
  x: number;
  y: number;
  scale?: number;
  body: string;
  belly?: string;
  ear?: Ear;
  earColor?: string;
  /** 表情 */
  eyes?: "open" | "happy" | "closed";
  mouth?: "smile" | "open" | "o" | "none";
  blush?: boolean;
  /** 露出两只小脚 */
  feet?: boolean;
  footColor?: string;
  /** 让角色轻微上下浮动（呼吸感） */
  bob?: number;
  phase?: number;
  /** 整体倾斜（用于摇头/点头的姿态） */
  tilt?: number;
  /** 局部坐标下额外绘制（手臂、道具等） */
  children?: React.ReactNode;
}> = ({
  x,
  y,
  scale = 1,
  body,
  belly,
  ear = "round",
  earColor,
  eyes = "open",
  mouth = "smile",
  blush = true,
  feet = true,
  footColor,
  bob = 6,
  phase = 0,
  tilt = 0,
  children,
}) => {
  const frame = useCurrentFrame();
  const dy = Math.sin(frame * 0.055 + phase) * bob;
  const ec = earColor ?? body;

  return (
    <g transform={`translate(${x}, ${y + dy}) scale(${scale * CHAR_SCALE}) rotate(${tilt})`}>
      {/* 耳朵 */}
      {ear === "round" && (
        <>
          <circle cx={-52} cy={-104} r={30} fill={ec} />
          <circle cx={52} cy={-104} r={30} fill={ec} />
        </>
      )}
      {ear === "pointy" && (
        <>
          <path d="M-58,-86 L-30,-150 L-6,-92 Z" fill={ec} />
          <path d="M58,-86 L30,-150 L6,-92 Z" fill={ec} />
        </>
      )}
      {ear === "long" && (
        <>
          <ellipse cx={-30} cy={-146} rx={19} ry={54} fill={ec} transform="rotate(-10, -30, -146)" />
          <ellipse cx={30} cy={-146} rx={19} ry={54} fill={ec} transform="rotate(10, 30, -146)" />
        </>
      )}
      {ear === "tuft" && (
        <>
          <path d="M-34,-108 L-46,-158 L-6,-124 Z" fill={ec} />
          <path d="M34,-108 L46,-158 L6,-124 Z" fill={ec} />
        </>
      )}

      {/* 脚 */}
      {feet ? (
        <>
          <ellipse cx={-44} cy={116} rx={34} ry={20} fill={footColor ?? body} />
          <ellipse cx={44} cy={116} rx={34} ry={20} fill={footColor ?? body} />
        </>
      ) : null}

      {/* 身体 + 肚皮 */}
      <ellipse cx={0} cy={0} rx={92} ry={104} fill={body} />
      {belly ? <ellipse cx={0} cy={24} rx={58} ry={66} fill={belly} /> : null}

      {/* 脸 */}
      <g transform="translate(0, -34)">
        {eyes === "open" && (
          <>
            <circle cx={-32} cy={0} r={15} fill="#2B2B2B" />
            <circle cx={32} cy={0} r={15} fill="#2B2B2B" />
            <circle cx={-27} cy={-5} r={5} fill="#FFFFFF" />
            <circle cx={37} cy={-5} r={5} fill="#FFFFFF" />
          </>
        )}
        {eyes === "happy" && (
          <>
            <path d="M-47,4 Q-32,-16 -17,4" stroke="#2B2B2B" strokeWidth={8} fill="none" strokeLinecap="round" />
            <path d="M17,4 Q32,-16 47,4" stroke="#2B2B2B" strokeWidth={8} fill="none" strokeLinecap="round" />
          </>
        )}
        {eyes === "closed" && (
          <>
            <path d="M-47,0 Q-32,14 -17,0" stroke="#2B2B2B" strokeWidth={8} fill="none" strokeLinecap="round" />
            <path d="M17,0 Q32,14 47,0" stroke="#2B2B2B" strokeWidth={8} fill="none" strokeLinecap="round" />
          </>
        )}

        {mouth === "smile" && (
          <path d="M-16,30 Q0,46 16,30" stroke="#2B2B2B" strokeWidth={7} fill="none" strokeLinecap="round" />
        )}
        {mouth === "open" && <ellipse cx={0} cy={34} rx={17} ry={14} fill="#2B2B2B" />}
        {mouth === "o" && <circle cx={0} cy={34} r={11} fill="#2B2B2B" />}

        {blush && (
          <>
            <ellipse cx={-64} cy={26} rx={19} ry={12} fill="#FF9BAE" opacity={0.62} />
            <ellipse cx={64} cy={26} rx={19} ry={12} fill="#FF9BAE" opacity={0.62} />
          </>
        )}
      </g>

      {children}
    </g>
  );
};

// ── 通用小道具 ─────────────────────────────────────────
/** 对话气泡 / 提示气泡（用于 hello、hi 这类） */
export const Bubble: React.FC<{
  x: number;
  y: number;
  scale?: number;
  text: string;
  color?: string;
  textColor?: string;
  fontSize?: number;
  at?: number;
}> = ({ x, y, scale = 1, text, color = "#FFFFFF", textColor = "#2B2B2B", fontSize = 54, at = 0 }) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [at, at + 12], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: easeOutCubic,
  });
  if (p <= 0) return null;
  const w = Math.max(180, text.length * fontSize * 0.62 + 70);
  return (
    <g transform={`translate(${x}, ${y}) scale(${scale * (0.7 + 0.3 * p)})`} opacity={p}>
      <rect x={-w / 2} y={-64} width={w} height={124} rx={58} fill={color} />
      <path d={`M-24,58 L0,96 L26,58 Z`} fill={color} />
      <text
        x={0}
        y={22}
        textAnchor="middle"
        fontSize={fontSize}
        fill={textColor}
        fontWeight={700}
        fontFamily="Baloo2"
      >
        {text}
      </text>
    </g>
  );
};

/** 入场包装：淡入 + 上浮。本片所有场景元素统一用它入场 */
export const Enter: React.FC<{
  at: number;
  dy?: number;
  children: React.ReactNode;
}> = ({ at, dy = 30, children }) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [at, at + 14], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: easeOutCubic,
  });
  return (
    <g opacity={p} transform={`translate(0, ${(1 - p) * dy})`}>
      {children}
    </g>
  );
};

/** 场景根：1080×1440 的 SVG 画布 */
export const Stage: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <svg
    width={W}
    height={H}
    viewBox={`0 0 ${W} ${H}`}
    style={{ position: "absolute", inset: 0 }}
  >
    {children}
  </svg>
);
