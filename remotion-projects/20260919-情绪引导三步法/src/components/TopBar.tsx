import React from "react";

const FONT = '"PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif';

/** 顶部固定栏：左侧栏目标题，右侧栏目导航。全程常驻不动。 */
export const TopBar: React.FC = () => (
  <div
    style={{
      position: "absolute",
      top: 0,
      left: 0,
      width: "100%",
      height: 78,
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "0 30px 0 34px",
      boxSizing: "border-box",
      fontFamily: FONT,
      background: "#FFFFFF",
    }}
  >
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <span style={{ fontSize: 40, lineHeight: 1 }}>📚</span>
      <span style={{ fontSize: 44, fontWeight: 700, color: "#1A1A1A", letterSpacing: 1 }}>
        孩子爱生气如何引导
      </span>
    </div>
    <div style={{ fontSize: 31, fontWeight: 500, color: "#1A1A1A", letterSpacing: 0.5 }}>
      育儿方法|养育技巧|心理成长|亲子关系
    </div>
  </div>
);

export default TopBar;
