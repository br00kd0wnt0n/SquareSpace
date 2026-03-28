// patterns.js — NY Upstate Quilt-Square Pattern Library
// Each pattern: draw(ctx, x, y, size, config)
// config = { primary, secondary, accent, background, options: {} }

export const PATTERNS = {};

function reg(key, name, draw, defaultOptions = {}, optionsDef = []) {
  PATTERNS[key] = { key, name, draw, defaultOptions, optionsDef };
}

// ─── Helper functions ──────────────────────────────────────────

function tri(ctx, x1, y1, x2, y2, x3, y3, color) {
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.lineTo(x3, y3);
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.fill();
}

function rect(ctx, x, y, w, h, color) {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, w, h);
}

// ─── 1. Nine Patch ─────────────────────────────────────────────

reg('nine-patch', 'Nine Patch', (ctx, x, y, size, cfg) => {
  const c = size / 3;
  for (let r = 0; r < 3; r++) {
    for (let col = 0; col < 3; col++) {
      const color = (r + col) % 2 === 0 ? cfg.primary : cfg.secondary;
      rect(ctx, x + col * c, y + r * c, c, c, color);
    }
  }
}, {}, []);

// ─── 2. Log Cabin ──────────────────────────────────────────────

reg('log-cabin', 'Log Cabin', (ctx, x, y, size, cfg) => {
  const strips = cfg.options.strips || 5;
  const w = size / (2 * strips + 1);
  const cx = x + size / 2 - w / 2;
  const cy = y + size / 2 - w / 2;

  rect(ctx, x, y, size, size, cfg.background);
  rect(ctx, cx, cy, w, w, cfg.accent);

  const lightColors = [cfg.primary, cfg.accent];
  const darkColors = [cfg.secondary, cfg.primary];

  for (let i = 0; i < strips; i++) {
    const offset = (i + 1) * w;
    const len = w * (2 * i + 3);
    const light = lightColors[i % 2];
    const dark = darkColors[i % 2];

    // top strip (light side)
    rect(ctx, cx - offset, cy - offset, len, w, light);
    // right strip (light side)
    rect(ctx, cx + offset, cy - offset, w, len, light);
    // bottom strip (dark side)
    rect(ctx, cx - offset, cy + offset, len + w, w, dark);
    // left strip (dark side)
    rect(ctx, cx - offset, cy - offset + w, w, len, dark);
  }
}, { strips: 5 }, [
  { key: 'strips', label: 'Strip Rounds', type: 'range', min: 2, max: 8, step: 1 }
]);

// ─── 3. Ohio Star ──────────────────────────────────────────────

reg('ohio-star', 'Ohio Star', (ctx, x, y, size, cfg) => {
  const c = size / 3;
  for (let r = 0; r < 3; r++) {
    for (let col = 0; col < 3; col++) {
      const bx = x + col * c;
      const by = y + r * c;
      if (r === 1 && col === 1) {
        rect(ctx, bx, by, c, c, cfg.accent);
      } else if ((r === 0 || r === 2) && (col === 0 || col === 2)) {
        rect(ctx, bx, by, c, c, cfg.background);
      } else {
        // Quarter-square triangle units on edges
        const mx = bx + c / 2;
        const my = by + c / 2;
        rect(ctx, bx, by, c, c, cfg.background);
        // 4 triangles pointing inward
        tri(ctx, bx, by, bx + c, by, mx, my, cfg.primary);
        tri(ctx, bx + c, by, bx + c, by + c, mx, my, cfg.secondary);
        tri(ctx, bx + c, by + c, bx, by + c, mx, my, cfg.primary);
        tri(ctx, bx, by + c, bx, by, mx, my, cfg.secondary);
      }
    }
  }
}, {}, []);

// ─── 4. Bear's Paw ────────────────────────────────────────────

