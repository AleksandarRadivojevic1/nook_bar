/** Maps scroll progress (0..1) to a frame index in [0, count-1]. */
export function frameIndex(progress: number, count: number): number {
  if (count <= 1) return 0;
  const p = progress < 0 ? 0 : progress > 1 ? 1 : progress;
  return Math.round(p * (count - 1));
}
