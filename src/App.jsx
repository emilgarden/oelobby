import { useState, useEffect, useRef, useCallback } from "react";
import { PROFILE, PROJECTS, K, FONT } from "./config.js";
import { sCmd } from "./shell.js";
import { Line } from "./Line.jsx";

const S_ROOT = {
  minHeight: "100vh",
  background: K.bg,
  display: "flex",
  alignItems: "flex-start",
  justifyContent: "center",
  padding: "20px 12px 40px",
  fontFamily: FONT,
  cursor: "text",
};
const S_FRAME = {
  width: "100%",
  maxWidth: 720,
  minHeight: "calc(100vh - 60px)",
  background: K.scr,
  borderRadius: 8,
  border: "1px solid #1a2a1a",
  position: "relative",
  overflow: "hidden",
  boxShadow: "inset 0 0 80px rgba(20,60,20,.15),0 0 40px rgba(30,80,30,.08)",
};
const S_SCAN = {
  position: "absolute",
  inset: 0,
  backgroundImage: "repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,0,0,.12) 2px,rgba(0,0,0,.12) 4px)",
  pointerEvents: "none",
  zIndex: 3,
};
const S_VIGNETTE = {
  position: "absolute",
  inset: 0,
  background: "radial-gradient(ellipse at center,transparent 50%,rgba(0,0,0,.4) 100%)",
  pointerEvents: "none",
  zIndex: 2,
};
const S_MAIN = { position: "relative", zIndex: 1, padding: "32px 24px 24px" };
const S_HEADER = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: 20,
  paddingBottom: 12,
  borderBottom: "1px solid " + K.gg,
};
const S_TITLE = { color: K.gf, fontSize: 10, fontFamily: FONT, letterSpacing: "0.1em" };
const S_DOTS = { display: "flex", gap: 6 };
const S_DOT = { width: 8, height: 8, borderRadius: "50%", opacity: 0.6 };
const S_INPUT_ROW = { display: "flex", alignItems: "center", gap: 8, fontSize: 13, minHeight: 44 };
const S_INPUT = {
  background: "transparent",
  border: "none",
  color: K.grn,
  fontFamily: FONT,
  fontSize: 13,
  width: "100%",
  padding: 0,
  lineHeight: 1.8,
  outline: "none",
  caretColor: K.grn,
};
const S_FOOTER = {
  marginTop: 40,
  paddingTop: 12,
  borderTop: "1px solid " + K.gg,
  fontSize: 10,
  fontFamily: FONT,
  color: K.gf,
  letterSpacing: "0.06em",
  textAlign: "center",
  userSelect: "none",
};

