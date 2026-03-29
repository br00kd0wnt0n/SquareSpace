// app.js — Main application: state, UI binding, and control logic

// Application State
var state = {
  pattern: 'nine-patch',
  colors: {
    primary: '#c0392b',
    secondary: '#2c3e50',
    accent: '#f39c12',
    background: '#ecf0f1'
  },
  scale: 1.0,
  rotation: 0,
  border: {
    style: 'none',
    width: 0.05,
    color: '#2c3e50'
  },
  patternOptions: {}
};

// Color Presets
var PRESETS = [
  { name: 'Traditional', colors: { primary: '#c0392b', secondary: '#2c3e50', accent: '#f39c12', background: '#ecf0f1' } },
  { name: 'Autumn', colors: { primary: '#d35400', secondary: '#8e3200', accent: '#f4a460', background: '#fdf5e6' } },
  { name: 'Patriotic', colors: { primary: '#b71c1c', secondary: '#1a237e', accent: '#f5f5f5', background: '#e3f2fd' } },
  { name: 'Forest', colors: { primary: '#2e7d32', secondary: '#1b5e20', accent: '#a5d6a7', background: '#f1f8e9' } },
  { name: 'Modern', colors: { primary: '#37474f', secondary: '#78909c', accent: '#ff6f00', background: '#fafafa' } },
  { name: 'Country', colors: { primary: '#795548', secondary: '#4e342e', accent: '#d7ccc8', background: '#efebe9' } },
  { name: 'Winter', colors: { primary: '#1565c0', secondary: '#0d47a1', accent: '#b3e5fc', background: '#e1f5fe' } },
  { name: 'Berry', colors: { primary: '#880e4f', secondary: '#4a148c', accent: '#f48fb1', background: '#fce4ec' } },
  { name: 'Sunset', colors: { primary: '#e65100', secondary: '#bf360c', accent: '#ffcc80', background: '#fff3e0' } },
  { name: 'Ocean', colors: { primary: '#006064', secondary: '#004d40', accent: '#80cbc4', background: '#e0f2f1' } }
];

// DOM Refs
var canvas = document.getElementById('preview-canvas');
var patternSelector = document.getElementById('pattern-selector');
var presetRow = document.getElementById('preset-palettes');
var patternOptionsContainer = document.getElementById('pattern-options');
var patternOptionsSection = document.getElementById('pattern-options-section');
var previewInfo = document.getElementById('preview-info');
var spinner = document.getElementById('export-spinner');

// Render Scheduling
var renderScheduled = false;

function scheduleRender() {
  if (renderScheduled) return;
  renderScheduled = true;
  requestAnimationFrame(function() {
    renderScheduled = false;
    renderPreview(canvas, state);
    updatePreviewInfo();
  });
}

function updatePreviewInfo() {
  var p = PATTERNS[state.pattern];
  previewInfo.textContent = (p ? p.name : state.pattern) + ' — ' + state.scale.toFixed(1) + 'x — ' + state.rotation + '°';
}

// Pattern Selector
function initPatternSelector() {
  var list = getPatternList();
  patternSelector.innerHTML = '';

  list.forEach(function(item) {
    var div = document.createElement('div');
    div.className = 'pattern-thumb' + (item.key === state.pattern ? ' active' : '');
    div.dataset.pattern = item.key;
    div.title = item.name;

    var thumbCanvas = document.createElement('canvas');
    thumbCanvas.width = 80;
    thumbCanvas.height = 80;
    div.appendChild(thumbCanvas);

    var label = document.createElement('span');
    label.className = 'thumb-label';
    label.textContent = item.name;
    div.appendChild(label);

    var thumbCtx = thumbCanvas.getContext('2d');
    var thumbCfg = {
      primary: '#c0392b',
      secondary: '#2c3e50',
      accent: '#f39c12',
      background: '#ecf0f1',
      options: PATTERNS[item.key].defaultOptions
    };
    PATTERNS[item.key].draw(thumbCtx, 0, 0, 80, thumbCfg);

    div.addEventListener('click', function() {
      state.pattern = item.key;
      state.patternOptions = {};
      document.querySelectorAll('.pattern-thumb').forEach(function(el) { el.classList.remove('active'); });
      div.classList.add('active');
      buildPatternOptions();
      scheduleRender();
    });

    patternSelector.appendChild(div);
  });
}

