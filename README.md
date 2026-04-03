# Patterned Grid

![Example Image](https://github.com/MarkJB/patterned-grid/blob/master/images/example_image.png)

This project started as an early Truchet-style generative art experiment inspired by [Dan Catt](https://github.com/revdancatt), built during the earlier wave of LLM coding assistants (circa 2023/Chat GPT4) where progress was very much a back-and-forth collaboration: prompt, inspect, fix, repeat. The goal was to explore that human-in-the-loop workflow while producing pen-plotter-friendly SVG tile compositions from arcs and lines arranged in a rotated grid, and it now stands as a snapshot of how much more capable LLM-assisted development has become.

## 2026 Copilot Update Status

In 2026, the original experiment was modernized with GitHub Copilot: the codebase is now TypeScript + Vite, generation is modularized (Tile, Grid, PathCombiner, LayerManager, Controls, SvgExporter), randomness is reproducible with seeded generation, paths are combined before layer assignment to reduce pen lifts, and the UI now supports manual regeneration (new seed or same seed), layer colors/visibility, path join tolerance, and SVG export.

## Prerequisites

- Node.js installed locally: https://nodejs.org/en

## Quick Run (No Build Required)

- Live version on Github Pages: https://markjb.github.io/patterned-grid/

- The built version in also in the repo under dist, so you can check out the code and open dist/index.html directly in a browser on your local machine to use the generator without running a build step.

## Development

- Start dev server: `npm run dev`
- Build production bundle: `npm run build`
- Preview production build: `npm run preview`

## GitHub Pages Deployment

This repository now includes a GitHub Actions workflow at .github/workflows/deploy-pages.yml that builds the app and publishes dist to GitHub Pages on every push to main (and via manual workflow dispatch).

One-time setup in GitHub:

- Go to repository Settings -> Pages
- Under Build and deployment, set Source to GitHub Actions

After that, each push to main will automatically deploy a fresh version, so users can open the hosted site without checking out the repo.