reg('bears-paw', "Bear's Paw", (ctx, x, y, size, cfg) => {
  const unit = size / 8;
  rect(ctx, x, y, size, size, cfg.background);

  function drawPaw(px, py, flipX, flipY) {
    // 3x3 paw with toes
    const u = unit * 3;
    const cu = u / 3;
    // Main paw square
    rect(ctx, px + cu, py + cu, cu * 2, cu * 2, cfg.primary);
    // Toes - small half-square triangles
    for (let r = 0; r < 2; r++) {
      for (let c = 0; c < 2; c++) {
        const tx = px + (flipX ? cu + c * cu : c * cu);
        const ty = py + (flipY ? cu + r * cu : r * cu);
        if (r === 0 && c === 0) {
          rect(ctx, tx, ty, cu, cu, cfg.background);
          tri(ctx, tx, ty, tx + cu, ty, tx + cu, ty + cu, cfg.secondary);
        } else if (r === 0 && c === 1) {
          rect(ctx, tx, ty, cu, cu, cfg.background);
          tri(ctx, tx, ty, tx + cu, ty, tx, ty + cu, cfg.secondary);
        } else if (r === 1 && c === 0) {
          rect(ctx, tx, ty, cu, cu, cfg.background);
          tri(ctx, tx, ty + cu, tx + cu, ty, tx + cu, ty + cu, cfg.secondary);
        } else {
          rect(ctx, tx, ty, cu, cu, cfg.background);
          tri(ctx, tx + cu, ty, tx, ty + cu, tx + cu, ty + cu, cfg.secondary);
        }
      }
    }
  }

  const pawSize = unit * 3;
  drawPaw(x, y, false, false);
  drawPaw(x + size - pawSize, y, true, false);
  drawPaw(x, y + size - pawSize, false, true);
  drawPaw(x + size - pawSize, y + size - pawSize, true, true);

  // Center cross
  rect(ctx, x + pawSize, y + unit, unit * 2, unit * 6, cfg.accent);
  rect(ctx, x + unit, y + pawSize, unit * 6, unit * 2, cfg.accent);
  // Center square
  rect(ctx, x + pawSize, y + pawSize, unit * 2, unit * 2, cfg.primary);
}, {}, []);

// ─── 5. Flying Geese ──────────────────────────────────────────

reg('flying-geese', 'Flying Geese', (ctx, x, y, size, cfg) => {
  const cols = cfg.options.columns || 4;
  const unitW = size / cols;
  const unitH = unitW / 2;
  const rows = Math.ceil(size / unitH);

  rect(ctx, x, y, size, size, cfg.background);

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const gx = x + c * unitW;
      const gy = y + r * unitH;
      const gooseColor = (r + c) % 2 === 0 ? cfg.primary : cfg.secondary;
      // Goose triangle
      tri(ctx, gx, gy + unitH, gx + unitW / 2, gy, gx + unitW, gy + unitH, gooseColor);
      // Sky triangles
      tri(ctx, gx, gy, gx + unitW / 2, gy, gx, gy + unitH, cfg.background);
      tri(ctx, gx + unitW / 2, gy, gx + unitW, gy, gx + unitW, gy + unitH, cfg.background);
    }
  }
}, { columns: 4 }, [
  { key: 'columns', label: 'Columns', type: 'range', min: 2, max: 8, step: 1 }
]);

// ─── 6. Pinwheel ──────────────────────────────────────────────

reg('pinwheel', 'Pinwheel', (ctx, x, y, size, cfg) => {
  const half = size / 2;

  rect(ctx, x, y, size, size, cfg.background);

  // Top-left: diagonal from TL to BR
  tri(ctx, x, y, x + half, y, x, y + half, cfg.primary);
  tri(ctx, x + half, y, x + half, y + half, x, y + half, cfg.background);

  // Top-right: diagonal from TR to BL
  tri(ctx, x + half, y, x + size, y, x + size, y + half, cfg.primary);
  tri(ctx, x + half, y, x + half, y + half, x + size, y + half, cfg.background);

  // Bottom-right: diagonal from BR to TL
  tri(ctx, x + size, y + half, x + size, y + size, x + half, y + size, cfg.primary);
  tri(ctx, x + half, y + half, x + size, y + half, x + half, y + size, cfg.background);

  // Bottom-left: diagonal from BL to TR
  tri(ctx, x, y + half, x + half, y + size, x, y + size, cfg.primary);
  tri(ctx, x, y + half, x + half, y + half, x + half, y + size, cfg.background);
}, {}, []);

// ─── 7. Sawtooth Star ─────────────────────────────────────────

