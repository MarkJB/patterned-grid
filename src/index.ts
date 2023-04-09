import SVG from "svg.js";
// const SVG = require("svg.js");
import { parseSVG as parsePath } from "svg-path-parser";
// const parsePath = require("svg-path-parser").parseSVG();

// Define the Tile class - arcs
class Tile {
  element: SVGElement;
  rotation: number;
  color: string;
  showArcs: boolean;

  constructor(rotation: number, color: string, showArcs: boolean) {
    this.rotation = rotation;
    this.color = color;
    this.showArcs = showArcs;
    this.element = this.createTileElement();
  }

  addToGrid(x: number, y: number): void {
    this.element.setAttribute(
      "transform",
      `translate(${x}, ${y}) rotate(${this.rotation})`
    );
  }

  createTileElement(): SVGElement {
    const group = document.createElementNS("http://www.w3.org/2000/svg", "g");
    group.setAttribute("class", "tile");
    group.setAttribute(
      "transform",
      `translate(${this.rotation}, ${this.rotation}) rotate(${this.rotation})`
    );

    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("viewBox", "0 0 100 100");
    svg.setAttribute("width", "100");
    svg.setAttribute("height", "100");

    const linesGroup = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "g"
    );
    group.appendChild(linesGroup);

    // // Create a mask element
    // const maskId = `mask-${Math.random().toString(36).substr(2, 9)}`;
    // const mask = document.createElementNS("http://www.w3.org/2000/svg", "mask");
    // mask.setAttribute("id", maskId);
    // group.appendChild(mask);

    // // Add a white rectangle to the mask to cover the entire tile
    // const maskRect = document.createElementNS(
    //   "http://www.w3.org/2000/svg",
    //   "rect"
    // );
    // maskRect.setAttribute("x", "-1");
    // maskRect.setAttribute("y", "-1");
    // maskRect.setAttribute("width", "102");
    // maskRect.setAttribute("height", "102");
    // maskRect.setAttribute("fill", "white");
    // mask.appendChild(maskRect);

    // // Set the mask attribute for the linesGroup using maskId
    // linesGroup.setAttribute("mask", `url(#${maskId})`);

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

    // Create a new SVG container for the boolean operation
    const draw = SVG("svg-container").size("100%", "100%");

    for (const radius of calcRadii(100, 10)) {
      // ... (no changes to the start of the loop)

      // Add horizontal lines beyond the arc with the chosen direction
      const lines = this.createHorizontalLine(radius, direction);

      // Perform the subtraction operation
      if (this.showArcs) {
        const arc = this.createArc(0, 0, radius, 0, 0 + 90);

        const arcPath = arc.getAttribute("d");
        const arcSegment = parsePath(arcPath as string)[1];

        let xCoord: number;
        let rxCoord: number;
        if (arcSegment.code.toUpperCase() === "H") {
          console.log(arcSegment);
          if ("x" in arcSegment){xCoord = arcSegment.x;}
          
        } else if (arcSegment.code.toUpperCase() === "V") {
          console.log(arcSegment);
          if ("y" in arcSegment){xCoord = arcSegment.y;}
        } else if (arcSegment.code.toUpperCase() === "A") {
          console.log(arcSegment);
          if ("rx" in arcSegment){rxCoord = arcSegment.rx;}
        } else {
          console.log(arcSegment);
          throw new Error(`Unexpected command type: ${arcSegment.command}`);
        }

        // Remove the line segment that is behind the arc
        const filteredLines = lines.querySelectorAll("line").forEach((line) => {
          const x1 = parseFloat(line.getAttribute("x1") as string);
          const x2 = parseFloat(line.getAttribute("x2") as string);

          if (
            direction === "horizontal" &&
            x1 >= xCoord &&
            x2 <= xCoord + rxCoord
          ) {
            return;
          }

          linesGroup.appendChild(line);
        });
      } else {
        linesGroup.appendChild(lines);
      }
    }

    // for (const radius of calcRadii(100, 10)) {
    //   // Randomly decide the direction for the horizontal lines

    //   // Add arcs and lines or just lines
    //   if (this.showArcs) {
    //     // Add arcs, lines and mask
    //     const arc = this.createArc(0, 0, radius, 0, 0 + 90);
    //     group.appendChild(arc);

    //     // Create a black-filled arc for the mask
    //     const maskArc = this.createArc(0, 0, radius, 0, 0 + 90);
    //     maskArc.setAttribute("fill", "black");
    //     mask.appendChild(maskArc);

    //     // // Add horizontal lines beyond the arc with the chosen direction
    //     // const lines = this.createHorizontalLine(radius, direction);
    //     // linesGroup.appendChild(lines);
    //     // Add horizontal lines beyond the arc with the chosen direction
    //     const lines = this.createHorizontalLine(radius, direction);
    //     const lineSVG = draw.svg(lines.outerHTML);

    //     // Perform the subtraction operation
    //     const newPathId = this.generateUniqueId("new-path");
    //     const newPath = draw.subtract(lineSVG, arc).id(newPathId);
    //     linesGroup.appendChild(newPath.node);
    //   } else {
    //     // Add lines only
    //     const lines = this.createHorizontalLine(radius, direction);
    //     linesGroup.appendChild(lines);
    //   }
    // }
    // group.style.transform = `rotate(${this.rotation}deg)`
    // group.setAttribute("transform", `rotate($this.rotation})`);

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

  generateUniqueId(prefix: string): string {
    return `${prefix}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Create a grid of patterned tiles -asksajjdsj
const grid = document.getElementById("grid");
const numRows = 2;
const numCols = 2;

const outerSVG = document.createElementNS("http://www.w3.org/2000/svg", "svg");
outerSVG.setAttribute("viewBox", `0 0 ${numCols * 100} ${numRows * 100}`);
outerSVG.setAttribute("width", "100%");
outerSVG.setAttribute("height", "100%");
outerSVG.setAttribute("xmlns", "http://www.w3.org/2000/svg");
grid?.appendChild(outerSVG);

// Loop to add tiles to a grid
for (let row = 0; row < numRows; row++) {
  for (let col = 0; col < numCols; col++) {
    const rotation = Math.floor(Math.random() * 4) * 90;
    const color = `hsl(${(row * 50 + col * 50) % 360}, 60%, 70%)`;

    // Randomly decide whether to show arcs
    const showArcs = Math.random() < 0.5;

    // Add a tile to the grid
    const tile = new Tile(rotation, color, showArcs);
    const tileGroup = tile.element;
    tileGroup.setAttribute(
      "transform",
      `translate(${col * 100} ${row * 100}) rotate(${rotation} 50 50)`
    );

    outerSVG?.appendChild(tileGroup);
  }
}

// SVG Export
const downloadButton = document.getElementById("download-svg");

if (downloadButton) {
  downloadButton.addEventListener("click", () => {
    // Serialize the outerSVG element
    const svgData = new XMLSerializer().serializeToString(outerSVG);

    // Create a Blob and a URL for the SVG data
    const svgBlob = new Blob([svgData], {
      type: "image/svg+xmlcharset=utf-8",
    });
    const svgUrl = URL.createObjectURL(svgBlob);

    // Create a download link, set its href and download attributes, and trigger a click event
    const downloadLink = document.createElement("a");
    downloadLink.href = svgUrl;
    downloadLink.download = "generated-image.svg";
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  });
}

export default Tile;
