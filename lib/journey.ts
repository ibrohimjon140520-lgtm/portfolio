export type Vec3 = [number, number, number];
export const cameraStops: { position: Vec3; target: Vec3 }[] = [
  { position: [0, 0.6, 10], target: [0, 0, 0] },
  { position: [2, -0.3, 5.8], target: [0, -0.6, -2] },
  { position: [1.8, -1.2, -10], target: [0, -2, -20] },
  { position: [-1, -2, -23], target: [2, -2, -32] },
  { position: [0.8, -0.2, -39], target: [0, 0, -48] },
  { position: [-2, -2, -55], target: [0, -2, -64] },
  { position: [1, -3, -73], target: [0, -3, -84] },
  { position: [2, -1, -92], target: [0, -1, -101] },
  { position: [-2, -3, -111], target: [0, -3, -121] },
  { position: [1, -1, -130], target: [0, -1, -141] },
  { position: [0, 0, -149], target: [0, 0, -160] },
  { position: [0, 0, -158], target: [0, 0, -170] },
];
export const sceneCount = cameraStops.length;
export const clamp = (n: number, min = 0, max = 1) =>
  Math.min(max, Math.max(min, n));
export const smooth = (n: number) => {
  const t = clamp(n);
  return t * t * (3 - 2 * t);
};
export function chapterState(progress: number) {
  const scaled = clamp(progress) * (sceneCount - 1);
  const from = Math.min(sceneCount - 2, Math.floor(scaled));
  return { from, to: from + 1, mix: smooth(scaled - from) };
}
