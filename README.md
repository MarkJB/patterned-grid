# Generative Art Experiment

## Repeating patterned tiles in a grid

![Example Image](https://github.com/MarkJB/patterned-grid/blob/master/images/example_image.png)

Experiment using ChatGPT4. Most of the weird glitches I had to fix manually, some in conjunction with ChatGPT.

Tiles consist of SVG arcs and lines or just lines. The tiles vary the direction of the lines (either vertical or horizontal) and then the whole tile is rotated at random and layed out in a grid.

This is an attempt at reproducing generative art created by [Dan Catt](https://github.com/revdancatt). Why? Because I like the style and I wanted to see if I could reproduce it as technical challenge, a chance to understand the limits of ChatGPT and because I like the asthetic and wanted to plot some myself.

### ChatGPT4 conclusion

ChatGPT4 includes a lot of ommisions and mistakes when generating Typescript code. It helps if you have a reasonable understanding of the language you are using so you can spot and fix errors. ChatGPT is hit and miss when it comes to helping you fix errors. Sometimes you can end up in a circular conversation (fixing one error but introducing a previous error and so on), but it's also very good at explaining stuff with context (mostly correct) so its a good way to quickly learn without having to spend days reading documentation and going down blind alleys that can waste a lot of time. Its a bit like pair programming with someone who doesn't judge your lack of ability 😁

## Prerequisites

Nothing special required to run the example, but you'll need a working [nodejs install](https://nodejs.org/en) if you want to build or modify the code

## Running

The resulting js has been comitted so this should run simply by opening index.html in a browser.

Refresh the browser to generate a new version of the image.

## Development

This should work with hot-reload and auto compile by running `npm run start`

To update the static version, build a new bundle with `npm run build` and commit the new bundle.js.
