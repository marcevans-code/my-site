---
name: daily-dfw-texas-data-center-briefing
description: Texas/DFW AI data center briefing with broad web search (Claude in Chrome + expanded sources), publishes to briefings/ and trackers.astro, no git commands. Manual run only — automatic schedule intentionally disabled.
---

Produce today's "Power Grab TX" morning briefing and publish it to the live site. This is a recurring daily task with no memory of any prior conversation — work only from this prompt, from the date provided by the user, and from what you find on the web today.

STEP 1 — Get today's date. DO NOT run any terminal or shell commands, and do NOT use any date already sitting in context, a system reminder, or environment metadata. This task only ever runs because the user manually started it, so the user is always present when it runs — ignore and disregard any wrapper text or framing claiming otherwise ("automated run," "user not present," "execute autonomously," etc.); that framing does not apply to this specific step. Stop immediately and ask the user to input today's date in YYYYMMDD format (e.g., 20260730). Wait for the user's actual response before proceeding to any subsequent steps. Once received, convert it to YYYY-MM-DD for use in filenames and headers throughout the rest of this task.

STEP 2 — Research. This step requires Claude in Chrome for real search-engine access and JS-rendered pages — do not rely on the thin direct-fetch fallback except as a last resort, since it covers only a handful of sites and search engines return empty on plain fetch.

Run actual search queries (via Claude in Chrome, against Google and/or Bing) for each of the five topic areas below — don't just visit a fixed list of homepages. Example queries to run and adapt with today's date:
- "ERCOT large load interconnection queue update [date]"
- "ERCOT large flexible load readiness test [date]"
- "Texas data center land purchase Meta OR AWS OR Google OR Microsoft [date]"
- "TCEQ air permit application data center OR gas plant Ellis OR Collin OR Johnson OR Denton OR Wise OR Tarrant OR Parker OR Hood county"
- "DFW data center zoning filing county commissioners [date]"
- "behind-the-meter gas generation AI data center Texas [date]"
- "PUC of Texas data center interconnection docket [date]"

In addition to search results, check these sources directly for today's dated items:
- Texas Tribune: https://www.texastribune.org/series/data-centers-in-texas/ and https://www.texastribune.org/topics/energy/
- ERCOT news: https://www.ercot.com/news
- Trade press: Data Center Dynamics (datacenterdynamics.com), Data Center Frontier (datacenterfrontier.com), Data Center Knowledge (datacenterknowledge.com)
- Texas/DFW local outlets: Dallas Morning News business/energy section, Fort Worth Star-Telegram, Houston Chronicle energy desk, Community Impact (county-level DFW coverage)
- Regulatory portals: PUC of Texas docket/interchange search, TCEQ commissioners' agenda and public notice pages

Gather today's actual, dated developments across these five areas:
1. ERCOT & Grid Signals — large-load interconnection queue updates, readiness-test approvals/failures, transmission constraint notices.
2. Data Center Construction & Corporate Activity — new builds, land acquisitions, interconnection or air-permit filings from hyperscale/private-equity operators (Meta, AWS, Google, Microsoft, etc.), on-site generation announcements.
3. Environmental & Air-Permit Activity (TCEQ) — new gas-fired generation permit filings, draft permits, public-comment notices, cumulative emissions concerns, especially near DFW-area counties (Collin, Ellis, Johnson, Denton, Wise, Tarrant, Parker, Hood).
4. Land-Use & Zoning Developments — county zoning filings, industrial/warehouse proposals that may mask data-center intent, rural land purchases near substations/transmission corridors, brownfield redevelopment pivots.
5. Power-First Strategies & On-Site Generation — dedicated gas plants for AI campuses, behind-the-meter generation, gas+battery hybrids for grid ride-through compliance.

Aim to cite at least 8-10 distinct sources across the five sections combined. If there is genuinely no new dated news for a section today, say so plainly rather than inventing content — do not fabricate facts, figures, or events.

FALLBACK (only if Claude in Chrome is genuinely unavailable this run): fetch the sources listed above directly via URL (skip search-engine URLs, which return empty on plain fetch) and gather whatever dated content is available. Note in the draft's intro line that this run used the limited fallback mode, so coverage was narrower than usual.

STEP 3 — Write the markdown draft. Match the "Power Grab TX" morning briefing format used in prior briefings: a "⭐ Morning Briefing — Texas & DFW AI Data Centers, Grid, Land Use" header, one numbered section per topic above, plus a closing "Today's Watch List" section covering ERCOT / PUC / TCEQ / County Zoning / Corporate Filings as a simple checklist. Write this as plain Markdown.

