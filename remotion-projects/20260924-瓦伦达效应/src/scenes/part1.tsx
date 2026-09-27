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
  Bar,
  Formula,
} from "../components/primitives";

// ⚠️ 各图元的 at（局部帧）= 对应口播词开始时刻 × 30，延后 0.1~0.2s。
//    时间戳来自 tools/audio-align/align.py 对本项目配音的 whisper 词级转写。
type P = { inAt: number; outAt: number };
const CX = 960;

// ============ S01 越怕越失（钩子：概念示意）============
// 口播：越害怕失去某个人或某件事(0.0-2.0) / 反而越容易失去(2.3-3.3) / 对吗(3.5-3.8)
export const Scene01: React.FC<P> = ({ inAt, outAt }) => (
  <Stage inAt={inAt} outAt={outAt}>
    {/* 上方两个标签框 */}
    <Reveal at={12}>
      <Frame x={410} y={320} w={330} h={118} />
      <Txt x={575} y={360} text="对象 / 事件" size={FONT.label} color={THEME.ink} />
      <Txt x={575} y={402} text="我要守住的东西" size={FONT.labelSmall} color={THEME.inkSoft} weight={400} />
    </Reveal>
    <Reveal at={20}>
      <Frame x={1180} y={320} w={330} h={118} />
      <Txt x={1345} y={360} text="注意 / 结果" size={FONT.label} color={THEME.ink} />
      <Txt x={1345} y={402} text="我怕失去的结果" size={FONT.labelSmall} color={THEME.inkSoft} weight={400} />
    </Reveal>

    {/* 中间横向轴 */}
    <Reveal at={36}>
      <Line x1={370} y1={520} x2={1550} y2={520} color={THEME.frame} />
      <Dot cx={575} cy={520} r={6} color={THEME.inkSoft} />
      <Dot cx={1345} cy={520} r={6} color={THEME.inkSoft} />
    </Reveal>

    {/* 下方流程：害怕 → 控制 → 失去（对应「反而越容易失去」2.3s 起） */}
    <Reveal at={69}>
      <Frame x={480} y={640} w={220} h={92} stroke={THEME.accent} sw={STROKE.bold} />
      <Txt x={590} y={686} text="害怕" size={FONT.label} color={THEME.accent} />
    </Reveal>
    <Reveal at={78}>
      <Arrow x1={706} y1={686} x2={846} y2={686} color={THEME.line} />
      <Frame x={852} y={640} w={220} h={92} />
      <Txt x={962} y={686} text="控制" size={FONT.label} color={THEME.ink} />
    </Reveal>
    <Reveal at={87}>
      <Arrow x1={1078} y1={686} x2={1218} y2={686} color={THEME.line} />
      <Frame x={1224} y={640} w={220} h={92} stroke={THEME.accent} sw={STROKE.bold} />
      <Txt x={1334} y={686} text="失去" size={FONT.label} color={THEME.accent} />
    </Reveal>

    <Reveal at={96}>
      <Formula x={CX} y={840} text="fear ↑  ⇔  control ↑" size={30} color={THEME.accent} />
    </Reveal>
  </Stage>
);

// ============ S02 杯满则溢（水杯比喻）============
// 口播：就像端着一杯快要溢出的水(0.0-1.8) / 你越反复提醒自己不能洒(2.1-3.8)
//      手臂越容易僵硬(4.1-5.2) / 水越容易洒出来(5.4-6.5)
export const Scene02: React.FC<P> = ({ inAt, outAt }) => (
  <Stage inAt={inAt} outAt={outAt}>
    {/* 杯子 */}
    <Reveal at={9}>
      <path
        d="M 620 380 L 700 700 L 940 700 L 1020 380 Z"
        fill="none"
        stroke={THEME.inkSoft}
        strokeWidth={STROKE.bold}
        strokeLinejoin="round"
      />
      <path d="M 632 430 Q 700 410 760 430 T 880 430 T 1008 430" fill="none" stroke={THEME.bar} strokeWidth={STROKE.normal} />
    </Reveal>

    {/* 快溢出的水面 */}
    <Reveal at={30}>
      <path d="M 626 400 Q 690 382 750 400 T 870 400 T 1014 400" fill="none" stroke={THEME.bar} strokeWidth={STROKE.thin} opacity={0.6} />
    </Reveal>

    {/* 手臂/手的波浪线 */}
    <Reveal at={48}>
      <path
        d="M 300 560 C 360 520, 400 610, 460 570 C 510 536, 560 600, 616 560"
        fill="none"
        stroke={THEME.inkSoft}
        strokeWidth={STROKE.normal}
        strokeLinecap="round"
      />
      <Dot cx={300} cy={560} r={6} color={THEME.inkSoft} />
    </Reveal>

    {/* 抖动标记（对应「越反复提醒自己不能洒」2.1s） */}
    <Reveal at={69}>
      <path d="M 820 330 L 838 300 M 862 322 L 890 296 M 906 318 L 940 300" stroke={THEME.accent} strokeWidth={STROKE.normal} strokeLinecap="round" />
    </Reveal>

    {/* 右侧"身体反应"卡（对应「手臂越容易僵硬」4.1s） */}
    <Reveal at={129}>
      <Frame x={1180} y={420} w={440} h={260} />
      <Txt x={1400} y={468} text="身体反应" size={FONT.label} color={THEME.ink} />
      <path d="M 1220 600 C 1290 560, 1330 630, 1400 580 C 1450 546, 1520 620, 1580 570" fill="none" stroke={THEME.accent} strokeWidth={STROKE.normal} />
      <Arrow x1={1220} y1={636} x2={1580} y2={636} color={THEME.line} sw={STROKE.thin} head={9} />
      <Txt x={1236} y={628} text="提醒越多" size={FONT.labelSmall} color={THEME.inkSoft} anchor="start" weight={400} />
      <Txt x={1580} y={628} text="僵硬越强" size={FONT.labelSmall} color={THEME.inkSoft} anchor="end" weight={400} />
    </Reveal>

    <Reveal at={174}>
      <Formula x={CX} y={840} text="attention ↑  →  tension ↑" size={30} color={THEME.accent} />
    </Reveal>
  </Stage>
);

