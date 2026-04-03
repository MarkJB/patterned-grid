export function downloadSvg(svgEl: SVGSVGElement): void {
  // Ensure the Inkscape namespace is present on the root element
  svgEl.setAttribute(
    "xmlns:inkscape",
    "http://www.inkscape.org/namespaces/inkscape",
  );

  const svgData = new XMLSerializer().serializeToString(svgEl);
  const blob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = "generated-image.svg";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