export default function App() {
  const [hist, setHist] = useState([]);
  const [val, setVal] = useState("");
  const [ch, setCh] = useState([]);
  const [ci, setCi] = useState(-1);
  const [boot, setBoot] = useState(false);
  const [game, setGame] = useState({ on: false });
  const ir = useRef(null);
  const sr = useRef(null);
  const gameMod = useRef(null);

  useEffect(function () {
    const bl = [
      { t: "dim", x: "INIT SYSTEM v2.4.1" },
      { t: "dim", x: "LASTER MODULER..." },
      { t: "dim", x: "FANT " + PROJECTS.length + " PROSJEKTER" },
      { t: "dim", x: "KLAR." },
    ];
    const wl = [
      { t: "g" },
      { t: "sep" },
      { t: "h", x: PROFILE.name.toUpperCase() },
      { t: "dim", x: PROFILE.handle },
      { t: "g" },
      { t: "b", x: PROFILE.bio },
      { t: "sep" },
      { t: "g" },
      { t: "dim", x: "Skriv help for kommandoliste." },
      { t: "g" },
    ];
    let i = 0;
    function tick() {
      if (i < bl.length) {
        const cur = bl[i];
        setHist(function (p) {
          return p.concat([cur]);
        });
        i++;
        setTimeout(tick, 100 + Math.random() * 200);
      } else {
        setHist(bl.concat(wl));
        setBoot(true);
      }
    }
    setTimeout(tick, 300);
  }, []);

  useEffect(function () {
    if (sr.current) sr.current.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [hist]);

  const submit = useCallback(function () {
    if (!boot) return;
    const v = val.trim();
    if (!v) return;
    const il = { t: "in", x: v, gm: game.on };

    const flushInput = function () {
      setCh(function (p) {
        return [v].concat(p);
      });
      setCi(-1);
      setVal("");
    };

    if (game.on) {
      const mod = gameMod.current;
      if (!mod) {
        flushInput();
        return;
      }
      const res = mod.gCmd(v, game);
      setGame(res.s);
      setHist(function (p) {
        return p.concat([il, { t: "g" }]).concat(res.lines).concat([{ t: "g" }]);
      });
      flushInput();
      return;
    }

    const r = sCmd(v);
    if (r.play) {
      setHist(function (p) {
        return p.concat([il, { t: "g" }]);
      });
      flushInput();
      import("./game/ghostProtocol.js")
        .then(function (mod) {
          gameMod.current = mod;
          setHist(function (p) {
            return p.concat(mod.playIntroLines()).concat([{ t: "g" }]);
          });
          setGame(mod.mkGame());
        })
        .catch(function () {
          setHist(function (p) {
            return p.concat([{ t: "err", x: "Kunne ikke laste spillmodul." }, { t: "g" }]);
          });
        });
      return;
    }

    if (r.lines.length === 1 && r.lines[0].t === "clr") {
      setHist([]);
    } else {
      setHist(function (p) {
        return p.concat([il, { t: "g" }]).concat(r.lines).concat([{ t: "g" }]);
      });
    }
    flushInput();
  }, [val, boot, game]);

  const kd = function (e) {
    if (e.key === "Enter") {
      e.preventDefault();
      submit();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (ch.length > 0) {
        const n = Math.min(ci + 1, ch.length - 1);
        setCi(n);
        setVal(ch[n]);
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (ci > 0) {
        setCi(ci - 1);
        setVal(ch[ci - 1]);
      } else {
        setCi(-1);
        setVal("");
      }
    }
  };

  const pc = game.on ? K.cyn : K.prm;
  const dotGame = game.on ? K.cyn : K.grn;

  return (
    <div
      onClick={function () {
        if (ir.current) ir.current.focus();
      }}
      style={S_ROOT}
    >
      <div style={S_FRAME}>
        <div style={S_SCAN} />
        <div style={S_VIGNETTE} />

        <div role="main" lang="nb" style={S_MAIN}>
          <div style={S_HEADER}>
            <span style={S_TITLE}>{game.on ? "GHOST PROTOCOL" : "TERMINAL v2.4.1"}</span>
            <div style={S_DOTS}>
              <div style={{ ...S_DOT, background: K.red }} />
              <div style={{ ...S_DOT, background: K.amb }} />
              <div style={{ ...S_DOT, background: dotGame }} />
            </div>
          </div>

          <div aria-live="polite">
            {hist.map(function (d, i) {
              return <Line key={i} d={d} />;
            })}
          </div>

          {boot && (
            <div style={S_INPUT_ROW}>
              <span style={{ color: pc, userSelect: "none", flexShrink: 0 }} aria-hidden="true">{">"}</span>
              <input
                ref={ir}
                type="text"
                value={val}
                onChange={function (e) {
                  setVal(e.target.value);
                  setCi(-1);
                }}
                onKeyDown={kd}
                autoFocus
                autoCapitalize="none"
                autoCorrect="off"
                autoComplete="off"
                spellCheck="false"
                enterKeyHint="go"
                aria-label="Kommando"
                style={S_INPUT}
              />
            </div>
          )}
          <div ref={sr} />
          <div style={S_FOOTER}>{game.on ? "GHOST PROTOCOL // hjelp // exit" : "TRYKK FOR AA SKRIVE"}</div>
        </div>
      </div>
    </div>
  );
}
