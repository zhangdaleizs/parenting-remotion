import React from "react";
import { AbsoluteFill, Audio, Sequence, staticFile } from "remotion";
import { CardBackground, Card } from "./components";
import type { IconName, IconBadge } from "./components";

/**
 * 卡片轮播总调度（本项目主结构）。
 *
 * 与「多场景切换」的区别：**背景全程常驻**，只有卡片内容淡入淡出。
 * 参考视频就是这么做的 —— 底不变，内容安静地换。
 *
 * 时间轴规则：
 *   inAt_i  = 前一张的结束
 *   outAt_i = inAt_i + dur_i − FADE_OUT   （音频念完即开始淡出）
 *   dur_i   = 该卡音频帧数 + 缓冲（缓冲 ≥ FADE_IN，防"话没说完卡就没了"）
 */

// ⚠️ 占位数据：新项目必须按本项目音频的 whisper 词级时间戳重排 dur
type CardDef = {
  /** 中文序号「一二三…」。标题/钩子卡不填 */
  index?: string;
  /** 首行提示语（蓝色，与口诀同字号）。填了它就不显示序号 */
  lead?: string;
  icon: IconName;
  badge?: IconBadge;
  /** 口诀文案（橙色），\n 手动断行 */
  text: string;
  /** 标题卡 / 钩子卡：不显示序号 */
  hideIndex?: boolean;
  /** 本卡时长（帧）。= 音频帧数 + 缓冲(12-16) */
  dur: number;
  /** public/audio/<name>.mp3。不填 = 静默卡 */
  audio?: string;
  /** 本卡叠加的音效（相对本卡 inAt 的帧偏移） */
  sfx?: { at: number; file: string; volume: number }[];
};

const FADE_IN = 14; // 入场淡入帧数（与 useCardIn 默认一致）
const FADE_OUT = 9; // 出场淡出帧数（与 useCardOut 默认一致）

// ⚠️ 音效音量要**轻**：本赛道调性安静，参考视频几乎无音效
const SFX_WHOOSH = "whoosh.wav";

// ===== 卡片序列（⚠️ 示例内容：换成自己的选题）=====
// dur = 音频帧数 + 缓冲(12-16)。缓冲必须 ≥ FADE_IN，否则话没说完卡就没了。
const CARDS: CardDef[] = [
  {
    icon: "baby",
    lead: "带娃不生病的黄金法则",
    text: "大数据不会乱推",
    dur: 140, // 4.21s
    audio: "card00",
  },
  {
    icon: "baby",
    badge: "heart",
    lead: "刷到就为孩子",
    text: "留下一句平安健康",
    dur: 123, // 3.62s
    audio: "card01",
  },
  {
    index: "一",
    icon: "bowl",
    badge: "check",
    text: "喂饭七分饱",
    dur: 68, // 1.80s
    audio: "card02",
    sfx: [{ at: 0, file: SFX_WHOOSH, volume: 0.12 }],
  },
  {
    index: "二",
    icon: "pear",
    badge: "warn",
    text: "寒凉性的水果少吃",
    dur: 88, // 2.48s
    audio: "card03",
  },
  {
    index: "三",
    icon: "veggie",
    text: "肉要适量吃/蔬菜要管够",
    dur: 115, // 3.38s
    audio: "card04",
  },
  {
    index: "四",
    icon: "belly",
    badge: "heart",
    text: "每天揉揉小肚皮",
    dur: 85, // 2.37s
    audio: "card05",
  },
  {
    index: "五",
    icon: "onion",
    text: "洋葱式穿衣法/热了随时脱",
    dur: 118, // 3.46s
    audio: "card06",
  },
  {
    index: "六",
    icon: "sun",
    text: "多户外运动/少待在室内",
    dur: 112, // 3.28s
    audio: "card07",
  },
  {
    index: "七",
    icon: "pill",
    badge: "cross",
    text: "不要随便喂药",
    dur: 72, // 1.94s
    audio: "card08",
    sfx: [{ at: 0, file: "error.wav", volume: 0.2 }],
  },
];

// ===== 排帧：累加得到每张卡的全局 inAt / outAt =====
export const LAYOUT_CARDS = (() => {
  let cursor = 0;
  return CARDS.map((c, i) => {
    // ⚠️ 首卡：帧 0 就整卡在场（参考视频第一帧就是完整标题卡）——
    //    别让开场卡从 opacity 0 淡入，否则头 14 帧是空背景（"开场大白板"）。
    const inAt = i === 0 ? -FADE_IN : cursor;
    const outAt = inAt + c.dur - FADE_OUT;
    cursor = inAt + c.dur;
    return { ...c, inAt, outAt };
  });
})();

const last = LAYOUT_CARDS[LAYOUT_CARDS.length - 1];
export const TOTAL_FRAMES = last.inAt + last.dur;

export const WATERMARK = "账号名"; // ⚠️ 换成自己的

export const SceneSwitcher: React.FC = () => {
  // 音效轨：把所有卡的 sfx 摊平成全局节拍表
  const SFX: { from: number; file: string; volume: number }[] = [];
  for (const c of LAYOUT_CARDS) {
    for (const s of c.sfx ?? []) SFX.push({ from: c.inAt + s.at, file: s.file, volume: s.volume });
  }

  return (
    <AbsoluteFill style={{ background: "#F0F0F0" }}>
      {/* 背景常驻 */}
      <CardBackground />

      {/* 卡片：不用 <Sequence> 包裹 —— Card 内部按全局帧算 opacity，
          local<0 时自然不可见。（Card 内用 useCurrentFrame() = 全局帧）*/}
      {LAYOUT_CARDS.map((c, i) => (
        <Card
          key={`card-${i}`}
          index={c.index}
          lead={c.lead}
          icon={c.icon}
          badge={c.badge}
          text={c.text}
          hideIndex={c.hideIndex}
          inAt={c.inAt}
          outAt={c.outAt}
          watermark={i === 0 ? undefined : WATERMARK}
        />
      ))}

      {/* 口播音轨：音频必须用 <Sequence from> 包裹（裸 <Audio> 基准是第 0 帧） */}
      {LAYOUT_CARDS.filter((c) => c.audio).map((c, i) => (
        <Sequence key={`audio-${i}`} from={c.inAt} layout="none">
          <Audio src={staticFile(`audio/${c.audio}.mp3`)} />
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
