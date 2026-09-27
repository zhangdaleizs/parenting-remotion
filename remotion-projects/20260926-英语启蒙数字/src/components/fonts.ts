import { loadFont as loadBaloo } from "@remotion/google-fonts/Baloo2";
import { loadFont as loadZCOOL } from "@remotion/google-fonts/ZCOOLKuaiLe";

// 源片字形：英文饱满圆润的粗圆体，中文为圆润卡通体。
// Baloo2 + 站酷快乐体是最接近的两个开源字体。
export const EN_FONT = loadBaloo("normal", { weights: ["700"], subsets: ["latin"] }).fontFamily;
export const ZH_FONT = loadZCOOL("normal", { subsets: ["chinese-simplified"] }).fontFamily;
