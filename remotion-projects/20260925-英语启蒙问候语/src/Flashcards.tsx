import React from "react";
import { AbsoluteFill, Audio, Sequence, staticFile } from "remotion";
import { SLIDES, SLIDE_STARTS } from "./config";
import { Scene } from "./components/Scene";

/** 段切换的换屏音，压得很轻 —— 本片调性干净，只做质感不做强调 */
const SFX: { from: number; file: string; volume: number }[] = SLIDE_STARTS.slice(1).map((from) => ({
  from,
  file: "whoosh.wav",
  volume: 0.12,
}));

export const Flashcards: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: "#FFFFFF" }}>
    {SLIDES.map((slide, i) => (
      // 不设 durationInFrames：该段一直留到片尾，被后一段完全盖住，保证溶解无缝
      <Sequence key={slide.scene} from={SLIDE_STARTS[i]} layout="none">
        <Scene slide={slide} index={i} />
        <Audio src={staticFile(`audio/vo/s${String(i + 1).padStart(2, "0")}.mp3`)} />
      </Sequence>
    ))}

    {SFX.map((s, i) => (
      <Sequence key={`sfx-${i}`} from={s.from} layout="none">
        <Audio src={staticFile(`audio/sfx/${s.file}`)} volume={s.volume} />
      </Sequence>
    ))}

    <Audio src={staticFile("audio/bgm.mp3")} volume={0.1} />
  </AbsoluteFill>
);
