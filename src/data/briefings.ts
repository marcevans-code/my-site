// Single source of truth for Morning Briefing metadata.
//
// Reads every src/pages/briefings/morning-briefing-YYYY-MM-DD.astro file's
// raw source at build time and pulls out its date, description, lead
// headline (the first <h3> story), and Top Story line. Used by:
//   - src/pages/briefings/index.astro   (the /briefings/ archive page)
//   - src/layouts/Layout.astro          (prev/next links, page title,
//                                        NewsArticle structured data)
// Nothing here needs editing when a new briefing is added — the glob picks
// it up automatically.

export interface Briefing {
  slug: string; // "morning-briefing-2026-10-07"
  dateStr: string; // "2026-10-07"
  href: string; // "/briefings/morning-briefing-2026-10-07/"
  date: Date;
  headline: string; // lead story, number + emoji stripped
  description: string;
  topStory: string;
}

const sources = import.meta.glob("/src/pages/briefings/morning-briefing-*.astro", {
  query: "?raw",
  import: "default",
  eager: true,
}) as Record<string, string>;

const decode = (s: string) =>
  s
    .replace(/<[^>]*>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&rsquo;/g, "’")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();

// "1. ⚖️ Granbury Puts Its Recall..." → "Granbury Puts Its Recall..."
const cleanHeadline = (s: string) =>
  decode(s)
    .replace(/^\d+\.\s*/, "")
    .replace(/^[^\p{L}\p{N}"“'‘]+/u, "")
    .trim();

export const briefings: Briefing[] = Object.entries(sources)
  .map(([path, src]) => {
    const m = path.match(/(morning-briefing-(\d{4}-\d{2}-\d{2}))\.astro$/);
    if (!m) return null;
    const [, slug, dateStr] = m;
    const h3 = src.match(/<h3[^>]*>([\s\S]*?)<\/h3>/);
    const desc = src.match(/description="([^"]*)"/);
    const top = src.match(/class="top-story"[^>]*>([\s\S]*?)<\/p>/);
    return {
      slug,
      dateStr,
      href: `/briefings/${slug}/`,
      date: new Date(`${dateStr}T12:00:00Z`),
      headline: h3 ? cleanHeadline(h3[1]) : "",
      description: desc ? desc[1] : "",
      topStory: top ? decode(top[1]).replace(/^Top Story:\s*/i, "") : "",
    } satisfies Briefing;
  })
  .filter((b): b is Briefing => b !== null)
  .sort((a, b) => b.dateStr.localeCompare(a.dateStr)); // newest first

export const formatBriefingDate = (d: Date, month: "long" | "short" = "long") =>
  d.toLocaleDateString("en-US", { month, day: "numeric", year: "numeric", timeZone: "UTC" });

/** Look up a briefing (and its neighbours) from a URL pathname. */
export function findBriefing(pathname: string) {
  const m = pathname.match(/\/briefings\/(morning-briefing-\d{4}-\d{2}-\d{2})\/?$/);
  if (!m) return null;
  const i = briefings.findIndex((b) => b.slug === m[1]);
  if (i === -1) return null;
  return {
    current: briefings[i],
    newer: i > 0 ? briefings[i - 1] : null,
    older: i < briefings.length - 1 ? briefings[i + 1] : null,
  };
}

/**
 * Search-friendly <title> for a briefing: leads with the day's top story
 * instead of the date, e.g.
 *   "Granbury Puts Its Recall Election on Hold… | Morning Briefing, Oct 7, 2026"
 */
export const briefingTitle = (b: Briefing) =>
  b.headline
    ? `${b.headline} | Morning Briefing, ${formatBriefingDate(b.date, "short")}`
    : `Morning Briefing, ${formatBriefingDate(b.date)} | Power Grab TX`;
