// ===== 育儿卡片皮肤 · 风格基准（全库唯一来源）=====
// 视觉：浅灰噪点底 + 白色圆角卡托黑线简笔图标 + 深蓝序号 + 赭橙口诀。
// ⚠️ 以下全部为「参考视频逐帧取色实测值」（1280×720），改动前先对照参考素材。

export const THEME = {
  /** 背景：中性灰白。角落略暗 / 中部略亮 → 有极轻径向渐变 */
  bg: "#F0F0F0",
  bgCorner: "#EDEDED",
  bgCenter: "#F3F3F3",
  /** 图标卡：纯白圆角卡 + 轻投影 */
  card: "#FFFFFF",
  cardShadow: "rgba(0,0,0,0.06)",
  /** 图标线条：纯黑，圆头端点 */
  ink: "#000000",
  /** 序号：深蓝 */
  index: "#004480",
  /** 口诀文案：赭橙（偏沉稳，不是亮橙） */
  text: "#CB5300",
  /** 水印：极浅 */
  watermark: "#C9C9C9",
} as const;

// 横屏基准（本项目视频为横版 1280×720，与参考一致）
export const SCREEN = { width: 1280, height: 720 };
export const centerX = SCREEN.width / 2;

// 版式坐标（实测参考帧：两个文字槽中心 y≈386 / y≈518，与白卡间距 ~70px）
export const LAYOUT = {
  cardSize: 252, // 白卡边长
  cardY: 42, // 白卡顶边 y
  cardRadius: 26, // 白卡圆角
  indexY: 386, // 槽 1（蓝字：序号 或 首行提示）中心 y
  textY: 518, // 槽 2（橙字：口诀）中心 y
  watermarkY: 660, // 水印 y
  /** 图标绘制区相对白卡的内缩。实测参考图标占白卡 ~58%，故内缩要小 */
  iconPad: 4,
} as const;

// 字号基准（横屏 1280×720）。⚠️ 正文字号 80 是实测值（参考每字 80.6px），别凭感觉调小
export const FONT = {
  index: 68, // 序号（中文数字，实测「二」宽 71）
  text: 80, // 口诀正文（实测每字 80.6px）
  watermark: 22, // 水印
} as const;

// 粗体无衬线黑体（参考视频文案为粗黑体）
export const FONT_FAMILY = `-apple-system, BlinkMacSystemFont, "PingFang SC", "Microsoft YaHei", "Heiti SC", sans-serif`;

/** 图标线条粗度（实测 ≈6px @1280） */
export const ICON_STROKE = 6;
