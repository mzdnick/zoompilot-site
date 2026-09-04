# ZoomPilot wiki upgrade — all four packages

Two repos: `zoompilot-wiki` (Material for MkDocs, `variant: modern`) and `zoompilot-site` (Astro; owns the sync script). All wiki work lands in the wiki repo except sync jobs. Pushes to both repos are pre-approved; no PRs.

## A. Fix the cracks (wiki repo)

1. **Finish `docs/how-to/replay-a-drive.md`** — it ends at "2." Write the real CAN replay steps (jungle wiring, `replay` CLI flags, what to look for), based on openpilot's replay tool docs.
2. **Fix the device contradiction** — `docs/getting-started/install.md` inline SVG says "comma 3X / 3"; edit the SVG text to comma four.
3. **One canonical ECU reset** — new `docs/how-to/ecu-reset.md` holding the 15-minute procedure. Replace the three verbatim copies (`safety.md`, `troubleshooting.md`, `features/alpha-longitudinal.md`) with one-line links.
4. **De-orphan pages** — link `features/alerts.md` from the steering/features pages, `community/faq.md` from home + troubleshooting, `how-to/replay-a-drive.md` + `how-to/car-port.md` from a short intro line on the How-to pages.
5. **Nav restructure (`mkdocs.yml`)** — new top tab "Reference" holding Releases, Troubleshooting, FAQ, About; Community keeps contribute/feedback/roadmap.
6. **Fill thin pages** — honest short content for `community/roadmap.md`, `community/contribute.md`, `community/feedback.md`.

## B. Missing pages (wiki repo)

7. **`docs/getting-started/how-it-works.md`** — plain-English theory page between the blurbs and the 3,000-word records: what openpilot is, what the fork changes (4 areas from `about.md`), the lateral controller and the 7 speed bands in one diagram, longitudinal in one diagram, what the learner does. Sourced only from existing wiki content, linked from the home grid and every feature page.
8. **`docs/getting-started/eps-swap.md`** — full swap guide: what the swap is, sourcing a 2022–25 CX-5 steering motor, fingerprint fallback (link `technical/mazda-fingerprinting.md`), what changes, limits and expectations. Facts drawn only from what the wiki already claims; unknowns marked honestly.
9. **`docs/how-to/uninstall.md`** — back to stock openpilot/brand software via the installer, ECU-reset link, what settings disappear.
10. **Glossary** — new `docs/reference/glossary.md` (DTR, ICBM, SLA, LKAS_BLOCK, CRZ, MRCC, EPS, AEB, fingerprint, jungle…). Enable `abbr` + `pymdownx.snippets` in `mkdocs.yml` with `docs/includes/abbreviations.md` so terms also get tooltips site-wide.
11. **`docs/how-to/logs-and-privacy.md`** — what rlog/qlog contain, where they go, how to share safely, how to delete.
12. **Custom tune explained** — new `docs/how-to/custom-tune.md`: what self-tune does (from `technical/lateral-tune.md`), when to touch it, how to reset; kills the "leave it off is the only guidance" gap.

## C. Visuals & diagrams (wiki repo)

13. **Settings screenshots scaffold** — restructure `docs/settings/index.md` into per-menu subsections, each with a `figure` + caption slot; enable Material `content.lightbox`-friendly figure markup. Create `docs/assets/settings/` with a README listing exactly which screens to capture (comma four UI) — you supply the PNGs, I wire them in. Until then, no broken images: placeholders only where a missing image won't render.
14. **Mermaid state machine** — add a radar/MRCC state diagram to `docs/technical/mazda-longitudinal.md`, drawn from that page's own prose.
15. **Local media** — download the two hotlinked `blog.comma.ai` images into `docs/assets/`, fix `how-to/turn-the-speed-blue.md`; lazy embed for the YouTube URL in `how-to/car-port.md`.
16. **Print CSS** — `docs/stylesheets/print.css` (hide nav/tabs/toc, widen content) registered in `extra_css`, so install + first-drive print cleanly for driveway installs.

## D. Interactive features (wiki assets + site sync)

All vanilla JS, no frameworks, registered via `extra_javascript`; every page keeps readable no-JS content.

17. **Live torque chart** — extend `scripts/gen-wiki-chart.mjs` to also emit `docs/assets/steering-torque-data.js` (`window.ZP_TORQUE_DATA = …` from the shared `chart-geometry.js`). New `docs/assets/js/torque-live.js` draws the interactive chart (draw-in on scroll, hover values, reduced-motion aware) into a container on `features/steering.md`; the static SVG stays as the no-JS fallback.
18. **Settings explorer** — new `docs/settings/explorer.md` + `docs/assets/js/settings-data.js` (hand-authored structured copy of the reference; header comment marks `settings/index.md` canonical) + `docs/assets/js/settings-explorer.js`: search box, per-menu filter, cards with default/range/effect/link-to-reference.
19. **Troubleshooting wizard** — small picker at the top of `docs/troubleshooting.md` (symptom buttons → fix steps → log-share link); full text list stays below for search.
20. **Route library** — new sync job in `sync-wiki.mjs`: scan `docs/technical/*.md` for openpilot route IDs, generate `docs/technical/route-library.md` with a table (route, source page, what it shows, `connect.comma.ai/<route>` link).

## E. Integration & polish

21. **Car checker on the wiki** — another sync job: emit `docs/assets/js/car-checker.js` (data + logic bundled) from the site's supported-cars data; embed a container on `docs/getting-started/supported-cars.md`.
22. **wiki.zoompilot.ai** — flip `repo.wiki` in `src/data/changelog.js` to `https://wiki.zoompilot.ai` (mkdocs `site_url` already points there). DNS itself is yours to add in the Cloudflare zone — I'll list the exact record needed.
23. **Last-updated dates** — try `git-revision-date-localized`; the mkdocs comment says Zensical has no plugin runtime, so if it fails, fall back to a hand-kept "reviewed 2026-09" line on the ten most-maintained pages and drop the plugin idea.

## Order & verification

Execute A → B → C → D → E. After each phase: `mkdocs build --strict` in the wiki repo (matching validation settings) and fix all warnings. After D/E: run `npm run sync:wiki` + `npm run build` in the site repo. Then push both repos (pre-approved); GitHub Actions deploys. I'll verify the live wiki URL renders the new pages and the interactive bits work in a browser.

**Needs you later:** settings screenshots + any hardware photos (I leave a capture checklist), and the DNS record. Everything else is fully self-serve.