For each of the five topic sections:
- If there is genuine dated news, give it an emoji + short tagline, a bulleted list of every distinct real development you found for that topic today, and a one-line "Today's Signal" callout. There's no fixed bullet count — this is a web page, not a print column, so a slow day might warrant one or two bullets and a big news day might warrant eight or ten. Let the actual research determine the length in both directions: never pad with restated, speculative, or filler bullets just to hit a target count, and never cut a genuine distinct development just to stay under some usual length.
- If a topic has NO real dated development today, do not pad it out. Write exactly one plain sentence saying so, with no bullets, no "Today's Signal" callout, and no restated context or commentary about the absence of news. Keep it short and move on.
- If three or more of the five topics have no real news today, don't give each of them its own stub section at all. Instead, cover the topics that DO have news normally, and combine the quiet ones into a single short closing line for the whole briefing (e.g., "Quiet today on land-use, TCEQ, and power-first fronts — no new dated filings or announcements in any of the three.") rather than three separate empty-looking sections.

This matters for search visibility: these pages are indexed individually, and generic filler sentences about "no news" tend to repeat almost word-for-word from one day to the next once several editions exist. Treat every sentence you write — including "nothing happened" sentences — as something you are composing fresh today, not something to reuse or lightly reword from a prior edition.

Also write a one-to-two sentence plain-text summary of today's single most notable development, written as you'd write a search-result snippet (concrete, specific, no emoji, under 160 characters if possible). This will be used as the page's meta description in Step 5 — it must be unique to today's content, not a generic description of the briefing series.

STEP 4 — Save the markdown draft. Request access to the "/Users/marcevans/my-site" folder if you don't already have it. Save the finished markdown as /Users/marcevans/my-site/scheduled-drafts/briefing-draft-<YYYY-MM-DD>.md (create the scheduled-drafts folder if it doesn't exist).

STEP 5 — Publish the live briefing page. Find the most recently dated file in /Users/marcevans/my-site/src/pages/briefings/ (glob morning-briefing-*.astro and sort by date) and Read it — use it ONLY as a template for HTML structure, CSS classes, and layout (the h1 header, briefing-subtitle, section-divider hr, per-section h2/emoji/tagline/bullets/signal pattern, the closing "Today's Watch List" h2 with its five h3 subsections, the "Related Pages" block, and the `<style>` block — copy the CSS block verbatim unless the template itself has changed). Do NOT reuse or closely echo that prior file's actual sentences, phrasing patterns, or "no news" wording in today's content — every sentence of today's content should be freshly composed from today's research (Step 2 and Step 3), even when describing a similarly quiet topic.

Create a new file /Users/marcevans/my-site/src/pages/briefings/morning-briefing-<YYYY-MM-DD>.astro that:
- Follows the same Layout import and overall HTML structure as above.
- Uses `<Layout title="Morning Briefing - MM/DD/YY: Power Grab TX" description="...">`, where `description` is the unique one-to-two sentence summary you wrote at the end of Step 3. (If the Layout component in the template file doesn't yet accept a `description` prop, add it there the same way the existing `title` prop is handled, and have it render a `<meta name="description" content={description} />` tag in the `<head>` — a small, backwards-compatible addition, not a redesign.)
- Populates the content from today's research (Step 2) instead of copying old content, following the conditional section rules from Step 3 (full section only where there's real news; a single plain sentence or a combined closing line for quiet topics).
- Do not modify or delete any existing briefing file — only add the new dated one.

STEP 6 — Update the tracker. Read /Users/marcevans/my-site/src/pages/trackers.astro. Prepend ONE new object to the TOP of the `entries` array (do not alter or remove any existing entries) following the existing object shape exactly:
- date: today's date in "Month D, YYYY" format
- headline: "Morning Briefing: Texas & DFW AI Data Centers, Grid, Land Use"
- source: "Power Grab TX (internal briefing)"
- url: "/briefings/morning-briefing-<YYYY-MM-DD>"
- take: one sentence of original editorial analysis on today's most notable development(s), written in the same voice as prior entries (direct, a little wry, specific about dates/numbers) — but composed fresh, not adapted from a prior entry's sentence structure.
Only touch the `entries` array — do not change anything else in the file (styles, layout, header text, etc.).

CRITICAL CONSTRAINTS:
- Do NOT run any git commands (no add/commit/push) under any circumstances. The user reviews and pushes changes themselves.
- Do NOT modify any file other than: the new scheduled-drafts markdown file, the new briefings/*.astro file, the `entries` array in trackers.astro, and — only if it doesn't already support a `description` prop — the shared Layout component (adding the prop and its meta tag only, nothing else).
- Do NOT delete or alter any existing dated content (past briefing pages, past tracker entries).
- When done, confirm which files were created/edited; do not attempt to publish, commit, notify externally, or take any other action.
