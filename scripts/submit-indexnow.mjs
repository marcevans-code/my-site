#!/usr/bin/env node
/**
 * submit-indexnow.mjs
 *
 * Reads your Astro sitemap (including nested sitemap-index files), collects
 * every page URL, and submits them to the IndexNow API in one batch. A single
 * submission to api.indexnow.org fans out to every participating search
 * engine (Bing, Yandex, and others) — you don't need to ping them separately.
 *
 * Usage:
 *   node scripts/submit-indexnow.mjs
 *
 * Environment variables (all have defaults for powergrabtx.com, override if needed):
 *   SITE_HOST        e.g. "powergrabtx.com"                     (required)
 *   INDEXNOW_KEY     the key you generated                      (required)
 *   SITEMAP_URL      e.g. "https://powergrabtx.com/sitemap-index.xml"
 */

const SITE_HOST = process.env.SITE_HOST || "powergrabtx.com";
const INDEXNOW_KEY = process.env.INDEXNOW_KEY || "fef7947ae718cfa033884a1c39aa80b1";
const SITEMAP_URL = process.env.SITEMAP_URL || `https://${SITE_HOST}/sitemap-index.xml`;
const KEY_LOCATION = `https://${SITE_HOST}/${INDEXNOW_KEY}.txt`;
const MAX_SITEMAP_DEPTH = 3; // handles a sitemap index that points at child sitemaps

async function fetchText(url) {
  const res = await fetch(url, { headers: { "User-Agent": "indexnow-submitter/1.0" } });
  if (!res.ok) {
    throw new Error(`Failed to fetch ${url}: HTTP ${res.status}`);
  }
  return res.text();
}

function extractLocs(xml) {
  const matches = [...xml.matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/gi)];
  return matches.map((m) => m[1].trim());
}

function looksLikeSitemapIndex(xml) {
  return /<sitemapindex/i.test(xml);
}

async function collectUrls(sitemapUrl, depth = 0, seen = new Set()) {
  if (depth > MAX_SITEMAP_DEPTH || seen.has(sitemapUrl)) return [];
  seen.add(sitemapUrl);

  const xml = await fetchText(sitemapUrl);
  const locs = extractLocs(xml);

  if (looksLikeSitemapIndex(xml)) {
    // Each <loc> here points at a child sitemap — recurse into each one.
    const nested = await Promise.all(
      locs.map((childUrl) => collectUrls(childUrl, depth + 1, seen))
    );
    return nested.flat();
  }

  // Otherwise these <loc> entries are real page URLs.
  return locs;
}

async function submitToIndexNow(urlList) {
  const body = {
    host: SITE_HOST,
    key: INDEXNOW_KEY,
    keyLocation: KEY_LOCATION,
    urlList,
  };

  const res = await fetch("https://api.indexnow.org/indexnow", {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify(body),
  });

  // IndexNow returns 200 or 202 on success; 200 often means "already known".
  const text = await res.text().catch(() => "");
  console.log(`IndexNow responded: HTTP ${res.status} ${res.statusText}${text ? ` — ${text}` : ""}`);

  if (!(res.status === 200 || res.status === 202)) {
    throw new Error(`IndexNow submission failed with status ${res.status}`);
  }
}

async function main() {
  console.log(`Fetching sitemap: ${SITEMAP_URL}`);
  const urls = await collectUrls(SITEMAP_URL);
  const uniqueUrls = [...new Set(urls)];

  if (uniqueUrls.length === 0) {
    console.log("No URLs found in sitemap — nothing to submit.");
    return;
  }

  console.log(`Found ${uniqueUrls.length} URL(s). Submitting to IndexNow...`);
  uniqueUrls.forEach((u) => console.log(`  - ${u}`));

  await submitToIndexNow(uniqueUrls);
  console.log("Done.");
}

main().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
