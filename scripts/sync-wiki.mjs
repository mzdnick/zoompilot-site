/*
 * Sync structured content between the zoompilot-wiki repo and this
 * site. Run after wiki edits or after adding a release:
 *
 *     npm run sync:wiki
 *
 * Five jobs:
 *   1. wiki -> site: the supported-cars table into
 *      src/data/supported-cars.json (section 06 renders it).
 *   2. site -> wiki: the releases page (docs/releases/changelog.md)
 *      regenerated from src/data/changelog.js — the site data file is
 *      the changelog source of truth. The wiki's "Upstream release
 *      notes" tail is preserved verbatim.
 *   3. site -> wiki: docs/assets/steering-torque.svg and
 *      docs/assets/steering-torque-data.js, the EPS behavior chart
 *      (static + live), rendered from src/data/chart-geometry.js (the
 *      same source the site's chart uses). See
 *      scripts/gen-wiki-chart.mjs.
 *   4. wiki -> wiki: docs/technical/route-library.md, an index of
 *      every route citation in the technical notes, rebuilt from
 *      those pages.
 *   5. site -> wiki: docs/assets/js/car-checker-data.js, the
 *      supported-cars data for the wiki's car checker.
 *
 * Deeper reuse (rendering whole wiki pages inside the site) needs a
 * remark layer for Material-for-MkDocs syntax — admonitions ( !!! ),
 * :material- icons, content tabs. Not worth it until the site needs
 * full wiki pages; see README.md for the plan.
 *
 * Once the wiki repo is on GitHub, jobs 2 and 3 can read a pinned npm
 * git dependency instead of the sibling checkout, and a CI step can
 * open a pull request on the wiki when the data changes.
 */
import { createHash } from "node:crypto";
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  generateWikiChart,
  generateWikiChartData,
} from "./gen-wiki-chart.mjs";

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, "..");
const wiki = join(root, "..", "zoompilot-wiki", "docs");

/* ---------- hand-edit guard ----------
 *
 * Every generated target is fingerprinted into scripts/sync-state.json
 * at the end of a run. The next run compares fingerprints first and
 * STOPS if a target was edited by hand since the last sync — a silent
 * overwrite is the one failure this script must never have. `--force`
 * overwrites on purpose:
 *
 *     npm run sync:wiki -- --force
 *
 * Exception: the changelog page's hand-written tail below
 * "## Upstream release notes" is not part of the fingerprint, because
 * the script preserves it by design. See the wiki's
 * docs/reference/site-sync.md, which documents all of this for
 * editors.
 */
const FORCE = process.argv.includes("--force");
const statePath = join(here, "sync-state.json");
const sha256 = (text) => createHash("sha256").update(text).digest("hex");

/* only the generated head of the changelog page is guarded */
function changelogHead(text) {
  const mark = text.indexOf("## Upstream release notes");
  return mark === -1 ? text : text.slice(0, mark);
}

const managed = [
  {
    key: "site:src/data/supported-cars.json",
    path: join(root, "src", "data", "supported-cars.json"),
    what:
      "site src/data/supported-cars.json was edited by hand since the last sync.",
    fix: "It is generated from the wiki's supported-cars.md table. Edit that table instead.",
  },
  {
    key: "wiki:docs/releases/changelog.md",
    path: join(wiki, "releases", "changelog.md"),
    slice: changelogHead,
    what: "wiki docs/releases/changelog.md was edited by hand since the last sync.",
    fix: "Release notes belong in this repo's src/data/changelog.js.",
    safe: 'Text below the "## Upstream release notes" heading is hand-written and always kept.',
  },
  {
    key: "wiki:docs/assets/steering-torque.svg",
    path: join(wiki, "assets", "steering-torque.svg"),
    what: "wiki docs/assets/steering-torque.svg was edited by hand since the last sync.",
    fix: "The chart is generated from this repo's src/data/chart-geometry.js.",
  },
  {
    key: "wiki:docs/assets/steering-torque-data.js",
    path: join(wiki, "assets", "steering-torque-data.js"),
    what:
      "wiki docs/assets/steering-torque-data.js was edited by hand since the last sync.",
    fix: "The chart data is generated from this repo's src/data/chart-geometry.js.",
  },
  {
    key: "wiki:docs/technical/route-library.md",
    path: join(wiki, "technical", "route-library.md"),
    what: "wiki docs/technical/route-library.md was edited by hand since the last sync.",
    fix: "It is an index rebuilt from the wiki's technical/*.md pages. Edit those pages instead.",
  },
  {
    key: "wiki:assets/js/car-checker-data.js",
    path: join(wiki, "assets", "js", "car-checker-data.js"),
    what: "wiki assets/js/car-checker-data.js was edited by hand since the last sync.",
    fix: "It is generated from the wiki's supported-cars.md table. Edit that table instead.",
  },
];

