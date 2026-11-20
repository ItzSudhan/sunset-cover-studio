// Composes the poster onto a canvas at the canvas's own size. The live preview and the exported PNG both come from
// this one function, so what you see is what you download.
import { GRADES, applyGradientMap, drawBloom, drawGrain, drawHalftone, drawLightLeak, drawPalms, drawSun, drawVignette } from './colorGrade.js';
import { posterLayout } from './layouts.js';
import { drawTitle } from './lettering.js';
import { defaultPanel, drawPanelFrames, drawPanelPhoto } from './photoPanels.js';

export const DEFAULT_CREDITS = 'A Sunset Cover Studio picture · starring the whole crew\nMusic by Night Drive Radio · written & directed by you · coming soon';

/**
 * The billing block in the strip under the panels: up to two lines of tall, condensed capitals (a system sans
 * squeezed sideways, so no font file is needed), centred and sized to fit the strip.
 */
function drawCredits(ctx, text, foot, s, grade) {
  const lines = text.toUpperCase().split('\n').map((l) => l.trim()).filter(Boolean).slice(0, 2);
  if (!lines.length || foot.h < 6) return;
  const size = foot.h * (lines.length > 1 ? 0.36 : 0.52);
  ctx.save();
  ctx.font = `600 ${size}px "Helvetica Neue", Arial, sans-serif`;
  ctx.letterSpacing = `${(size * 0.1).toFixed(1)}px`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = grade.border;
  ctx.globalAlpha = 0.86;
  const widest = Math.max(...lines.map((l) => ctx.measureText(l).width));
  const squeeze = Math.min(0.66, (foot.w * 0.92) / widest);
  lines.forEach((line, i) => {
    const y = foot.y + foot.h * (lines.length > 1 ? 0.3 + i * 0.42 : 0.52);
    ctx.save();
    ctx.translate(foot.x + foot.w / 2, y);
    ctx.scale(squeeze, 1);
    ctx.fillText(line, 0, 0);
    ctx.restore();
  });
  ctx.restore();
}

/** Title and tagline lettering styles for a grade. */
function titleStyle(grade) {
  return {
    weight: 1.75, track: 0.5, skew: 0.17, lead: 1.4, fill: grade.fill,
    outline: grade.outline, outlineW: 0.62, ring: grade.ring, ringW: 0.2,
    extrude: grade.extrude, depth: [0.55, 1.15], shadow: 'rgba(0,0,0,0.7)', glow: grade.glow,
  };
}

function tagStyle(grade) {
  return {
    weight: 1.25, track: 0.75, skew: 0.17, fill: [[0, grade.tagFill], [1, grade.tagFill]],
    outline: grade.outline, outlineW: 0.35, shadow: null, align: 'left', valign: 'top',
  };
}

/** Draws the tagline on a slanted plate with an accent edge, under the title. */
function drawTagline(ctx, text, at, maxW, s, grade) {
  if (!text.trim()) return;
  const h = s * 0.046;
  const style = tagStyle(grade);
  const ink = drawTitle(ctx, [text], { x: 0, y: 0, w: maxW, h }, { ...style, dryRun: true });
  if (!ink) return;
  const padX = h * 0.55, padY = h * 0.32;
  const x = at.align === 'center' ? at.cx - ink.w / 2 : at.x;
  const y = at.y;
  const slant = (ink.h + padY * 2) * 0.17;
  ctx.save();
  ctx.shadowColor = 'rgba(0,0,0,0.5)';
  ctx.shadowBlur = s * 0.012;
  ctx.fillStyle = grade.tagPlate;
  ctx.beginPath();
  ctx.moveTo(x - padX + slant, y - padY);
  ctx.lineTo(x + ink.w + padX + slant, y - padY);
  ctx.lineTo(x + ink.w + padX, y + ink.h + padY);
  ctx.lineTo(x - padX, y + ink.h + padY);
  ctx.closePath();
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.fillStyle = grade.accent;
  ctx.beginPath();
  ctx.moveTo(x - padX + slant, y - padY);
  ctx.lineTo(x - padX + slant + h * 0.22, y - padY);
  ctx.lineTo(x - padX + h * 0.22, y + ink.h + padY);
  ctx.lineTo(x - padX, y + ink.h + padY);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
  drawTitle(ctx, [text], { x, y, w: ink.w + 1, h: ink.h + 1 }, { ...style, maxUnit: ink.unit });
}

