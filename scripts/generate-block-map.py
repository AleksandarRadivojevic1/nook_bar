#!/usr/bin/env python3
"""Draw the block Nook sits on, from OpenStreetMap.

Run by hand, output committed:

    python3 scripts/generate-block-map.py

A build that depends on Overpass being up is a build that fails on someone
else's schedule, so this is not a build step. Review the diff like any other
file — provenance lands in src/assets/block.meta.json next to the asset, the
same arrangement serbia.path.txt and serbia.meta.json use.

Deterministic: same query, same rounding, same bytes out.
"""

from __future__ import annotations

import json
import math
import time
import urllib.error
import urllib.parse
import urllib.request
from datetime import date
from pathlib import Path

# The bar. Same coordinates as src/content/site.json — if those ever change,
# these change with them.
LAT = 42.9930343
LNG = 21.9483644

STREET_R = 220  # metres
BUILDING_R = 160
M_PER_DEG = 111320.0

OVERPASS = "https://overpass-api.de/api/interpreter"
QUERY = (
    "[out:json][timeout:60];"
    f'(way(around:{STREET_R},{LAT},{LNG})["highway"];'
    f'way(around:{BUILDING_R},{LAT},{LNG})["building"];);'
    "out geom;"
)

ROOT = Path(__file__).resolve().parent.parent
ASSETS = ROOT / "src" / "assets"

# Street hierarchy. Without this the drawing is a uniform mesh and reads as
# noise; with it you can see which way the through-road runs.
RANKS = {
    "primary": 1, "primary_link": 1,
    "secondary": 1, "secondary_link": 1,
    "tertiary": 1, "tertiary_link": 1,
    "residential": 2, "unclassified": 2, "living_street": 2,
    "service": 3, "pedestrian": 3, "footway": 3, "path": 3, "steps": 3,
}

# Serbian Cyrillic to Latin, explicit. unicodedata normalisation is NOT a
# substitute: it produces "s" for "š" and "d" for "đ", which is a different
# street name, and this site's whole identity is Latin script.
TRANSLIT = {
    "А": "A", "Б": "B", "В": "V", "Г": "G", "Д": "D", "Ђ": "Đ", "Е": "E",
    "Ж": "Ž", "З": "Z", "И": "I", "Ј": "J", "К": "K", "Л": "L", "Љ": "Lj",
    "М": "M", "Н": "N", "Њ": "Nj", "О": "O", "П": "P", "Р": "R", "С": "S",
    "Т": "T", "Ћ": "Ć", "У": "U", "Ф": "F", "Х": "H", "Ц": "C", "Ч": "Č",
    "Џ": "Dž", "Ш": "Š",
    "а": "a", "б": "b", "в": "v", "г": "g", "д": "d", "ђ": "đ", "е": "e",
    "ж": "ž", "з": "z", "и": "i", "ј": "j", "к": "k", "л": "l", "љ": "lj",
    "м": "m", "н": "n", "њ": "nj", "о": "o", "п": "p", "р": "r", "с": "s",
    "т": "t", "ћ": "ć", "у": "u", "ф": "f", "х": "h", "ц": "c", "ч": "č",
    "џ": "dž", "ш": "š",
}


def latin(tags: dict) -> str | None:
    """The street's name in Latin script, or None if it has no name."""
    if tags.get("name:sr-Latn"):
        return tags["name:sr-Latn"]
    name = tags.get("name")
    if not name:
        return None
    return "".join(TRANSLIT.get(ch, ch) for ch in name)


def fetch(attempts: int = 4) -> dict:
    """Overpass is a free public service and answers 504 when it is busy.

    That is normal rather than exceptional, so back off and try again instead
    of failing the run — the alternative is a human re-running this by hand
    for a reason that has nothing to do with the data.
    """
    body = urllib.parse.urlencode({"data": QUERY}).encode()
    request = urllib.request.Request(OVERPASS, data=body, headers={
        "User-Agent": "nook-bar-site/1.0 (block map asset generation)",
    })
    for attempt in range(1, attempts + 1):
        try:
            with urllib.request.urlopen(request, timeout=120) as response:
                return json.load(response)
        except urllib.error.HTTPError as error:
            if error.code not in (429, 503, 504) or attempt == attempts:
                raise
            wait = 8 * attempt
            print(f"Overpass returned {error.code}; retrying in {wait}s")
            time.sleep(wait)
    raise RuntimeError("unreachable")


