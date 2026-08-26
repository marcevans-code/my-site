#!/usr/bin/env node
/**
 * Regenerates public/ai-data-center-glossary.pdf directly from
 * src/pages/glossary.astro — no separate content to keep in sync by hand.
 * Runs automatically before every `npm run build` (see the "prebuild"
 * script in package.json), so every Cloudflare Pages deploy ships a PDF
 * that matches whatever categories/terms are currently on the live page.
 *
 * Parses the glossary page's own markup:
 *   <section class="category" id="..." style="--cat-color:#HEX">
 *     <h2>Category Title</h2>
 *     <p class="cat-desc">...</p>
 *     <div class="term">
 *       <h3>Term</h3>
 *       <p>Definition</p>
 *       <p class="analogy">Optional extra note</p>
 *     </div>
 *     ...
 *   </section>
 *
 * If the glossary page's markup structure changes, update the regexes
 * below to match — this script does not fail the build if it can't find
 * sections, it just produces a thinner PDF (see the console warning).
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import PDFDocument from "pdfkit";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const SRC_PATH = path.join(ROOT, "src", "pages", "glossary.astro");
const OUT_PATH = path.join(ROOT, "public", "ai-data-center-glossary.pdf");
// Full lockup (skull mark + "POWERGRABTX.COM" wordmark baked in) — a
// downscaled copy of the thank-you page's logo (that source PNG is a
// 1000x1000px, ~550KB file; embedded at PDF letterhead size it only needs
// to be a couple hundred px, so a smaller copy keeps this PDF a light
// download). pdfkit only reads PNG/JPEG, not the site's .webp logo.
const LOGO_PATH = path.join(ROOT, "public", "powergrabtx-pdf-logo.png");

const NAVY = "#1a3a6a";
const GREY = "#6b6560";
const INK = "#3a2010";
const BODY = "#423e3a";
const RULE = "#e05c2a";

function decodeEntities(str) {
  return str
    .replace(/&amp;/g, "&")
    .replace(/&mdash;/g, "—")
    .replace(/&ndash;/g, "–")
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&nbsp;/g, " ");
}

function cleanText(str) {
  return decodeEntities(str.replace(/<[^>]+>/g, "")).replace(/\s+/g, " ").trim();
}

// ── Parse the header intro paragraph (first <p> in .glossary-header) ───
function loadIntro(source) {
  const headerMatch = source.match(
    /<div class="glossary-header">([\s\S]*?)<\/div>\s*<div class="search-wrap">/,
  );
  if (!headerMatch) return null;
  const firstP = headerMatch[1].match(/<p>([\s\S]*?)<\/p>/);
  return firstP ? cleanText(firstP[1]) : null;
}

// ── Parse every category section into { title, color, desc, terms } ───
function loadCategories(source) {
  const sectionRe =
    /<section class="category" id="[^"]*" style="--cat-color:(#[0-9a-fA-F]{3,8})">([\s\S]*?)<\/section>/g;
  const categories = [];
  let sectionMatch;
  while ((sectionMatch = sectionRe.exec(source))) {
    const color = sectionMatch[1];
    const body = sectionMatch[2];

    const titleMatch = body.match(/<h2>([\s\S]*?)<\/h2>/);
    const descMatch = body.match(/<p class="cat-desc">([\s\S]*?)<\/p>/);

    const terms = [];
    const termRe = /<div class="term">([\s\S]*?)<\/div>/g;
    let termMatch;
    while ((termMatch = termRe.exec(body))) {
      const termBody = termMatch[1];
      const h3Match = termBody.match(/<h3>([\s\S]*?)<\/h3>/);
      const paraRe = /<p(?: class="([^"]*)")?>([\s\S]*?)<\/p>/g;
      let paraMatch;
      let definition = "";
      let analogy = null;
      while ((paraMatch = paraRe.exec(termBody))) {
        const [, cls, text] = paraMatch;
        if (cls === "analogy") analogy = cleanText(text);
        else definition = cleanText(text);
      }
      if (h3Match) {
        terms.push({ heading: cleanText(h3Match[1]), definition, analogy });
      }
    }

    if (titleMatch) {
      categories.push({
        title: cleanText(titleMatch[1]),
        color,
        desc: descMatch ? cleanText(descMatch[1]) : "",
        terms,
      });
    }
  }
  return categories;
}

// ── Build the PDF ─────────────────────────────────────────────────────
function buildPdf({ intro, categories }) {
  const doc = new PDFDocument({
    size: "LETTER",
    margins: { top: 50, bottom: 50, left: 50, right: 50 },
    bufferPages: true,
  });
  const pageWidth = doc.page.width - 100;
  fs.mkdirSync(path.dirname(OUT_PATH), { recursive: true });
  doc.pipe(fs.createWriteStream(OUT_PATH));

  // Logo (skull mark + wordmark in one image), centered above the title.
  try {
    const logoWidth = 92;
    const logoX = 50 + (pageWidth - logoWidth) / 2;
    doc.image(LOGO_PATH, logoX, doc.y, { width: logoWidth });
    doc.y += logoWidth + 12;
  } catch (err) {
    console.warn(`[build-glossary-pdf] Couldn't embed logo (${LOGO_PATH}): ${err.message}`);
  }

  // Title block
  doc.font("Helvetica-Bold").fontSize(24).fillColor(NAVY)
    .text("AI Data Center Glossary", { align: "center" });
  if (intro) {
    doc.moveDown(0.3);
    doc.font("Helvetica").fontSize(11).fillColor(GREY)
      .text(intro, { align: "center" });
  }
  doc.moveDown(0.3);
  doc.font("Helvetica-Oblique").fontSize(9.5).fillColor(GREY)
    .text("Compiled by Power Grab TX — powergrabtx.com", { align: "center" });
  doc.moveDown(0.5);
  doc.save().moveTo(50, doc.y).lineTo(50 + pageWidth, doc.y)
    .lineWidth(1.5).strokeColor(RULE).stroke().restore();
  doc.moveDown(0.9);

  categories.forEach((cat) => {
    // Keep a category heading from being orphaned alone at the bottom of a page.
    if (doc.y > doc.page.height - doc.page.margins.bottom - 90) {
      doc.addPage();
    }

    doc.font("Helvetica-Bold").fontSize(14).fillColor(cat.color)
      .text(cat.title.toUpperCase(), { width: pageWidth, characterSpacing: 0.3 });
    doc.save()
      .moveTo(50, doc.y + 2)
      .lineTo(50 + pageWidth, doc.y + 2)
      .lineWidth(1.5)
      .strokeColor(cat.color)
      .stroke()
      .restore();
    doc.moveDown(0.5);

    if (cat.desc) {
      doc.font("Helvetica-Oblique").fontSize(9.3).fillColor(GREY)
        .text(cat.desc, { width: pageWidth });
      doc.moveDown(0.5);
    }

    cat.terms.forEach((term) => {
      doc.font("Helvetica-Bold").fontSize(10.5).fillColor(INK)
        .text(term.heading, { width: pageWidth });
      doc.font("Helvetica").fontSize(9.5).fillColor(BODY)
        .text(term.definition, { width: pageWidth });
      if (term.analogy) {
        doc.font("Helvetica-Oblique").fontSize(8.8).fillColor(GREY)
          .text(term.analogy, { width: pageWidth });
      }
      doc.moveDown(0.55);
    });

    doc.moveDown(0.5);
  });

  doc.font("Helvetica-Oblique").fontSize(8).fillColor(GREY).text(
    "Compiled for a general, non-technical reader. Terminology in this space evolves quickly as the " +
      "industry grows — treat this as a starting reference rather than an exhaustive or permanently " +
      "up-to-date list.",
    { width: pageWidth },
  );

  // Page numbers (footer), added after all content is flowed. Writing this
  // low makes pdfkit's normal .text() flow think it has overflowed the
  // page and silently start a new one — zero out the bottom margin for the
  // duration of each footer write to stop that.
  const range = doc.bufferedPageRange();
  for (let i = 0; i < range.count; i++) {
    doc.switchToPage(range.start + i);
    const savedBottom = doc.page.margins.bottom;
    doc.page.margins.bottom = 0;
    doc.font("Helvetica").fontSize(8).fillColor(GREY).text(
      `${i + 1} / ${range.count}`,
      50,
      doc.page.height - 34,
      { width: pageWidth, align: "center", lineBreak: false },
    );
    doc.page.margins.bottom = savedBottom;
  }

  doc.end();
}

const source = fs.readFileSync(SRC_PATH, "utf-8");
const intro = loadIntro(source);
const categories = loadCategories(source);
if (categories.length === 0) {
  console.warn("[build-glossary-pdf] No category sections found in glossary.astro — skipping PDF build.");
} else {
  buildPdf({ intro, categories });
  const termCount = categories.reduce((n, c) => n + c.terms.length, 0);
  console.log(
    `[build-glossary-pdf] Wrote ${path.relative(ROOT, OUT_PATH)} (${categories.length} categories, ${termCount} terms).`,
  );
}
