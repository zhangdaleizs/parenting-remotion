import React from "react";
import { AbsoluteFill, Audio, Sequence, staticFile } from "remotion";
import { InfoBackground } from "./components/Background";
import { SceneTitle } from "./components/SceneTitle";
import { Caption } from "./components/Caption";
import { Scene01, Scene02, Scene03, Scene04, Scene05, Scene06 } from "./scenes/part1";
import { Scene07, Scene08, Scene09, Scene10, Scene11, Scene12 } from "./scenes/part2";
import { Scene13, Scene14, Scene15, Scene16, Scene17 } from "./scenes/part3";

/**
 * 「标题 + 线条信息图 + 底部字幕」总调度（复刻参考片结构）。
 *
 * 时间轴规则：
 *   inAt_i  = 前一段结束（音频首尾相接）
 *   outAt_i = inAt_i + dur_i
 *   dur_i   = 该段音频帧数 + 缓冲(12)
 * ⚠️ dur 必须用 ffprobe 实测音频时长换算，改音频后要重排。
 */
type SceneDef = {
  title: string;
  sub: string;
  /** 底部字幕（= 该段口播，长句用 \n 断在标点后） */
  text: string;
  /** 本段时长（帧）= 音频帧数 + 12 */
  dur: number;
  audio: string;
  Comp: React.FC<{ inAt: number; outAt: number }>;
};

const BUFFER = 12;

const SCENES: SceneDef[] = [
  { title: "越怕越失", sub: "Fear of Loss", text: "越害怕失去某个人或某件事，\n反而越容易失去，对吗？", dur: 122 + BUFFER, audio: "s01", Comp: Scene01 },
  { title: "杯满则溢", sub: "Overflow", text: "你越反复提醒自己不能洒，\n手臂越容易僵硬，水越容易洒出来。", dur: 204 + BUFFER, audio: "s02", Comp: Scene02 },
  { title: "瓦伦达效应", sub: "The Wallenda Effect", text: "这种现象，常被叫做瓦伦达效应。", dur: 81 + BUFFER, audio: "s03", Comp: Scene03 },
  { title: "瓦伦达效应", sub: "The Wallenda Effect", text: "名词源于高空走钢丝表演者卡尔·瓦伦达。\n1978年，他在波多黎各表演时不幸坠落。", dur: 188 + BUFFER, audio: "s04", Comp: Scene04 },
  { title: "注意力转向", sub: "Attention Shift", text: "他的妻子曾回忆说：出事前，他的注意力\n已经从「怎样走好」，转向了「千万不能掉下去」。", dur: 172 + BUFFER, audio: "s05", Comp: Scene05 },
  { title: "压力下失常", sub: "Choking Under Pressure", text: "压力会把注意力从任务本身转向失败的后果，\n也可能打断原本早已熟练的动作。", dur: 280 + BUFFER, audio: "s06", Comp: Scene06 },
  { title: "低奖励实验", sub: "Low Reward Trial", text: "2009年的一项实验中，参与者在低奖励条件下，\n平均成功率为74.3%。", dur: 242 + BUFFER, audio: "s07", Comp: Scene07 },
  { title: "十倍奖励", sub: "Tenfold Reward", text: "奖励提高到原来的10倍后，成功率却降到63.9%，\n将近下降了10.4个百分点。", dur: 195 + BUFFER, audio: "s08", Comp: Scene08 },
  { title: "越过临界点", sub: "Crossing the Threshold", text: "奖励本应增强动力，可当「必须得到」变成压力，\n动力也可能越过临界点。", dur: 151 + BUFFER, audio: "s09", Comp: Scene09 },
  { title: "不是必然", sub: "Not Destined to Fail", text: "这不代表奖励越高就一定失败，\n也不代表害怕必然导致失去。", dur: 250 + BUFFER, audio: "s10", Comp: Scene10 },
  { title: "因人而异", sub: "Individual Differences", text: "有些人甚至会在压力中表现得更好。", dur: 79 + BUFFER, audio: "s11", Comp: Scene11 },
  { title: "动作先丢失", sub: "Action Lost First", text: "当你的注意力集中在结局上，\n原本能够改变结局的动作，往往最先被忽略。", dur: 194 + BUFFER, audio: "s12", Comp: Scene12 },
  { title: "关系中的试探", sub: "Reassurance Loop", text: "一个人越害怕失去对方，\n越可能反复确认、不断试探。", dur: 156 + BUFFER, audio: "s13", Comp: Scene13 },
  { title: "理解变审问", sub: "Care into Control", text: "可当理解变成审问，靠近变成控制，\n这段关系就已经开始付出代价。", dur: 154 + BUFFER, audio: "s14", Comp: Scene14 },
  { title: "回到当下", sub: "Return to Now", text: "真正能留住一个人的，从来不是把手握得更紧，\n而是把注意力交还给当下的理解、边界与回应。", dur: 220 + BUFFER, audio: "s15", Comp: Scene15 },
  { title: "真正的珍惜", sub: "Cherish without Gripping", text: "真正的珍惜不是拼命攥紧，\n而是看清脚下的落点，也允许彼此自由呼吸。", dur: 192 + BUFFER, audio: "s16", Comp: Scene16 },
  { title: "守住重心", sub: "Keep Your Center", text: "你无法保证谁永远不走，但可以守住自己的重心。\n即使结局改变，也依然有能力好好爱人，好好生活。", dur: 226 + BUFFER, audio: "s17", Comp: Scene17 },
];

// ===== 排帧 =====
const FADE_IN = 12;
export const LAYOUT_SCENES = (() => {
  let cursor = 0;
  return SCENES.map((s, i) => {
    // ⚠️ 首段：帧 0 就整段在场，否则头 12 帧是空背景
    const inAt = i === 0 ? -FADE_IN : cursor;
    const outAt = inAt + s.dur;
    cursor = outAt;
    return { ...s, inAt, outAt };
  });
})();

const last = LAYOUT_SCENES[LAYOUT_SCENES.length - 1];
export const TOTAL_FRAMES = last.outAt;

export const SceneSwitcher: React.FC = () => (
  <AbsoluteFill style={{ background: "#F2ECE4" }}>
    <InfoBackground />

    {/* 场景图示（淡入盖旧图） */}
    {LAYOUT_SCENES.map((s, i) => (
      <s.Comp key={`scene-${i}`} inAt={s.inAt} outAt={s.outAt} />
    ))}

    {/* 顶部标题（硬切） */}
    {LAYOUT_SCENES.map((s, i) => (
      <SceneTitle key={`title-${i}`} title={s.title} subtitle={s.sub} inAt={s.inAt} outAt={s.outAt} />
    ))}

    {/* 底部字幕（硬切） */}
    {LAYOUT_SCENES.map((s, i) => (
      <Caption key={`cap-${i}`} text={s.text} inAt={s.inAt} outAt={s.outAt} />
    ))}

    {/* 口播：必须用 <Sequence from> 包裹（裸 <Audio> 基准是第 0 帧） */}
    {LAYOUT_SCENES.map((s, i) => (
      <Sequence key={`audio-${i}`} from={s.inAt} layout="none">
        <Audio src={staticFile(`audio/${s.audio}.mp3`)} />
      </Sequence>
    ))}

    {/* BGM：全程铺满，音量压低 */}
    <Sequence from={0} layout="none">
      <Audio src={staticFile("audio/bgm.mp3")} volume={0.1} loop />
    </Sequence>
  </AbsoluteFill>
);

export default SceneSwitcher;
