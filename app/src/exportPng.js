// PNG export at the chosen size: renders the cover at full resolution with the same renderer as the preview and
// hands the browser a download (cover-1920x1080.png and friends).
import { SIZES } from './layouts.js';
import { renderCover } from './renderCover.js';

/** Renders `state` at its export size (or `sizeId`) onto a fresh canvas. */
export function renderExportCanvas(state, sizeId = state.size) {
  const size = SIZES[sizeId];
  const canvas = document.createElement('canvas');
  canvas.width = size.w;
  canvas.height = size.h;
  renderCover(canvas, { ...state, size: sizeId });
  return canvas;
}

/** The exported PNG as a Blob, plus its file name. */
export async function exportBlob(state, sizeId = state.size) {
  const canvas = renderExportCanvas(state, sizeId);
  const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/png'));
  return { blob, name: `sunset-cover-${canvas.width}x${canvas.height}.png` };
}

/** Saves the PNG through a download link. */
export async function downloadPng(state, sizeId = state.size) {
  const { blob, name } = await exportBlob(state, sizeId);
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = name;
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 4000);
  return name;
}
