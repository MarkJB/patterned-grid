import { Grid } from "./Grid";
import { Controls } from "./Controls";
import { downloadSvg } from "./SvgExporter";
import type { ControlState } from "./types";

const controlsPanel = document.getElementById("controls-panel") as HTMLElement;
const canvasContainer = document.getElementById(
  "canvas-container",
) as HTMLElement;

const grid = new Grid(canvasContainer);

function regenerate(state: ControlState): void {
  // If no seed given, generate one and display it so the user can replay it
  if (state.seed === "") {
    state.seed = Math.random().toString(36).slice(2, 10);
    controls.displaySeed(state.seed);
  }
  grid.generate(state);
}

const controls = new Controls(
  controlsPanel,
  (state) => regenerate(state),
  (_state) => downloadSvg(grid.getSvgElement()),
);

// Generate on load
regenerate(controls.getState());
