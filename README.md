# game-recreation

AI-assisted browser game recreations and the one-shot prompts they were built
from. Everything here runs client-side — no server, no API key, no account.

```
prompts/     3 one-shot recreation prompts (the source material)
games/       playable builds grouped by collection
```

## prompts

| file | what it builds |
|---|---|
| `aaa-recreation-prompts.txt` | Rocket League, Fortnite, GTA — three self-contained one-shot prompts |
| `gpt6-astra-prompts.txt` | Fortnite Chapter 1 Season 3 island, browser recreation |
| `steal-an-egg-roblox.md` | Roblox "Steal An Egg" (place 107778070777162) — 188 KB, values tagged `[VERIFIED]` / `[SOURCE]` / `[DESIGN]` |

Each block is self-contained: paste one whole block, do not combine them.

`[VERIFIED]` = read directly off the live game. `[SOURCE]` = community wiki /
guide sites agree. `[DESIGN]` = hidden server-side, so the value is a tuned
implementation choice that reproduces the observed behaviour — treat those as
knobs.

## games

### fable-5.1 — 5 standalone HTML files

Open `games/fable-5.1/index.html`… or any file directly. No build step.

| file | |
|---|---|
| `GTA6-Leonida.html` | 421 KB |
| `voxelcraft.html` | 285 KB |
| `pinehollow-funland-standalone.html` | 179 KB |
| `nightfall-fps.html` | 158 KB |
| `rocket-arena-3v3.html` | 98 KB |

### opus-5.5 — three flagship recreations

| file | |
|---|---|
| `GTA6-NewHarbor.html` | 5.3 MB |
| `Fortnite-OG.html` | 3.5 MB |
| `rocket-league.html` | 3.2 MB |

Start from `START-HERE.html`. Three.js is used — its licence is in
`THREE-LICENSE.txt`.

### opus-5.5-more — three smaller demos

| folder | |
|---|---|
| `Neon-Rain-Fighter/` | 3D fighting game |
| `Kart-Party-Deluxe/` | 3D kart racer |
| `Cataclysm-Natural-Disaster-Demo/` | natural disaster survival |

Each has its own `README.txt` and a single self-contained `.html`.

### gpt-6-astra — three games behind a local launcher

`games/gpt-6-astra/` — Elden Ring, Subnautica, Fortnite. Assets included for
offline play.

```sh
cd games/gpt-6-astra
# Windows: double-click START GAMES.cmd
```

Needs **Windows x64** and a desktop browser with **WebGL 2** and hardware
acceleration. Do not open `index.html` directly — use the launcher, and keep its
window open while playing. Esc releases the mouse. No Node.js install, npm, or
API key required.

Saves and settings live in the browser; export them before clearing browser
data or switching browsers, since changing the server port uses a different
save area.

#### the bundled runtime

`game-files/launcher/runtime/` holds a vendored Node.js **v24.20.0** for
win-x64 (89 MB). It is **not committed** — it is listed in `.gitignore`. Its
origin, download URLs and SHA256 checksums are recorded in
`game-files/launcher/runtime/SOURCES.json`; fetch it from there.

## requirements

- a modern desktop browser, WebGL 2 + hardware acceleration
- for `gpt-6-astra`: Windows x64

No `npm install`. No keys. Works offline once you have the files.