import React from "react";
import { THEME, STROKE, FONT } from "../components/theme";
import {
  Stage,
  Reveal,
  Frame,
  Txt,
  Chip,
  Line,
  Arrow,
  Dot,
  Ring,
  Formula,
  Person,
} from "../components/primitives";

// ⚠️ at = 对应口播词开始时刻 × 30（whisper 词级时间戳）
type P = { inAt: number; outAt: number };
const CX = 960;

// ============ S13 关系中的试探 ============
// 口播：感情也是如此(0.0-1.0) / 一个人越害怕失去对方(1.4-2.9) / 越可能反复确认不断试探(3.1-5.0)
export const Scene13: React.FC<P> = ({ inAt, outAt }) => (
  <Stage inAt={inAt} outAt={outAt}>
    <Reveal at={15}>
      <Person x={700} y={600} scale={1.5} color={THEME.inkSoft} />
      <Person x={1220} y={600} scale={1.5} color={THEME.inkSoft} />
    </Reveal>

    {/* 试探的对话（对应「害怕失去对方」1.4s） */}
    <Reveal at={45}>
      <Frame x={470} y={380} w={280} h={76} r={18} stroke={THEME.frame} />
      <Txt x={610} y={418} text="你还在吗？" size={FONT.labelSmall} color={THEME.inkSoft} weight={400} />
      <Frame x={1170} y={380} w={280} h={76} r={18} stroke={THEME.accent} />
      <Txt x={1310} y={418} text="你确定吗？" size={FONT.labelSmall} color={THEME.accent} weight={400} />
    </Reveal>

    {/* 想要 vs 实际（对应「反复确认、不断试探」3.1s） */}
    <Reveal at={96}>
      <Chip x={380} y={760} text="本来想要：安全感" size={FONT.labelSmall} />
      <Chip x={1180} y={760} text="实际表现：确认 / 试探" size={FONT.labelSmall} color={THEME.accent} stroke={THEME.accent} />
    </Reveal>

    <Reveal at={135}>
      <Formula x={CX} y={880} text="fear  →  checking" size={30} color={THEME.accent} />
    </Reveal>
  </Stage>
);

// ============ S14 理解变审问 ============
// 口播：可当理解变成审问(0.0-1.4) / 靠近变成控制(1.7-2.6) / 这段关系就已经开始付出代价(3.0-4.9)
export const Scene14: React.FC<P> = ({ inAt, outAt }) => (
  <Stage inAt={inAt} outAt={outAt}>
    {/* 左：理解 / 靠近 */}
    <Reveal at={12}>
      <Frame x={260} y={360} w={620} h={360} />
      <Txt x={570} y={418} text="理解 / 靠近" size={FONT.label} color={THEME.ink} />
      <Frame x={340} y={480} w={280} h={70} r={16} stroke={THEME.frame} />
      <Txt x={480} y={516} text="我有点不安" size={FONT.labelSmall} color={THEME.inkSoft} weight={400} />
      <Frame x={360} y={580} w={260} h={70} r={16} stroke={THEME.frame} />
      <Txt x={490} y={616} text="我愿意听" size={FONT.labelSmall} color={THEME.inkSoft} weight={400} />
    </Reveal>

    {/* 右：审问 / 控制（对应「靠近变成控制」1.7s） */}
    <Reveal at={51}>
      <Frame x={1040} y={360} w={620} h={360} stroke={THEME.accent} />
      <Txt x={1350} y={418} text="审问 / 控制" size={FONT.label} color={THEME.accent} />
      {["在哪？", "和谁？", "为什么？", "还爱我吗？"].map((t, i) => (
        <g key={i}>
          <Dot cx={1120} cy={500 + i * 56} r={5} color={THEME.accent} />
          <Txt x={1150} y={500 + i * 56} text={t} size={FONT.labelSmall} color={THEME.inkSoft} anchor="start" weight={400} />
        </g>
      ))}
    </Reveal>

    <Reveal at={126}>
      <Formula x={CX} y={820} text="care  →  control" size={30} color={THEME.accent} />
    </Reveal>
  </Stage>
);