for (const f of managed) if (!f.slice) f.slice = (t) => t;

const state = existsSync(statePath)
  ? JSON.parse(readFileSync(statePath, "utf8"))
  : { version: 1, files: {} };

const clashes = [];
for (const f of managed) {
  if (!existsSync(f.path)) continue;
  const now = sha256(f.slice(readFileSync(f.path, "utf8")));
  if (state.files[f.key] && state.files[f.key] !== now) clashes.push(f);
}
if (clashes.length && !FORCE) {
  console.error("\nSync stopped: a generated file was edited by hand.\n");
  for (const f of clashes) {
    console.error(`  ${f.what}`);
    console.error(`  ${f.fix}`);
    if (f.safe) console.error(`  ${f.safe}`);
    console.error("");
  }
  console.error(
    "To overwrite the file(s) on purpose: npm run sync:wiki -- --force\n",
  );
  process.exit(1);
}

function recordState() {
  for (const f of managed) {
    if (!existsSync(f.path)) continue;
    state.files[f.key] = sha256(f.slice(readFileSync(f.path, "utf8")));
  }
  writeFileSync(statePath, JSON.stringify(state, null, 2) + "\n");
}

/* ---------- job 1: supported cars, wiki -> site ---------- */

const wikiDoc = join(wiki, "getting-started", "supported-cars.md");
const outFile = join(root, "src", "data", "supported-cars.json");

const md = readFileSync(wikiDoc, "utf8");

/* first markdown table in the file: | Car | Status | Notes | */
const rows = md
  .split("\n")
  .filter((line) => line.trim().startsWith("|"));

if (rows.length < 3) {
  throw new Error(`No markdown table found in ${wikiDoc}`);
}
const header = rows[0].split("|").map((c) => c.trim()).filter(Boolean);
const expected = ["Car", "Status", "Notes"];
if (header.join() !== expected.join()) {
  throw new Error(`Unexpected table header: ${header.join(" | ")}`);
}
/* rows[1] is the | --- | --- | --- | separator */
const cars = rows.slice(2).map((line) => {
  const cells = line.split("|").map((c) => c.trim()).filter((_, i, a) => {
    /* a line "| a | b | c |" splits into ["", " a ", " b ", " c ", ""] */
    return i > 0 && i < a.length - 1 ? true : false;
  });
  if (cells.length !== 3) throw new Error(`Bad row: ${line}`);
  return { car: cells[0], status: cells[1], notes: cells[2] };
});

writeFileSync(outFile, JSON.stringify(cars, null, 2) + "\n");
console.log(`synced ${cars.length} cars -> ${outFile.replace(root + "/", "")}`);

/* ---------- job 2: changelog, site -> wiki ---------- */

const { releases } = await import(join(root, "src", "data", "changelog.js"));

/* the data file holds trusted inline HTML; the wiki page needs
 * markdown. Convert the small vocabulary the data file uses. */
function itemMd(html) {
  return html
    .replace(/\s+/g, " ")
    .trim()
    .replace(/<b>(.*?)<\/b>/gs, "**$1**")
    .replace(/<code>(.*?)<\/code>/gs, "`$1`")
    .replace(/<a href="(.*?)">(.*?)<\/a>/gs, "[$2]($1)")
    .replace(/&rsquo;/g, "'")
    .replace(/&ldquo;/g, "\u201c")
    .replace(/&rdquo;/g, "\u201d")
    .replace(/&ndash;/g, "–")
    .replace(/&mdash;/g, "—")
    .replace(/&amp;/g, "&");
}

function releaseMd(rel) {
  const head = rel.ver
    ? rel.title
      ? `## ${rel.ver} — ${rel.title} (${rel.date})`
      : `## ${rel.ver} (${rel.date})`
    : rel.title
      ? `## ${rel.date} — ${rel.title}`
      : `## ${rel.date}`;
  const lines = ["", head, ""];
  if (rel.summary) lines.push(rel.summary, "");
  for (const item of rel.items ?? []) {
    lines.push(`- ${itemMd(item.html)}`);
    for (const sub of item.sub ?? []) {
      lines.push(`  - ${itemMd(sub.html)}`);
    }
  }
  return lines.join("\n");
}

