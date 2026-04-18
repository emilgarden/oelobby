/**
 * GHOST PROTOCOL — ren funksjonell «tekst-MUD»-motor uten React.
 *
 * Data:
 * - ROOMS[id]: rom med visningsnavn (n), tekst (t), utganger (ex: retning → rom-id),
 *   valgfritt lås (lock) og nøkkel (key / "__dec" for dekryptert tilgang).
 * - ITEMS[id]: gjenstand med navn (n), beskrivelse (d), startrom (room), plukk-tekst (take), ev. read[].
 *
 * Spilltilstand (returneres av mkGame og oppdateres av gCmd):
 * - on      — spillet kjører
 * - r       — nåværende rom-id
 * - inv     — id-er du bærer
 * - ri      — gjenstander per rom: { hall: ["keycard"], ... } (muteres kontrollert i gCmd)
 * - locks   — oppklarte dører: { lab: true, core: true }
 * - dec     — disken er dekryptert
 * - mv      — antall kommandoer (trekk)
 *
 * gCmd(råtekst, state) → { s: nyState, lines: terminalrader }. UI-et tegner bare `lines`.
 */
import { SEP } from "../config.js";

export const ROOMS = {
  hall: { n: "KORRIDOR", t: "En smal digital korridor. Veggene flimrer med korrupt data. Gangen gaar nord. En doer oest er merket ARKIV.", ex: { nord: "srv", ost: "ark" } },
  srv: { n: "SERVERROM", t: "Rekker av gamle servere. De fleste er doede, men en blinker svakt. Korridoren er sor. En tung doer vest er merket LAB.", ex: { sor: "hall", vest: "lab" }, lock: false },
  ark: { n: "ARKIV", t: "Hyller av digitale filer, de fleste korrupte. Paa gulvet glimter noe svakt.", ex: { vest: "hall" } },
  lab: { n: "LABORATORIUM", t: "Et nedstoevet lab. Monitorer viser frosne datasekvenser. En konsoll med disk-leser. En doer nord pulserer med rodt lys.", ex: { ost: "srv", nord: "core" }, lock: true, key: "keycard" },
  core: { n: "KJERNEN", t: "", ex: {}, lock: true, key: "__dec" },
};

export const ITEMS = {
  log: { n: "loggfil", d: "En fragmentert loggfil.", room: "srv", take: "Du kopierer loggfilen.", read: ["LOGG - SISTE OPPFOERING", SEP, "Prosjektet er kompromittert.", "Passordet er: ekko", "Ikke stol paa de andre prosessene.", SEP] },
  keycard: { n: "noekelkort", d: "Et slitt adgangskort. Nivaa 2.", room: "ark", take: "Du plukker opp kortet." },
  disk: { n: "kryptert disk", d: "En disk som lyser blaatt. Kryptert.", room: "lab", take: "Du tar disken. Den er varm." },
};

/** Første skjerm etter `play` — hold i sync med startrom (hall). */
export function playIntroLines() {
  return [
    { t: "sep" },
    { t: "h", x: "GHOST PROTOCOL v1.0" },
    { t: "sep" },
    { t: "g" },
    { t: "b", x: "Du har funnet en skjult partisjon paa en forlatt server." },
    { t: "b", x: "Noen har etterlatt noe. Noe de ville du skulle finne." },
    { t: "g" },
    { t: "dim", x: "Skriv hjelp for kommandoer, exit for aa avslutte." },
    { t: "g" },
    { t: "h", x: "KORRIDOR" },
    { t: "sep" },
    { t: "b", x: ROOMS.hall.t },
    { t: "g" },
    { t: "dim", x: "Utganger: nord, ost" },
    { t: "g" },
  ];
}

export function mkGame() {
  const ri = {};
  Object.entries(ITEMS).forEach(function (pair) {
    const id = pair[0];
    const it = pair[1];
    if (!ri[it.room]) ri[it.room] = [];
    ri[it.room].push(id);
  });
  return { on: true, r: "hall", inv: [], ri: ri, locks: {}, dec: false, mv: 0 };
}

