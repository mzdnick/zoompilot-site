---
name: torque-chart
description: Edit the EPS steering-torque chart on the zoompilot site (section 01). Use whenever the user mentions the torque chart, steering chart, EPS chart, chart lines or numbers (44%, 1148, 800, 620), or asks to change TorqueChart.astro, src/data/chart-geometry.js, or scripts/gen-wiki-chart.mjs — even vague asks like "the graph" or "make the chart show...". Covers the framing rules fixed by user decisions, the two renderers that share one geometry, the numbers that also live in prose, and the wiki SVG regeneration step.
---

# Torque chart (section 01)

The chart answers one question: how much steering torque the EPS can apply at each speed. Two lines: zoompilot is the measured EPS ceiling; stock openpilot is one flat 800-count cap. This is the "authority" framing, chosen by the user — the visitor cares how much more torque they can get, not what the controller demands.

## Files and how they connect

- `src/data/chart-geometry.js` — all numbers and path math. The single source of truth.
- `src/components/TorqueChart.astro` — the site copy. Theme-aware (uses `--accent`), animated.
- `scripts/gen-wiki-chart.mjs` — the wiki copy, `../zoompilot-wiki/docs/assets/steering-torque.svg`. Baked hex colors (46G machine gray, the site default), because the wiki embeds the SVG as an `<img>`, where CSS variables do not reach.

Change geometry only in `chart-geometry.js`. Never hand-edit the wiki SVG, and never duplicate path math in a component.

## Framing rules (user decisions — do not relitigate)

1. Two lines only: zoompilot = the measured EPS ceiling (`CEIL_BP`/`CEIL_V`, nine points, 1148 → 620 counts over 8.0–14.5 m/s); stock = one flat 800 cap (`STOCK_CAP`).
2. Do not draw STEER_MAX. It is the CAN scale/unit conversion, not the deliverable. The user confirmed this.
3. Do not draw per-band demand curves. The 21 mph LAF peak in `src/data/LAF-torquegainbin.csv` is real data, but it answers the wrong question. The CSVs stay in `src/data/` as provenance for the seven-band claims in section copy. They are not drawn.
4. Past the join (`JOIN_V`, ≈13.06 m/s ≈ 29 mph) both controllers deliver the same torque. zoompilot's own path stops there; the shared stretch (`zpSharedPath`) is drawn as accent dashes over stock's solid gray line, so the overlap reads as "both". Never draw zoompilot below stock.
5. Minimal labels in the plot. The line labels are exactly "zoompilot" and "stock openpilot". Explanations live in the figcaption. Do not add markers, arrows, or notes without a concrete need.
6. The gap callout at `GAP_V = 6.5` m/s is a three-line stack. Keep the wording and placement: "up to" (faint) / "{GAP_PCT}% more torque" (accent) / "with no hardware mods" (amber `--warn`).
7. The band between the two lines is shaded (`gapPath`: the zoompilot line out to the join, back along stock, closed). It is the visual form of the 44% claim — the region tapers to nothing at the join. Keep the fill faint: accent at 12% (`C.gapFill` baked in the wiki SVG). No dashed connector line — the old one was removed when the band landed.

## Honesty rule

Only two things in this chart are measured: the nine ceiling points and the stock 800 cap. The curves between them are schematic (linear interpolation, `np.interp` semantics). The per-band torque table is not published — `speed_dependent.toml` lives on the device, not in the repo.

So keep the figcaption sentence "The ceiling and the cap are measured." Never describe the drawn curves as measured data.

## Units

- Speeds are m/s inside the file (`MPH_TO_MS = 0.44704`). The x-axis shows mph, 0–40 (`V_MAX_MPH = 40`), ticks 0/10/20/30/40. The axis stops at 40 mph because past the cliff both controllers are EPS-limited to 620 counts — there is nothing more to show.
- Torque is in counts (the CAN unit), never Nm. The y-axis runs 400–1300 (`C_MIN`/`C_MAX` — it does not start at 0; the user chose the 400 floor to cut the chart's height), ticks 400/800/1200, canvas 640×240 (`VIEW_W`/`VIEW_H`, plot `Y0`=18 to `Y1`=202). In prose say "an 800-count scale", not "800 Nm".
- Axis titles are horizontal and lowercase, a matched pair: "torque · counts" at the top-left above the plot, "speed · mph" at the bottom-right. Do not go back to a rotated y title.

## The numbers also live in prose

When a number changes in `chart-geometry.js`, update every prose copy:

| Value | Data lives in | Prose copies |
| --- | --- | --- |
| 1148 (`CEIL_V[0]`) | chart-geometry.js | aria-label in TorqueChart.astro; aria-label in gen-wiki-chart.mjs |
| 800 (`STOCK_CAP`) | chart-geometry.js | both aria-labels; figcaption ("800-count scale") |
| 620 (last `CEIL_V`) | chart-geometry.js | both aria-labels |
| ~29 mph (`JOIN_V`) | computed | both aria-labels ("past about 29 mph") |
| ~32 mph (end of `CEIL_BP`) | chart-geometry.js | both aria-labels |
| 44% (`GAP_PCT`) | computed: `round((1148 − 800) / 800 × 100)` | both aria-labels ("44 percent"); figcaption ("44%"); the callout tspan |

The two aria-labels are near-duplicates — edit them together. They differ slightly (the wiki copy has a `<title>` element instead of the "drawn as one line the two share" clause), but the numbers must match.

## After a geometry change

```bash
node scripts/gen-wiki-chart.mjs   # or: npm run sync:wiki (runs all three sync jobs)
```

Then commit in BOTH repos (this one and `../zoompilot-wiki`). The wiki embeds the SVG in `docs/features/steering.md` and auto-deploys from its own Actions. See the wiki-sync skill for the full ritual.

## CSS touchpoints (src/styles/site.css)

- Draw-in: `.tc-zp` and `.tc-stock` use `stroke-dasharray: 1400`; the `drawn` class (added by the IntersectionObserver in TorqueChart.astro) animates the offset. If the paths get much longer, raise the 1400.
- Shared tail: `.tc-zp-shared` fades in with `transition: opacity 0.6s ease 0.9s` after the draw-in. Forced visible under `prefers-reduced-motion`.
- Gap band: `.tc-gap-fill` fades in with the draw-in (`opacity 0.8s ease 0.5s`), also forced visible under `prefers-reduced-motion`. The wiki's live copy styles it in `docs/stylesheets/custom.css` (`.tc-live .tc-gap-fill`); the wiki live chart draws it with no fade.
- Narrow screens: `.tchart-frame` gets `overflow-x: auto` and the svg `min-width: 36rem` — the chart scrolls sideways so the labels stay legible. Keep this.
- `.tc-band`, `.tc-cliff`, `.tc-cliff-label` are leftovers from removed chart versions. The cliff marker was removed on purpose. Do not resurrect them. (`.tc-gap` — the old dashed connector — was removed with the band; do not bring it back either.)

## Verify

Build and check both copies: site section 01 and the wiki SVG. Save screenshots under `.playwright-mcp/` (ignored) or `/tmp` — never the repo root. `.gitignore` already blocks `torque-chart-*.png` because stray screenshots leaked into the repo before.
