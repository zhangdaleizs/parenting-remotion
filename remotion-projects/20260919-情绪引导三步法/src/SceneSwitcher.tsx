import React from "react";
import { AbsoluteFill, Audio, Sequence, staticFile } from "remotion";
import { TopBar } from "./components/TopBar";
import { Caption } from "./components/Caption";
import { Illustration } from "./components/Illustration";

/**
 * 「顶部栏 + 插画 + 底部字幕」总调度（复刻参考片结构）。
 *
 * 时间轴规则：
 *   inAt_i  = 前一段的结束（音频首尾相接，不留空）
 *   outAt_i = inAt_i + dur_i
 *   dur_i   = 该段音频帧数 + 缓冲（缓冲 ≥ FADE_IN，防"话没说完画面就没了"）
 *
 * ⚠️ 当前 dur 是按字数估算的占位值，TTS 生成后必须用 ffprobe 实测重排。
 */
type SceneDef = {
  /** public/images/<img>.png */
  img: string;
  /** 底部字幕（= 该段口播全文） */
  text: string;
  /** 本段时长（帧）。= 音频帧数 + 缓冲(14) */
  dur: number;
  /** public/audio/<audio>.mp3 */
  audio?: string;
  sfx?: { at: number; file: string; volume: number }[];
};

const FADE_IN = 12;
const SFX_WHOOSH = "whoosh.wav";

// dur = 各段音频实测帧数 + 16 缓冲（缓冲 ≥ FADE_IN，防"话没说完画面就没了"）
const SCENES: SceneDef[] = [
  { img: "img01", text: "孩子生气时，你的第一句话，决定他一生的情绪底色。", dur: 167, audio: "s01" }, // 5.06s
  { img: "img02", text: "他尖叫、摔东西，不是脾气差，是内心在求救。", dur: 156, audio: "s02" }, // 4.68s
  { img: "img03", text: "那些歇斯底里，翻译过来只有一句话：\n我很难受，但我不知道怎么表达。", dur: 185, audio: "s03" }, // 5.64s
  { img: "img04", text: "可我们的第一反应，常常是不许哭，你怎么这么不懂事。", dur: 161, audio: "s04" }, // 4.85s
  { img: "img05", text: "火没扑灭，反而把孩子的情绪出口堵死了。", dur: 125, audio: "s05" }, // 3.65s
  { img: "img06", text: "真正的引导不是消灭情绪，是教他跟情绪共处。分三步。", dur: 185, audio: "s06" }, // 5.64s
  { img: "img07", text: "第一步，孩子炸的时候，你先别炸。", dur: 100, audio: "s07", sfx: [{ at: 0, file: SFX_WHOOSH, volume: 0.15 }] }, // 2.83s
  { img: "img08", text: "深呼吸三次，心里说一句：\n他不是在闹我，他是在向我求救。", dur: 180, audio: "s08" }, // 5.47s
  { img: "img09", text: "你的平静，就是接住他情绪最好的容器。", dur: 113, audio: "s09" }, // 3.24s
  { img: "img10", text: "第二步，替他说出他说不出来的话。", dur: 107, audio: "s10", sfx: [{ at: 0, file: SFX_WHOOSH, volume: 0.15 }] }, // 3.05s
  { img: "img11", text: "蹲下来，看着他的眼睛：\n你现在很生气对不对，因为积木倒了，你搭了好久。", dur: 180, audio: "s11" }, // 5.47s
  { img: "img12", text: "情绪一旦被看见、被说破，破坏力就减半。", dur: 144, audio: "s12" }, // 4.27s
  { img: "img13", text: "第三步，给情绪一个安全的出口。", dur: 113, audio: "s13", sfx: [{ at: 0, file: SFX_WHOOSH, volume: 0.15 }] }, // 3.24s
  { img: "img14", text: "去阳台吼三声，一起撕掉这张废纸，\n想打枕头？这个可以打。", dur: 203, audio: "s14" }, // 6.26s
  { img: "img16", text: "这不是纵容，是教他：情绪可以来，也可以走，\n你可以选择怎么送它走。", dur: 208, audio: "s15" }, // 6.41s
  { img: "img17", text: "等他平静了，抱抱他，轻声问：\n刚才生气的时候，你心里是什么感觉？", dur: 185, audio: "s16" }, // 5.64s
  { img: "img18", text: "不评价，不教育，就只听。\n这份倾听，比讲一百遍大道理都管用。", dur: 191, audio: "s17" }, // 5.86s
  { img: "img19", text: "你不是在对付一个问题孩子，\n你是在陪一个小生命，学会跟自己的情绪冲浪。", dur: 203, audio: "s18" }, // 6.26s
];

// ===== 排帧：累加得到每段的全局 inAt / outAt =====
export const LAYOUT_SCENES = (() => {
  let cursor = 0;
  return SCENES.map((s, i) => {
    // ⚠️ 首段：帧 0 就整段在场，否则头 12 帧是空白（"开场大白板"）
    const inAt = i === 0 ? -FADE_IN : cursor;
    const outAt = inAt + s.dur;
    cursor = inAt + s.dur;
    return { ...s, inAt, outAt };
  });
})();

const last = LAYOUT_SCENES[LAYOUT_SCENES.length - 1];
export const TOTAL_FRAMES = last.inAt + last.dur;

export const SceneSwitcher: React.FC = () => {
  const SFX: { from: number; file: string; volume: number }[] = [];
  for (const s of LAYOUT_SCENES) {
    for (const x of s.sfx ?? []) SFX.push({ from: s.inAt + x.at, file: x.file, volume: x.volume });
  }

  return (
    <AbsoluteFill style={{ background: "#FFFFFF" }}>
      {/* 顶部固定栏 */}
      <TopBar />

      {/* 分隔线（插画浮于其上，两侧可见） */}
      <div
        style={{
          position: "absolute",
          top: 595,
          left: 0,
          width: "100%",
          height: 1.5,
          background: "#8C8C8C",
        }}
      />

      {/* 插画：按全局帧淡入盖旧，旧图不淡出 */}
      {LAYOUT_SCENES.map((s, i) => (
        <Illustration key={`img-${i}`} img={`images/${s.img}.png`} inAt={s.inAt} outAt={s.outAt} />
      ))}

      {/* 底部字幕 */}
      {LAYOUT_SCENES.map((s, i) => (
        <Caption key={`cap-${i}`} text={s.text} inAt={s.inAt} outAt={s.outAt} />
      ))}

      {/* 口播音轨：必须用 <Sequence from> 包裹（裸 <Audio> 基准是第 0 帧） */}
      {LAYOUT_SCENES.filter((s) => s.audio).map((s, i) => (
        <Sequence key={`audio-${i}`} from={s.inAt} layout="none">
          <Audio src={staticFile(`audio/${s.audio}.mp3`)} />
        </Sequence>
      ))}

      {/* 音效轨 */}
      {SFX.map((s, i) => (
        <Sequence key={`sfx-${i}`} from={s.from} layout="none">
          <Audio src={staticFile(`audio/sfx/${s.file}`)} volume={s.volume} />
        </Sequence>
      ))}

      {/* BGM：全程铺满（参考实测无静音段），音量压很低 */}
      <Sequence from={0} layout="none">
        <Audio src={staticFile("audio/bgm.mp3")} volume={0.1} loop />
      </Sequence>
    </AbsoluteFill>
  );
};

export default SceneSwitcher;
