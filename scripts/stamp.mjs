/*
 * Refresh the build stamp in src/data/changelog.js from the latest
 * commit on zoompilot/main:
 *
 *     npm run stamp
 *
 * The page also refreshes the stamp at runtime from the GitHub API;
 * this keeps the static fallback honest for offline/no-JS visitors.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const target = join(here, "..", "src", "data", "changelog.js");

const res = await fetch(
  "https://api.github.com/repos/zoompilot/zoompilot/commits?per_page=1",
);
if (!res.ok) {
  throw new Error(`GitHub API returned ${res.status}`);
}
const [commit] = await res.json();
const sha = commit.sha.slice(0, 10);
const d = new Date(commit.commit.committer.date);
const pad = (n) => (n < 10 ? "0" : "") + n;
const date = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

let src = readFileSync(target, "utf8");
const line = `export const build = { sha: "${sha}", date: "${date}" };`;
const next = src.replace(
  /export const build = \{ sha: "[0-9a-f]+", date: "[0-9-]+" \};/,
  line,
);
if (next === src) {
  /* already current: fine in CI (the weekly rebuild hits this often),
   * so log and exit clean instead of failing the build */
  console.log("stamp already current");
} else {
  writeFileSync(target, next);
  console.log(`stamp -> ${sha} · ${date}`);
}
