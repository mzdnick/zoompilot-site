/*
 * Sync structured content between the zoompilot-wiki repo and this
 * site. Run after wiki edits or after adding a release:
 *
 *     npm run sync:wiki
 *
 * Three jobs:
 *   1. wiki -> site: the supported-cars table into
 *      src/data/supported-cars.json (section 06 renders it).
 *   2. site -> wiki: the releases page (docs/releases/changelog.md)
 *      regenerated from src/data/changelog.js — the site data file is
 *      the changelog source of truth. The wiki's "Upstream release
 *      notes" tail is preserved verbatim.
 *   3. site -> wiki: docs/assets/steering-torque.svg, the EPS behavior
 *      chart, rendered from src/data/chart-geometry.js (the same
 *      source the site's chart uses). See scripts/gen-wiki-chart.mjs.
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
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { generateWikiChart } from "./gen-wiki-chart.mjs";

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, "..");
const wiki = join(root, "..", "zoompilot-wiki", "docs");

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
