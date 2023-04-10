import Tile from "./Tile";

// Create a grid of patterned tiles
const grid = document.getElementById("grid");
const numRows = 1;
const numCols = 1;

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

    // Randomly decide whether to show arcs (defaults to true)
    // const showArcs = Math.random() < 0.5;

    // Add a tile to the grid (all the work is done in the Tile class)
    const tile = new Tile();
    const tileGroup = tile.element;
    tileGroup.setAttribute(
      "transform",
      `translate(${col * 100} ${row * 100}) rotate(${rotation} 50 50)`
    );

    outerSVG?.appendChild(tileGroup);
  }
}

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
