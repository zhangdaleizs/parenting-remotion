export const FPS = 30;
export const VIDEO_WIDTH = 1080;
export const VIDEO_HEIGHT = 1440;

/** 交叉溶解时长（帧） */
export const CROSSFADE_FRAMES = 15;

/**
 * 版面实测值：源片 1080×1456 逐像素量测（黑字墨迹边界）
 *   中文行墨迹 y 225–302（高 78）、英文行墨迹 y 335–391（高 57）
 *   ⚠️ 字幕是**居中**的，不是左对齐
 * 字号按字体度量反推：站酷快乐体中文墨迹 ≈ 0.86em；Baloo2 x-height ≈ 0.52em
 */
export const LAYOUT = {
  captionTop: 217,
  captionWidth: 920,
  zhFontSize: 78,
  /** 70 是「最长一行不折行」的上限 */
  enFontSize: 70,
  zhLineHeight: 1.0,
  enLineHeight: 1.0,
  zhEnGap: 8,
  zhStrokeWidth: 1.2,
} as const;

/** 一个需要「点亮」的词：at 是它在音频里的起始秒（whisper 词级时间戳） */
export type WordCue = { text: string; at: number };

/** 画面物件的 id，见 scenes/items.tsx */
export type ItemId =
  | "apple"
  | "bird"
  | "flower"
  | "balloon"
  | "star"
  | "strawberry"
  | "fish"
  | "duck"
  | "candy"
  | "heart";

export type SlideSpec = {
  /** 中文提示行（拍手童谣） */
  zh: string;
  /** 英文行（显示用）—— ⚠️ 必须与音频**实际念的遍数**一致 */
  en: string;
  /** 英文行逐词点亮锚点 */
  enWords: WordCue[];
  /** 中文提示词的锚点 */
  zhWords: WordCue[];
  durationInFrames: number;
  /** 画面物件 */
  item: ItemId;
  /** 物件数量 = 这一组教的数字 */
  count: number;
};

export const SLIDES: SlideSpec[] = [
  {
    zh: "你拍一，我拍一",
    en: "one one one",
    zhWords: [{ text: "你拍一", at: 0.05 }],
    enWords: [
      { text: "one", at: 3.19 },
      { text: "one", at: 4.11 },
      { text: "one", at: 4.89 },
    ],
    durationInFrames: 193,
    item: "apple",
    count: 1,
  },
  {
    zh: "你拍二，我拍二",
    en: "two two two",
    zhWords: [{ text: "你拍二", at: 0.05 }],
    enWords: [
      { text: "two", at: 4.31 },
      { text: "two", at: 4.95 },
      { text: "two", at: 5.73 },
    ],
    durationInFrames: 214,
    item: "bird",
    count: 2,
  },
  {
    zh: "你拍三，我拍三",
    en: "three three three",
    zhWords: [{ text: "你拍三", at: 0.02 }],
    enWords: [
      { text: "three", at: 3.52 },
      { text: "three", at: 4.46 },
      { text: "three", at: 5.46 },
    ],
    durationInFrames: 209,
    item: "flower",
    count: 3,
  },
  {
    zh: "你拍四，我拍四",
    en: "four four four",
    zhWords: [{ text: "你拍四", at: 0.05 }],
    enWords: [
      { text: "four", at: 4.83 },
      { text: "four", at: 5.71 },
      { text: "four", at: 6.67 },
    ],
    durationInFrames: 247,
    item: "balloon",
    count: 4,
  },
  {
    zh: "你拍五，我拍五",
    en: "five five five",
    zhWords: [{ text: "你拍五", at: 0.05 }],
    enWords: [
      { text: "five", at: 3.81 },
      { text: "five", at: 4.37 },
      { text: "five", at: 5.27 },
    ],
    durationInFrames: 220,
    item: "star",
    count: 5,
  },
  {
    zh: "你拍六，我拍六",
    en: "six six six",
    zhWords: [{ text: "你拍六", at: 0.05 }],
    enWords: [
      { text: "six", at: 4.23 },
      { text: "six", at: 5.05 },
      { text: "six", at: 5.93 },
    ],
    durationInFrames: 226,
    item: "strawberry",
    count: 6,
  },
  {
    zh: "你拍七，我拍七",
    en: "seven seven seven",
    zhWords: [{ text: "你拍七", at: 0.05 }],
    enWords: [
      { text: "seven", at: 4.21 },
      { text: "seven", at: 5.01 },
      { text: "seven", at: 5.83 },
    ],
    durationInFrames: 220,
    item: "fish",
    count: 7,
  },
  {
    zh: "你拍八，我拍八",
    en: "eight eight eight",
    zhWords: [{ text: "你拍八", at: 0.05 }],
    enWords: [
      { text: "eight", at: 4.47 },
      { text: "eight", at: 5.21 },
      { text: "eight", at: 5.99 },
    ],
    durationInFrames: 225,
    item: "duck",
    count: 8,
  },
  {
    zh: "你拍九，我拍九",
    en: "nine nine nine",
    zhWords: [{ text: "你拍九", at: 0.05 }],
    enWords: [
      { text: "nine", at: 6.31 },
      { text: "nine", at: 7.11 },
      { text: "nine", at: 7.49 },
    ],
    durationInFrames: 265,
    item: "candy",
    count: 9,
  },
  {
    zh: "你拍十，我拍十",
    en: "ten ten ten",
    zhWords: [{ text: "你拍十", at: 0.05 }],
    enWords: [
      { text: "ten", at: 4.57 },
      { text: "ten", at: 5.47 },
      { text: "ten", at: 6.35 },
    ],
    durationInFrames: 235,
    item: "heart",
    count: 10,
  },
];

/** 每段起始帧：start_i = start_{i-1} + dur_{i-1} − CROSSFADE */
export const SLIDE_STARTS: number[] = SLIDES.reduce<number[]>((starts, _s, i) => {
  starts.push(i === 0 ? 0 : starts[i - 1] + SLIDES[i - 1].durationInFrames - CROSSFADE_FRAMES);
  return starts;
}, []);

export const TOTAL_FRAMES =
  SLIDE_STARTS[SLIDE_STARTS.length - 1] + SLIDES[SLIDES.length - 1].durationInFrames;
