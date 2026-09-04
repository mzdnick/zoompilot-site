// @ts-check
import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";

// Static output. Cloudflare Pages: build `npm run build`, output `dist`.
//
// site is the deployed origin: Cloudflare sets CF_PAGES_URL on its build
// runners, so sitemap/RSS/og:image URLs always resolve on whichever host
// the build ships to. The canonical <link> in Base.astro stays pinned to
// zoompilot.ai on purpose — that is the intended final home.
export default defineConfig({
  site: process.env.CF_PAGES_URL ?? "https://zoompilot-site.pages.dev",
  integrations: [sitemap()],
  trailingSlash: "ignore",
});
