// Colour grade presets and the poster effects drawn with them. The grade is a film-style look rather than a flat
// duotone: an S-curve, a split-tone (cool shadows, warm highlights), then the sunset gradient map blended in at partial
// strength and held back on skin, so faces stay warm and natural while the poster still reads as one sunset. Then
// highlight bloom, a striped sun disc, palm silhouettes, halftone dots, film grain and a vignette. Every effect is
// deterministic (seeded noise), so the preview and the exported PNG match.
//
// Per grade: map = gradient-map stops (shadows -> highlights), strength = how much of the map is mixed in,
// shadowTint / highTint = the split-tone colours, split = split-tone amount, sat = saturation, skin = how much of the
// map skin tones are spared (0..1).

export const GRADES = {
  sunset: {
    name: 'Sunset Strip',
    map: ['#14042a', '#4d0f5c', '#b8226a', '#ff6a3d', '#ffc56b', '#fff3d1'],
    strength: 0.34, contrast: 1.12, shadowTint: '#0f5a6e', highTint: '#ffa04a', split: 0.3, sat: 1.12, skin: 0.7,
    bg: '#10031c', border: '#ffe7c2', glow: 'rgba(255,120,60,0.55)',
    leak: ['rgba(255,170,60,0.38)', 'rgba(255,40,120,0)'],
    sun: ['#fff4a3', '#ffb03a', '#ff3d7f'],
    fill: [[0, '#fffbe2'], [0.38, '#ffe066'], [0.49, '#ff9d1f'], [0.5, '#ff2f86'], [0.78, '#c21fbf'], [1, '#6a14c9']],
    outline: '#170420', ring: '#fff1d6', extrude: ['#a3165e', '#2a0430'], palm: '#16031f',
    tagFill: '#ffffff', tagPlate: 'rgba(18,4,30,0.86)', accent: '#ff3d7f',
  },
  neon: {
    name: 'Neon Night',
    map: ['#04021a', '#1b0a52', '#5c16a8', '#e1249c', '#ff8ad6', '#b8fbff'],
    strength: 0.42, contrast: 1.16, shadowTint: '#1a2a8c', highTint: '#ff7ad0', split: 0.34, sat: 1.15, skin: 0.6,
    bg: '#05021a', border: '#9ff6ff', glow: 'rgba(255,40,200,0.55)',
    leak: ['rgba(80,220,255,0.30)', 'rgba(200,30,255,0)'],
    sun: ['#ffd6ff', '#ff4fd8', '#7a2bff'],
    fill: [[0, '#f0ffff'], [0.38, '#7ff6ff'], [0.49, '#1ec8ff'], [0.5, '#ff3ccf'], [0.8, '#a61fe0'], [1, '#4b10b8']],
    outline: '#06021c', ring: '#e8fdff', extrude: ['#5a1aa8', '#0c0330'], palm: '#05021a',
    tagFill: '#ffffff', tagPlate: 'rgba(6,2,28,0.86)', accent: '#1ec8ff',
  },
  miami: {
    name: 'Miami Teal',
    map: ['#032029', '#0a4f60', '#14999c', '#ff7a98', '#ffc79c', '#fff7ea'],
    strength: 0.3, contrast: 1.12, shadowTint: '#00807e', highTint: '#ff9a7a', split: 0.36, sat: 1.1, skin: 0.7,
    bg: '#031a22', border: '#fff2e2', glow: 'rgba(255,140,160,0.5)',
    leak: ['rgba(255,190,150,0.32)', 'rgba(20,200,200,0)'],
    sun: ['#fff6d8', '#ffab8a', '#ff5f8f'],
    fill: [[0, '#fffaf2'], [0.38, '#ffd0b0'], [0.49, '#ff8fa6'], [0.5, '#25d6cf'], [0.8, '#0f9aa6'], [1, '#08606e']],
    outline: '#03161e', ring: '#fff5ea', extrude: ['#0d6b78', '#021820'], palm: '#02161d',
    tagFill: '#ffffff', tagPlate: 'rgba(3,22,30,0.86)', accent: '#ff7a98',
  },
  golden: {
    name: 'Golden Hour',
    map: ['#1a0703', '#541a07', '#a8400d', '#ec8a26', '#ffd27a', '#fffbe9'],
    strength: 0.32, contrast: 1.12, shadowTint: '#203a5a', highTint: '#ffb347', split: 0.3, sat: 1.1, skin: 0.7,
    bg: '#150602', border: '#fff0c8', glow: 'rgba(255,170,60,0.55)',
    leak: ['rgba(255,210,120,0.4)', 'rgba(255,90,20,0)'],
    sun: ['#fffbd0', '#ffd35a', '#ff7a1f'],
    fill: [[0, '#ffffff'], [0.38, '#fff0a0'], [0.49, '#ffc93a'], [0.5, '#ff7a14'], [0.8, '#d1401a'], [1, '#7c1d0c']],
    outline: '#1a0603', ring: '#fff6dc', extrude: ['#8a2a0b', '#200602'], palm: '#170502',
    tagFill: '#ffffff', tagPlate: 'rgba(26,8,3,0.86)', accent: '#ffc93a',
  },
  chrome: {
    name: 'Midnight Chrome',
    map: ['#020412', '#0e1840', '#2c4690', '#8aa4dc', '#e2eaff', '#ffffff'],
    strength: 0.5, contrast: 1.18, shadowTint: '#102a7a', highTint: '#ffc0e0', split: 0.3, sat: 0.9, skin: 0.5,
    bg: '#020412', border: '#e6eeff', glow: 'rgba(120,160,255,0.45)',
    leak: ['rgba(255,90,170,0.26)', 'rgba(60,100,255,0)'],
    sun: ['#ffe2f4', '#ff7ab8', '#6b5bff'],
    fill: [[0, '#ffffff'], [0.38, '#dfe8ff'], [0.49, '#8fa6d8'], [0.5, '#2b3b78'], [0.72, '#7f9be0'], [1, '#e8eeff']],
    outline: '#03050f', ring: '#ff5fae', extrude: ['#3a2a7a', '#06061a'], palm: '#020412',
    tagFill: '#ffffff', tagPlate: 'rgba(2,4,18,0.86)', accent: '#ff5fae',
  },
};

