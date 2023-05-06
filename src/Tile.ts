import SVG from "svg.js";
import { parseSVG as parsePath } from "svg-path-parser";
import { getColorPallete, getRandomColor } from "./utils";

type LineStartEnd = {
  lineStart: { x: number; y: number };
  lineEnd: { x: number; y: number };
};

interface TileParams {
  element?: SVGElement;
  showArcs?: boolean;
  tileSize?: number;
  numberOfLines?: number;
  linesRandomDirection?: boolean;
  rotation?: number;
  outlineStrokeWeight?: number;
  outlineStrokeColour?: string;
  infillStrokeWeight?: number;
  infillStrokeColour?: string;
}

// Define the Tile class - arcs
class Tile {
  element: SVGElement;
  showArcs: boolean;
  tileSize: number;
  numberOfLines: number;
  linesRandomDirection: boolean;
  rotation: number;
  outlineStrokeWeight: number;
  outlineStrokeColour: string;
  infillStrokeWeight: number;
  infillStrokeColour: string;
  defaultStrokeWeight: number;
  defaultStrokeColour: string;

  constructor({
    showArcs = true,
    tileSize = 100,
    numberOfLines = 10,
    linesRandomDirection = true,
    rotation = 0,
    outlineStrokeWeight = 1,
    outlineStrokeColour = "black",
    infillStrokeWeight = 0,
    infillStrokeColour = "black",
  }: TileParams) {
    this.showArcs = showArcs;
    this.tileSize = tileSize;
    this.numberOfLines = numberOfLines;
    this.linesRandomDirection = linesRandomDirection;
    this.rotation = rotation;
    this.outlineStrokeWeight = outlineStrokeWeight;
    this.outlineStrokeColour = outlineStrokeColour;
    this.infillStrokeWeight = infillStrokeWeight;
    this.infillStrokeColour = infillStrokeColour;
    this.element = this.createTileElement();
    this.defaultStrokeWeight = 2;
    this.defaultStrokeColour = "black";
  }

  createTileElement(): SVGElement {
    const outlineGroup = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "g"
    );
    outlineGroup.setAttribute("class", "tile");

