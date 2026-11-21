// Poster layout templates and export sizes. Each template has a version per aspect (landscape, square, portrait):
// a set of slanted cuts that split the poster into 4 to 8 tilted panels, plus the box the title lettering sits in.
//
// A spec with dir 'cols' first cuts the poster into columns by slanted lines [xTop, xBottom] (fractions of the
// width), then each column into panels by slanted lines [yLeft, yRight] that run across the whole poster. With dir
// 'rows' the roles swap: rows by [yLeft, yRight], then panels within each row by [xTop, xBottom]. Every cell is a
// convex quad, inset by the gutter so the panels get thin dark gaps between their borders.

export const SIZES = {
  landscape: { id: 'landscape', label: '1920 × 1080', w: 1920, h: 1080 },
  square: { id: 'square', label: '1080 × 1080', w: 1080, h: 1080 },
  portrait: { id: 'portrait', label: '1080 × 1350', w: 1080, h: 1350 },
};

export const TEMPLATES = {
  lineup: {
    name: 'Line-Up',
    landscape: {
      dir: 'cols', cuts: [[0.25, 0.19], [0.60, 0.54], [0.81, 0.76]],
      sub: [[[0.36, 0.31], [0.68, 0.63]], [], [[0.52, 0.44]], [[0.34, 0.29], [0.67, 0.61]]],
      title: { x: 0.14, y: 0.5, w: 0.72, h: 0.37, align: 'center' },
    },
    square: {
      dir: 'rows', cuts: [[0.28, 0.23], [0.66, 0.60]],
      sub: [[[0.26, 0.20], [0.52, 0.46], [0.77, 0.71]], [[0.34, 0.26], [0.70, 0.62]], [[0.50, 0.42]]],
      title: { x: 0.05, y: 0.54, w: 0.90, h: 0.22, align: 'center' },
    },
    portrait: {
      dir: 'rows', cuts: [[0.20, 0.16], [0.60, 0.54], [0.79, 0.75]],
      sub: [[[0.36, 0.30], [0.68, 0.62]], [], [[0.52, 0.44]], [[0.34, 0.28], [0.67, 0.61]]],
      title: { x: 0.04, y: 0.36, w: 0.92, h: 0.15, align: 'center' },
    },
  },
  heist: {
    name: 'Heist Grid',
    landscape: {
      dir: 'cols', cuts: [[0.47, 0.41], [0.75, 0.70]],
      sub: [[], [[0.62, 0.38]], [[0.42, 0.26], [0.74, 0.60]]],
      title: { x: 0.025, y: 0.47, w: 0.66, h: 0.37, align: 'left' },
    },
    square: {
      dir: 'rows', cuts: [[0.30, 0.25], [0.56, 0.50]],
      sub: [[[0.58, 0.38]], [[0.24, 0.44], [0.80, 0.56]], []],
      title: { x: 0.04, y: 0.57, w: 0.92, h: 0.27, align: 'center' },
    },
    portrait: {
      dir: 'rows', cuts: [[0.26, 0.21], [0.50, 0.45]],
      sub: [[[0.60, 0.40]], [[0.24, 0.42], [0.78, 0.58]], []],
      title: { x: 0.04, y: 0.63, w: 0.92, h: 0.24, align: 'center' },
    },
  },
  crossfire: {
    name: 'Crossfire',
    landscape: {
      dir: 'cols', cuts: [[0.27, 0.20], [0.52, 0.45], [0.78, 0.71]],
      sub: [[[0.48, 0.60]], [[0.30, 0.40], [0.66, 0.74]], [], [[0.45, 0.38]]],
      title: { x: 0.12, y: 0.52, w: 0.76, h: 0.33, align: 'center' },
    },
    square: {
      dir: 'rows', cuts: [[0.26, 0.20], [0.46, 0.52], [0.72, 0.66]],
      sub: [[[0.40, 0.30], [0.74, 0.64]], [[0.55, 0.45]], [[0.40, 0.48]], []],
      title: { x: 0.05, y: 0.62, w: 0.90, h: 0.25, align: 'center' },
    },
    portrait: {
      dir: 'rows', cuts: [[0.22, 0.17], [0.40, 0.45], [0.64, 0.58]],
      sub: [[[0.40, 0.30], [0.74, 0.64]], [[0.55, 0.45]], [[0.40, 0.48]], []],
      title: { x: 0.04, y: 0.61, w: 0.92, h: 0.24, align: 'center' },
    },
  },
  postcard: {
    name: 'Postcard',
    landscape: {
      dir: 'cols', cuts: [[0.64, 0.57]],
      sub: [[], [[0.36, 0.28], [0.70, 0.62]]],
      title: { x: 0.025, y: 0.45, w: 0.56, h: 0.40, align: 'left' },
    },
    square: {
      dir: 'rows', cuts: [[0.30, 0.37]],
      sub: [[[0.36, 0.30], [0.70, 0.64]], []],
      title: { x: 0.04, y: 0.55, w: 0.92, h: 0.29, align: 'center' },
    },
    portrait: {
      dir: 'rows', cuts: [[0.27, 0.33]],
      sub: [[[0.36, 0.30], [0.70, 0.64]], []],
      title: { x: 0.04, y: 0.58, w: 0.92, h: 0.27, align: 'center' },
    },
  },
  split: {
    name: 'Double Cross',
    landscape: {
      dir: 'cols', cuts: [[0.36, 0.28], [0.66, 0.74]],
      sub: [[[0.55, 0.45]], [[0.40, 0.50]], [[0.50, 0.42]]],
      title: { x: 0.10, y: 0.50, w: 0.80, h: 0.36, align: 'center' },
    },
    square: {
      dir: 'rows', cuts: [[0.48, 0.40]],
      sub: [[[0.36, 0.28], [0.68, 0.62]], [[0.55, 0.47]]],
      title: { x: 0.04, y: 0.56, w: 0.92, h: 0.28, align: 'center' },
    },
    portrait: {
      dir: 'rows', cuts: [[0.36, 0.30], [0.60, 0.66]],
      sub: [[[0.55, 0.45]], [[0.40, 0.48]], []],
      title: { x: 0.04, y: 0.62, w: 0.92, h: 0.23, align: 'center' },
    },
  },
};

