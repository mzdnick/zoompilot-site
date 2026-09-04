/*
 * Generate the wiki's copy of the EPS authority chart:
 *
 *     node scripts/gen-wiki-chart.mjs
 *     (also runs as part of npm run sync:wiki)
 *
 * Writes docs/assets/steering-torque.svg in the wiki repo. The
 * geometry comes from src/data/chart-geometry.js — the same source the
 * site's TorqueChart.astro renders — so the two charts cannot drift.
 * Colors are baked hex (46G machine gray palette, the site default)
 * because the wiki embeds the file as an <img>, where CSS vars do not
 * reach. The site's copy stays theme-aware and interactive.
 */
import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import {
  X0,
  X1,
  Y0,
  Y1,
  VIEW_W,
  VIEW_H,
  x,
  y,
  zpPath,
  zpSharedPath,
  stockPath,
  GAP_V,
  GAP_PCT,
  xTicks,
  yTicks,
} from "../src/data/chart-geometry.js";

const here = dirname(fileURLToPath(import.meta.url));
const outFile = join(
  here,
  "..",
  "..",
  "zoompilot-wiki",
  "docs",
  "assets",
  "steering-torque.svg",
);

/* 46G machine gray palette: the site default paint */
const C = {
  panel: "#101216",
  grid: "rgba(255,255,255,0.06)",
  axis: "rgba(255,255,255,0.16)",
  text: "#7e8695",
  label: "#a9aeb8",
  accent: "#9da2a6",
  band: "rgba(157,162,166,0.16)",
  warn: "#e8a13c",
  mono: '"JetBrains Mono", ui-monospace, Menlo, monospace',
};

const grid = yTicks
  .map(
    (c) =>
      `<line class="tc-grid" x1="${X0}" x2="${X1}" y1="${y(c)}" y2="${y(
        c,
      )}" stroke="${C.grid}"/>` +
      `<text x="${X0 - 8}" y="${y(c) + 4}" text-anchor="end" fill="${
        C.text
      }" font-family='${C.mono}' font-size="11">${c}</text>`,
  )
  .join("\n  ");

const xLabels = xTicks
  .map(
    (t) =>
      `<line x1="${x(t.v)}" x2="${x(t.v)}" y1="${Y1}" y2="${
        Y1 + 4
      }" stroke="${C.axis}"/>` +
      `<text x="${x(t.v)}" y="${Y1 + 18}" text-anchor="middle" fill="${
        C.text
      }" font-family='${C.mono}' font-size="11">${t.mph}</text>`,
  )
  .join("\n  ");

const gapLabelY = y(980);

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${VIEW_W} ${VIEW_H}" role="img" aria-label="Available steering torque from the EPS across speed, up to 40 mph. The EPS can apply up to 1148 counts at neighborhood speeds, ramping down through nine measured points to 620 by about 32 mph. zoompilot tracks that measured ceiling: up to 44 percent more torque than stock, with no hardware mods. Stock openpilot caps every command at one flat 800-count scale; past about 29 mph the EPS clamps both to the same torque.">
  <title>EPS torque you can get, by speed: the measured ceiling vs stock's flat 800 cap</title>
  <rect x="0.5" y="0.5" width="${VIEW_W - 1}" height="${VIEW_H - 1}" rx="14" fill="${C.panel}" stroke="rgba(255,255,255,0.09)"/>
  ${grid}
  <line x1="${x(GAP_V)}" x2="${x(GAP_V)}" y1="${y(1148)}" y2="${y(800)}" stroke="${C.accent}" stroke-width="1" stroke-dasharray="2 3" opacity="0.7"/>
  <text x="${x(GAP_V) + 8}" y="${gapLabelY}" fill="${C.accent}" font-family='${C.mono}' font-size="10.5" letter-spacing="0.04em"><tspan x="${x(GAP_V) + 8}" dy="0" fill="${C.text}">up to</tspan><tspan x="${x(GAP_V) + 8}" dy="13">${GAP_PCT}% more torque</tspan><tspan x="${x(GAP_V) + 8}" dy="13" fill="${C.warn}">with no hardware mods</tspan></text>
  <path d="${stockPath}" fill="none" stroke="${C.text}" stroke-width="1.6"/>
  <text x="${X0 + 8}" y="${y(800) + 16}" text-anchor="start" fill="${
    C.label
  }" font-family='${C.mono}' font-size="10.5" letter-spacing="0.04em">stock openpilot</text>
  <path d="${zpPath}" fill="none" stroke="${C.accent}" stroke-width="2"/>
  <path d="${zpSharedPath}" fill="none" stroke="${C.accent}" stroke-width="2" stroke-dasharray="7 6"/>
  <text x="${X0 + 8}" y="${y(1148) - 8}" text-anchor="start" fill="${
    C.accent
  }" font-family='${C.mono}' font-size="10.5" letter-spacing="0.04em">zoompilot</text>
  <line x1="${X0}" x2="${X1}" y1="${Y1}" y2="${Y1}" stroke="${C.axis}"/>
  <line x1="${X0}" x2="${X0}" y1="${Y0}" y2="${Y1}" stroke="${C.axis}"/>
  ${xLabels}
  <text x="${X1}" y="${Y1 + 31}" text-anchor="end" fill="${
    C.text
  }" font-family='${C.mono}' font-size="10" letter-spacing="0.08em">speed · mph</text>
  <text transform="translate(14 ${Y1 - 6}) rotate(-90)" text-anchor="start" fill="${
    C.text
  }" font-family='${C.mono}' font-size="10" letter-spacing="0.08em">available EPS torque</text>
</svg>
`;

export function generateWikiChart() {
  writeFileSync(outFile, svg);
  return outFile;
}

/* run standalone: node scripts/gen-wiki-chart.mjs */
const isMain =
  import.meta.url === pathToFileURL(process.argv[1] ?? "").href;
if (isMain) {
  const out = generateWikiChart();
  console.log(`chart -> ${out.split("zoompilot-wiki/")[1]}`);
}
