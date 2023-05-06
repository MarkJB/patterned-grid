import Tile from "./Tile";
import { getRandomColor, joinClosePaths } from "./utils";

// Create a grid of patterned tiles
const grid = document.getElementById("grid");
const numRows = 10;
const numCols = 10;

const outerSVG = document.createElementNS("http://www.w3.org/2000/svg", "svg");
outerSVG.setAttribute("viewBox", `0 0 ${numCols * 100} ${numRows * 100}`);
outerSVG.setAttribute("width", "100%");
outerSVG.setAttribute("height", "100%");
outerSVG.setAttribute("xmlns", "http://www.w3.org/2000/svg");
grid?.appendChild(outerSVG);

// Create the background rect element
const backgroundRect = document.createElementNS(
  "http://www.w3.org/2000/svg",
  "rect"
);
backgroundRect.setAttribute("width", "100%");
backgroundRect.setAttribute("height", "100%");

const backgroundColour = getRandomColor();
backgroundRect.setAttribute("fill", "white");

// Add the background rect to the SVG
outerSVG.appendChild(backgroundRect);
// outerSVG.setAttribute("")
// const strokeColour = getRandomColor(backgroundColour);
// const strokeWeight = Math.floor(Math.random() * 8) + 1;
// Loop to add tiles to a grid
for (let row = 0; row < numRows; row++) {
  for (let col = 0; col < numCols; col++) {
    // Chose a random rotation for the tile (constrained to 0, 90, 180 & 270)
    const rotation = Math.floor(Math.random() * 4) * 90;
    // const rotation = 90;

    // Randomly decide whether to show arcs (defaults to true)
    const showArcs = Math.random() < 0.5;
    // const showArcs = false;

    // Add a tile to the grid (all the work is done in the Tile class)
    const tile = new Tile({
      showArcs,
      rotation,
      linesRandomDirection: false,
      numberOfLines: 7,
      outlineStrokeWeight: 4,
      outlineStrokeColour: "black",
      infillStrokeWeight: 8,
    });
    // Define the SVG element using the tile content
    const tileGroup = tile.element;
    // Apply a grid offset and rotation to the tile
    // tileGroup.setAttribute(
    //   "transform",
    //   `translate(${col * 100} ${row * 100}) rotate(${rotation} 50 50)`
    // );
    // Append the SVG element 'tileGroup' to the SVG
    // outerSVG?.appendChild(tileGroup);
    // Iterate through the children of tileGroup and append them directly to outerSVG
    while (tileGroup.firstChild) {
      const child = tileGroup.firstChild;
      // Check if the child is an SVGElement
      if (child instanceof SVGElement) {
        // Apply a grid offset and rotation to the child element
        child.setAttribute(
          "transform",
          `translate(${col * 100} ${row * 100}) rotate(${rotation} 50 50)`
        );
      }
      outerSVG?.appendChild(child);
    }
  }
}

// joinClosePaths(outerSVG, 5); // Add this line after creating the grid

// SVG Export (Save (Download) an SVG when the download button is clicked)
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

// export default Tile;