// ============ S03 瓦伦达效应（命名：钢索）============
// 口播：这种现象(0.0-0.9) / 常被叫做瓦伦达效应(1.1-2.5)
export const Scene03: React.FC<P> = ({ inAt, outAt }) => (
  <Stage inAt={inAt} outAt={outAt}>
    {/* 钢索 */}
    <Reveal at={12}>
      <Line x1={420} y1={380} x2={420} y2={700} color={THEME.inkSoft} sw={STROKE.bold} />
      <Line x1={1500} y1={380} x2={1500} y2={700} color={THEME.inkSoft} sw={STROKE.bold} />
      <Line x1={420} y1={520} x2={1500} y2={520} color={THEME.ink} sw={STROKE.bold} />
    </Reveal>

    {/* 走索者（对应「常被叫做瓦伦达效应」1.1s） */}
    <Reveal at={36}>
      <Ring cx={960} cy={520} r={26} color={THEME.accent} sw={STROKE.bold} />
      <Line x1={960} y1={494} x2={960} y2={470} color={THEME.accent} sw={STROKE.normal} />
      <Dot cx={960} cy={520} r={5} color={THEME.accent} />
    </Reveal>

    <Reveal at={57}>
      <Chip x={640} y={790} text="一九七八年" size={FONT.labelSmall} />
      <Chip x={1090} y={790} text="波多黎各" size={FONT.labelSmall} />
    </Reveal>
  </Stage>
);

// ============ S04 来源（左右对比：怎样走好 / 千万别掉）============
// 口播：名词源于高空走钢丝表演者卡尔瓦伦达(0.0-2.8) / 一九七八年(3.1-4.0)
//      他在波多黎各表演时不幸坠落(4.2-6.0)
export const Scene04: React.FC<P> = ({ inAt, outAt }) => (
  <Stage inAt={inAt} outAt={outAt}>
    {/* 左：怎样走好 */}
    <Reveal at={15}>
      <Frame x={280} y={330} w={620} h={420} />
      <Txt x={590} y={390} text="怎样走好" size={FONT.label} color={THEME.ink} />
      <path
        d="M 360 620 L 460 560 L 560 600 L 660 540 L 760 580"
        fill="none"
        stroke={THEME.inkSoft}
        strokeWidth={STROKE.normal}
        strokeLinecap="round"
      />
      <Dot cx={360} cy={620} r={6} color={THEME.inkSoft} />
      <Ring cx={760} cy={580} r={16} color={THEME.inkSoft} />
    </Reveal>

    {/* 右：千万别掉 */}
    <Reveal at={75}>
      <Frame x={1020} y={330} w={620} h={420} stroke={THEME.accent} />
      <Txt x={1330} y={390} text="千万别掉" size={FONT.label} color={THEME.accent} />
    </Reveal>
    {/* 坠落（对应「不幸坠落」4.2s） */}
    <Reveal at={129}>
      <Ring cx={1330} cy={560} r={78} color={THEME.accent} sw={STROKE.bold} />
      <Arrow x1={1330} y1={480} x2={1330} y2={646} color={THEME.accent} sw={STROKE.bold} head={14} />
      <Dot cx={1330} cy={560} r={7} color={THEME.accent} />
    </Reveal>
  </Stage>
);

