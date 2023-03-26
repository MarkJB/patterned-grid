# Generative Art Experiment
## Repeating patterned tiles in a grid

![Example Image](https://github.com/MarkJB/patterned-grid/blob/master/images/mostly-working-example-001.png)

Experiment using ChatGPT (Started with GPT4, but ran up against the limits, wasn't perfect and needed some fixes, and there are some glitches that need addressing switched to GPT3.5, but that introduced a lot of problems so fixed manually).

Tiles consist of SVG arcs and lines or just lines. The tiles vary the direction of the lines (either vertical or horizontal) and then the whole tile is rotated at random and layed out in a grid.

This is an attempt at reproducing generative art created by [Dan Catt](https://github.com/revdancatt)

## Prerequisites

Nothing special required to run the example, but you'll need a working [nodejs install](https://nodejs.org/en) if you want to modify the code

## Running

The resulting js has been comitted so this should run simply by opening index.html in a browser.

## Development

You'll need to complile the typescript source into js:

Install tsc with `npm install -g tsc`

Run `tsc --watch` to compile any changed you make to the `main.ts` file.

Run `npx http-server .` to serve the files in a browser. Open a browser to the address suggested by the output of that command (e.g. http://127.0.0.1:8080). 

Refresh the browser to generate a new version of the image.
