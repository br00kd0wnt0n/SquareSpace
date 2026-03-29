// app.js — Main application: state, UI binding, and control logic

import { PATTERNS, getPatternList } from './patterns.js?v=2';
import { renderPreview } from './renderer.js?v=2';
import { exportImage } from './export.js?v=2';

// ─── Application State ────────────────────────────────────────

const state = {
  pattern: 'nine-patch',
  colors: {
    primary: '#c0392b',
    secondary: '#2c3e50',
    accent: '#f39c12',
    background: '#ecf0f1',
  },
  scale: 1.0,
  rotation: 0,
  border: {
    style: 'none',
    width: 0.05,
    color: '#2c3e50',
  },
  patternOptions: {},
};

// ─── Color Presets ─────────────────────────────────────────────

const PRESETS = [
  { name: 'Traditional', colors: { primary: '#c0392b', secondary: '#2c3e50', accent: '#f39c12', background: '#ecf0f1' } },
  { name: 'Autumn', colors: { primary: '#d35400', secondary: '#8e3200', accent: '#f4a460', background: '#fdf5e6' } },
  { name: 'Patriotic', colors: { primary: '#b71c1c', secondary: '#1a237e', accent: '#f5f5f5', background: '#e3f2fd' } },
  { name: 'Forest', colors: { primary: '#2e7d32', secondary: '#1b5e20', accent: '#a5d6a7', background: '#f1f8e9' } },
  { name: 'Modern', colors: { primary: '#37474f', secondary: '#78909c', accent: '#ff6f00', background: '#fafafa' } },
  { name: 'Country', colors: { primary: '#795548', secondary: '#4e342e', accent: '#d7ccc8', background: '#efebe9' } },
  { name: 'Winter', colors: { primary: '#1565c0', secondary: '#0d47a1', accent: '#b3e5fc', background: '#e1f5fe' } },
  { name: 'Berry', colors: { primary: '#880e4f', secondary: '#4a148c', accent: '#f48fb1', background: '#fce4ec' } },
  { name: 'Sunset', colors: { primary: '#e65100', secondary: '#bf360c', accent: '#ffcc80', background: '#fff3e0' } },
  { name: 'Ocean', colors: { primary: '#006064', secondary: '#004d40', accent: '#80cbc4', background: '#e0f2f1' } },
];

// ─── DOM Refs ──────────────────────────────────────────────────

const canvas = document.getElementById('preview-canvas');
const patternSelector = document.getElementById('pattern-selector');
const presetRow = document.getElementById('preset-palettes');
const patternOptionsContainer = document.getElementById('pattern-options');
const patternOptionsSection = document.getElementById('pattern-options-section');
const previewInfo = document.getElementById('preview-info');
const spinner = document.getElementById('export-spinner');

// ─── Render Scheduling ────────────────────────────────────────

let renderScheduled = false;

function scheduleRender() {
  if (renderScheduled) return;
  renderScheduled = true;
  requestAnimationFrame(() => {
    renderScheduled = false;
    renderPreview(canvas, state);
    updatePreviewInfo();
  });
}

function updatePreviewInfo() {
  const p = PATTERNS[state.pattern];
  previewInfo.textContent = `${p ? p.name : state.pattern} — ${state.scale.toFixed(1)}x — ${state.rotation}°`;
}

// ─── Pattern Selector (thumbnails) ─────────────────────────────

function initPatternSelector() {
  const list = getPatternList();
  patternSelector.innerHTML = '';

  list.forEach(({ key, name }) => {
    const div = document.createElement('div');
    div.className = `pattern-thumb${key === state.pattern ? ' active' : ''}`;
    div.dataset.pattern = key;
    div.title = name;

    const thumbCanvas = document.createElement('canvas');
    thumbCanvas.width = 80;
    thumbCanvas.height = 80;
    div.appendChild(thumbCanvas);

    const label = document.createElement('span');
    label.className = 'thumb-label';
    label.textContent = name;
    div.appendChild(label);

    // Draw thumbnail
    const thumbCtx = thumbCanvas.getContext('2d');
    const thumbCfg = {
      primary: '#c0392b',
      secondary: '#2c3e50',
      accent: '#f39c12',
      background: '#ecf0f1',
      options: PATTERNS[key].defaultOptions,
    };
    PATTERNS[key].draw(thumbCtx, 0, 0, 80, thumbCfg);

    div.addEventListener('click', () => {
      state.pattern = key;
      state.patternOptions = {};
      document.querySelectorAll('.pattern-thumb').forEach(el => el.classList.remove('active'));
      div.classList.add('active');
      buildPatternOptions();
      scheduleRender();
    });

    patternSelector.appendChild(div);
  });
}

// ─── Color Presets ─────────────────────────────────────────────

