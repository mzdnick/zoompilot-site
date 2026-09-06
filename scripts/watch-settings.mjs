/*
 * Settings watcher: detect changes to the on-device settings
 * definitions on upstream main.
 *
 *     node scripts/watch-settings.mjs            check only
 *     node scripts/watch-settings.mjs --apply    update the baseline
 *
 * Watches the two files the wiki's Settings reference is built from:
 * the settings screen definitions and the params keys (defaults).
 * On change it writes .settings-changed with a summary for the
 * workflow to relay, and --apply refreshes the baseline so the alert
 * fires once per change. The wiki side of the fix: re-review
 * docs/settings/index.md, then run contrib/gen-settings-data.py.
 */
import { createHash } from "node:crypto";
import { existsSync, readFileSync, writeFileSync, unlinkSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const RAW =
  "https://raw.githubusercontent.com/zoompilot/zoompilot/main/";
const FILES = [
  "openpilot/sunnypilot/sunnylink/settings_ui.json",
  "openpilot/common/params_keys.h",
];

const here = dirname(fileURLToPath(import.meta.url));
const baselinePath = join(here, "settings-watch.json");
const flagPath = join(here, "..", ".settings-changed");

const baseline = existsSync(baselinePath)
  ? JSON.parse(readFileSync(baselinePath, "utf8"))
  : {};

const current = {};
const changed = [];
for (const file of FILES) {
  const res = await fetch(RAW + file);
  if (!res.ok) throw new Error(`${file} fetch returned ${res.status}`);
  current[file] = createHash("sha256")
    .update(await res.text())
    .digest("hex")
    .slice(0, 12);
  if (baseline[file] && baseline[file] !== current[file]) {
    changed.push(`${file}: ${baseline[file]} -> ${current[file]}`);
  } else if (!baseline[file]) {
    changed.push(`${file}: first watch, baseline ${current[file]}`);
  }
}

if (process.argv.includes("--apply")) {
  writeFileSync(baselinePath, JSON.stringify(current, null, 2) + "\n");
}

if (
  changed.length &&
  process.argv.includes("--apply") &&
  baseline[FILES[0]]
) {
  writeFileSync(changed.join("\n") + "\n", flagPath);
  console.log(`settings watch: CHANGED\n${changed.join("\n")}`);
} else {
  if (existsSync(flagPath)) unlinkSync(flagPath);
  console.log(
    changed.length && !baseline[FILES[0]]
      ? `settings watch: baselined (${changed.length} file(s))`
      : "settings watch: current",
  );
}
