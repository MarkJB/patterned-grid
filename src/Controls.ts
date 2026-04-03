import type { ControlState } from "./types";
import { DEFAULT_STATE, DEFAULT_LAYER_COLOURS } from "./types";

export class Controls {
  private state: ControlState;
  private panel: HTMLElement;
  private onRegenerate: (state: ControlState) => void;
  private onDownload: (state: ControlState) => void;
  private seedDisplay: HTMLInputElement | null = null;

  constructor(
    panel: HTMLElement,
    onRegenerate: (state: ControlState) => void,
    onDownload: (state: ControlState) => void,
  ) {
    this.panel = panel;
    this.state = {
      ...DEFAULT_STATE,
      layerColours: [...DEFAULT_LAYER_COLOURS],
      layerVisibility: Array(6).fill(true),
    };
    this.onRegenerate = onRegenerate;
    this.onDownload = onDownload;
    this.render();
  }

  getState(): ControlState {
    return { ...this.state };
  }

  /** Call this after generation to display the resolved seed */
  displaySeed(seed: string): void {
    if (this.seedDisplay) this.seedDisplay.value = seed;
    this.state.seed = seed;
  }

  private setState(partial: Partial<ControlState>): void {
    this.state = { ...this.state, ...partial };
  }

  private render(): void {
    this.panel.innerHTML = "";

    // Title
    const title = el("h2", { textContent: "Patterned Grid" });
    this.panel.appendChild(title);

    // --- Grid section ---
    this.panel.appendChild(section("Grid"));
    this.panel.appendChild(
      sliderRow("Rows", this.state.rows, 1, 30, 1, (v) =>
        this.setState({ rows: v }),
      ),
    );
    this.panel.appendChild(
      sliderRow("Cols", this.state.cols, 1, 30, 1, (v) =>
        this.setState({ cols: v }),
      ),
    );

    // --- Tile section ---
    this.panel.appendChild(section("Tile"));
    this.panel.appendChild(
      sliderRow("Lines per tile", this.state.linesPerTile, 1, 20, 1, (v) =>
        this.setState({ linesPerTile: v }),
      ),
    );

    // --- Bias section ---
    this.panel.appendChild(section("Randomness"));
    this.panel.appendChild(
      sliderRow(
        "Arc probability",
        Math.round(this.state.arcProbability * 100),
        0,
        100,
        1,
        (v) => this.setState({ arcProbability: v / 100 }),
        "%",
      ),
    );
    this.panel.appendChild(
      sliderRow(
        "Direction H→V",
        Math.round(this.state.directionBias * 100),
        0,
        100,
        1,
        (v) => this.setState({ directionBias: v / 100 }),
        "%",
      ),
    );
    this.panel.appendChild(
      sliderRow(
        "Rotation bias",
        Math.round(this.state.rotationBias * 100),
        0,
        100,
        1,
        (v) => this.setState({ rotationBias: v / 100 }),
        "%",
      ),
    );

    // --- Layers section ---
    this.panel.appendChild(section("Layers"));
    this.panel.appendChild(this.buildLayersControl());

    // --- View mode section ---
    this.panel.appendChild(section("View"));
    this.panel.appendChild(this.buildViewModeControl());

    // --- Path joining ---
    this.panel.appendChild(section("Path Joining"));
    this.panel.appendChild(this.buildJoinControl());

    // --- Seed ---
    this.panel.appendChild(section("Seed"));
    this.panel.appendChild(this.buildSeedControl());

    // --- Actions ---
    this.panel.appendChild(section(""));
    this.panel.appendChild(this.buildActions());
  }

