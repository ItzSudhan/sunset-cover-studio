// The editor: add photos, pick a layout, size and grade, write the caption, then click a panel in the live preview
// to place a photo in it, drag to pan and scroll (or use the slider) to zoom. Download writes the PNG.
import { GRADES } from './colorGrade.js';
import { downloadPng } from './exportPng.js';
import { SIZES, TEMPLATES, layoutSpec, panelCount, pointInPolygon, posterLayout } from './layouts.js';
import { clampPanel, defaultPanel, focusCrop, overlap, panelArea, panelFit, scoreCrop } from './photoPanels.js';
import { DEFAULT_CREDITS, renderCover, titleKeepOut } from './renderCover.js';
import { DEFAULT_FOCUS, SAMPLES, sampleFocus } from './samples.js';
import { exposeExport, markReady, shotParams, stageExport } from './shots.js';

const $ = (id) => document.getElementById(id);
const preview = $('preview');
const wrap = $('previewWrap');

const state = {
  photos: [],
  order: [],
  panels: [],
  layout: 'lineup',
  size: 'landscape',
  grade: 'sunset',
  intensity: 1,
  title: 'Sunset\nStreets',
  tagline: 'Coming soon',
  credits: DEFAULT_CREDITS,
  fx: { sun: true, palms: false, grain: true, halftone: false },
};
let selected = 0;
let layout = null;
let queued = false;

/** The poster layout at export size (panels, title, sun and keep-out zones), so crops use full resolution. */
function exportLayout() {
  const size = SIZES[state.size];
  const L = posterLayout(state.layout, state.size, size.w, size.h, state.fx);
  // Swap the whole title box for the rectangle the caption really covers, so faces can sit beside a short title.
  const ink = titleKeepOut(state, L, size.w, size.h);
  if (ink) L.keepOut[0] = ink;
  return { size, ...L };
}

/**
 * Deals the photos onto the panels: photos in `state.order` go to panels from the most face-friendly (the hero) to
 * the least, where that is the panel's area minus what the title, sun and palms cover. Each photo gets a face-aware
 * crop: the hero's face fills a big share of its panel, and every face is kept clear of the title block and sun
 * disc. With fewer photos than panels they repeat, zoomed closer so no two panels match.
 */
function autoFill() {
  const n = state.photos.length;
  state.panels = Array.from({ length: 12 }, (_, i) => defaultPanel(i, n));
  if (n <= 1) return;
  const { size, panels, keepOut } = exportLayout();
  const visible = (p) => {
    let hidden = 0;
    for (const k of keepOut) { const o = overlap(p, k); hidden += o.x * o.y * (k.weight ?? 1); }
    return panelArea(p) * Math.max(0.05, 1 - hidden);
  };
  const rank = panels.map((p, i) => [i, visible(p)]).sort((a, b) => b[1] - a[1]).map(([i]) => i);
  // Panel by panel (hero first), pick the unused photo whose face fits that panel best, with a mild preference for
  // the dealing order: a short panel above the title gets a photo with a small face instead of a cut-off close-up.
  const used = new Set();
  rank.forEach((pi, k) => {
    let pool = state.order.filter((i) => !used.has(i));
    if (!pool.length) { used.clear(); pool = [...state.order]; }
    const face = k === 0 ? 0.38 : k < n ? 0.3 : 0.4;
    let best = null;
    pool.forEach((idx, j) => {
      const r = scoreCrop(state.photos[idx], panels[pi], face, size.w, size.h, keepOut);
      const cost = r.cost + j * 0.6;
      if (!best || cost < best.cost) best = { cost, set: r.set, idx };
    });
    used.add(best.idx);
    state.panels[pi] = best.set;
  });
}

/** Puts photo `i` in panel `pi`, cropped on its face and clear of the lettering. */
function placePhoto(i, pi) {
  const { size, panels, keepOut } = exportLayout();
  if (!panels[pi]) return;
  state.panels[pi] = focusCrop(state.photos[i], panels[pi], 0.3, size.w, size.h, keepOut);
}

function loadBitmap(src) {
  return fetch(src).then((r) => r.blob()).then((b) => createImageBitmap(b));
}

function setPhotos(photos) {
  state.photos = photos.map((p, index) => ({ ...p, index }));
  state.order = state.photos.map((_, i) => i);
}