/**
 * The rectangle the caption actually covers (the title's ink plus the tagline plate under it), measured with a dry
 * run of the same lettering code, for auto-fill to keep faces out of. Narrow titles leave room for faces beside them.
 */
export function titleKeepOut(state, layout, w, h) {
  const s = Math.min(w, h), t = layout.title;
  const ctx = new OffscreenCanvas(8, 8).getContext('2d');
  const ink = drawTitle(ctx, state.title.split('\n').slice(0, 3), t, { ...titleStyle(GRADES.sunset), align: t.align, dryRun: true });
  if (!ink) return null;
  const pad = s * 0.014, slant = ink.h * 0.17;
  return {
    x: ink.x - pad - slant, y: ink.y - pad, w: ink.w + pad * 2 + slant * 2,
    h: ink.h + pad * 2 + (state.tagline.trim() ? s * 0.105 : 0), weight: 1,
  };
}

/**
 * Renders `state` onto `canvas` and returns the layout (panel polygons in canvas pixels) for hit testing.
 * state: { photos: [{img}], panels: [{photo, zoom, panX, panY, span}], layout, size, grade, intensity,
 *          title, tagline, fx: {sun, palms, grain, halftone} }
 */
export function renderCover(canvas, state) {
  const w = canvas.width, h = canvas.height, s = Math.min(w, h);
  const grade = GRADES[state.grade] ?? GRADES.sunset;
  const layout = posterLayout(state.layout, state.size, w, h, state.fx);

  // 1. Photos in their panels on a black ground (the thin black gutters), then the grade over the lot.
  const layer = new OffscreenCanvas(w, h);
  const lc = layer.getContext('2d', { willReadFrequently: true });
  lc.fillStyle = '#000';
  lc.fillRect(0, 0, w, h);
  layout.panels.forEach((panel, i) => {
    const set = state.panels[i] ?? defaultPanel(i, state.photos.length);
    drawPanelPhoto(lc, state.photos[set.photo]?.img ?? state.photos[0]?.img, panel, set, w, h);
  });
  applyGradientMap(lc, w, h, grade, state.intensity ?? 1);

  // 2. Glow, sun and light leak over the graded photos.
  const ctx = canvas.getContext('2d');
  ctx.save();
  ctx.clearRect(0, 0, w, h);
  ctx.drawImage(layer, 0, 0);
  drawBloom(ctx, layer, w, h, 0.28);
  drawLightLeak(ctx, w, h, grade);
  const t = layout.title;
  // The sun sits right behind the lettering (auto-fill keeps faces out of its disc), so it frames the title.
  if (state.fx.sun) drawSun(ctx, layout.sun.cx, layout.sun.cy, layout.sun.r, grade);
  if (state.fx.halftone) drawHalftone(ctx, w, h, Math.max(4, s * 0.0085), 0.3);

  // 3. Frames, palms, vignette, then the credits strip along the bottom.
  drawPanelFrames(ctx, layout.panels, grade, s);
  if (state.fx.palms) drawPalms(ctx, w, h, grade);
  drawVignette(ctx, w, h, 0.42);
  drawCredits(ctx, state.credits ?? DEFAULT_CREDITS, layout.foot, s, grade);

  // 4. Lettering: the title, then the tagline plate under it.
  const lines = state.title.split('\n').slice(0, 3);
  const ink = drawTitle(ctx, lines, t, { ...titleStyle(grade), align: t.align });
  if (ink) {
    const gap = s * 0.03;
    const at = { x: ink.x + ink.unit * 1.2, cx: ink.x + ink.w / 2, y: ink.y + ink.h + gap, align: t.align };
    drawTagline(ctx, state.tagline, at, Math.min(ink.w * 0.95, w * 0.8), s, grade);
  }

  // 5. A fine grain over everything ties the photos, lettering and frames together.
  if (state.fx.grain) drawGrain(ctx, w, h, 0.2, s / 1080);
  ctx.restore();
  return layout;
}
