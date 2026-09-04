---
name: new-paint
description: Add or change a paint color on the zoompilot site's CX-5 paint wall. Use whenever the user mentions paints, paint colors, chips, the paint wall or the footer paint line, wants a new Mazda color added, or when editing src/data/paints.js, the ZP_PAINTS map in Base.astro, or --p* tokens and .c* chip classes in site.css. Lists every place a paint must be edited so chips, theming, and the footer line stay in step.
---

# Add a paint

One paint lives in five places. Nothing checks that they agree, so work through the whole list. Codes are Mazda paint codes, lowercase in data (`46v`); the components uppercase them for display. Keep the same codes in the same order everywhere — the order drives the chip wall and the footer line.

## The five edit sites

1. **`src/styles/site.css`, `:root` tokens.** Four vars per paint: `--p<code>`, `--p<code>-hi` (highlight), `--p<code>-lo` (shadow), `--p<code>-t` (accent/text tint). Add them in wall order.
2. **`src/data/paints.js`.** One entry: `{ code: "46v", name: "soul red crystal" }`. Add `dark: true` for light paints. Same order as the tokens.
3. **`src/styles/site.css`, chip class.** `.c<code> { --cb: var(--p<code>); --ch: var(--p<code>-hi); --cl: var(--p<code>-lo); }`. The chip markup comes from `paints.js` via `Hero.astro`, so this class is all the CSS a chip needs.
4. **`src/layouts/Base.astro`, the inline `ZP_PAINTS` map.** `"46v": { n: "soul red crystal" }`. The runtime repaint reads this map; `dark: true` switches CTA text to dark ink.
5. **`src/styles/site.css`, the `.paintline` footer gradient.** Add a `var(--p<code>)` stop and rebalance the percentages (today 8 stops at 12.5% each).

## Light paints

If the paint is light enough to need dark text (see `45p` sonic silver, `25d` snowflake white), set all three or none:

- `dark: true` in `paints.js` (drives the build-time markup),
- `dark: true` in the `ZP_PAINTS` entry (drives `--cta-text` at runtime),
- add the chip class to the `--ink: var(--ink-dark)` selector in site.css (today `.c45p, .c25d`), so the code printed on the chip stays readable.

A miss gives white text on a white chip.

## More couplings

- **Chip boot animation.** `.chips .chip:nth-child(2)` through `:nth-child(8)` stagger the boot animation. A ninth chip needs a new `nth-child(9)` delay (the next step is 0.4s).
- **Changing the default paint** (today `46g` machine gray): update the `:root` initial values (`--paint`, `--paint-hi`, `--paint-lo`, `--accent`, `--cta-text`), `defaultPaint` in `paints.js`, and the `theme-color` meta in `Base.astro` — a hand-computed `--bg` snapshot for the default paint (today `#131518`). The hero's pressed chip derives from `defaultPaint` automatically.

## Verify

Run `npm run dev`, then click through every chip: the page repaints, the code on each chip is legible, the footer line shows the new band, and the CTA text flips for light paints. On narrow screens the chip wall is hidden by design. The axe and Lighthouse gate runs after deploy, so catch contrast problems here.
