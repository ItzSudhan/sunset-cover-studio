// Hand-drawn display lettering, no font file: a heavy condensed, chamfered face defined as stroke paths on a 4 x 8
// unit grid (y down), stroked with square caps and mitred joins at a chosen weight. drawTitle() stacks a deep
// extrusion, a soft drop shadow, a thick dark outline, a thin light ring and a chrome gradient fill, all slanted.

/** Glyph table: [width in units, path in M/L/Z commands]. Lower case is drawn as upper case. */
const GLYPHS = {
  A: [4, 'M0 8L0 1.2L1.2 0L2.8 0L4 1.2L4 8M0 4.6L4 4.6'],
  B: [4, 'M0 8L0 0L3 0L4 1L4 3L3 4L4 5L4 7L3 8ZM0 4L3 4'],
  C: [4, 'M4 1.1L3 0L1 0L0 1L0 7L1 8L3 8L4 6.9'],
  D: [4, 'M0 0L2.8 0L4 1.2L4 6.8L2.8 8L0 8Z'],
  E: [3.6, 'M3.6 0L0 0L0 8L3.6 8M0 4L3 4'],
  F: [3.6, 'M3.6 0L0 0L0 8M0 4.2L3 4.2'],
  G: [4, 'M4 1.1L3 0L1 0L0 1L0 7L1 8L3 8L4 7L4 4.4L2.2 4.4'],
  H: [4, 'M0 0L0 8M4 0L4 8M0 4.2L4 4.2'],
  I: [0, 'M0 0L0 8'],
  J: [3.6, 'M3.6 0L3.6 7L2.6 8L1 8L0 7L0 5.8'],
  K: [4, 'M0 0L0 8M4 0L4 0.6L0.4 4.4M1.7 3.6L4 7.3L4 8'],
  L: [3.4, 'M0 0L0 8L3.4 8'],
  M: [5, 'M0 8L0 0L2.5 4.2L5 0L5 8'],
  N: [4, 'M0 8L0 0L4 8L4 0'],
  O: [4, 'M1 0L3 0L4 1L4 7L3 8L1 8L0 7L0 1Z'],
  P: [4, 'M0 8L0 0L3 0L4 1L4 3.4L3 4.4L0 4.4'],
  Q: [4, 'M1 0L3 0L4 1L4 7L3 8L1 8L0 7L0 1ZM2.4 5.8L4.2 8.4'],
  R: [4, 'M0 8L0 0L3 0L4 1L4 3.2L3 4.2L0 4.2M2.2 4.2L4 7.2L4 8'],
  S: [4, 'M4 1L3 0L1 0L0 1L0 3L1 4L3 4L4 5L4 7L3 8L1 8L0 7'],
  T: [4, 'M0 0L4 0M2 0L2 8'],
  U: [4, 'M0 0L0 7L1 8L3 8L4 7L4 0'],
  V: [4, 'M0 0L0 4.6L1.4 8L2.6 8L4 4.6L4 0'],
  W: [5, 'M0 0L0 8L2.5 3.8L5 8L5 0'],
  X: [4, 'M0 0L0 1L4 7L4 8M4 0L4 1L0 7L0 8'],
  Y: [4, 'M0 0L0 2.4L2 4.6L4 2.4L4 0M2 4.6L2 8'],
  Z: [4, 'M0 0L4 0L4 1.4L0 6.6L0 8L4 8'],
  0: [4, 'M1 0L3 0L4 1L4 7L3 8L1 8L0 7L0 1ZM2 3.2L2 4.8'],
  1: [1.6, 'M0 1.4L1.6 0L1.6 8'],
  2: [4, 'M0 1L1 0L3 0L4 1L4 3.2L0 7L0 8L4 8'],
  3: [4, 'M0 1L1 0L3 0L4 1L4 3L3 4L4 5L4 7L3 8L1 8L0 7M1.4 4L3 4'],
  4: [4, 'M3 8L3 0L0 5.4L4 5.4'],
  5: [4, 'M4 0L0 0L0 3.6L3 3.6L4 4.6L4 7L3 8L0 8'],
  6: [4, 'M4 1L3 0L1 0L0 1L0 7L1 8L3 8L4 7L4 4.6L3 3.6L0 3.6'],
  7: [4, 'M0 0L4 0L4 1.4L1.6 7L1.6 8'],
  8: [4, 'M1 0L3 0L4 1L4 3L3 4L1 4L0 3L0 1ZM1 4L3 4L4 5L4 7L3 8L1 8L0 7L0 5Z'],
  9: [4, 'M0 7L1 8L3 8L4 7L4 1L3 0L1 0L0 1L0 3.4L1 4.4L4 4.4'],
  ' ': [1.4, ''],
  '-': [2.6, 'M0 4.4L2.6 4.4'],
  '.': [0, 'M0 7.5L0 8'],
  ',': [0, 'M0 7.5L-0.4 9.2'],
  '!': [0, 'M0 0L0 5.2M0 7.5L0 8'],
  '?': [4, 'M0 1L1 0L3 0L4 1L4 3L2 4.6L2 5.3M2 7.5L2 8'],
  "'": [0, 'M0 0L0 2.2'],
  '’': [0, 'M0 0L0 2.2'],
  ':': [0, 'M0 2.3L0 2.8M0 7.5L0 8'],
  '/': [3, 'M0 8L3 0'],
  '&': [4, 'M4 8L0.6 3.4L0.6 1L1.6 0L2.6 0L3.4 1L3.4 2.6L0 5.6L0 7L1 8L2.6 8L4 6'],
  '+': [3.4, 'M1.7 2.6L1.7 6.2M0 4.4L3.4 4.4'],
  '#': [4, 'M1.2 1L1.2 7M2.8 1L2.8 7M0 3L4 3M0 5L4 5'],
  '$': [4, 'M4 1.6L3 0.8L1 0.8L0 1.8L0 3L1 4L3 4L4 5L4 6.2L3 7.2L1 7.2L0 6.4M2 -0.4L2 8.4'],
  '*': [3.4, 'M1.7 0L1.7 3.4M0 0.8L3.4 2.6M3.4 0.8L0 2.6'],
};

