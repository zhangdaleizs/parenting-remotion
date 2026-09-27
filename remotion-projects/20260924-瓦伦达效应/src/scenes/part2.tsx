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

// ⚠️ at = 对应口播词开始时刻 × 30（whisper 词级时间戳）
type P = { inAt: number; outAt: number };
const CX = 960;

// ============ S07 低奖励实验 ============
// 口播：2009年的一项实验中(0.1-1.9) / 参与者需要操控器械追向目标(2.2-4.1)
//      在低奖励条件下(4.4-5.5) / 平均成功率为74.3%(5.7-7.9)
export const Scene07: React.FC<P> = ({ inAt, outAt }) => (
  <Stage inAt={inAt} outAt={outAt}>
    <Reveal at={15}>
      <Chip x={280} y={300} text="条件：低奖励" size={FONT.labelSmall} />
      <Chip x={1380} y={300} text="状态：压力较低" size={FONT.labelSmall} />
    </Reveal>

    {/* 实验装置（对应「参与者需要操控器械追向目标」2.2s） */}
    <Reveal at={69}>
      <Frame x={300} y={400} w={1320} h={200} dash="8 8" />
      <Frame x={430} y={470} w={90} h={60} />
      <Dot cx={475} cy={500} r={6} color={THEME.inkSoft} />
      <Line x1={560} y1={500} x2={1360} y2={500} color={THEME.line} dash="10 10" />
      <Ring cx={1440} cy={500} r={26} color={THEME.accent} sw={STROKE.bold} />
      <Dot cx={1440} cy={500} r={6} color={THEME.accent} />
    </Reveal>

    {/* 奖励标识（对应「在低奖励条件下」4.4s） */}
    <Reveal at={138}>
      <Chip x={430} y={580} text="REWARD  1×" size={FONT.labelSmall} color={THEME.ink} stroke={THEME.inkSoft} />
    </Reveal>

    {/* 数据条（对应「平均成功率为74.3%」5.7s） */}
    <Reveal at={177}>
      <Txt x={960} y={700} text="平均成功率" size={FONT.labelSmall} color={THEME.inkSoft} weight={400} />
      <Bar x={700} y={724} w={420} h={34} ratio={0.743} value="74.3%" />
    </Reveal>

    <Reveal at={222}>
      <Formula x={CX} y={870} text="goal → capture" size={28} />
    </Reveal>
  </Stage>
);

// ============ S08 十倍奖励 ============
// 口播：奖励提高到原来的10倍后(0.0-1.8) / 成功率却降到63.9%(2.1-4.4)
//      将近下降了10.4个百分点(4.4-6.2)
export const Scene08: React.FC<P> = ({ inAt, outAt }) => (
  <Stage inAt={inAt} outAt={outAt}>
    <Reveal at={12}>
      <Chip x={280} y={380} text="条件：高奖励" size={FONT.labelSmall} />
      <Chip x={1380} y={380} text="状态：压力升高" size={FONT.labelSmall} />
    </Reveal>

    {/* 奖励倍数放大（对应「奖励提高到原来的10倍」1.3s） */}
    <Reveal at={39}>
      <Chip x={430} y={480} text="REWARD  10×" size={FONT.labelSmall} color={THEME.accent} stroke={THEME.accent} />
    </Reveal>

    {/* 差值公式（对应「成功率却降到」2.1s） */}
    <Reveal at={66}>
      <Formula x={CX} y={300} text="74.3%  −  63.9%  =  10.4 pp" size={38} color={THEME.accent} />
    </Reveal>

    {/* 数据条（对应「63.9%」3.0s） */}
    <Reveal at={96}>
      <Txt x={960} y={640} text="平均成功率" size={FONT.labelSmall} color={THEME.inkSoft} weight={400} />
      <Bar x={700} y={664} w={420} h={34} ratio={0.639} color={THEME.accent} value="63.9%" />
    </Reveal>

    <Reveal at={150}>
      <Formula x={CX} y={830} text="74.3%  →  63.9%" size={28} />
    </Reveal>
  </Stage>
);

// ============ S09 越过临界点（倒 U 曲线）============
// 口播：奖励本应增强动力(0.0-1.3) / 可当必须得到变成压力(1.5-3.1) / 动力也可能越过临界点(3.3-4.7)
export const Scene09: React.FC<P> = ({ inAt, outAt }) => (
  <Stage inAt={inAt} outAt={outAt}>
    <Reveal at={12}>
      <path d="M 420 760 Q 960 0 1500 760" fill="none" stroke={THEME.inkSoft} strokeWidth={STROKE.bold} />
    </Reveal>

    <Reveal at={30}>
      <Txt x={560} y={560} text="动力增强" size={FONT.labelSmall} color={THEME.inkSoft} weight={400} />
      <Txt x={1360} y={560} text="压力反噬" size={FONT.labelSmall} color={THEME.accent} weight={400} />
    </Reveal>

    <Reveal at={60}>
      <Line x1={420} y1={780} x2={1500} y2={780} color={THEME.frame} />
      <Txt x={600} y={822} text="不足" size={FONT.labelSmall} color={THEME.inkSoft} weight={400} />
      <Txt x={960} y={822} text="适中" size={FONT.labelSmall} color={THEME.inkSoft} weight={400} />
      <Txt x={1320} y={822} text="过强" size={FONT.labelSmall} color={THEME.inkSoft} weight={400} />
    </Reveal>

    {/* 峰值 + 临界点（对应「越过临界点」3.9s） */}
    <Reveal at={105}>
      <Dot cx={960} cy={380} r={9} color={THEME.ink} />
      <Line x1={960} y1={380} x2={960} y2={760} color={THEME.frame} dash="6 8" />
      <Chip x={830} y={300} text="临界点" size={FONT.labelSmall} color={THEME.ink} stroke={THEME.inkSoft} />
    </Reveal>

    <Reveal at={129}>
      <Formula x={CX} y={880} text="P = f(drive, pressure)" size={28} />
    </Reveal>
  </Stage>
);