  private buildLayersControl(): HTMLElement {
    const wrap = el("div", { className: "layers-control" });

    // Number of layers segmented control
    const segWrap = el("div", { className: "seg-control" });
    for (let n = 1; n <= 6; n++) {
      const btn = el("button", {
        textContent: String(n),
        className: this.state.numLayers === n ? "seg-btn active" : "seg-btn",
      }) as HTMLButtonElement;
      btn.addEventListener("click", () => {
        this.setState({ numLayers: n });
        this.renderLayerRows(layerRows);
        segWrap.querySelectorAll(".seg-btn").forEach((b, i) => {
          b.classList.toggle("active", i + 1 === n);
        });
      });
      segWrap.appendChild(btn);
    }
    wrap.appendChild(segWrap);

    // Per-layer rows
    const layerRows = el("div", { className: "layer-rows" });
    this.renderLayerRows(layerRows);
    wrap.appendChild(layerRows);

    return wrap;
  }

  private renderLayerRows(container: HTMLElement): void {
    container.innerHTML = "";
    for (let i = 0; i < this.state.numLayers; i++) {
      const row = el("div", { className: "layer-row" });

      const swatch = el("input") as HTMLInputElement;
      swatch.type = "color";
      swatch.value = this.state.layerColours[i] ?? DEFAULT_LAYER_COLOURS[i];
      swatch.className = "colour-swatch";
      swatch.addEventListener("input", () => {
        const colours = [...this.state.layerColours];
        colours[i] = swatch.value;
        this.setState({ layerColours: colours });
      });

      const label = el("span", {
        textContent: `Layer ${i + 1}`,
        className: "layer-label",
      });

      const eye = el("button", {
        className: this.state.layerVisibility[i]
          ? "eye-btn visible"
          : "eye-btn hidden",
        title: "Toggle visibility",
      }) as HTMLButtonElement;
      eye.innerHTML = this.state.layerVisibility[i] ? eyeIcon() : eyeOffIcon();
      eye.addEventListener("click", () => {
        const vis = [...this.state.layerVisibility];
        vis[i] = !vis[i];
        this.setState({ layerVisibility: vis });
        eye.innerHTML = vis[i] ? eyeIcon() : eyeOffIcon();
        eye.className = vis[i] ? "eye-btn visible" : "eye-btn hidden";
      });

      row.appendChild(swatch);
      row.appendChild(label);
      row.appendChild(eye);
      container.appendChild(row);
    }
  }

  private buildViewModeControl(): HTMLElement {
    const wrap = el("div", { className: "toggle-row" });
    const labelSingle = el("span", {
      textContent: "Single colour",
      className:
        this.state.viewMode === "single" ? "toggle-opt active" : "toggle-opt",
    });
    const labelLayers = el("span", {
      textContent: "Layer colours",
      className:
        this.state.viewMode === "layers" ? "toggle-opt active" : "toggle-opt",
    });

    const toggle = el("label", { className: "switch" });
    const input = el("input") as HTMLInputElement;
    input.type = "checkbox";
    input.checked = this.state.viewMode === "layers";
    const slider = el("span", { className: "slider-thumb" });
    toggle.appendChild(input);
    toggle.appendChild(slider);

    input.addEventListener("change", () => {
      const mode = input.checked ? "layers" : "single";
      this.setState({ viewMode: mode });
      labelSingle.className =
        mode === "single" ? "toggle-opt active" : "toggle-opt";
      labelLayers.className =
        mode === "layers" ? "toggle-opt active" : "toggle-opt";
    });

    wrap.appendChild(labelSingle);
    wrap.appendChild(toggle);
    wrap.appendChild(labelLayers);
    return wrap;
  }

