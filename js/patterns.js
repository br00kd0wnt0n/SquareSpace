// patterns.js — NY Upstate Quilt-Square Pattern Library
// Each pattern: draw(ctx, x, y, size, config)
// config = { primary, secondary, accent, background, options: {} }

var PATTERNS = {};

function reg(key, name, draw, defaultOptions, optionsDef) {
  defaultOptions = defaultOptions || {};
  optionsDef = optionsDef || [];
  PATTERNS[key] = { key: key, name: name, draw: draw, defaultOptions: defaultOptions, optionsDef: optionsDef };
}

// Helper functions
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

// 1. Nine Patch
reg('nine-patch', 'Nine Patch', function(ctx, x, y, size, cfg) {
  var c = size / 3;
  for (var r = 0; r < 3; r++) {
    for (var col = 0; col < 3; col++) {
      var color = (r + col) % 2 === 0 ? cfg.primary : cfg.secondary;
      rect(ctx, x + col * c, y + r * c, c, c, color);
    }
  }
});

// 2. Log Cabin
reg('log-cabin', 'Log Cabin', function(ctx, x, y, size, cfg) {
  var strips = cfg.options.strips || 5;
  var w = size / (2 * strips + 1);
  var cx = x + size / 2 - w / 2;
  var cy = y + size / 2 - w / 2;

  rect(ctx, x, y, size, size, cfg.background);
  rect(ctx, cx, cy, w, w, cfg.accent);

  var lightColors = [cfg.primary, cfg.accent];
  var darkColors = [cfg.secondary, cfg.primary];

  for (var i = 0; i < strips; i++) {
    var offset = (i + 1) * w;
    var len = w * (2 * i + 3);
    var light = lightColors[i % 2];
    var dark = darkColors[i % 2];
    rect(ctx, cx - offset, cy - offset, len, w, light);
    rect(ctx, cx + offset, cy - offset, w, len, light);
    rect(ctx, cx - offset, cy + offset, len + w, w, dark);
    rect(ctx, cx - offset, cy - offset + w, w, len, dark);
  }
}, { strips: 5 }, [
  { key: 'strips', label: 'Strip Rounds', type: 'range', min: 2, max: 8, step: 1 }
]);

// 3. Ohio Star
reg('ohio-star', 'Ohio Star', function(ctx, x, y, size, cfg) {
  var c = size / 3;
  for (var r = 0; r < 3; r++) {
    for (var col = 0; col < 3; col++) {
      var bx = x + col * c;
      var by = y + r * c;
      if (r === 1 && col === 1) {
        rect(ctx, bx, by, c, c, cfg.accent);
      } else if ((r === 0 || r === 2) && (col === 0 || col === 2)) {
        rect(ctx, bx, by, c, c, cfg.background);
      } else {
        var mx = bx + c / 2;
        var my = by + c / 2;
        rect(ctx, bx, by, c, c, cfg.background);
        tri(ctx, bx, by, bx + c, by, mx, my, cfg.primary);
        tri(ctx, bx + c, by, bx + c, by + c, mx, my, cfg.secondary);
        tri(ctx, bx + c, by + c, bx, by + c, mx, my, cfg.primary);
        tri(ctx, bx, by + c, bx, by, mx, my, cfg.secondary);
      }
    }
  }
});

