import { path as d3Path } from "d3-path";
import type { TilePath } from "./types";

export interface TileParams {
  linesPerTile: number;
  arcProbability: number;
  directionBias: number;
  rng: () => number;
}

const TILE_SIZE = 100;

export function generateTile(params: TileParams): TilePath[] {
  const { linesPerTile, arcProbability, directionBias, rng } = params;
  const results: TilePath[] = [];

  const direction = rng() < directionBias ? "vertical" : "horizontal";
  const showArcs = rng() < arcProbability;
  const spacing = TILE_SIZE / linesPerTile;

  // Build radii: 0, spacing, 2*spacing, ..., TILE_SIZE
  const radii: number[] = [];
  for (let i = 0; i <= linesPerTile; i++) {
    radii.push(i * spacing);
  }

  const largestRadius = radii[radii.length - 1];

  // Generate lines, trimming against the arc if needed
  for (const radius of radii) {
    let startX: number, startY: number, endX: number, endY: number;

    if (direction === "horizontal") {
      startX = 0;
      startY = radius;
      endX = TILE_SIZE;
      endY = radius;
    } else {
      startX = radius;
      startY = 0;
      endX = radius;
      endY = TILE_SIZE;
    }

    if (showArcs) {
      const intersection = lineArcIntersection(
        { x: startX, y: startY },
        { x: endX, y: endY },
        { x: 0, y: 0 },
        largestRadius,
      );
      if (intersection) {
        startX = intersection.x;
        startY = intersection.y;
      }
    }

    const p = d3Path();
    p.moveTo(startX, startY);
    p.lineTo(endX, endY);

    results.push({
      d: p.toString(),
      start: { x: startX, y: startY },
      end: { x: endX, y: endY },
      type: "line",
    });
  }

  // Generate arcs
  if (showArcs) {
    for (const radius of radii) {
      if (radius === 0) continue;
      const arc = buildArc(0, 0, radius, 0, 90);
      results.push(arc);
    }
  }

  return results;
}

function buildArc(
  cx: number,
  cy: number,
  r: number,
  startAngleDeg: number,
  endAngleDeg: number,
): TilePath {
  const startRad = (startAngleDeg * Math.PI) / 180;
  const endRad = (endAngleDeg * Math.PI) / 180;

  const startX = cx + r * Math.cos(startRad);
  const startY = cy + r * Math.sin(startRad);
  const endX = cx + r * Math.cos(endRad);
  const endY = cy + r * Math.sin(endRad);

  const p = d3Path();
  p.moveTo(startX, startY);
  p.arc(cx, cy, r, startRad, endRad, false);

  return {
    d: p.toString(),
    start: { x: startX, y: startY },
    end: { x: endX, y: endY },
    type: "arc",
  };
}

function lineArcIntersection(
  lineStart: { x: number; y: number },
  lineEnd: { x: number; y: number },
  arcCenter: { x: number; y: number },
  arcRadius: number,
): { x: number; y: number } | null {
  const dx = lineEnd.x - lineStart.x;
  const dy = lineEnd.y - lineStart.y;
  const dr = Math.sqrt(dx * dx + dy * dy);
  const D = lineStart.x * lineEnd.y - lineEnd.x * lineStart.y;
  const delta = arcRadius * arcRadius * dr * dr - D * D;

  if (delta < 0) return null;

  const sign = dy < 0 ? -1 : 1;
  const x1 = (D * dy - sign * dx * Math.sqrt(delta)) / (dr * dr);
  const y1 = (-D * dx - Math.abs(dy) * Math.sqrt(delta)) / (dr * dr);
  const x2 = (D * dy + sign * dx * Math.sqrt(delta)) / (dr * dr);
  const y2 = (-D * dx + Math.abs(dy) * Math.sqrt(delta)) / (dr * dr);

  const d1 = Math.hypot(lineStart.x - x1, lineStart.y - y1);
  const d2 = Math.hypot(lineStart.x - x2, lineStart.y - y2);
  return d1 < d2 ? { x: x1, y: y1 } : { x: x2, y: y2 };
}
