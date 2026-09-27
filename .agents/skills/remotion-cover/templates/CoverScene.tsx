import React from "react";
import { AbsoluteFill, useVideoConfig } from "remotion";
import { BOARD_THEME, FONT_SANS, FONT_HAND, MeasureBar, DownBrace } from "../components";

/**
 * 高点击率封面通用模板（黑板解题板 · 深色板书风）
 *
 * 设计法则（沿用封面点击行为研究，换成黑板视觉）：
 * 1. 主视觉 = 具体数学图形（量条/线段图/几何），占画面 40%+，文字尽量少
 * 2. 标题用疑问句（"共带了多少钱？"），不用感叹句
 * 3. 深灰底 + 高对比白/黄橙，强调色 ≤3 种；不堆装饰
 *
 * 用法：
 * - 复制本文件到项目 src/scenes/CoverScene.tsx
 * - 把题目核心图形加进 MAIN_VISUALS（defaultProps 传 key，避免 ReactNode 序列化问题）
 * - 注册两个 Composition：cover（1920×1440 横 4:3）+ cover-vertical（1080×1440 竖 3:4）
 * - 传 title（疑问句）/ eyebrow（眉标）/ banner（可选）/ visual / vertical
 */

interface CoverSceneProps {
  title?: string;
  eyebrow?: string;
  /** 可选动机横幅（研究建议少文字，默认不显示） */
  banner?: string;
  /** 主视觉 key（MAIN_VISUALS 里注册） */
  visual?: string;
  /** 竖屏 3:4（1080×1440），默认横屏 4:3（1920×1440） */
  vertical?: boolean;
}

/** 内置示例主视觉：量条对齐比较（一盒 / 带的钱 / 两盒）。项目可替换成题目自己的图形 */
const BarCompareVisual: React.FC = () => {
  const k = 16;
  const g1 = 22 * k;
  const g2 = 34 * k;
  const g3 = 44 * k;
  // 左侧标签占宽约 174px；右移其一半，使「量条 + 标签」整体中心落在 x=0（否则放大后标签会被画布裁掉）
  const x0 = -g3 / 2 + 87;
  // y 取值已让整个图形（含端钩与"差 10"标签）视觉中心落在 (0,0)，且间距拉大以占满竖版高度
  const y1 = -240;
  const y2 = -40;
  const y3 = 160;
  return (
    <g>
      {/* 一盒 */}
      <MeasureBar x1={x0} x2={x0 + g1} y={y1} color={BOARD_THEME.blue} w={13} hook={26} />
      {/* 带的钱 = 一盒 + 剩 */}
      <MeasureBar x1={x0} x2={x0 + g1} y={y2} color={BOARD_THEME.blue} w={13} hook={26} hookRight={false} />
      <MeasureBar x1={x0 + g1 + 6} x2={x0 + g2} y={y2} color={BOARD_THEME.green} w={13} hook={26} hookLeft={false} />
      {/* 两盒 = 带的钱 + 差（虚线） */}
      <MeasureBar x1={x0} x2={x0 + g1} y={y3} color={BOARD_THEME.blue} w={13} hook={26} hookRight={false} />
      <MeasureBar x1={x0 + g1 + 6} x2={x0 + g2} y={y3} color={BOARD_THEME.blue} w={13} hookLeft={false} hookRight={false} />
      <MeasureBar x1={x0 + g2 + 6} x2={x0 + g3} y={y3} color={BOARD_THEME.orange} w={13} hook={26} hookLeft={false} dash={[10, 9]} />
      {/* 差 10 花括号 */}
      <DownBrace x1={x0 + g2} x2={x0 + g3} y={y3 + 46} depth={30} color={BOARD_THEME.orange} w={5} />
      <text x={x0 + (g2 + g3) / 2} y={y3 + 46 + 30 + 46} textAnchor="middle" fill={BOARD_THEME.orange} fontSize={50} fontWeight={800} fontFamily={FONT_HAND}>
        差 10
      </text>
      {/* 标签 */}
      <text x={x0 - 24} y={y1 + 14} textAnchor="end" fill={BOARD_THEME.ink} fontSize={42} fontWeight={700} fontFamily={FONT_HAND}>
        一盒
      </text>
      <text x={x0 - 24} y={y2 + 14} textAnchor="end" fill={BOARD_THEME.ink} fontSize={42} fontWeight={700} fontFamily={FONT_HAND}>
        带的钱
      </text>
      <text x={x0 - 24} y={y3 + 14} textAnchor="end" fill={BOARD_THEME.ink} fontSize={42} fontWeight={700} fontFamily={FONT_HAND}>
        两盒
      </text>
    </g>
  );
};

