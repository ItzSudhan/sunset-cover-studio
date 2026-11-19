// Sunset Cover Studio — the gta6-cover-art-01 entry (Node 22, standard library only).
//
// The app is this directory's app/ folder: plain static files a desktop browser loads offline (app/index.html and
// its ES modules, no library, no font file and no network request). It turns your own photos and a caption into a
// crime-epic style multi-panel poster: slanted framed panels, a sunset / neon gradient-map grade with glow, grain
// and halftone, and hand-drawn path lettering with gradient fill, outline, extrusion and shadow, exported as a PNG in
// 1920x1080, 1080x1080 or 1080x1350. This program hands it in: it copies app/ and screenshots/ from beside this file
// to /output and writes /output/dossier.json, the summary the judge reads, with the vendored make.fun library.
// The sample photos in app/samples/ are free to use (made for make.fun, and renders of our own original game).
//
// Serve it locally with `node serve.ts`, then open http://localhost:8080.
// Outside the grader's container, MAKEFUN_OUTPUT_DIR stands in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-app.ts';

const here = fileURLToPath(new URL('.', import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

// Sanity check: the app's entry page and its modules are in place, and the screenshots fit the scorer's caps
// (3 or 4 images, each at most 256 KiB). A problem is reported, not fatal, so the hand-in still happens.
for (const file of ['index.html', 'src/editor.js', 'src/renderCover.js', 'src/lettering.js']) {
  if (!existsSync(join(here, 'app', file))) console.warn(`main.ts: app/${file} is missing`);
}
const shotDir = join(here, 'screenshots');
const shots = existsSync(shotDir) ? readdirSync(shotDir).filter((f) => /\.(png|jpe?g)$/i.test(f)).sort() : [];
if (shots.length < 3 || shots.length > 4) console.warn(`main.ts: expected 3 or 4 screenshots, found ${shots.length}`);
for (const f of shots) {
  if (statSync(join(shotDir, f)).size > 262144) console.warn(`main.ts: screenshots/${f} is over 256 KiB`);
}

mkdirSync(out, { recursive: true });
cpSync(join(here, 'app'), join(out, 'app'), { recursive: true });
mkdirSync(join(out, 'screenshots'), { recursive: true });
if (existsSync(join(here, 'screenshots'))) cpSync(join(here, 'screenshots'), join(out, 'screenshots'), { recursive: true });

// The scorer's own caps (reference/gate.json): only text_max_bytes shapes the bytes; the others refuse an entry the
// scorer would refuse (more than 4 screenshots or one over 256 KiB; more than 993 files in app/ or 48 MiB of app
// files, in all, or a path under app/ over 1000 bytes: app/ counts beside /output's own 1000-entry cap, its
// screenshots/ and dossier.json).
writeFileSync(
  join(out, 'dossier.json'),
  buildDossier(out, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    app_max_files: 993,
    app_max_bytes: 50331648,
    app_path_max_bytes: 1000,
  }),
);