    const infillGroup = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "g"
    );
    infillGroup.setAttribute("class", "tile");

    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("viewBox", "0 0 100 100");
    svg.setAttribute("width", "100");
    svg.setAttribute("height", "100");

    const linesGroup = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "g"
    );
    infillGroup.setAttribute("class", "tile");
    // group.appendChild(linesGroup);

    // Instead of manually specifying the points for each Radii (arcRadii) we can
    // calculate that based on the size of the tile and the number of lines we want

    // Experiment with an offset so we don't always fill the tile
    const calcSpacing = (size: number, qty: number): number[] => {
      const spacing = size / qty;
      console.log(
        "Calc spacing, Tile size",
        size,
        "quantity of lines",
        qty,
        "gap between",
        spacing,
        "Last coord",
        spacing * qty
      );
      let spacingArray = [];
      for (let i = 1; i <= qty; i++) {
        spacingArray.push(i * spacing); // add each position to the array
      }
      return spacingArray;
    };

    let direction: "horizontal" | "vertical";
    if (this.linesRandomDirection) {
      direction = Math.random() < 0.5 ? "horizontal" : "vertical";
    } else {
      direction = "horizontal";
    }
    // const direction = Math.random() < 0.5 ? "horizontal" : "vertical";
    // const direction = "horizontal";

    // Spacing - Calculate the gap between lines for a given tile size and number of lines
    const spacing = calcSpacing(this.tileSize, this.numberOfLines);

    // Infill width should be the difference between the spacing and the outline stroke weight
    const calculatedInfillStrokeWeight = spacing[1] / 2; //+ this.outlineStrokeWeight / 2;
    console.log(
      "Spacing[1]",
      spacing[1],
      "this.outlineStrokeWeight",
      this.outlineStrokeWeight,
      "Calculated infill stroke",
      calculatedInfillStrokeWeight
    );

    // Order matters! SVGs are layered, one thing over another will hide the thing below it.
    // Colour infill lines - Add line that act as coloured in-fill (can't apply fill to an open path)
    for (let i = 0; i < spacing.length; i++) {
      console.log(
        "Getting colour pallete",
        i,
        getColorPallete("ppP50")[i],
        "direction",
        direction,
        "spacing",
        spacing[i]
      );
      const line = this.createPath(
        spacing[i] - calculatedInfillStrokeWeight / 2, // position
        direction,
        calculatedInfillStrokeWeight, // stroke weight
        getColorPallete("ppP50")[i]
      );
      infillGroup.appendChild(line);
    }

    // Draw the 'solid' lines (the primary set of lines - not the in-fill) and add them to the linesGroup
    // The first and last line should be half on or off the tile so things overlap correctly. That means
    // there is one more line than the number specified. The in-fill lines will be the correct number
    // for (const space of spacing) {
    for (let i = 0; i <= spacing.length; i++) {
      let space;
      if (i >= spacing.length) {
        space = 0;
        console.log("Adding the single odd line at", space);
        const line = this.createPath(
          space,
          direction,
          this.outlineStrokeWeight,
          this.outlineStrokeColour
        );
        outlineGroup.appendChild(line);
      } else {
        space = spacing[i];
        console.log("Adding the next line at", space);
        const line = this.createPath(
          space + spacing[0] / 2,
          direction,
          this.outlineStrokeWeight,
          this.outlineStrokeColour
        );
        outlineGroup.appendChild(line);
      }

      console.log("Number of outlines", outlineGroup.children.length);
    }

    // If we are showing arcs on this tile, this is where we add them
    // but also where we shorten the straight lines where they intersect with the largest arc
    if (this.showArcs) {
      const arcCenter = {
        x: 0,
        y: 0,
      };
      console.log("Spacing", spacing);
      const largestSpace = spacing[spacing.length - 1];

      // Convert the linesGroup.lines into an array
      Array.from(outlineGroup.querySelectorAll("path")).forEach((line) => {
        // Extract the line start and end for the current line
        const lineStart = {
          x: parseFloat(line.getAttribute("d")?.split(" ")[1] as string),
          y: parseFloat(line.getAttribute("d")?.split(" ")[2] as string),
        };
        const lineEnd = {
          x: parseFloat(line.getAttribute("d")?.split(" ")[4] as string),
          y: parseFloat(line.getAttribute("d")?.split(" ")[5] as string),
        };

        // console.log("Line start:", lineStart, "Line end:", lineEnd);
        // Determine if there is an intersection for the current line
        const intersection = this.lineArcIntersection(
          lineStart,
          lineEnd,
          largestSpace
        );

        // If there is an intersection for the current line, modify it so the line starts at the intersection
        if (intersection) {
          line.setAttribute(
            "d",
            `M ${intersection.x} ${intersection.y} ${line
              .getAttribute("d")
              ?.split(" ")
              .slice(4, 6)
              .join(" ")}`
          );
        }
      });

      // Arc (curves) in-fill (the coloured arcs as per the coloured in-fill lines)
      for (let i = 0; i < spacing.length; i++) {
        const arc = this.createArc(
          0,
          0,
          spacing[i] - calculatedInfillStrokeWeight / 2,
          0,
          0 + 90,
          this.infillStrokeWeight > calculatedInfillStrokeWeight
            ? this.infillStrokeWeight
            : calculatedInfillStrokeWeight,
          getColorPallete("ppP50")[i] // We will want to switch between a pallete and a single colour at some point - how?
        );
        infillGroup.appendChild(arc);
      }

      // Arcs (curves) primary colour (the solid lines or outlines)
      for (const space of spacing) {
        const arc = this.createArc(
          0,
          0,
          space - this.outlineStrokeWeight / 2,
          0,
          0 + 90,
          this.outlineStrokeWeight,
          this.outlineStrokeColour
        );
        outlineGroup.appendChild(arc);
      }
    }

    linesGroup.appendChild(infillGroup);
    // linesGroup.appendChild(outlineGroup);
    return linesGroup;
  }

  // Maybe the line is causing problem? (I don't seem to be able to join a line to a path so make the lines paths?)
  createPath(
    length: number,
    direction: "horizontal" | "vertical",
    strokeWeight?: number,
    strokeColour?: string
  ): SVGElement {
    console.log(
      "Creating a single path with direction",
      direction,
      "and length",
      length,
      "Stroke-wdith",
      strokeWeight
    );
    const paths = document.createElementNS("http://www.w3.org/2000/svg", "g");
    const pathOffset = 0;

    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    // Horizontal Lines start at x1=0 y1=radius and finish at x2=100, y2=radius
    // Vertical Lines start at x1=radius y1=0 and finish at x2=radius, y2=100
    let d;
    if (direction === "horizontal") {
      d = `M 0 ${length} L 100 ${length}`;
    } else {
      d = `M ${length} 0 L ${length} 100`;
    }

    path.setAttribute("d", d);
    path.setAttribute("stroke", strokeColour || this.defaultStrokeColour);
    path.setAttribute(
      "stroke-width",
      String(strokeWeight) || String(this.defaultStrokeWeight)
    );
    // path.setAttribute("stroke-linecap", "round");
    // path.setAttribute("stroke-linejoin", "round");
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
    endAngle: number,
    strokeWeight?: number,
    strokeColour?: string
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
    arc.setAttribute("stroke", strokeColour || this.defaultStrokeColour);
    arc.setAttribute(
      "stroke-width",
      String(strokeWeight) || String(this.defaultStrokeWeight)
    );

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