def main() -> None:
    data = fetch()

    # Local equirectangular. Over a couple of hundred metres the error against
    # a proper projection is far below the width of a hairline, and it keeps
    # the asset readable: x and y are plain metres from the bar.
    scale_x = math.cos(math.radians(LAT)) * M_PER_DEG

    def project(lat: float, lng: float) -> tuple[float, float]:
        return ((lng - LNG) * scale_x, -(lat - LAT) * M_PER_DEG)

    streets: list[dict] = []
    buildings: list[list[tuple[float, float]]] = []

    for element in data.get("elements", []):
        tags = element.get("tags") or {}
        geometry = element.get("geometry") or []
        points = [project(p["lat"], p["lon"]) for p in geometry]

        if "highway" in tags:
            rank = RANKS.get(tags["highway"])
            if rank is None or len(points) < 2:
                continue
            streets.append({"points": points, "rank": rank, "name": latin(tags)})
        elif "building" in tags and len(points) >= 4:
            buildings.append(points)

    every = [p for s in streets for p in s["points"]] + [p for b in buildings for p in b]
    min_x = min(p[0] for p in every)
    max_x = max(p[0] for p in every)
    min_y = min(p[1] for p in every)
    max_y = max(p[1] for p in every)

    def path(points: list[tuple[float, float]], close: bool) -> str:
        # "M x y L x y L ..." — one command per point, rounded to a decimetre,
        # which is an order of magnitude finer than anything that renders.
        pairs = [f"{round(x - min_x, 1)} {round(y - min_y, 1)}" for x, y in points]
        d = "M" + pairs[0] + "".join(" L" + pair for pair in pairs[1:])
        return d + ("Z" if close else "")

    bar_x, bar_y = project(LAT, LNG)

    out = {
        "viewBox": f"0 0 {round(max_x - min_x, 1)} {round(max_y - min_y, 1)}",
        "width": round(max_x - min_x, 1),
        "height": round(max_y - min_y, 1),
        "bar": {"x": round(bar_x - min_x, 1), "y": round(bar_y - min_y, 1)},
        "streets": [
            {
                "d": path(s["points"], close=False),
                "rank": s["rank"],
                **({"name": s["name"]} if s["name"] else {}),
            }
            for s in sorted(streets, key=lambda s: -s["rank"])
        ],
        "buildings": [path(b, close=True) for b in buildings],
    }

    meta = {
        "source": "OpenStreetMap via Overpass API",
        "query": QUERY,
        "centre": {"lat": LAT, "lng": LNG},
        "radius": {"streets": STREET_R, "buildings": BUILDING_R},
        "projection": (
            "local equirectangular, x scaled by cos(lat); units are metres "
            "from the frame's top-left corner. Error over this extent is far "
            "below a hairline's width."
        ),
        "names": (
            "name:sr-Latn where OSM has it, otherwise an explicit Serbian "
            "Cyrillic to Latin table in the generator. Not unicodedata."
        ),
        "counts": {"streets": len(out["streets"]), "buildings": len(out["buildings"])},
        "generated": date.today().isoformat(),
        "generator": "scripts/generate-block-map.py",
    }

    (ASSETS / "block.map.json").write_text(
        json.dumps(out, ensure_ascii=False, indent=2, sort_keys=True) + "\n",
        encoding="utf-8",
    )
    (ASSETS / "block.meta.json").write_text(
        json.dumps(meta, ensure_ascii=False, indent=2, sort_keys=True) + "\n",
        encoding="utf-8",
    )

    print(
        f"{len(out['streets'])} streets, {len(out['buildings'])} buildings, "
        f"{out['width']} x {out['height']} m"
    )


if __name__ == "__main__":
    main()