  private buildJoinControl(): HTMLElement {
    const wrap = el("div", { className: "join-control" });

    // Enable toggle
    const enableRow = el("div", { className: "toggle-row" });
    const enableLabel = el("span", { textContent: "Join paths" });
    const enableToggle = el("label", { className: "switch" });
    const enableInput = el("input") as HTMLInputElement;
    enableInput.type = "checkbox";
    enableInput.checked = this.state.joinPaths;
    const enableSliderThumb = el("span", { className: "slider-thumb" });
    enableToggle.appendChild(enableInput);
    enableToggle.appendChild(enableSliderThumb);
    enableInput.addEventListener("change", () => {
      this.setState({ joinPaths: enableInput.checked });
      toleranceRow.style.opacity = enableInput.checked ? "1" : "0.4";
      toleranceRow.style.pointerEvents = enableInput.checked ? "" : "none";
    });
    enableRow.appendChild(enableLabel);
    enableRow.appendChild(enableToggle);
    wrap.appendChild(enableRow);

    // Tolerance slider
    const toleranceRow = sliderRow(
      "Tolerance",
      this.state.joinTolerance,
      0,
      5,
      0.5,
      (v) => this.setState({ joinTolerance: v }),
      " units",
    );
    toleranceRow.style.opacity = this.state.joinPaths ? "1" : "0.4";
    toleranceRow.style.pointerEvents = this.state.joinPaths ? "" : "none";
    wrap.appendChild(toleranceRow);

    return wrap;
  }

  private buildSeedControl(): HTMLElement {
    const wrap = el("div", { className: "seed-control" });
    const input = el("input") as HTMLInputElement;
    input.type = "text";
    input.placeholder = "Leave empty for random";
    input.value = this.state.seed;
    input.className = "seed-input";
    input.addEventListener("input", () => this.setState({ seed: input.value }));
    this.seedDisplay = input;
    wrap.appendChild(input);
    return wrap;
  }

  private buildActions(): HTMLElement {
    const wrap = el("div", { className: "actions" });

    const regenBtn = el("button", {
      textContent: "Regenerate (New Seed)",
      className: "btn-primary",
    }) as HTMLButtonElement;
    regenBtn.addEventListener("click", () => {
      const nextState = this.getState();
      nextState.seed = "";
      this.onRegenerate(nextState);
    });

    const regenSameSeedBtn = el("button", {
      textContent: "Regenerate (Same Seed)",
      className: "btn-secondary",
    }) as HTMLButtonElement;
    regenSameSeedBtn.addEventListener("click", () =>
      this.onRegenerate(this.getState()),
    );

    const downloadBtn = el("button", {
      textContent: "Download SVG",
      className: "btn-secondary",
    }) as HTMLButtonElement;
    downloadBtn.addEventListener("click", () =>
      this.onDownload(this.getState()),
    );

    wrap.appendChild(regenBtn);
    wrap.appendChild(regenSameSeedBtn);
    wrap.appendChild(downloadBtn);
    return wrap;
  }
}

// --- Helpers ---

function el(tag: string, props: Record<string, string> = {}): HTMLElement {
  const e = document.createElement(tag);
  for (const [k, v] of Object.entries(props)) {
    if (k === "textContent") e.textContent = v;
    else if (k === "innerHTML") e.innerHTML = v;
    else e.setAttribute(k === "className" ? "class" : k, v);
  }
  return e;
}

function section(title: string): HTMLElement {
  if (!title) return el("div", { className: "section-spacer" });
  const h = el("h3", { textContent: title, className: "section-title" });
  return h;
}

function sliderRow(
  label: string,
  value: number,
  min: number,
  max: number,
  step: number,
  onChange: (v: number) => void,
  unit: string = "",
): HTMLElement {
  const row = el("div", { className: "slider-row" });

  const labelEl = el("label", {
    textContent: label,
    className: "slider-label",
  });

  const valueEl = el("span", {
    textContent: `${value}${unit}`,
    className: "slider-value",
  });

  const input = el("input") as HTMLInputElement;
  input.type = "range";
  input.min = String(min);
  input.max = String(max);
  input.step = String(step);
  input.value = String(value);
  input.className = "slider";
  input.addEventListener("input", () => {
    const v = parseFloat(input.value);
    valueEl.textContent = `${step < 1 ? v.toFixed(1) : v}${unit}`;
    onChange(v);
  });

  row.appendChild(labelEl);
  row.appendChild(input);
  row.appendChild(valueEl);
  return row;
}

function eyeIcon(): string {
  return `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>`;
}

function eyeOffIcon(): string {
  return `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>`;
}