// 4. Bear's Paw
reg('bears-paw', "Bear's Paw", function(ctx, x, y, size, cfg) {
  var unit = size / 8;
  rect(ctx, x, y, size, size, cfg.background);

  function drawPaw(px, py, flipX, flipY) {
    var u = unit * 3;
    var cu = u / 3;
    rect(ctx, px + cu, py + cu, cu * 2, cu * 2, cfg.primary);
    for (var r = 0; r < 2; r++) {
      for (var c = 0; c < 2; c++) {
        var tx = px + (flipX ? cu + c * cu : c * cu);
        var ty = py + (flipY ? cu + r * cu : r * cu);
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

  var pawSize = unit * 3;
  drawPaw(x, y, false, false);
  drawPaw(x + size - pawSize, y, true, false);
  drawPaw(x, y + size - pawSize, false, true);
  drawPaw(x + size - pawSize, y + size - pawSize, true, true);

  rect(ctx, x + pawSize, y + unit, unit * 2, unit * 6, cfg.accent);
  rect(ctx, x + unit, y + pawSize, unit * 6, unit * 2, cfg.accent);
  rect(ctx, x + pawSize, y + pawSize, unit * 2, unit * 2, cfg.primary);
});

// 5. Flying Geese
reg('flying-geese', 'Flying Geese', function(ctx, x, y, size, cfg) {
  var cols = cfg.options.columns || 4;
  var unitW = size / cols;
  var unitH = unitW / 2;
  var rows = Math.ceil(size / unitH);

  rect(ctx, x, y, size, size, cfg.background);

  for (var r = 0; r < rows; r++) {
    for (var c = 0; c < cols; c++) {
      var gx = x + c * unitW;
      var gy = y + r * unitH;
      var gooseColor = (r + c) % 2 === 0 ? cfg.primary : cfg.secondary;
      tri(ctx, gx, gy + unitH, gx + unitW / 2, gy, gx + unitW, gy + unitH, gooseColor);
      tri(ctx, gx, gy, gx + unitW / 2, gy, gx, gy + unitH, cfg.background);
      tri(ctx, gx + unitW / 2, gy, gx + unitW, gy, gx + unitW, gy + unitH, cfg.background);
    }
  }
}, { columns: 4 }, [
  { key: 'columns', label: 'Columns', type: 'range', min: 2, max: 8, step: 1 }
]);

// 6. Pinwheel
reg('pinwheel', 'Pinwheel', function(ctx, x, y, size, cfg) {
  var half = size / 2;
  rect(ctx, x, y, size, size, cfg.background);
  tri(ctx, x, y, x + half, y, x, y + half, cfg.primary);
  tri(ctx, x + half, y, x + half, y + half, x, y + half, cfg.background);
  tri(ctx, x + half, y, x + size, y, x + size, y + half, cfg.primary);
  tri(ctx, x + half, y, x + half, y + half, x + size, y + half, cfg.background);
  tri(ctx, x + size, y + half, x + size, y + size, x + half, y + size, cfg.primary);
  tri(ctx, x + half, y + half, x + size, y + half, x + half, y + size, cfg.background);
  tri(ctx, x, y + half, x + half, y + size, x, y + size, cfg.primary);
  tri(ctx, x, y + half, x + half, y + half, x + half, y + size, cfg.background);
});

// 7. Sawtooth Star
reg('sawtooth-star', 'Sawtooth Star', function(ctx, x, y, size, cfg) {
  var c = size / 4;
  rect(ctx, x, y, size, size, cfg.background);
  rect(ctx, x + c, y + c, c * 2, c * 2, cfg.accent);
  rect(ctx, x, y, c, c, cfg.background);
  rect(ctx, x + 3 * c, y, c, c, cfg.background);
  rect(ctx, x, y + 3 * c, c, c, cfg.background);
  rect(ctx, x + 3 * c, y + 3 * c, c, c, cfg.background);
  tri(ctx, x + c, y, x + 2 * c, y + c, x + c, y + c, cfg.primary);
  tri(ctx, x + 2 * c, y, x + 3 * c, y + c, x + 2 * c, y + c, cfg.primary);
  tri(ctx, x + c, y + 3 * c, x + 2 * c, y + 4 * c, x + c, y + 4 * c, cfg.primary);
  tri(ctx, x + 2 * c, y + 3 * c, x + 3 * c, y + 4 * c, x + 2 * c, y + 4 * c, cfg.primary);
  tri(ctx, x, y + c, x + c, y + c, x + c, y + 2 * c, cfg.primary);
  tri(ctx, x, y + 2 * c, x + c, y + 2 * c, x + c, y + 3 * c, cfg.primary);
  tri(ctx, x + 3 * c, y + c, x + 4 * c, y + c, x + 3 * c, y + 2 * c, cfg.primary);
  tri(ctx, x + 3 * c, y + 2 * c, x + 4 * c, y + 2 * c, x + 3 * c, y + 3 * c, cfg.primary);
  tri(ctx, x + c, y, x + 2 * c, y, x + c, y + c, cfg.secondary);
  tri(ctx, x + 2 * c, y, x + 3 * c, y, x + 3 * c, y + c, cfg.secondary);
  tri(ctx, x, y + c, x + c, y + c, x, y + 2 * c, cfg.secondary);
  tri(ctx, x + 4 * c, y + c, x + 4 * c, y + 2 * c, x + 3 * c, y + 2 * c, cfg.secondary);
  tri(ctx, x, y + 2 * c, x + c, y + 3 * c, x, y + 3 * c, cfg.secondary);
  tri(ctx, x + 4 * c, y + 2 * c, x + 4 * c, y + 3 * c, x + 3 * c, y + 3 * c, cfg.secondary);
  tri(ctx, x + c, y + 4 * c, x + c, y + 3 * c, x + 2 * c, y + 4 * c, cfg.secondary);
  tri(ctx, x + 2 * c, y + 4 * c, x + 3 * c, y + 3 * c, x + 3 * c, y + 4 * c, cfg.secondary);
});

// 8. Churn Dash
reg('churn-dash', 'Churn Dash', function(ctx, x, y, size, cfg) {
  var c = size / 3;
  rect(ctx, x + c, y + c, c, c, cfg.accent);
  for (var r = 0; r < 3; r++) {
    for (var col = 0; col < 3; col++) {
      var bx = x + col * c;
      var by = y + r * c;
      if (r === 1 && col === 1) continue;
      if ((r === 0 || r === 2) && (col === 0 || col === 2)) {
        rect(ctx, bx, by, c, c, cfg.background);
        if ((r === 0 && col === 0) || (r === 2 && col === 2)) {
          tri(ctx, bx, by, bx + c, by, bx, by + c, cfg.primary);
        } else {
          tri(ctx, bx + c, by, bx + c, by + c, bx, by + c, cfg.primary);
        }
      } else {
        if (r === 0 || r === 2) {
          rect(ctx, bx, by, c, c / 2, cfg.primary);
          rect(ctx, bx, by + c / 2, c, c / 2, cfg.background);
        } else {
          rect(ctx, bx, by, c / 2, c, cfg.primary);
          rect(ctx, bx + c / 2, by, c / 2, c, cfg.background);
        }
      }
    }
  }
});

// 9. Lone Star
reg('lone-star', 'Lone Star', function(ctx, x, y, size, cfg) {
  var rows = cfg.options.rows || 5;
  var cx = x + size / 2;
  var cy = y + size / 2;
  var outerR = size * 0.48;

  rect(ctx, x, y, size, size, cfg.background);

  var starColors = [cfg.primary, cfg.secondary, cfg.accent, cfg.primary, cfg.secondary, cfg.accent, cfg.primary, cfg.secondary];

  for (var arm = 0; arm < 8; arm++) {
    var baseAngle = (arm * Math.PI) / 4;
    var halfSector = Math.PI / 8;

    for (var r = 0; r < rows; r++) {
      var r1 = (outerR * r) / rows;
      var r2 = (outerR * (r + 1)) / rows;
      var colorIdx = (arm + r) % starColors.length;
      var a1 = baseAngle - halfSector;
      var a2 = baseAngle + halfSector;
      var innerLeft = { x: cx + r1 * Math.cos(a1), y: cy + r1 * Math.sin(a1) };
      var outerLeft = { x: cx + r2 * Math.cos(a1), y: cy + r2 * Math.sin(a1) };
      var innerRight = { x: cx + r1 * Math.cos(a2), y: cy + r1 * Math.sin(a2) };
      var outerRight = { x: cx + r2 * Math.cos(a2), y: cy + r2 * Math.sin(a2) };

      ctx.beginPath();
      ctx.moveTo(innerLeft.x, innerLeft.y);
      ctx.lineTo(outerLeft.x, outerLeft.y);
      ctx.lineTo(outerRight.x, outerRight.y);
      ctx.lineTo(innerRight.x, innerRight.y);
      ctx.closePath();
      ctx.fillStyle = starColors[colorIdx];
      ctx.fill();
      ctx.strokeStyle = starColors[colorIdx];
      ctx.lineWidth = 0.5;
      ctx.stroke();
    }
  }

  var cornerSize = size * 0.15;
  rect(ctx, x, y, cornerSize, cornerSize, cfg.background);
  rect(ctx, x + size - cornerSize, y, cornerSize, cornerSize, cfg.background);
  rect(ctx, x, y + size - cornerSize, cornerSize, cornerSize, cfg.background);
  rect(ctx, x + size - cornerSize, y + size - cornerSize, cornerSize, cornerSize, cfg.background);
}, { rows: 5 }, [
  { key: 'rows', label: 'Diamond Rows', type: 'range', min: 3, max: 8, step: 1 }
]);

// 10. Double Wedding Ring
reg('wedding-ring', 'Wedding Ring', function(ctx, x, y, size, cfg) {
  var segments = cfg.options.segments || 8;
  var ringR = size * 0.35;
  var patchW = size * 0.08;
  var cx = x + size / 2;
  var cy = y + size / 2;

  rect(ctx, x, y, size, size, cfg.background);

  function drawRing(rcx, rcy) {
    for (var i = 0; i < segments; i++) {
      var a1 = (i * 2 * Math.PI) / segments;
      var a2 = ((i + 1) * 2 * Math.PI) / segments;
      var color = i % 3 === 0 ? cfg.primary : i % 3 === 1 ? cfg.secondary : cfg.accent;
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

  var spacing = ringR * 1.3;
  var offsets = [
    [0, 0],
    [-spacing, -spacing], [spacing, -spacing],
    [-spacing, spacing], [spacing, spacing],
    [0, -spacing * 1.4], [0, spacing * 1.4],
    [-spacing * 1.4, 0], [spacing * 1.4, 0]
  ];

  for (var o = 0; o < offsets.length; o++) {
    drawRing(cx + offsets[o][0], cy + offsets[o][1]);
  }

  for (var i = 0; i < offsets.length; i++) {
    for (var j = i + 1; j < offsets.length; j++) {
      var dx = offsets[i][0] - offsets[j][0];
      var dy = offsets[i][1] - offsets[j][1];
      var dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < ringR * 2) {
        var ix = cx + (offsets[i][0] + offsets[j][0]) / 2;
        var iy = cy + (offsets[i][1] + offsets[j][1]) / 2;
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

// 11. Maple Leaf
reg('maple-leaf', 'Maple Leaf', function(ctx, x, y, size, cfg) {
  var c = size / 4;
  rect(ctx, x, y, size, size, cfg.background);
  rect(ctx, x + c, y, c, c, cfg.primary);
  rect(ctx, x + 2 * c, y, c, c, cfg.primary);
  rect(ctx, x, y + c, c, c, cfg.primary);
  rect(ctx, x + c, y + c, c, c, cfg.primary);
  rect(ctx, x + 2 * c, y + c, c, c, cfg.primary);
  rect(ctx, x + 3 * c, y + c, c, c, cfg.primary);
  tri(ctx, x, y, x + c, y, x + c, y + c, cfg.secondary);
  tri(ctx, x + 3 * c, y, x + 3 * c + c, y, x + 3 * c, y + c, cfg.secondary);
  rect(ctx, x + c, y + 2 * c, c, c, cfg.primary);
  rect(ctx, x + 2 * c, y + 2 * c, c, c, cfg.primary);
  tri(ctx, x, y + 2 * c, x + c, y + 2 * c, x, y + 3 * c, cfg.secondary);
  tri(ctx, x + 3 * c, y + 2 * c, x + 4 * c, y + 2 * c, x + 4 * c, y + 3 * c, cfg.secondary);
  rect(ctx, x + 1.5 * c, y + 3 * c, c, c, cfg.accent);
});

// 12. Barn Raising
reg('barn-raising', 'Barn Raising', function(ctx, x, y, size, cfg) {
  var divisions = cfg.options.divisions || 6;
  var stripW = size / (2 * divisions);

  rect(ctx, x, y, size, size, cfg.background);

  for (var i = divisions - 1; i >= 0; i--) {
    var d = stripW * (divisions - i);
    var cx = x + size / 2;
    var cy = y + size / 2;

    ctx.beginPath();
    ctx.moveTo(cx, cy - d);
    ctx.lineTo(cx + d, cy);
    ctx.lineTo(cx, cy + d);
    ctx.lineTo(cx - d, cy);
    ctx.closePath();

    var colors = [cfg.primary, cfg.secondary, cfg.accent, cfg.primary, cfg.secondary, cfg.accent];
    ctx.fillStyle = colors[i % colors.length];
    ctx.fill();
    ctx.strokeStyle = cfg.background;
    ctx.lineWidth = 1;
    ctx.stroke();
  }
}, { divisions: 6 }, [
  { key: 'divisions', label: 'Divisions', type: 'range', min: 3, max: 10, step: 1 }
]);

function getPatternList() {
  var list = [];
  for (var key in PATTERNS) {
    if (PATTERNS.hasOwnProperty(key)) {
      list.push({ key: PATTERNS[key].key, name: PATTERNS[key].name });
    }
  }
  return list;
}
