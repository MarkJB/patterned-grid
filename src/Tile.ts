import SVG from "svg.js";
import { parseSVG as parsePath } from "svg-path-parser";

// Define the Tile class - arcs
class Tile {
  element: SVGElement;
  //   rotation: number;
  //   color: string;
  showArcs: boolean;
  tileSize: number;

  constructor(
    // rotation: number,
    // color: string,
    showArcs: boolean = true,
    tileSize: number = 100
  ) {
    // this.rotation = rotation;
    // this.color = color;
    this.showArcs = showArcs;
    this.tileSize = tileSize;
    this.element = this.createTileElement();
  }

  createTileElement(): SVGElement {
    const group = document.createElementNS("http://www.w3.org/2000/svg", "g");
    group.setAttribute("class", "tile");
    // group.setAttribute(
    //   "transform",
    //   `translate(${this.rotation}, ${this.rotation}) rotate(${this.rotation})`
    // );

    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("viewBox", "0 0 100 100");
    svg.setAttribute("width", "100");
    svg.setAttribute("height", "100");

    const linesGroup = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "g"
    );
    group.appendChild(linesGroup);

    // Create parallel arcs with different radii all starting at the top-left corner
    const arcStartAngles = [0]; // Start all arcs from the top-left corner

    // Instead of manually specifying the points for each Radii (arcRadii) we can
    // calculate that based on the size of the tile and the number of lines we want
    const calcRadii = (size: number, qty: number): number[] => {
      const spacing = size / qty;
      let arcRadii = [];
      for (let i = 1; i <= qty; i++) {
        arcRadii.push(0 + i * spacing); // add each position to the array
      }
      return arcRadii;
    };

    const direction = Math.random() < 0.5 ? "horizontal" : "vertical";

    for (const radius of calcRadii(100, 10)) {
      const lines = this.createHorizontalLine(radius, direction);
      linesGroup.appendChild(lines);
    }

    if (this.showArcs) {
      for (const radius of calcRadii(100, 10)) {
        const arcCenter = { x: 0, y: 0 };

        Array.from(linesGroup.querySelectorAll("line")).forEach((line) => {
          const lineStart = {
            x: parseFloat(line.getAttribute("x1") as string),
            y: parseFloat(line.getAttribute("y1") as string),
          };
          const lineEnd = {
            x: parseFloat(line.getAttribute("x2") as string),
            y: parseFloat(line.getAttribute("y2") as string),
          };

          const intersection = this.lineArcIntersection(
            lineStart,
            lineEnd,
            arcCenter,
            radius
          );

          if (intersection) {
            if (direction === "horizontal") {
              line.setAttribute("x1", String(intersection.x));
              line.setAttribute("y1", String(intersection.y));
            } else {
              line.setAttribute("x1", String(intersection.x));
              line.setAttribute("y1", String(intersection.y));
            }
          }
        });
      }
    }

    return group;
  }

  createHorizontalLine(
    radius: number,
    // startY: number,
    direction: "horizontal" | "vertical"
  ): SVGElement {
    const lines = document.createElementNS("http://www.w3.org/2000/svg", "g");
    const lineOffset = 0;

    const line = document.createElementNS("http://www.w3.org/2000/svg", "line");

    // Horizontal Lines start at x1=0 y1=radius and finish at x2=100, y2=radius
    // Vertical Lines start at x1=radius y1=0 and finish at x2=radius, y2=100
    if (direction === "horizontal") {
      // Start of line
      line.setAttribute("x1", "0");
      line.setAttribute("y1", String(radius));
      //   end of line
      line.setAttribute("x2", "100");
      line.setAttribute("y2", String(radius));
    } else {
      // Start of line
      line.setAttribute("x1", String(radius));
      line.setAttribute("y1", "0");
      //   end of line
      line.setAttribute("x2", String(radius));
      line.setAttribute("y2", "100");
    }

    line.setAttribute("stroke", "black");
    line.setAttribute("stroke-width", "2");

    lines.appendChild(line);

    return lines;
  }

  // return an SVG arc for the given start coordinates and radius between the start and end angle
  createArc(
    cx: number,
    cy: number,
    r: number,
    startAngle: number,
    endAngle: number
  ): SVGElement {
    const startPoint = this.polarToCartesian(cx, cy, r, startAngle);
    const endPoint = this.polarToCartesian(cx, cy, r, endAngle);

    const arc = document.createElementNS("http://www.w3.org/2000/svg", "path");
    const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";

    const d = [
      "M",
      startPoint.x,
      startPoint.y,
      "A",
      r,
      r,
      0,
      largeArcFlag,
      1,
      endPoint.x,
      endPoint.y,
    ].join(" ");

    arc.setAttribute("d", d);
    arc.setAttribute("fill", "none");
    arc.setAttribute("stroke", "black");
    arc.setAttribute("stroke-width", "2");

    return arc;
  }

  // Convert polar coordinates to cartesian
  polarToCartesian(
    cx: number,
    cy: number,
    r: number,
    angle: number
  ): { x: number; y: number } {
    const radians = (angle * Math.PI) / 180;
    return {
      x: cx + r * Math.cos(radians),
      y: cy + r * Math.sin(radians),
    };
  }

  // Determine the coordinates where a line crosses an arc
  lineArcIntersection(
    lineStart: { x: number; y: number },
    lineEnd: { x: number; y: number },
    arcCenter: { x: number; y: number },
    arcRadius: number
  ): { x: number; y: number } | null {
    const dx = lineEnd.x - lineStart.x;
    const dy = lineEnd.y - lineStart.y;
    const dr = Math.sqrt(dx * dx + dy * dy);
    const D = lineStart.x * lineEnd.y - lineEnd.x * lineStart.y;
    const delta = arcRadius * arcRadius * dr * dr - D * D;

    if (delta < 0) {
      return null; // No intersection
    }

    const sign = dy < 0 ? -1 : 1;
    const x1 = (D * dy + sign * dx * Math.sqrt(delta)) / (dr * dr);
    const y1 = (-D * dx + Math.abs(dy) * Math.sqrt(delta)) / (dr * dr);
    const x2 = (D * dy - sign * dx * Math.sqrt(delta)) / (dr * dr);
    const y2 = (-D * dx - Math.abs(dy) * Math.sqrt(delta)) / (dr * dr);

    // Return the intersection point closer to the line's start point
    const d1 = Math.hypot(lineStart.x - x1, lineStart.y - y1);
    const d2 = Math.hypot(lineStart.x - x2, lineStart.y - y2);
    return d1 < d2 ? { x: x1, y: y1 } : { x: x2, y: y2 };
  }
}

export default Tile;
