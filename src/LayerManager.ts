import type { CombinedPath, Layer, ControlState } from "./types";

export function assignLayers(
  paths: CombinedPath[],
  state: ControlState,
  rng: () => number,
): Layer[] {
  const layers: Layer[] = Array.from({ length: state.numLayers }, (_, i) => ({
    index: i,
    label: `Layer ${i + 1}`,
    colour: state.layerColours[i] ?? "#000000",
    visible: state.layerVisibility[i] ?? true,
    paths: [],
  }));

  for (const path of paths) {
    const layerIndex = Math.floor(rng() * state.numLayers);
    const assigned: CombinedPath = { ...path, layerIndex };
    layers[layerIndex].paths.push(assigned);
  }

  return layers;
}

/**
 * Update layer colours and visibility on existing layers without re-generating paths.
 */
export function updateLayerAppearance(
  layers: Layer[],
  state: ControlState,
): Layer[] {
  return layers.map((layer) => ({
    ...layer,
    colour: state.layerColours[layer.index] ?? layer.colour,
    visible: state.layerVisibility[layer.index] ?? layer.visible,
  }));
}
