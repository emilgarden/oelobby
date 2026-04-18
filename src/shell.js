import { PROFILE, PROJECTS, track } from "./config.js";

function findP(q) {
  const l = q.toLowerCase().trim();
  return PROJECTS.find(function (p) {
    return p.id === l || p.title.toLowerCase().indexOf(l) === 0 || p.id.indexOf(l) === 0;
  });
}

/**
 * Lobby-terminal: returnerer { lines } eller { play: true } (spill lastes separat).
 */
export function sCmd(raw) {
  const lo = raw.toLowerCase().trim();
  const parts = lo.split(/\s+/);
  const c = parts[0];
  const a = parts.slice(1).join(" ");
  if (!c) return { lines: [] };

  if (c === "help" || c === "hjelp") {
    track("help", {});
    return {
      lines: [
        { t: "h", x: "KOMMANDOER" },
        { t: "sep" },
        { t: "cr", c: "list", d: "Vis alle prosjekter" },
        { t: "cr", c: "info <navn>", d: "Detaljer om prosjekt" },
        { t: "cr", c: "open <navn>", d: "Aapne i ny fane" },
        { t: "cr", c: "about", d: "Om meg" },
        { t: "cr", c: "play", d: "[KLASSIFISERT]" },
        { t: "cr", c: "clear", d: "Toem skjermen" },
        { t: "sep" },
      ],
    };
  }
  if (c === "play" || c === "spill") {
    track("play", {});
    return { play: true };
  }
  if (c === "list" || c === "ls") {
    track("list", {});
    return {
      lines: [{ t: "h", x: "PROSJEKTER [" + PROJECTS.length + "]" }, { t: "sep" }]
        .concat(PROJECTS.map(function (p) {
          return { t: "pr", id: p.id, title: p.title, d: p.desc, tag: p.tag };
        }))
        .concat([{ t: "sep" }]),
    };
  }
  if (c === "info") {
    if (!a) return { lines: [{ t: "err", x: "MANGLER: info <navn>" }] };
    const pr = findP(a);
    if (!pr) return { lines: [{ t: "err", x: "IKKE FUNNET: " + a }] };
    track("info", { t: pr.title });
    return {
      lines: [{ t: "sep" }, { t: "h", x: pr.title.toUpperCase() }, { t: "tag", x: pr.tag }, { t: "g" }, { t: "b", x: pr.detail }, { t: "sep" }],
    };
  }
  if (c === "open") {
    if (!a) return { lines: [{ t: "err", x: "MANGLER: open <navn>" }] };
    const po = findP(a);
    if (!po) return { lines: [{ t: "err", x: "IKKE FUNNET: " + a }] };
    track("open", { t: po.title });
    window.open(po.url, "_blank", "noopener");
    return { lines: [{ t: "ok", x: "KOBLER TIL " + po.title.toUpperCase() + "..." }] };
  }
  if (c === "about" || c === "om") {
    track("about", {});
    return {
      lines: [{ t: "sep" }, { t: "h", x: PROFILE.name.toUpperCase() }, { t: "dim", x: PROFILE.handle }, { t: "g" }, { t: "b", x: PROFILE.bio }, { t: "sep" }],
    };
  }
  if (c === "clear" || c === "cls") return { lines: [{ t: "clr" }] };
  if (c === "whoami") return { lines: [{ t: "b", x: "guest@linktree" }] };
  if (c === "sudo") return { lines: [{ t: "err", x: "TILGANG NEKTET" }] };
  if (c === "matrix") return { lines: [{ t: "dim", x: "Du er allerede inne." }] };
  if (c === "hack") return { lines: [{ t: "ok", x: "INITIERER HACK..." }, { t: "dim", x: "...proev play." }] };
  return { lines: [{ t: "err", x: "UKJENT: " + raw }, { t: "dim", x: "Skriv help" }] };
}