/** The spec of template `templateId` for size `sizeId`. */
export function layoutSpec(templateId, sizeId) {
  return (TEMPLATES[templateId] ?? TEMPLATES.heist)[sizeId];
}

/** How many panels a spec makes. */
export function panelCount(spec) {
  return spec.sub.reduce((n, s) => n + s.length + 1, 0);
}

function intersect(p1, p2, p3, p4) {
  const d = (p1[0] - p2[0]) * (p3[1] - p4[1]) - (p1[1] - p2[1]) * (p3[0] - p4[0]);
  const a = p1[0] * p2[1] - p1[1] * p2[0], b = p3[0] * p4[1] - p3[1] * p4[0];
  return [(a * (p3[0] - p4[0]) - (p1[0] - p2[0]) * b) / d, (a * (p3[1] - p4[1]) - (p1[1] - p2[1]) * b) / d];
}

/** Moves every edge of a convex polygon inward by `d` pixels. */
export function insetPolygon(poly, d) {
  let area = 0;
  poly.forEach((p, i) => { const q = poly[(i + 1) % poly.length]; area += p[0] * q[1] - q[0] * p[1]; });
  const sign = area > 0 ? 1 : -1;
  const lines = poly.map((p, i) => {
    const q = poly[(i + 1) % poly.length];
    const len = Math.hypot(q[0] - p[0], q[1] - p[1]) || 1;
    const nx = (-(q[1] - p[1]) / len) * sign, ny = ((q[0] - p[0]) / len) * sign;
    return [[p[0] + nx * d, p[1] + ny * d], [q[0] + nx * d, q[1] + ny * d]];
  });
  return lines.map((l, i) => {
    const prev = lines[(i - 1 + lines.length) % lines.length];
    return intersect(prev[0], prev[1], l[0], l[1]);
  });
}

/**
 * The full poster layout for a template and size on a w x h canvas: the panels, the title box, a credits strip
 * along the bottom (`foot`), where the sun disc sits (centred behind the lettering, so it frames the title and
 * never floats over a panel on its own) and the `keepOut` rectangles faces must stay clear of: the title block with
 * its tagline, the sun disc and, when palms are on, the palm crowns in the bottom corners. Rendering and auto-fill
 * both use this, so crops are always worked out against what is actually drawn.
 */
