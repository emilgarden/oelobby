/** Rediger profil, prosjekter og farger her. */

export const PROFILE = {
  name: "Ditt Navn",
  handle: "@dittbrukernavn",
  bio: "Lager apper, spill og verktoy.",
};

export const PROJECTS = [
  { id: "ordfrekvens", title: "Ordfrekvens-analysator", desc: "Visualiser ordfrekvenser i tekst", detail: "Interaktiv oversikt over hvilke ord som brukes mest.", url: "https://example.com", tag: "verktoy" },
  { id: "miniquest", title: "Miniquest", desc: "Et lite tekstbasert eventyrspill", detail: "Utforsk en liten verden gjennom tekstkommandoer.", url: "https://example.com", tag: "spill" },
  { id: "ipa", title: "IPA Trainer", desc: "Fonetisk transkripsjon", detail: "Tren paa aa gjenkjenne og skrive IPA-symboler.", url: "https://example.com", tag: "verktoy" },
  { id: "tilepuzzle", title: "Tile Puzzle", desc: "Klassisk 15-puslespill", detail: "Skyv brikkene paa plass med en mekanisk vri.", url: "https://example.com", tag: "spill" },
];

export function track(event, data) {
  try {
    window.umami?.track(event, data);
  } catch {
    /* valgfri analytics */
  }
}

export const K = {
  bg: "#0a0e0a",
  scr: "#0c100c",
  grn: "#33ff33",
  gd: "#1a9e1a",
  gf: "#0d5c0d",
  gg: "#0a3a0a",
  amb: "#ffaa00",
  red: "#ff3333",
  wht: "#ccffcc",
  prm: "#22cc22",
  cyn: "#33ffee",
};

export const FONT = "'Fira Code', Consolas, monospace";
export const SEP = "----------------------------";
