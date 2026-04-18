import { memo } from "react";
import { K, FONT, SEP } from "./config.js";

const F = FONT;

const S_H = { color: K.grn, fontWeight: 700, fontSize: 13, fontFamily: F, letterSpacing: "0.08em", textShadow: "0 0 8px " + K.gf };
const S_B = { color: K.wht, lineHeight: 1.7, fontSize: 13, fontFamily: F, maxWidth: 560, textShadow: "0 0 3px " + K.gg };
const S_DIM = { color: K.gd, fontSize: 12, fontFamily: F, lineHeight: 1.5, opacity: 0.8 };
const S_ERR = { color: K.red, fontSize: 13, fontFamily: F, fontWeight: 600 };
const S_OK = { color: K.amb, fontSize: 13, fontFamily: F, fontWeight: 600 };
const S_SEP = { color: K.gf, fontSize: 13, fontFamily: F, userSelect: "none", lineHeight: 1.6 };
const S_G = { height: 6 };
const S_CR_ROW = { display: "flex", gap: 8, fontSize: 13, fontFamily: F, lineHeight: 1.8 };
const S_CR_CMD = { color: K.grn, minWidth: 170, flexShrink: 0 };
const S_CR_DESC = { color: K.gd };
const S_PR_ROW = { display: "flex", gap: 10, alignItems: "baseline", fontSize: 13, fontFamily: F, lineHeight: 1.9, flexWrap: "wrap" };
const S_PR_ID = { color: K.gd, minWidth: 100, flexShrink: 0 };
const S_PR_TITLE = { color: K.grn, fontWeight: 600 };
const S_IN_ROW = { display: "flex", gap: 8, fontSize: 13, fontFamily: F };

function LineImpl({ d }) {
  if (!d || !d.t) return null;

  if (d.t === "h") return <div style={S_H}>{d.x}</div>;
  if (d.t === "b") return <div style={S_B}>{d.x}</div>;
  if (d.t === "dim") return <div style={S_DIM}>{d.x}</div>;
  if (d.t === "err") return <div style={S_ERR}>{d.x}</div>;
  if (d.t === "ok") return <div style={S_OK}>{d.x}</div>;
  if (d.t === "tag") {
    const spill = d.x === "spill";
    const span = {
      fontSize: 11,
      fontFamily: F,
      fontWeight: 600,
      padding: "1px 8px",
      border: "1px solid " + (spill ? K.amb : K.gd),
      color: spill ? K.amb : K.gd,
      letterSpacing: "0.06em",
      textTransform: "uppercase",
    };
    return (
      <div style={{ marginBottom: 2 }}>
        <span style={span}>{d.x}</span>
      </div>
    );
  }
  if (d.t === "cr") {
    return (
      <div style={S_CR_ROW}>
        <span style={S_CR_CMD}>{d.c}</span>
        <span style={S_CR_DESC}>{d.d}</span>
      </div>
    );
  }
  if (d.t === "pr") {
    const spill = d.tag === "spill";
    const tag = {
      fontSize: 10,
      fontWeight: 600,
      padding: "0 6px",
      border: "1px solid " + (spill ? K.amb : K.gd),
      color: spill ? K.amb : K.gd,
      textTransform: "uppercase",
      lineHeight: "18px",
    };
    return (
      <div style={S_PR_ROW}>
        <span style={S_PR_ID}>{d.id}</span>
        <span style={S_PR_TITLE}>{d.title}</span>
        <span style={tag}>{d.tag}</span>
      </div>
    );
  }
  if (d.t === "sep") return <div style={S_SEP}>{SEP}</div>;
  if (d.t === "g") return <div style={S_G} />;
  if (d.t === "in") {
    const prompt = d.gm ? K.cyn : K.prm;
    return (
      <div style={S_IN_ROW}>
        <span style={{ color: prompt, userSelect: "none" }} aria-hidden="true">{">"}</span>
        <span style={{ color: K.grn }}>{d.x}</span>
      </div>
    );
  }
  return null;
}

function linePropsEqual(prev, next) {
  return prev.d === next.d;
}

export const Line = memo(LineImpl, linePropsEqual);
