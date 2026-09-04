---
name: site-copy-rules
description: Keep zoompilot site copy and product claims consistent and honest. Use whenever editing marketing copy, spec claims, or steering terminology in any component — and before changing any claim about torque (44% more), 12 units per frame, seven speed bands, 0 mph steering, supported model years, or the alpha-longitudinal radar caveat. Enforces "steering motor, never rack" and the minimal-labels chart style.
---

# Site copy rules

## Terminology: motor, never rack

The steering part is the electric power steering **motor**. Say "steering motor", "EPS motor", or "the 2022-25 CX-5 electric power steering". Never "rack" — the user rejected it as the wrong term for this part.

Two paths can silently bring old wording back:

- `src/data/supported-cars.json` is generated from the wiki's `supported-cars.md`. Wrong wording there means: fix the wiki markdown, then `npm run sync:wiki`.
- `public/og.png` is a screenshot of `scripts/og-card.html`. When the HTML copy changes, regenerate: open the file at 1200×630 and screenshot it over the old PNG.

## The claims map

Each claim is stated in several files. Change all copies or none:

| Claim | Files |
| --- | --- |
| 44% more torque | computed `GAP_PCT` in `chart-geometry.js`; aria-label + figcaption in `TorqueChart.astro`; aria-label in `gen-wiki-chart.mjs` — number sync detail in the torque-chart skill |
| 12 units per frame, stock stops at 10 | `SpecStrip.astro`, section 01 in `index.astro`, the rate row in `Compare.astro` (cells "10" / "10" / "12") |
| Seven learned speed bands | `SpecStrip.astro`, section 01 in `index.astro`, `FAQ.astro`, `Compare.astro`, `SetupDemo.astro` |
| Steering to 0 mph | `SpecStrip.astro`, `FirstDrive.astro`, `CarChecker.astro` (twice), `FAQ.astro`, `Compare.astro` ("steer-to-zero") |
| Full support: CX-5 2022–2025, CX-9 2021–2023 | `supported-cars.json` (synced from the wiki), `CarChecker.astro` `MODELS.fullFrom`/`fullTo` (the year logic lives here, not in the JSON), `FAQ.astro` |

Provenance: the 12/10 figures come from `STEER_DELTA_UP` in `src/data/values-zoom.py` (12) and `values-open.py` (10). Claims trace to the wiki's measurement record — keep the wiki links in the copy.

## The alpha-longitudinal caveat travels with the feature

Every mention of Mazda alpha longitudinal must say: while it is on, the car's radar is off — no AEB, no forward collision alerts. Stated today in the changelog entries, `FAQ.astro`, the `Compare.astro` note, and section 05. Never state the feature without the caveat. This one is safety copy.

## Deliberate oddities — do not "fix"

- Canonical, og:url, and schema URLs follow the deploy host (`Astro.site`, set from `CF_PAGES_URL` in `astro.config.mjs`). A zoompilot.ai custom domain was declined in 2026-09; the pages.dev hosts are permanent. Do not plan or do domain or DNS work for either repo.
- `repo.wiki` in `changelog.js` points at `zoompilot-wiki.pages.dev`. Permanent, for the same reason.
- The chart plot stays minimal — line labels only, explanation in the figcaption. The user rejected busy plots.

## Units in prose

Steering torque is in counts ("an 800-count scale"), never Nm. Speeds in mph. See the torque-chart skill for how the chart handles units.
