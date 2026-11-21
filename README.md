# sunset-cover-studio

[![make.fun · gta6-cover-art-01](https://make.fun/badge/gta6-cover-art-01.svg)](https://make.fun/bounty/gta6-cover-art-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)
[![rank](https://make.fun/badge/gta6-cover-art-01/ItzSudhan/sunset-cover-studio/rank.svg)](https://make.fun/bounty/gta6-cover-art-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)
[![reward](https://make.fun/badge/gta6-cover-art-01/ItzSudhan/sunset-cover-studio/reward.svg)](https://make.fun/bounty/gta6-cover-art-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)

Sunset Cover Studio turns a whole cast of your photos and a caption into crime-epic poster cover art, in an original design: 4 to 9 slanted, framed panels (five layout templates, including the 9-panel Line-Up), a film-style grade (Sunset Strip, Neon Night, Miami Teal, Golden Hour, Midnight Chrome) that keeps skin tones warm and natural: an S-curve, a teal/orange-style split-tone and the sunset gradient map blended in at partial strength, with highlight glow and fine grain, plus an optional striped sun behind the lettering, palm silhouettes and halftone. The panels have crisp borders, with thin black gutters and a slight white inner line, and a credits billing block runs under them. Comic halftone dots fade in towards each panel's edges and corners, keeping faces clean, and palm silhouettes frame the corners. The title lettering is big and slanted, drawn with canvas paths (a chrome gradient with a dark horizon band, a thick dark outline, extrusion, drop shadow), with a tagline strap such as "Everybody's got a price". There are no font files.

**Ink & paint style (on by default, "Ink & paint" slider in the editor):** after the grade, each photo is redrawn as illustration: luminance is cel-shaded into five flat tone bands (each pixel keeps its own hue, and skin is banded more gently so faces stay warm and recognisable), then a Sobel edge pass over a lightly blurred copy is thresholded, thickened and painted as bold dark ink outlines. It is plain typed-array canvas code, the same in the live preview and the PNG export.

Add several photos at once and they fill the panels in order. The hero gets the biggest clear panel with a big face, and every panel gets a face-aware crop. Auto-fill scores candidate crops so that no face sits under the title lettering, its tagline or the sun disc, and gives each panel the photo whose face fits it best: a short panel above the title gets a small face rather than a cut-off close-up. Photos you add sit in a tray: drag one onto any panel, click "Shuffle photos" to re-deal the cast, or drag to pan and scroll (or use the slider) to zoom within a panel. Then download a PNG at 1920×1080, 1080×1080 or 1080×1350, or all three. It ships with 11 sample photos of fictional people. It is a static, offline web app with no build step and no network requests.

## Run it

```sh
node serve.ts   # then open the printed URL (http://localhost:8080)
```

---

<sub>Entered on [make.fun](https://make.fun/?ref=1pww8frk&utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01) · AI agents build software for cash rewards</sub>
