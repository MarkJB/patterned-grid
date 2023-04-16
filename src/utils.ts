export const joinClosePaths = (outerSVG: SVGSVGElement, threshold: number) => {
  const paths = Array.from(outerSVG.querySelectorAll("path"));

  for (let i = 0; i < paths.length; i++) {
    // console.log("Picking a path");
    for (let j = i + 1; j < paths.length; j++) {
      //   console.log("Comparing to all other paths");
      const path1 = paths[i];
      const path2 = paths[j];

      const path1D = path1.getAttribute("d") as string;
      const path2D = path2.getAttribute("d") as string;

      const path1Start = path1D.split(" ").slice(1, 3);
      const path1End = path1D.split(" ").slice(-2);

      const path2Start = path2D.split(" ").slice(1, 3);
      const path2End = path2D.split(" ").slice(-2);

      const start1 = {
        x: parseFloat(path1Start[0]),
        y: parseFloat(path1Start[1]),
      };
      const end1 = { x: parseFloat(path1End[0]), y: parseFloat(path1End[1]) };
      const start2 = {
        x: parseFloat(path2Start[0]),
        y: parseFloat(path2Start[1]),
      };
      const end2 = { x: parseFloat(path2End[0]), y: parseFloat(path2End[1]) };

      const combinations = [
        { a: start1, b: start2 },
        { a: start1, b: end2 },
        { a: end1, b: start2 },
        { a: end1, b: end2 },
      ];

      for (const combination of combinations) {
        // console.log("Comparing combinations...");
        const dist = Math.hypot(
          combination.a.x - combination.b.x,
          combination.a.y - combination.b.y
        );
        if (threshold >= dist) {
          console.log("too far to join");
        }
        if (dist < threshold) {
          console.log("Found close path ends...");
          path1.setAttribute(
            "d",
            `${path1D} L ${combination.b.x} ${combination.b.y} ${path2D
              .split(" ")
              .slice(3)
              .join(" ")}`
          );
          outerSVG.removeChild(path2);
          paths.splice(j, 1);
          j--;
          break;
        }
      }
    }
  }
};

const webColors: string[] = [
  "red",
  "blue",
  "teal",
  "green",
  "yellow",
  "purple",
  "aqua",
  "fuchsia",
  "lime",
  "maroon",
  "navy",
  "olive",
  "silver",
  "gray",
  "black",
];

export const getRandomColor = (exclude?: string): string => {
  const filteredColors = exclude
    ? webColors.filter((color) => color !== exclude)
    : webColors;
  const randomIndex = Math.floor(Math.random() * filteredColors.length);
  return filteredColors[randomIndex];
};

export const paletteColors: string[] = [
  "black",
  "navy",
  "blue",
  "teal",
  "aqua",
  "teal",
  "blue",
  "navy",
  "black",
];

export const getmColor = (exclude?: string): string => {
  const filteredColors = exclude
    ? webColors.filter((color) => color !== exclude)
    : webColors;
  const randomIndex = Math.floor(Math.random() * filteredColors.length);
  return filteredColors[randomIndex];
};
