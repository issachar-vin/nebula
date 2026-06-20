# ◈ NEBULA — a playground in the dark

An interactive, animation-heavy single-page playground built for fun. Everything
on the page reacts to you, and **most of it is hidden**. There are **23 secrets**
to discover — through the keyboard, the corners, the sky, the URL bar, and the
dev console — plus a full **gacha summon minigame** with 100 characters to
collect and upgrade.

Hand-built with **React + TypeScript + Vite**, **framer-motion**, the **Canvas
2D API**, **WebGL**, and the **Web Audio API**. No sound or image assets — every
tone is synthesized and every visual is drawn in code.

## Quick start

```bash
make install   # install dependencies
make dev       # start the dev server at http://localhost:5173
make build     # production build into dist/
make preview   # serve the production build
make help      # list all targets
```

(Plain `npm install` / `npm run dev` / `npm run build` work too.)

### Docker

```bash
make docker-build         # build the production image (nginx serving the build)
make docker-run           # serve it at http://localhost:8080
```

On every push to `main`, CI builds and publishes a multi-stage image to the
GitHub Container Registry:

```bash
docker run --rm -p 8080:80 ghcr.io/issachar-vin/nebula:latest
```

## Controls

| Key       | Does                                    |
| --------- | --------------------------------------- |
| `~`       | open the terminal (try `help`)          |
| `T`       | open your trophy case                   |
| `P`       | summon the piano — then play the keys   |
| hold `G`  | cut gravity — everything drifts away    |
| `?`       | controls & clues                        |
| `Esc`     | close anything                          |

Every secret you find fires a unique celebration animation and a toast, and is
tracked in the **trophy case** (`T`), persisted in `localStorage`.

---

## The secrets — full list

> **Spoiler warning.** Half the fun is finding these yourself. The hints in the
> trophy case and the `?` menu are deliberately cryptic. Expand below only if you
> want the complete walkthrough.

<details>
<summary><b>Show all 23 secrets (how to trigger · what happens · what it means)</b></summary>

