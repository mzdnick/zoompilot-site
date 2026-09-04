/*
 * Shared geometry for the EPS authority chart. Used by two renderers
 * that must never drift apart:
 *   - src/components/TorqueChart.astro (the site, interactive)
 *   - scripts/gen-wiki-chart.mjs (a static SVG for the wiki)
 *
 * The chart answers one question: how much steering torque can the
 * EPS actually apply, by speed — and how much of it each controller
 * will ask for.
 *   - The EPS ceiling is measured (EPS_CEILING_LOOKUP in the fork's
 *     opendbc mazda/values.py): near 1148 counts at neighborhood
 *     speeds, nine points down to 620 by ~32 mph (the "cliff").
 *   - zoompilot clamps its commands to that ceiling and scales them
 *     with the real STEER_MAX schedule, so its available torque IS
 *     the ceiling.
 *   - Stock openpilot caps every command at one flat STEER_MAX = 800
 *     (values-open.py), so it strands the difference below the cliff;
 *     above the cliff the EPS clamps it to the same 620.
 * The axis stops at 40 mph: past the cliff both controllers are
 * EPS-limited to the same 620 counts. The learned per-band gain
 * tables (LAF-torquegainbin.csv, frictionbin.csv) stay in src/data/
 * as the record behind the speed-dependent tune; they are not drawn.
 */

export const X0 = 46,
  X1 = 628,
  Y0 = 18,
  Y1 = 282,
  VIEW_W = 640,
  VIEW_H = 320,
  MPH_TO_MS = 0.44704,
  V_MAX_MPH = 40,
  V_MAX = V_MAX_MPH * MPH_TO_MS,
  C_MAX = 1300;

export const x = (v) => X0 + (v / V_MAX) * (X1 - X0);
export const y = (c) => Y1 - (c / C_MAX) * (Y1 - Y0);

/* the EPS's own applied-torque ceiling, nine measured points */
const CEIL_BP = [8.0, 8.5, 9.4, 10.3, 11.2, 12.1, 13.0, 13.9, 14.5];
const CEIL_V = [1148, 1132, 1092, 1048, 1012, 920, 808, 676, 620];

/* stock's single flat cap */
export const STOCK_CAP = 800;

/* np.interp with flat clamps, the same semantics the car code uses */
function interp(bp, vals, v) {
  if (v <= bp[0]) return vals[0];
  if (v >= bp[bp.length - 1]) return vals[vals.length - 1];
  let i = 0;
  while (v > bp[i + 1]) i++;
  const t = (v - bp[i]) / (bp[i + 1] - bp[i]);
  return vals[i] + t * (vals[i + 1] - vals[i]);
}

const ceiling = (v) => interp(CEIL_BP, CEIL_V, v);

/* where the flat 800 cap stops binding: the EPS starts clamping stock
 * there, so both lines run together from this speed up */
const JOIN_V = (() => {
  for (let i = 0; i < CEIL_BP.length - 1; i++) {
    if (CEIL_V[i] >= STOCK_CAP && CEIL_V[i + 1] < STOCK_CAP) {
      const t = (CEIL_V[i] - STOCK_CAP) / (CEIL_V[i] - CEIL_V[i + 1]);
      return CEIL_BP[i] + t * (CEIL_BP[i + 1] - CEIL_BP[i]);
    }
  }
  return V_MAX;
})();

/* paths ----------------------------------------------------------- */

const pts = (pairs) =>
  pairs
    .map(([v, c]) => `L ${x(v).toFixed(1)} ${y(c).toFixed(1)}`)
    .join(" ");

/* zoompilot: the full measured ceiling (flat clamps outside 8-14.5) */
export const zpPath =
  `M ${x(0).toFixed(1)} ${y(CEIL_V[0]).toFixed(1)} ` +
  pts(CEIL_BP.map((v, i) => [v, CEIL_V[i]])) +
  ` L ${x(V_MAX).toFixed(1)} ${y(CEIL_V[CEIL_V.length - 1]).toFixed(1)}`;

/* stock: flat 800 until the EPS starts clamping it, the ceiling
 * from there up */
export const stockPath =
  `M ${x(0).toFixed(1)} ${y(STOCK_CAP).toFixed(1)} ` +
  `L ${x(JOIN_V).toFixed(1)} ${y(STOCK_CAP).toFixed(1)} ` +
  pts(CEIL_BP.filter((v) => v > JOIN_V).map((v) => [v, ceiling(v)])) +
  ` L ${x(V_MAX).toFixed(1)} ${y(CEIL_V[CEIL_V.length - 1]).toFixed(1)}`;

/* the +torque gap callout sits in the flat region before the ramp */
export const GAP_V = 6.5;
export const GAP_PCT = Math.round(
  ((CEIL_V[0] - STOCK_CAP) / STOCK_CAP) * 100,
);

export const xTicks = [0, 10, 20, 30, 40].map((mph) => ({
  mph,
  v: mph * MPH_TO_MS,
}));

export const yTicks = [400, 800, 1200];
