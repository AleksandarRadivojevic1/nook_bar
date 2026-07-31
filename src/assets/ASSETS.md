# Path assets

## syros.path.txt

Real OSM coastline of Syros, Cyclades — relation `531999` via Nominatim
(`polygon_geojson=1`), 2207 points, viewBox `0 0 1000 1614.2`, **aspect 0.620**.

Tall, where the reference site's landmass is wide. Size it by **height**
(~152vh) so it crops top and bottom rather than sitting complete inside the
frame. Its isthmus falls at mid-height, exactly where centred hero copy lands —
keep that band dark and quiet and pool the key light in the wide southern half.

Referenced once via `<mask>` + `<use>`, never inlined twice: the path data is
~29KB.

The hero reveal is verified by **sampling corner pixels**, not
`getBoundingClientRect` — a lumpy coastline leaves bone visible in the corners
long after its bounding box spans the screen. See `tests/e2e/hero.spec.ts`.