// ============ S10 不是必然 ============
// 口播：当然这不代表奖励越高就一定失败(0.0-2.8) / 也不代表害怕必然导致失去(3.0-4.8)
//      它只在特定的任务压力强度和个人状态下出现(5.1-8.1)
export const Scene10: React.FC<P> = ({ inAt, outAt }) => (
  <Stage inAt={inAt} outAt={outAt}>
    <Reveal at={21}>
      <Frame x={300} y={400} w={560} h={220} dash="8 8" />
      <Txt x={580} y={480} text="奖励更高" size={FONT.label} color={THEME.inkSoft} />
      <Txt x={580} y={560} text="≠ 一定失败" size={FONT.label} color={THEME.inkSoft} />
    </Reveal>

    <Reveal at={90}>
      <Frame x={1060} y={400} w={560} h={220} dash="8 8" />
      <Txt x={1340} y={480} text="害怕失去" size={FONT.label} color={THEME.inkSoft} />
      <Txt x={1340} y={560} text="≠ 必然失去" size={FONT.label} color={THEME.inkSoft} />
    </Reveal>

    <Reveal at={159}>
      <Formula x={CX} y={760} text="它只在特定的任务压力强度和个人状态下出现" size={30} />
    </Reveal>
  </Stage>
);

// ============ S11 因人而异 ============
// 口播：有些人甚至会在压力中表现得更好(0.0-2.4)
export const Scene11: React.FC<P> = ({ inAt, outAt }) => (
  <Stage inAt={inAt} outAt={outAt}>
    <Reveal at={9}>
      <Txt x={330} y={430} text="任务" size={FONT.label} anchor="start" color={THEME.ink} />
      <Line x1={430} y1={430} x2={760} y2={430} color={THEME.line} />
      <Txt x={330} y={540} text="压力" size={FONT.label} anchor="start" color={THEME.ink} />
      <Line x1={430} y1={540} x2={760} y2={540} color={THEME.line} />
      <Txt x={330} y={650} text="个体" size={FONT.label} anchor="start" color={THEME.ink} />
      <Line x1={430} y1={650} x2={760} y2={650} color={THEME.line} />
    </Reveal>

    <Reveal at={24}>
      <path d="M 1020 700 C 1140 640, 1220 460, 1400 400" fill="none" stroke={THEME.bar} strokeWidth={STROKE.bold} />
      <path d="M 1020 700 C 1140 690, 1240 660, 1400 700" fill="none" stroke={THEME.accent} strokeWidth={STROKE.normal} dash="10 8" />
      <Dot cx={1400} cy={400} r={7} color={THEME.bar} />
      <Dot cx={1400} cy={700} r={7} color={THEME.accent} />
    </Reveal>

    <Reveal at={45}>
      <Chip x={1180} y={790} text="有些人压力下反而更好" size={FONT.labelSmall} color={THEME.ink} />
    </Reveal>

    <Reveal at={60}>
      <Formula x={CX} y={880} text="performance = f(person, task, pressure)" size={28} />
    </Reveal>
  </Stage>
);

// ============ S12 动作先丢失（动作链 → 结局）============
// 口播：可残酷的是(0.0-0.9) / 当你的注意力集中在结局上(1.2-2.9)
//      原本能够改变结局的动作(3.2-4.9) / 往往最先被忽略(5.1-6.2)
export const Scene12: React.FC<P> = ({ inAt, outAt }) => (
  <Stage inAt={inAt} outAt={outAt}>
    {/* 动作链 */}
    <Reveal at={45}>
      {[0, 1, 2, 3].map((i) => (
        <Dot key={i} cx={340 + i * 200} cy={560} r={12} color={THEME.inkSoft} />
      ))}
      <Line x1={340} y1={560} x2={940} y2={560} color={THEME.line} />
    </Reveal>

    {/* 结局（对应「注意力集中在结局上」1.2s） */}
    <Reveal at={75}>
      <Arrow x1={1000} y1={560} x2={1180} y2={560} color={THEME.accent} sw={STROKE.bold} head={16} />
      <Ring cx={1340} cy={560} r={110} color={THEME.accent} sw={STROKE.bold} />
      <Txt x={1340} y={560} text="结局" size={FONT.label} color={THEME.accent} />
    </Reveal>

    {/* 注意力被结局吸走（对应「改变结局的动作」3.2s） */}
    <Reveal at={120}>
      <path d="M 1340 430 C 1200 340, 800 340, 480 440" fill="none" stroke={THEME.accent} strokeWidth={STROKE.normal} strokeDasharray="12 10" />
    </Reveal>

    <Reveal at={150}>
      <Chip x={300} y={700} text="动作链：观察 → 判断 → 调整 → 落点" size={FONT.labelSmall} />
    </Reveal>

    <Reveal at={165}>
      <Formula x={CX} y={860} text="能改变结局的动作，最先被忽略" size={30} color={THEME.accent} />
    </Reveal>
  </Stage>
);
