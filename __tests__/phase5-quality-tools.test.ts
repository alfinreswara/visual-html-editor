import { describe, expect, it } from "vitest";
import {
  validateHtml,
  analyzeSeo,
  checkAccessibility,
  detectBrokenAssets,
  checkResponsiveLayout,
  runProjectAudit,
} from "@/lib/quality";
import { makeTextFile, type ProjectFiles } from "@/lib/project-files";

describe("Phase 5: Website Quality Tools & Auditing", () => {
  describe("Task 1: HTML Validator", () => {
    it("detects missing document title, lang attribute, and doctype", () => {
      const invalidHtml = `<html><head></head><body><h1>Hello</h1></body></html>`;
      const { issues } = validateHtml(invalidHtml, "index.html");

      const issueIds = issues.map((i) => i.id);
      expect(issueIds).toContain("index.html-missing-doctype");
      expect(issueIds).toContain("index.html-missing-title");
      expect(issueIds).toContain("index.html-missing-lang");
    });

    it("detects duplicate HTML IDs and identifies the duplicate instances", () => {
      const htmlWithDuplicateIds = `
        <!DOCTYPE html>
        <html lang="id">
        <head><title>Test Page</title></head>
        <body>
          <section id="hero">Hero 1</section>
          <div id="hero">Hero 2</div>
          <p id="hero">Hero 3</p>
        </body>
        </html>
      `;
      const { issues } = validateHtml(htmlWithDuplicateIds, "index.html");
      const duplicateIssues = issues.filter((i) => i.title.includes("ID HTML duplikat"));
      expect(duplicateIssues.length).toBe(2); // 2 duplicates found
      expect(duplicateIssues[0].severity).toBe("error");
      expect(duplicateIssues[0].selector).toBe("#hero");
    });

    it("detects invalid nesting (block element inside <p> and interactive inside interactive)", () => {
      const htmlWithInvalidNesting = `
        <!DOCTYPE html>
        <html lang="id">
        <head><title>Test Page</title></head>
        <body>
          <p>This is a paragraph with a <div id="nested-box">div inside</div></p>
          <button id="outer-btn">
            Click here <a href="page.html">Go to page</a>
          </button>
        </body>
        </html>
      `;
      const { issues } = validateHtml(htmlWithInvalidNesting, "index.html");

      const blockInPIssue = issues.find((i) => i.title.includes("Elemen blok <div> di dalam paragraf <p>"));
      expect(blockInPIssue).toBeDefined();
      expect(blockInPIssue?.severity).toBe("error");

      const interactiveNestingIssue = issues.find((i) => i.title.includes("Elemen interaktif <a> di dalam <button>"));
      expect(interactiveNestingIssue).toBeDefined();
      expect(interactiveNestingIssue?.severity).toBe("error");
    });

    it("detects empty links and empty buttons", () => {
      const htmlWithEmptyInteractive = `
        <!DOCTYPE html>
        <html lang="id">
        <head><title>Test Page</title></head>
        <body>
          <a href="#"></a>
          <button></button>
          <button aria-label="Valid Search"><svg></svg></button>
        </body>
        </html>
      `;
      const { issues } = validateHtml(htmlWithEmptyInteractive, "index.html");

      const emptyLink = issues.find((i) => i.title.includes("Elemen tautan <a> kosong"));
      expect(emptyLink).toBeDefined();
      expect(emptyLink?.severity).toBe("error");

      const emptyBtn = issues.find((i) => i.title.includes("Tombol <button> kosong tanpa label"));
      expect(emptyBtn).toBeDefined();
      expect(emptyBtn?.severity).toBe("error");
    });

    it("detects broken heading hierarchy (skipped heading levels and missing h1)", () => {
      const htmlWithSkippedHeading = `
        <!DOCTYPE html>
        <html lang="id">
        <head><title>Test Page</title></head>
        <body>
          <h1>Main Title</h1>
          <h3>Skipped to H3 directly</h3>
        </body>
        </html>
      `;
      const { issues } = validateHtml(htmlWithSkippedHeading, "index.html");
      const skippedIssue = issues.find((i) => i.title.includes("Tingkat heading melompat"));
      expect(skippedIssue).toBeDefined();
      expect(skippedIssue?.severity).toBe("warning");
      expect(skippedIssue?.description).toContain("melompati");
    });

    it("reports passed checks on well-structured HTML", () => {
      const validHtml = `
        <!DOCTYPE html>
        <html lang="id">
        <head><title>Situs Resmi Perusahaan Modern</title></head>
        <body>
          <main>
            <h1 id="top">Judul Utama</h1>
            <h2>Sub-judul Bagian</h2>
            <p>Paragraf deskripsi yang rapi dan benar.</p>
            <a href="#top">Kembali ke atas</a>
            <button type="button">Klik Saya</button>
          </main>
        </body>
        </html>
      `;
      const { issues, passedChecks } = validateHtml(validHtml, "index.html");
      expect(issues.filter((i) => i.severity === "error").length).toBe(0);
      expect(passedChecks.some((p) => p.title.includes("DOCTYPE"))).toBe(true);
      expect(passedChecks.some((p) => p.title.includes("Bahasa"))).toBe(true);
      expect(passedChecks.some((p) => p.title.includes("Semua ID Unik"))).toBe(true);
      expect(passedChecks.some((p) => p.title.includes("Penumpukan"))).toBe(true);
    });
  });

  describe("Task 2: SEO Analyzer", () => {
    it("detects missing or sub-optimal title and meta description", () => {
      const htmlShortSeo = `
        <!DOCTYPE html>
        <html lang="id">
        <head>
          <title>Short</title>
          <meta name="description" content="Too brief.">
        </head>
        <body><h1>Heading</h1></body>
        </html>
      `;
      const { issues } = analyzeSeo(htmlShortSeo, "index.html");

      const titleIssue = issues.find((i) => i.id.includes("seo-short-title"));
      expect(titleIssue).toBeDefined();
      expect(titleIssue?.severity).toBe("warning");

      const descIssue = issues.find((i) => i.id.includes("seo-short-meta-description"));
      expect(descIssue).toBeDefined();
      expect(descIssue?.severity).toBe("warning");
    });

    it("warns when robots meta has noindex directive", () => {
      const htmlNoindex = `
        <!DOCTYPE html>
        <html lang="id">
        <head>
          <title>Website Siap Diluncurkan dan Publikasi</title>
          <meta name="robots" content="noindex, nofollow">
        </head>
        <body><h1>Judul</h1></body>
        </html>
      `;
      const { issues } = analyzeSeo(htmlNoindex, "index.html");
      const noindexIssue = issues.find((i) => i.id.includes("seo-robots-noindex"));
      expect(noindexIssue).toBeDefined();
      expect(noindexIssue?.severity).toBe("warning");
    });

    it("flags generic non-descriptive anchor texts", () => {
      const htmlGenericAnchors = `
        <!DOCTYPE html>
        <html lang="id">
        <head><title>Halaman Portal Berita dan Opini Publik</title></head>
        <body>
          <h1>Portal Berita</h1>
          <a href="detail.html">klik di sini</a>
          <a href="article.html">read more</a>
          <a href="service.html">Pelajari Solusi Cloud Enterprise</a>
        </body>
        </html>
      `;
      const { issues } = analyzeSeo(htmlGenericAnchors, "index.html");
      const genericAnchorIssues = issues.filter((i) => i.id.includes("seo-generic-anchor"));
      expect(genericAnchorIssues.length).toBe(2);
      expect(genericAnchorIssues[0].description).toContain("klik di sini");
    });

    it("identifies missing Open Graph tags for social media previews", () => {
      const htmlWithoutOg = `
        <!DOCTYPE html>
        <html lang="id">
        <head><title>Halaman Tanpa Open Graph Tags</title></head>
        <body><h1>Judul</h1></body>
        </html>
      `;
      const { issues } = analyzeSeo(htmlWithoutOg, "index.html");
      const ogIssue = issues.find((i) => i.id.includes("seo-missing-og-tags"));
      expect(ogIssue).toBeDefined();
      expect(ogIssue?.severity).toBe("info");
      expect(ogIssue?.suggestedCorrection).toContain("og:title");
    });
  });

  describe("Task 3: Accessibility (A11Y) Checker", () => {
    it("detects images missing alt attributes", () => {
      const htmlMissingAlt = `
        <!DOCTYPE html>
        <html lang="id">
        <head><title>A11y Test</title></head>
        <body>
          <img src="photo.jpg">
          <img src="icon.svg" alt="App Icon">
        </body>
        </html>
      `;
      const { issues } = checkAccessibility(htmlMissingAlt, "index.html");
      const altIssue = issues.find((i) => i.id.includes("a11y-img-no-alt"));
      expect(altIssue).toBeDefined();
      expect(altIssue?.severity).toBe("error");
      expect(altIssue?.title).toContain("WCAG 1.1.1");
    });

    it("detects form controls without accessible labels", () => {
      const htmlUnlabelledForm = `
        <!DOCTYPE html>
        <html lang="id">
        <head><title>A11y Test</title></head>
        <body>
          <input type="text" placeholder="Masukkan nama">
          <label for="email-field">Email:</label>
          <input type="email" id="email-field">
        </body>
        </html>
      `;
      const { issues } = checkAccessibility(htmlUnlabelledForm, "index.html");
      const labelIssue = issues.find((i) => i.id.includes("a11y-unlabelled-form-control"));
      expect(labelIssue).toBeDefined();
      expect(labelIssue?.severity).toBe("error");
      expect(labelIssue?.title).toContain("WCAG 3.3.2");
    });

    it("detects positive tabindex anti-patterns", () => {
      const htmlPositiveTabindex = `
        <!DOCTYPE html>
        <html lang="id">
        <head><title>A11y Test</title></head>
        <body>
          <a href="#" tabindex="5">Bad Tabindex</a>
          <button tabindex="0">Normal Focusable</button>
        </body>
        </html>
      `;
      const { issues } = checkAccessibility(htmlPositiveTabindex, "index.html");
      const tabindexIssue = issues.find((i) => i.id.includes("a11y-positive-tabindex"));
      expect(tabindexIssue).toBeDefined();
      expect(tabindexIssue?.severity).toBe("warning");
    });

    it("detects low color contrast on inline styles", () => {
      // Light gray on white = low contrast (< 4.5:1)
      const htmlLowContrast = `
        <!DOCTYPE html>
        <html lang="id">
        <head><title>A11y Test</title></head>
        <body>
          <p style="color: #cccccc; background-color: #ffffff;">Nearly invisible text</p>
        </body>
        </html>
      `;
      const { issues } = checkAccessibility(htmlLowContrast, "index.html");
      const contrastIssue = issues.find((i) => i.id.includes("a11y-low-contrast"));
      expect(contrastIssue).toBeDefined();
      expect(contrastIssue?.severity).toBe("warning");
      expect(contrastIssue?.title).toContain("Rasio kontras warna rendah");
    });

    it("detects missing <main> landmark", () => {
      const htmlNoMain = `
        <!DOCTYPE html>
        <html lang="id">
        <head><title>A11y Test</title></head>
        <body>
          <div>Just divs without semantic landmarks</div>
        </body>
        </html>
      `;
      const { issues } = checkAccessibility(htmlNoMain, "index.html");
      const mainIssue = issues.find((i) => i.id.includes("a11y-missing-main-landmark"));
      expect(mainIssue).toBeDefined();
      expect(mainIssue?.severity).toBe("warning");
    });
  });

  describe("Task 4: Broken Asset & Internal Link Detector", () => {
    it("detects missing local images and missing local CSS files", () => {
      const files: ProjectFiles = {
        "index.html": makeTextFile(`
          <!DOCTYPE html>
          <html>
          <head>
            <link rel="stylesheet" href="missing-styles.css">
            <link rel="stylesheet" href="https://cdn.example.com/external.css">
          </head>
          <body>
            <img src="images/missing-hero.jpg">
            <img src="https://images.unsplash.com/photo-1234.jpg">
            <script src="missing-script.js"></script>
          </body>
          </html>
        `, "index.html"),
      };

      const { issues } = detectBrokenAssets(files, "index.html");

      // missing local css detected
      const brokenCss = issues.find((i) => i.id.includes("broken-css"));
      expect(brokenCss).toBeDefined();
      expect(brokenCss?.description).toContain("missing-styles.css");

      // missing local image detected
      const brokenImg = issues.find((i) => i.id.includes("broken-img"));
      expect(brokenImg).toBeDefined();
      expect(brokenImg?.description).toContain("images/missing-hero.jpg");

      // missing local script detected
      const brokenScript = issues.find((i) => i.id.includes("broken-script"));
      expect(brokenScript).toBeDefined();
      expect(brokenScript?.description).toContain("missing-script.js");

      // external resources (https://...) are NOT flagged as broken local assets
      expect(issues.some((i) => i.description.includes("external.css"))).toBe(false);
      expect(issues.some((i) => i.description.includes("unsplash.com"))).toBe(false);
    });

    it("detects broken internal page links and broken page anchor targets", () => {
      const files: ProjectFiles = {
        "index.html": makeTextFile(`
          <!DOCTYPE html>
          <html>
          <body>
            <a href="about.html">Tentang Kami</a>
            <a href="contact.html#support">Hubungi Dukungan</a>
            <a href="https://external.com">Situs Luar</a>
          </body>
          </html>
        `, "index.html"),
        "contact.html": makeTextFile(`
          <!DOCTYPE html>
          <html>
          <body>
            <h1>Hubungi Kami</h1>
            <div id="general">Umum</div>
          </body>
          </html>
        `, "contact.html"),
      };

      const { issues } = detectBrokenAssets(files, "index.html");

      // about.html does NOT exist in files
      const brokenPage = issues.find((i) => i.id.includes("broken-page-link"));
      expect(brokenPage).toBeDefined();
      expect(brokenPage?.description).toContain("about.html");

      // contact.html exists, but #support does NOT exist in contact.html
      const brokenHash = issues.find((i) => i.id.includes("broken-page-hash"));
      expect(brokenHash).toBeDefined();
      expect(brokenHash?.description).toContain("support");
    });
  });

  describe("Task 5: Responsive Layout Checker", () => {
    it("detects elements with fixed pixel widths larger than mobile viewport (390px)", () => {
      const htmlOverflow = `
        <!DOCTYPE html>
        <html>
        <head><title>Overflow Test</title></head>
        <body>
          <div style="width: 800px; background: red;">Fixed 800px wide box</div>
        </body>
        </html>
      `;
      const { issues } = checkResponsiveLayout(
        htmlOverflow,
        { viewportWidth: 390, viewportHeight: 844, deviceLabel: "Mobile (390px)" },
        "index.html",
      );

      const fixedWidthIssue = issues.find((i) => i.id.includes("resp-fixed-width"));
      expect(fixedWidthIssue).toBeDefined();
      expect(fixedWidthIssue?.severity).toBe("error");
      expect(fixedWidthIssue?.description).toContain("800px");
      expect(fixedWidthIssue?.suggestedCorrection).toContain("max-width: 100%");
    });

    it("detects oversized images on mobile without max-width constraints", () => {
      const htmlImgOverflow = `
        <!DOCTYPE html>
        <html>
        <head><title>Img Overflow</title></head>
        <body>
          <img src="banner.jpg" width="1200">
        </body>
        </html>
      `;
      const { issues } = checkResponsiveLayout(
        htmlImgOverflow,
        { viewportWidth: 390, viewportHeight: 844, deviceLabel: "Mobile (390px)" },
        "index.html",
      );

      const oversizedImg = issues.find((i) => i.id.includes("resp-oversized-img"));
      expect(oversizedImg).toBeDefined();
      expect(oversizedImg?.severity).toBe("warning");
      expect(oversizedImg?.description).toContain("1200");
    });
  });

  describe("Unified Multi-Page Project Audit", () => {
    it("executes full multi-page project audit and aggregates truthful statistics", () => {
      const files: ProjectFiles = {
        "index.html": makeTextFile(`
          <!DOCTYPE html>
          <html lang="id">
          <head>
            <title>Platform Cloud Terpercaya Untuk Startup Modern</title>
            <meta name="description" content="Platform cloud cerdas dengan analitik server otomatis dan keamanan tingkat perbankan global.">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <link rel="stylesheet" href="styles.css">
          </head>
          <body>
            <main>
              <h1>Platform Cloud Modern</h1>
              <p>Solusi infrastruktur tercepat.</p>
              <a href="pricing.html">Lihat Paket Harga Langganan</a>
            </main>
          </body>
          </html>
        `, "index.html"),
        "pricing.html": makeTextFile(`
          <!DOCTYPE html>
          <html lang="id">
          <head>
            <title>Paket Harga Langganan Lengkap</title>
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <link rel="stylesheet" href="styles.css">
          </head>
          <body>
            <main>
              <h1>Tabel Harga</h1>
              <a href="index.html">Kembali ke Beranda</a>
            </main>
          </body>
          </html>
        `, "pricing.html"),
        "styles.css": makeTextFile("body { margin: 0; }", "styles.css"),
      };

      const report = runProjectAudit(files, { auditAllPages: true });

      expect(report.stats).toBeDefined();
      expect(report.pageSummaries["index.html"]).toBeDefined();
      expect(report.pageSummaries["pricing.html"]).toBeDefined();
      expect(report.passedChecks.length).toBeGreaterThan(0);
      expect(report.disclaimer).toBeTruthy();
    });
  });
});
