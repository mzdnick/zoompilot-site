import rss from "@astrojs/rss";
import { releases, repo } from "../data/changelog.js";

/* The changelog as an RSS feed. Mirrors the on-site changelog: the
 * version leads, the date is the pubDate. */
const strip = (html) => html.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
/* compact stand-in title for releases that only carry item lists */
const shortHead = (rel) => {
  const t = strip(rel.items?.[0]?.html ?? rel.date);
  return t.length > 60 ? t.slice(0, 57).trimEnd() + "…" : t;
};

export function GET(context) {
  return rss({
    title: "zoompilot changelog",
    description:
      "Releases of zoompilot, the Mazda-optimized fork of sunnypilot.",
    site: context.site,
    items: releases.map((rel) => {
      const head = rel.title ?? rel.summary ?? shortHead(rel);
      return {
        title: rel.ver ? `${rel.ver} — ${head}` : `${rel.date} — ${head}`,
        pubDate: new Date(rel.date),
        description: rel.summary ?? (rel.items ?? []).map((i) => strip(i.html)).join(" · "),
        link: `${repo.github}/commits/main`,
        categories: rel.ver ? [rel.ver] : [],
      };
    }),
    customData: "<language>en</language>",
  });
}
