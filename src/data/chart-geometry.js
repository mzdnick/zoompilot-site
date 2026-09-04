/*
 * Shared geometry for the EPS behavior chart. Used by two renderers
 * that must never drift apart:
 *   - src/components/TorqueChart.astro (the site, interactive)
 *   - scripts/gen-wiki-chart.mjs (a static SVG for the wiki)
 *
 * Every curve except stock's level is measured:
 *   - LAF gain and friction per speed band: the CX-5 device cache
 *     2026-08-19, kept as CSVs beside this file
 *     (LAF-torquegainbin.csv, frictionbin.csv).
 *   - EPS_CEILING_LOOKUP and STEER_MAX_LOOKUP: the fork's opendbc
 *     mazda/values.py. Stock openpilot runs one flat STEER_MAX = 800
 *     at every speed (values-open.py).
 * The response lines hold one illustrative corner demand
 * (DEMAND, m/s^2); their shape comes from the measured tables. The
 * axis stops at ~45 mph: past the cliff the learned curve settles
 * onto stock's level and there is nothing more to show.
 */

export const X0 = 46,
  X1 = 628,
  Y0 = 18,
  Y1 = 282,
  VIEW_W = 640,
  VIEW_H = 320,
  V_MAX = 20,
  C_MAX = 1300;

export const CLIFF_LO = 14.2,
  CLIFF_HI = 14.5,
  CLIFF_MID = (CLIFF_LO + CLIFF_HI) / 2;

export const x = (v) => X0 + (v / V_MAX) * (X1 - X0);
export const y = (c) => Y1 - (c / C_MAX) * (Y1 - Y0);

/* measured tables ------------------------------------------------ */

/* the seven learned bands (CX-5, device cache 2026-08-19) */
export const bands = [
  { ms: 6.5, mph: 15 },
  { ms: 9.5, mph: 21 },
  { ms: 12.0, mph: 27 },
  { ms: 16.4, mph: 37 },
  { ms: 21.0, mph: 47 },
  { ms: 28.0, mph: 63 },
  { ms: 35.0, mph: 78 },
];

/* the chart window ends past the cliff; bands above V_MAX draw no
 * hairline */
export const shownBands = bands.filter((b) => b.ms < V_MAX);

/* gain in counts per m/s^2 and friction in counts, per band */
const BIN_MS = bands.map((b) => b.ms);
const LAF = [2017, 2383, 1908, 1513, 1525, 1913, 2200];
const FRICTION = [192, 172, 149, 116, 106, 98, 86];

/* the EPS's own applied-torque ceiling, nine measured points */
const CEIL_BP = [8.0, 8.5, 9.4, 10.3, 11.2, 12.1, 13.0, 13.9, 14.5];
const CEIL_V = [1148, 1132, 1092, 1048, 1012, 920, 808, 676, 620];

/* the one held corner demand for the response lines */
const DEMAND = 0.3; // m/s^2

/* stock's single learned factor lands on the high-speed plateau;
 * the level is schematic, the flat shape is the point */
export const STOCK = 560;

/* np.interp with flat clamps, the same semantics the car code uses */
function interp(bp, vals, v) {
  if (v <= bp[0]) return vals[0];
  if (v >= bp[bp.length - 1]) return vals[vals.length - 1];
  let i = 0;
  while (v > bp[i + 1]) i++;
  const t = (v - bp[i]) / (bp[i + 1] - bp[i]);
  return vals[i] + t * (vals[i + 1] - vals[i]);
}

/* zoompilot's torque for the held demand: gain and friction
 * interpolated in count space (continuous through the cliff window),
 * clipped to the measured ceiling the way carcontroller.py clips */
const zpCounts = (v) =>
  Math.min(
    interp(BIN_MS, LAF, v) * DEMAND + interp(BIN_MS, FRICTION, v),
    interp(CEIL_BP, CEIL_V, v),
  );

/* paths ----------------------------------------------------------- */

const pts = (pairs) =>
  pairs
    .map(([v, c]) => `L ${x(v).toFixed(1)} ${y(c).toFixed(1)}`)
    .join(" ");

/* fine sample: the demand curve and the ceiling cross between
 * breakpoints where the ceiling clip engages */
export const zpPath =
  `M ${x(0).toFixed(1)} ${y(zpCounts(0)).toFixed(1)} ` +
  pts(
    Array.from({ length: 81 }, (_, i) => {
      const v = (i / 80) * V_MAX;
      return [v, zpCounts(v)];
    }),
  );

export const stockPath = `M ${x(0)} ${y(STOCK)} L ${x(V_MAX)} ${y(STOCK)}`;

/* flat 1148, nine-point ramp to 620, flat again (np.interp clamps) */
export const ceilingPath =
  `M ${x(0).toFixed(1)} ${y(CEIL_V[0]).toFixed(1)} ` +
  pts(CEIL_BP.map((v, i) => [v, CEIL_V[i]])) +
  ` L ${x(V_MAX).toFixed(1)} ${y(CEIL_V[CEIL_V.length - 1]).toFixed(1)}`;

/* the CAN scale: unit conversion and PID limits, not applied torque */
export const scalePath =
  `M ${x(0)} ${y(1200)} L ${x(CLIFF_LO)} ${y(1200)} ` +
  `L ${x(CLIFF_HI)} ${y(800)} L ${x(V_MAX)} ${y(800)}`;

export const xTicks = [
  { v: 0, mph: "0" },
  { v: 5, mph: "11" },
  { v: 10, mph: "22" },
  { v: 15, mph: "34" },
  { v: 20, mph: "45" },
];

export const yTicks = [400, 800, 1200];
