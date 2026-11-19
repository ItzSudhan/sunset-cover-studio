// Photos inside panels: each panel shows one photo cropped to its slanted frame, with its own zoom and pan. A panel
// can also "span": it shows its own slice of a photo laid over the whole poster, so one photo runs across panels.

/** Starting crop for panel `i` when `count` photos are loaded: with one photo, every panel gets a different crop. */
export function defaultPanel(i, count) {
  if (count <= 1) {
    const zooms = [1, 1.7, 2.3, 1.4, 2.0, 2.7, 1.5, 2.2];
    const pans = [[0, 0], [-0.7, -0.4], [0.6, 0.3], [0.8, -0.6], [-0.5, 0.6], [0.2, -0.2], [-0.9, 0.1], [0.5, 0.8]];
    return { photo: 0, zoom: zooms[i % 8], panX: pans[i % 8][0], panY: pans[i % 8][1], span: false };
  }
  return { photo: i % count, zoom: 1.05, panX: 0, panY: 0, span: false };
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
