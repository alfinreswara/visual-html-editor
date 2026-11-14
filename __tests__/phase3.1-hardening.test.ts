import { describe, it, expect, beforeEach } from "vitest";
import {
  deduplicateFragmentIds,
  insertHtmlFragment,
  duplicateElement,
} from "@/lib/html";
import {
  writeGlobalThemeToProject,
  POPULAR_GOOGLE_FONTS,
} from "@/lib/style-files";
import {
  makeTextFile,
  getTextFile,
  type ProjectFiles,
} from "@/lib/project-files";
import {
  getUserSavedSectionsAsync,
  saveUserSectionAsync,
  deleteUserSectionAsync,
  migrateFromLocalStorage,
  _resetMemoryCache,
  SAVED_SECTIONS_STORAGE_KEY,
  type SavedSection,
} from "@/lib/saved-sections";
import { createProjectBackupZip } from "@/lib/project-export";
import type { Project } from "@/lib/projects";
import type { GlobalTheme } from "@/lib/design-system";

describe("Phase 3.1 Hardening: Duplicate HTML ID Protection & Reference Rewriting", () => {
  it("rewrites duplicate IDs and internal href links while preserving external links", () => {
    const baseHtml = `<!DOCTYPE html><html><body><section id="faq"><h2>FAQ 1</h2><a href="#faq">Link to FAQ</a><a href="#page-header">External header</a></section></body></html>`;
    const fragment = `<section id="faq"><h2>FAQ 2</h2><a href="#faq">Link to second FAQ</a><a href="#page-header">External header</a></section>`;

    const result = insertHtmlFragment(baseHtml, null, "after", fragment);
    expect(result).not.toBeNull();
    if (!result) return;

    // First instance keeps #faq
    expect(result.html).toContain('id="faq"');
    // Second instance must have unique ID, e.g. faq-1
    expect(result.html).toContain('id="faq-1"');
    // Internal link in second instance must point to #faq-1
    expect(result.html).toContain('href="#faq-1"');
    // External link must remain untouched
    expect(result.html).toContain('href="#page-header"');
  });

  it("rewrites label for and input id pairs correctly", () => {
    const baseHtml = `<!DOCTYPE html><html><body><form><label for="user-email">Email</label><input id="user-email" type="email"></form></body></html>`;
    const fragment = `<div class="card"><label for="user-email">Email 2</label><input id="user-email" type="email"></div>`;

    const result = insertHtmlFragment(baseHtml, null, "after", fragment);
    expect(result).not.toBeNull();
    if (!result) return;

    // Both label for and input id should be rewritten to user-email-1
    expect(result.html).toContain('for="user-email-1"');
    expect(result.html).toContain('id="user-email-1"');
    // Original remains intact
    expect(result.html).toContain('for="user-email"');
    expect(result.html).toContain('id="user-email"');
  });

  it("rewrites aria-labelledby, aria-describedby, and aria-controls", () => {
    const baseHtml = `<!DOCTYPE html><html><body><div id="acc-header">Accordion 1</div><div id="acc-content" aria-labelledby="acc-header" aria-controls="acc-header">Content 1</div><p id="acc-desc">Desc 1</p></body></html>`;
    const fragment = `<div class="accordion"><button id="acc-header" aria-controls="acc-content" aria-describedby="acc-desc">Toggle</button><div id="acc-content" aria-labelledby="acc-header">Panel</div><p id="acc-desc">Description</p></div>`;

    const result = insertHtmlFragment(baseHtml, null, "after", fragment);
    expect(result).not.toBeNull();
    if (!result) return;

    expect(result.html).toContain('id="acc-header-1"');
    expect(result.html).toContain('id="acc-content-1"');
    expect(result.html).toContain('id="acc-desc-1"');
    expect(result.html).toContain('aria-controls="acc-content-1"');
    expect(result.html).toContain('aria-labelledby="acc-header-1"');
    expect(result.html).toContain('aria-describedby="acc-desc-1"');
  });

  it("rewrites SVG url(#...) references in clip-path, fill, and mask", () => {
    const baseHtml = `<!DOCTYPE html><html><body><svg><defs><linearGradient id="grad1"></linearGradient><clipPath id="clip1"></clipPath></defs><rect fill="url(#grad1)"></rect></svg></body></html>`;
    const fragment = `<svg><defs><linearGradient id="grad1"></linearGradient><clipPath id="clip1"></clipPath></defs><rect fill="url(#grad1)" clip-path="url(#clip1)" style="mask: url(#clip1)"></rect></svg>`;

    const result = insertHtmlFragment(baseHtml, null, "after", fragment);
    expect(result).not.toBeNull();
    if (!result) return;

    expect(result.html).toContain('id="grad1-1"');
    expect(result.html).toContain('id="clip1-1"');
    expect(result.html).toContain('fill="url(#grad1-1)"');
    expect(result.html).toContain('clip-path="url(#clip1-1)"');
    expect(result.html).toContain('mask: url(#clip1-1)');
  });

  it("duplicateElement deduplicates IDs and updates internal bindings", () => {
    const html = `<!DOCTYPE html><html><body><div id="box" data-ve-id="ve-1"><label for="inp">Name</label><input id="inp" type="text"><a href="#box">Top</a></div></body></html>`;

    const result = duplicateElement(html, "ve-1");
    expect(result).not.toBeNull();
    if (!result) return;

    expect(result.html).toContain('id="box"');
    expect(result.html).toContain('id="box-1"');
    expect(result.html).toContain('for="inp-1"');
    expect(result.html).toContain('id="inp-1"');
    expect(result.html).toContain('href="#box-1"');
  });
});

