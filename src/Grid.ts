import seedrandom from "seedrandom";
import { generateTile } from "./Tile";
import { combinePaths } from "./PathCombiner";
import { assignLayers } from "./LayerManager";
import type { ControlState, TilePath, Layer } from "./types";

const TILE_SIZE = 100;
const SVG_NS = "http://www.w3.org/2000/svg";

export class Grid {
  private svg: SVGSVGElement;
  private container: HTMLElement;

  constructor(container: HTMLElement) {
    this.container = container;
    this.svg = document.createElementNS(SVG_NS, "svg") as SVGSVGElement;
    this.svg.setAttribute("xmlns", SVG_NS);
    this.svg.setAttribute(
      "xmlns:inkscape",
      "http://www.inkscape.org/namespaces/inkscape",
    );
    this.svg.style.width = "100%";
    this.svg.style.height = "100%";
    container.appendChild(this.svg);
  }

  getSvgElement(): SVGSVGElement {
    return this.svg;
  }

  generate(state: ControlState): void {
    // Resolve seed
    const seedStr = state.seed !== "" ? state.seed : String(Math.random());
    const rng = seedrandom(seedStr);

    const { rows, cols } = state;
    this.svg.setAttribute(
      "viewBox",
      `0 0 ${cols * TILE_SIZE} ${rows * TILE_SIZE}`,
    );

    // Collect all tile paths in absolute canvas coordinates
    const allPaths: TilePath[] = [];

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        // Pick rotation: bias controls probability of 0/180 vs 90/270
        const rotation = pickRotation(rng, state.rotationBias);
        const offsetX = col * TILE_SIZE;
        const offsetY = row * TILE_SIZE;

        const tilePaths = generateTile({
          linesPerTile: state.linesPerTile,
          arcProbability: state.arcProbability,
          directionBias: state.directionBias,
          rng,
        });

        // Transform each path from tile-local to absolute canvas coordinates
        for (const tp of tilePaths) {
          const transformed = transformPath(
            tp,
            offsetX,
            offsetY,
            rotation,
            TILE_SIZE,
          );
          allPaths.push(transformed);
        }
      }
    }

    // Combine nearby endpoints into chains
    const combinedPaths = state.joinPaths
      ? combinePaths(allPaths, state.joinTolerance)
      : allPaths.map((p) => ({ d: p.d, layerIndex: 0 }));

    // Assign combined paths to layers
    const layers = assignLayers(combinedPaths, state, rng);

    // Render
    this.render(layers, state);
  }

  private render(layers: Layer[], state: ControlState): void {
    // Clear existing content
    while (this.svg.firstChild) {
      this.svg.removeChild(this.svg.firstChild);
    }

    for (const layer of layers) {
      if (!layer.visible) continue;

      const stroke = state.viewMode === "layers" ? layer.colour : "#000000";

      const g = document.createElementNS(SVG_NS, "g") as SVGGElement;
      g.setAttribute("id", `layer-${layer.index}`);
      g.setAttribute("inkscape:label", layer.label);
      g.setAttribute("inkscape:groupmode", "layer");
      g.setAttribute("stroke", stroke);
      g.setAttribute("fill", "none");
      g.setAttribute("stroke-width", "1");

      for (const cp of layer.paths) {
        const pathEl = document.createElementNS(
          SVG_NS,
          "path",
        ) as SVGPathElement;
        pathEl.setAttribute("d", cp.d);
        g.appendChild(pathEl);
      }

      this.svg.appendChild(g);
    }
  }
}

/**
 * rotationBias: 0 = always 0°/180°, 1 = fully random (all four angles equally likely)
 */
function pickRotation(rng: () => number, rotationBias: number): number {
  const angles =
    rotationBias < 1
      ? rng() < rotationBias
        ? rng() < 0.5
          ? 90
          : 270
        : rng() < 0.5
          ? 0
          : 180
      : Math.floor(rng() * 4) * 90;
  return angles;
}

/**
 * Apply translate(offsetX, offsetY) + rotate(angle, 50, 50) to all points in a TilePath.
 * We do this mathematically so PathCombiner works on flat absolute coordinates.
 */
function transformPath(
  tp: TilePath,
  offsetX: number,
  offsetY: number,
  rotation: number,
  tileSize: number,
): TilePath {
  const cx = tileSize / 2;
  const cy = tileSize / 2;
  const rad = (rotation * Math.PI) / 180;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);

  const transformPoint = (p: { x: number; y: number }) => {
    // Rotate around tile centre
    const rx = cos * (p.x - cx) - sin * (p.y - cy) + cx;
    const ry = sin * (p.x - cx) + cos * (p.y - cy) + cy;
    // Translate to grid position
    return { x: rx + offsetX, y: ry + offsetY };
  };

  const newStart = transformPoint(tp.start);
  const newEnd = transformPoint(tp.end);

  // Transform the d string: re-parse all coordinate pairs and transform them
  const newD = transformD(tp.d, transformPoint);

  return { ...tp, d: newD, start: newStart, end: newEnd };
}

/**
 * Transform all coordinate pairs in an SVG path d string using the given point transform.
 * Handles M, L, A commands (the only ones we emit).
 */
function transformD(
  d: string,
  transform: (p: { x: number; y: number }) => { x: number; y: number },
): string {
  // Tokenise: split on command letters, process each segment
  const segments = d.match(/[MLAZmlaz][^MLAZmlaz]*/g) ?? [];
  const out: string[] = [];

  for (const seg of segments) {
    const cmd = seg[0];
    const args = seg
      .slice(1)
      .trim()
      .split(/[\s,]+/)
      .map(Number);

    if (cmd === "M" || cmd === "L") {
      // M x y or L x y
      const p = transform({ x: args[0], y: args[1] });
      out.push(`${cmd}${fmt(p.x)},${fmt(p.y)}`);
    } else if (cmd === "A") {
      // A rx ry x-rotation large-arc-flag sweep-flag x y
      const rx = args[0];
      const ry = args[1];
      const xRot = args[2];
      const largeArc = args[3];
      const sweep = args[4];
      const p = transform({ x: args[5], y: args[6] });
      out.push(
        `A${fmt(rx)},${fmt(ry)},${xRot},${largeArc},${sweep},${fmt(p.x)},${fmt(p.y)}`,
      );
    } else if (cmd === "Z" || cmd === "z") {
      out.push("Z");
    }
  }

  return out.join(" ");
}

function fmt(n: number): string {
  return parseFloat(n.toFixed(4)).toString();
}