async function addFiles(files) {
  const images = [...files].filter((f) => f.type.startsWith('image/'));
  if (!images.length) return;
  const fresh = state.photos.every((p) => p.sample);
  const loaded = await Promise.all(images.map(async (f) => ({ img: await createImageBitmap(f), name: f.name, sample: false, focus: DEFAULT_FOCUS })));
  setPhotos(fresh ? loaded : [...state.photos, ...loaded]);
  autoFill();
  status(`${loaded.length} photo${loaded.length > 1 ? 's' : ''} added: the first is the hero, the rest fill the panels in order.`);
  refreshAll();
}

/** Re-deals the photos in a new random order (the hero changes too). */
function shuffle() {
  const o = state.order;
  for (let i = o.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [o[i], o[j]] = [o[j], o[i]]; }
  autoFill();
  status('Shuffled: the cast is re-dealt, every face still clear of the title.');
  refreshPanelControls();
  redraw();
}

function status(text) { $('status').textContent = text; }

// ---- Preview -------------------------------------------------------------------------------------------------

function fitPreview() {
  const size = SIZES[state.size];
  const availW = wrap.clientWidth - 8, availH = wrap.clientHeight - 8;
  const scale = Math.min(availW / size.w, availH / size.h);
  const cssW = Math.max(200, Math.floor(size.w * scale)), cssH = Math.max(120, Math.floor(size.h * scale));
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  preview.style.width = `${cssW}px`;
  preview.style.height = `${cssH}px`;
  preview.width = Math.min(size.w, Math.round(cssW * dpr));
  preview.height = Math.round(preview.width * size.h / size.w);
}

function draw() {
  queued = false;
  layout = renderCover(preview, state);
  const panel = layout.panels[selected];
  if (!panel) return;
  // Selection outline: preview only, never in the export.
  const ctx = preview.getContext('2d');
  ctx.save();
  ctx.beginPath();
  panel.poly.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
  ctx.closePath();
  ctx.lineWidth = Math.max(2, preview.width * 0.003);
  ctx.setLineDash([preview.width * 0.012, preview.width * 0.008]);
  ctx.strokeStyle = '#3df2ff';
  ctx.shadowColor = '#000';
  ctx.shadowBlur = 6;
  ctx.stroke();
  ctx.restore();
}

function redraw() {
  if (!queued) { queued = true; requestAnimationFrame(draw); }
}

function canvasPoint(e) {
  const r = preview.getBoundingClientRect();
  return [(e.clientX - r.left) * preview.width / r.width, (e.clientY - r.top) * preview.height / r.height];
}

function hitPanel(e) {
  if (!layout) return -1;
  const [x, y] = canvasPoint(e);
  return layout.panels.findIndex((p) => pointInPolygon(p.poly, x, y));
}

let drag = null;
preview.addEventListener('pointerdown', (e) => {
  const i = hitPanel(e);
  if (i < 0) return;
  selected = i;
  preview.setPointerCapture(e.pointerId);
  drag = { last: canvasPoint(e) };
  refreshPanelControls();
  redraw();
});
preview.addEventListener('pointermove', (e) => {
  if (!drag) { preview.style.cursor = hitPanel(e) >= 0 ? 'grab' : 'default'; return; }
  const p = canvasPoint(e);
  const set = state.panels[selected];
  const img = state.photos[set.photo]?.img;
  if (img) {
    const f = panelFit(img, layout.panels[selected], set, preview.width, preview.height);
    if (f.ox > 0.5) set.panX += (p[0] - drag.last[0]) / f.ox;
    if (f.oy > 0.5) set.panY += (p[1] - drag.last[1]) / f.oy;
    clampPanel(set);
  }
  drag.last = p;
  preview.style.cursor = 'grabbing';
  redraw();
});
const endDrag = () => { drag = null; };
preview.addEventListener('pointerup', endDrag);
preview.addEventListener('pointercancel', endDrag);
// Drag a tray thumbnail onto a panel to put that photo there.
const PHOTO_TYPE = 'application/x-cover-photo';
preview.addEventListener('dragover', (e) => {
  if (!e.dataTransfer.types.includes(PHOTO_TYPE)) return;
  e.preventDefault();
  e.dataTransfer.dropEffect = 'copy';
  const i = hitPanel(e);
  if (i >= 0 && i !== selected) { selected = i; refreshPanelControls(); redraw(); }
});
preview.addEventListener('drop', (e) => {
  if (!e.dataTransfer.types.includes(PHOTO_TYPE)) return;
  e.preventDefault();
  e.stopPropagation();
  const i = hitPanel(e);
  if (i < 0) return;
  selected = i;
  placePhoto(Number(e.dataTransfer.getData(PHOTO_TYPE)), i);
  refreshPanelControls();
  redraw();
});
preview.addEventListener('wheel', (e) => {
  const i = hitPanel(e);
  if (i < 0) return;
  e.preventDefault();
  selected = i;
  const set = state.panels[i];
  set.zoom *= Math.exp(-e.deltaY * 0.0015);
  clampPanel(set);
  refreshPanelControls();
  redraw();
}, { passive: false });

