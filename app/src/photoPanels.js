// Photos inside panels: each panel shows one photo cropped to its slanted frame, with its own zoom and pan. A panel
// can also "span": it shows its own slice of a photo laid over the whole poster, so one photo runs across panels.
import { insetPolygon } from './layouts.js';

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

/** Area of the intersection of two rectangles. */
function rectOverlap(a, b) {
  const ix = Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x);
  const iy = Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y);
  return ix > 0 && iy > 0 ? ix * iy : 0;
}

/** The fraction of a rectangle (sampled on a 5 x 5 grid) that falls outside polygon `poly`. */
function outsideFraction(poly, r) {
  let out = 0;
  for (let i = 0; i < 5; i++) for (let j = 0; j < 5; j++) {
    const x = r.x + (r.w * (i + 0.5)) / 5, y = r.y + (r.h * (j + 0.5)) / 5;
    let inside = false;
    for (let a = 0, b = poly.length - 1; a < poly.length; b = a++) {
      const [xa, ya] = poly[a], [xb, yb] = poly[b];
      if ((ya > y) !== (yb > y) && x < ((xb - xa) * (y - ya)) / (yb - ya) + xa) inside = !inside;
    }
    if (!inside) out++;
  }
  return out / 25;
}

/**
 * A face-aware crop for one photo in one panel. `faceFrac` is how tall the face should be, as a fraction of the
 * panel's height (big for the hero). The photo's focus is [x, y, faceHeight] in photo fractions. Candidate crops
 * (a few zooms around the one that gives that face size, and a grid of face positions in the panel) are scored on
 * the face box as actually drawn after pans are clamped to the photo's edges: any overlap with a `keepOut`
 * rectangle (title block, sun disc, palms) or with the panel's slanted edges costs a lot, and drifting from a face
 * a third of the way down the panel at the asked size costs a little. The cheapest crop wins, so faces end up
 * clear of the lettering, sun and palms wherever the panel allows it.
 */
export function focusCrop(photo, panel, faceFrac, w, h, keepOut = []) {
  return scoreCrop(photo, panel, faceFrac, w, h, keepOut).set;
}

/** focusCrop's search, returning the winning crop and its cost (low = the face fits this panel well). */
export function scoreCrop(photo, panel, faceFrac, w, h, keepOut = []) {
  const [fx, fy, fs = 0.16] = photo.focus;
  const base = panelFit(photo.img, panel, { zoom: 1, panX: 0, panY: 0, span: false }, w, h);
  const z0 = Math.min(3.2, Math.max(1, (faceFrac * base.box.h) / (fs * base.dh)));
  let best = null;
  for (const zk of [1, 0.86, 0.74, 0.62, 1.16]) {
    for (const ty of [0.34, 0.27, 0.2, 0.42, 0.5, 0.6, 0.7]) {
      for (const tx of [0.5, 0.4, 0.6, 0.3, 0.7]) {
        const set = { photo: photo.index, zoom: z0 * zk, panX: 0, panY: 0, span: false };
        clampPanel(set);
        const f = panelFit(photo.img, panel, set, w, h);
        if (f.ox > 0.5) set.panX = (f.box.w * tx - fx * f.dw + f.ox) / f.ox;
        if (f.oy > 0.5) set.panY = (f.box.h * ty - fy * f.dh + f.oy) / f.oy;
        clampPanel(set);
        const g = panelFit(photo.img, panel, set, w, h);
        const cx = g.x + fx * g.dw, cy = g.y + fy * g.dh, fh = fs * g.dh;
        // The face box, hair to chin. In a short panel a big face can't fit whole, so score its core (eyes to
        // mouth) instead: that keeps the eyes in frame rather than leaving only a chin.
        const fbh = Math.min(fh * 1.2, g.box.h * 0.8);
        const face = { x: cx - fh * 0.42, y: cy - fbh * 0.46 - (fh * 1.2 - fbh) * 0.12, w: fh * 0.84, h: fbh };
        const area = face.w * face.h;
        let cost = 40 * outsideFraction(panel.poly, face);
        for (const k of keepOut) cost += 60 * (k.weight ?? 1) * (rectOverlap(face, k) / area);
        cost += Math.abs((cx - g.box.x) / g.box.w - 0.5) * 1.5 + Math.abs((cy - g.box.y) / g.box.h - 0.34) * 2;
        cost += Math.abs(Math.log(zk)) * 2.5;
        if (!best || cost < best.cost) best = { cost, set };
      }
    }
  }
  return best;
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

/**
 * Crisp borders: a solid black keyline on each panel's edge (it joins the black gutter) and a slight white line
 * just inside it, like the printed frame of a poster panel.
 */
export function drawPanelFrames(ctx, panels, grade, s) {
  const path = (poly) => {
    ctx.beginPath();
    poly.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
    ctx.closePath();
  };
  ctx.save();
  ctx.lineJoin = 'miter';
  for (const p of panels) {
    path(p.poly);
    ctx.strokeStyle = '#000';
    ctx.lineWidth = s * 0.0056;
    ctx.stroke();
    path(insetPolygon(p.poly, s * 0.0042));
    ctx.strokeStyle = grade.border;
    ctx.globalAlpha = 0.9;
    ctx.lineWidth = Math.max(1, s * 0.0019);
    ctx.stroke();
    ctx.globalAlpha = 1;
  }
  ctx.restore();
}

/** Clamps a panel's pan to the photo's edges and its zoom to 1..4. */
export function clampPanel(set) {
  set.zoom = Math.min(4, Math.max(1, set.zoom));
  set.panX = Math.min(1, Math.max(-1, set.panX));
  set.panY = Math.min(1, Math.max(-1, set.panY));
}