function hexRgb(hex) {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

const lutCache = new Map();

/** A 256-entry RGB lookup table spreading the grade's map colours evenly over luminance. */
function gradeLut(grade) {
  if (lutCache.has(grade)) return lutCache.get(grade);
  const stops = grade.map.map(hexRgb);
  const lut = new Uint8ClampedArray(256 * 3);
  for (let i = 0; i < 256; i++) {
    const t = (i / 255) * (stops.length - 1);
    const k = Math.min(stops.length - 2, Math.floor(t)), f = t - k;
    for (let c = 0; c < 3; c++) lut[i * 3 + c] = stops[k][c] * (1 - f) + stops[k + 1][c] * f;
  }
  lutCache.set(grade, lut);
  return lut;
}

/** A tint's offset from grey at its own luminance, so a split-tone shifts hue without changing brightness. */
function chroma(hex) {
  const c = hexRgb(hex);
  const l = c[0] * 0.299 + c[1] * 0.587 + c[2] * 0.114;
  return c.map((v) => v - l);
}

/**
 * Grades the whole canvas, scaled by `amount` (0..1): an S-curve, saturation, a split-tone (shadowTint in the
 * shadows, highTint in the highlights) and the gradient map mixed in at the grade's strength. Skin tones (warm hues
 * where red > green > blue) get less of the map, so faces stay natural instead of turning into flat duotone.
 */
export function applyGradientMap(ctx, w, h, grade, amount) {
  const img = ctx.getImageData(0, 0, w, h);
  const d = img.data;
  const lut = gradeLut(grade);
  const con = 1 + (grade.contrast - 1) * amount;
  const curve = new Float32Array(256);
  for (let i = 0; i < 256; i++) {
    let v = (i / 255 - 0.5) * con + 0.5;
    v = v < 0 ? 0 : v > 1 ? 1 : v;
    curve[i] = (v * v * (3 - 2 * v) * 0.3 + v * 0.7) * 255; // a gentle S-curve for punchier mids
  }
  const sh = chroma(grade.shadowTint ?? '#0f5a6e'), hi = chroma(grade.highTint ?? '#ffa04a');
  const split = (grade.split ?? 0.3) * amount * 1.5;
  const sat = 1 + ((grade.sat ?? 1) - 1) * amount;
  const mapMix = grade.strength * amount, skinKeep = grade.skin ?? 0.6;
  for (let i = 0; i < d.length; i += 4) {
    const r0 = d[i], g0 = d[i + 1], b0 = d[i + 2];
    // Skin likelihood from the original pixel: a warm hue with green between red and blue.
    let skin = 0;
    if (r0 > g0 && g0 > b0 && r0 - b0 > 28) {
      const q = (g0 - b0) / (r0 - b0);
      skin = 1 - Math.abs(q - 0.45) / 0.3;
      if (skin < 0) skin = 0;
    }
    let r = curve[r0], g = curve[g0], b = curve[b0];
    const lum = r * 0.299 + g * 0.587 + b * 0.114, l = lum / 255;
    const s = sat - skin * (sat - 1) * 0.6;
    r = lum + (r - lum) * s; g = lum + (g - lum) * s; b = lum + (b - lum) * s;
    const ws = (1 - l) * (1 - l) * split, wh = l * l * split * (1 - skin * 0.4);
    r += sh[0] * ws + hi[0] * wh; g += sh[1] * ws + hi[1] * wh; b += sh[2] * ws + hi[2] * wh;
    const m = mapMix * (1 - skin * skinKeep), keep = 1 - m;
    const k = (l < 0 ? 0 : l > 1 ? 255 : Math.round(l * 255)) * 3;
    d[i] = r * keep + lut[k] * m;
    d[i + 1] = g * keep + lut[k + 1] * m;
    d[i + 2] = b * keep + lut[k + 2] * m;
  }
  ctx.putImageData(img, 0, 0);
}

/** Highlight glow: a blurred, high-contrast copy of `source` (so mostly its bright parts) screened over the canvas. */
export function drawBloom(ctx, source, w, h, strength) {
  ctx.save();
  ctx.globalCompositeOperation = 'screen';
  ctx.globalAlpha = strength;
  ctx.filter = `blur(${Math.round(Math.min(w, h) * 0.016)}px) contrast(2.2) brightness(0.8)`;
  ctx.drawImage(source, 0, 0, w, h);
  ctx.restore();
}

/** A top-down light leak in the grade's warm colour. */
export function drawLightLeak(ctx, w, h, grade) {
  ctx.save();
  ctx.globalCompositeOperation = 'screen';
  const g = ctx.createLinearGradient(0, 0, w * 0.35, h);
  g.addColorStop(0, grade.leak[0]);
  g.addColorStop(0.55, grade.leak[1]);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
  ctx.restore();
}

/** A striped retro sun disc with a halo, screened onto the poster at (cx, cy) with radius r. */
export function drawSun(ctx, cx, cy, r, grade) {
  const size = Math.ceil(r * 2.6);
  const off = new OffscreenCanvas(size, size);
  const o = off.getContext('2d');
  const c = size / 2;
  const halo = o.createRadialGradient(c, c, r * 0.6, c, c, size / 2);
  halo.addColorStop(0, grade.glow);
  halo.addColorStop(1, 'rgba(0,0,0,0)');
  o.fillStyle = halo;
  o.fillRect(0, 0, size, size);
  const g = o.createLinearGradient(0, c - r, 0, c + r);
  g.addColorStop(0, grade.sun[0]);
  g.addColorStop(0.5, grade.sun[1]);
  g.addColorStop(1, grade.sun[2]);
  o.fillStyle = g;
  o.beginPath();
  o.arc(c, c, r, 0, Math.PI * 2);
  o.fill();
  // Horizontal slits that thicken towards the bottom of the disc.
  o.globalCompositeOperation = 'destination-out';
  for (let i = 0; i < 7; i++) {
    const y = c + r * (0.08 + i * 0.135);
    const t = r * (0.02 + i * 0.016);
    o.fillRect(c - r, y, r * 2, t);
  }
  ctx.save();
  ctx.globalCompositeOperation = 'hard-light';
  ctx.globalAlpha = 0.85;
  ctx.drawImage(off, cx - c, cy - c);
  ctx.restore();
}

/** One palm silhouette: a curved tapering trunk of height `h` leaning by `lean`, with drooping fronds. */
function drawPalm(ctx, x, y, h, lean, color) {
  const topX = x + lean * h, topY = y - h;
  const w0 = h * 0.045, w1 = h * 0.018;
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(x - w0, y);
  ctx.quadraticCurveTo(x + lean * h * 0.15 - w0, y - h * 0.6, topX - w1, topY);
  ctx.lineTo(topX + w1, topY);
  ctx.quadraticCurveTo(x + lean * h * 0.15 + w0, y - h * 0.6, x + w0, y);
  ctx.closePath();
  ctx.fill();
  // Fronds: an arching spine; the frond's underside is a saw-tooth of leaflets hanging below it.
  const fronds = [-2.95, -2.5, -2.05, -1.62, -1.15, -0.7, -0.25, 0.18];
  for (const a of fronds) {
    const len = h * (0.44 + 0.06 * Math.cos(a * 2.3));
    const lift = Math.sin(a) < -1.2 ? 0.55 : 1;
    const mx = topX + Math.cos(a) * len * 0.55, my = topY + Math.sin(a) * len * 0.5 * lift - len * 0.24;
    const ex = topX + Math.cos(a) * len * 0.92, ey = topY + len * (0.5 + Math.sin(a) * 0.3 * lift);
    const at = (t) => [
      (1 - t) * (1 - t) * topX + 2 * (1 - t) * t * mx + t * t * ex,
      (1 - t) * (1 - t) * topY + 2 * (1 - t) * t * my + t * t * ey,
    ];
    const n = 11;
    const top = [], under = [];
    for (let k = 0; k <= n; k++) {
      const t = k / n;
      const [px, py] = at(t);
      const width = h * 0.016 * (1 - t);
      top.push([px, py - width]);
      if (k > 0 && k < n) {
        const ll = h * (0.09 * Math.sin(Math.PI * t) + 0.015);
        const dir = Math.cos(a) >= 0 ? 1 : -1;
        under.push([px + dir * ll * 0.35, py + ll], [px - dir * h * 0.008, py + width]);
      }
    }
    ctx.beginPath();
    top.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
    for (let i = under.length - 1; i >= 0; i--) ctx.lineTo(under[i][0], under[i][1]);
    ctx.closePath();
    ctx.fill();
  }
  ctx.beginPath();
  ctx.arc(topX, topY + h * 0.01, h * 0.03, 0, Math.PI * 2);
  ctx.fill();
}

/** Palm silhouettes rising from the bottom corners of the poster. */
export function drawPalms(ctx, w, h, grade) {
  const s = Math.min(w, h);
  ctx.save();
  ctx.shadowColor = 'rgba(0,0,0,0.5)';
  ctx.shadowBlur = s * 0.01;
  const k = w > h * 1.2 ? 1 : 0.78;
  // Kept low and leaning outward so they frame the corners without hiding the faces in the edge panels.
  drawPalm(ctx, w * 0.012, h + s * 0.02, s * 0.44 * k, 0.05, grade.palm);
  drawPalm(ctx, w * 0.05, h + s * 0.02, s * 0.3 * k, 0.12, grade.palm);
  drawPalm(ctx, w * 0.992, h + s * 0.02, s * 0.36 * k, -0.06, grade.palm);
  ctx.restore();
}

function seeded(seed) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

let grainTile = null;

/** Film grain from a seeded 256 x 256 noise tile, overlaid at `amount`. */
export function drawGrain(ctx, w, h, amount, scale = 1) {
  if (!grainTile) {
    grainTile = new OffscreenCanvas(256, 256);
    const g = grainTile.getContext('2d');
    const img = g.createImageData(256, 256);
    const rnd = seeded(1979);
    for (let i = 0; i < img.data.length; i += 4) {
      const v = 128 + (rnd() - 0.5) * 255;
      img.data[i] = img.data[i + 1] = img.data[i + 2] = v;
      img.data[i + 3] = 255;
    }
    g.putImageData(img, 0, 0);
  }
  ctx.save();
  ctx.globalCompositeOperation = 'overlay';
  ctx.globalAlpha = amount;
  const p = ctx.createPattern(grainTile, 'repeat');
  p.setTransform(new DOMMatrix().scale(scale));
  ctx.fillStyle = p;
  ctx.fillRect(0, 0, w, h);
  ctx.restore();
}

/** A diagonal halftone dot screen, multiplied into the shadows. `cell` is the dot spacing in pixels. */
export function drawHalftone(ctx, w, h, cell, amount) {
  const tile = new OffscreenCanvas(Math.ceil(cell), Math.ceil(cell));
  const t = tile.getContext('2d');
  t.fillStyle = '#000';
  t.beginPath();
  t.arc(cell / 2, cell / 2, cell * 0.3, 0, Math.PI * 2);
  t.fill();
  ctx.save();
  ctx.globalCompositeOperation = 'soft-light';
  ctx.globalAlpha = amount;
  const p = ctx.createPattern(tile, 'repeat');
  p.setTransform(new DOMMatrix().rotate(45));
  ctx.fillStyle = p;
  ctx.fillRect(0, 0, w, h);
  ctx.restore();
}

/** Darkened corners. */
export function drawVignette(ctx, w, h, amount) {
  const g = ctx.createRadialGradient(w / 2, h * 0.45, Math.min(w, h) * 0.35, w / 2, h / 2, Math.hypot(w, h) * 0.58);
  g.addColorStop(0, 'rgba(0,0,0,0)');
  g.addColorStop(1, `rgba(0,0,0,${amount})`);
  ctx.save();
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
  ctx.restore();
}