const wikiLogPath = join(wiki, "releases", "changelog.md");
const current = readFileSync(wikiLogPath, "utf8");

/* keep the page's hand-written tail (upstream links) verbatim */
const tailMark = "## Upstream release notes";
const tailIdx = current.indexOf(tailMark);
const tail = tailIdx === -1 ? "" : current.slice(tailIdx).replace(
  /\n<!-- TODO\(pass-2\)[^>]*-->\s*$/,
  "\n",
);

const generated = [
  "# Changelog",
  "",
  "zoompilot release notes. The release channel is `zoompilot/main`; the",
  "site header always shows the current release commit.",
  "",
  "<!-- Generated from the site repo's src/data/changelog.js by",
  "     scripts/sync-wiki.mjs (`npm run sync:wiki`). Edit the data file",
  "     there, not this page: manual edits to the releases below are",
  "     lost on the next sync. -->",
  ...releases.map(releaseMd),
  "",
].join("\n");

writeFileSync(wikiLogPath, generated + (tail ? "\n" + tail : "\n"));
console.log(`changelog -> wiki/docs/releases/changelog.md (${releases.length} releases)`);

/* ---------- job 3: steering chart, site -> wiki ---------- */

const chartPath = generateWikiChart();
console.log(`chart -> ${chartPath.split("zoompilot-wiki/")[1]}`);
const chartDataPath = generateWikiChartData();
console.log(`chart data -> ${chartDataPath.split("zoompilot-wiki/")[1]}`);

/* ---------- job 4: route evidence index, wiki -> wiki ---------- */

/*
 * The technical notes cite routes as evidence (route 132, route
 * 7f9e3ff336, ...). This job scans docs/technical/*.md for those
 * citations and regenerates docs/technical/route-library.md: every
 * route ref, the page, and the claim it backs. A ref in full
 * dongle/route form (dongleid/date--time) links to comma connect;
 * the test-fleet shorthand is listed as-is, because inventing full
 * IDs would be fabrication.
 */
import { readdirSync, statSync } from "node:fs";

const technicalDir = join(wiki, "technical");
const routePage = join(technicalDir, "route-library.md");

const FULL_ROUTE = /([0-9a-f]{16})\/(\d{4}-\d{2}-\d{2}--\d{2}-\d{2}-\d{2})/g;
/* fleet shorthand: hex-ish tokens after "route(s)", optionally listed
 * with commas / + / "and". The group must end at a word boundary, so
 * prose like "routes behind every number" cannot donate its hex prefix
 * ("be") — but the fleet's own "be" / "fe" style refs still pass. */
const ROUTE_TOKEN = "[0-9a-f]{2,16}";
const SHORT_ROUTE = new RegExp(
  "\\broutes?\\s+(" +
    ROUTE_TOKEN +
    "((?:\\s*(?:,|\\+|and)\\s*)" +
    ROUTE_TOKEN +
    ")*)\\b",
  "g",
);
/* made of hex letters but never a route */
const REF_STOP = new Set(["id"]);

/* Prose sentences of a technical page, each flagged with whether it sits
 * under a "Tried and rejected" heading. Those bullets are one-line
 * digests of claims the body already cites; they only earn their own
 * row when they are the sole evidence for a ref. */
function sentencesOf(text) {
  const out = [];
  let inFence = false;
  let inRejected = false;
  let current = null;
  const flush = () => {
    if (!current) return;
    const blob = current.lines.join(" ").replace(/\s+/g, " ").trim();
    for (const s of blob.split(/(?<=[.;])\s+/)) {
      const t = s.trim();
      if (t) out.push({ rejected: current.rejected, text: t });
    }
    current = null;
  };
  for (const line of text.split("\n")) {
    const trimmed = line.trim();
    if (trimmed.startsWith("```")) {
      flush();
      inFence = !inFence;
    } else if (inFence) {
      continue;
    } else if (/^#{1,3}\s/.test(trimmed)) {
      flush();
      inRejected = /tried and rejected/i.test(trimmed);
    } else if (trimmed.startsWith("|") || !trimmed) {
      flush();
    } else {
      if (!current) current = { rejected: inRejected, lines: [] };
      current.lines.push(line);
    }
  }
  flush();
  return out;
}

