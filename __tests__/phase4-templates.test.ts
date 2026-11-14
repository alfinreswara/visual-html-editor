import { describe, expect, it } from "vitest";
import { BUILTIN_TEMPLATES } from "@/lib/templates/builtin-templates";
import {
  TEMPLATE_CATEGORIES,
  type WebsiteTemplate,
} from "@/lib/templates/types";
import {
  isSafeTemplateFilePath,
  validateTemplateMetadata,
  MAX_TEMPLATE_FILES_COUNT,
  MAX_ZIP_UNCOMPRESSED_BYTES,
} from "@/lib/templates/template-validator";
import { cloneTemplateToProject } from "@/lib/templates/template-cloner";
import {
  saveUserTemplateAsync,
  getUserTemplatesAsync,
  deleteUserTemplateAsync,
  exportTemplateZip,
  importTemplateZip,
} from "@/lib/templates/template-storage";
import { makeTextFile } from "@/lib/project-files";
import JSZip from "jszip";

describe("Phase 4: Template System & Architecture", () => {
  describe("Builtin Templates Collection", () => {
    it("provides at least 8 complete website templates", () => {
      expect(BUILTIN_TEMPLATES.length).toBeGreaterThanOrEqual(8);
    });

    it("covers all primary categories", () => {
      const categoriesFound = new Set(BUILTIN_TEMPLATES.map((t) => t.category));
      expect(categoriesFound.has("SaaS")).toBe(true);
      expect(categoriesFound.has("Business")).toBe(true);
      expect(categoriesFound.has("Agency")).toBe(true);
      expect(categoriesFound.has("Portfolio")).toBe(true);
      expect(categoriesFound.has("E-commerce")).toBe(true);
      expect(categoriesFound.has("Startup")).toBe(true);
      expect(categoriesFound.has("Blog")).toBe(true);
      expect(categoriesFound.has("Creative")).toBe(true);
    });

    it("each template has valid metadata, multi-page structure, CSS, and sections", () => {
      BUILTIN_TEMPLATES.forEach((tpl) => {
        expect(tpl.id).toBeTruthy();
        expect(tpl.name).toBeTruthy();
        expect(tpl.description).toBeTruthy();
        expect(TEMPLATE_CATEGORIES).toContain(tpl.category);
        expect(tpl.entry).toBe("index.html");
        expect(tpl.files["index.html"]).toBeTruthy();
        expect(tpl.files["styles.css"]).toBeTruthy();

        // Must have at least 2 pages (multi-page website)
        expect(tpl.pages.length).toBeGreaterThanOrEqual(2);
        tpl.pages.forEach((page) => {
          expect(page.title).toBeTruthy();
          expect(page.path).toBeTruthy();
          expect(tpl.files[page.path]).toBeDefined();
        });

        // Must have sections breakdown
        expect(tpl.sections.length).toBeGreaterThanOrEqual(3);

        // GlobalTheme design tokens defined
        expect(tpl.globalTheme).toBeDefined();
        expect(tpl.globalTheme?.primaryColor).toBeTruthy();
        expect(tpl.globalTheme?.headingFont).toBeTruthy();
        expect(tpl.globalTheme?.bodyFont).toBeTruthy();
      });
    });

    it("has unique IDs for all built-in templates", () => {
      const ids = BUILTIN_TEMPLATES.map((t) => t.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });
  });

  describe("Template Validator & Security Guards", () => {
    it("accepts safe relative file paths", () => {
      expect(isSafeTemplateFilePath("index.html")).toBe(true);
      expect(isSafeTemplateFilePath("about.html")).toBe(true);
      expect(isSafeTemplateFilePath("css/styles.css")).toBe(true);
      expect(isSafeTemplateFilePath("assets/images/hero.jpg")).toBe(true);
      expect(isSafeTemplateFilePath("components/button.html")).toBe(true);
    });

    it("rejects path traversal attempts with ../", () => {
      expect(isSafeTemplateFilePath("../secret.txt")).toBe(false);
      expect(isSafeTemplateFilePath("css/../../etc/passwd")).toBe(false);
      expect(isSafeTemplateFilePath("..\\windows\\system32")).toBe(false);
    });

    it("rejects absolute paths", () => {
      expect(isSafeTemplateFilePath("/index.html")).toBe(false);
      expect(isSafeTemplateFilePath("/etc/shadow")).toBe(false);
      expect(isSafeTemplateFilePath("C:\\windows\\system32")).toBe(false);
    });

    it("rejects dangerous executable extensions", () => {
      expect(isSafeTemplateFilePath("malware.exe")).toBe(false);
      expect(isSafeTemplateFilePath("script.sh")).toBe(false);
      expect(isSafeTemplateFilePath("setup.bat")).toBe(false);
      expect(isSafeTemplateFilePath("payload.cmd")).toBe(false);
      expect(isSafeTemplateFilePath("binary.bin")).toBe(false);
    });

    it("validates template metadata structure correctly", () => {
      const validMeta: Partial<WebsiteTemplate> = {
        id: "test-template",
        name: "Test Template",
        description: "A test description",
        category: "SaaS",
        entry: "index.html",
        pages: [{ title: "Home", path: "index.html" }],
        sections: ["Hero", "Features"],
      };

      const result = validateTemplateMetadata(validMeta);
      expect(result.valid).toBe(true);
      expect(result.metadata?.id).toBe("test-template");
    });

    it("rejects metadata with invalid category or missing fields", () => {
      expect(
        validateTemplateMetadata({
          name: "No ID",
          category: "SaaS",
          entry: "index.html",
        }).valid,
      ).toBe(false);

      expect(
        validateTemplateMetadata({
          id: "test",
          name: "Test",
          category: "InvalidCategory" as any,
          entry: "index.html",
        }).valid,
      ).toBe(false);

      expect(
        validateTemplateMetadata({
          id: "test",
          name: "",
          category: "SaaS",
          entry: "index.html",
        }).valid,
      ).toBe(false);
    });
  });

  describe("Template Cloner & Isolation", () => {
    it("creates an independent project from template", () => {
      const template = BUILTIN_TEMPLATES[0]; // SaaS template
      const projectName = "My SaaS Startup";

      const project = cloneTemplateToProject(template, projectName);

      expect(project.id).toBeTruthy();
      expect(project.id).not.toBe(template.id);
      expect(project.name).toBe(projectName);
      expect(project.entry).toBe(template.entry);
      expect(project.source).toBe("template");
      expect(project.fileCount).toBe(Object.keys(template.files).length);
      expect(project.globalTheme).toEqual(template.globalTheme);
      expect(project.pageOrder).toEqual(template.pages.map((p) => p.path));

      // Check all files are copied
      Object.keys(template.files).forEach((filePath) => {
        expect(project.files?.[filePath]).toBeDefined();
        expect(project.files?.[filePath]?.content).toBe(
          template.files[filePath].content,
        );
      });
    });

    it("deeply clones files so project mutations do not mutate template", () => {
      const template = BUILTIN_TEMPLATES[1]; // Business template
      const initialTemplateContent = template.files["index.html"].content;

      const project = cloneTemplateToProject(template, "Modified Business");

      // Mutate project content
      project.files!["index.html"].content = "<h1>Modified Content</h1>";
      project.files!["new-file.html"] = makeTextFile("<p>New</p>", "new-file.html");

      // Template files must remain untouched
      expect(template.files["index.html"].content).toBe(initialTemplateContent);
      expect(template.files["new-file.html"]).toBeUndefined();
    });
  });

  describe("Template Storage (IndexedDB / LocalStorage Fallback)", () => {
    it("can save, retrieve, and delete a custom user template", async () => {
      const customTemplate: WebsiteTemplate = {
        id: "custom-user-tpl-1",
        name: "My Custom Agency",
        description: "Custom agency portfolio created by user",
        category: "Agency",
        entry: "index.html",
        thumbnailGradient: {
          from: "#1e1e24",
          to: "#121216",
          accent: "#3b82f6",
        },
        globalTheme: {},
        tags: ["Kustom", "Agency"],
        pages: [
          { title: "Home", path: "index.html" },
          { title: "Contact", path: "contact.html" },
        ],
        files: {
          "index.html": makeTextFile("<!DOCTYPE html><html><body><h1>Agency</h1></body></html>", "index.html"),
          "contact.html": makeTextFile("<!DOCTYPE html><html><body><h1>Contact</h1></body></html>", "contact.html"),
          "styles.css": makeTextFile("body { font-family: sans-serif; }", "styles.css"),
        },
        sections: ["Hero", "Contact Form"],
        isCustom: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      // Save
      await saveUserTemplateAsync(customTemplate);

      // Retrieve
      const templates = await getUserTemplatesAsync();
      const saved = templates.find((t) => t.id === "custom-user-tpl-1");
      expect(saved).toBeDefined();
      expect(saved?.name).toBe("My Custom Agency");
      expect(saved?.category).toBe("Agency");
      expect(saved?.isCustom).toBe(true);

      // Delete
      await deleteUserTemplateAsync("custom-user-tpl-1");
      const afterDelete = await getUserTemplatesAsync();
      expect(afterDelete.find((t) => t.id === "custom-user-tpl-1")).toBeUndefined();
    });
  });

  describe("Template ZIP Export and Import", () => {
    it("exports template to valid ZIP Blob and imports back with full fidelity", async () => {
      const template = BUILTIN_TEMPLATES[0]; // SaaS template

      // Export as ZIP Blob
      const { blob, filename } = await exportTemplateZip(template);
      expect(blob).toBeInstanceOf(Blob);
      expect(blob.size).toBeGreaterThan(0);
      expect(filename).toContain(".zip");

      // Import the ZIP Blob
      const imported = await importTemplateZip(blob);
      expect(imported.id).toBeTruthy();
      expect(imported.name).toBe(template.name);
      expect(imported.category).toBe(template.category);
      expect(imported.entry).toBe(template.entry);
      expect(imported.isCustom).toBe(true);
      expect(imported.files["index.html"]).toBeDefined();
      expect(imported.files["styles.css"]).toBeDefined();
      expect(imported.pages.length).toBe(template.pages.length);
    });

    it("rejects malicious ZIP with path traversal", async () => {
      const zip = new JSZip();
      const meta = {
        id: "evil-template",
        name: "Evil Template",
        description: "Hacked",
        category: "SaaS",
        entry: "index.html",
        pages: [{ title: "Home", path: "index.html" }],
        sections: ["Hero"],
      };

      zip.file(".kanvas/template.json", JSON.stringify(meta));
      zip.file("index.html", "<h1>Hello</h1>");

      // Verify path traversal security guard
      expect(isSafeTemplateFilePath("../evil-escape.txt")).toBe(false);
      expect(isSafeTemplateFilePath("nested/../../etc/passwd")).toBe(false);
      expect(isSafeTemplateFilePath("/absolute/path.html")).toBe(false);

      // Inject un-sanitized traversal path into zip entry
      (zip.files as any)["../evil-escape.txt"] = {
        name: "../evil-escape.txt",
        dir: false,
        async: () => Promise.resolve("Malicious content outside folder"),
      };

      await expect(importTemplateZip(zip as any)).rejects.toThrow(
        /Jalur file tidak aman atau tipe file tidak diizinkan terdeteksi/i,
      );
    });

    it("rejects malicious ZIP with forbidden executable files", async () => {
      const zip = new JSZip();
      const meta = {
        id: "evil-executable",
        name: "Evil Executable",
        description: "Hacked with exe",
        category: "Startup",
        entry: "index.html",
        pages: [{ title: "Home", path: "index.html" }],
        sections: ["Hero"],
      };

      zip.file(".kanvas/template.json", JSON.stringify(meta));
      zip.file("index.html", "<h1>Hello</h1>");
      zip.file("assets/malware.exe", "MZ executable payload");

      const zipBlob = await zip.generateAsync({ type: "blob" });

      await expect(importTemplateZip(zipBlob)).rejects.toThrow(
        /tipe file tidak diizinkan/i,
      );
    });

    it("rejects ZIP without .kanvas/template.json", async () => {
      const zip = new JSZip();
      zip.file("index.html", "<h1>Just HTML without template metadata</h1>");

      const zipBlob = await zip.generateAsync({ type: "blob" });

      await expect(importTemplateZip(zipBlob)).rejects.toThrow(
        /bukan arsip template Kanvas yang valid/i,
      );
    });
  });
});
