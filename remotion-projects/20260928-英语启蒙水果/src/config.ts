export const FPS = 30;
export const VIDEO_WIDTH = 1080;
export const VIDEO_HEIGHT = 1920;

/** 卡片之间的缓冲（帧）。音频尾部静音之外再留这么多，段间才有呼吸 */
export const ROW_GAP_FRAMES = 8;
/** 高亮渐入时长（帧）—— 参考片实测约 15 帧 */
export const HILITE_FADE = 15;
/** 高亮相对该卡音频起点的延迟（帧）—— 参考片实测约 6 帧 */
export const HILITE_DELAY = 6;

export type FruitCard = {
  en: string;
  ipa: string;
  zh: string;
  /** public/thumbs/ 下的文件名 */
  img: string;
  /** 该卡配音的实际时长（秒，ffprobe 实测）—— 改音频后必须同步更新 */
  audioSeconds: number;
};

/**
 * 音标为**英式**（与 Tina老师 中/英式英语音色一致），去掉了牛津式可选的 (r)。
 */
export const ROWS: FruitCard[] = [
  { en: "apple",      ipa: "/ˈæpl/",           zh: "苹果",   img: "s01_apple.svg",      audioSeconds: 1.37 },
  { en: "banana",     ipa: "/bəˈnɑːnə/",       zh: "香蕉",   img: "s02_banana.svg",     audioSeconds: 2.09 },
  { en: "orange",     ipa: "/ˈɒrɪndʒ/",        zh: "橙子",   img: "s03_orange.svg",     audioSeconds: 1.93 },
  { en: "grape",      ipa: "/ɡreɪp/",          zh: "葡萄",   img: "s04_grape.svg",      audioSeconds: 1.53 },
  { en: "strawberry", ipa: "/ˈstrɔːbəri/",     zh: "草莓",   img: "s05_strawberry.svg", audioSeconds: 2.99 },
  { en: "watermelon", ipa: "/ˈwɔːtəmelən/",    zh: "西瓜",   img: "s06_watermelon.svg", audioSeconds: 1.80 },
  { en: "pear",       ipa: "/peə/",            zh: "梨",     img: "s07_pear.svg",       audioSeconds: 1.54 },
  { en: "peach",      ipa: "/piːtʃ/",          zh: "桃子",   img: "s08_peach.svg",      audioSeconds: 1.38 },
  { en: "cherry",     ipa: "/ˈtʃeri/",         zh: "樱桃",   img: "s09_cherry.svg",     audioSeconds: 1.63 },
  { en: "mango",      ipa: "/ˈmæŋɡəʊ/",        zh: "芒果",   img: "s10_mango.svg",      audioSeconds: 2.07 },
  { en: "kiwi",       ipa: "/ˈkiːwiː/",        zh: "猕猴桃", img: "s11_kiwi.svg",       audioSeconds: 1.93 },
  { en: "pineapple",  ipa: "/ˈpaɪnæpəl/",      zh: "菠萝",   img: "s12_pineapple.svg",  audioSeconds: 1.65 },
];

/** 每张卡占用的帧数 = 该卡音频帧数 + 缓冲 */
export const ROW_FRAMES: number[] = ROWS.map(
  (r) => Math.ceil(r.audioSeconds * FPS) + ROW_GAP_FRAMES,
);

/** 每张卡音频的起始帧（整屏常驻 + 逐卡高亮，无交叉溶解） */
export const ROW_STARTS: number[] = ROW_FRAMES.reduce<number[]>((acc, _f, i) => {
  acc.push(i === 0 ? 0 : acc[i - 1] + ROW_FRAMES[i - 1]);
  return acc;
}, []);

export const TOTAL_FRAMES = ROW_STARTS[ROW_STARTS.length - 1] + ROW_FRAMES[ROW_FRAMES.length - 1];

/**
 * 版面实测值：源片 576×768 逐像素量测，×1.875 换算到 1080×1440。
 *   标题墨迹 y 13–53、副标题 y 75–101
 *   网格 3 列 × 4 行 —— 卡列 x [59,198] [217,356] [374,513]、卡行 y [110,245] [271,406] [431,566] [590,725]
 *   即 卡 139×135、列步进 157.5、行步进 160.5
 *   卡内三段：图 y 122–179、英文墨迹 197–214、中文墨迹 222–243
 *   （源片无浅黄容器，白卡直接排在浅黄底上）
 *
 * ⚠️ 本片卡内比源片**多一行音标**，所以图高与英文位置做了压缩，见下方 TITLE_CENTER 注释。
 */
export const LAYOUT = {
  /** 标题/副标题用「墨迹中心 y」定位（flex 居中容器，中心 ≈ 墨迹中心） */
  titleCenterY: 95,
  titleFontSize: 88,
  subtitleCenterY: 210,
  subtitleFontSize: 58,

  gridX: 40,
  gridY: 265,
  cols: 3,
  cardW: 310,
  cardH: 350,
  colStep: 345,
  rowStep: 410,
  cardRadius: 26,

  /**
   * 以下均为「相对卡顶 / 卡左」的偏移。卡内自上而下：图 → 英文 → 音标 → 中文。
   * 音标紧跟英文成一组（它是英文的注音），中文单独一行并与这组拉开距离。
   */
  imgSize: 132,
  imgRadius: 18,
  imgCenterY: 76,
  enCenterY: 185,
  enFontSize: 64,
  /** 英文可用的最大宽度（卡宽 310 减左右留白）—— 超过就自动缩字号 */
  enMaxWidth: 286,
  ipaCenterY: 235,
  ipaFontSize: 36,
  zhCenterY: 295,
  zhFontSize: 50,
} as const;

/** 色板：底与卡沿用本项目已建立的紫底体系（与参考片的米黄底刻意不同） */
export const COLORS = {
  bg: "#E8E0F4",
  card: "#FEF4E2",
  cardActive: "#FE902C",
  ink: "#000000",
  subtitle: "#2B2B2B",
} as const;