// ---- Controls ------------------------------------------------------------------------------------------------

function chips(container, entries, current, onPick, render) {
  container.replaceChildren(...entries.map(([id, label]) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'chip' + (id === current ? ' on' : '');
    b.setAttribute('aria-pressed', String(id === current));
    if (render) render(b, id); else b.textContent = label;
    b.addEventListener('click', () => onPick(id));
    return b;
  }));
}

function refreshChips() {
  chips($('layouts'), Object.entries(TEMPLATES).map(([id, t]) => [id, `${t.name} · ${panelCount(layoutSpec(id, state.size))}`]),
    state.layout, (id) => { state.layout = id; selected = 0; autoFill(); refreshAll(); });
  chips($('sizes'), Object.values(SIZES).map((s) => [s.id, s.label]), state.size,
    (id) => { state.size = id; selected = 0; autoFill(); refreshAll(); });
  chips($('grades'), Object.entries(GRADES).map(([id, g]) => [id, g.name]), state.grade,
    (id) => { state.grade = id; refreshAll(); },
    (b, id) => {
      const g = GRADES[id];
      const sw = document.createElement('span');
      sw.className = 'swatch';
      sw.style.background = `linear-gradient(90deg, ${g.map.slice(1).join(',')})`;
      b.append(sw, document.createTextNode(g.name));
    });
}

function refreshThumbs() {
  const set = state.panels[selected];
  const n = layout ? layout.panels.length : 0;
  const used = new Set(state.panels.slice(0, n).map((p) => p.photo));
  $('trayCount').textContent = `${state.photos.length} photo${state.photos.length === 1 ? '' : 's'}`;
  $('thumbs').replaceChildren(...state.photos.map((p, i) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'thumb' + (set && set.photo === i ? ' on' : '') + (used.has(i) ? ' used' : '');
    b.title = `Drag ${p.name} onto a panel, or click to put it in panel ${selected + 1}`;
    b.draggable = true;
    const c = document.createElement('canvas');
    c.width = 120; c.height = 120;
    const k = Math.max(120 / p.img.width, 120 / p.img.height);
    const dw = p.img.width * k, dh = p.img.height * k;
    // Thumbnails are cropped square around the face, like the panels.
    const x = Math.min(0, Math.max(120 - dw, 60 - p.focus[0] * dw)), y = Math.min(0, Math.max(120 - dh, 48 - p.focus[1] * dh));
    c.getContext('2d').drawImage(p.img, x, y, dw, dh);
    b.append(c);
    b.addEventListener('dragstart', (e) => {
      e.dataTransfer.setData(PHOTO_TYPE, String(i));
      e.dataTransfer.effectAllowed = 'copy';
      e.dataTransfer.setDragImage(c, 30, 30);
    });
    b.addEventListener('click', () => {
      placePhoto(i, selected);
      refreshPanelControls();
      redraw();
    });
    return b;
  }));
}

function refreshPanelControls() {
  const n = layout ? layout.panels.length : panelCount(layoutSpec(state.layout, state.size));
  if (selected >= n) selected = 0;
  const set = state.panels[selected];
  $('panelLabel').textContent = `Panel ${selected + 1} of ${n}`;
  $('zoom').value = String(set.zoom);
  $('span').checked = set.span;
  refreshThumbs();
}

function refreshAll() {
  refreshChips();
  fitPreview();
  draw();
  refreshPanelControls();
}

