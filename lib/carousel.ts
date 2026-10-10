/** Stable, reversible orbit shared by rendering and regression tests. */
export function carouselPose(
  index: number,
  phase: number,
  count: number,
  radius: number,
) {
  const angle = ((index - phase) / count) * Math.PI * 2;
  const facing = Math.cos(angle);
  return {
    x: Math.sin(angle) * radius,
    y: Math.sin(angle * 2) * 14,
    z: (facing - 1) * radius * 0.95,
    rotationY: (angle * 180) / Math.PI,
    opacity: facing < -0.15 ? 0.24 : 0.45 + 0.55 * Math.max(0, facing),
    zIndex: Math.round((facing + 1) * 100),
  };
}
export function roundedSignal(value: number) {
  return Number(value.toFixed(3));
}