function validShortRef(group) {
  const tokens = group.split(/\s*(?:,|\+|and)\s*/);
  return tokens.every((t) => /^[0-9a-f]{2,16}$/.test(t) && !REF_STOP.has(t));
}

const citations = [];
for (const name of readdirSync(technicalDir).sort()) {
  const path = join(technicalDir, name);
  if (!statSync(path).isFile() || !name.endsWith(".md")) continue;
  if (name === "route-library.md") continue;
  if (name === "index.md") continue;
  /* rejected.md is a digest of the other pages' Tried-and-rejected
   * bullets; the library points at the primary pages instead. */
  if (name === "rejected.md") continue;
  const text = readFileSync(path, "utf8");
  const seen = new Set();
  const bodyRefs = new Set();
  for (const sentence of sentencesOf(text)) {
    const refs = new Set();
    for (const m of sentence.text.matchAll(FULL_ROUTE)) {
      refs.add(`${m[1]}/${m[2]}`);
    }
    for (const m of sentence.text.matchAll(SHORT_ROUTE)) {
      if (validShortRef(m[1])) refs.add(m[1]);
    }
    /* body sentences come first in file order, so a Tried-and-rejected
     * bullet whose refs are all already cited from the body adds nothing */
    const fresh = [...refs].filter((r) => !bodyRefs.has(r));
    if (sentence.rejected && fresh.length === 0) continue;
    for (const ref of refs) {
      const key = ref + "|" + sentence.text;
      if (seen.has(key)) continue;
      seen.add(key);
      citations.push({
        ref,
        page: `technical/${name}`,
        context:
          sentence.text.length > 160
            ? sentence.text.slice(0, 157) + "…"
            : sentence.text,
      });
    }
    if (!sentence.rejected) {
      for (const ref of refs) bodyRefs.add(ref);
    }
  }
}

/* keep one row per (ref, page, context); refs repeat across claims */
citations.sort((a, b) =>
  a.page === b.page
    ? a.ref.localeCompare(b.ref)
    : a.page.localeCompare(b.page),
);

function refCell(ref) {
  if (FULL_ROUTE.test(ref)) {
    FULL_ROUTE.lastIndex = 0;
    return `[connect](https://connect.comma.ai/${ref}) · \`${ref}\``;
  }
  FULL_ROUTE.lastIndex = 0;
  return `\`${ref}\``;
}

const routeDoc = [
  "# Route library — the evidence index",
  "",
  "<!-- Generated by the site repo's scripts/sync-wiki.mjs",
  "     (`npm run sync:wiki`) from the technical pages. Edit those",
  "     pages, not this one: manual edits are lost on the next sync. -->",
  "",
  "Every route the technical notes cite, with the claim it backs. This",
  "is the record's evidence locker: a number in a table is only as good",
  "as the drive it was measured on.",
  "",
  "Most entries use the project's test-fleet shorthand (`route 132`),",
  "which is stable inside the zoompilot sources but is not directly",
  "openable. The full `dongleid/date--time` routes link straight to",
  "[comma connect](https://connect.comma.ai). Ask on the",
  "[Discord](https://discord.gg/jFWkHC2uhh) for a full route behind a",
  "shorthand entry.",
  "",
  "| Route ref | Page | What it backs |",
  "| --- | --- | --- |",
  ...citations.map(
    (c) => `| ${refCell(c.ref)} | ${c.page.replace("technical/", "")} | ${c.context} |`,
  ),
  "",
].join("\n");

writeFileSync(routePage, routeDoc);
console.log(`route library -> ${routePage.split("zoompilot-wiki/")[1]} (${citations.length} citations)`);

/* ---------- job 5: car checker data, site -> wiki ---------- */

const carsJson = JSON.parse(
  readFileSync(join(root, "src", "data", "supported-cars.json"), "utf8"),
);
const checkerFile = join(wiki, "assets", "js", "car-checker-data.js");
writeFileSync(
  checkerFile,
  [
    "/* Generated by the site repo's scripts/sync-wiki.mjs",
    "   (`npm run sync:wiki`) from src/data/supported-cars.json.",
    "   Do not edit. Rendered by docs/assets/js/car-checker.js. */",
    `window.ZP_CARS = ${JSON.stringify(carsJson)};`,
    "",
  ].join("\n"),
);
console.log(`car checker data -> ${checkerFile.split("zoompilot-wiki/")[1]} (${carsJson.length} cars)`);

/* ---------- record fingerprints for the next run's guard ---------- */

recordState();
console.log("sync state -> scripts/sync-state.json");
