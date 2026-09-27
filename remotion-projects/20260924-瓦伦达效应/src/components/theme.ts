// ===== 信息图动画型 · 视觉基准（本项目专用皮肤）=====
// 视觉：暖米色径向渐变噪点底 + 顶部中文标题/英文副标题 + 中部线条信息图 + 底部大字幕。
// ⚠️ 规格来自参考片逐帧实测（原片 1920×1080），改动前先对照参考素材。

export const THEME = {
  /** 背景：暖米色。中心略亮、四角略暗 → 径向渐变 */
  bgCenter: "#F7F1EA",
  bgCorner: "#E6DBD0",
  /** 正文墨色：深蓝黑（标题与字幕同色） */
  ink: "#232838",
  /** 次级墨色：线条标签、说明文字 */
  inkSoft: "#4A5468",
  /** 细线（连线、坐标轴） */
  line: "#8E97A8",
  /** 卡片/框线：浅暖灰 */
  frame: "#C6C2BA",
  /** 强调：赭红（否定/风险/关键点） */
  accent: "#C0563C",
  /** 强调浅调（填充块） */
  accentSoft: "#E8C4B4",
  /** 数据条：深蓝 */
  bar: "#3D5A80",
  /** 英文副标题：暖灰 */
  sub: "#8A8578",
  /** 装饰弧线：极淡 */
  deco: "#D8D0C4",
} as const;

/** 横屏 1920×1080（与参考片一致） */
export const SCREEN = { width: 1920, height: 1080 };
export const centerX = SCREEN.width / 2;

/** 版式坐标（实测参考帧 1920×1080） */
export const LAYOUT = {
  titleY: 83, // 中文标题中心 y（实测带 57-109）
  subTitleY: 127, // 英文副标题中心 y（实测带 121-134）
  captionY: 1014, // 底部字幕中心 y（实测带 982-1046）
  /** 图示绘制区（顶部标题之下、底部字幕之上） */
  stageTop: 175,
  stageBottom: 950,
} as const;

/** 字号（实测：标题墨高 53px、字幕墨高 64px） */
export const FONT = {
  title: 62,
  subTitle: 22,
  caption: 78,
  captionSmall: 62, // 两行时
  label: 26, // 图元标签
  labelSmall: 22,
  formula: 28, // 公式行
} as const;

/** 中文粗黑体 */
export const FONT_FAMILY = `"PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "Heiti SC", sans-serif`;
/** 英文副标题用衬线体（参考片为衬线大写小字距） */
export const FONT_SERIF = `"Times New Roman", "Songti SC", Georgia, serif`;

/** 线条粗细（1920 基准） */
export const STROKE = {
  thin: 1.5,
  normal: 2.5,
  bold: 4,
  icon: 5,
} as const;
