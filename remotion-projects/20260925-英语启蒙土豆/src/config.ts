export const FPS = 30;
export const VIDEO_WIDTH = 1080;
export const VIDEO_HEIGHT = 1440;

/** 交叉溶解时长（帧）。源片实测约 0.5s，溶解期间画面与字幕一起叠化 */
export const CROSSFADE_FRAMES = 15;

/** 版式实测值：源片 576×776 逐像素量测后按 1.875× 换算到 1080 宽，
 *  再按渲染帧与原片的逐像素对比做了位移校准（见 CLAUDE.md 复刻 SOP） */
export const LAYOUT = {
  /** 字幕块在一个固定高度的盒子里垂直居中 —— 源片就是这个行为：
   *  英文两行时整块上移，而不是中文被顶下去 */
  captionBoxTop: 40,
  captionBoxHeight: 400,
  captionLeft: 164,
  /** 仅作溢出保护：换行位置由文案里的 \n 决定。源片最宽一行约 790@1080，
   *  留足余量避免 "We can make fries from" 被提前折断 */
  captionWidth: 880,
  enFontSize: 78,
  zhFontSize: 78,
  enLineHeight: 1.0,
  zhLineHeight: 1.15,
  zhMarginTop: -2,
  /** 白色外描边：万一素材构图偏高、字幕压到角色，靠它保证可读性。
   *  配 paintOrder: stroke 让描边画在字形之下，字不会变细 —— 所以有效宽度只有一半，
   *  14px 实际外露约 7px */
  captionStrokeWidth: 14,
  captionStrokeColor: "#FFFFFF",
} as const;

export type SlideSpec = {
  /** public/ 下的相对路径。静态图用 .png，图生视频用 .mp4，两种都支持。
   *  ⚠️ 素材的构图（角色压低、留白补齐）在 scripts/layout_slides.py 里预处理好了，
   *  这里直接铺满，不做缩放位移 —— 在 Remotion 里做会留下画中画边界 */
  media: string;
  /** 英文句型。手动 \n 断行，断点与源片一致（源片第 4 句断在 from 之后） */
  en: string;
  zh: string;
  /** 该句时长。当前为源片节奏占位，换成自己的 TTS 后按音频帧数重排 */
  durationInFrames: number;
};

export const SLIDES: SlideSpec[] = [
  { media: "slides/s1.png", en: "This is a potato.", zh: "这是一颗土豆。", durationInFrames: 118 },
  { media: "slides/s2.png", en: "The potato is brown.", zh: "这个土豆是棕色的。", durationInFrames: 118 },
  { media: "slides/s3.png", en: "The potato is oval.", zh: "这个土豆是椭圆形的。", durationInFrames: 118 },
  {
    media: "slides/s4.png",
    en: "We can make fries from\npotatoes.",
    zh: "我们可以用土豆做薯条。",
    durationInFrames: 118,
  },
  { media: "slides/s5.png", en: "I like to eat potatoes.", zh: "我喜欢吃土豆。", durationInFrames: 118 },
];

/** 每段起始帧：start_i = start_{i-1} + dur_{i-1} − CROSSFADE */
export const SLIDE_STARTS: number[] = SLIDES.reduce<number[]>((starts, _slide, i) => {
  starts.push(i === 0 ? 0 : starts[i - 1] + SLIDES[i - 1].durationInFrames - CROSSFADE_FRAMES);
  return starts;
}, []);

export const TOTAL_FRAMES =
  SLIDE_STARTS[SLIDE_STARTS.length - 1] + SLIDES[SLIDES.length - 1].durationInFrames;
