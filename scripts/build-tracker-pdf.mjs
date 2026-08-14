#!/usr/bin/env node
/**
 * Regenerates public/texas-data-center-tracker.pdf from the site's own
 * already-maintained data — no separate "lead magnet" content to keep in
 * sync by hand. Runs automatically before every `npm run build` (see the
 * "prebuild" script in package.json), so every Cloudflare Pages deploy
 * ships a fresh PDF.
 *
 * Sources (both already maintained by hand elsewhere on the site):
 *  - Stat tiles:   the 4 <div class="rn-stat"> entries in right-now.astro
 *  - Flashpoints:  the 5 "Today's Signal" pull-quotes in the newest file
 *                  under src/pages/briefings/
 *
 * If you redesign either of those source blocks, update the regexes below
 * to match — this script does not fail the build if it can't find them,
 * it just produces a leaner PDF (see the console warnings).
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import PDFDocument from "pdfkit";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const OUT_PATH = path.join(ROOT, "public", "texas-data-center-tracker.pdf");

const NAVY = "#1a3a6a";
const DARKNAVY = "#1a1a2e";
const ORANGE = "#e05c2a";
const RUST = "#b03a1a";
const CREAM = "#fff8f4";
const BORDER = "#e8c9b0";
const INK = "#3a2010";
const GREY = "#555555";

function decodeEntities(str) {
  return str
    .replace(/&amp;/g, "&")
    .replace(/&mdash;/g, "—")
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&nbsp;/g, " ");
}

// pdfkit's base14 fonts (Helvetica) can't render emoji — the section
// headings in the briefings lead with one (🔌, 🏗️, etc.). Strip anything
// outside printable ASCII rather than have it render as garbled glyphs.
function stripToAscii(str) {
  return str.replace(/[^\x20-\x7E]/g, "").replace(/\s{2,}/g, " ").trim();
}

// ── Pull the 4 headline stats from right-now.astro ─────────────────────
function loadStats() {
  const filePath = path.join(ROOT, "src", "pages", "right-now.astro");
  const source = fs.readFileSync(filePath, "utf-8");
  const matches = [
    ...source.matchAll(/<div class="rn-stat"><span>([^<]+)<\/span>([^<]+)<\/div>/g),
  ];
  if (matches.length === 0) {
    console.warn("[build-tracker-pdf] No .rn-stat entries found in right-now.astro — skipping stat tiles.");
    return [];
  }
  return matches.slice(0, 4).map((m) => ({
    num: decodeEntities(m[1].trim()),
    label: decodeEntities(m[2].trim()),
  }));
}

// ── Pull today's 5 "Today's Signal" pull-quotes from the newest briefing ─
function loadFlashpoints() {
  const briefingsDir = path.join(ROOT, "src", "pages", "briefings");
  const files = fs
    .readdirSync(briefingsDir)
    .filter((f) => /^morning-briefing-\d{4}-\d{2}-\d{2}\.astro$/.test(f))
    .sort(); // YYYY-MM-DD filenames sort chronologically
  const latestFile = files.at(-1);
  if (!latestFile) {
    console.warn("[build-tracker-pdf] No briefing files found — skipping flashpoints.");
    return { dateLabel: null, href: null, entries: [] };
  }

  const dateStr = latestFile.match(/(\d{4}-\d{2}-\d{2})/)[1];
  const [y, m, d] = dateStr.split("-").map(Number);
  const dateLabel = new Date(y, m - 1, d).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const source = fs.readFileSync(path.join(briefingsDir, latestFile), "utf-8");
  const pairs = [
    ...source.matchAll(
      /<h2>([^<]+)<\/h2>[\s\S]*?<strong>Today's Signal:<\/strong>\s*([^<]+)<\/p>/g
    ),
  ];
  if (pairs.length === 0) {
    console.warn(`[build-tracker-pdf] No "Today's Signal" callouts found in ${latestFile}.`);
  }

  return {
    dateLabel,
    href: `/briefings/morning-briefing-${dateStr}`,
    entries: pairs.slice(0, 5).map((p) => ({
      heading: stripToAscii(decodeEntities(p[1].trim())),
      signal: decodeEntities(p[2].trim()),
    })),
  };
}

// ── Build the PDF ─────────────────────────────────────────────────────
function buildPdf({ stats, flashpoints }) {
  const doc = new PDFDocument({ size: "LETTER", margins: { top: 40, bottom: 36, left: 40, right: 40 } });
  const pageWidth = doc.page.width - 80;
  fs.mkdirSync(path.dirname(OUT_PATH), { recursive: true });
  doc.pipe(fs.createWriteStream(OUT_PATH));

  // Title
  doc.font("Helvetica-Bold").fontSize(24).fillColor(NAVY)
    .text("TEXAS AI DATA CENTER BOOM", { align: "center" });
  doc.font("Helvetica").fontSize(11).fillColor(GREY)
    .text("Live Tracker Sheet — Grid, Water & Land-Use Snapshot", { align: "center" });
  doc.moveDown(0.4);
  doc.save().moveTo(40, doc.y).lineTo(40 + pageWidth, doc.y)
    .lineWidth(1.5).strokeColor(ORANGE).stroke().restore();
  doc.moveDown(0.8);

  // Stat tiles
  if (stats.length > 0) {
    const tileW = pageWidth / stats.length;
    const tileTop = doc.y;
    const tileH = 74;
    stats.forEach((s, i) => {
      const x = 40 + i * tileW;
      doc.save()
        .rect(x, tileTop, tileW, tileH)
        .fillAndStroke(CREAM, BORDER);
      doc.restore();
      doc.font("Helvetica-Bold").fontSize(18).fillColor(RUST)
        .text(s.num, x + 4, tileTop + 12, { width: tileW - 8, align: "center" });
      doc.font("Helvetica").fontSize(8).fillColor(INK)
        .text(s.label, x + 6, tileTop + 36, { width: tileW - 12, align: "center" });
    });
    doc.y = tileTop + tileH + 8;
    doc.x = 40;
    doc.font("Helvetica").fontSize(7.5).fillColor(GREY)
      .text("Stats pulled live from powergrabtx.com/right-now at build time.", { width: pageWidth });
    doc.moveDown(0.8);
  }

  // Flashpoints
  doc.font("Helvetica-Bold").fontSize(14).fillColor(RUST)
    .text(flashpoints.dateLabel ? `TODAY'S FLASHPOINTS — ${flashpoints.dateLabel.toUpperCase()}` : "TODAY'S FLASHPOINTS");
  doc.save().moveTo(40, doc.y).lineTo(40 + pageWidth, doc.y)
    .lineWidth(0.75).strokeColor(BORDER).stroke().restore();
  doc.moveDown(0.5);

  flashpoints.entries.forEach((f) => {
    doc.font("Helvetica-Bold").fontSize(10.5).fillColor(NAVY)
      .text(f.heading, { width: pageWidth });
    doc.font("Helvetica").fontSize(9.3).fillColor(INK)
      .text(f.signal, { width: pageWidth });
    doc.moveDown(0.5);
  });

  doc.font("Helvetica").fontSize(7.5).fillColor(GREY)
    .text(
      flashpoints.href
        ? `Read the full breakdown, with sources, at powergrabtx.com${flashpoints.href}.`
        : "Read the full breakdown, with sources, at powergrabtx.com/trackers.",
      { width: pageWidth }
    );
  doc.moveDown(0.8);

  // CTA box
  const ctaTop = doc.y;
  const ctaH = 66;
  doc.save().rect(40, ctaTop, pageWidth, ctaH).fill(DARKNAVY).restore();
  doc.font("Helvetica-Bold").fontSize(13).fillColor("#ffffff")
    .text("WANT THE NEXT GRID UPDATE IN YOUR INBOX?", 50, ctaTop + 14, { width: pageWidth - 20, align: "center" });
  doc.font("Helvetica").fontSize(9.5).fillColor("#ffffff")
    .text(
      "Power Grab TX publishes a Morning Briefing every weekday tracking ERCOT, TCEQ, and local zoning fights across Texas. Subscribe free at powergrabtx.com/stay-informed.",
      54, ctaTop + 34, { width: pageWidth - 28, align: "center" }
    );
  doc.y = ctaTop + ctaH + 10;
  doc.x = 40;

  doc.font("Helvetica").fontSize(7.4).fillColor(GREY).text(
    "Power Grab TX tracks the real cost of AI data centers in Texas — on the grid, the water table, and the " +
    "communities in their shadow. This sheet is regenerated automatically at every site build from powergrabtx.com's " +
    "own Right Now and Morning Briefing pages, and reflects public reporting current as of the date above. " +
    "It is not a comprehensive map of every project. © Power Grab TX.",
    { width: pageWidth }
  );

  doc.end();
}

const stats = loadStats();
const flashpoints = loadFlashpoints();
buildPdf({ stats, flashpoints });
console.log(`[build-tracker-pdf] Wrote ${path.relative(ROOT, OUT_PATH)} (${stats.length} stats, ${flashpoints.entries.length} flashpoints, dated ${flashpoints.dateLabel ?? "unknown"}).`);