$('photoInput').addEventListener('change', (e) => { addFiles(e.target.files); e.target.value = ''; });
window.addEventListener('dragover', (e) => {
  if (!e.dataTransfer.types.includes('Files')) return;
  e.preventDefault();
  document.body.classList.add('dropping');
});
window.addEventListener('dragleave', (e) => { if (!e.relatedTarget) document.body.classList.remove('dropping'); });
window.addEventListener('drop', (e) => {
  e.preventDefault();
  document.body.classList.remove('dropping');
  addFiles(e.dataTransfer.files);
});
$('title').addEventListener('input', (e) => { state.title = e.target.value; redraw(); });
$('tagline').addEventListener('input', (e) => { state.tagline = e.target.value; redraw(); });
$('credits').addEventListener('input', (e) => { state.credits = e.target.value; redraw(); });
$('intensity').addEventListener('input', (e) => { state.intensity = Number(e.target.value); redraw(); });
for (const key of Object.keys(state.fx)) {
  $(`fx-${key}`).addEventListener('change', (e) => { state.fx[key] = e.target.checked; redraw(); });
}
$('zoom').addEventListener('input', (e) => { state.panels[selected].zoom = Number(e.target.value); clampPanel(state.panels[selected]); redraw(); });
$('span').addEventListener('change', (e) => { state.panels[selected].span = e.target.checked; redraw(); });
$('spreadAll').addEventListener('click', () => {
  const photo = state.panels[selected].photo;
  state.panels.forEach((p) => Object.assign(p, { photo, zoom: 1, panX: 0, panY: 0, span: true }));
  status('One photo now runs across every panel. Click a panel to change just that one.');
  refreshPanelControls();
  redraw();
});
$('mixAll').addEventListener('click', () => {
  state.order = state.photos.map((_, i) => i);
  autoFill();
  status('Photos dealt in order: the first is the hero, the rest fill the panels.');
  refreshPanelControls();
  redraw();
});
$('shuffle').addEventListener('click', shuffle);
$('resetPanel').addEventListener('click', () => {
  Object.assign(state.panels[selected], { zoom: 1, panX: 0, panY: 0 });
  refreshPanelControls();
  redraw();
});
$('download').addEventListener('click', async () => {
  status('Rendering…');
  status(`Saved ${await downloadPng(state)}`);
});
$('downloadAll').addEventListener('click', async () => {
  const names = [];
  for (const id of Object.keys(SIZES)) names.push(await downloadPng(state, id));
  status(`Saved ${names.join(', ')}`);
});
window.addEventListener('resize', () => {
  if (document.body.classList.contains('stage')) return;
  fitPreview();
  redraw();
});

// ---- Start: sample photos (or a staged screenshot scene) -------------------------------------------------------

async function start() {
  const params = shotParams(new URLSearchParams(location.search));
  const names = params.photos ?? SAMPLES.map((s) => s.name);
  setPhotos(await Promise.all(names.map(async (n) => ({
    img: await loadBitmap(`samples/${n}.jpg`), name: `${n}.jpg`, sample: true, focus: sampleFocus(n),
  }))));
  if (params.shot) {
    for (const k of ['layout', 'size', 'grade', 'title', 'tagline', 'credits']) if (params[k] != null) state[k] = params[k];
    if (params.fx != null) for (const k of Object.keys(state.fx)) state.fx[k] = params.fx.includes(k);
  }
  autoFill();
  $('credits').value = state.credits;
  if (params.shot) {
    if (params.select != null) selected = params.select;
    if (params.crops) params.crops.forEach((c, i) => { if (c) state.panels[i] = c; });
    if (params.span) state.panels.forEach((p) => Object.assign(p, { photo: 0, zoom: 1, panX: 0, panY: 0, span: true }));
    for (const k of Object.keys(state.fx)) $(`fx-${k}`).checked = state.fx[k];
    $('title').value = state.title;
    $('tagline').value = state.tagline;
    exposeExport(state);
  }
  if (params.shot === 'export') {
    document.body.classList.add('stage');
    await stageExport(state);
  } else {
    refreshAll();
    if (!params.shot) status(`${state.photos.length} sample photos loaded. Add your own (several at once) to replace them.`);
  }
  markReady();
}

start();