reg('sawtooth-star', 'Sawtooth Star', (ctx, x, y, size, cfg) => {
  const c = size / 4;

  rect(ctx, x, y, size, size, cfg.background);

  // Center square
  rect(ctx, x + c, y + c, c * 2, c * 2, cfg.accent);

  // Corner squares
  rect(ctx, x, y, c, c, cfg.background);
  rect(ctx, x + 3 * c, y, c, c, cfg.background);
  rect(ctx, x, y + 3 * c, c, c, cfg.background);
  rect(ctx, x + 3 * c, y + 3 * c, c, c, cfg.background);

  // Flying geese - top
  tri(ctx, x + c, y, x + 2 * c, y + c, x + c, y + c, cfg.primary);
  tri(ctx, x + 2 * c, y, x + 3 * c, y + c, x + 2 * c, y + c, cfg.primary);

  // Flying geese - bottom
  tri(ctx, x + c, y + 3 * c, x + 2 * c, y + 4 * c, x + c, y + 4 * c, cfg.primary);
  tri(ctx, x + 2 * c, y + 3 * c, x + 3 * c, y + 4 * c, x + 2 * c, y + 4 * c, cfg.primary);

  // Flying geese - left
  tri(ctx, x, y + c, x + c, y + c, x + c, y + 2 * c, cfg.primary);
  tri(ctx, x, y + 2 * c, x + c, y + 2 * c, x + c, y + 3 * c, cfg.primary);

  // Flying geese - right
  tri(ctx, x + 3 * c, y + c, x + 4 * c, y + c, x + 3 * c, y + 2 * c, cfg.primary);
  tri(ctx, x + 3 * c, y + 2 * c, x + 4 * c, y + 2 * c, x + 3 * c, y + 3 * c, cfg.primary);

  // Star point tips
  tri(ctx, x + c, y, x + 2 * c, y, x + c, y + c, cfg.secondary);
  tri(ctx, x + 2 * c, y, x + 3 * c, y, x + 3 * c, y + c, cfg.secondary);
  tri(ctx, x, y + c, x + c, y + c, x, y + 2 * c, cfg.secondary);
  tri(ctx, x + 4 * c, y + c, x + 4 * c, y + 2 * c, x + 3 * c, y + 2 * c, cfg.secondary);
  tri(ctx, x, y + 2 * c, x + c, y + 3 * c, x, y + 3 * c, cfg.secondary);
  tri(ctx, x + 4 * c, y + 2 * c, x + 4 * c, y + 3 * c, x + 3 * c, y + 3 * c, cfg.secondary);
  tri(ctx, x + c, y + 4 * c, x + c, y + 3 * c, x + 2 * c, y + 4 * c, cfg.secondary);
  tri(ctx, x + 2 * c, y + 4 * c, x + 3 * c, y + 3 * c, x + 3 * c, y + 4 * c, cfg.secondary);
}, {}, []);

// ─── 8. Churn Dash ─────────────────────────────────────────────

reg('churn-dash', 'Churn Dash', (ctx, x, y, size, cfg) => {
  const c = size / 3;

  // Center square
  rect(ctx, x + c, y + c, c, c, cfg.accent);

  for (let r = 0; r < 3; r++) {
    for (let col = 0; col < 3; col++) {
      const bx = x + col * c;
      const by = y + r * c;

      if (r === 1 && col === 1) continue; // already drawn

      if ((r === 0 || r === 2) && (col === 0 || col === 2)) {
        // Corners — half-square triangles
        rect(ctx, bx, by, c, c, cfg.background);
        if ((r === 0 && col === 0) || (r === 2 && col === 2)) {
          tri(ctx, bx, by, bx + c, by, bx, by + c, cfg.primary);
        } else {
          tri(ctx, bx + c, by, bx + c, by + c, bx, by + c, cfg.primary);
        }
      } else {
        // Edge bars
        if (r === 0 || r === 2) {
          // Horizontal split
          rect(ctx, bx, by, c, c / 2, cfg.primary);
          rect(ctx, bx, by + c / 2, c, c / 2, cfg.background);
        } else {
          // Vertical split
          rect(ctx, bx, by, c / 2, c, cfg.primary);
          rect(ctx, bx + c / 2, by, c / 2, c, cfg.background);
        }
      }
    }
  }
}, {}, []);

