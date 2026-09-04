# zoompilot.ai

The zoompilot.ai landing page, rebuilt with [Astro](https://astro.build).
One page, spec-sheet order: hero with the CX-5 paint wall, the numbered
sections (steering, cruise, alerts, sensors, alpha longitudinal,
coverage, compare, questions, setup, install, first drive, changelog),
and the footer paint line.

The docs live in the wiki, published at
https://zoompilot-wiki.pages.dev (the wiki.zoompilot.ai domain is the
intended home but does not resolve yet; `src/data/changelog.js`
`repo.wiki` carries the live host — flip that one line when the domain
goes live). This site links into the wiki and syncs structured content
both directions (see "Wiki collaboration").

## Quick start

```bash
npm install
npm run dev
```

Open http://localhost:4321.

```bash
npm run build      # static output in dist/
npm run preview    # serve the built output
```

## Layout

```
src/
  data/
    paints.js          the CX-5 paint line (codes + names); colors live
                       in site.css, keep the two in step
    changelog.js       releases, build stamp, repo links. Add new
                       releases at the top.
    chart-geometry.js  the EPS behavior chart's geometry, shared by the
                       site chart and the wiki's static copy
    supported-cars.json  generated — do not edit by hand
  components/
    TopBar.astro       sticky bar, scroll-spy, runtime build stamp
    Hero.astro         wordmark, CTAs, paint chip wall
    SpecStrip.astro    the measured-numbers band under the hero
    SectionIndex.astro the "on this page" jump grid
    Section.astro      numbered section header (01 / title / intro)
    Ledger.astro       hairline term-description rows
    TorqueChart.astro  the EPS behavior chart (section 01)
    CarTable.astro     supported cars with status pills (section 06)
    CarChecker.astro   "is my Mazda supported?" year/model checker
    Compare.astro      zoompilot vs sunnypilot vs openpilot (section 07)
    FAQ.astro          questions accordion + FAQPage structured data
    SetupDemo.astro    interactive settings-screen mock
    InstallCard.astro  device screen + copy button
    FirstDrive.astro   before you engage / engaging / what to expect
    Changelog.astro    renders src/data/changelog.js
    Footer.astro       paint line, credits, sign-off
  layouts/Base.astro   fonts, meta, pre-render paint script
  styles/site.css      all styles; paint tokens at the top
scripts/
  sync-wiki.mjs        wiki <-> site sync: supported cars (wiki ->
                       site), changelog page and steering chart
                       (site -> wiki)
  gen-wiki-chart.mjs   the wiki's static copy of the behavior chart
  og-card.html         source for public/og.png; open at 1200x630 and
                       screenshot to regenerate the share card
  stamp.mjs            refresh the build stamp from the GitHub API
public/
  fonts/               self-hosted Audiowide, Inter, JetBrains Mono
  og.png               the social share card (1200x630)
  apple-touch-icon.png generated from favicon.svg (180px, dark base)
  _headers             security headers Cloudflare Pages serves
  favicon.svg          the paint-tile Z
```

## Maintenance

- **New release**: add an entry at the top of `src/data/changelog.js`.
  The `ver` string must match `version.h` on published `main` (what the
  device home screen shows), not the date. Then `npm run stamp`.
- **New paint**: add the `--p*` tokens in `site.css`, the entry in
  `src/data/paints.js`, the chip class in `site.css`, the entry in the
  inline `ZP_PAINTS` map in `Base.astro`, and a footer band.
- **Wiki edits to supported cars**: run `npm run sync:wiki` after
  changing the table in the wiki's `supported-cars.md`.

## Wiki collaboration

Direction of travel, decided in the first build:

1. **Shared brand** — the paint tokens, fonts, chip styling, and
   hairlines are one system across site and wiki. The wiki's
   `custom.css` mirrors this site's `site.css`.
