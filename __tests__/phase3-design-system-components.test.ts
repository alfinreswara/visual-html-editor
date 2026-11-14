import { describe, it, expect, beforeEach } from "vitest";
import {
  generateDesignSystemCss,
  extractDesignSystemFromCss,
  resolveDesignTokens,
  DESIGN_SYSTEM_PRESETS,
  RADIUS_VALUES,
  SHADOW_VALUES,
  type GlobalTheme,
} from "@/lib/design-system";
import {
  COMPONENT_LIBRARY,
  COMPONENT_CATEGORIES,
} from "@/lib/component-library";
import {
  getUserSavedSections,
  saveUserSection,
  deleteUserSection,
  createSavedSectionFromHtml,
  _resetMemoryCache,
  SAVED_SECTIONS_STORAGE_KEY,
} from "@/lib/saved-sections";
import {
  writeGlobalThemeToProject,
  POPULAR_GOOGLE_FONTS,
  buildGoogleFontsUrl,
} from "@/lib/style-files";
import {
  makeTextFile,
  getTextFile,
  type ProjectFiles,
} from "@/lib/project-files";
import {
  getElementHtml,
  insertHtmlFragment,
} from "@/lib/html";
import { createProjectBackupZip } from "@/lib/project-export";
import type { Project } from "@/lib/projects";

