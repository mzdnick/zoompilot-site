/*
 * Release watcher: detect a new upstream release and, with --apply,
 * add a skeleton entry to the top of src/data/changelog.js.
 *
 *     node scripts/watch-release.mjs            check only
 *     node scripts/watch-release.mjs --apply    insert skeleton entry
 *
 * The signal is openpilot/sunnypilot/common/version.h on upstream
 * main: the same string the device home screen shows and the same
 * string the changelog's ver field carries. The scheduled workflow
 * runs this with --apply and opens a pull request; a human fills in
 * the real notes and merges.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const VERSION_H =
  "https://raw.githubusercontent.com/zoompilot/zoompilot/main/" +
  "openpilot/sunnypilot/common/version.h";

const here = dirname(fileURLToPath(import.meta.url));
const target = join(here, "..", "src", "data", "changelog.js");

const res = await fetch(VERSION_H);
if (!res.ok) throw new Error(`version.h fetch returned ${res.status}`);
const upstream =
  /#define\s+\w*VERSION\s+"([^"]+)"/.exec(await res.text())?.[1];
if (!upstream) throw new Error("no VERSION define found in version.h");

const src = readFileSync(target, "utf8");
const local =
  /export const releases = \[\s*\n\s*\{\s*ver: "([^"]+)"/.exec(src)?.[1] ??
  "";

if (upstream === local) {
  console.log(`release watch: current (${local})`);
  process.exit(0);
}

console.log(`release watch: upstream ${upstream} != site ${local || "(none)"}`);
if (!process.argv.includes("--apply")) process.exit(0);

/* skeleton entry; the date is today — adjust it in the PR if the
 * release actually landed earlier */
const date = new Date().toISOString().slice(0, 10);
const entry =
  '  {\n' +
  `    ver: "${upstream}",\n` +
  `    date: "${date}",\n` +
  '    items: [\n' +
  '      {\n' +
  `        html: \`<b>TODO:</b> Fill in the release notes for ${upstream}.\`,\n` +
  '      },\n' +
  '    ],\n' +
  '  },\n';
const marker = "export const releases = [\n";
if (!src.includes(marker)) throw new Error("releases marker not found");
writeFileSync(target, src.replace(marker, marker + entry));
writeFileSync(join(here, "..", ".release-version"), upstream);
console.log(`applied skeleton entry for ${upstream} (${date})`);
