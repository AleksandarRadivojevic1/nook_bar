#!/usr/bin/env python3
"""
Draw the "Jedan dan" route.

Earlier versions perturbed an existing smooth curve. That did not work: the
spine ran in long horizontal traverses between cards pinned to opposite edges,
so adding ripples produced a flat line with texture on it rather than a route
that wanders.

This builds the line from the waypoints instead. Each leg is bowed out to one
side by a fraction of its own length, alternating, so the line arcs between
pictures the way a drawn route does; a fine tremor is laid on top. After the
last picture it swings BELOW Leskovac and comes back up to it, so the arrival
is a curve rather than a horizontal run-in.

Invariants, both verified by scripts/check-route.py:
  * passes exactly through all four card anchors
  * terminates exactly on Leskovac (747.1, 1059.2)

Deterministic: SEED is fixed, so re-running reproduces the committed asset.
"""
import math
import random

SEED = 20260731
OUT = 'src/assets/route.path.txt'

START = (500.0, 40.0)
ANCHORS = [(670.0, 215.3), (170.0, 516.7), (720.0, 775.1), (310.0, 1047.8)]
VIA = (545.0, 1268.0)          # swing below the city before turning up to it
END = (747.1, 1059.2)

PER_LEG = 34                   # intermediate points per leg
BOW = [0.20, -0.24, 0.19, -0.17, 0.26, -0.13]   # bow of each leg, as a
                                                # fraction of that leg's length
TREMOR = [(3.4, 9.0), (2.0, 21.0), (1.1, 44.0)]  # amplitude, cycles over path


def catmull(points):
    def seg(p0, p1, p2, p3):
        return ((p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6),
                (p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6))
    parts = [f'M{points[0][0]:.1f},{points[0][1]:.1f}']
    for i in range(len(points) - 1):
        p0 = points[max(i - 1, 0)]
        p1, p2 = points[i], points[i + 1]
        p3 = points[min(i + 2, len(points) - 1)]
        c1, c2 = seg(p0, p1, p2, p3)
        parts.append(f'C{c1[0]:.1f},{c1[1]:.1f} {c2[0]:.1f},{c2[1]:.1f} {p2[0]:.1f},{p2[1]:.1f}')
    return ' '.join(parts)


def main():
    rng = random.Random(SEED)
    waypoints = [START] + ANCHORS + [VIA, END]

    pts = []
    for leg, (a, b) in enumerate(zip(waypoints, waypoints[1:])):
        dx, dy = b[0] - a[0], b[1] - a[1]
        length = math.hypot(dx, dy)
        nx, ny = -dy / length, dx / length
        bow = BOW[leg % len(BOW)] * length
        # a second, smaller lobe placed off-centre keeps the arc from reading
        # as a plain symmetrical bulge
        lobe_at = rng.uniform(0.3, 0.7)
        lobe = bow * rng.uniform(-0.45, -0.2)

        for k in range(PER_LEG):
            t = k / PER_LEG
            base = math.sin(math.pi * t)                       # 0 at both ends
            second = math.exp(-((t - lobe_at) ** 2) / 0.02)
            off = bow * base + lobe * second
            pts.append((a[0] + dx * t + nx * off, a[1] + dy * t + ny * off))
    pts.append(waypoints[-1])

    # fine tremor along the whole line, so it reads as drawn rather than plotted
    phases = [rng.uniform(0, 6.28) for _ in TREMOR]
    out = []
    n = len(pts)
    for i, (x, y) in enumerate(pts):
        t = i / (n - 1)
        j = min(i, n - 2)
        dx, dy = pts[j + 1][0] - pts[j][0], pts[j + 1][1] - pts[j][1]
        ln = math.hypot(dx, dy) or 1.0
        nx, ny = -dy / ln, dx / ln
        v = sum(a * math.sin(2 * math.pi * f * t + p) for (a, f), p in zip(TREMOR, phases))
        edge = min(1.0, min(t, 1 - t) * 14)     # settle at the very ends
        out.append((x + nx * v * edge, y + ny * v * edge))

    # the pictures and the pin are load-bearing: put them back exactly
    for ax, ay in ANCHORS:
        i = min(range(1, len(out) - 1),
                key=lambda k: (out[k][0] - ax) ** 2 + (out[k][1] - ay) ** 2)
        out[i] = (ax, ay)
    out[0], out[-1] = START, END

    path = catmull(out)
    open(OUT, 'w').write(path)
    print(f'points={len(out)} chars={len(path)}')


if __name__ == '__main__':
    main()