export function gCmd(raw, g) {
  const s = Object.assign({}, g, { mv: g.mv + 1 });
  const lo = raw.toLowerCase().trim();
  const parts = lo.split(/\s+/);
  const c = parts[0];
  const a = parts.slice(1).join(" ");
  const room = ROOMS[g.r];
  const here = s.ri[g.r] || [];

  function R(lines) {
    return { s: s, lines: lines };
  }

  if (c === "exit" || c === "quit" || c === "avslutt") {
    s.on = false;
    return R([{ t: "sep" }, { t: "dim", x: "GHOST PROTOCOL avsluttet. " + g.mv + " trekk." }, { t: "dim", x: "Skriv play for aa starte paa nytt." }]);
  }
  if (c === "hjelp" || c === "help" || c === "?") {
    return R([{ t: "h", x: "KOMMANDOER" }, { t: "sep" }, { t: "cr", c: "se", d: "Beskriv rommet" }, { t: "cr", c: "gaa <retning>", d: "nord/sor/ost/vest" }, { t: "cr", c: "ta <ting>", d: "Plukk opp" }, { t: "cr", c: "bruk <ting>", d: "Bruk gjenstand" }, { t: "cr", c: "les <ting>", d: "Les gjenstand" }, { t: "cr", c: "dekrypter <passord>", d: "Dekrypter disk" }, { t: "cr", c: "inv", d: "Vis inventar" }, { t: "cr", c: "exit", d: "Avslutt" }, { t: "sep" }]);
  }
  if (c === "se" || c === "look" || c === "l") {
    const lines = [{ t: "h", x: room.n }, { t: "sep" }, { t: "b", x: room.t }];
    here.forEach(function (id) {
      lines.push({ t: "ok", x: "[" + ITEMS[id].n.toUpperCase() + "] " + ITEMS[id].d });
    });
    lines.push({ t: "g" }, { t: "dim", x: "Utganger: " + Object.keys(room.ex).join(", ") });
    return R(lines);
  }

  const dm = { n: "nord", s: "sor", o: "ost", v: "vest", nord: "nord", sor: "sor", ost: "ost", vest: "vest" };
  let dir = null;
  if (c === "gaa" || c === "go" || c === "g") dir = dm[a] || a;
  if (dm[c]) dir = dm[c];
  if (dir) {
    const tid = room.ex[dir];
    if (!tid) return R([{ t: "dim", x: "Kan ikke gaa " + dir + " herfra." }]);
    const tgt = ROOMS[tid];
    if (tgt.lock && !s.locks[tid]) return R([{ t: "err", x: tgt.key === "__dec" ? "KREV DEKRYPTERT AUTORISASJON" : "Doeren krever et noekelkort." }]);
    s.r = tid;
    if (tid === "core") {
      s.on = false;
      return R([{ t: "sep" }, { t: "h", x: "KJERNEN" }, { t: "sep" }, { t: "g" }, { t: "b", x: "Doeren glir opp. En ensom datapakke svever i lys." }, { t: "g" }, { t: "b", x: "Du strekker ut haanden. Pakken aapner seg." }, { t: "g" }, { t: "ok", x: "MELDING DEKRYPTERT:" }, { t: "g" }, { t: "b", x: "Alt vi bygger etterlater spor. Hvert prosjekt er et ekko av den som laget det. Du fant mitt. Lag ditt eget." }, { t: "g" }, { t: "sep" }, { t: "h", x: "GHOST PROTOCOL FULLFOERT" }, { t: "dim", x: s.mv + " trekk" }, { t: "sep" }, { t: "g" }, { t: "dim", x: "Tilbake i terminalen. Skriv help." }]);
    }
    const tLines = [{ t: "h", x: tgt.n }, { t: "sep" }, { t: "b", x: tgt.t }];
    const ti = s.ri[tid] || [];
    ti.forEach(function (id) {
      tLines.push({ t: "ok", x: "[" + ITEMS[id].n.toUpperCase() + "] " + ITEMS[id].d });
    });
    tLines.push({ t: "g" }, { t: "dim", x: "Utganger: " + Object.keys(tgt.ex).join(", ") });
    return R(tLines);
  }

  if (c === "ta" || c === "take" || c === "get") {
    if (!a) return R([{ t: "dim", x: "Ta hva?" }]);
    const m = here.find(function (id) {
      return id.indexOf(a) === 0 || ITEMS[id].n.toLowerCase().indexOf(a) === 0;
    });
    if (!m) return R([{ t: "dim", x: "Ser ingen " + a + " her." }]);
    s.ri = Object.assign({}, s.ri);
    s.ri[g.r] = here.filter(function (id) {
      return id !== m;
    });
    s.inv = g.inv.concat([m]);
    return R([{ t: "ok", x: ITEMS[m].take }]);
  }

  if (c === "bruk" || c === "use") {
    if (!a) return R([{ t: "dim", x: "Bruk hva?" }]);
    const mi = g.inv.find(function (id) {
      return id.indexOf(a) === 0 || ITEMS[id].n.toLowerCase().indexOf(a) === 0;
    });
    if (!mi) return R([{ t: "dim", x: "Du har ingen " + a + "." }]);
    if (mi === "keycard" && g.r === "srv" && !g.locks.lab) {
      s.locks = Object.assign({}, g.locks, { lab: true });
      return R([{ t: "ok", x: "NOEKELKORT AKSEPTERT" }, { t: "b", x: "Doeren til LAB glir opp." }]);
    }
    if (mi === "disk") return R([{ t: "dim", x: "Kryptert. Proev: dekrypter <passord>" }]);
    return R([{ t: "dim", x: "Kan ikke bruke det her." }]);
  }

  if (c === "les" || c === "read") {
    if (!a) return R([{ t: "dim", x: "Les hva?" }]);
    const mr = g.inv.find(function (id) {
      return id.indexOf(a) === 0 || ITEMS[id].n.toLowerCase().indexOf(a) === 0;
    });
    if (!mr) return R([{ t: "dim", x: "Du har ingen " + a + "." }]);
    if (mr === "log") return R([{ t: "g" }].concat(ITEMS.log.read.map(function (x) { return x === SEP ? { t: "sep" } : { t: "b", x: x }; })).concat([{ t: "g" }]));
    if (mr === "disk") return R([{ t: "err", x: "KRYPTERT. Proev: dekrypter <passord>" }]);
    return R([{ t: "dim", x: "Ingenting aa lese." }]);
  }

  if (c === "dekrypter" || c === "decrypt") {
    if (g.inv.indexOf("disk") < 0) return R([{ t: "dim", x: "Ingenting aa dekryptere." }]);
    if (!a) return R([{ t: "dim", x: "Skriv: dekrypter <passord>" }]);
    if (a === "ekko") {
      s.dec = true;
      s.locks = Object.assign({}, g.locks, { core: true });
      return R([{ t: "ok", x: "DEKRYPTERING VELLYKKET" }, { t: "b", x: "Disken gloeder groent." }, { t: "b", x: "En laas klikker et sted i bygningen." }, { t: "g" }, { t: "dim", x: "Doeren til KJERNEN er aapen." }]);
    }
    return R([{ t: "err", x: "FEIL PASSORD" }, { t: "dim", x: "Kanskje noen etterlot et hint..." }]);
  }

  if (c === "inv" || c === "inventar" || c === "i" || c === "inventory") {
    if (g.inv.length === 0) return R([{ t: "dim", x: "Du baerer ingenting." }]);
    return R([{ t: "h", x: "INVENTAR" }, { t: "sep" }].concat(g.inv.map(function (id) { return { t: "ok", x: "[" + ITEMS[id].n.toUpperCase() + "] " + ITEMS[id].d }; })).concat([{ t: "sep" }]));
  }

  return R([{ t: "dim", x: "Ukjent. Skriv hjelp." }]);
}
