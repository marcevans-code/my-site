#!/usr/bin/env node
/**
 * Regenerates public/data-center-near-you-checklist.pdf — the printable
 * one-page handout for the "A Data Center Is Proposed Near You" guide.
 * Runs automatically before every `npm run build` (see "prebuild" in
 * package.json), alongside the tracker and glossary PDFs.
 *
 * Source: src/data/data-center-near-you.json — the same file the guide page
 * (src/pages/guides/data-center-near-you.astro) reads its checklist and
 * contacts from, so the web page and the PDF can't drift apart.
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import PDFDocument from "pdfkit";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const DATA_PATH = path.join(ROOT, "src", "data", "data-center-near-you.json");
const OUT_PATH = path.join(ROOT, "public", "data-center-near-you-checklist.pdf");

// Same palette as the tracker PDF and the site.
const NAVY = "#1a3a6a";
const DARKNAVY = "#1a1a2e";
const ORANGE = "#e05c2a";
const RUST = "#b03a1a";
const CREAM = "#fff8f4";
const BORDER = "#e8c9b0";
const INK = "#222222";
const GREY = "#555555";

// pdfkit's built-in Helvetica only covers basic Latin: swap curly quotes and
// symbols for plain equivalents so nothing renders as a garbled glyph.
function plain(str) {
  return str
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/—/g, "-")
    .replace(/–/g, "-")
    .replace(/·/g, "|")
    .replace(/[^\x20-\x7E]/g, "");
}

// The phone numbers people most need on paper (a subset of the contacts table).
const PDF_CONTACTS = [
  "Comment on or track a TCEQ permit",
  "Understand contested case hearings",
  "Check where a permit application stands",
  "Records request stalled",
];

function formatReviewed(iso) {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

function buildPdf(data) {
  const M = 36;
  const doc = new PDFDocument({ size: "LETTER", margins: { top: 34, bottom: 30, left: M, right: M } });
  const W = doc.page.width - M * 2;
  fs.mkdirSync(path.dirname(OUT_PATH), { recursive: true });
  doc.pipe(fs.createWriteStream(OUT_PATH));

  // Title
  doc.font("Helvetica-Bold").fontSize(19).fillColor(NAVY)
    .text("A DATA CENTER IS PROPOSED NEAR YOU: WHAT NOW?", { align: "center" });
  doc.font("Helvetica").fontSize(9.5).fillColor(GREY)
    .text(`Texas resident checklist | Last reviewed ${formatReviewed(data.reviewed)} | powergrabtx.com/guides/data-center-near-you`, { align: "center" });
  doc.moveDown(0.3);
  doc.save().moveTo(M, doc.y).lineTo(M + W, doc.y).lineWidth(1.5).strokeColor(ORANGE).stroke().restore();
  doc.moveDown(0.5);

  // Key-deadline strip
  const tiles = [
    ["10 days", "Mailed notice before a city zoning commission hearing (owners within 200 ft only)"],
    ["30 days", "Typical window after a TCEQ notice. Some air permits lose hearing rights after the first notice."],
    ["20%", "Of land within 200 ft signing a protest forces a 3/4 council vote"],
    ["10 days", "Public records: longer than this and the office must tell you when"],
  ];
  const tileW = W / tiles.length;
  const tileTop = doc.y;
  const tileH = 64;
  tiles.forEach(([num, label], i) => {
    const x = M + i * tileW;
    doc.save().rect(x, tileTop, tileW, tileH).fillAndStroke(CREAM, BORDER).restore();
    doc.font("Helvetica-Bold").fontSize(15).fillColor(RUST).text(num, x + 4, tileTop + 8, { width: tileW - 8, align: "center" });
    doc.font("Helvetica").fontSize(7.4).fillColor(INK).text(label, x + 6, tileTop + 28, { width: tileW - 12, align: "center" });
  });
  doc.y = tileTop + tileH + 10;
  doc.x = M;

  // Checklist in two columns
  const colGap = 18;
  const colW = (W - colGap) / 2;
  const colTop = doc.y;
  const colBottoms = [];
  const groups = data.checklist;
  const columns = [groups.slice(0, 2), groups.slice(2)];
  columns.forEach((colGroups, ci) => {
    const x = M + ci * (colW + colGap);
    let y = colTop;
    colGroups.forEach((group) => {
      doc.font("Helvetica-Bold").fontSize(11).fillColor(NAVY).text(plain(group.title).toUpperCase(), x, y, { width: colW });
      y = doc.y + 3;
      group.items.forEach((item) => {
        const text = plain(item);
        doc.save().rect(x, y + 1.5, 8, 8).lineWidth(0.8).strokeColor(NAVY).stroke().restore();
        doc.font("Helvetica").fontSize(8.8).fillColor(INK).text(text, x + 13, y, { width: colW - 13, lineGap: 0.5 });
        y = doc.y + 3.5;
      });
      y += 6;
    });
    colBottoms.push(y);
  });
  doc.y = Math.max(...colBottoms) + 2;
  doc.x = M;

  // Contacts
  doc.font("Helvetica-Bold").fontSize(11).fillColor(RUST).text("WHO TO CALL", M, doc.y, { width: W });
  doc.save().moveTo(M, doc.y).lineTo(M + W, doc.y).lineWidth(0.75).strokeColor(BORDER).stroke().restore();
  doc.moveDown(0.35);
  data.contacts
    .filter((c) => PDF_CONTACTS.includes(c.need))
    .forEach((c) => {
      const y = doc.y;
      doc.font("Helvetica-Bold").fontSize(8.8).fillColor(NAVY).text(plain(c.need), M, y, { width: W * 0.36 });
      const h1 = doc.y;
      doc.font("Helvetica").fontSize(8.8).fillColor(INK).text(`${plain(c.contact)}: ${plain(c.how)}`, M + W * 0.38, y, { width: W * 0.62 });
      doc.y = Math.max(h1, doc.y) + 3;
    });
  doc.font("Helvetica").fontSize(8.4).fillColor(INK)
    .text("Also: your city secretary or county clerk (agendas and speaker sign-up), your groundwater conservation district (new wells), and your state representative and senator (a local legislator's request triggers a TCEQ public meeting).", M, doc.y + 2, { width: W });
  doc.moveDown(0.7);

  // CTA box
  const ctaTop = doc.y;
  const ctaH = 52;
  doc.save().rect(M, ctaTop, W, ctaH).fill(DARKNAVY).restore();
  doc.font("Helvetica-Bold").fontSize(11.5).fillColor("#ffffff")
    .text("THE FULL GUIDE, WITH SOURCES AND EVERY STEP EXPLAINED", M + 10, ctaTop + 11, { width: W - 20, align: "center" });
  doc.font("Helvetica").fontSize(9).fillColor("#ffffff")
    .text("powergrabtx.com/guides/data-center-near-you  |  Weekday Morning Briefing: powergrabtx.com/stay-informed", M + 10, ctaTop + 30, { width: W - 20, align: "center" });
  doc.y = ctaTop + ctaH + 8;
  doc.x = M;

  doc.font("Helvetica").fontSize(7.2).fillColor(GREY).text(
    "General information, not legal advice. Deadlines are short and rules change: confirm dates with the agency or a Texas lawyer. " +
    "This sheet is regenerated automatically at every site build from the same data as the online guide. (c) Power Grab TX.",
    { width: W }
  );

  const pages = doc.bufferedPageRange ? doc.bufferedPageRange().count : 1;
  doc.end();
  return pages;
}

const data = JSON.parse(fs.readFileSync(DATA_PATH, "utf-8"));
buildPdf(data);
console.log(`[build-near-you-checklist-pdf] Wrote ${path.relative(ROOT, OUT_PATH)} (${data.checklist.length} checklist groups, reviewed ${data.reviewed}).`);