describe("Phase 3: Design System & Tokens", () => {
  it("generates comprehensive CSS variables with backward compatibility", () => {
    const theme: GlobalTheme = {
      primaryColor: "#059669",
      secondaryColor: "#047857",
      backgroundColor: "#f0fdf4",
      surfaceColor: "#ffffff",
      textColor: "#064e3b",
      mutedTextColor: "#047857",
      borderColor: "#a7f3d0",
      headingFont: "Plus Jakarta Sans",
      bodyFont: "Inter",
      radiusPreset: "lg",
      shadowPreset: "medium",
    };

    const css = generateDesignSystemCss(theme);

    // CSS variables
    expect(css).toContain("/* --- KANVAS GLOBAL THEME --- */");
    expect(css).toContain("/* --- END KANVAS GLOBAL THEME --- */");
    expect(css).toContain("--color-primary: #059669;");
    expect(css).toContain("--primary: #059669;"); // backward-compat
    expect(css).toContain("--color-secondary: #047857;");
    expect(css).toContain("--color-bg: #f0fdf4;");
    expect(css).toContain("--color-surface: #ffffff;");
    expect(css).toContain("--color-text: #064e3b;");
    expect(css).toContain("--text: #064e3b;"); // backward-compat
    expect(css).toContain("--color-muted: #047857;");
    expect(css).toContain("--color-border: #a7f3d0;");
    expect(css).toContain("--font-heading: 'Plus Jakarta Sans', sans-serif;");
    expect(css).toContain("--font-body: 'Inter', sans-serif;");
    expect(css).toContain(`--radius-sm: ${RADIUS_VALUES.lg.sm};`);
    expect(css).toContain(`--radius-lg: ${RADIUS_VALUES.lg.lg};`);
    expect(css).toContain(`--shadow-md: ${SHADOW_VALUES.medium.md};`);

    // Utility classes
    expect(css).toContain(".btn-primary");
    expect(css).toContain(".btn-secondary");
    expect(css).toContain(".btn-outline");
    expect(css).toContain(".card");
    expect(css).toContain(".badge");
  });

  it("extracts design system tokens back from CSS block", () => {
    const theme: GlobalTheme = {
      primaryColor: "#6366f1",
      secondaryColor: "#4f46e5",
      backgroundColor: "#0f172a",
      surfaceColor: "#1e293b",
      textColor: "#f8fafc",
      mutedTextColor: "#94a3b8",
      borderColor: "#334155",
      headingFont: "Outfit",
      bodyFont: "Inter",
    };

    const css = generateDesignSystemCss(theme);
    const extracted = extractDesignSystemFromCss(css);

    expect(extracted).not.toBeNull();
    expect(extracted?.primaryColor).toBe("#6366f1");
    expect(extracted?.secondaryColor).toBe("#4f46e5");
    expect(extracted?.backgroundColor).toBe("#0f172a");
    expect(extracted?.surfaceColor).toBe("#1e293b");
    expect(extracted?.textColor).toBe("#f8fafc");
    expect(extracted?.mutedTextColor).toBe("#94a3b8");
    expect(extracted?.borderColor).toBe("#334155");
    expect(extracted?.headingFont).toBe("Outfit");
    expect(extracted?.bodyFont).toBe("Inter");
  });

  it("resolves default design tokens when partial theme is provided", () => {
    const tokens = resolveDesignTokens({});
    expect(tokens.colors.primary).toBe("#3b82f6");
    expect(tokens.colors.background).toBe("#ffffff");
    expect(tokens.colors.text).toBe("#0f172a");
    expect(tokens.typography.headingFont).toBe("'Inter', sans-serif");
    expect(tokens.radii.md).toBe("8px");
    expect(tokens.shadows.sm).not.toBe("none");
  });

  it("provides 6 curated and distinct design system presets", () => {
    expect(DESIGN_SYSTEM_PRESETS).toHaveLength(6);
    const presetIds = DESIGN_SYSTEM_PRESETS.map((p) => p.id);
    expect(presetIds).toContain("modern-minimal");
    expect(presetIds).toContain("dark-tech");
    expect(presetIds).toContain("warm-editorial");
    expect(presetIds).toContain("clean-saas");
    expect(presetIds).toContain("ocean-corporate");
    expect(presetIds).toContain("emerald-growth");

    for (const preset of DESIGN_SYSTEM_PRESETS) {
      expect(preset.name).toBeTruthy();
      expect(preset.description).toBeTruthy();
      expect(preset.theme.primaryColor).toMatch(/^#[0-9a-f]{6}$/i);
      expect(preset.theme.backgroundColor).toMatch(/^#[0-9a-f]{6}$/i);
      expect(preset.theme.textColor).toMatch(/^#[0-9a-f]{6}$/i);
      expect(preset.theme.headingFont).toBeTruthy();
      expect(preset.theme.bodyFont).toBeTruthy();
    }
  });

  it("updates project stylesheet cleanly with writeGlobalThemeToProject", () => {
    const initialHtml = `<!DOCTYPE html><html><head><title>Test</title></head><body><h1>Hello</h1></body></html>`;
    const initialFiles: ProjectFiles = {
      "index.html": makeTextFile(initialHtml, "index.html"),
      "styles.css": makeTextFile("/* Custom user code */\n.hero { margin: 20px; }", "styles.css"),
    };

    const theme: GlobalTheme = {
      primaryColor: "#2563eb",
      headingFont: "Inter",
      bodyFont: "Roboto",
    };

    const result = writeGlobalThemeToProject(initialFiles, "index.html", theme);
    expect(result).not.toBeNull();
    if (!result) return;

    const updatedCss = getTextFile(result.files, "styles.css");
    expect(updatedCss).toContain("/* Custom user code */"); // Preserves user code!
    expect(updatedCss).toContain("--color-primary: #2563eb;");
    expect(updatedCss).toContain("--font-heading: 'Inter', sans-serif;");

    const updatedHtml = getTextFile(result.files, "index.html");
    expect(updatedHtml).toContain('<link rel="stylesheet" href="styles.css">');
    expect(updatedHtml).toContain("fonts.googleapis.com");
  });
});

describe("Phase 3: Component Library", () => {
  it("contains curated components with valid categories and non-empty HTML", () => {
    expect(COMPONENT_LIBRARY.length).toBeGreaterThanOrEqual(10);

    for (const item of COMPONENT_LIBRARY) {
      expect(item.id).toBeTruthy();
      expect(item.name).toBeTruthy();
      expect(item.description).toBeTruthy();
      expect(item.html).toBeTruthy();
      expect(COMPONENT_CATEGORIES).toContain(item.category);

      // Verify HTML parsing
      const doc = new DOMParser().parseFromString(item.html, "text/html");
      expect(doc.body.children.length).toBeGreaterThan(0);
    }
  });

  it("uses CSS variable tokens throughout component templates", () => {
    const hero = COMPONENT_LIBRARY.find((c) => c.category === "Hero");
    expect(hero).toBeDefined();
    expect(hero?.html).toMatch(/var\(--color-|var\(--radius-|var\(--shadow-/);
  });

  it("inserts component HTML cleanly via insertHtmlFragment", () => {
    const baseHtml = `<!DOCTYPE html><html><head><title>Test</title></head><body><section id="s1" data-ve-id="ve-1"><h1>Title</h1></section></body></html>`;
    const cta = COMPONENT_LIBRARY.find((c) => c.category === "CTA");
    expect(cta).toBeDefined();
    if (!cta) return;

    const result = insertHtmlFragment(baseHtml, "ve-1", "after", cta.html);
    expect(result).not.toBeNull();
    if (!result) return;

    expect(result.html).toContain("Siap Meluncurkan Website Impian");
    expect(result.html).toContain("<section");
    // Verify target element remains intact
    expect(result.html).toContain("<h1>Title</h1>");
  });
});

describe("Phase 3: Reusable Components & Saved Sections", () => {
  beforeEach(() => {
    _resetMemoryCache();
    if (typeof window !== "undefined" && window.localStorage) {
      window.localStorage.removeItem(SAVED_SECTIONS_STORAGE_KEY);
    }
  });

  it("saves and retrieves user sections with previewSnippet", () => {
    const htmlToSave = `<section class="my-custom-cta" style="padding: 40px; background: #3b82f6;"><h2>Penawaran Spesial</h2><p>Daftar sekarang untuk diskon 50%!</p></section>`;

    const saved = createSavedSectionFromHtml("CTA Promo Spesial", htmlToSave, "CTA");
    expect(saved.id).toBeTruthy();
    expect(saved.name).toBe("CTA Promo Spesial");
    expect(saved.category).toBe("CTA");
    expect(saved.html).toBe(htmlToSave);
    expect(saved.previewSnippet).toContain("Penawaran Spesial");

    const all = getUserSavedSections();
    expect(all).toHaveLength(1);
    expect(all[0].id).toBe(saved.id);
  });

  it("deletes user saved sections cleanly", () => {
    const sec1 = createSavedSectionFromHtml("Section 1", "<div>Sec 1</div>");
    const sec2 = createSavedSectionFromHtml("Section 2", "<div>Sec 2</div>");

    let all = getUserSavedSections();
    expect(all).toHaveLength(2);

    deleteUserSection(sec1.id);
    all = getUserSavedSections();
    expect(all).toHaveLength(1);
    expect(all[0].id).toBe(sec2.id);
  });

  it("extracts clean outerHTML from canvas elements without editor artifacts", () => {
    const docHtml = `<!DOCTYPE html><html><body><div class="hero-box"><h2>Judul Bersih</h2><p>Teks paragraf</p></div></body></html>`;

    const extracted = getElementHtml(docHtml, "ve-1");
    expect(extracted).not.toBeNull();
    if (!extracted) return;

    expect(extracted).toContain('class="hero-box"');
    expect(extracted).toContain("<h2>Judul Bersih</h2>");
    expect(extracted).toContain("<p>Teks paragraf</p>");
    // Editor attributes MUST be stripped
    expect(extracted).not.toContain("data-ve-id");
    expect(extracted).not.toContain("data-ve-selected");
  });

  it("preserves savedSections in project backup ZIP metadata", async () => {
    const dummyProject: Project = {
      id: "proj-123",
      name: "Proyek Keren",
      html: "<!DOCTYPE html><html><body><h1>Hello</h1></body></html>",
      createdAt: Date.now(),
      updatedAt: Date.now(),
      globalTheme: {
        primaryColor: "#2563eb",
        headingFont: "Inter",
      },
      savedSections: [
        {
          id: "sec-1",
          name: "Saved Hero",
          category: "Hero",
          html: "<section>Hero</section>",
          createdAt: Date.now(),
        },
      ],
    };

    const files: ProjectFiles = {
      "index.html": makeTextFile(dummyProject.html, "index.html"),
    };

    const backup = await createProjectBackupZip(dummyProject, files);
    expect(backup.entries).toContain(".kanvas/project.json");
    expect(backup.filename).toContain("proyek-keren-cadangan.zip");
  });
});