const parsed = new Map();

/** Parses a glyph's command string into a list of subpaths of [x, y] points (a `closed` flag on each). */
function glyphShape(ch) {
  if (parsed.has(ch)) return parsed.get(ch);
  const [width, d] = GLYPHS[ch];
  const subpaths = [];
  let current = null;
  for (const [, cmd, args] of d.matchAll(/([MLZ])([^MLZ]*)/g)) {
    const nums = args.trim() ? args.trim().split(/\s+/).map(Number) : [];
    if (cmd === 'M') { current = { pts: [[nums[0], nums[1]]], closed: false }; subpaths.push(current); }
    else if (cmd === 'L') current.pts.push([nums[0], nums[1]]);
    else if (cmd === 'Z') current.closed = true;
  }
  const shape = { width, subpaths };
  parsed.set(ch, shape);
  return shape;
}

/** Upper-cases text and drops characters the face has no glyph for (accents are folded first). */
export function normalizeText(text) {
  return text.normalize('NFD').replace(/[̀-ͯ]/g, '').toUpperCase()
    .split('').filter((c) => c in GLYPHS).join('');
}

/** Width of a line in grid units at stroke weight `weight` with `track` units between letters. */
export function lineUnits(text, weight, track) {
  const chars = normalizeText(text).split('');
  if (!chars.length) return 0;
  return chars.reduce((sum, c) => sum + glyphShape(c).width + weight, 0) + track * (chars.length - 1);
}

/** Builds one Path2D for a line of text, its ink box starting at (x, y) in grid units. */
function linePath(text, x, y, weight, track) {
  const path = new Path2D();
  let pen = x + weight / 2;
  for (const c of normalizeText(text)) {
    const { width, subpaths } = glyphShape(c);
    for (const sp of subpaths) {
      sp.pts.forEach(([px, py], i) => {
        if (i === 0) path.moveTo(pen + px, y + weight / 2 + py);
        else path.lineTo(pen + px, y + weight / 2 + py);
      });
      if (sp.closed) path.closePath();
    }
    pen += width + weight + track;
  }
  return path;
}

function mixHex(a, b, t) {
  const pa = parseInt(a.slice(1), 16), pb = parseInt(b.slice(1), 16);
  const ch = (s) => Math.round(((pa >> s) & 255) * (1 - t) + ((pb >> s) & 255) * t);
  return `rgb(${ch(16)},${ch(8)},${ch(0)})`;
}