// ─── 9. Lone Star ──────────────────────────────────────────────

reg('lone-star', 'Lone Star', (ctx, x, y, size, cfg) => {
  const rows = cfg.options.rows || 5;
  const cx = x + size / 2;
  const cy = y + size / 2;
  const outerR = size * 0.48;

  rect(ctx, x, y, size, size, cfg.background);

  const starColors = [cfg.primary, cfg.secondary, cfg.accent, cfg.primary, cfg.secondary, cfg.accent, cfg.primary, cfg.secondary];

  // Draw 8-pointed star using diamond strips
  for (let arm = 0; arm < 8; arm++) {
    const baseAngle = (arm * Math.PI) / 4;
    const halfSector = Math.PI / 8;

    for (let r = 0; r < rows; r++) {
      const r1 = (outerR * r) / rows;
      const r2 = (outerR * (r + 1)) / rows;
      const colorIdx = (arm + r) % starColors.length;

      // Diamond vertices
      const a1 = baseAngle - halfSector;
      const a2 = baseAngle + halfSector;

      // Interpolate the angles for each row
      const innerLeft = { x: cx + r1 * Math.cos(a1), y: cy + r1 * Math.sin(a1) };
      const outerLeft = { x: cx + r2 * Math.cos(a1), y: cy + r2 * Math.sin(a1) };
      const innerRight = { x: cx + r1 * Math.cos(a2), y: cy + r1 * Math.sin(a2) };
      const outerRight = { x: cx + r2 * Math.cos(a2), y: cy + r2 * Math.sin(a2) };

      // Draw the diamond
      ctx.beginPath();
      ctx.moveTo(innerLeft.x, innerLeft.y);
      ctx.lineTo(outerLeft.x, outerLeft.y);
      ctx.lineTo(outerRight.x, outerRight.y);
      ctx.lineTo(innerRight.x, innerRight.y);
      ctx.closePath();
      ctx.fillStyle = starColors[colorIdx];
      ctx.fill();

      // Thin stroke to prevent gaps
      ctx.strokeStyle = starColors[colorIdx];
      ctx.lineWidth = 0.5;
      ctx.stroke();
    }
  }

  // Corner squares and triangles for background fill
  const cornerSize = size * 0.15;
  rect(ctx, x, y, cornerSize, cornerSize, cfg.background);
  rect(ctx, x + size - cornerSize, y, cornerSize, cornerSize, cfg.background);
  rect(ctx, x, y + size - cornerSize, cornerSize, cornerSize, cfg.background);
  rect(ctx, x + size - cornerSize, y + size - cornerSize, cornerSize, cornerSize, cfg.background);
}, { rows: 5 }, [
  { key: 'rows', label: 'Diamond Rows', type: 'range', min: 3, max: 8, step: 1 }
]);

// ─── 10. Double Wedding Ring ───────────────────────────────────

reg('wedding-ring', 'Wedding Ring', (ctx, x, y, size, cfg) => {
  const segments = cfg.options.segments || 8;
  const ringR = size * 0.35;
  const patchW = size * 0.08;
  const cx = x + size / 2;
  const cy = y + size / 2;

  rect(ctx, x, y, size, size, cfg.background);

  function drawRing(rcx, rcy) {
    for (let i = 0; i < segments; i++) {
      const a1 = (i * 2 * Math.PI) / segments;
      const a2 = ((i + 1) * 2 * Math.PI) / segments;
      const amid = (a1 + a2) / 2;

      const color = i % 3 === 0 ? cfg.primary : i % 3 === 1 ? cfg.secondary : cfg.accent;

      // Outer arc patch
      ctx.beginPath();
      ctx.arc(rcx, rcy, ringR + patchW / 2, a1, a2);
      ctx.arc(rcx, rcy, ringR - patchW / 2, a2, a1, true);
      ctx.closePath();
      ctx.fillStyle = color;
      ctx.fill();
      ctx.strokeStyle = cfg.background;
      ctx.lineWidth = 1;
      ctx.stroke();
    }
  }

  // Arrange rings in interlocking grid
  const spacing = ringR * 1.3;
  const offsets = [
    [0, 0],
    [-spacing, -spacing], [spacing, -spacing],
    [-spacing, spacing], [spacing, spacing],
    [0, -spacing * 1.4], [0, spacing * 1.4],
    [-spacing * 1.4, 0], [spacing * 1.4, 0]
  ];

  for (const [ox, oy] of offsets) {
    drawRing(cx + ox, cy + oy);
  }

  // Intersection fills (vesica piscis)
  for (let i = 0; i < offsets.length; i++) {
    for (let j = i + 1; j < offsets.length; j++) {
      const dx = offsets[i][0] - offsets[j][0];
      const dy = offsets[i][1] - offsets[j][1];
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < ringR * 2) {
        const ix = cx + (offsets[i][0] + offsets[j][0]) / 2;
        const iy = cy + (offsets[i][1] + offsets[j][1]) / 2;
        ctx.beginPath();
        ctx.arc(ix, iy, patchW * 1.5, 0, Math.PI * 2);
        ctx.fillStyle = cfg.accent;
        ctx.fill();
      }
    }
  }
}, { segments: 8 }, [
  { key: 'segments', label: 'Ring Segments', type: 'range', min: 6, max: 16, step: 1 }
]);

