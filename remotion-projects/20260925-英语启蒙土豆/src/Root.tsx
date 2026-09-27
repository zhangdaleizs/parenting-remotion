import React from "react";
import { Composition } from "remotion";
import { Flashcards } from "./Flashcards";
import { FPS, TOTAL_FRAMES, VIDEO_HEIGHT, VIDEO_WIDTH } from "./config";

export const RemotionRoot: React.FC = () => (
  <Composition
    id="english-potato"
    component={Flashcards}
    durationInFrames={TOTAL_FRAMES}
    fps={FPS}
    width={VIDEO_WIDTH}
    height={VIDEO_HEIGHT}
  />
);