| Secret | How to trigger | What happens | What it means |
| --- | --- | --- | --- |
| 👋 **First Contact** | Just arrive — the first click or keypress (or ~4s on the page) | Boots the Web Audio engine and unlocks | You showed up. The audio can't start without a user gesture, so this doubles as the "sound is on" moment |
| 🎮 **Konami Code** | The Konami code: `↑ ↑ ↓ ↓ ← → ← → B A` (works anywhere, even on the summon screen) | Silently arms a **god pack** and opens the gacha — the next 10-pull is a guaranteed 5 Legendary + 5 Ultra Rare | A nod to the classic Konami arcade cheat (Gradius/Contra, 1986) — the canonical hidden code |
| ⌨️ **Root Access** | Press `~` (or `` ` ``) | A draggable terminal slides up — drag the title bar, use the red/yellow/green buttons, run commands | Every serious site has a back door |
| 💊 **Down the Rabbit Hole** | Type `matrix` anywhere | Green katakana code-rain floods the screen (`Esc` to clear) | "Type what Neo saw" — *The Matrix* |
| 🪩 **Saturday Night** | Type `disco` | Spinning colored light beams + a hue-cycling disco mode (`Esc` to stop) | *Saturday Night Fever* — a word that makes things dance |
| 🎈 **Weightless** | Press and hold `G` | Gravity cuts out: the title letters ease into a slow drift, bounce off the screen edges, and spring back when you release | Zero-G — cut the cord and watch things float |
| 🚪 **Persistent** | Click the `◈ NEBULA` logo **7 times** | Unlocks, and reveals the hidden Vaporwave theme as a reward | Knock, and keep knocking, and the door opens |
| ⭐ **Eagle Eye** | Find and click the faint **golden star** hidden in the starfield | A gold particle burst; the star respawns elsewhere | One star is closer than it looks — for sharp eyes |
| 🧘 **Patience** | Do absolutely nothing for ~22 seconds | A 🛸 UFO drifts across the screen (click it for confetti) | Stillness, rewarded |
| 🌀 **Whirlwind** | Shake the cursor rapidly side to side | The whole page wobbles and blurs, dizzily | You spun it until it got dizzy |
| 🎹 **Maestro** | Press `P` for the piano, then play a full octave of white keys (`A S D F G H J K`) | Synth notes play; unlocks once you've hit every white key | There's music in the keys — find the octave |
| 🕳️ **The End** | Scroll all the way to the bottom | The closing footer message appears | You went as far down as you can |
| 🎨 **Chameleon** | Wear every menu theme — click `◐` to cycle Nebula → Aurora → Ember → Mono | Unlocks once you've worn all four | Wear every skin |
| 📼 **Vaporwave** | Switch to the off-menu `vapor` theme (7 logo knocks, or terminal `theme vapor`) | A pink/cyan vaporwave palette takes over | A theme that isn't on the menu |
| 🦉 **Night Owl** | Visit between **midnight and 5am** (local time) | Silently unlocks shortly after load | You came when the world was asleep |
| 🗺️ **Cartographer** | Put `#void` (or `#secret`) in the URL, or type `void` | Opens **the void** — the interactive black-hole room | URLs can hide rooms |
| 🔍 **Inspector** | Open the browser dev console and call `nebula.help()` (or `.secrets()` / `.hint()`) | Prints the command list / your progress / a random hint | Developers always peek behind the curtain |
| ✨ **Stargazer** | Click **5 different stars** in the sky | Constellation lines connect the stars you clicked | Connect the dots in the sky |
| 🕳️ **Black Hole** | In the **drift field** section, hold the pointer still (~1.5s) | The luminous dust gathers toward your cursor like a tiny gravity well | Hold still in the drift and gather the dust |
| ⏱️ **Speedrunner** | Discover any **5 secrets within 60 seconds** | Bonus unlock | For the fast |
| 🌗 **Halfway There** | Find **half** of all secrets (11) | Milestone unlock | You're halfway there |
| 👑 **Completionist** | Find every other secret | A grand fireworks finale | You found it all — every last one |
| 🔥 **#TeamValor** | Type `eroizzy` | A full-screen, hand-drawn notebook-paper **shrine** unfolds: the flaming phoenix vaper (`#VapeNation #TeamValor`) and the `EROIZZY.COM` lettering | The legend, drawn in ballpoint |

</details>

### The void (black hole)

`#void` opens a **physically-based Schwarzschild black hole**, ray-marched live
in a WebGL fragment shader: light follows null geodesics through curved
spacetime, with a volumetric accretion disk (Keplerian rotation, relativistic
Doppler beaming, a photon ring). **Drag** to orbit the camera, **scroll** to
zoom, `Esc` (or the ✕ button) to leave.

### Summon (gacha minigame)

Open it any time from the **✦ summon** button in the top-right nav. It's a
full gacha: a 10-pull summon of **100 characters** drawn from space- and
world-spanning games & anime (Halo, Cowboy Bebop, Kingdom Hearts, Dragon Ball,
One Piece, Bleach, Evangelion, Mass Effect, Helldivers 2, NieR, FF7, Metroid,
Honkai: Star Rail, and more — fan tributes via signature colours + a monogram
crest, or drop your own art into `public/units/<id>.png`).

- **Rarities & rates:** L 1% · UR 5% · SSR 10% · SR 50% · R 34% (the 10th of a
  pull is guaranteed SR or better). Popularity drives rarity — the most iconic
  characters are Legendary/Ultra Rare.
- **The pull:** all 10 are decided up front, so the charge animation is tinted
  by the pool's best rarity (rainbow = a Legendary is incoming) over a WebGL
  black-hole portal. Each unit then **warps out** as a ray of light that circles
  the screen, spirals in, and explodes into the card. **Skip** (bottom-right)
  jumps to the summary of all 10.
- **Collection & merging:** every pull is saved (`localStorage`). Feed duplicates
  to raise a unit's stars — the Nth star costs N dupes, up to 5★.
- **Konami code** silently guarantees a god pack (see the secrets list).

### Terminal commands (`~`)

`help` · `secrets` (or `ls`) · `stats` · `theme <name>` · `themes` · `matrix` ·
`disco` · `confetti` · `piano` · `whoami` · `about` · `42` · `clear` · `exit`

### Console API (dev tools)

```js
nebula.help()       // list the available commands
nebula.secrets()    // table of every secret + whether you've found it
nebula.found()      // how many you've discovered
nebula.hint()       // a cryptic hint for something you're missing
nebula.unlockAll()  // cheater. (it works though)
nebula.reset()      // wipe your progress
```

## Project layout

```
src/
  lib/          core systems — achievements, themes, sound synth, input hooks
  components/   ambient layer (cursor, starfield), sections, and every easter egg
  styles/       global.css
```

## Tech

- React 18 + TypeScript, bundled by Vite
- framer-motion for declarative animation
- Canvas 2D for the starfield, the drift field, matrix rain, and per-secret celebration effects
- WebGL for the geodesic black-hole renderer and the gacha summon portal
- Web Audio API for all synthesized sound
- Zero runtime asset dependencies
