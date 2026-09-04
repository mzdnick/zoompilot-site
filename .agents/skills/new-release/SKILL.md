---
name: new-release
description: Add a new zoompilot release entry to the site changelog. Use whenever the user mentions a new release, a version bump, "openpilot/sunnypilot released", a release-watch PR that needs filling in, or edits src/data/changelog.js. Covers the ver-must-match-version.h rule, the entry shape, npm run stamp, every consumer that derives from the file, and the sync-and-commit-in-both-repos finish.
---

# Add a release

The changelog source of truth is `src/data/changelog.js`. Everything else derives from it: the changelog section (12), the RSS feed (`src/pages/feed.xml.js`), the wiki's releases page (via sync), and the release-watch signal.

## Steps

1. **Get the real version first.** `ver` must match `version.h` on the upstream `main` branch (`github.com/zoompilot/zoompilot`) — it is what the device home screen shows, not the release date. Format: `2026.08.25-8`. Only old pre-channel entries carry `ver: null`.
2. **Add the entry at the top of `releases[]`** — newest first. Shape:

   ```js
   {
     ver: "2026.09.04-9",
     date: "2026-09-04",
     title: "Optional headline",
     summary: "Optional one-liner under the title.",
     items: [{ html: `<b>Lead sentence.</b> Rest of the line.`, sub: [{ html: `…` }] }],
   }
   ```

   `html` is trusted inline HTML from a small vocabulary: `<b>`, `<code>`, `<a href>`, and the entities `&rsquo; &ldquo; &rdquo; &ndash; &mdash; &amp;`. sync-wiki converts exactly this set to markdown for the wiki page. Anything richer breaks the wiki page.
3. **`npm run stamp`.** Rewrites `export const build = { sha, date }` from the latest commit on upstream main. The page also refreshes the stamp at runtime; this keeps the static fallback honest. The script exits clean when the stamp is already current. Set `GITHUB_TOKEN` for local runs to avoid the 60 requests/hour API limit. In CI the step is `continue-on-error` — a stamp failure never blocks a deploy.
4. **`npm run sync:wiki`** to regenerate the wiki's changelog page, then **commit in both repos** (see the wiki-sync skill).
5. **Push this repo.** `deploy.yml` builds and deploys on every push to `main`.

## Release-watch PRs

A daily workflow (`.github/workflows/release-watch.yml`, `scripts/watch-release.mjs`) compares `version.h` on upstream main with the newest `ver` in `changelog.js`. On divergence it opens a PR with a skeleton entry that says `<b>TODO:</b> Fill in the release notes`. Filling that PR in means step 1 and 2 on the PR branch, then the sync steps after merge. A wrong `ver` makes the bot open false PRs or miss real releases.
