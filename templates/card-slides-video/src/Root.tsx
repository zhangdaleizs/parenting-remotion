import React from "react";
import { Composition } from "remotion";
import SceneSwitcher, { TOTAL_FRAMES } from "./SceneSwitcher";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        // ⚠️ 新项目改成本项目 id（如 20260919-sick-rules）
        id="parenting-cards"
        component={SceneSwitcher}
        // ✅ 直接引用 TOTAL_FRAMES，避免 Root 与 SceneSwitcher 两处帧数脱节
        durationInFrames={TOTAL_FRAMES}
        fps={30}
        width={1280}
        height={720}
      />
      {/* 封面：⚠️ remotion-cover skill 当前是黑板版视觉，换本项目色板后再启用
      <Composition
        id="cover"
        component={CoverScene}
        durationInFrames={1}
        fps={30}
        width={1280}
        height={960}
      />
      */}
    </>
  );
};