function initPresets() {
  presetRow.innerHTML = '';
  PRESETS.forEach(preset => {
    const btn = document.createElement('button');
    btn.className = 'preset-btn';
    btn.title = preset.name;

    Object.values(preset.colors).forEach(color => {
      const swatch = document.createElement('span');
      swatch.className = 'preset-swatch';
      swatch.style.background = color;
      btn.appendChild(swatch);
    });

    const nameEl = document.createElement('span');
    nameEl.className = 'preset-name';
    nameEl.textContent = preset.name;
    btn.appendChild(nameEl);

    btn.addEventListener('click', () => {
      state.colors = { ...preset.colors };
      syncColorPickers();
      scheduleRender();
    });

    presetRow.appendChild(btn);
  });
}

// ─── Color Pickers ─────────────────────────────────────────────

function syncColorPickers() {
  document.getElementById('color-primary').value = state.colors.primary;
  document.getElementById('color-secondary').value = state.colors.secondary;
  document.getElementById('color-accent').value = state.colors.accent;
  document.getElementById('color-background').value = state.colors.background;
}

function initColorPickers() {
  ['primary', 'secondary', 'accent', 'background'].forEach(key => {
    const input = document.getElementById(`color-${key}`);
    input.addEventListener('input', (e) => {
      state.colors[key] = e.target.value;
      scheduleRender();
    });
  });
}

// ─── Scale Slider ──────────────────────────────────────────────

function initScaleSlider() {
  const slider = document.getElementById('scale-slider');
  const valueEl = document.getElementById('scale-value');
  slider.addEventListener('input', () => {
    state.scale = parseFloat(slider.value);
    valueEl.textContent = state.scale.toFixed(1) + 'x';
    scheduleRender();
  });
}

// ─── Rotation Buttons ──────────────────────────────────────────

function initRotationBtns() {
  document.querySelectorAll('.rot-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      state.rotation = parseInt(btn.dataset.rot, 10);
      document.querySelectorAll('.rot-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      scheduleRender();
    });
  });
}

// ─── Border Controls ───────────────────────────────────────────

function initBorderControls() {
  document.getElementById('border-style').addEventListener('change', (e) => {
    state.border.style = e.target.value;
    scheduleRender();
  });
  document.getElementById('border-width').addEventListener('input', (e) => {
    state.border.width = parseFloat(e.target.value);
    scheduleRender();
  });
  document.getElementById('border-color').addEventListener('input', (e) => {
    state.border.color = e.target.value;
    scheduleRender();
  });
}

// ─── Pattern-Specific Options ──────────────────────────────────

function buildPatternOptions() {
  const p = PATTERNS[state.pattern];
  const defs = p.optionsDef || [];

  if (defs.length === 0) {
    patternOptionsSection.style.display = 'none';
    return;
  }

  patternOptionsSection.style.display = '';
  patternOptionsContainer.innerHTML = '';

  defs.forEach(def => {
    const row = document.createElement('div');
    row.className = 'control-row';

    const label = document.createElement('label');
    label.textContent = def.label;
    row.appendChild(label);

    const currentValue = state.patternOptions[def.key] ?? p.defaultOptions[def.key] ?? def.min;

    if (def.type === 'range') {
      const input = document.createElement('input');
      input.type = 'range';
      input.min = def.min;
      input.max = def.max;
      input.step = def.step;
      input.value = currentValue;
      row.appendChild(input);

      const span = document.createElement('span');
      span.textContent = currentValue;
      row.appendChild(span);

      input.addEventListener('input', () => {
        state.patternOptions[def.key] = parseFloat(input.value);
        span.textContent = input.value;
        scheduleRender();
      });
    }

    patternOptionsContainer.appendChild(row);
  });
}

// ─── Export ────────────────────────────────────────────────────

function initExport() {
  document.getElementById('export-png').addEventListener('click', async () => {
    spinner.classList.remove('hidden');
    try {
      await exportImage(state, 'png');
    } catch (e) {
      alert('Export failed: ' + e.message);
    } finally {
      spinner.classList.add('hidden');
    }
  });

  document.getElementById('export-jpg').addEventListener('click', async () => {
    spinner.classList.remove('hidden');
    try {
      await exportImage(state, 'jpg');
    } catch (e) {
      alert('Export failed: ' + e.message);
    } finally {
      spinner.classList.add('hidden');
    }
  });
}

// ─── Window Resize ─────────────────────────────────────────────

function initResize() {
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(scheduleRender, 100);
  });
}

// ─── Init ──────────────────────────────────────────────────────

function init() {
  initPatternSelector();
  initPresets();
  initColorPickers();
  initScaleSlider();
  initRotationBtns();
  initBorderControls();
  buildPatternOptions();
  initExport();
  initResize();
  scheduleRender();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