// Color Presets
function initPresets() {
  presetRow.innerHTML = '';
  PRESETS.forEach(function(preset) {
    var btn = document.createElement('button');
    btn.className = 'preset-btn';
    btn.title = preset.name;

    var colorValues = [preset.colors.primary, preset.colors.secondary, preset.colors.accent, preset.colors.background];
    colorValues.forEach(function(color) {
      var swatch = document.createElement('span');
      swatch.className = 'preset-swatch';
      swatch.style.background = color;
      btn.appendChild(swatch);
    });

    var nameEl = document.createElement('span');
    nameEl.className = 'preset-name';
    nameEl.textContent = preset.name;
    btn.appendChild(nameEl);

    btn.addEventListener('click', function() {
      state.colors = {
        primary: preset.colors.primary,
        secondary: preset.colors.secondary,
        accent: preset.colors.accent,
        background: preset.colors.background
      };
      syncColorPickers();
      scheduleRender();
    });

    presetRow.appendChild(btn);
  });
}

// Color Pickers
function syncColorPickers() {
  document.getElementById('color-primary').value = state.colors.primary;
  document.getElementById('color-secondary').value = state.colors.secondary;
  document.getElementById('color-accent').value = state.colors.accent;
  document.getElementById('color-background').value = state.colors.background;
}

function initColorPickers() {
  ['primary', 'secondary', 'accent', 'background'].forEach(function(key) {
    var input = document.getElementById('color-' + key);
    input.addEventListener('input', function(e) {
      state.colors[key] = e.target.value;
      scheduleRender();
    });
  });
}

// Scale Slider
function initScaleSlider() {
  var slider = document.getElementById('scale-slider');
  var valueEl = document.getElementById('scale-value');
  slider.addEventListener('input', function() {
    state.scale = parseFloat(slider.value);
    valueEl.textContent = state.scale.toFixed(1) + 'x';
    scheduleRender();
  });
}

// Rotation Buttons
function initRotationBtns() {
  document.querySelectorAll('.rot-btn').forEach(function(btn) {
    btn.addEventListener('click', function() {
      state.rotation = parseInt(btn.dataset.rot, 10);
      document.querySelectorAll('.rot-btn').forEach(function(b) { b.classList.remove('active'); });
      btn.classList.add('active');
      scheduleRender();
    });
  });
}

// Border Controls
function initBorderControls() {
  document.getElementById('border-style').addEventListener('change', function(e) {
    state.border.style = e.target.value;
    scheduleRender();
  });
  document.getElementById('border-width').addEventListener('input', function(e) {
    state.border.width = parseFloat(e.target.value);
    scheduleRender();
  });
  document.getElementById('border-color').addEventListener('input', function(e) {
    state.border.color = e.target.value;
    scheduleRender();
  });
}

// Pattern-Specific Options
function buildPatternOptions() {
  var p = PATTERNS[state.pattern];
  var defs = p.optionsDef || [];

  if (defs.length === 0) {
    patternOptionsSection.style.display = 'none';
    return;
  }

  patternOptionsSection.style.display = '';
  patternOptionsContainer.innerHTML = '';

  defs.forEach(function(def) {
    var row = document.createElement('div');
    row.className = 'control-row';

    var label = document.createElement('label');
    label.textContent = def.label;
    row.appendChild(label);

    var currentValue = state.patternOptions[def.key] !== undefined
      ? state.patternOptions[def.key]
      : (p.defaultOptions[def.key] !== undefined ? p.defaultOptions[def.key] : def.min);

    if (def.type === 'range') {
      var input = document.createElement('input');
      input.type = 'range';
      input.min = def.min;
      input.max = def.max;
      input.step = def.step;
      input.value = currentValue;
      row.appendChild(input);

      var span = document.createElement('span');
      span.textContent = currentValue;
      row.appendChild(span);

      input.addEventListener('input', function() {
        state.patternOptions[def.key] = parseFloat(input.value);
        span.textContent = input.value;
        scheduleRender();
      });
    }

    patternOptionsContainer.appendChild(row);
  });
}

// Export
function initExport() {
  document.getElementById('export-png').addEventListener('click', function() {
    spinner.classList.remove('hidden');
    exportImage(state, 'png').then(function() {
      spinner.classList.add('hidden');
    }).catch(function(e) {
      alert('Export failed: ' + e.message);
      spinner.classList.add('hidden');
    });
  });

  document.getElementById('export-jpg').addEventListener('click', function() {
    spinner.classList.remove('hidden');
    exportImage(state, 'jpg').then(function() {
      spinner.classList.add('hidden');
    }).catch(function(e) {
      alert('Export failed: ' + e.message);
      spinner.classList.add('hidden');
    });
  });
}

// Window Resize
function initResize() {
  var resizeTimer;
  window.addEventListener('resize', function() {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(scheduleRender, 100);
  });
}

// Init
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
