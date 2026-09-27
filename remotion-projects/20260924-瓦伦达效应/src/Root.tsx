import React from "react";
import { Composition } from "remotion";
import SceneSwitcher, { TOTAL_FRAMES } from "./SceneSwitcher";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="wallenda-effect"
        component={SceneSwitcher}
        // ✅ 直接引用 TOTAL_FRAMES，避免 Root 与 SceneSwitcher 两处帧数脱节
        durationInFrames={TOTAL_FRAMES}
        fps={30}
        width={1920}
        height={1080}
      />
    </>
  );
};