/** 简笔草莓盒：圆角盒 + 盒盖线 + 3 颗草莓；ghost=true → 虚线空盒（还差的那盒） */
const BerryBox: React.FC<{ x: number; y: number; w: number; h: number; ghost?: boolean }> = ({ x, y, w, h, ghost = false }) => (
  <g>
    <rect
      x={x}
      y={y}
      width={w}
      height={h}
      rx={20}
      fill={ghost ? "none" : BOARD_THEME.blue}
      fillOpacity={ghost ? 0 : 0.18}
      stroke={ghost ? BOARD_THEME.orange : BOARD_THEME.blue}
      strokeWidth={6}
      strokeDasharray={ghost ? "16 12" : undefined}
      strokeLinejoin="round"
    />
    {!ghost && <line x1={x + 18} y1={y + h * 0.34} x2={x + w - 18} y2={y + h * 0.34} stroke={BOARD_THEME.blue} strokeWidth={5} strokeLinecap="round" />}
    {ghost ? (
      <text x={x + w / 2} y={y + h / 2 + 26} textAnchor="middle" fill={BOARD_THEME.orange} fontSize={76} fontWeight={800} fontFamily={FONT_HAND}>
        ?
      </text>
    ) : (
      [0.28, 0.5, 0.72].map((p, i) => {
        const cx = x + p * w;
        const cy = y + h * 0.68;
        const r = 28;
        return (
          <g key={i}>
            {/* 草莓果身：上圆下尖的水滴形 */}
            <path
              d={`M ${cx - r} ${cy - r * 0.45} Q ${cx - r} ${cy + r * 0.95} ${cx} ${cy + r * 1.25} Q ${cx + r} ${cy + r * 0.95} ${cx + r} ${cy - r * 0.45} Q ${cx} ${cy - r * 1.15} ${cx - r} ${cy - r * 0.45} Z`}
              fill="url(#coverBerryGrad)"
            />
            {/* 高光 */}
            <ellipse cx={cx - 9} cy={cy - 8} rx={7} ry={5} fill="rgba(255,255,255,0.5)" transform={`rotate(-28 ${cx - 9} ${cy - 8})`} />
            {/* 籽：白色小点 */}
            {[-0.55, -0.15, 0.25, 0.6, -0.3, 0.05].map((dy, j) => {
              const dx = (j % 2 === 0 ? -1 : 1) * (7 + (j % 3) * 5);
              const py = cy + r * dy + 6;
              return (
                <ellipse
                  key={j}
                  cx={cx + dx}
                  cy={py}
                  rx={2.6}
                  ry={3.8}
                  fill="rgba(255,242,236,0.88)"
                  transform={`rotate(${dx > 0 ? 20 : -20} ${cx + dx} ${py})`}
                />
              );
            })}
            {/* 顶部绿叶蒂 */}
            <path
              d={`M ${cx - 14} ${cy - r * 0.8} L ${cx - 4} ${cy - r * 1.28} L ${cx} ${cy - r * 0.78} L ${cx + 4} ${cy - r * 1.28} L ${cx + 14} ${cy - r * 0.8} L ${cx} ${cy - r * 0.42} Z`}
              fill={BOARD_THEME.green}
              stroke="#2E7D46"
              strokeWidth={1.5}
              strokeLinejoin="round"
            />
          </g>
        );
      })
    )}
  </g>
);

/** 内置示例主视觉：两盒草莓 + 还差的虚线空盒（具象点题，适合"买差"类题） */
const BerryBoxesVisual: React.FC = () => {
  const w = 250;
  const h = 210;
  const gap = 46;
  const x0 = -(w * 3 + gap * 2) / 2;
  const y0 = -147; // 让整组（含下方标签）视觉中心落在 (0,0)
  return (
    <g>
      <BerryBox x={x0} y={y0} w={w} h={h} />
      <BerryBox x={x0 + w + gap} y={y0} w={w} h={h} />
      <BerryBox x={x0 + (w + gap) * 2} y={y0} w={w} h={h} ghost />
      <text x={x0 + w / 2} y={y0 + h + 66} textAnchor="middle" fill={BOARD_THEME.ink} fontSize={52} fontWeight={800} fontFamily={FONT_HAND}>
        一盒
      </text>
      <text x={x0 + w + gap + w / 2} y={y0 + h + 66} textAnchor="middle" fill={BOARD_THEME.ink} fontSize={52} fontWeight={800} fontFamily={FONT_HAND}>
        一盒
      </text>
      <text x={x0 + (w + gap) * 2 + w / 2} y={y0 + h + 66} textAnchor="middle" fill={BOARD_THEME.orange} fontSize={52} fontWeight={800} fontFamily={FONT_HAND}>
        还差 5
      </text>
    </g>
  );
};

/** 项目主视觉注册表：把题目核心图形加进来，CoverScene 用 visual 传 key */
const MAIN_VISUALS: Record<string, React.ReactNode> = {
  "berry-boxes": <BerryBoxesVisual />,
  "bar-compare": <BarCompareVisual />,
};

