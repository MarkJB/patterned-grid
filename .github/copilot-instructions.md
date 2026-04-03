# Patterned Grid — Project Plan & Implementation Guide

This file describes the agreed architecture and implementation plan for this project.
When asked to implement any part of this project, follow this guide.

## Overview

A browser-based generative art tool that creates a grid of patterned SVG tiles.
Designed for pen-plotter output: paths are combined to minimise pen lifts and
assigned to layers (pen colours). A controls panel lets users tune randomness and
export the result.

---

## Build Tooling

- **Vite** (replaces webpack). No `webpack.config.js` needed.
- **TypeScript** throughout.
- Run dev server: `vite`
- Build: `vite build`

---

## Dependencies

Keep the bundle lean. Only these runtime dependencies:

| Package      | Purpose                                      |
| ------------ | -------------------------------------------- |
| `d3-path`    | Programmatic SVG path `d` string building    |
| `seedrandom` | Reproducible seeded random number generation |

All other existing packages (`svg.js`, `svg-path-parser`, `svg-intersections`,
`path-intersection`, `svg.pathmorphing.js`, `svg-path`) should be **removed**.

---

## File Structure

```
src/
  index.ts          — App entry point. Wires Controls → Grid, handles regeneration.
  types.ts          — All shared TypeScript interfaces and types.
  Tile.ts           — Generates raw path data for a single tile (no DOM).
  Grid.ts           — Builds the SVG canvas, places and transforms tiles.
  PathCombiner.ts   — Chains nearby path endpoints into single continuous paths.
  LayerManager.ts   — Randomly assigns paths to layers, manages per-layer state.
  Controls.ts       — Renders the side panel UI and emits change events.
  SvgExporter.ts    — Serialises the SVG and triggers a file download.
index.html          — Minimal shell. Contains #app root only.
styles.css          — Layout styles for side panel + canvas.
```

---

## Architecture: Data Flow

```
Controls (ControlState)
    ↓
Grid.generate(state)
    ↓ for each tile:
Tile.generate(params) → TilePath[]   (path data in tile-local coordinates 0–100)
    ↓
Grid transforms TilePath[] to absolute canvas coordinates
    ↓
PathCombiner.combine(paths, tolerance) → CombinedPath[]
    ↓
LayerManager.assign(paths, numLayers) → Layer[]
    ↓
Grid renders Layer[] as <g> elements into the SVG
```

**Key principle:** `Tile` returns plain data objects, never DOM elements.
This separates geometry from rendering and makes path combining straightforward.

---

## types.ts — Core Interfaces

```ts
interface TilePath {
  d: string; // SVG path d attribute (absolute coords after transform)
  start: { x: number; y: number };
  end: { x: number; y: number };
  type: "line" | "arc";
}

interface CombinedPath {
  d: string;
  layerIndex: number;
}

interface Layer {
  index: number;
  label: string; // e.g. "Layer 1"
  colour: string; // hex colour for this layer
  visible: boolean;
  paths: CombinedPath[];
}

interface ControlState {
  rows: number; // default 10
  cols: number; // default 12
  linesPerTile: number; // default 10
  arcProbability: number; // 0–1, default 0.5
  directionBias: number; // 0 = always horizontal, 1 = always vertical, 0.5 = equal
  rotationBias: number; // 0 = always 0/180°, 1 = fully random, default 1
  numLayers: number; // 1–6, default 2
  layerColours: string[]; // one hex per layer
  layerVisibility: boolean[]; // one bool per layer
  viewMode: "single" | "layers"; // 'single' = all black, 'layers' = use layer colours
  joinPaths: boolean; // default true
  joinTolerance: number; // units, default 1, range 0–5
  seed: string; // empty string = random each time
}
```

---

## Tile.ts

- Constructor accepts `TileParams` (subset of `ControlState` relevant to a tile).
- Uses the `d3-path` API to build path `d` strings cleanly.
- Uses a seeded random function passed in (from `seedrandom`), not `Math.random()`.
- Returns `TilePath[]` — one entry per line or arc segment.
- Coordinate space: 0–100 units per tile.
- Line spacing: `tileSize / linesPerTile`.
- Arc origin: always `(0, 0)` in tile space (corner), one arc per radius step.
- Direction (`horizontal` | `vertical`) chosen via `directionBias`.
- `showArcs` chosen via `arcProbability`.
- Arc–line intersection trimming: trim lines where they cross the outermost arc radius,
  so lines don't extend past the arc. Keep the existing `lineArcIntersection` math.

