// Fails the build if two or more built pages share the exact same
// <meta name="description">. Runs automatically after every `npm run
// build` (see package.json's "postbuild" script) so a duplicate — whether
// from a missing description prop, a copy-pasted one, or the daily
// Morning Briefing generator reusing text — breaks the Cloudflare Pages
// deploy loudly instead of shipping silently, the way the Aug 2026
// Semrush audit caught 17 of them after the fact.
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

const DIST_DIR = new URL("../dist/", import.meta.url).pathname;
const DESCRIPTION_RE = /<meta\s+name="description"\s+content="([^"]*)"/i;

// Verification files dropped straight into public/ (Google Search Console,
// etc.) are copied into dist as-is and have no <meta name="description"> by
// design — they're not real pages, so skip them instead of warning on them.
const NOT_A_PAGE = /^google[a-f0-9]+\.html$/i;

async function findHtmlFiles(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = await Promise.all(
    entries.map((entry) => {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) return findHtmlFiles(full);
      if (entry.name.endsWith(".html") && !NOT_A_PAGE.test(entry.name)) return [full];
      return [];
    })
  );
  return files.flat();
}

const htmlFiles = await findHtmlFiles(DIST_DIR);

// route -> description
const byDescription = new Map();

for (const file of htmlFiles) {
  const html = await readFile(file, "utf-8");
  const match = html.match(DESCRIPTION_RE);
  if (!match) {
    console.warn(`⚠️  No <meta name="description"> found in ${path.relative(DIST_DIR, file)}`);
    continue;
  }
  const description = match[1];
  const route = "/" + path.relative(DIST_DIR, file);
  if (!byDescription.has(description)) byDescription.set(description, []);
  byDescription.get(description).push(route);
}

const duplicates = [...byDescription.entries()].filter(([, routes]) => routes.length > 1);

if (duplicates.length > 0) {
  console.error("\n❌ Duplicate meta descriptions found — build failed:\n");
  for (const [description, routes] of duplicates) {
    console.error(`  "${description}"`);
    for (const route of routes) console.error(`    - ${route}`);
    console.error("");
  }
  console.error(
    `Give each page listed above its own unique <Layout description="..."> and rebuild.\n`
  );
  process.exit(1);
}

console.log(`✓ No duplicate meta descriptions across ${htmlFiles.length} pages.`);