// ============ S15 回到当下 ============
// 口播：真正能留住一个人或幸福的(0.0-1.8) / 从来不是把手握得更紧(2.0-3.5)
//      而是把注意力重新交还给当下的(3.7-5.8) / 理解、边界与回应(5.8-7.1)
export const Scene15: React.FC<P> = ({ inAt, outAt }) => (
  <Stage inAt={inAt} outAt={outAt}>
    <Reveal at={12}>
      <Chip x={880} y={300} text="NOW" size={FONT.labelSmall} color={THEME.ink} stroke={THEME.inkSoft} />
    </Reveal>

    {/* 三卡：理解 / 边界 / 回应 */}
    {[
      { x: 300, t: "理解", at: 117 },
      { x: 800, t: "边界", at: 138 },
      { x: 1300, t: "回应", at: 159 },
    ].map((c, i) => (
      <Reveal key={i} at={c.at}>
        <Frame x={c.x} y={440} w={320} h={180} />
        <Txt x={c.x + 160} y={512} text={c.t} size={FONT.label} color={THEME.ink} />
        <Line x1={c.x + 90} y1={560} x2={c.x + 230} y2={560} color={THEME.frame} />
      </Reveal>
    ))}

    {/* 三者汇聚到"当下" */}
    <Reveal at={186}>
      <path d="M 460 620 C 600 720, 800 740, 960 720" fill="none" stroke={THEME.line} strokeWidth={STROKE.thin} />
      <path d="M 960 620 L 960 716" fill="none" stroke={THEME.line} strokeWidth={STROKE.thin} />
      <path d="M 1460 620 C 1320 720, 1120 740, 960 720" fill="none" stroke={THEME.line} strokeWidth={STROKE.thin} />
      <Dot cx={960} cy={724} r={8} color={THEME.accent} />
    </Reveal>

    <Reveal at={198}>
      <Formula x={CX} y={860} text="把注意力交还给 理解 · 边界 · 回应" size={30} />
    </Reveal>
  </Stage>
);

// ============ S16 真正的珍惜 ============
// 口播：真正的珍惜不是拼命攥紧(0.0-2.1) / 而是看清脚下的落点(2.3-3.6)
//      说出需要(3.9-4.5) / 也允许彼此自由呼吸(4.8-6.2)
export const Scene16: React.FC<P> = ({ inAt, outAt }) => (
  <Stage inAt={inAt} outAt={outAt}>
    <Reveal at={12}>
      <Formula x={CX} y={300} text="珍惜不是攥紧，而是落点、坦诚与呼吸" size={30} />
    </Reveal>

    {/* 两个相交的圆（对应「而是看清脚下的落点」2.3s） */}
    <Reveal at={72}>
      <Ring cx={860} cy={540} r={140} color={THEME.inkSoft} sw={STROKE.normal} />
      <Ring cx={1080} cy={540} r={140} color={THEME.accent} sw={STROKE.normal} />
      <Dot cx={970} cy={540} r={7} color={THEME.ink} />
    </Reveal>

    <Reveal at={78}>
      <Line x1={740} y1={640} x2={520} y2={760} color={THEME.line} dash="8 8" />
      <Txt x={520} y={800} text="看清落点" size={FONT.labelSmall} color={THEME.inkSoft} weight={400} />
    </Reveal>
    <Reveal at={120}>
      <Line x1={970} y1={680} x2={970} y2={760} color={THEME.line} dash="8 8" />
      <Txt x={970} y={800} text="说出需要" size={FONT.labelSmall} color={THEME.inkSoft} weight={400} />
    </Reveal>
    <Reveal at={147}>
      <Line x1={1200} y1={640} x2={1420} y2={760} color={THEME.line} dash="8 8" />
      <Txt x={1420} y={800} text="自由呼吸" size={FONT.labelSmall} color={THEME.inkSoft} weight={400} />
    </Reveal>
  </Stage>
);

// ============ S17 守住重心（天平）============
// 口播：你无法保证谁永远不走(0.0-1.8) / 但可以守住自己的重心(2.1-3.5)
//      即使结局改变(3.7-4.7) / 也依然有能力好好爱人好好生活(4.9-7.2)
export const Scene17: React.FC<P> = ({ inAt, outAt }) => (
  <Stage inAt={inAt} outAt={outAt}>
    <Reveal at={12}>
      <Formula x={CX} y={300} text="无法保证谁永远不走，但可以守住自己的重心" size={30} />
    </Reveal>

    {/* 天平（对应「守住自己的重心」2.1s） */}
    <Reveal at={66}>
      <Line x1={420} y1={600} x2={1500} y2={600} color={THEME.inkSoft} sw={STROKE.bold} />
      <path d="M 960 600 L 910 720 L 1010 720 Z" fill="none" stroke={THEME.inkSoft} strokeWidth={STROKE.bold} strokeLinejoin="round" />
      <Line x1={860} y1={600} x2={860} y2={540} color={THEME.frame} dash="6 8" />
      <Dot cx={960} cy={600} r={10} color={THEME.accent} />
    </Reveal>

    {/* 两端（对应「好好爱人，好好生活」4.9s） */}
    <Reveal at={150}>
      <Ring cx={620} cy={560} r={72} color={THEME.inkSoft} sw={STROKE.normal} />
      <Txt x={620} y={562} text="好好爱人" size={FONT.labelSmall} color={THEME.inkSoft} weight={500} />
      <Ring cx={1300} cy={560} r={72} color={THEME.accent} sw={STROKE.normal} />
      <Txt x={1300} y={562} text="好好生活" size={FONT.labelSmall} color={THEME.accent} weight={500} />
    </Reveal>
  </Stage>
);