---

## PathCombiner.ts

- Input: `TilePath[]` with absolute canvas coordinates.
- Algorithm: greedy chain-walk.
  1. Mark all paths unvisited.
  2. Pick first unvisited path, start a chain.
  3. Look for another unvisited path whose `start` or `end` is within `tolerance`
     distance of the current chain's tail endpoint.
  4. If found: append (reversing the candidate if needed), mark visited, continue.
  5. If not found: close the chain, emit it, start a new one.
- **Only endpoint-to-endpoint joins.** Never join into the middle of a path.
- Use `d3-path` to construct combined `d` strings.
- Tolerance is in SVG canvas units (same units as tile coordinates × grid scale).

---

## LayerManager.ts

- Input: `CombinedPath[]`, `ControlState`.
- Randomly assigns each path to a layer index (`0` to `numLayers - 1`).
- Uses seeded random (consistent with the overall seed).
- Returns `Layer[]`.
- Provides a method to re-colour or toggle visibility without re-generating paths.

---

## Grid.ts

- Creates the outer `<svg>` element, sets `viewBox` based on rows × cols × 100 units.
- For each tile position, calls `Tile.generate()`, transforms resulting paths to
  absolute coordinates using the tile's `translate + rotate` transform matrix
  (apply the transform mathematically to coordinates, not via SVG `transform` attribute,
  so `PathCombiner` works on flat absolute coordinates).
- After combining and layer assignment, renders each `Layer` as:
  ```svg
  <g
    inkscape:label="Layer 1"
    inkscape:groupmode="layer"
    id="layer-0"
    stroke="[colour or black depending on viewMode]"
    fill="none"
    stroke-width="1"
  >
    <path d="..." />
    ...
  </g>
  ```
- Hidden layers (`visible: false`) are excluded from the rendered SVG entirely.

---

## Controls.ts

Side panel UI. Emits a `ControlState` object on changes.
Regeneration is **manual** — changes do not auto-regenerate.

### Panel sections

| Section      | Controls                                                                         |
| ------------ | -------------------------------------------------------------------------------- |
| Grid         | Rows (slider + number input, range 1–30), Cols (1–30)                            |
| Tile         | Lines per tile (slider, range 1–20)                                              |
| Bias         | Arc probability % (slider 0–100), Direction H↔V (slider), Rotation bias (slider) |
| Layers       | Number of layers (1–6 segmented control), per-layer: colour swatch + eye toggle  |
| View         | Single colour / Layer colours toggle                                             |
| Path joining | Enable toggle, Tolerance (slider 0–5, step 0.5)                                  |
| Seed         | Text input (empty = new random)                                                  |
| Actions      | **Regenerate** button (primary), **Download SVG** button                         |

---

## SvgExporter.ts

- Serialises the live `<svg>` element using `XMLSerializer`.
- Includes only visible layers.
- Sets correct MIME type: `image/svg+xml;charset=utf-8`.
- Triggers download as `generated-image.svg`.
- Also adds the Inkscape XML namespace to the SVG root for layer compatibility:
  `xmlns:inkscape="http://www.inkscape.org/namespaces/inkscape"`.

---

## index.html

Clean minimal shell:

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Patterned Grid Generator</title>
    <link rel="stylesheet" href="styles.css" />
  </head>
  <body>
    <div id="app">
      <aside id="controls-panel"></aside>
      <main id="canvas-container"></main>
    </div>
    <script type="module" src="src/index.ts"></script>
  </body>
</html>
```

---

## styles.css

- `#app`: flex row, full viewport height.
- `#controls-panel`: fixed width (~280px), scrollable, padding.
- `#canvas-container`: flex-grow, SVG fills available space.

---

## Random Number Generation

- Use `seedrandom` to create a seeded PRNG at the start of each `generate()` call.
- Pass the PRNG function down to `Tile` and `LayerManager` so all randomness is
  reproducible given the same seed.
- If `seed` is empty string, generate a random seed and display it in the UI
  (so the user can copy and replay it).

---

## Things to Preserve from the Original

- The core tile geometry: equally-spaced parallel lines + corner arcs
- Arc–line intersection trimming logic (`lineArcIntersection` math)
- Single SVG output (all layers in one file as `<g>` groups)
