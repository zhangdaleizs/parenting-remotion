import React from "react";
import { useCurrentFrame, Easing, spring } from "remotion";

/**
 * 弹入通用变换（纯函数，非 hook）：以 (cx, cy) 为锚点做 overshoot 缩放 + 轻微上浮。
 * 配合 `useScaleIn`（back 缓动，中途 >1）使用 —— 这才是「弹」而不是「淡入」。
 * min 越小弹出越明显；rise = 起始时向下的位移量（px）。
 */
export const popAt = (cx: number, cy: number, s: number, min = 0.88, rise = 18): string =>
  `translate(${cx} ${cy}) scale(${min + (1 - min) * s}) translate(${-cx} ${-cy}) translate(0 ${(1 - Math.min(1, s)) * rise})`;

export const useEasedProgress = (
  startFrame: number,
  durationFrames: number
): number => {
  const frame = useCurrentFrame();
  const localFrame = frame - startFrame;
  if (localFrame < 0) return 0;
  if (localFrame >= durationFrames) return 1;
  return Easing.out(Easing.cubic)(localFrame / durationFrames);
};

export const useFadeInUp = (
  startFrame: number,
  delayFrames = 0
): { opacity: number; translateY: number } => {
  const frame = useCurrentFrame();
  const localFrame = frame - startFrame - delayFrames;
  const duration = 30;
  if (localFrame < 0) return { opacity: 0, translateY: 30 };
  if (localFrame >= duration) return { opacity: 1, translateY: 0 };
  const t = Easing.out(Easing.cubic)(localFrame / duration);
  return { opacity: t, translateY: 30 * (1 - t) };
};

export const useScaleIn = (startFrame: number): number => {
  const frame = useCurrentFrame();
  const localFrame = frame - startFrame;
  const duration = 25;
  if (localFrame < 0) return 0;
  if (localFrame >= duration) return 1;
  return Easing.out(Easing.back(1.5))(localFrame / duration);
};

export const useTypewriter = (
  text: string,
  startFrame: number,
  charsPerFrame = 1
): string => {
  const frame = useCurrentFrame();
  const localFrame = frame - startFrame;
  if (localFrame < 0) return "";
  const charCount = Math.floor(localFrame * charsPerFrame);
  return text.slice(0, Math.min(charCount, text.length));
};

/**
 * 弹簧弹入，在 settle 后立即 clamp 到 1，避免持续振荡导致的画面抖动。
 * settleThreshold: 弹簧值超过此阈值即视为已稳定，直接返回 1。
 */
export const useSpringIn = (
  startFrame: number,
  config: { damping?: number; stiffness?: number } = {}
): number => {
  const frame = useCurrentFrame();
  const localFrame = frame - startFrame;
  if (localFrame < 0) return 0;
  const s = spring({
    frame: localFrame,
    fps: 30,
    config: {
      damping: config.damping ?? 15,
      stiffness: config.stiffness ?? 150,
    },
  });
  if (s > 0.995) return 1;
  return Math.max(0, Math.min(1, s));
};

/**
 * 平滑缩放脉冲，用于强调动画（如公式框呼吸效果），不会产生抖动。
 */
export const useScalePulse = (
  startFrame: number,
  amplitude = 0.02,
  speed = 0.04
): number => {
  const frame = useCurrentFrame();
  const localFrame = frame - startFrame;
  if (localFrame < 0) return 1;
  return 1 + Math.sin(localFrame * speed) * amplitude;
};

export const useBounce = (
  startFrame: number,
  delayFrames = 0
): number => {
  const frame = useCurrentFrame();
  const localFrame = frame - startFrame - delayFrames;
  if (localFrame < 0) return 0;
  return spring({
    frame: localFrame,
    fps: 30,
    config: { damping: 15, stiffness: 180 },
  });
};

export const useHeartbeat = (startFrame: number): number => {
  const frame = useCurrentFrame();
  const localFrame = frame - startFrame;
  if (localFrame < 0) return 1;
  const pulse = Math.sin(localFrame * 0.1) * 0.03 + 1;
  return pulse;
};

// ===== 育儿卡片专用（调性偏静，无过冲）=====

/**
 * 卡片入场：淡入 + 轻微上浮。
 * ⚠️ 本赛道**不要**用 useScaleIn / popAt 那套过冲弹入 —— 参考视频的卡片是安静淡入的。
 */
export const useCardIn = (
  startFrame: number,
  duration = 14,
  rise = 10
): { opacity: number; translateY: number } => {
  const frame = useCurrentFrame();
  const local = frame - startFrame;
  if (local < 0) return { opacity: 0, translateY: rise };
  if (local >= duration) return { opacity: 1, translateY: 0 };
  const t = Easing.out(Easing.cubic)(local / duration);
  return { opacity: t, translateY: rise * (1 - t) };
};

/** 卡片出场：淡出（收得比入场略快） */
export const useCardOut = (endFrame: number, duration = 9): number => {
  const frame = useCurrentFrame();
  const local = frame - endFrame;
  if (local < 0) return 1;
  if (local >= duration) return 0;
  return 1 - Easing.in(Easing.cubic)(local / duration);
};

/** 缓动包装（给非 hook 场景用） */
export const easeOutCubic = (t: number): number =>
  Easing.out(Easing.cubic)(Math.max(0, Math.min(1, t)));
