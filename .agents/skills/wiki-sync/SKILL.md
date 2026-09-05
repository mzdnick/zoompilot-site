---
name: wiki-sync
description: Sync content between the zoompilot-site repo and the sibling zoompilot-wiki checkout. Use whenever the user says "sync the wiki", changes supported-cars content, the changelog, or chart geometry, asks where a supported-cars wording fix belongs, or asks about src/data/supported-cars.json. Covers npm run sync:wiki, its five jobs and their directions, the generated-file rules, the hand-edit guard, and the commit-in-both-repos requirement.
---

# Wiki sync

The docs wiki (`../zoompilot-wiki`, MkDocs) is a sibling checkout — not a git remote and not a submodule of this repo. Structured content syncs through a local script:

```bash
npm run sync:wiki   # runs scripts/sync-wiki.mjs
```

The script reads and writes files under `../zoompilot-wiki/docs`. It throws if that checkout is missing. Clone the wiki next to this repo first.

## The five jobs

| # | Direction | Source | Target |
| --- | --- | --- | --- |
| 1 | wiki → site | `wiki/docs/getting-started/supported-cars.md` (first markdown table; header must be `Car \| Status \| Notes`) | `src/data/supported-cars.json` |
| 2 | site → wiki | `src/data/changelog.js` (`releases`) | `wiki/docs/releases/changelog.md` |
| 3 | site → wiki | `src/data/chart-geometry.js` | `wiki/docs/assets/steering-torque.svg` + `steering-torque-data.js` (via `scripts/gen-wiki-chart.mjs`) |
| 4 | wiki → wiki | `wiki/docs/technical/*.md` (route citations) | `wiki/docs/technical/route-library.md` |
| 5 | site → wiki | `src/data/supported-cars.json` | `wiki/assets/js/car-checker-data.js` |

## Rules

1. **`supported-cars.json` is generated. Never edit it by hand.** The wiki's `supported-cars.md` is the source. So when wording that the site renders is wrong (an old "rack" phrasing, a wrong status pill), fix the wiki markdown, then run the sync. Section 06 renders the JSON; the "is my Mazda supported" year logic is separate and lives in `CarChecker.astro`.
2. **The site's `changelog.js` is the changelog source of truth.** The wiki page is regenerated from it. The tail below the `## Upstream release notes` marker is hand-written and preserved verbatim.
3. **Commit in both repos after a sync.** The wiki is a real repo with its own GitHub Actions deploy. A sync committed only here leaves the wiki stale and the next sync dirty.
4. **Changelog item HTML is converted, not passed through.** sync converts a small vocabulary — `<b>`, `<code>`, `<a href>`, and a few entities — to markdown. Anything richer in item HTML breaks the wiki page.
5. **The wiki's `custom.css` mirrors this site's `site.css`.** One brand system. A brand change (tokens, fonts, hairlines) means editing both files.
6. **The hand-edit guard stops the sync before it can clobber work.** After each run the script fingerprints every generated target into `scripts/sync-state.json`. If a target was edited by hand since the last run, the next run prints the file and exits 1 — it never silently overwrites. `npm run sync:wiki -- --force` overwrites on purpose. The changelog guard covers only the generated head (above the `## Upstream release notes` marker), because the tail is preserved by design. Commit `sync-state.json` with the site repo; if the user asks why a sync "refuses to run", this is why. Everything not in the managed list (e.g. `docs/getting-started/comparison.md`) is hand-written wiki content the sync never touches.
7. **The wiki documents this for editors** in `wiki/docs/reference/site-sync.md`. Keep that page in sync with the job table if jobs change.

## When to run it

- After editing the supported-cars table in the wiki.
- After adding or editing a release in `src/data/changelog.js` (see the new-release skill).
- After any change to `src/data/chart-geometry.js` — the wiki SVG must not drift (see the torque-chart skill).
