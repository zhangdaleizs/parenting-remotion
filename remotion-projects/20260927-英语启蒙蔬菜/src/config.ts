export const FPS = 30;
export const VIDEO_WIDTH = 1080;
export const VIDEO_HEIGHT = 1920;

/** 行卡之间的缓冲（帧）。音频尾部静音之外再留这么多，段间才有呼吸 */
export const ROW_GAP_FRAMES = 8;
/** 高亮渐入时长（帧）—— 参考片实测约 15 帧 */
export const HILITE_FADE = 15;
/** 高亮相对该行音频起点的延迟（帧）—— 参考片实测约 6 帧 */
export const HILITE_DELAY = 6;

export type VegRow = {
  en: string;
  ipa: string;
  zh: string;
  /** public/thumbs/ 下的文件名 */
  img: string;
  /** 该行配音的实际时长（秒，ffprobe 实测）—— 改音频后必须同步更新 */
  audioSeconds: number;
};

export const ROWS: VegRow[] = [
  { en: "daikon",       ipa: "/ˈdaɪkən/",         zh: "白萝卜", img: "s01_daikon.png",      audioSeconds: 1.65 },
  { en: "broccoli",     ipa: "/ˈbrɒkəli/",       zh: "西兰花", img: "s02_broccoli.png",    audioSeconds: 1.65 },
  { en: "white gourd",  ipa: "/waɪt ɡɔːd/",       zh: "冬瓜",   img: "s03_wintermelon.png", audioSeconds: 1.80 },
  { en: "loofah",       ipa: "/ˈluːfə/",          zh: "丝瓜",   img: "s04_loofah.png",      audioSeconds: 1.64 },
  { en: "tomato",       ipa: "/təˈmɑːtəʊ/",       zh: "西红柿", img: "s05_tomato.png",      audioSeconds: 1.81 },
  { en: "bitter gourd", ipa: "/ˈbɪtər ɡɔːd/",     zh: "苦瓜",   img: "s06_bittergourd.png", audioSeconds: 2.20 },
  { en: "eggplant",     ipa: "/ˈeɡplænt/",        zh: "茄子",   img: "s07_eggplant.png",    audioSeconds: 2.07 },
  { en: "Chinese yam",  ipa: "/ˌtʃaɪˈniːz jæm/",  zh: "山药",   img: "s08_yam.png",         audioSeconds: 1.92 },
  { en: "green bean",   ipa: "/ˌɡriːn ˈbiːn/",    zh: "四季豆", img: "s09_greenbean.png",   audioSeconds: 2.06 },
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
 * 版面实测值：源片 576×1024 逐像素量测，×1.875 换算到 1080×1920。
 *   标题墨迹 y 60–110、副标题 y 132–169
 *   容器 x 23–552 / y 200–916；行卡 x 46–530、高 64、步进 78
 *   行内三者**各自居中**：英文中心 x=151.5、缩略图 290–338、中文中心 x=457.5
 *   （只量左边界会误判成左对齐——不同行的词长短不同，实际每行中心都一样）
 */
export const LAYOUT = {
  titleTop: 108,
  titleFontSize: 100,
  subtitleTop: 236,
  subtitleFontSize: 76,

  panelX: 43,
  panelY: 375,
  panelW: 992,
  panelH: 1336,
  panelRadius: 75,

  cardX: 86,
  cardW: 908,
  cardH: 122,
  cardStep: 146,
  cardTop: 398,
  cardRadius: 42,

  /** 以下均为「相对行卡左边」的偏移 */
  enCenterX: 198,
  enFontSize: 60,
  ipaFontSize: 40,
  ipaGap: 8,
  thumbCenterX: 503,
  thumbSize: 92,
  zhCenterX: 772,
  zhFontSize: 60,
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
