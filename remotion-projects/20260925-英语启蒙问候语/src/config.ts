export const FPS = 30;
export const VIDEO_WIDTH = 1080;
export const VIDEO_HEIGHT = 1440;

/** 交叉溶解时长（帧） */
export const CROSSFADE_FRAMES = 15;

/**
 * 版面实测值：源片 1080×1456 逐像素量测（黑字墨迹边界）
 *   中文行墨迹 y 225–302（高 78）、英文行墨迹 y 335–391（高 57）
 *   ⚠️ 字幕是**居中**的，不是左对齐 —— 量了 3 段，每段每行的墨迹中心都落在 x≈528
 *   （1080 宽的画面中心 540，差 12px 是字形左侧留白）。最长的英文行
 *   「good morning good morning」实测宽 888px，所以容器要放到 920 才不折行。
 * 字号按字体度量反推：站酷快乐体中文墨迹 ≈ 0.86em；Baloo2 x-height ≈ 0.52em
 */
export const LAYOUT = {
  captionTop: 217,
  captionWidth: 920,
  zhFontSize: 78,
  /** 70 是「最长一行不折行」的上限：good morning good morning 在 76 下要 982px，容器只有 920 */
  enFontSize: 70,
  zhLineHeight: 1.0,
  enLineHeight: 1.0,
  zhEnGap: 8,
  zhStrokeWidth: 1.2,
} as const;

/** 一个需要「点亮」的词：at 是它在音频里的起始秒（whisper 词级时间戳） */
export type WordCue = { text: string; at: number };

export type SlideSpec = {
  /** 中文提示行 */
  zh: string;
  /** 英文行（显示用）—— ⚠️ 必须与音频**实际念的遍数**一致，不是按文案写 */
  en: string;
  /** 英文行逐词点亮锚点 */
  enWords: WordCue[];
  /** 中文行的提示词锚点（用于场景元素入场） */
  zhWords: WordCue[];
  durationInFrames: number;
  /** 场景组件 id，见 scenes/index.ts */
  scene: string;
};