export const CoverScene: React.FC<CoverSceneProps> = ({
  title = "共带了多少钱？",
  eyebrow = "小学数学 · 解题思维",
  banner,
  visual = "berry-boxes",
  vertical = false,
}) => {
  const { width, height } = useVideoConfig();
  const visualNode = MAIN_VISUALS[visual];

  // ⚠️ visualY / visualScale 必须让主视觉「含最上方标注」完整落在 banner 与 footer 之间的净空里。
  // 主视觉纵向范围约 ±280 单位（local），视觉顶部 y = visualY − 280×visualScale，必须 > bannerY + 40。
  const L = vertical
    ? { badgeY: 140, badgeFont: 38, badgeW: 430, wmFont: 150, titleY: 330, titleFont: 104, underlineW: 520, underlineH: 10, bannerY: 486, bannerFont: 42, visualY: 966, visualScale: 1.3, footerY: 1372, footerFont: 26 }
    : { badgeY: 142, badgeFont: 46, badgeW: 540, wmFont: 190, titleY: 370, titleFont: 158, underlineW: 760, underlineH: 12, bannerY: 545, bannerFont: 54, visualY: 992, visualScale: 1.35, footerY: 1382, footerFont: 30 };

  return (
    <AbsoluteFill>
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
        <defs>
          {/* 板面径向光：左上微亮，避免纯平深灰显得单调 */}
          <radialGradient id="coverBoardGlow" cx="32%" cy="16%" r="96%">
            <stop offset="0%" stopColor="#4C4E58" />
            <stop offset="100%" stopColor="#313239" />
          </radialGradient>
          {/* 草莓果身：径向渐变出球体感 */}
          <radialGradient id="coverBerryGrad" cx="35%" cy="26%" r="80%">
            <stop offset="0%" stopColor="#FF8A7A" />
            <stop offset="50%" stopColor="#E8453C" />
            <stop offset="100%" stopColor="#A81E1E" />
          </radialGradient>
        </defs>
        <rect x={0} y={0} width={width} height={height} fill="url(#coverBoardGlow)" />

        {/* 淡数学符号水印（克制，不抢主视觉） */}
        <g fill={BOARD_THEME.ink} opacity={0.055} fontFamily={FONT_SANS} fontWeight={800} textAnchor="middle">
          <text x={width * 0.1} y={height * 0.3} fontSize={L.wmFont}>
            +
          </text>
          <text x={width * 0.9} y={height * 0.2} fontSize={L.wmFont}>
            ×
          </text>
          <text x={width * 0.08} y={height * 0.72} fontSize={L.wmFont}>
            ÷
          </text>
          <text x={width * 0.92} y={height * 0.62} fontSize={L.wmFont}>
            =
          </text>
        </g>

        {/* 眉标：黄胶囊 */}
        <rect
          x={width / 2 - L.badgeW / 2}
          y={L.badgeY - L.badgeFont * 0.82}
          width={L.badgeW}
          height={L.badgeFont * 1.55}
          rx={L.badgeFont * 0.78}
          fill={BOARD_THEME.yellow}
          fillOpacity={0.14}
          stroke={BOARD_THEME.yellow}
          strokeWidth={3}
        />
        <text x={width / 2} y={L.badgeY + L.badgeFont * 0.34} textAnchor="middle" fill={BOARD_THEME.yellow} fontSize={L.badgeFont} fontWeight={800} fontFamily={FONT_HAND} letterSpacing="3">
          {eyebrow}
        </text>

        {/* 疑问句标题（黄，楷体）+ 黄色下划线 */}
        <text x={width / 2} y={L.titleY} textAnchor="middle" fill={BOARD_THEME.yellow} fontSize={L.titleFont} fontWeight={800} fontFamily={FONT_HAND} letterSpacing="2">
          {title}
        </text>
        <rect
          x={width / 2 - L.underlineW / 2}
          y={L.titleY + L.titleFont * 0.3}
          width={L.underlineW}
          height={L.underlineH}
          rx={L.underlineH / 2}
          fill={BOARD_THEME.yellow}
          opacity={0.75}
        />

        {/* 主视觉插槽（具体数学图形，占画面 40%+） */}
        {visualNode && (
          <g transform={`translate(${width / 2} ${L.visualY}) scale(${L.visualScale})`} style={{ filter: "drop-shadow(0 6px 18px rgba(0,0,0,0.45))" }}>
            {visualNode}
          </g>
        )}

        {/* 可选动机横幅 */}
        {banner && (
          <text x={width / 2} y={L.bannerY} textAnchor="middle" fill={BOARD_THEME.orange} fontSize={L.bannerFont} fontWeight={800} fontFamily={FONT_SANS}>
            {banner}
          </text>
        )}

        {/* 角标 */}
        <text x={width / 2} y={L.footerY} textAnchor="middle" fill={BOARD_THEME.gray} opacity={0.65} fontSize={L.footerFont} fontWeight={800} fontFamily={FONT_SANS} letterSpacing="4">
          小学数学 · 解题思维
        </text>
      </svg>
    </AbsoluteFill>
  );
};
