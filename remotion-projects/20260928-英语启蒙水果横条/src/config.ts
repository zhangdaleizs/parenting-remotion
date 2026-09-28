export const FPS = 30;
export const VIDEO_WIDTH = 1080;
export const VIDEO_HEIGHT = 1920;

/** 行卡之间的缓冲（帧）。音频尾部静音之外再留这么多，段间才有呼吸 */
export const ROW_GAP_FRAMES = 8;
/** 高亮渐入时长（帧）—— 参考片实测约 15 帧 */
export const HILITE_FADE = 15;
/** 高亮相对该行音频起点的延迟（帧）—— 参考片实测约 6 帧 */
export const HILITE_DELAY = 6;

export type FruitRow = {
  en: string;
  ipa: string;
  zh: string;
  /** public/thumbs/ 下的文件名 */
  img: string;
  /** 该行配音的实际时长（秒，ffprobe 实测）—— 改音频后必须同步更新 */
  audioSeconds: number;
};

/**
 * 音标为**英式**（与 Tina老师 中/英式英语音色一致），去掉了牛津式可选的 (r)。
 * 音频复用「水果网格篇」已核验的同一批（词表、顺序完全相同）。
 */
export const ROWS: FruitRow[] = [
  { en: "apple",      ipa: "/ˈæpl/",       zh: "苹果",   img: "s01_apple.svg",      audioSeconds: 1.37 },
  { en: "banana",     ipa: "/bəˈnɑːnə/",   zh: "香蕉",   img: "s02_banana.svg",     audioSeconds: 2.09 },
  { en: "orange",     ipa: "/ˈɒrɪndʒ/",    zh: "橙子",   img: "s03_orange.svg",     audioSeconds: 1.93 },
  { en: "grape",      ipa: "/ɡreɪp/",      zh: "葡萄",   img: "s04_grape.svg",      audioSeconds: 1.53 },
  { en: "strawberry", ipa: "/ˈstrɔːbəri/", zh: "草莓",   img: "s05_strawberry.svg", audioSeconds: 2.99 },
  { en: "watermelon", ipa: "/ˈwɔːtəmelən/", zh: "西瓜",  img: "s06_watermelon.svg", audioSeconds: 1.80 },
  { en: "pear",       ipa: "/peə/",        zh: "梨",     img: "s07_pear.svg",       audioSeconds: 1.54 },
  { en: "peach",      ipa: "/piːtʃ/",      zh: "桃子",   img: "s08_peach.svg",      audioSeconds: 1.38 },
  { en: "cherry",     ipa: "/ˈtʃeri/",     zh: "樱桃",   img: "s09_cherry.svg",     audioSeconds: 1.63 },
  { en: "mango",      ipa: "/ˈmæŋɡəʊ/",    zh: "芒果",   img: "s10_mango.svg",      audioSeconds: 2.07 },
  { en: "kiwi",       ipa: "/ˈkiːwiː/",    zh: "猕猴桃", img: "s11_kiwi.svg",       audioSeconds: 1.93 },
  { en: "pineapple",  ipa: "/ˈpaɪnæpəl/",  zh: "菠萝",   img: "s12_pineapple.svg",  audioSeconds: 1.65 },
];

/** 每行占用的帧数 = 该行音频帧数 + 缓冲 */
export const ROW_FRAMES: number[] = ROWS.map(
  (r) => Math.ceil(r.audioSeconds * FPS) + ROW_GAP_FRAMES,
);

/** 每行音频的起始帧（不含交叉溶解，本形态是整屏常驻 + 逐行高亮） */
export const ROW_STARTS: number[] = ROW_FRAMES.reduce<number[]>((acc, _f, i) => {
  acc.push(i === 0 ? 0 : acc[i - 1] + ROW_FRAMES[i - 1]);
  return acc;
}, []);

export const TOTAL_FRAMES = ROW_STARTS[ROW_STARTS.length - 1] + ROW_FRAMES[ROW_FRAMES.length - 1];

/**
 * 版式基线照搬「单词列表高亮型」样板（`20260927-英语启蒙蔬菜`，源片 576×1024 ×1.875 实测）：
 *   容器 x 23–552 / y 200–916；行卡 x 46–530、高 64、步进 78
 *   行内三者**各自居中**：英文中心 x=151.5、缩略图 290–338、中文中心 x=457.5
 *
 * ⚠️ **本片 12 行 vs 样板的 9 行**，塞不进原来的容器，所以整体压缩重排：
 *   容器高 1336 → **1420**（同时上移 15px 多榨一点空间）
 *   行卡 122 → **98**、步进 146 → **116**（缩放系数 0.803）
 *   字号同比例：英文 60→48、音标 40→32、中文 60→48、缩略图 92→76、卡圆角 42→34
 *   行内三者的 x 中心**保持不变**（198 / 503 / 772）—— 它们本来就是按卡宽 908 布置的，卡宽没变
 */
export const LAYOUT = {
  titleTop: 108,
  titleFontSize: 88,
  subtitleTop: 232,
  subtitleFontSize: 66,

  panelX: 43,
  panelY: 360,
  panelW: 992,
  panelH: 1420,
  panelRadius: 60,

  cardX: 86,
  cardW: 908,
  cardH: 98,
  cardStep: 116,
  cardTop: 384,
  cardRadius: 34,

  /** 以下均为「相对行卡左边」的偏移 */
  enCenterX: 198,
  enFontSize: 48,
  ipaFontSize: 32,
  ipaGap: 6,
  thumbCenterX: 503,
  thumbSize: 76,
  zhCenterX: 772,
  zhFontSize: 48,
} as const;

/** 色板（参考片逐像素取色） */
export const COLORS = {
  bg: "#E8E0F4",
  panel: "#DCD0F0",
  card: "#FBF8FF",
  cardActive: "#FE902C",
  ink: "#000000",
  subtitle: "#2B2B2B",
} as const;
