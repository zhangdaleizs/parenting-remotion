// ===== 育儿卡片皮肤库（自包含，可整体复制到新项目）=====
//
// 用法：新项目从本目录 `cp -cR src/components <新项目>/src/components`
// 然后在场景里组合：<CardBackground/> 铺底 + <Card/> 一张张卡片。

export * from "./theme";
export { CardBackground, default as Background } from "./Background";
export { BoardIcon } from "./BoardIcon";
export type { IconName, IconBadge } from "./BoardIcon";
export { Card } from "./Card";
export * from "./utils";
