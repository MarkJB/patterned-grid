import SVG from "svg.js";
import { parseSVG as parsePath } from "svg-path-parser";

// Define the Tile class - arcs
class Tile {
  element: SVGElement;
  showArcs: boolean;
  tileSize: number;
  numberOfLines: number;

  constructor(
    showArcs: boolean = true,
    tileSize: number = 100,
    numberOfLines: number = 10
  ) {
    this.showArcs = showArcs;
    this.tileSize = tileSize;
    this.numberOfLines = numberOfLines;
    this.element = this.createTileElement();
  }

  createTileElement(): SVGElement {
    const group = document.createElementNS("http://www.w3.org/2000/svg", "g");
    group.setAttribute("class", "tile");

    // Instead of manually specifying the points for each Radii (arcRadii) we can
    // calculate that based on the size of the tile and the number of lines we want
    const calcRadii = (size: number, qty: number): number[] => {
      const spacing = size / qty;
      // console.log("CalcRadii, size", size, "quantity", qty, "spacing", spacing);
      let arcRadii = [];
      for (let i = 0; i <= qty; i++) {
        arcRadii.push(0 + i * spacing); // add each position to the array
      }
      return arcRadii;
    };

    const direction = Math.random() < 0.5 ? "horizontal" : "vertical";
    // const direction = "horizontal";

    const radii = calcRadii(this.tileSize, this.numberOfLines);

    // Draw the lines and add them to the linesGroup
    for (const radius of radii) {
      const lines = this.createLine(radius, direction);
      group.appendChild(lines);
    }

    // If we are showing arcs on this tile,
    if (this.showArcs) {
      const arcCenter = { x: 0, y: 0 };
      const largestRadius = radii[radii.length - 1];

      // If we are using 'paths' for straight lines, we need to query the SVG like this:
      // querySelectorAll('svg path:where([d^="M"]):is([d*=" L"])');
      Array.from(
        group.querySelectorAll('path:where([d^="M"]):is([d*=" L"])')
      ).forEach((line) => {
        const dAtt = line.getAttribute("d");
        // console.log("d", dAtt);
        const dAttParts = dAtt?.split(" ");
        // console.log("parts", dAttParts);
        const lineStart = {
          x: Number(dAttParts?.[1]),
          y: Number(dAttParts?.[2]),
        };
        const lineEnd = {
          x: Number(dAttParts?.[4]),
          y: Number(dAttParts?.[5]),
        };
        // console.log("start coords", lineStart, "end coords", lineEnd);

        // Determine if there is an intersection for the current line
        const intersection = this.lineArcIntersection(
          lineStart,
          lineEnd,
          arcCenter,
          largestRadius
        );

        // console.log("Intersection", intersection);
        if (intersection) {
          line.setAttribute(
            "d",
            `M ${intersection.x} ${intersection.y} L ${lineEnd.x} ${lineEnd.y}`
          );
        }
      });

      // Convert the linesGroup.lines into an array
      Array.from(group.querySelectorAll("line")).forEach((line) => {
        // Extract the line start and end for the current line
        const lineStart = {
          x: parseFloat(line.getAttribute("x1") as string),
          y: parseFloat(line.getAttribute("y1") as string),
        };
        const lineEnd = {
          x: parseFloat(line.getAttribute("x2") as string),
          y: parseFloat(line.getAttribute("y2") as string),
        };

        // Determine if there is an intersection for the current line
        const intersection = this.lineArcIntersection(
          lineStart,
          lineEnd,
          arcCenter,
          largestRadius
        );

        if (intersection) {
          // console.log("Intersection found", intersection);
          line.setAttribute("x1", String(intersection.x));
          line.setAttribute("y1", String(intersection.y));
        } else {
          // console.log("No intersection found");
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
    // console.log(
    //   "Creating a single line with direction",
    //   direction,
    //   "and length",
    //   radius
    // );

    // Try making this a path instead of a line
    const linePath = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "path"
    );
    // d="M 10 10 L 150 80 Q 100 20 180 50"
    let d;
    if (direction === "horizontal") {
      d = ["M", "0", String(radius), "L", "100", String(radius)].join(" ");
    } else {
      d = ["M", String(radius), "0", "L", String(radius), 100].join(" ");
    }

    linePath.setAttribute("d", d);
    linePath.setAttribute("fill", "none");
    linePath.setAttribute("stroke", "black");
    linePath.setAttribute("stroke-width", "1");

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
    line.setAttribute("stroke-width", "1");

    return linePath;
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
    arc.setAttribute("stroke-width", "1");

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