/**
 * Draws slanted poster lettering fitted inside `box` ({x, y, w, h} in canvas pixels) and returns the ink rectangle.
 * style: { weight, track, skew, lead, align: 'left'|'center', valign: 'top'|'center'|'bottom', fill: [[stop, color]],
 *          outline, outlineW, ring, ringW, extrude: [near, far] | null, depth: [dx, dy] units, shadow, maxUnit }
 */
export function drawTitle(ctx, lines, box, style) {
  lines = lines.map((l) => normalizeText(l).trim()).filter(Boolean);
  if (!lines.length) return null;
  const { weight, track = 0.55, skew = 0.16, lead = 1.2, align = 'left', valign = 'bottom' } = style;
  const lineH = 8 + weight;
  const totalH = lines.length * lineH + (lines.length - 1) * lead;
  const widths = lines.map((l) => lineUnits(l, weight, track));
  const blockW = Math.max(...widths) + totalH * skew;
  const pad = (style.outlineW ?? 0) * 2 + (style.depth ? Math.abs(style.depth[0]) : 0);
  let u = Math.min(box.w / (blockW + pad), box.h / (totalH + pad));
  if (style.maxUnit) u = Math.min(u, style.maxUnit);
  const inkW = blockW * u, inkH = totalH * u;
  const x0 = align === 'center' ? box.x + (box.w - inkW) / 2 : box.x + (style.outlineW ?? 0) * u;
  const y0 = valign === 'top' ? box.y : valign === 'center' ? box.y + (box.h - inkH) / 2 : box.y + box.h - inkH - pad * u * 0.6;
  if (style.dryRun) return { x: x0, y: y0, w: inkW, h: inkH, unit: u };

  // Paths in grid units, each line laid out inside the block, with the block slanted about its foot.
  const paths = lines.map((l, i) => {
    const off = align === 'center' ? (blockW - totalH * skew - widths[i]) / 2 : 0;
    return { path: linePath(l, off, i * (lineH + lead), weight, track), top: i * (lineH + lead) };
  });
  ctx.save();
  ctx.translate(x0, y0);
  ctx.scale(u, u);
  ctx.transform(1, 0, -skew, 1, skew * totalH, 0);
  ctx.lineCap = 'square';
  ctx.lineJoin = 'miter';
  ctx.miterLimit = 2.2;
  const outerW = weight + 2 * (style.outlineW ?? 0);

  if (style.extrude) {
    const [dx, dy] = style.depth ?? [0.5, 0.8];
    const steps = 14;
    for (let s = steps; s >= 1; s--) {
      const t = s / steps;
      ctx.save();
      ctx.translate(dx * t, dy * t);
      if (s === steps && style.shadow) {
        ctx.shadowColor = style.shadow;
        ctx.shadowBlur = u * 2.2;
        ctx.shadowOffsetX = u * 0.6;
        ctx.shadowOffsetY = u * 0.9;
      }
      ctx.strokeStyle = mixHex(style.extrude[0], style.extrude[1], t);
      ctx.lineWidth = outerW;
      for (const p of paths) ctx.stroke(p.path);
      ctx.restore();
    }
  } else if (style.shadow) {
    ctx.save();
    ctx.shadowColor = style.shadow;
    ctx.shadowBlur = u * 1.6;
    ctx.shadowOffsetX = u * 0.35;
    ctx.shadowOffsetY = u * 0.5;
    ctx.strokeStyle = style.outline;
    ctx.lineWidth = outerW;
    for (const p of paths) ctx.stroke(p.path);
    ctx.restore();
  }
  if (style.outlineW) {
    ctx.strokeStyle = style.outline;
    ctx.lineWidth = outerW;
    for (const p of paths) ctx.stroke(p.path);
  }
  if (style.ring && style.ringW) {
    ctx.strokeStyle = style.ring;
    ctx.lineWidth = weight + 2 * style.ringW;
    for (const p of paths) ctx.stroke(p.path);
  }
  for (const p of paths) {
    const g = ctx.createLinearGradient(0, p.top - weight * 0.1, 0, p.top + lineH);
    for (const [stop, color] of style.fill) g.addColorStop(stop, color);
    ctx.strokeStyle = g;
    ctx.lineWidth = weight;
    ctx.stroke(p.path);
  }
  ctx.restore();
  return { x: x0, y: y0, w: inkW, h: inkH, unit: u };
}
