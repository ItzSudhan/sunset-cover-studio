// The bundled sample photos (fictional people, generated for this app) and where each one's face sits, as fractions
// of the photo's width and height. Auto-fill uses the focus point to crop every panel tight on a face, with the eyes
// in the upper third. The third number is the face's height as a fraction of the photo's height, so auto-fill can
// size every face to its panel (big for the hero) and keep the whole face, chin included, clear of the lettering.
// Photos you add yourself get a sensible guess (faces are usually top-centre).

export const SAMPLES = [
  { name: 'floral-shirt', focus: [0.46, 0.27, 0.26] },
  { name: 'duffel-bags', focus: [0.34, 0.1, 0.12] },
  { name: 'sequined-dress', focus: [0.57, 0.2, 0.2] },
  { name: 'motor-scooter', focus: [0.66, 0.2, 0.13] },
  { name: 'yacht', focus: [0.36, 0.24, 0.17] },
  { name: 'neon-alley', focus: [0.47, 0.21, 0.18] },
  { name: 'convertible', focus: [0.48, 0.21, 0.15] },
  { name: 'muscle-car', focus: [0.47, 0.31, 0.19] },
  { name: 'pier', focus: [0.46, 0.28, 0.26] },
  { name: 'art-deco', focus: [0.47, 0.26, 0.16] },
  { name: 'boulevard', focus: [0.57, 0.21, 0.18] },
];

export const DEFAULT_FOCUS = [0.5, 0.3, 0.16];

export function sampleFocus(name) {
  return SAMPLES.find((s) => s.name === name)?.focus ?? DEFAULT_FOCUS;
}