export function posterLayout(templateId, sizeId, w, h, fx = { sun: true, palms: true }) {
  const s = Math.min(w, h);
  const L = computeLayout(layoutSpec(templateId, sizeId), w, h, s * 0.018, s * 0.01, s * 0.052);
  const t = L.title;
  // The title plus its tagline plate (about 0.105 s under the lettering) must end above the credits strip: lift the
  // box by half of any overrun and shrink it by the other half.
  const over = t.y + t.h + s * 0.105 - L.foot.y;
  if (over > 0) { t.y -= over / 2; t.h -= over / 2; }
  L.sun = { cx: t.x + t.w * (t.align === 'center' ? 0.5 : 0.6), cy: t.y + t.h * 0.44, r: t.h * 0.64 };
  L.keepOut = [{ x: t.x, y: t.y - s * 0.01, w: t.w, h: t.h + s * 0.11, weight: 1 }];
  if (fx.sun) L.keepOut.push({ x: L.sun.cx - L.sun.r, y: L.sun.cy - L.sun.r, w: L.sun.r * 2, h: L.sun.r * 2, weight: 1 });
  if (fx.palms) {
    const k = w > h * 1.2 ? 1 : 0.78;
    L.keepOut.push({ x: 0, y: h - s * 0.62 * k, w: s * 0.24 * k, h: s * 0.62 * k, weight: 0.6 });
    L.keepOut.push({ x: w - s * 0.2 * k, y: h - s * 0.5 * k, w: s * 0.2 * k, h: s * 0.5 * k, weight: 0.6 });
  }
  return L;
}

/**
 * Lays out a spec on a w x h canvas: returns { panels: [{ poly, bbox }], title: {x, y, w, h, align}, foot } in
 * pixels. `margin` is the outer frame, `gutter` the gap between panels and `foot` an extra strip kept free at the
 * bottom for the credits, all in pixels.
 */
export function computeLayout(spec, w, h, margin, gutter, foot = 0) {
  const rows = spec.dir === 'rows';
  // Work in "column space" (a = across, b = along); rows swap the axes back at the end.
  const edges = [[[0, 0], [0, 1]], ...spec.cuts.map(([t, b]) => [[t, 0], [b, 1]]), [[1, 0], [1, 1]]];
  const cells = [];
  for (let c = 0; c < edges.length - 1; c++) {
    const left = edges[c], right = edges[c + 1];
    const hs = [[[0, 0], [1, 0]], ...spec.sub[c].map(([l, r]) => [[0, l], [1, r]]), [[0, 1], [1, 1]]];
    for (let r = 0; r < hs.length - 1; r++) {
      const top = hs[r], bot = hs[r + 1];
      cells.push([
        intersect(left[0], left[1], top[0], top[1]),
        intersect(right[0], right[1], top[0], top[1]),
        intersect(right[0], right[1], bot[0], bot[1]),
        intersect(left[0], left[1], bot[0], bot[1]),
      ]);
    }
  }
  const iw = w - 2 * margin, ih = h - 2 * margin - foot;
  const toPx = ([a, b]) => (rows ? [margin + b * iw, margin + a * ih] : [margin + a * iw, margin + b * ih]);
  const panels = cells.map((cell) => {
    const poly = insetPolygon(cell.map(toPx), gutter / 2);
    const xs = poly.map((p) => p[0]), ys = poly.map((p) => p[1]);
    const bbox = { x: Math.min(...xs), y: Math.min(...ys), w: Math.max(...xs) - Math.min(...xs), h: Math.max(...ys) - Math.min(...ys) };
    return { poly, bbox };
  });
  const t = spec.title;
  return {
    panels,
    title: { x: t.x * w, y: t.y * h, w: t.w * w, h: t.h * h, align: t.align },
    foot: { x: margin, y: h - margin - foot, w: iw, h: foot },
  };
}

/** True when point (x, y) lies inside polygon `poly`. */
export function pointInPolygon(poly, x, y) {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i], [xj, yj] = poly[j];
    if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}
