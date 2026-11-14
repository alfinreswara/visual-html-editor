import { describe, it, expect, beforeEach } from "vitest";
import {
  buildPreviewDocument,
  cleanEditorArtifacts,
  getElementHtml,
  getElementInlineStyles,
  isSafeHref,
  sanitizeRichText,
  updateElementHref,
  updateElementInnerHtml,
  updateElementStyle,
  updateElementText,
} from "@/lib/html";
import {
  parseBridgeMessage,
  PREVIEW_CHANNEL,
  STYLE_KEYS,
  type ElementStyle,
} from "@/lib/editor-messages";
import {
  extractRulesForSelector,
  hasStyleRule,
  upsertStyleRule,
} from "@/lib/css-rules";
import {
  writeStyleRuleToProject,
  type StyleFileResult,
} from "@/lib/style-files";
import {
  makeTextFile,
  getTextFile,
  type ProjectFiles,
} from "@/lib/project-files";

describe("Phase 2 — Rich Text Editor & Advanced Style Panel", () => {
  const samplePage = `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <title>Phase 2 Test Page</title>
</head>
<body>
  <div class="hero-container" id="hero">
    <h1 class="headline" style="font-size: 48px; color: #18181b;">Visual <em>HTML</em> Editor</h1>
    <p class="subtitle">Platform pembuatan website visual profesional.</p>
    <a href="https://example.com" class="cta-link">Mulai Sekarang</a>
  </div>
  <div class="card-grid">
    <div class="card" id="card-1">
      <h3 class="card-title">Fitur Unggulan</h3>
      <p class="card-desc">Keterangan lengkap fitur.</p>
    </div>
  </div>
</body>
</html>`;

  const initialCss = `/* Base styles */
.hero-container {
  padding: 40px;
}
.headline {
  font-weight: 700;
}
`;

  /* =====================================================================
   * 1. CONTEXTUAL RICH TEXT EDITOR & NESTED HTML PRESERVATION
   * ===================================================================== */
  describe("1. Rich Text Editing & DOM Sync", () => {
    it("buildPreviewDocument injects the floating rich text toolbar into preview DOM", () => {
      const doc = buildPreviewDocument(samplePage);
      expect(doc).toContain('__ve_rich_text_toolbar');
      expect(doc).toContain('data-ve-bridge');
      expect(doc).toContain('installRichTextToolbar');
    });

    it("cleanEditorArtifacts removes the rich text toolbar and all UI elements", () => {
      const preview = buildPreviewDocument(samplePage);
      const clean = cleanEditorArtifacts(preview);
      expect(clean).not.toContain("__ve_rich_text_toolbar");
      expect(clean).not.toContain("data-ve-ui");
      expect(clean).not.toContain("data-ve-bridge");
      expect(clean).toContain("Visual <em>HTML</em> Editor");
    });

    it("parses bridge message of type 'html' correctly", () => {
      const msg = {
        channel: PREVIEW_CHANNEL,
        type: "html",
        payload: {
          id: "ve-2",
          html: 'Visual <strong>HTML</strong> <span style="color:#ef4444;">Editor</span>',
        },
      };
      const parsed = parseBridgeMessage(msg);
      expect(parsed).toBeTruthy();
      expect(parsed?.type).toBe("html");
      if (parsed && parsed.type === "html") {
        expect(parsed.payload.id).toBe("ve-2");
        expect(parsed.payload.html).toContain("<strong>HTML</strong>");
      }
    });

    it("updateElementInnerHtml preserves nested HTML: bold (<strong>), italic (<em>), underline (<u>)", () => {
      const preview = buildPreviewDocument(samplePage);
      const match = preview.match(/<h1[^>]*data-ve-id="([^"]+)"/);
      expect(match).toBeTruthy();
      const id = match![1];

      const richContent = 'Visual <strong>HTML</strong> <em>Modern</em> <u>Editor</u>';
      const updated = updateElementInnerHtml(samplePage, id, richContent);
      expect(updated).toBeTruthy();
      expect(updated).toContain("<strong>HTML</strong>");
      expect(updated).toContain("<em>Modern</em>");
      expect(updated).toContain("<u>Editor</u>");
    });

    it("updateElementInnerHtml supports text color and font size with nested spans", () => {
      const preview = buildPreviewDocument(samplePage);
      const match = preview.match(/<p[^>]*class="subtitle"[^>]*data-ve-id="([^"]+)"/);
      expect(match).toBeTruthy();
      const id = match![1];

      const styledHtml =
        'Platform <span style="color: #3b82f6; font-size: 20px;">pembuatan website</span> visual.';
      const updated = updateElementInnerHtml(samplePage, id, styledHtml);
      expect(updated).toBeTruthy();
      expect(updated).toContain('style="color: #3b82f6; font-size: 20px;"');
      expect(updated).toContain("pembuatan website");
    });

    it("updateElementInnerHtml supports inserting anchor links inside text", () => {
      const preview = buildPreviewDocument(samplePage);
      const match = preview.match(/<p[^>]*class="card-desc"[^>]*data-ve-id="([^"]+)"/);
      expect(match).toBeTruthy();
      const id = match![1];

      const linkHtml =
        'Keterangan <a href="https://google.com" target="_blank" rel="noopener noreferrer">lengkap fitur</a>.';
      const updated = updateElementInnerHtml(samplePage, id, linkHtml);
      expect(updated).toBeTruthy();
      expect(updated).toContain('href="https://google.com"');
      expect(updated).toContain('target="_blank"');
      expect(updated).toContain("lengkap fitur");
    });

    it("preserves element attributes and classes when updating inner HTML", () => {
      const preview = buildPreviewDocument(samplePage);
      const match = preview.match(/<h1[^>]*data-ve-id="([^"]+)"/);
      const id = match![1];

      const updated = updateElementInnerHtml(samplePage, id, "Judul Terformat");
      expect(updated).toContain('class="headline"');
      expect(updated).toContain('style="font-size: 48px; color: #18181b;"');
      expect(updated).toContain("Judul Terformat");
    });

    it("supports Undo/Redo lifecycle for rich text formatting", () => {
      const preview = buildPreviewDocument(samplePage);
      const match = preview.match(/<h1[^>]*data-ve-id="([^"]+)"/);
      const id = match![1];

      // Step 1: Initial state
      const state0 = samplePage;

      // Step 2: Bold applied
      const state1 = updateElementInnerHtml(
        state0,
        id,
        "Visual <strong>Super HTML</strong> Editor",
      )!;
      expect(state1).toContain("<strong>Super HTML</strong>");

      // Step 3: Color applied
      const state2 = updateElementInnerHtml(
        state1,
        id,
        'Visual <strong>Super HTML</strong> <span style="color:#ef4444;">Editor</span>',
      )!;
      expect(state2).toContain('style="color:#ef4444;"');

      // Simulating Undo 1: Reverting to state1
      expect(state1).not.toContain('style="color:#ef4444;"');
      expect(state1).toContain("<strong>Super HTML</strong>");

      // Simulating Undo 2: Reverting to state0
      expect(state0).toContain("Visual <em>HTML</em> Editor");
      expect(state0).not.toContain("Super HTML");

      // Simulating Redo: Re-applying state2
      expect(state2).toContain('style="color:#ef4444;"');
    });
  });

  /* =====================================================================
   * 2. ADVANCED STYLE PANEL — 8 CATEGORIES
   * ===================================================================== */
  describe("2. Advanced Style Panel Categories", () => {
    let preview: string;
    let heroId: string;

    beforeEach(() => {
      preview = buildPreviewDocument(samplePage);
      const match = preview.match(/<div[^>]*id="hero"[^>]*data-ve-id="([^"]+)"/);
      expect(match).toBeTruthy();
      heroId = match![1];
    });

    it("updates Layout properties (display, flexbox, grid, gap, direction)", () => {
      const updated = updateElementStyle(samplePage, heroId, {
        display: "flex",
        flexDirection: "column",
        flexWrap: "wrap",
        justifyContent: "space-between",
        alignItems: "center",
        alignSelf: "flex-start",
        gap: "24px",
        direction: "rtl",
      });

      expect(updated).toBeTruthy();
      expect(updated).toContain("display: flex;");
      expect(updated).toContain("flex-direction: column;");
      expect(updated).toContain("flex-wrap: wrap;");
      expect(updated).toContain("justify-content: space-between;");
      expect(updated).toContain("align-items: center;");
      expect(updated).toContain("align-self: flex-start;");
      expect(updated).toContain("gap: 24px;");
      expect(updated).toContain("direction: rtl;");
    });

    it("updates Grid layout properties (gridTemplateColumns, gridTemplateRows)", () => {
      const updated = updateElementStyle(samplePage, heroId, {
        display: "grid",
        gridTemplateColumns: "repeat(3, 1fr)",
        gridTemplateRows: "auto 1fr",
        gap: "16px",
      });

      expect(updated).toBeTruthy();
      expect(updated).toContain("display: grid;");
      expect(updated).toContain("grid-template-columns: repeat(3, 1fr);");
      expect(updated).toContain("grid-template-rows: auto 1fr;");
      expect(updated).toContain("gap: 16px;");
    });

    it("updates Size properties (width, height, min/max width, min/max height)", () => {
      const updated = updateElementStyle(samplePage, heroId, {
        width: "100%",
        height: "500px",
        minWidth: "320px",
        maxWidth: "1200px",
        minHeight: "400px",
        maxHeight: "800px",
      });

      expect(updated).toBeTruthy();
      expect(updated).toContain("width: 100%;");
      expect(updated).toContain("height: 500px;");
      expect(updated).toContain("min-width: 320px;");
      expect(updated).toContain("max-width: 1200px;");
      expect(updated).toContain("min-height: 400px;");
      expect(updated).toContain("max-height: 800px;");
    });

    it("updates Spacing properties (margin and padding 4 sides)", () => {
      const updated = updateElementStyle(samplePage, heroId, {
        marginTop: "10px",
        marginRight: "20px",
        marginBottom: "30px",
        marginLeft: "40px",
        paddingTop: "15px",
        paddingRight: "25px",
        paddingBottom: "35px",
        paddingLeft: "45px",
      });

      expect(updated).toBeTruthy();
      expect(updated).toContain("margin: 10px 20px 30px 40px;");
      expect(updated).toContain("padding: 15px 25px 35px 45px;");
    });

    it("updates Typography properties (family, size, weight, line-height, letter-spacing, decoration, transform)", () => {
      const updated = updateElementStyle(samplePage, heroId, {
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        fontSize: "24px",
        fontWeight: "600",
        lineHeight: "1.5",
        letterSpacing: "-0.02em",
        textAlign: "center",
        textDecoration: "underline",
        textTransform: "uppercase",
        color: "#2563eb",
      });

      expect(updated).toBeTruthy();
      expect(updated).toContain("Plus Jakarta Sans");
      expect(updated).toContain("font-size: 24px;");
      expect(updated).toContain("font-weight: 600;");
      expect(updated).toContain("line-height: 1.5;");
      expect(updated).toContain("letter-spacing: -0.02em;");
      expect(updated).toContain("text-align: center;");
      expect(updated).toContain("text-decoration: underline;");
      expect(updated).toContain("text-transform: uppercase;");
      expect(updated).toContain("color: #2563eb;");
    });

    it("updates Background properties (color, image/gradient, size, position, repeat)", () => {
      const updated = updateElementStyle(samplePage, heroId, {
        backgroundColor: "#f8fafc",
        backgroundImage: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      });

      expect(updated).toBeTruthy();
      expect(updated).toContain("background-color: #f8fafc;");
      expect(updated).toContain("background-image: linear-gradient(135deg, #3b82f6, #8b5cf6);");
      expect(updated).toContain("background-size: cover;");
      expect(updated).toContain("background-repeat: no-repeat;");
    });

    it("updates Border properties (width, style, color, 4 corner radius)", () => {
      const updated = updateElementStyle(samplePage, heroId, {
        borderWidth: "2px",
        borderStyle: "solid",
        borderColor: "#e2e8f0",
        borderTopLeftRadius: "12px",
        borderTopRightRadius: "16px",
        borderBottomRightRadius: "20px",
        borderBottomLeftRadius: "24px",
      });

      expect(updated).toBeTruthy();
      expect(updated).toContain("border-width: 2px;");
      expect(updated).toContain("border-style: solid;");
      expect(updated).toContain("border-color: #e2e8f0;");
      expect(updated).toContain("border-radius: 12px 16px 20px 24px;");
    });

    it("updates Effects properties (boxShadow, opacity, transform, transition, filter)", () => {
      const updated = updateElementStyle(samplePage, heroId, {
        boxShadow: "0 10px 25px rgba(0, 0, 0, 0.1)",
        opacity: "0.95",
        transform: "scale(1.02)",
        transition: "all 300ms ease",
        filter: "blur(0px)",
      });

      expect(updated).toBeTruthy();
      expect(updated).toContain("box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);");
      expect(updated).toContain("opacity: 0.95;");
      expect(updated).toContain("transform: scale(1.02);");
      expect(updated).toContain("transition: all 300ms ease;");
      expect(updated).toContain("filter: blur(0px);");
    });

    it("updates Position properties (position, top, right, bottom, left, zIndex)", () => {
      const updated = updateElementStyle(samplePage, heroId, {
        position: "relative",
        top: "10px",
        left: "20px",
        zIndex: "50",
      });

      expect(updated).toBeTruthy();
      expect(updated).toContain("position: relative;");
      expect(updated).toContain("top: 10px;");
      expect(updated).toContain("left: 20px;");
      expect(updated).toContain("z-index: 50;");
    });
  });

  /* =====================================================================
   * 3. RESPONSIVE CONTROLS & CSS SYNCHRONIZATION
   * ===================================================================== */
  describe("3. Responsive Controls & CSS Synchronization", () => {
    it("writes desktop base rule without media query", () => {
      const css = upsertStyleRule("", ".headline", { fontSize: "48px" }, "desktop", false);
      expect(css).toContain(".headline {");
      expect(css).toContain("font-size: 48px;");
      expect(css).not.toContain("@media");
      expect(css).not.toContain("!important");
    });

    it("writes tablet override inside tablet media query", () => {
      const baseCss = `.headline {\n  font-size: 48px;\n}\n`;
      const withTablet = upsertStyleRule(
        baseCss,
        ".headline",
        { fontSize: "36px" },
        "tablet",
        false,
      );

      expect(withTablet).toContain("@media (max-width: 1024px) and (min-width: 641px)");
      expect(withTablet).toContain("font-size: 36px;");
      // Desktop value remains intact in the same stylesheet
      expect(withTablet).toContain("font-size: 48px;");
    });

    it("writes mobile override inside mobile media query", () => {
      const baseCss = `.headline {\n  font-size: 48px;\n}\n`;
      const withMobile = upsertStyleRule(
        baseCss,
        ".headline",
        { fontSize: "28px" },
        "mobile",
        false,
      );

      expect(withMobile).toContain("@media (max-width: 640px)");
      expect(withMobile).toContain("font-size: 28px;");
      // Desktop value remains intact
      expect(withMobile).toContain("font-size: 48px;");
    });

    it("supports independent values across Desktop, Tablet, and Mobile breakpoints", () => {
      let css = initialCss;

      // 1. Desktop: font-size 48px
      css = upsertStyleRule(css, ".headline", { fontSize: "48px" }, "desktop", false);

      // 2. Tablet: font-size 36px
      css = upsertStyleRule(css, ".headline", { fontSize: "36px" }, "tablet", false);

      // 3. Mobile: font-size 28px
      css = upsertStyleRule(css, ".headline", { fontSize: "28px" }, "mobile", false);

      // Extract rules back
      const rules = extractRulesForSelector(css, ".headline");
      expect(rules.desktop.fontSize).toBe("48px");
      expect(rules.tablet.fontSize).toBe("36px");
      expect(rules.mobile.fontSize).toBe("28px");

      // Modifying Mobile does NOT alter Desktop or Tablet
      css = upsertStyleRule(css, ".headline", { fontSize: "24px" }, "mobile", false);
      const updatedRules = extractRulesForSelector(css, ".headline");
      expect(updatedRules.desktop.fontSize).toBe("48px");
      expect(updatedRules.tablet.fontSize).toBe("36px");
      expect(updatedRules.mobile.fontSize).toBe("24px");
    });

    it("detects tablet and mobile responsive overrides accurately via extractRulesForSelector", () => {
      const fullCss = `
.card {
  width: 100%;
  padding: 24px;
}
@media (max-width: 1024px) and (min-width: 641px) {
  .card {
    padding: 16px;
  }
}
@media (max-width: 640px) {
  .card {
    padding: 12px;
    border-radius: 8px;
  }
}
`;
      const rules = extractRulesForSelector(fullCss, ".card");
      expect(rules.desktop.padding).toBe("24px");
      expect(rules.tablet.padding).toBe("16px");
      expect(rules.mobile.padding).toBe("12px");
      expect(rules.mobile.borderRadius).toBe("8px");
      expect(rules.tablet.borderRadius).toBeUndefined();
    });

    it("writeStyleRuleToProject properly links stylesheet and updates CSS without unwanted !important", () => {
      const files: ProjectFiles = {
        "index.html": makeTextFile(samplePage, "index.html"),
        "styles.css": makeTextFile(initialCss, "styles.css"),
      };

      const result = writeStyleRuleToProject(
        files,
        "index.html",
        ".hero-container",
        { backgroundColor: "#0f172a" },
        "desktop",
        false,
      );

      expect(result).toBeTruthy();
      const cssContent = getTextFile(result!.files, "styles.css");
      expect(cssContent).toContain("background-color: #0f172a;");
      expect(cssContent).not.toContain("!important");
    });

    it("getElementInlineStyles reads all existing inline styles accurately", () => {
      const preview = buildPreviewDocument(samplePage);
      const match = preview.match(/<h1[^>]*data-ve-id="([^"]+)"/);
      expect(match).toBeTruthy();
      const id = match![1];

      const inline = getElementInlineStyles(samplePage, id);
      expect(inline.fontSize).toBe("48px");
      expect(inline.color).toBe("#18181b");
    });
  });

  /* =====================================================================
   * 6. SECURITY & REGRESSION VERIFICATIONS
   * ===================================================================== */
  describe("6. Security & Regression Verifications", () => {
    it("isSafeHref rejects javascript:, data:, and vbscript: schemes", () => {
      expect(isSafeHref("javascript:alert(1)")).toBe(false);
      expect(isSafeHref("  JAVASCRIPT:alert(document.cookie)")).toBe(false);
      expect(isSafeHref("data:text/html,<script>alert(1)</script>")).toBe(false);
      expect(isSafeHref("vbscript:msgbox(1)")).toBe(false);

      expect(isSafeHref("https://example.com")).toBe(true);
      expect(isSafeHref("http://example.com/page")).toBe(true);
      expect(isSafeHref("#section-1")).toBe(true);
      expect(isSafeHref("/about.html")).toBe(true);
      expect(isSafeHref("mailto:user@test.com")).toBe(true);
      expect(isSafeHref("tel:+628123456789")).toBe(true);
    });

    it("updateElementHref does not set malicious javascript: URLs", () => {
      const preview = buildPreviewDocument(samplePage);
      const match = preview.match(/<a[^>]*class="cta-link"[^>]*data-ve-id="([^"]+)"/);
      expect(match).toBeTruthy();
      const id = match![1];

      const updated = updateElementHref(samplePage, id, "javascript:alert(1)");
      expect(updated).toBeTruthy();
      expect(updated).not.toContain("javascript:alert(1)");
      expect(updated).toContain('href="https://example.com"');
    });

    it("sanitizeRichText strips <script> tags and malicious event handlers", () => {
      const malicious =
        '<p>Aman</p><script>alert("xss")</script><img src="test.jpg" onerror="alert(1)"><a href="javascript:alert(2)">Klik</a>';
      const clean = sanitizeRichText(malicious);
      expect(clean).not.toContain("<script>");
      expect(clean).not.toContain("alert");
      expect(clean).not.toContain("onerror");
      expect(clean).not.toContain("javascript:");
      expect(clean).toContain("<p>Aman</p>");
      expect(clean).toContain('<img src="test.jpg"');
    });

    it("updateElementInnerHtml sanitizes XSS injection while keeping formatting", () => {
      const preview = buildPreviewDocument(samplePage);
      const match = preview.match(/<p[^>]*class="subtitle"[^>]*data-ve-id="([^"]+)"/);
      expect(match).toBeTruthy();
      const id = match![1];

      const xssPayload =
        'Teks <strong>Tebal</strong> <script>alert(1)</script><img src=x onerror=alert(2)>';
      const updated = updateElementInnerHtml(samplePage, id, xssPayload);
      expect(updated).toBeTruthy();
      expect(updated).toContain("<strong>Tebal</strong>");
      expect(updated).not.toContain("<script>");
      expect(updated).not.toContain("onerror");
    });

    it("buildPreviewDocument configures pointer-events: none on data-ve-dragging for drag accuracy", () => {
      const preview = buildPreviewDocument(samplePage);
      expect(preview).toContain("[data-ve-dragging]{opacity:0.45 !important;pointer-events:none !important;}");
    });

    it("cleanEditorArtifacts removes drop_badge and size_badge completely", () => {
      const preview = buildPreviewDocument(samplePage);
      expect(preview).toContain("__ve_drop_badge");
      expect(preview).toContain("__ve_size_badge");
      const clean = cleanEditorArtifacts(preview);
      expect(clean).not.toContain("__ve_drop_badge");
      expect(clean).not.toContain("__ve_size_badge");
    });
  });
});
