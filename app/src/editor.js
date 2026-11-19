// The editor: add photos, pick a layout, size and grade, write the caption, then click a panel in the live preview
// to place a photo in it, drag to pan and scroll (or use the slider) to zoom. Download writes the PNG.
import { GRADES } from './colorGrade.js';
import { downloadPng } from './exportPng.js';
import { SIZES, TEMPLATES, layoutSpec, panelCount, pointInPolygon } from './layouts.js';
import { clampPanel, defaultPanel, panelFit } from './photoPanels.js';
import { renderCover } from './renderCover.js';
import { markReady, shotParams, stageExport } from './shots.js';

const $ = (id) => document.getElementById(id);
const preview = $('preview');
const wrap = $('previewWrap');

const state = {
  photos: [],
  panels: [],
  layout: 'heist',
  size: 'landscape',
  grade: 'sunset',
  intensity: 1,
  title: 'Sunset\nStreets',
  tagline: 'Coming this summer',
  fx: { sun: true, palms: true, grain: true, halftone: true },
};
let selected = 0;
let layout = null;
let queued = false;

/** Gives every panel a fresh starting crop for the photos now loaded. */
function autoFill() {
  state.panels = Array.from({ length: 8 }, (_, i) => defaultPanel(i, state.photos.length));
}

function loadBitmap(src) {
  return fetch(src).then((r) => r.blob()).then((b) => createImageBitmap(b));
}

async function addFiles(files) {
  const images = [...files].filter((f) => f.type.startsWith('image/'));
  if (!images.length) return;
  const fresh = state.photos.every((p) => p.sample);
  const loaded = await Promise.all(images.map(async (f) => ({ img: await createImageBitmap(f), name: f.name, sample: false })));
  state.photos = fresh ? loaded : [...state.photos, ...loaded];
  autoFill();
  status(`${loaded.length} photo${loaded.length > 1 ? 's' : ''} added and spread over the panels.`);
  refreshAll();
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
    state.layout, (id) => { state.layout = id; selected = 0; refreshAll(); });
  chips($('sizes'), Object.values(SIZES).map((s) => [s.id, s.label]), state.size,
    (id) => { state.size = id; selected = 0; refreshAll(); });
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
  $('thumbs').replaceChildren(...state.photos.map((p, i) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'thumb' + (set && set.photo === i ? ' on' : '');
    b.title = `Put ${p.name} in panel ${selected + 1}`;
    const c = document.createElement('canvas');
    c.width = 96; c.height = 64;
    const k = Math.max(96 / p.img.width, 64 / p.img.height);
    c.getContext('2d').drawImage(p.img, (96 - p.img.width * k) / 2, (64 - p.img.height * k) / 2, p.img.width * k, p.img.height * k);
    b.append(c);
    b.addEventListener('click', () => {
      Object.assign(state.panels[selected], { photo: i, zoom: 1.05, panX: 0, panY: 0 });
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
window.addEventListener('dragover', (e) => { e.preventDefault(); document.body.classList.add('dropping'); });
window.addEventListener('dragleave', (e) => { if (!e.relatedTarget) document.body.classList.remove('dropping'); });
window.addEventListener('drop', (e) => {
  e.preventDefault();
  document.body.classList.remove('dropping');
  addFiles(e.dataTransfer.files);
});
$('title').addEventListener('input', (e) => { state.title = e.target.value; redraw(); });
$('tagline').addEventListener('input', (e) => { state.tagline = e.target.value; redraw(); });
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
$('mixAll').addEventListener('click', () => { autoFill(); status('Photos re-dealt across the panels.'); refreshPanelControls(); redraw(); });
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
window.addEventListener('resize', () => { fitPreview(); redraw(); });

// ---- Start: sample photos (or a staged screenshot scene) -------------------------------------------------------

async function start() {
  const params = shotParams(new URLSearchParams(location.search));
  const names = params.shot ? params.photos : ['chase', 'street', 'heist', 'boulevard', 'pier'];
  state.photos = await Promise.all(names.map(async (n) => ({ img: await loadBitmap(`samples/${n}.jpg`), name: `${n}.jpg`, sample: true })));
  autoFill();
  if (params.shot) {
    for (const k of ['layout', 'size', 'grade', 'title', 'tagline']) if (params[k] != null) state[k] = params[k];
    if (params.select != null) selected = params.select;
    if (params.crops) params.crops.forEach((c, i) => { state.panels[i] = c; });
    if (params.fx != null) for (const k of Object.keys(state.fx)) state.fx[k] = params.fx.includes(k);
    if (params.span) state.panels.forEach((p) => Object.assign(p, { photo: 0, zoom: 1, panX: 0, panY: 0, span: true }));
    $('title').value = state.title;
    $('tagline').value = state.tagline;
  }
  if (params.shot === 'export') {
    await stageExport(state);
  } else {
    refreshAll();
    if (!params.shot) status('Sample photos loaded. Add your own to replace them.');
  }
  markReady();
}

start();
