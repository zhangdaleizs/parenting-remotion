import React from "react";
import { AbsoluteFill, Audio, Sequence, staticFile } from "remotion";
import { SLIDES, SLIDE_STARTS } from "./config";
import { Slide } from "./components/Slide";

export const Flashcards: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: "#000000" }}>
    {SLIDES.map((slide, i) => (
      // 不设 durationInFrames：该段一直留到片尾，被后一段完全盖住，保证溶解无缝
      <Sequence key={slide.media} from={SLIDE_STARTS[i]} layout="none">
        <Slide slide={slide} index={i} />
      </Sequence>
    ))}

    {/* 占位音轨：源片原声（英文朗读 + BGM），仅用于核对节奏。
        换成自己的 TTS 后删掉本行，改挂 public/audio/vo/*.mp3 与 audio/bgm.mp3 */}
    <Audio src={staticFile("audio/_placeholder_original.mp3")} />
  </AbsoluteFill>
);
