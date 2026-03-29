// renderer.js — Canvas rendering pipeline (SQUARE output)

function render(ctx, size, state) {
  var pattern = state.pattern;
  var colors = state.colors;
  var scale = state.scale;
  var rotation = state.rotation;
  var border = state.border;
  var patternDef = PATTERNS[pattern];
  if (!patternDef) return;

  ctx.save();
  ctx.clearRect(0, 0, size, size);

  // Fill background
  ctx.fillStyle = colors.background;
  ctx.fillRect(0, 0, size, size);

  // Calculate block size: at scale 1.0, fit 3 columns
  var baseBlockSize = size / 3;
  var blockSize = baseBlockSize / scale;
  var count = Math.ceil(size / blockSize) + 1;

  // Apply rotation around center
  if (rotation !== 0) {
    var cx = size / 2;
    var cy = size / 2;
    ctx.translate(cx, cy);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.translate(-cx, -cy);
  }

  // Extra margin for rotated tiling
  var extraMargin = rotation % 90 !== 0 ? blockSize * 2 : 0;
  var startX = -extraMargin;
  var startY = -extraMargin;
  var totalCount = count + (extraMargin > 0 ? 4 : 0);

  // Build config for pattern
  var cfg = {
    primary: colors.primary,
    secondary: colors.secondary,
    accent: colors.accent,
    background: colors.background,
    options: {}
  };
  // Merge default options with current options
  var defOpts = patternDef.defaultOptions;
  for (var k in defOpts) {
    if (defOpts.hasOwnProperty(k)) cfg.options[k] = defOpts[k];
  }
  var curOpts = state.patternOptions;
  for (var k2 in curOpts) {
    if (curOpts.hasOwnProperty(k2)) cfg.options[k2] = curOpts[k2];
  }

  // Draw tiled pattern (square grid)
  for (var r = 0; r < totalCount; r++) {
    for (var c = 0; c < totalCount; c++) {
      var bx = startX + c * blockSize;
      var by = startY + r * blockSize;
      patternDef.draw(ctx, bx, by, blockSize, cfg);
    }
  }

  // Draw border
  if (border.style !== 'none') {
    drawBorder(ctx, size, border, colors);
  }

  ctx.restore();
}

function drawBorder(ctx, size, border, colors) {
  var bw = Math.round(size * border.width);

  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0);

  if (border.style === 'sashing') {
    ctx.fillStyle = border.color;
    ctx.fillRect(0, 0, size, bw);
    ctx.fillRect(0, size - bw, size, bw);
    ctx.fillRect(0, 0, bw, size);
    ctx.fillRect(size - bw, 0, bw, size);
  } else if (border.style === 'cornerstone') {
    ctx.fillStyle = border.color;
    ctx.fillRect(0, 0, size, bw);
    ctx.fillRect(0, size - bw, size, bw);
    ctx.fillRect(0, 0, bw, size);
    ctx.fillRect(size - bw, 0, bw, size);
    ctx.fillStyle = colors.accent;
    ctx.fillRect(0, 0, bw, bw);
    ctx.fillRect(size - bw, 0, bw, bw);
    ctx.fillRect(0, size - bw, bw, bw);
    ctx.fillRect(size - bw, size - bw, bw, bw);
  } else if (border.style === 'sawtooth-border') {
    ctx.fillStyle = border.color;
    ctx.fillRect(0, 0, size, bw);
    ctx.fillRect(0, size - bw, size, bw);
    ctx.fillRect(0, 0, bw, size);
    ctx.fillRect(size - bw, 0, bw, size);

    var toothSize = bw * 0.6;
    var teeth = Math.floor(size / (toothSize * 2));
    ctx.fillStyle = colors.accent;

    for (var i = 0; i < teeth; i++) {
      var tx = i * toothSize * 2 + toothSize / 2;
      ctx.beginPath();
      ctx.moveTo(tx, bw);
      ctx.lineTo(tx + toothSize, bw);
      ctx.lineTo(tx + toothSize / 2, 0);
      ctx.closePath();
      ctx.fill();
    }
    for (var j = 0; j < teeth; j++) {
      var tx2 = j * toothSize * 2 + toothSize / 2;
      ctx.beginPath();
      ctx.moveTo(tx2, size - bw);
      ctx.lineTo(tx2 + toothSize, size - bw);
      ctx.lineTo(tx2 + toothSize / 2, size);
      ctx.closePath();
      ctx.fill();
    }
  }

  ctx.restore();
}

function renderPreview(canvas, state) {
  var panel = document.getElementById('preview-panel');
  var wrapper = document.getElementById('canvas-wrapper');
  var dpr = window.devicePixelRatio || 1;

  // Compute largest square that fits in the panel
  var availW = panel.clientWidth - 48;
  var availH = panel.clientHeight - 48;
  var size = Math.min(availW, availH, 500);
  if (size < 100) size = 100;

  // Set wrapper and canvas to exact square pixels
  wrapper.style.width = size + 'px';
  wrapper.style.height = size + 'px';
  canvas.style.width = size + 'px';
  canvas.style.height = size + 'px';
  canvas.width = size * dpr;
  canvas.height = size * dpr;

  var ctx = canvas.getContext('2d');
  ctx.scale(dpr, dpr);

  render(ctx, size, state);
}
