#!/usr/bin/env python3
"""Verify the route still passes through the pictures and lands on the pin."""
import json, math, re, sys

d = open('src/assets/route.path.txt').read()
nums = [float(n) for n in re.findall(r'-?\d+\.?\d*', d)]
start, segs, i = (nums[0], nums[1]), [], 2
while i + 5 < len(nums):
    segs.append(tuple(nums[i:i + 6])); i += 6

def bez(p0, c1, c2, p1, t):
    u = 1 - t
    return (u**3*p0[0] + 3*u**2*t*c1[0] + 3*u*t**2*c2[0] + t**3*p1[0],
            u**3*p0[1] + 3*u**2*t*c1[1] + 3*u*t**2*c2[1] + t**3*p1[1])

pts, cur = [], start
for s in segs:
    for k in range(20):
        pts.append(bez(cur, (s[0], s[1]), (s[2], s[3]), (s[4], s[5]), k / 20))
    cur = (s[4], s[5])
pts.append(cur)

import glob
targets = []
for f in sorted(glob.glob('src/content/dan/*.json')):
    c = json.load(open(f, encoding='utf-8'))
    targets.append((f'{c["n"]} {c["title"]["sr"]}', tuple(c['anchor'])))
targets.append(('PIN Leskovac', (747.1, 1059.2)))

worst = 0.0
for name, (ax, ay) in targets:
    dist = min(math.hypot(p[0] - ax, p[1] - ay) for p in pts)
    worst = max(worst, dist)
    print(f'  {name:16s} {dist:6.2f} units')
print(f'worst = {worst:.2f}')
sys.exit(1 if worst > 1.0 else 0)
