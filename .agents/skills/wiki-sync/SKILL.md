---
name: wiki-sync
description: Sync content between the zoompilot-site repo and the sibling zoompilot-wiki checkout. Use whenever the user says "sync the wiki", changes supported-cars content, the changelog, or chart geometry, asks where a supported-cars wording fix belongs, or asks about src/data/supported-cars.json. Covers npm run sync:wiki, its three jobs and their directions, the generated-file rules, and the commit-in-both-repos requirement.
---

# Wiki sync

The docs wiki (`../zoompilot-wiki`, MkDocs) is a sibling checkout — not a git remote and not a submodule of this repo. Structured content syncs through a local script:

```bash
npm run sync:wiki   # runs scripts/sync-wiki.mjs
```

The script reads and writes files under `../zoompilot-wiki/docs`. It throws if that checkout is missing. Clone the wiki next to this repo first.

## The three jobs

| # | Direction | Source | Target |
| --- | --- | --- | --- |
| 1 | wiki → site | `wiki/docs/getting-started/supported-cars.md` (first markdown table; header must be `Car \| Status \| Notes`) | `src/data/supported-cars.json` |
| 2 | site → wiki | `src/data/changelog.js` (`releases`) | `wiki/docs/releases/changelog.md` |
| 3 | site → wiki | `src/data/chart-geometry.js` | `wiki/docs/assets/steering-torque.svg` (via `scripts/gen-wiki-chart.mjs`) |

## Rules

1. **`supported-cars.json` is generated. Never edit it by hand.** The wiki's `supported-cars.md` is the source. So when wording that the site renders is wrong (an old "rack" phrasing, a wrong status pill), fix the wiki markdown, then run the sync. Section 06 renders the JSON; the "is my Mazda supported" year logic is separate and lives in `CarChecker.astro`.
2. **The site's `changelog.js` is the changelog source of truth.** The wiki page is regenerated from it. Hand edits on the wiki page above the `## Upstream release notes` marker are lost on the next sync; the tail below that marker is hand-written and preserved verbatim.
3. **Commit in both repos after a sync.** The wiki is a real repo with its own GitHub Actions deploy. A sync committed only here leaves the wiki stale and the next sync dirty.
4. **Changelog item HTML is converted, not passed through.** sync converts a small vocabulary — `<b>`, `<code>`, `<a href>`, and a few entities — to markdown. Anything richer in item HTML breaks the wiki page.
5. **The wiki's `custom.css` mirrors this site's `site.css`.** One brand system. A brand change (tokens, fonts, hairlines) means editing both files.

## When to run it

- After editing the supported-cars table in the wiki.
- After adding or editing a release in `src/data/changelog.js` (see the new-release skill).
- After any change to `src/data/chart-geometry.js` — the wiki SVG must not drift (see the torque-chart skill).
