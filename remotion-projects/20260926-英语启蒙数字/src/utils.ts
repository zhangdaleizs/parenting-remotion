import { FPS, type SlideSpec } from "./config";

export const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
export const easeOutExpo = (t: number) => (t >= 1 ? 1 : 1 - Math.pow(2, -10 * t));
export const easeInOutSine = (t: number) => -(Math.cos(Math.PI * t) - 1) / 2;
/** 轻微过冲的弹入 —— 只给「数数」用（物件蹦出来），其余元素仍走 easeOutCubic */
export const easeOutBack = (t: number) => {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
};

/** 取某个英文词第 nth 次出现时的帧号（锚点直接钉到口播） */
export const cueFrame = (slide: SlideSpec, word: string, nth = 0): number => {
  const hits = slide.enWords.filter((w) => w.text === word);
  return Math.round((hits[nth]?.at ?? 0) * FPS);
};

/** 取中文提示词的帧号 */
export const zhFrame = (slide: SlideSpec, word: string): number => {
  const hit = slide.zhWords.find((w) => w.text === word);
  return Math.round((hit?.at ?? 0) * FPS);
};
