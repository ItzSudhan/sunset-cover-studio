// Staged scenes for deterministic screenshots, set up from the URL:
//   ?shot=export  shows the exported PNG alone at full size (the very Blob the Download button saves, decoded back);
//   ?shot=editor  shows the editor with the scene loaded.
// Scene parameters: photos=pier,yacht (samples/<name>.jpg), layout, size, grade, title (\n as "|"), tagline,
// select (panel index), span=1 (spread the first photo across every panel). window.__shotReady is set when painted.
import { exportBlob } from './exportPng.js';

export function shotParams(query) {
  return {
    shot: query.get('shot'),
    // Photo order: the first takes the biggest panel. Omitted, all the bundled samples load.
    photos: query.get('photos')?.split(',').filter(Boolean) ?? null,
    layout: query.get('layout'),
    size: query.get('size'),
    grade: query.get('grade'),
    title: query.get('title')?.replace(/\|/g, '\n'),
    tagline: query.get('tagline'),
    select: query.has('select') ? Number(query.get('select')) : null,
    span: query.get('span') === '1',
    // crops=photo:zoom:panX:panY,... one per panel, as a user would set them by clicking, dragging and scrolling.
    // A blank entry keeps that panel's auto-filled face crop.
    crops: query.get('crops')?.split(',').map((c) => {
      if (!c) return null;
      const [photo, zoom, panX, panY] = c.split(':').map(Number);
      return { photo, zoom, panX, panY, span: false };
    }) ?? null,
    fx: query.get('fx'),
  };
}

/** Replaces the page with the exported PNG, drawn 1:1 into a canvas the size of the export. */
export async function stageExport(state) {
  const { blob } = await exportBlob(state);
  const bitmap = await createImageBitmap(blob);
  document.body.className = 'stage';
  document.body.replaceChildren();
  const canvas = document.createElement('canvas');
  canvas.width = bitmap.width;
  canvas.height = bitmap.height;
  canvas.getContext('2d').drawImage(bitmap, 0, 0);
  document.body.append(canvas);
}

/** Lets a test harness fetch the exported PNG (the Download button's Blob) as a data URL. */
export function exposeExport(state) {
  window.__exportDataUrl = async (sizeId) => {
    const { blob } = await exportBlob(state, sizeId ?? state.size);
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.readAsDataURL(blob);
    });
  };
}

export function markReady() {
  requestAnimationFrame(() => requestAnimationFrame(() => { window.__shotReady = true; }));
}
