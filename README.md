# Terminal Linktree

Hacker-terminal linktree med innebygd tekstbasert eventyrspill (Ghost Protocol).

## Oppsett

```bash
npm install
npm run dev
```

## Deploy (gjøre siden live)

**Vercel (anbefalt for Vite)**

1. Opprett repo på GitHub og push koden (uten `node_modules` / `dist`; de er i `.gitignore`).
2. Gå til [vercel.com](https://vercel.com) → *Add New Project* → importer repo.
3. La innstillingene stå: *Framework Preset* Vite, *Build Command* `npm run build`, *Output* `dist`.
4. *Deploy*. Du får en URL med HTTPS med én gang.

**Uten GitHub:** i prosjektmappen, `npx vercel` (følg innlogging i nettleser), deretter `npx vercel --prod` for produksjon.

**Netlify:** *Add new site* → koble Git, eller dra `dist`-mappen etter `npm run build`. Bygg: `npm run build`, publiser mappe `dist`.

## Umami tracking

Fjern kommentaren i `index.html` og sett inn dine verdier:

```html
<script defer src="https://din-umami.vercel.app/script.js" data-website-id="DITT-ID"></script>
```

## Rediger innhold

- `src/config.js` — `PROFILE`, `PROJECTS`, farger
- `src/shell.js` — lobby-kommandoer (`help`, `list`, …)
- `src/game/ghostProtocol.js` — `ROOMS`, `ITEMS`, spillflyt (`gCmd`)

## Filstruktur

```
src/
  config.js           ← profil + prosjekter + farger
  shell.js            ← terminal utenfor spillet
  App.jsx             ← layout, historikk, input
  Line.jsx            ← rendering av terminalrader
  main.jsx            ← React entry
  index.css           ← global reset
  game/
    ghostProtocol.js  ← Ghost Protocol (rom, ting, kommandoer)
index.html            ← font + Umami (valgfritt)
```
