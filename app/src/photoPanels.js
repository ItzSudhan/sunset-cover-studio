// Photos inside panels: each panel shows one photo cropped to its slanted frame, with its own zoom and pan. A panel
// can also "span": it shows its own slice of a photo laid over the whole poster, so one photo runs across panels.

/** Starting crop for panel `i` when `count` photos are loaded: with one photo, every panel gets a different crop. */
export function defaultPanel(i, count) {
  if (count <= 1) {
    const zooms = [1, 1.7, 2.3, 1.4, 2.0, 2.7, 1.5, 2.2];
    const pans = [[0, 0], [-0.7, -0.4], [0.6, 0.3], [0.8, -0.6], [-0.5, 0.6], [0.2, -0.2], [-0.9, 0.1], [0.5, 0.8]];
    return { photo: 0, zoom: zooms[i % 8], panX: pans[i % 8][0], panY: pans[i % 8][1], span: false };
  }
  // Several photos: deal them round the panels, zoomed in a little and favouring the top (where faces usually are).
  return { photo: i % count, zoom: 1.25 + (i % 3) * 0.15, panX: 0, panY: 0.45, span: false };
}

/** A panel polygon's area in pixels (shoelace formula), used to rank panels from hero to smallest. */
export function panelArea(panel) {
  let a = 0;
  panel.poly.forEach((p, i) => { const q = panel.poly[(i + 1) % panel.poly.length]; a += p[0] * q[1] - q[0] * p[1]; });
  return Math.abs(a) / 2;
}

/** The fraction of a panel's bounding box that a rectangle (the title box) covers, per axis. */
export function overlap(panel, rect) {
  const b = panel.bbox;
  const ix = Math.max(0, Math.min(b.x + b.w, rect.x + rect.w) - Math.max(b.x, rect.x));
  const iy = Math.max(0, Math.min(b.y + b.h, rect.y + rect.h) - Math.max(b.y, rect.y));
  return { x: ix / b.w, y: iy / b.h };
}

/**
 * A crop that puts the photo's focus point (a face) at the panel's horizontal centre and a third of the way down,
 * at the given zoom. When the title box (`avoid`) covers the lower part of the panel, the face goes higher, into the
 * part left clear. Pans are clamped, so a face near a photo's edge lands as close as the photo allows.
 */
export function focusCrop(photo, panel, zoom, w, h, avoid = null) {
  const set = { photo: photo.index, zoom, panX: 0, panY: 0, span: false };
  const f = panelFit(photo.img, panel, set, w, h);
  const [fx, fy] = photo.focus;
  let ty = 0.34;
  if (avoid && overlap(panel, avoid).x > 0.3 && avoid.y > f.box.y) {
    const free = (avoid.y - f.box.y) / f.box.h;
    if (free >= 0.22 && free < 0.9) ty = Math.min(0.34, free * 0.5);
  }
  if (f.ox > 0.5) set.panX = (f.box.w * 0.5 - fx * f.dw + f.ox) / f.ox;
  if (f.oy > 0.5) set.panY = (f.box.h * ty - fy * f.dh + f.oy) / f.oy;
  clampPanel(set);
  return set;
}

/** Where a photo lands for a panel: the fitted box, the drawn size and the room it has to pan in each axis. */
export function panelFit(img, panel, set, w, h) {
  const box = set.span ? { x: 0, y: 0, w, h } : panel.bbox;
  const iw = img.width, ih = img.height;
  const scale = Math.max(box.w / iw, box.h / ih) * set.zoom;
  const dw = iw * scale, dh = ih * scale;
  const ox = (dw - box.w) / 2, oy = (dh - box.h) / 2;
  return { box, dw, dh, ox, oy, x: box.x - ox + set.panX * ox, y: box.y - oy + set.panY * oy };
}

/** Clips to a panel's polygon and draws its photo, or a soft placeholder gradient when it has none. */
export function drawPanelPhoto(ctx, img, panel, set, w, h) {
  ctx.save();
  ctx.beginPath();
  panel.poly.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
  ctx.closePath();
  ctx.clip();
  if (img) {
    const f = panelFit(img, panel, set, w, h);
    ctx.drawImage(img, f.x, f.y, f.dw, f.dh);
  } else {
    const b = panel.bbox;
    const g = ctx.createLinearGradient(b.x, b.y, b.x + b.w, b.y + b.h);
    g.addColorStop(0, '#d8d8d8');
    g.addColorStop(1, '#3a3a3a');
    ctx.fillStyle = g;
    ctx.fillRect(b.x, b.y, b.w, b.h);
  }
  ctx.restore();
}

/** Thin framed borders: a dark keyline outside and a light hairline inside each panel. */
export function drawPanelFrames(ctx, panels, grade, s) {
  ctx.save();
  ctx.lineJoin = 'miter';
  for (const p of panels) {
    ctx.beginPath();
    p.poly.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
    ctx.closePath();
    ctx.strokeStyle = 'rgba(0,0,0,0.85)';
    ctx.lineWidth = s * 0.008;
    ctx.stroke();
    ctx.strokeStyle = grade.border;
    ctx.lineWidth = s * 0.0034;
    ctx.stroke();
  }
  ctx.restore();
}

/** Clamps a panel's pan to the photo's edges and its zoom to 1..4. */
export function clampPanel(set) {
  set.zoom = Math.min(4, Math.max(1, set.zoom));
  set.panX = Math.min(1, Math.max(-1, set.panX));
  set.panY = Math.min(1, Math.max(-1, set.panY));
}
