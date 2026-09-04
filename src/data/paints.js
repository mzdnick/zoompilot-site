/*
 * The 2022-2025 CX-5 paint line. Codes, display names, and whether the
 * paint is light enough to need dark ink on chips and CTAs.
 *
 * The color values themselves live once, in src/styles/site.css
 * (the :root --p* tokens). Keep this list in step with those tokens:
 * same codes, same order as the chip wall and the footer paint line.
 */
export const paints = [
  { code: "46v", name: "soul red crystal" },
  { code: "45p", name: "sonic silver", dark: true },
  { code: "47c", name: "polymetal gray" },
  { code: "45b", name: "eternal blue" },
  { code: "46g", name: "machine gray" },
  { code: "25d", name: "snowflake white pearl", dark: true },
  { code: "42m", name: "deep crystal blue" },
  { code: "41w", name: "jet black mica" },
];

/* must agree with the aria-pressed chip in the hero */
export const defaultPaint = "46g";
