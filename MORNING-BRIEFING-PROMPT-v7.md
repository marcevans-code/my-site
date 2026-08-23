# Morning Briefing prompt — v7

**Patched Aug 23, 2026** (by Claude, during the Semrush SEO cleanup) — two small fixes from the original v7 text:

- **Step 6:** the `url` field now includes a trailing slash (`/briefings/morning-briefing-<YYYY-MM-DD>/`). Without it, every tracker entry this task creates points at a URL that 301-redirects, which was the root cause of the "25 redirects" flagged in the Aug 23, 2026 Semrush audit.
- **Step 5:** the note about the Layout `description` prop is updated — it's no longer an optional/backwards-compatible addition. `Layout.astro` now has no default description and throws a build error if any page omits one, so this task's `description` output is required, not optional.

Everything else below is the original v7 prompt, unchanged.

---

Daily DFW Texas data center briefing (VM edition, v7 — no fixed category headers, wider research net, rolling 6-briefing window, expanded source list)

## Instructions

Produce today's "Power Grab TX" morning briefing and publish it to the live site. This is a recurring daily task with no memory of any prior conversation — work only from this prompt, from today's date, and from what you find on the web today.

**STEP 1 — Get today's date.** Use the current date already available in this run's own context (the environment's current-date value provided when this task starts). Do not guess, and do not carry over a date from any prior run. Convert it to `YYYY-MM-DD` for filenames and headers, to `Month D, YYYY` for the tracker entry, and to `MM/DD/YY` for the page title, as used throughout the steps below.

**STEP 2 — Research.** This step requires Claude in Chrome for real search-engine access and JS-rendered pages — do not rely on the thin direct-fetch fallback except as a last resort, since it covers only a handful of sites and search engines return empty on plain fetch.

Run actual search queries (via Claude in Chrome, against Google and/or Bing) for each of the areas below — don't just visit a fixed list of homepages. Example queries to run and adapt with today's date:

Broad catch-all sweeps (run these against Google News specifically — e.g. news.google.com, or google.com/search with the News tab/`tbm=nws` — not plain web search. Plain web search mixes in old SEO/evergreen pages; News results are dated and recency-sorted, which is what actually makes a broad sweep useful and is how a Google Alert surfaces same-day trade/financial coverage a narrower search misses):

* "AI data center Texas [date]"
* "data center Texas news [date]"

When scanning results from the broad sweeps, apply a relevance filter before including anything: it must be genuinely about data centers, the power grid, land use, or environmental permitting — not just any story that happens to mention "Texas" and "AI." Stories about AI policy, AI safety, AI in education, or other topics unrelated to data-center infrastructure are off-topic for this briefing even if a broad search surfaces them — leave them out.

Topic-specific queries:

* "ERCOT large load interconnection queue update [date]"
* "ERCOT large flexible load readiness test [date]"
* "Texas data center land purchase Meta OR AWS OR Google OR Microsoft OR Oracle OR OpenAI OR xAI OR Vantage OR DataBank OR CyrusOne OR QTS OR Compass OR EdgeConneX OR Stream OR Aligned OR Iren OR CoreWeave OR Crusoe OR Lambda OR "Applied Digital" OR "Cipher Mining" OR TeraWulf OR "Core Scientific" [date]" (this list mixes hyperscalers, colo/REIT operators, and the growing set of crypto-miner-turned-neocloud builders active in Texas — don't assume the buyer/tenant named in a headline, like Microsoft, is the actual builder; check who's constructing the facility too)
* "Texas data center noise complaint OR lawsuit OR nuisance [date]" (a distinct angle from zoning — residents suing or complaining over noise, separate from land-use/permitting fights)
* "Texas data center insurance OR stock OR investor risk [date]" (financial-market angle — stock moves, insurance exposure, or investor concerns tied to a specific named Texas project)
* "TCEQ air permit application data center OR gas plant Ellis OR Collin OR Johnson OR Denton OR Wise OR Tarrant OR Parker OR Hood county"
* "data center Ellis OR Collin OR Johnson OR Denton OR Wise OR Tarrant OR Parker OR Hood county Texas [date]" (broader than the TCEQ query above — catches zoning, water, traffic, and other local stories, not just environmental filings)
* "DFW data center zoning filing county commissioners [date]"
* "behind-the-meter gas generation AI data center Texas [date]"
* "PUC of Texas data center interconnection docket [date]"

In addition to search results, check these sources directly for today's dated items:

* Texas Tribune: https://www.texastribune.org/series/data-centers-in-texas/ and https://www.texastribune.org/topics/energy/
* ERCOT news: https://www.ercot.com/news
* Trade press: Data Center Dynamics (datacenterdynamics.com), Data Center Frontier (datacenterfrontier.com), Data Center Knowledge (datacenterknowledge.com), Cleanview (cleanview.co), Data Center Map (datacentermap.com), Utility Dive (utilitydive.com), Natural Gas Intelligence (naturalgasintel.com)
* National wire services & tech/business outlets (check for Texas-specific angles — skip anything not tied to a named Texas project or state-level policy): AP News, Reuters, CNBC, Yahoo News, Quartz, TechCrunch, Futurism, Ars Technica
* Texas statewide outlets: Texas Tribune (above), Texas Standard (KUT/statewide public radio), Texas Scorecard
* Texas regional outlets outside DFW (relevant when a story's project or policy fight has statewide bearing, e.g. ERCOT, PUC, or a major hyperscale build): Houston Chronicle energy desk, KVUE (Austin), Abilene Reporter, El Paso Times
* Texas/DFW regional outlets: Dallas Morning News business/energy section, Fort Worth Star-Telegram, WFAA, NBC 5 DFW, CBS News Texas, Fox 4 News, KERA News, Dallas Business Journal, Fort Worth Business Press, Axios Dallas, Dallas Observer, Fort Worth Report
* DFW hyperlocal/county outlets: Community Impact (per-city editions covering the DFW area), Denton Record-Chronicle, Waxahachie Daily Light (Ellis County), Cleburne Times-Review (Johnson County), Weatherford Democrat (Parker County), Hood County News, Wise County Messenger
* Regulatory portals: PUC of Texas docket/interchange search, TCEQ commissioners' agenda and public notice pages

This is not an exhaustive list — if research turns up a new outlet, trade publication, or county paper covering this beat, treat it as fair game for future runs too rather than sticking rigidly to the sources named here.

Gather today's actual, dated developments across these five areas. These five areas exist to keep the research systematic and comprehensive — they are NOT a publishing structure; Step 3 does not organize the final page under them as visible section headers, so don't worry about forcing a finding into exactly one bucket. If a single story genuinely spans more than one area (e.g., a lawsuit over a project's power source touches both land-use and grid interconnection), that's fine — just make sure it gets researched and written up once, not split apart or duplicated.

1. ERCOT & Grid Signals — large-load interconnection queue updates, readiness-test approvals/failures, transmission constraint notices.
2. Data Center Construction & Corporate Activity — new builds, land acquisitions, interconnection or air-permit filings from hyperscale/private-equity operators (Meta, AWS, Google, Microsoft, etc.) and from the crypto-miner-turned-neocloud/colo builders actually constructing many Texas sites (Iren, CoreWeave, Crusoe, Applied Digital, Cipher Mining, TeraWulf, Core Scientific, etc. — check who's building, not just which hyperscaler is named as the tenant); on-site generation announcements; financial-market angles tied to a specific named project (stock moves, insurance exposure, investor concerns).
3. Environmental & Air-Permit Activity (TCEQ) — new gas-fired generation permit filings, draft permits, public-comment notices, cumulative emissions concerns, especially near DFW-area counties (Collin, Ellis, Johnson, Denton, Wise, Tarrant, Parker, Hood).
4. Land-Use & Zoning Developments — county zoning filings, industrial/warehouse proposals that may mask data-center intent, rural land purchases near substations/transmission corridors, brownfield redevelopment pivots, and resident noise-complaint or nuisance litigation against operating or proposed sites.
5. Power-First Strategies & On-Site Generation — dedicated gas plants for AI campuses, behind-the-meter generation, gas+battery hybrids for grid ride-through compliance.

Aim to cite at least 10-15 distinct sources across today's coverage combined, now that the research step casts a wider net — treat this as a floor, not a ceiling; a big-news day should cite more. If there is genuinely no new dated news in one of the five research areas today, that's fine — it just won't produce a story. Never fabricate facts, figures, or events to fill a gap.

**FALLBACK** (only if Claude in Chrome is genuinely unavailable this run): fetch the sources listed above directly via URL (skip search-engine URLs, which return empty on plain fetch) and gather whatever dated content is available. Note in the draft's intro line that this run used the limited fallback mode, so coverage was narrower than usual.

**STEP 3 — Write the markdown draft.** Match the "Power Grab TX" morning briefing house style — a "⭐ Morning Briefing — Texas & DFW AI Data Centers, Grid, Land Use" header — but with a bigger structural change from earlier editions: there are no more fixed topic-category headers at all (no more standing "ERCOT & Grid Signals" / "Data Center Construction & Corporate Activity" / etc. section names). The five research areas from Step 2 are scaffolding for gathering the news, not a publishing structure. Instead, present today's edition as a single running list of today's actual stories:

* Right after the subtitle, add one Top Story line — a single punchy sentence, displayed on the page itself (not just the hidden meta description below), naming today's single most significant development.
* Under one heading, "📰 Today's News," present every distinct genuine development found today as its own story block, numbered sequentially (1, 2, 3, ...) in descending order of newsworthiness — judge newsworthiness by concrete outcomes over process: a lawsuit filed, a vote taken, a permit granted or denied, a project blocked or approved outranks a hearing merely scheduled, a meeting merely held, or a study merely published. There is no fixed number of stories — some days might have two, some might have seven; let the actual news set the count, the same way bullet counts within a story are already uncapped.
* Each story block gets its own short headline/tagline and an emoji that fits that specific story (not a fixed emoji tied to a topic identity), a bulleted list of every distinct real development belonging to that story, and a "Today's Signal" callout — same bullet-count flexibility and no-padding rules as before.
* A single story can naturally touch more than one of the five research areas — write it as one coherent story rather than artificially splitting it along old category lines.
* Close the news portion with, at most, one short plain-prose sentence naming anything from the five research areas that turned up genuinely nothing today (e.g., "Quiet today on TCEQ permitting in the eight tracked counties, and no new behind-the-meter generation announcements.") — one sentence, no header, no bullets. Skip this sentence entirely on a day where every research area produced at least something.
* Apply the same "no fixed categories" approach to the closing "Today's Watch List": drop the five institutional subheadings (ERCOT / PUC / TCEQ / County Zoning / Corporate Filings) and instead present it as a single flat bulleted list, ordered by how soon and how directly each item follows from today's stories — the thing most tied to today's Top Story leads.

This matters for search visibility: these pages are indexed individually, and generic filler sentences about "no news" tend to repeat almost word-for-word from one day to the next once several editions exist. Treat every sentence you write — including the quiet-areas sentence and the Top Story line — as something you are composing fresh today, not something to reuse or lightly reword from a prior edition.

Also write a one-to-two sentence plain-text summary of today's single most notable development, written as you'd write a search-result snippet (concrete, specific, no emoji, under 160 characters if possible). This will be used as the page's meta description in Step 5 — it must be unique to today's content, not a generic description of the briefing series. (This can closely mirror the on-page Top Story line, but is written to the stricter length/format rules of a meta description.)

**STEP 4 — Save the markdown draft.** Request access to the `/Users/development/Development/my-site` folder on this VM if you don't already have it. Save the finished markdown as `/Users/development/Development/my-site/scheduled-drafts/briefing-draft-<YYYY-MM-DD>.md` (create the `scheduled-drafts` folder if it doesn't exist).

**STEP 5 — Publish the live briefing page.** Find the most recently dated file in `/Users/development/Development/my-site/src/pages/briefings/` (glob `morning-briefing-*.astro` and sort by date) and read it — use it ONLY as a template for base HTML structure and CSS (the h1 header, briefing-subtitle, top-story lead if present, section-divider hr, the per-story h2/emoji/tagline/bullets/signal pattern, the "Related Pages" block, and the `<style>` block — copy the CSS block verbatim unless the template itself has changed, adding new classes only if today's structure genuinely needs one). Do NOT reuse or closely echo that prior file's actual sentences or phrasing in today's content — every sentence should be freshly composed from today's research (Step 2 and Step 3). Also do NOT copy the prior file's fixed topic-category headers or section order if it still has them — per Step 3, there are no more standing topic headers at all. Structure today's page as: Top Story line → one "📰 Today's News" heading → sequentially-numbered story blocks in newsworthiness order → optional one-sentence quiet-areas note → "📍 Today's Watch List" as a single flat bulleted list (no institutional subheadings) → Related Pages.

Create a new file `/Users/development/Development/my-site/src/pages/briefings/morning-briefing-<YYYY-MM-DD>.astro` that:

* Follows the same Layout import and overall HTML structure as above.
* Uses `<Layout title="Morning Briefing - MM/DD/YY: Power Grab TX" description="...">`, where `description` is the unique one-to-two sentence summary you wrote at the end of Step 3. **This is required, not optional** — `Layout.astro` has no default description and throws a build error if a page omits it, so every briefing must pass one, or the Cloudflare Pages build will fail.
* Includes the Top Story line from Step 3 right after the subtitle, before the "Today's News" heading.
* Populates the content from today's research (Step 2) instead of copying old content, following the story-based structure from Step 3 (one numbered block per genuine story, in newsworthiness order; the optional quiet-areas sentence; the flat Watch List).
* Do not modify or delete any existing briefing file — only add the new dated one. (The site only ever links to the 6 most recent briefings in its nav dropdown, regardless of how many `.astro` files exist in the folder — see Step 7 below for keeping the folder itself trimmed to match.)

**STEP 6 — Update the tracker.** Read `/Users/development/Development/my-site/src/pages/trackers.astro`. Prepend ONE new object to the TOP of the `entries` array (do not alter or remove any existing entries) following the existing object shape exactly:

* `date`: today's date in "Month D, YYYY" format
* `headline`: "Morning Briefing: Texas & DFW AI Data Centers, Grid, Land Use"
* `source`: "Power Grab TX (internal briefing)"
* `url`: **"/briefings/morning-briefing-\<YYYY-MM-DD\>/"** — note the trailing slash. Every page on the site lives at a trailing-slash URL; leaving it off makes this entry 301-redirect on every crawl, which is exactly the "25 redirects" issue the Aug 23, 2026 Semrush audit flagged.
* `take`: one sentence of original editorial analysis on today's most notable development(s) — i.e., today's Top Story — written in the same voice as prior entries (direct, a little wry, specific about dates/numbers) — but composed fresh, not adapted from a prior entry's sentence structure.

Only touch the `entries` array — do not change anything else in the file (styles, layout, header text, etc.).

**STEP 7 — Check whether old briefing pages need pruning.** The site's nav dropdown (in the shared Layout component) only ever shows the 6 most recently dated briefings, no matter how many `.astro` files sit in the folder — so once more than 6 exist, the extra ones are just dead weight: orphaned from navigation, and near-duplicate templated pages that likely hurt rather than help search indexing.

* List `/Users/development/Development/my-site/src/pages/briefings/` (glob `morning-briefing-*.astro`) now that today's new file has been added, and sort all of them by the date in the filename, newest first.
* If there are 6 or fewer files total, there's nothing to do — say so and stop this step.
* If there are more than 6, identify every file beyond the 6 most recent (i.e., the 7th-newest and older).
* You do not have a way to delete files on the VM from this session, so do NOT attempt to delete, overwrite, or blank out any of them yourself. Instead, in your final summary, output the exact shell command(s) for the user to run themselves in a Terminal on the VM to remove exactly those files and nothing else — for example:

```
rm "/Users/development/Development/my-site/src/pages/briefings/morning-briefing-<oldest-date>.astro"
rm "/Users/development/Development/my-site/src/pages/briefings/morning-briefing-<next-oldest-date>.astro"
```

List one `rm` line per file, oldest first, using the exact filenames found in the listing — never a wildcard or range that could catch a file you didn't individually identify.

* This pruning applies ONLY to files in `src/pages/briefings/`. Never suggest deleting, and never delete, anything under `scheduled-drafts/` (the markdown drafts are a private archive of every day's research, kept in full regardless of how many exist) or any entry in `trackers.astro`'s `entries` array (the tracker is a permanent historical record and is never trimmed).

## CRITICAL CONSTRAINTS

* Do NOT run any git commands (no add/commit/push) under any circumstances. The user reviews and pushes changes themselves from the VM.
* Do NOT modify any file other than: the new `scheduled-drafts` markdown file, the new `briefings/*.astro` file, the `entries` array in `trackers.astro`, and — only if it doesn't already support a `description` prop — the shared Layout component (adding the prop and its meta tag only, nothing else).
* Do NOT yourself delete, overwrite, or alter any existing dated content — past briefing pages, past `scheduled-drafts` files, or past tracker entries. The one exception is Step 7: when more than 6 `briefings/*.astro` files exist, you surface the exact `rm` command(s) for the user to run themselves — you never run a delete yourself, and this exception never extends to `scheduled-drafts/*.md` files or to `trackers.astro` entries, which are never pruned.
* When done, confirm which files were created/edited, and include the Step 7 pruning check result (either "no pruning needed" or the exact `rm` command(s) to run). Do not attempt to publish, commit, notify externally, delete files yourself, or take any other action.
