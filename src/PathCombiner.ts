import type { TilePath, CombinedPath } from "./types";

interface OrientedSegment {
  start: { x: number; y: number };
  end: { x: number; y: number };
  command: string;
}

function dist(
  a: { x: number; y: number },
  b: { x: number; y: number },
): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

export function combinePaths(
  paths: TilePath[],
  tolerance: number,
): CombinedPath[] {
  if (paths.length === 0) return [];

  const visited = new Array<boolean>(paths.length).fill(false);
  const combined: CombinedPath[] = [];

  for (let i = 0; i < paths.length; i++) {
    if (visited[i]) continue;

    visited[i] = true;
    const chainSegments: OrientedSegment[] = [orientForward(paths[i])];
    let tailEnd = chainSegments[0].end;

    let found = true;
    while (found) {
      found = false;

      for (let j = 0; j < paths.length; j++) {
        if (visited[j]) continue;

        const candidate = paths[j];
        const distToStart = dist(tailEnd, candidate.start);
        const distToEnd = dist(tailEnd, candidate.end);

        if (distToStart <= tolerance) {
          visited[j] = true;
          const oriented = orientForward(candidate);
          chainSegments.push(oriented);
          tailEnd = oriented.end;
          found = true;
          break;
        }

        if (distToEnd <= tolerance) {
          visited[j] = true;
          const oriented = orientReversed(candidate);
          chainSegments.push(oriented);
          tailEnd = oriented.end;
          found = true;
          break;
        }
      }
    }

    combined.push({ d: buildChainD(chainSegments), layerIndex: 0 });
  }

  return combined;
}

function buildChainD(segments: OrientedSegment[]): string {
  if (segments.length === 0) return "";

  const parts: string[] = [
    `M ${fmt(segments[0].start.x)} ${fmt(segments[0].start.y)}`,
  ];

  for (const seg of segments) {
    parts.push(seg.command);
  }

  return parts.join(" ");
}

function orientForward(p: TilePath): OrientedSegment {
  if (p.type === "line") {
    return {
      start: p.start,
      end: p.end,
      command: `L ${fmt(p.end.x)} ${fmt(p.end.y)}`,
    };
  }

  const arc = parseArcFromPath(p.d);
  return {
    start: p.start,
    end: p.end,
    command: `A ${fmt(arc.rx)} ${fmt(arc.ry)} ${fmt(arc.xAxisRotation)} ${arc.largeArcFlag} ${arc.sweepFlag} ${fmt(p.end.x)} ${fmt(p.end.y)}`,
  };
}

function orientReversed(p: TilePath): OrientedSegment {
  if (p.type === "line") {
    return {
      start: p.end,
      end: p.start,
      command: `L ${fmt(p.start.x)} ${fmt(p.start.y)}`,
    };
  }

  const arc = parseArcFromPath(p.d);
  const reversedSweep = arc.sweepFlag === 1 ? 0 : 1;

  return {
    start: p.end,
    end: p.start,
    command: `A ${fmt(arc.rx)} ${fmt(arc.ry)} ${fmt(arc.xAxisRotation)} ${arc.largeArcFlag} ${reversedSweep} ${fmt(p.start.x)} ${fmt(p.start.y)}`,
  };
}

function parseArcFromPath(d: string): {
  rx: number;
  ry: number;
  xAxisRotation: number;
  largeArcFlag: number;
  sweepFlag: number;
} {
  const match = d.match(
    /A\s*([-+]?\d*\.?\d+(?:e[-+]?\d+)?)\s*[ ,]\s*([-+]?\d*\.?\d+(?:e[-+]?\d+)?)\s*[ ,]\s*([-+]?\d*\.?\d+(?:e[-+]?\d+)?)\s*[ ,]\s*([01])\s*[ ,]\s*([01])/i,
  );

  if (!match) {
    throw new Error(`Unable to parse arc command from path: ${d}`);
  }

  return {
    rx: Number(match[1]),
    ry: Number(match[2]),
    xAxisRotation: Number(match[3]),
    largeArcFlag: Number(match[4]),
    sweepFlag: Number(match[5]),
  };
}

function fmt(n: number): string {
  return parseFloat(n.toFixed(4)).toString();
}
