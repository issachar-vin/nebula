# ◈ NEBULA — a playground in the dark

An interactive, animation-heavy single-page playground built for fun. Everything
on the page reacts to you, and **most of it is hidden**. There are **23 secrets**
to discover — through the keyboard, the corners, the sky, the URL bar, and the
dev console.

Hand-built with **React + TypeScript + Vite**, **framer-motion**, the **Canvas
2D API**, and the **Web Audio API**. No sound or image assets — every tone is
synthesized and every visual is drawn in code.

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

## How to play

| Key        | Does                                          |
| ---------- | --------------------------------------------- |
| `~`        | open the terminal (try `help`)                |
| `T`        | open your trophy case                         |
| `P`        | summon the piano — then play the keys         |
| hold `G`   | let gravity loose                             |
| `?`        | controls & clues                              |
| `Esc`      | close anything                                |

There are also secrets in the sky, in typed words, in an old arcade code, in the
browser console (`nebula.help()`), and in URLs ending with `#void`. The trophy
case tracks your progress, persisted in `localStorage`.

> 🔥 One legend is drawn in ballpoint. You'll know it when you find it. #TeamValor

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
- Web Audio API for all synthesized sound
- Zero runtime asset dependencies
