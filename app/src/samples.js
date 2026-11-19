// The bundled sample photos (fictional people, generated for this app) and where each one's face sits, as fractions
// of the photo's width and height. Auto-fill uses the focus point to crop every panel tight on a face, with the eyes
// in the upper third. Photos you add yourself get a sensible guess (faces are usually top-centre).

export const SAMPLES = [
  { name: 'floral-shirt', focus: [0.47, 0.24] },
  { name: 'duffel-bags', focus: [0.52, 0.22] },
  { name: 'sequined-dress', focus: [0.40, 0.22] },
  { name: 'motor-scooter', focus: [0.66, 0.2] },
  { name: 'yacht', focus: [0.58, 0.24] },
  { name: 'neon-alley', focus: [0.47, 0.2] },
  { name: 'convertible', focus: [0.48, 0.26] },
  { name: 'muscle-car', focus: [0.47, 0.33] },
  { name: 'pier', focus: [0.47, 0.36] },
  { name: 'art-deco', focus: [0.47, 0.22] },
  { name: 'boulevard', focus: [0.57, 0.21] },
];

export const DEFAULT_FOCUS = [0.5, 0.3];

export function sampleFocus(name) {
  return SAMPLES.find((s) => s.name === name)?.focus ?? DEFAULT_FOCUS;
}
