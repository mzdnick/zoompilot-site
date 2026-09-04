/*
 * Generate the wiki's copy of the EPS behavior chart:
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
  CLIFF_MID,
  x,
  y,
  shownBands,
  zpPath,
  stockPath,
  ceilingPath,
  scalePath,
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

const bandLines = shownBands
  .map(
    (b) =>
      `<line x1="${x(b.ms)}" x2="${x(b.ms)}" y1="${Y1}" y2="${
        Y0 + 6
      }" stroke="${C.band}" stroke-dasharray="1 5"/>`,
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

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${VIEW_W} ${VIEW_H}" role="img" aria-label="Steering torque across speed, one held corner demand, up to about 45 mph. Measured curves: the EPS torque ceiling ramping from about 1148 counts to 620 by the cliff near 32 mph, and the STEER_MAX CAN scale stepping 1200 to 800 there — a unit conversion and PID limit, not a torque step. zoompilot's line comes from the learned per-band gain and friction, continuous through the cliff window and settling onto stock's flat single-factor level past about 37 mph.">
  <title>EPS torque across speed: learned per-band gain vs one factor, under the measured ceiling</title>
  <rect x="0.5" y="0.5" width="${VIEW_W - 1}" height="${VIEW_H - 1}" rx="14" fill="${C.panel}" stroke="rgba(255,255,255,0.09)"/>
  ${grid}
  ${bandLines}
  <line x1="${x(CLIFF_MID)}" x2="${x(CLIFF_MID)}" y1="${Y1}" y2="${Y0}" stroke="${C.warn}" stroke-dasharray="4 4" opacity="0.75"/>
  <text x="${x(CLIFF_MID) + 8}" y="${Y0 + 10}" fill="${C.warn}" font-family='${C.mono}' font-size="10.5" letter-spacing="0.06em">the cliff · ~32 mph</text>
  <path d="${scalePath}" fill="none" stroke="${C.text}" stroke-width="1.2" stroke-dasharray="3 4" opacity="0.85"/>
  <text x="${X0 + 8}" y="${y(1200) - 8}" text-anchor="start" fill="${
    C.text
  }" font-family='${C.mono}' font-size="10.5">STEER_MAX · CAN scale · conversion + PID limits</text>
  <path d="${ceilingPath}" fill="none" stroke="${C.label}" stroke-width="1.4" opacity="0.9"/>
  <text x="${X1 - 4}" y="${y(620) - 10}" text-anchor="end" fill="${
    C.label
  }" font-family='${C.mono}' font-size="10.5">EPS ceiling · measured</text>
  <path d="${stockPath}" fill="none" stroke="${C.text}" stroke-width="1.6"/>
  <text x="${X1 - 4}" y="${y(560) + 16}" text-anchor="end" fill="${
    C.label
  }" font-family='${C.mono}' font-size="10.5" letter-spacing="0.04em">stock openpilot · one factor, all speeds</text>
  <path d="${zpPath}" fill="none" stroke="${C.accent}" stroke-width="2"/>
  <text x="${x(0.6)}" y="${y(900) - 22}" fill="${
    C.accent
  }" font-family='${C.mono}' font-size="10.5" letter-spacing="0.04em">zoompilot · learned per-band torque</text>
  <line x1="${X0}" x2="${X1}" y1="${Y1}" y2="${Y1}" stroke="${C.axis}"/>
  <line x1="${X0}" x2="${X0}" y1="${Y0}" y2="${Y1}" stroke="${C.axis}"/>
  ${xLabels}
  <text x="${X1}" y="${Y1 + 31}" text-anchor="end" fill="${
    C.text
  }" font-family='${C.mono}' font-size="10" letter-spacing="0.08em">speed · mph</text>
  <text transform="translate(14 ${Y1 - 6}) rotate(-90)" text-anchor="start" fill="${
    C.text
  }" font-family='${C.mono}' font-size="10" letter-spacing="0.08em">EPS torque · CAN counts</text>
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