2. **Links** — the top bar links to the wiki; sections 01, 02, 04, 05,
   06, 07, and 08 end with a "… on the wiki" deep link.
3. **Content sync** — `npm run sync:wiki` runs three jobs:
   supported cars from the wiki markdown into
   `src/data/supported-cars.json` (wiki -> site); the wiki's
   `releases/changelog.md` regenerated from `src/data/changelog.js`
   (site -> wiki; the page's "Upstream release notes" tail is
   hand-written and preserved); and the wiki's `steering-torque.svg`
   from `src/data/chart-geometry.js` (site -> wiki). The wiki is a
   sibling checkout (`../zoompilot-wiki`), not a git remote, so run the
   sync locally and commit in both repos.
4. **Full-page reuse (later, needs work)** — wiki pages use
   Material-for-MkDocs markdown ( `!!!` admonitions, `:material-`
   icons, content tabs). Rendering them in Astro needs a small remark
   layer to translate that syntax. Not worth it until the site needs
   whole wiki pages.

Once the wiki repo is on GitHub, `sync-wiki.mjs` can read a pinned npm
git dependency instead of the sibling `../zoompilot-wiki` checkout, so
Cloudflare builds stay self-contained.

## Deploy (Cloudflare Pages)

### GitHub Actions (auto-deploy, the intended path)

The repo runs `.github/workflows/deploy.yml`: every push to `main`
builds and deploys, and a weekly cron rebuilds with a fresh build
stamp. One-time setup, after the repo exists on GitHub:

1. Create a Cloudflare API token with the "Cloudflare Pages: Edit"
   permission (dash.cloudflare.com -> My Profile -> API Tokens).
2. Set the two repo secrets:

   ```bash
   gh secret set CLOUDFLARE_API_TOKEN
   gh secret set CLOUDFLARE_ACCOUNT_ID
   ```

Until the secrets exist, deploys stay manual: `wrangler login` once,
then:

```bash
npm run build
npx wrangler pages deploy dist --project-name zoompilot-site --branch main
```

Production lands on https://zoompilot-site.pages.dev. Roll back with
`npx wrangler pages deployment list` / `... deployment rollback` if a
deploy goes wrong.

### Custom domain

This is a contributor rebuild: the zoompilot.ai zone is owned and run by
the project maintainer, so this deploy lives at
https://zoompilot-site.pages.dev until the maintainer adopts it. The
page metadata (og:url, canonical base in `astro.config.mjs`) keeps
`https://zoompilot.ai` on purpose — it is the intended final home.

Adoption paths, maintainer's choice:

1. Point the Pages project at this repository (Connect to Git), deploy
   into the account that runs the zoompilot.ai zone, then add
   `zoompilot.ai` as the project's custom domain.
2. Keep this deploy and repoint DNS at it. Works only if the zone
   lives in the same Cloudflare account as this Pages project;
   otherwise the maintainer adds the contributor to the account or
   pulls the repo into their own.

Do not add unrelated domains to this project.

### Git integration (alternative)

Switch the Pages project to Connect-to-Git later if you prefer
build-on-push over direct upload:

1. Push this repository to GitHub (for example `zoompilot/site`).
2. In Cloudflare, connect the project to that repository.
3. Build settings:
   - Framework preset: `Astro`
   - Build command: `npm run build`
   - Build output directory: `dist`
   - Node version: 20 or newer (`NODE_VERSION`)

The output is fully static — no server, no functions.

## Notes vs the original site

- The original's settings demo was a screen recording
  (`screens/mici-demo.mp4`). It is drawn here as a static settings
  mock; drop a recording into `public/screens/` and swap
  `SetupDemo.astro` for a `<video>` when available.
- The build stamp refreshes at runtime from the GitHub API and falls
  back to the value in `src/data/changelog.js` (`npm run stamp` keeps
  it honest).
- The original hid the paint chips on narrow screens; that behavior is
  kept.

zoom-zoom-zoom