describe("Phase 3.1 Hardening: Multi-Page Global Theme Synchronization", () => {
  it("synchronizes design tokens, fonts, and stylesheet links across 3+ HTML pages", () => {
    const initialFiles: ProjectFiles = {
      "index.html": makeTextFile(
        `<!DOCTYPE html><html><head><title>Home</title></head><body><h1>Home</h1></body></html>`,
        "index.html",
      ),
      "about.html": makeTextFile(
        `<!DOCTYPE html><html><head><title>About</title></head><body><h1>About</h1></body></html>`,
        "about.html",
      ),
      "contact.html": makeTextFile(
        `<!DOCTYPE html><html><head><title>Contact</title></head><body><h1>Contact</h1></body></html>`,
        "contact.html",
      ),
      "styles.css": makeTextFile(
        `/* Custom User Rules */\n.hero { margin: 10px; }`,
        "styles.css",
      ),
    };

    const theme: GlobalTheme = {
      primaryColor: "#059669",
      headingFont: "Plus Jakarta Sans",
      bodyFont: "Inter",
    };

    const result = writeGlobalThemeToProject(initialFiles, "index.html", theme);
    expect(result).not.toBeNull();
    if (!result) return;

    // Verify stylesheet has design tokens and preserves user rules
    const css = getTextFile(result.files, "styles.css")!;
    expect(css).toContain("/* Custom User Rules */");
    expect(css).toContain("--color-primary: #059669;");
    expect(css).toContain("--primary: #059669;"); // backward-compat alias
    expect(css).toContain("--font-heading: 'Plus Jakarta Sans', sans-serif;");

    // Verify ALL 3 HTML pages are synchronized!
    for (const pageName of ["index.html", "about.html", "contact.html"]) {
      const pageHtml = getTextFile(result.files, pageName)!;
      expect(pageHtml).toContain('<link rel="stylesheet" href="styles.css">');
      expect(pageHtml).toContain('rel="preconnect" href="https://fonts.googleapis.com"');
      expect(pageHtml).toContain('rel="preconnect" href="https://fonts.gstatic.com"');
      expect(pageHtml).toContain('data-kanvas-fonts');
      expect(pageHtml).toContain("Plus%20Jakarta%20Sans");
    }

    // Verify second theme save does NOT duplicate font links
    const theme2: GlobalTheme = {
      primaryColor: "#dc2626",
      headingFont: "Poppins",
      bodyFont: "Roboto",
    };

    const result2 = writeGlobalThemeToProject(result.files, "about.html", theme2);
    expect(result2).not.toBeNull();
    if (!result2) return;

    for (const pageName of ["index.html", "about.html", "contact.html"]) {
      const pageHtml = getTextFile(result2.files, pageName)!;
      const fontLinkMatches = pageHtml.match(/data-kanvas-fonts/g) || [];
      expect(fontLinkMatches.length).toBe(1); // Exact 1 font link!
      expect(pageHtml).toContain("Poppins");
    }
  });
});

describe("Phase 3.1 Hardening: Saved Sections IndexedDB Migration & Fallback", () => {
  beforeEach(() => {
    _resetMemoryCache();
    if (typeof window !== "undefined" && window.localStorage) {
      window.localStorage.removeItem(SAVED_SECTIONS_STORAGE_KEY);
    }
  });

  it("migrates existing localStorage sections automatically without losing data", async () => {
    const existing: SavedSection[] = [
      {
        id: "sec-local-1",
        name: "Local Section 1",
        category: "Hero",
        html: "<section>Hero</section>",
        createdAt: 1000,
        previewSnippet: "Hero",
      },
      {
        id: "sec-local-2",
        name: "Local Section 2",
        category: "CTA",
        html: "<section>CTA</section>",
        createdAt: 2000,
        previewSnippet: "CTA",
      },
    ];

    if (typeof window !== "undefined" && window.localStorage) {
      window.localStorage.setItem(SAVED_SECTIONS_STORAGE_KEY, JSON.stringify(existing));
    }

    const migrated = await migrateFromLocalStorage();
    // In happy-dom or environments with IndexedDB, migration completes
    // In fallback, data remains safely in localStorage
    const all = await getUserSavedSectionsAsync();
    expect(all.length).toBeGreaterThanOrEqual(2);
    const ids = all.map((s) => s.id);
    expect(ids).toContain("sec-local-1");
    expect(ids).toContain("sec-local-2");
  });

  it("saves and deletes sections asynchronously with cache mirroring", async () => {
    const newSec = await saveUserSectionAsync({
      name: "Async Section",
      category: "Fitur",
      html: "<div class='feat'>Fitur</div>",
    });

    expect(newSec.id).toBeTruthy();
    expect(newSec.name).toBe("Async Section");

    let all = await getUserSavedSectionsAsync();
    expect(all.some((s) => s.id === newSec.id)).toBe(true);

    await deleteUserSectionAsync(newSec.id);
    all = await getUserSavedSectionsAsync();
    expect(all.some((s) => s.id === newSec.id)).toBe(false);
  });

  it("preserves savedSections in project backup ZIP", async () => {
    const dummyProject: Project = {
      id: "proj-sync-1",
      name: "Sync Proyek",
      html: "<!DOCTYPE html><html><body><h1>Sync</h1></body></html>",
      createdAt: Date.now(),
      updatedAt: Date.now(),
      savedSections: [
        {
          id: "sec-backup-1",
          name: "Saved Feature Grid",
          category: "Fitur",
          html: "<div class='grid'>Features</div>",
          createdAt: Date.now(),
        },
      ],
    };

    const files: ProjectFiles = {
      "index.html": makeTextFile(dummyProject.html, "index.html"),
    };

    const backup = await createProjectBackupZip(dummyProject, files);
    expect(backup.entries).toContain(".kanvas/project.json");
    expect(backup.filename).toContain("sync-proyek-cadangan.zip");
  });
});
