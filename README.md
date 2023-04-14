# Generative Art Experiment

## Repeating patterned tiles in a grid

![Example Image](https://github.com/MarkJB/patterned-grid/blob/master/images/example_image.png)

Experiment using ChatGPT (Started with GPT4, but ran up against the limits, wasn't perfect and needed some fixes, and there are some glitches that need addressing switched to GPT3.5, but that introduced a lot of problems so fixed manually).

Tiles consist of SVG arcs and lines or just lines. The tiles vary the direction of the lines (either vertical or horizontal) and then the whole tile is rotated at random and layed out in a grid.

This is an attempt at reproducing generative art created by [Dan Catt](https://github.com/revdancatt)

## Prerequisites

Nothing special required to run the example, but you'll need a working [nodejs install](https://nodejs.org/en) if you want to modify the code

## Running

The resulting js has been comitted so this should run simply by opening index.html in a browser.

Refresh the browser to generate a new version of the image.

## Development

This should work with hot-reload and auto compile by running `npm run start`

Build a new bundle (for those who do not want to run the dev stuff) with `npm run build` and commit the new bundle.js. Then the static HTML should run as is without any dependencies.
