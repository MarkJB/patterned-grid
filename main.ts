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

  createTileElement(): SVGElement {
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("viewBox", "0 0 100 100");
    svg.setAttribute("width", "100");
    svg.setAttribute("height", "100");
    svg.setAttribute("class", "tile");

    const linesGroup = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "g"
    );
    svg.appendChild(linesGroup);

    // Create a mask element
    const maskId = `mask-${Math.random().toString(36).substr(2, 9)}`;
    const mask = document.createElementNS("http://www.w3.org/2000/svg", "mask");
    mask.setAttribute("id", maskId);
    svg.appendChild(mask);

    // Add a white rectangle to the mask to cover the entire tile
    const maskRect = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "rect"
    );
    maskRect.setAttribute("x", "-1");
    maskRect.setAttribute("y", "-1");
    maskRect.setAttribute("width", "102");
    maskRect.setAttribute("height", "102");
    maskRect.setAttribute("fill", "white");
    mask.appendChild(maskRect);

    // Set the mask attribute for the linesGroup using maskId
    linesGroup.setAttribute("mask", `url(#${maskId})`);

    // Create parallel arcs with different radii all starting at the top-left corner
    // const arcRadii = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100];
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
      // Randomly decide the direction for the horizontal lines

      // Add arcs and lines or just lines
      if (this.showArcs) {
        // Add arcs, lines and mask
        const arc = this.createArc(0, 0, radius, 0, 0 + 90);
        svg.appendChild(arc);

        // Create a black-filled arc for the mask
        const maskArc = this.createArc(0, 0, radius, 0, 0 + 90);
        maskArc.setAttribute("fill", "black");
        mask.appendChild(maskArc);

        // Add horizontal lines beyond the arc with the chosen direction
        const lines = this.createHorizontalLine(radius, direction);
        linesGroup.appendChild(lines);
      } else {
        // Add lines only
        const lines = this.createHorizontalLine(radius, direction);
        linesGroup.appendChild(lines);
      }
    }
    svg.style.transform = `rotate(${this.rotation}deg)`;

    return svg;
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

  //   createHorizontalLines(
  //     radius: number,
  //     startY: number,
  //     direction: "left" | "right"
  //   ): SVGElement {
  //     const lines = document.createElementNS("http://www.w3.org/2000/svg", "g");
  //     const lineOffset = 0;

  //     while (startY <= 100) {
  //       const line = document.createElementNS(
  //         "http://www.w3.org/2000/svg",
  //         "line"
  //       );

  //       if (direction === "left") {
  //         line.setAttribute("x1", "0");
  //         line.setAttribute("x2", String(radius - lineOffset));
  //       } else {
  //         line.setAttribute("x1", String(radius + lineOffset));
  //         line.setAttribute("x2", "100");
  //       }

  //       line.setAttribute("y1", String(startY));
  //       line.setAttribute("y2", String(startY));
  //       line.setAttribute("stroke", "black");
  //       line.setAttribute("stroke-width", "2");

  //       lines.appendChild(line);
  //       startY += 10;
  //     }

  //     return lines;
  //   }

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
}

// Create a grid of patterned tiles -asksajjdsj
const grid = document.getElementById("grid");
const numRows = 10;
const numCols = 10;
//   const frequency = Math.random(); // Determines the frequency of the sine wave
//   const amplitude = 1;  // Determines the amplitude of the sine wave

for (let row = 0; row < numRows; row++) {
  for (let col = 0; col < numCols; col++) {
    const rotation = Math.floor(Math.random() * 4) * 90;
    // Calculate the angle for the sine function based on row and column position
    // const angle = Math.floor(2 * Math.PI * frequency * (row + col))
    // Apply the sine function to the angle and scale it by the amplitude
    // const rotation = 90 * Math.round(amplitude * Math.sin(angle))
    const color = `hsl(${(row * 50 + col * 50) % 360}, 60%, 70%)`;

    // Randomly decide whether to show arcs
    const showArcs = Math.random() < 0.5;

    // Add a tile to the grid
    const tile = new Tile(rotation, color, showArcs);
    grid?.appendChild(tile.element);
  }
}

// Create an overlay tile
// const overlayTile = new Tile(0, "rgba(255, 255, 255, 0.5)"); // Semi-transparent white
// overlayTile.element.style.width = "200px";
// overlayTile.element.style.height = "200px";
// overlayTile.element.style.left = "50px";
// overlayTile.element.style.top = "50px";
// overlayTile.element.style.zIndex = "1"; // Set a higher z-index to place it above other tiles
// grid?.appendChild(overlayTile.element);
