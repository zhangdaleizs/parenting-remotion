import React from "react";
import { Composition } from "remotion";
import { Flashcards } from "./Flashcards";
import { FPS, TOTAL_FRAMES, VIDEO_HEIGHT, VIDEO_WIDTH } from "./config";
import { CoverScene } from "./scenes/CoverScene";

export const RemotionRoot: React.FC = () => (
  <>
    <Composition
      id="english-numbers"
      component={Flashcards}
      durationInFrames={TOTAL_FRAMES}
      fps={FPS}
      width={VIDEO_WIDTH}
      height={VIDEO_HEIGHT}
    />
    {/* 封面是静态图，durationInFrames=1 */}
    <Composition
      id="cover"
      component={CoverScene}
      durationInFrames={1}
      fps={FPS}
      width={1920}
      height={1440}
      defaultProps={{ vertical: false }}
    />
    <Composition
      id="cover-vertical"
      component={CoverScene}
      durationInFrames={1}
      fps={FPS}
      width={1080}
      height={1440}
      defaultProps={{ vertical: true }}
    />
  </>
);