// ─── 11. Maple Leaf ────────────────────────────────────────────

reg('maple-leaf', 'Maple Leaf', (ctx, x, y, size, cfg) => {
  const c = size / 4;

  rect(ctx, x, y, size, size, cfg.background);

  // Main leaf blocks (arranged like a simplified leaf)
  // Top section
  rect(ctx, x + c, y, c, c, cfg.primary);
  rect(ctx, x + 2 * c, y, c, c, cfg.primary);

  // Middle section
  rect(ctx, x, y + c, c, c, cfg.primary);
  rect(ctx, x + c, y + c, c, c, cfg.primary);
  rect(ctx, x + 2 * c, y + c, c, c, cfg.primary);
  rect(ctx, x + 3 * c, y + c, c, c, cfg.primary);

  // HST accents for leaf shape
  tri(ctx, x, y, x + c, y, x + c, y + c, cfg.secondary);
  tri(ctx, x + 3 * c, y, x + 3 * c + c, y, x + 3 * c, y + c, cfg.secondary);

  // Lower section
  rect(ctx, x + c, y + 2 * c, c, c, cfg.primary);
  rect(ctx, x + 2 * c, y + 2 * c, c, c, cfg.primary);
  tri(ctx, x, y + 2 * c, x + c, y + 2 * c, x, y + 3 * c, cfg.secondary);
  tri(ctx, x + 3 * c, y + 2 * c, x + 4 * c, y + 2 * c, x + 4 * c, y + 3 * c, cfg.secondary);

  // Stem
  rect(ctx, x + 1.5 * c, y + 3 * c, c, c, cfg.accent);
}, {}, []);

// ─── 12. Barn Raising (Log Cabin Variant) ──────────────────────

reg('barn-raising', 'Barn Raising', (ctx, x, y, size, cfg) => {
  const divisions = cfg.options.divisions || 6;
  const stripW = size / (2 * divisions);

  rect(ctx, x, y, size, size, cfg.background);

  // Concentric diamonds from center
  for (let i = divisions - 1; i >= 0; i--) {
    const d = stripW * (divisions - i);
    const cx = x + size / 2;
    const cy = y + size / 2;

    ctx.beginPath();
    ctx.moveTo(cx, cy - d);
    ctx.lineTo(cx + d, cy);
    ctx.lineTo(cx, cy + d);
    ctx.lineTo(cx - d, cy);
    ctx.closePath();

    const colors = [cfg.primary, cfg.secondary, cfg.accent, cfg.primary, cfg.secondary, cfg.accent];
    ctx.fillStyle = colors[i % colors.length];
    ctx.fill();
    ctx.strokeStyle = cfg.background;
    ctx.lineWidth = 1;
    ctx.stroke();
  }
}, { divisions: 6 }, [
  { key: 'divisions', label: 'Divisions', type: 'range', min: 3, max: 10, step: 1 }
]);

export function getPatternList() {
  return Object.values(PATTERNS).map(p => ({ key: p.key, name: p.name }));
}
