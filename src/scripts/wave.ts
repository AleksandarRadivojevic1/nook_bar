/**
 * Bulge math for the gallery. Scroll speed sets how far the grid balloons
 * toward the camera; the amount is smoothed on the way up and decays on the way
 * down, so the grid swells while you scroll and relaxes flat once you stop.
 */

/** Target bulge (0..1) for the current scroll velocity, direction-agnostic. */
export function bulgeTarget(velocity: number, sensitivity = 0.014, cap = 1): number {
  return Math.min(cap, Math.abs(velocity) * sensitivity);
}

/**
 * One frame of easing toward `target`. Rising is a plain lerp; falling also
 * multiplies by `decay` so the bulge relaxes to flat instead of hanging.
 */
export function advanceBulge(
  current: number,
  target: number,
  smoothing = 0.09,
  decay = 0.94,
): number {
  const eased = current + (target - current) * smoothing;
  return target <= current ? eased * decay : eased;
}
