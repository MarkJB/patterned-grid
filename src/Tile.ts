import SVG from "svg.js";
import { parseSVG as parsePath } from "svg-path-parser";

interface TileParams {
  element?: SVGElement;
  showArcs?: boolean;
  tileSize?: number;
  numberOfLines?: number;
  rotation?: number;
  strokeWeight?: number;
  strokeColour?: string;
}

// Define the Tile class - arcs
class Tile {
  element: SVGElement;
  showArcs: boolean;
  tileSize: number;
  numberOfLines: number;
  rotation: number;
  strokeWeight: number;
  strokeColour: string;

  constructor({
    showArcs = true,
    tileSize = 100,
    numberOfLines = 10,
    rotation = 0,
    strokeWeight = 1,
    strokeColour = "black",
  }: TileParams) {
    this.showArcs = showArcs;
    this.tileSize = tileSize;
    this.numberOfLines = numberOfLines;
    this.rotation = rotation;
    this.strokeWeight = strokeWeight;
    this.strokeColour = strokeColour;
    this.element = this.createTileElement();
  }

  createTileElement(): SVGElement {
    const group = document.createElementNS("http://www.w3.org/2000/svg", "g");
    group.setAttribute("class", "tile");

    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("viewBox", "0 0 100 100");
    svg.setAttribute("width", "100");
    svg.setAttribute("height", "100");

    const linesGroup = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "g"
    );
    group.appendChild(linesGroup);

    // Instead of manually specifying the points for each Radii (arcRadii) we can
    // calculate that based on the size of the tile and the number of lines we want

    // Experiment with an offset so we don't always fill the tile
    const calcSpacing = (size: number, qty: number): number[] => {
      const spacing = size / qty;
      console.log("CalcRadii, size", size, "quantity", qty, "spacing", spacing);
      let spacingArray = [];
      for (let i = 0; i <= qty; i++) {
        spacingArray.push(0 + i * spacing); // add each position to the array
      }
      return spacingArray;
    };

    // const direction = Math.random() < 0.5 ? "horizontal" : "vertical";
    const direction = "horizontal";

    const radii = calcSpacing(this.tileSize, this.numberOfLines);

    // Draw the lines and add them to the linesGroup
    for (const radius of radii) {
      const lines = this.createPath(radius, direction);
      linesGroup.appendChild(lines);
    }

    // If we are showing arcs on this tile,
    if (this.showArcs) {
      const arcCenter = { x: 0, y: 0 };
      const largestRadius = radii[radii.length - 1];

      // Convert the linesGroup.lines into an array
      Array.from(linesGroup.querySelectorAll("path")).forEach((line) => {
        // Extract the line start and end for the current line
        const lineStart = {
          x: parseFloat(line.getAttribute("d")?.split(" ")[1] as string),
          y: parseFloat(line.getAttribute("d")?.split(" ")[2] as string),
          // x: parseFloat(line.getAttribute("x1") as string),
          // y: parseFloat(line.getAttribute("y1") as string),
        };
        const lineEnd = {
          x: parseFloat(line.getAttribute("d")?.split(" ")[4] as string),
          y: parseFloat(line.getAttribute("d")?.split(" ")[5] as string),
          // x: parseFloat(line.getAttribute("x2") as string),
          // y: parseFloat(line.getAttribute("y2") as string),
        };

        console.log("Line start:", lineStart, "Line end:", lineEnd);
        // Determine if there is an intersection for the current line
        const intersection = this.lineArcIntersection(
          lineStart,
          lineEnd,
          arcCenter,
          largestRadius
        );

        if (intersection) {
          console.log("Intersection found", intersection);
          console.log(
            "Modify lines 'd' attribute '",
            line.getAttribute("d"),
            "'"
          );
          console.log(
            "Updating arrtibute with this: `",
            `M ${intersection.x} ${intersection.y} ${line
              .getAttribute("d")
              ?.split(" ")
              .slice(4, 6)
              .join(" ")}`,
            "'"
          );
          line.setAttribute(
            "d",
            `M ${intersection.x} ${intersection.y} ${line
              .getAttribute("d")
              ?.split(" ")
              .slice(4, 6)
              .join(" ")}`
          );
          // line.setAttribute("y1", String(intersection.y));
        } else {
          console.log("No intersection found");
        }
      });

      // for each radius in the radii array
      for (const radius of radii) {
        const arc = this.createArc(0, 0, radius, 0, 0 + 90);
        group.appendChild(arc);
      }
    }
    return group;
  }

  createLine(radius: number, direction: "horizontal" | "vertical"): SVGElement {
    console.log(
      "Creating a single line with direction",
      direction,
      "and length",
      radius
    );
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

    line.setAttribute("stroke", this.strokeColour);
    line.setAttribute("stroke-width", String(this.strokeWeight));

    lines.appendChild(line);

    return lines;
  }

  // Maybe the line is causing problem? (I don't seem to be able to join a line to a path so make the lines paths?)
  createPath(radius: number, direction: "horizontal" | "vertical"): SVGElement {
    console.log(
      "Creating a single path with direction",
      direction,
      "and length",
      radius
    );
    const paths = document.createElementNS("http://www.w3.org/2000/svg", "g");
    const pathOffset = 0;

    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");

    // Horizontal Lines start at x1=0 y1=radius and finish at x2=100, y2=radius
    // Vertical Lines start at x1=radius y1=0 and finish at x2=radius, y2=100
    let d;
    if (direction === "horizontal") {
      d = `M 0 ${radius} L 100 ${radius}`;
    } else {
      d = `M ${radius} 0 L ${radius} 100`;
    }

    path.setAttribute("d", d);
    path.setAttribute("stroke", this.strokeColour);
    path.setAttribute("stroke-width", String(this.strokeWeight));
    path.setAttribute("stroke-linecap", "round");
    path.setAttribute("stroke-linejoin", "round");
    path.setAttribute("fill", "none");

    paths.appendChild(path);

    return paths;
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
    arc.setAttribute("stroke", this.strokeColour);
    arc.setAttribute("stroke-width", String(this.strokeWeight));

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
    const x1 = (D * dy - sign * dx * Math.sqrt(delta)) / (dr * dr);
    const y1 = (-D * dx - Math.abs(dy) * Math.sqrt(delta)) / (dr * dr);
    const x2 = (D * dy + sign * dx * Math.sqrt(delta)) / (dr * dr);
    const y2 = (-D * dx + Math.abs(dy) * Math.sqrt(delta)) / (dr * dr);

    // Return the intersection point closer to the line's start point
    const d1 = Math.hypot(lineStart.x - x1, lineStart.y - y1);
    const d2 = Math.hypot(lineStart.x - x2, lineStart.y - y2);
    return d1 < d2 ? { x: x1, y: y1 } : { x: x2, y: y2 };
  }
}

export default Tile;