export const SLIDES: SlideSpec[] = [
  {
    zh: "来是come 去是go",
    en: "come come go go",
    zhWords: [{ text: "来", at: 0.05 }, { text: "去", at: 1.83 }],
    enWords: [
      { text: "come", at: 0.93 },
      { text: "come", at: 3.09 },
      { text: "go", at: 4.27 },
      { text: "go", at: 4.71 },
    ],
    durationInFrames: 166,
    scene: "s01",
  },
  {
    zh: "点头yes 摇头no",
    en: "yes yes no no",
    zhWords: [{ text: "点头", at: 0.08 }, { text: "摇头", at: 1.7 }],
    enWords: [
      { text: "yes", at: 0.88 },
      { text: "yes", at: 3.08 },
      { text: "no", at: 4.34 },
      { text: "no", at: 4.7 },
    ],
    durationInFrames: 166,
    scene: "s02",
  },
  {
    zh: "我是I 你是you",
    en: "I love you",
    zhWords: [{ text: "我是", at: 0.05 }, { text: "你是", at: 1.45 }],
    enWords: [
      { text: "I", at: 2.85 },
      { text: "love", at: 2.97 },
      { text: "you", at: 3.25 },
    ],
    durationInFrames: 123,
    scene: "s03",
  },
  {
    zh: "见面问好说hello",
    // 音频实际只念了 3 遍（文案写 3 遍，被吞了 1 遍）
    en: "hello hello hello",
    zhWords: [{ text: "见面问好", at: 0.08 }, { text: "说", at: 1.26 }],
    enWords: [
      { text: "hello", at: 1.5 },
      { text: "hello", at: 2.76 },
      { text: "hello", at: 3.94 },
    ],
    durationInFrames: 145,
    scene: "s04",
  },
  {
    zh: "你好吗",
    en: "how are you",
    zhWords: [{ text: "你好吗", at: 0.05 }],
    enWords: [
      { text: "how", at: 1.63 },
      { text: "are", at: 1.85 },
      { text: "you", at: 2.07 },
    ],
    durationInFrames: 88,
    scene: "s05",
  },
  {
    zh: "谢谢你",
    en: "thank you thank you",
    zhWords: [{ text: "谢谢你", at: 0.14 }],
    enWords: [
      { text: "thank", at: 1.0 },
      { text: "you", at: 1.82 },
      { text: "thank", at: 2.18 },
      { text: "you", at: 2.7 },
    ],
    durationInFrames: 108,
    scene: "s06",
  },
  {
    zh: "熟人见面说hi",
    en: "hi hi hi",
    zhWords: [{ text: "熟人见面说", at: 0.14 }],
    enWords: [
      { text: "hi", at: 1.62 },
      { text: "hi", at: 2.56 },
      { text: "hi", at: 3.8 },
    ],
    durationInFrames: 144,
    scene: "s07",
  },
  {
    zh: "领走分手说bye bye",
    en: "bye bye bye",
    zhWords: [{ text: "领走分手说", at: 0.05 }],
    enWords: [
      { text: "bye", at: 1.69 },
      { text: "bye", at: 2.99 },
      { text: "bye", at: 3.83 },
    ],
    durationInFrames: 169,
    scene: "s08",
  },
  {
    zh: "客人来了快请坐",
    en: "sit down please",
    zhWords: [{ text: "客人来了", at: 0.34 }, { text: "快请坐", at: 1.54 }],
    enWords: [
      { text: "sit", at: 2.52 },
      { text: "down", at: 2.82 },
      { text: "please", at: 3.1 },
    ],
    durationInFrames: 118,
    scene: "s09",
  },
  {
    zh: "客人来了请喝茶",
    en: "have some tea please",
    zhWords: [{ text: "客人来了", at: 0.14 }, { text: "请喝茶", at: 1.02 }],
    enWords: [
      { text: "have", at: 2.3 },
      { text: "some", at: 2.76 },
      { text: "tea", at: 3.06 },
      { text: "please", at: 3.52 },
    ],
    durationInFrames: 129,
    scene: "s10",
  },
  {
    zh: "早上好",
    en: "good morning good morning",
    zhWords: [{ text: "早上好", at: 0.08 }],
    enWords: [
      { text: "good", at: 1.52 },
      { text: "morning", at: 1.78 },
      { text: "good", at: 2.68 },
      { text: "morning", at: 3.1 },
    ],
    durationInFrames: 139,
    scene: "s11",
  },
  {
    zh: "晚上好",
    en: "good evening good evening",
    zhWords: [{ text: "晚上好", at: 0.05 }],
    enWords: [
      { text: "good", at: 1.55 },
      { text: "evening", at: 1.91 },
      { text: "good", at: 2.95 },
      { text: "evening", at: 3.21 },
    ],
    durationInFrames: 144,
    scene: "s12",
  },
  {
    zh: "临睡之前道晚安",
    en: "good night good night",
    zhWords: [{ text: "临睡之前", at: 0.05 }, { text: "道晚安", at: 1.23 }],
    enWords: [
      { text: "good", at: 2.47 },
      { text: "night", at: 2.81 },
      { text: "good", at: 3.83 },
      { text: "night", at: 4.13 },
    ],
    durationInFrames: 166,
    scene: "s13",
  },
];

/** 每段起始帧：start_i = start_{i-1} + dur_{i-1} − CROSSFADE */
export const SLIDE_STARTS: number[] = SLIDES.reduce<number[]>((starts, _s, i) => {
  starts.push(i === 0 ? 0 : starts[i - 1] + SLIDES[i - 1].durationInFrames - CROSSFADE_FRAMES);
  return starts;
}, []);

export const TOTAL_FRAMES =
  SLIDE_STARTS[SLIDE_STARTS.length - 1] + SLIDES[SLIDES.length - 1].durationInFrames;
