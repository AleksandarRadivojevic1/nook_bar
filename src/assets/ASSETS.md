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

## serbia.path.txt

viewBox `0 0 1000 1435.4`, **aspect 0.6967**, 396 points, Douglas-Peucker
simplified at tol 0.006 deg. Machine-readable provenance sits in
`serbia.meta.json` next to it.

> ### ⚠ Kosovo is included, deliberately
>
> This path is a `polygon-clipping` **union** of OSM `relation/1741311`
> (Serbia, which on its own *excludes* Kosovo) and `relation/2088990`
> (Kosovo), rendered as one landmass with no internal border. **This was the
> owner's explicit instruction.**
>
> Do not "correct" it back to the raw Nominatim Serbia relation. Regenerating
> this asset naively silently changes a politically loaded boundary on a
> Serbian business's site. Raw Serbia alone has **aspect 0.759** — a changed
> aspect ratio is the tell that someone regenerated it without the union.

`.journey-stage`'s `aspect-ratio` must equal this file's aspect
(`1000/1435.4`). That is what makes `preserveAspectRatio="none"`
distortion-free, which in turn makes every viewBox coordinate map linearly to
a percentage — the reason the cards line up with the route without tuning two
coordinate systems against each other. On mobile the stage grows to hold four
stacked cards and that guarantee breaks, so `.journey-art` gets its own
`aspect-ratio` box there. `object-fit` does nothing to an inline SVG's
internal scaling and cannot substitute.

Leskovac's projected coordinate is **(747.1, 1059.2)** — the route terminates
there and the pin takes over.
