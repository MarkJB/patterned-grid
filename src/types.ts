export interface TilePath {
  d: string;
  start: { x: number; y: number };
  end: { x: number; y: number };
  type: "line" | "arc";
}

export interface CombinedPath {
  d: string;
  layerIndex: number;
}

export interface Layer {
  index: number;
  label: string;
  colour: string;
  visible: boolean;
  paths: CombinedPath[];
}

export interface ControlState {
  rows: number;
  cols: number;
  linesPerTile: number;
  arcProbability: number; // 0–1
  directionBias: number; // 0 = always horizontal, 1 = always vertical
  rotationBias: number; // 0 = always 0/180°, 1 = fully random
  numLayers: number; // 1–6
  layerColours: string[];
  layerVisibility: boolean[];
  viewMode: "single" | "layers";
  joinPaths: boolean;
  joinTolerance: number; // SVG units, 0–5
  seed: string; // empty = random each time
}

export const DEFAULT_LAYER_COLOURS = [
  "#e03131", // red
  "#1971c2", // blue
  "#2f9e44", // green
  "#f08c00", // orange
  "#7048e8", // violet
  "#0c8599", // cyan
];

export const DEFAULT_STATE: ControlState = {
  rows: 10,
  cols: 12,
  linesPerTile: 10,
  arcProbability: 0.5,
  directionBias: 0.5,
  rotationBias: 1,
  numLayers: 2,
  layerColours: [...DEFAULT_LAYER_COLOURS],
  layerVisibility: [true, true, true, true, true, true],
  viewMode: "single",
  joinPaths: true,
  joinTolerance: 1,
  seed: "",
};
