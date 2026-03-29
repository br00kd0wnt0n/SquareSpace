// renderer.js — Canvas rendering pipeline

import { PATTERNS } from './patterns.js';

export function render(ctx, width, height, state) {
  const { pattern, colors, scale, rotation, border } = state;
  const patternDef = PATTERNS[pattern];
  if (!patternDef) return;

  ctx.save();
  ctx.clearRect(0, 0, width, height);

  // Fill background
  ctx.fillStyle = colors.background;
  ctx.fillRect(0, 0, width, height);

  // Calculate block size: at scale 1.0, fit 3 columns
  const baseBlockSize = width / 3;
  const blockSize = baseBlockSize / scale;
  const cols = Math.ceil(width / blockSize) + 1;
  const rows = Math.ceil(height / blockSize) + 1;

  // Apply rotation around center
  if (rotation !== 0) {
    const cx = width / 2;
    const cy = height / 2;
    ctx.translate(cx, cy);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.translate(-cx, -cy);
  }

  // Calculate offset to center the tiling when rotated
  const extraMargin = rotation % 90 !== 0 ? blockSize * 2 : 0;
  const startX = -extraMargin;
  const startY = -extraMargin;
  const totalCols = cols + (extraMargin > 0 ? 4 : 0);
  const totalRows = rows + (extraMargin > 0 ? 4 : 0);

  // Build config for pattern
  const cfg = {
    primary: colors.primary,
    secondary: colors.secondary,
    accent: colors.accent,
    background: colors.background,
    options: { ...patternDef.defaultOptions, ...state.patternOptions }
  };

  // Draw tiled pattern
  for (let r = 0; r < totalRows; r++) {
    for (let c = 0; c < totalCols; c++) {
      const bx = startX + c * blockSize;
      const by = startY + r * blockSize;
      patternDef.draw(ctx, bx, by, blockSize, cfg);
    }
  }

  // Draw border
  if (border.style !== 'none') {
    drawBorder(ctx, width, height, border, colors);
  }

  ctx.restore();
}

function drawBorder(ctx, w, h, border, colors) {
  const bw = Math.round(w * border.width);

  ctx.save();
  // Reset transform for border (draw on top of everything)
  ctx.setTransform(1, 0, 0, 1, 0, 0);

  if (border.style === 'sashing') {
    ctx.fillStyle = border.color;
    ctx.fillRect(0, 0, w, bw);           // top
    ctx.fillRect(0, h - bw, w, bw);       // bottom
    ctx.fillRect(0, 0, bw, h);           // left
    ctx.fillRect(w - bw, 0, bw, h);       // right
  } else if (border.style === 'cornerstone') {
    ctx.fillStyle = border.color;
    ctx.fillRect(0, 0, w, bw);
    ctx.fillRect(0, h - bw, w, bw);
    ctx.fillRect(0, 0, bw, h);
    ctx.fillRect(w - bw, 0, bw, h);
    // Corner squares in accent color
    ctx.fillStyle = colors.accent;
    ctx.fillRect(0, 0, bw, bw);
    ctx.fillRect(w - bw, 0, bw, bw);
    ctx.fillRect(0, h - bw, bw, bw);
    ctx.fillRect(w - bw, h - bw, bw, bw);
  } else if (border.style === 'sawtooth-border') {
    ctx.fillStyle = border.color;
    ctx.fillRect(0, 0, w, bw);
    ctx.fillRect(0, h - bw, w, bw);
    ctx.fillRect(0, 0, bw, h);
    ctx.fillRect(w - bw, 0, bw, h);

    const toothSize = bw * 0.6;
    const teeth = Math.floor(w / (toothSize * 2));
    ctx.fillStyle = colors.accent;

    // Top teeth
    for (let i = 0; i < teeth; i++) {
      const tx = i * toothSize * 2 + toothSize / 2;
      ctx.beginPath();
      ctx.moveTo(tx, bw);
      ctx.lineTo(tx + toothSize, bw);
      ctx.lineTo(tx + toothSize / 2, 0);
      ctx.closePath();
      ctx.fill();
    }
    // Bottom teeth
    for (let i = 0; i < teeth; i++) {
      const tx = i * toothSize * 2 + toothSize / 2;
      ctx.beginPath();
      ctx.moveTo(tx, h - bw);
      ctx.lineTo(tx + toothSize, h - bw);
      ctx.lineTo(tx + toothSize / 2, h);
      ctx.closePath();
      ctx.fill();
    }
  }

  ctx.restore();
}

export function renderPreview(canvas, state) {
  const wrapper = canvas.parentElement;
  const dpr = window.devicePixelRatio || 1;

  const size = Math.min(wrapper.clientWidth, wrapper.clientHeight);
  const displayWidth = size;
  const displayHeight = size;

  canvas.width = displayWidth * dpr;
  canvas.height = displayHeight * dpr;
  canvas.style.width = displayWidth + 'px';
  canvas.style.height = displayHeight + 'px';

  const ctx = canvas.getContext('2d');
  ctx.scale(dpr, dpr);

  render(ctx, displayWidth, displayHeight, state);
}
