/*
 * Shared geometry for the EPS behavior chart. Used by two renderers
 * that must never drift apart:
 *   - src/components/TorqueChart.astro (the site, interactive)
 *   - scripts/gen-wiki-chart.mjs (a static SVG for the wiki)
 *
 * Measured anchors are from the wiki's lateral-tune record
 * (docs/technical/lateral-tune.md): STEER_MAX steps 1200 -> 800 counts
 * between 14.2 and 14.5 m/s (~32 mph); the CX-5 learns across seven
 * bands centered 6.5..35.0 m/s. The two response curves are schematic
 * — the per-band torque table is not published — drawn to show the
 * documented behavior: one factor for all speeds vs a tune per band
 * below the cliff, and output identical to stock above it. The axis
 * stops at ~45 mph because past the cliff zoompilot is functionally
 * stock; there is nothing more to show.
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

/* the chart window ends past the cliff, where zoompilot already
 * matches stock; bands above V_MAX draw no hairline */
export const shownBands = bands.filter((b) => b.ms < V_MAX);

/* schematic response, one corner demand held constant: one value per
 * band, held from each band's midpoint to the next. Past the cliff
 * zoompilot's output is functionally stock, so every band above it
 * sits at STOCK and the zoompilot line merges with the stock line. */
export const STOCK = 700;
export const zpValues = [950, 850, 780, STOCK];

export const mids = shownBands.map((b, i) =>
  i < shownBands.length - 1
    ? (b.ms + shownBands[i + 1].ms) / 2
    : V_MAX,
);

export const zpPath =
  `M ${x(0)} ${y(zpValues[0])} ` +
  shownBands
    .map((b, i) => {
      /* the drop to the next band happens at the cliff, not at the
       * band midpoint, so the step lines up with the measured scale */
      if (b.ms === 12.0 && shownBands[i + 1]) {
        return `L ${x(CLIFF_LO)} ${y(zpValues[i])} L ${x(CLIFF_HI)} ${y(
          zpValues[i + 1],
        )} `;
      }
      return `L ${x(mids[i])} ${y(zpValues[i])} `;
    })
    .join("");

export const stockPath = `M ${x(0)} ${y(STOCK)} L ${x(V_MAX)} ${y(STOCK)}`;

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
