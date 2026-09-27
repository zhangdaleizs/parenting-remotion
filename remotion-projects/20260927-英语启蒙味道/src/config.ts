export const FPS = 30;
export const VIDEO_WIDTH = 1080;
export const VIDEO_HEIGHT = 1440;

/** 卡片之间的缓冲（帧）。音频尾部静音之外再留这么多，段间才有呼吸 */
export const ROW_GAP_FRAMES = 8;
/** 高亮渐入时长（帧）—— 参考片实测约 15 帧 */
export const HILITE_FADE = 15;
/** 高亮相对该卡音频起点的延迟（帧）—— 参考片实测约 6 帧 */
export const HILITE_DELAY = 6;

export type TasteCard = {
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
export const ROWS: TasteCard[] = [
  { en: "sweet",  ipa: "/swiːt/",    zh: "甜的",   img: "s01_sweet.png",   audioSeconds: 1.66 },
  { en: "sour",   ipa: "/ˈsaʊə/",   zh: "酸的",   img: "s02_sour.png",    audioSeconds: 1.54 },
  { en: "bitter", ipa: "/ˈbɪtə/",   zh: "苦的",   img: "s03_bitter.png",  audioSeconds: 1.38 },
  { en: "spicy",  ipa: "/ˈspaɪsi/", zh: "辣的",   img: "s04_spicy.png",   audioSeconds: 1.51 },
  { en: "salty",  ipa: "/ˈsɔːlti/", zh: "咸的",   img: "s05_salty.png",   audioSeconds: 2.18 },
  { en: "crispy", ipa: "/ˈkrɪspi/", zh: "酥脆的", img: "s06_crispy.png",  audioSeconds: 1.53 },
  { en: "soft",   ipa: "/sɒft/",    zh: "软的",   img: "s07_soft.png",    audioSeconds: 1.66 },
  { en: "juicy",  ipa: "/ˈdʒuːsi/", zh: "多汁的", img: "s08_juicy.png",   audioSeconds: 1.65 },
  { en: "greasy", ipa: "/ˈɡriːsi/", zh: "油腻的", img: "s09_greasy.png",  audioSeconds: 2.47 },
  { en: "tough",  ipa: "/tʌf/",     zh: "难嚼的", img: "s10_tough.png",   audioSeconds: 1.66 },
  { en: "mild",   ipa: "/maɪld/",   zh: "清淡的", img: "s11_mild.png",    audioSeconds: 1.65 },
  { en: "burned", ipa: "/bɜːnd/",   zh: "烧焦的", img: "s12_burned.png",  audioSeconds: 1.52 },
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
  titleCenterY: 62,
  titleFontSize: 77,
  subtitleCenterY: 165,
  subtitleFontSize: 51,

  gridX: 114,
  gridY: 206,
  cols: 3,
  cardW: 261,
  cardH: 253,
  colStep: 295,
  rowStep: 302,
  cardRadius: 22,

  /**
   * 以下均为「相对卡顶 / 卡左」的偏移。卡内自上而下：图 → 英文 → 音标 → 中文。
   * 音标紧跟英文成一组（它是英文的注音），中文单独一行并与这组拉开距离。
   */
  imgSize: 104,
  imgRadius: 15,
  imgCenterY: 58,
  enCenterY: 138,
  enFontSize: 54,
  ipaCenterY: 176,
  ipaFontSize: 30,
  zhCenterY: 228,
  zhFontSize: 40,
} as const;

/** 色板：底与卡沿用本项目已建立的紫底体系（与参考片的米黄底刻意不同） */
export const COLORS = {
  bg: "#E8E0F4",
  card: "#FEF4E2",
  cardActive: "#FE902C",
  ink: "#000000",
  subtitle: "#2B2B2B",
} as const;
