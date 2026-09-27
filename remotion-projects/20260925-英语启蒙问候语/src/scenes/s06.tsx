import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { type SlideSpec } from "../config";
import { cueFrame, easeOutCubic, zhFrame } from "../utils";
import { Bush, Cloud, Critter, Enter, Flower, Ground, Sky, Stage, Sun, Tree } from "./parts";

/** 谢谢你 thank you —— 小熊猫把礼物递给小熊，两只一起点头致谢 */
export const S06: React.FC<{ slide: SlideSpec }> = ({ slide }) => {
  const frame = useCurrentFrame();
  const thanksAt = zhFrame(slide, "谢谢你");
  const t1 = cueFrame(slide, "thank", 0);
  const t2 = cueFrame(slide, "thank", 1);

  // 礼物从熊猫手里移到中间
  const giveP = interpolate(frame, [t1, t1 + 22], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: easeOutCubic,
  });
  const giftX = 400 + giveP * 150;
  const giftY = 1010 - Math.sin(giveP * Math.PI) * 70;

  // 两只在念 thank 时低头致谢
  const bow = (at: number) => {
    const d = frame - at;
    return d >= 0 && d < 26 ? Math.sin((d / 26) * Math.PI) * 9 : 0;
  };
  const bowL = Math.max(bow(t1), bow(t2));
  const bowR = Math.max(bow(t1 + 6), bow(t2 + 6));

  return (
    <Stage>
      <Sky id="s06" top="#E0D9F5" bottom="#FBF5EE" />

      <Sun x={170} y={200} r={62} color="#FFD98A" />
      <Cloud x={680} y={145} scale={0.88} phase={2.0} />
      <Cloud x={340} y={335} scale={0.56} phase={0.7} opacity={0.8} />

      <Ground y={1035} color="#A5D79B" shade="#8ECC88" />

      <Tree x={105} y={1190} scale={1.02} leaf="#6CC07C" />
      <Tree x={975} y={1210} scale={0.9} leaf="#7BCB87" />
      <Bush x={540} y={1092} scale={0.55} color="#92D18E" />
      <Flower x={205} y={1145} scale={0.75} petal="#C9A7F0" />
      <Flower x={870} y={1160} scale={0.65} petal="#FFC46B" />

      <Enter at={thanksAt} dy={36}>
        <Critter
          x={360}
          y={1150 + bowL * 4}
          scale={0.95}
          body="#EDEDF2"
          belly="#FFFFFF"
          ear="round"
          earColor="#3B3B44"
          tilt={-bowL}
        />
      </Enter>
      <Enter at={thanksAt + 6} dy={36}>
        <Critter
          x={760}
          y={1150 + bowR * 4}
          scale={0.95}
          body="#C99B6E"
          belly="#F0DCC2"
          ear="round"
          tilt={bowR}
        />
      </Enter>

      {/* 礼物盒 */}
      <Enter at={thanksAt + 8} dy={26}>
        <g transform={`translate(${giftX}, ${giftY})`}>
          <rect x={-52} y={-48} width={104} height={96} rx={14} fill="#F08A5D" />
          <rect x={-52} y={-14} width={104} height={26} fill="#FFD46B" />
          <rect x={-11} y={-48} width={22} height={96} fill="#FFD46B" />
          <path d="M0,-48 C-34,-84 -60,-40 -6,-46 Z" fill="#FFD46B" />
          <path d="M0,-48 C34,-84 60,-40 6,-46 Z" fill="#FFD46B" />
        </g>
      </Enter>
    </Stage>
  );
};