// ============ S05 注意力转向 ============
// 口播：他的妻子曾回忆说出事前(0.0-2.0) / 他的注意力已经从怎样走好(2.3-4.0)
//      转向了千万不能掉下去(4.0-5.5)
export const Scene05: React.FC<P> = ({ inAt, outAt }) => (
  <Stage inAt={inAt} outAt={outAt}>
    {/* 左：任务焦点 */}
    <Reveal at={15}>
      <Frame x={300} y={400} w={520} h={260} />
      <Txt x={560} y={452} text="任务焦点" size={FONT.label} color={THEME.ink} />
      <Txt x={560} y={494} text="动作 / 怎样走好" size={FONT.labelSmall} color={THEME.inkSoft} weight={400} />
      <path d="M 360 580 L 460 546 L 560 572 L 660 540 L 760 566" fill="none" stroke={THEME.inkSoft} strokeWidth={STROKE.normal} strokeLinecap="round" />
    </Reveal>

    {/* 右：结果焦点（对应「从怎样走好」3.4s） */}
    <Reveal at={100}>
      <Frame x={1100} y={400} w={520} h={260} stroke={THEME.accent} />
      <Txt x={1360} y={452} text="结果焦点" size={FONT.label} color={THEME.accent} />
      <Txt x={1360} y={494} text="风险 / 千万别掉" size={FONT.labelSmall} color={THEME.inkSoft} weight={400} />
      <Ring cx={1360} cy={580} r={46} color={THEME.accent} sw={STROKE.normal} />
      <Dot cx={1360} cy={580} r={7} color={THEME.accent} />
    </Reveal>

    {/* 注意力转移（对应「转向了」4.0s） */}
    <Reveal at={130}>
      <Arrow x1={840} y1={530} x2={1090} y2={530} color={THEME.accent} sw={STROKE.bold} head={16} />
    </Reveal>

    <Reveal at={150}>
      <Formula x={CX} y={800} text="task → execution        risk → monitoring" size={28} />
    </Reveal>
  </Stage>
);

// ============ S06 压力下失常（压力分流）============
// 口播：心理学中与他相近的严谨概念是压力下失常(0.0-3.4) / 压力会把注意力从任务本身(3.8-5.5)
//      转向失败的后果(5.8-6.9) / 也可能打断原本早已熟练的动作(7.1-9.1)
export const Scene06: React.FC<P> = ({ inAt, outAt }) => (
  <Stage inAt={inAt} outAt={outAt}>
    {/* 左：任务本身 */}
    <Reveal at={45}>
      <Frame x={240} y={470} w={280} h={110} />
      <Txt x={380} y={525} text="任务本身" size={FONT.label} color={THEME.ink} />
    </Reveal>

    {/* 中：压力（对应「压力会把注意力」3.8s） */}
    <Reveal at={129}>
      <Arrow x1={526} y1={525} x2={700} y2={525} color={THEME.line} />
      <Ring cx={780} cy={525} r={70} color={THEME.accent} sw={STROKE.bold} />
      <Txt x={780} y={525} text="压力" size={FONT.label} color={THEME.accent} />
    </Reveal>

    {/* 上路 → 失败后果（对应「转向失败的后果」5.8s） */}
    <Reveal at={177}>
      <path d="M 850 500 C 960 470, 1000 430, 1080 420" fill="none" stroke={THEME.line} strokeWidth={STROKE.normal} />
      <Arrow x1={1080} y1={420} x2={1150} y2={412} color={THEME.line} head={10} />
      <Frame x={1156} y={370} w={400} h={96} stroke={THEME.accent} />
      <Txt x={1356} y={418} text="失败后果" size={FONT.label} color={THEME.accent} />
    </Reveal>

    {/* 下路 → 动作监控（对应「打断原本早已熟练的动作」7.1s） */}
    <Reveal at={216}>
      <path d="M 850 552 C 960 580, 1000 620, 1080 632" fill="none" stroke={THEME.line} strokeWidth={STROKE.normal} />
      <Arrow x1={1080} y1={632} x2={1150} y2={640} color={THEME.line} head={10} />
      <Frame x={1156} y={592} w={400} h={96} />
      <Txt x={1356} y={640} text="动作监控" size={FONT.label} color={THEME.ink} />
    </Reveal>

    <Reveal at={240}>
      <Chip x={1180} y={272} text="抢夺注意" size={FONT.labelSmall} />
      <Chip x={1180} y={742} text="拆解动作" size={FONT.labelSmall} />
    </Reveal>

    <Reveal at={264}>
      <Formula x={CX} y={870} text="P = f(task, pressure, attention)" size={30} />
    </Reveal>
  </Stage>
);
