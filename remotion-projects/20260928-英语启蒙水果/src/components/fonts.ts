import { loadFont as loadArimo } from "@remotion/google-fonts/Arimo";

// 源片英文是 Arial/Helvetica 一类的中性无衬线。Arimo 是 Arial 的度量兼容开源替代，
// 字形几乎一致 —— 且走 Google Fonts 能拿到确定的字重，不像系统字体栈那样在
// headless Chrome 里 fallback 成过粗的字形。
export const EN_FONT = loadArimo("normal", {
  weights: ["400", "500", "600", "700"],
  subsets: ["latin"],
}).fontFamily;

// 中文：苹方是 macOS 原生黑体，字形与源片最接近。
export const ZH_FONT = '"PingFang SC", "Hiragino Sans GB", "Heiti SC", sans-serif';
