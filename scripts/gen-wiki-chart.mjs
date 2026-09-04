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
  MPH_TO_MS,
  V_MAX,
  C_MIN,
  C_MAX,
  CEIL_BP,
  CEIL_V,
  STOCK_CAP,
  JOIN_V,
  gapPath,
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
  gapFill: "rgba(157,162,166,0.12)",
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
  <path d="${gapPath}" fill="${C.gapFill}"/>
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
  <text x="${X0}" y="11" text-anchor="start" fill="${
    C.text
  }" font-family='${C.mono}' font-size="10" letter-spacing="0.08em">torque · counts</text>
</svg>
`;

export function generateWikiChart() {
  writeFileSync(outFile, svg);
  return outFile;
}

/*
 * Also write the same geometry as a plain script the wiki's live chart
 * (docs/assets/js/torque-live.js) reads: window.ZP_TORQUE_DATA. The
 * paths ship prebuilt so the wiki script stays a dumb renderer —
 * geometry changes always come from this file, on the next sync.
 */
const dataFile = join(
  here,
  "..",
  "..",
  "zoompilot-wiki",
  "docs",
  "assets",
  "steering-torque-data.js",
);

export function generateWikiChartData() {
  const data = {
    view: { w: VIEW_W, h: VIEW_H, x0: X0, x1: X1, y0: Y0, y1: Y1 },
    cMin: C_MIN,
    cMax: C_MAX,
    vMax: V_MAX,
    mphToMs: MPH_TO_MS,
    ceilBp: CEIL_BP,
    ceilV: CEIL_V,
    stockCap: STOCK_CAP,
    joinV: JOIN_V,
    gapV: GAP_V,
    gapPct: GAP_PCT,
    xTicks,
    yTicks,
    paths: { zp: zpPath, zpShared: zpSharedPath, stock: stockPath, gap: gapPath },
  };
  const js = [
    "/* Generated by the site repo's scripts/gen-wiki-chart.mjs",
    "   (`npm run sync:wiki`). Do not edit: changes are lost on the next",
    "   sync. Consumed by docs/assets/js/torque-live.js. */",
    `window.ZP_TORQUE_DATA = ${JSON.stringify(data)};`,
    "",
  ].join("\n");
  writeFileSync(dataFile, js);
  return dataFile;
}

/* run standalone: node scripts/gen-wiki-chart.mjs */
const isMain =
  import.meta.url === pathToFileURL(process.argv[1] ?? "").href;
if (isMain) {
  const out = generateWikiChart();
  console.log(`chart -> ${out.split("zoompilot-wiki/")[1]}`);
  const data = generateWikiChartData();
  console.log(`chart data -> ${data.split("zoompilot-wiki/")[1]}`);
}
