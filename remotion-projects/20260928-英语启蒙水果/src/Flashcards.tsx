import React from "react";
import { AbsoluteFill, Audio, Sequence, staticFile } from "remotion";
import { ROWS, ROW_STARTS } from "./config";
import { Backdrop } from "./components/Backdrop";
import { Header } from "./components/Header";
import { WordGrid } from "./components/WordGrid";

export const Flashcards: React.FC = () => (
  <AbsoluteFill>
    <Backdrop />
    <Header />
    <WordGrid />

    {ROWS.map((_card, i) => (
      // 音频必须用 Sequence 包裹：裸 Audio 的时间基准是第 0 帧，中途挂载会 seek 越界
      <Sequence key={i} from={ROW_STARTS[i]} layout="none">
        <Audio src={staticFile(`audio/vo/s${String(i + 1).padStart(2, "0")}.mp3`)} />
      </Sequence>
    ))}

    <Audio src={staticFile("audio/bgm.mp3")} volume={0.08} />
  </AbsoluteFill>
);
