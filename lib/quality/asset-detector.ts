import type { AuditIssue, PassedCheck } from "./types";
import { parseHtmlDocument } from "./parser";
import {
  isExternalReference,
  resolveProjectReference,
  type ProjectFiles,
} from "@/lib/project-files";

const CSS_URL_REGEX = /url\(\s*(?:['"]?)([^'")]+)(?:['"]?)\s*\)/gi;

/**
 * Detects missing local images, stylesheets, scripts, background images, fonts, and internal links.
 * Ignores valid external resources (http, https, data, mailto, tel, blob, //).
 */
export function detectBrokenAssets(
  files: ProjectFiles,
  activeHtmlPath: string = "index.html",
): { issues: AuditIssue[]; passedChecks: PassedCheck[] } {
  const issues: AuditIssue[] = [];
  const passedChecks: PassedCheck[] = [];

  const htmlFile = files[activeHtmlPath];
  if (!htmlFile || htmlFile.kind !== "text" || typeof DOMParser === "undefined") {
    return { issues, passedChecks };
  }

  const doc = parseHtmlDocument(htmlFile.content);

  let totalImagesChecked = 0;
  let totalStylesheetsChecked = 0;
  let totalScriptsChecked = 0;
  let totalLinksChecked = 0;

  // 1. Check Images (<img> and <source>)
  const images = doc.querySelectorAll("img");
  images.forEach((img, idx) => {
    const src = img.getAttribute("src")?.trim();
    if (!src || isExternalReference(src)) return;

    totalImagesChecked++;
    const resolved = resolveProjectReference(activeHtmlPath, src);
    if (!resolved || !files[resolved.path]) {
      issues.push({
        id: `${activeHtmlPath}-broken-img-${idx}`,
        category: "assets",
        severity: "error",
        title: `Berkas gambar lokal tidak ditemukan: "${src}"`,
        description: `Gambar merujuk ke path lokal "${src}" (diselesaikan ke "${resolved?.path || src}"), namun berkas ini tidak ada di dalam proyek.`,
        suggestedCorrection: `Unggah file "${resolved?.path || src}" ke dalam proyek atau perbaiki path sumber pada atribut src.`,
        filePath: activeHtmlPath,
        elementId: img.getAttribute("data-ve-id") || undefined,
        tag: "img",
        selector: `img[src="${src}"]`,
      });
    }
  });

  // Check <source srcset="..."> inside <picture>
  const sources = doc.querySelectorAll("source[srcset]");
  sources.forEach((source, idx) => {
    const srcset = source.getAttribute("srcset")?.trim();
    if (!srcset) return;
    const parts = srcset.split(",").map((s) => s.trim().split(/\s+/)[0]);
    parts.forEach((src) => {
      if (!src || isExternalReference(src)) return;
      totalImagesChecked++;
      const resolved = resolveProjectReference(activeHtmlPath, src);
      if (!resolved || !files[resolved.path]) {
        issues.push({
          id: `${activeHtmlPath}-broken-source-${idx}`,
          category: "assets",
          severity: "error",
          title: `Gambar srcset lokal tidak ditemukan: "${src}"`,
          description: `Elemen <source> merujuk ke "${src}", namun berkas tidak ditemukan di proyek.`,
          suggestedCorrection: `Pastikan berkas "${resolved?.path || src}" telah diimpor ke proyek.`,
          filePath: activeHtmlPath,
          elementId: source.getAttribute("data-ve-id") || undefined,
          tag: "source",
          selector: `source`,
        });
      }
    });
  });

  // 2. Check Linked Stylesheets (<link rel="stylesheet">)
  const stylesheetLinks = doc.querySelectorAll('link[rel~="stylesheet" i], link[rel~="stylesheet-audit" i], link[data-audit-rel~="stylesheet" i]');
  stylesheetLinks.forEach((link, idx) => {
    const href = link.getAttribute("href")?.trim();
    if (!href || isExternalReference(href)) return;

    totalStylesheetsChecked++;
    const resolved = resolveProjectReference(activeHtmlPath, href);
    if (!resolved || !files[resolved.path]) {
      issues.push({
        id: `${activeHtmlPath}-broken-css-${idx}`,
        category: "assets",
        severity: "error",
        title: `Berkas stylesheet CSS tidak ditemukan: "${href}"`,
        description: `Tag <link> memanggil stylesheet "${href}" (path: "${resolved?.path || href}"), namun berkas ini tidak tersedia di dalam proyek.`,
        suggestedCorrection: `Buat file CSS dengan nama "${resolved?.path || href}" atau perbarui atribut href.`,
        filePath: activeHtmlPath,
        elementId: link.getAttribute("data-ve-id") || undefined,
        tag: "link",
        selector: `link[href="${href}"]`,
      });
    }
  });

  // 3. Check Local JavaScript References (<script src="...">)
  const scripts = doc.querySelectorAll("script[src]");
  scripts.forEach((script, idx) => {
    const src = script.getAttribute("src")?.trim();
    if (!src || isExternalReference(src)) return;

    totalScriptsChecked++;
    const resolved = resolveProjectReference(activeHtmlPath, src);
    if (!resolved || !files[resolved.path]) {
      issues.push({
        id: `${activeHtmlPath}-broken-script-${idx}`,
        category: "assets",
        severity: "error",
        title: `Berkas skrip JavaScript tidak ditemukan: "${src}"`,
        description: `Tag <script> memanggil berkas "${src}", namun berkas ini tidak ada di dalam proyek.`,
        suggestedCorrection: `Tambahkan file JavaScript "${resolved?.path || src}" ke dalam proyek.`,
        filePath: activeHtmlPath,
        elementId: script.getAttribute("data-ve-id") || undefined,
        tag: "script",
        selector: `script[src="${src}"]`,
      });
    }
  });

  // 4. Check Internal Links to other pages (<a href="page.html">)
  const links = doc.querySelectorAll("a[href]");
  links.forEach((a, idx) => {
    const href = a.getAttribute("href")?.trim();
    if (!href || isExternalReference(href)) return;

    totalLinksChecked++;
    const resolved = resolveProjectReference(activeHtmlPath, href);
    if (!resolved || !files[resolved.path]) {
      issues.push({
        id: `${activeHtmlPath}-broken-page-link-${idx}`,
        category: "links",
        severity: "error",
        title: `Tautan ke halaman internal rusak: "${href}"`,
        description: `Tautan mengarah ke halaman "${href}" ("${resolved?.path || href}"), namun halaman tersebut tidak ada di dalam proyek multi-halaman ini.`,
        suggestedCorrection: `Buat halaman baru bernama "${resolved?.path || href}" via Manajer Halaman, atau perbaiki nilai href tautan ini.`,
        filePath: activeHtmlPath,
        elementId: a.getAttribute("data-ve-id") || undefined,
        tag: "a",
        selector: `a[href="${href}"]`,
      });
    } else if (resolved.hash) {
      // Internal link exists, but let's verify if the hash exists on target page!
      const targetHashId = resolved.hash.slice(1);
      if (targetHashId) {
        const targetFile = files[resolved.path];
        if (targetFile && targetFile.kind === "text") {
          const targetDoc = parseHtmlDocument(targetFile.content);
          if (!targetDoc.getElementById(targetHashId)) {
            issues.push({
              id: `${activeHtmlPath}-broken-page-hash-${idx}`,
              category: "links",
              severity: "warning",
              title: `Target anchor #${targetHashId} tidak ditemukan di "${resolved.path}"`,
              description: `Tautan menuju ke "${href}", namun elemen dengan id="${targetHashId}" tidak ditemukan pada halaman tujuan.`,
              suggestedCorrection: `Pastikan elemen tujuan pada "${resolved.path}" memiliki id="${targetHashId}".`,
              filePath: activeHtmlPath,
              elementId: a.getAttribute("data-ve-id") || undefined,
              tag: "a",
              selector: `a[href="${href}"]`,
            });
          }
        }
      }
    }
  });

  // 5. Check CSS url(...) in <style> and inline style attributes
  const checkCssUrls = (cssText: string, contextDescription: string, elementId?: string) => {
    let match: RegExpExecArray | null;
    CSS_URL_REGEX.lastIndex = 0;
    while ((match = CSS_URL_REGEX.exec(cssText)) !== null) {
      const urlTarget = match[1].trim();
      if (!urlTarget || isExternalReference(urlTarget)) continue;

      const resolved = resolveProjectReference(activeHtmlPath, urlTarget);
      if (!resolved || !files[resolved.path]) {
        issues.push({
          id: `${activeHtmlPath}-broken-css-url-${Math.random().toString(36).substring(2, 8)}`,
          category: "assets",
          severity: "error",
          title: `Aset CSS url() tidak ditemukan: "${urlTarget}"`,
          description: `Referensi gambar/font dalam CSS (${contextDescription}) merujuk ke "${urlTarget}", namun berkas tidak ditemukan di proyek.`,
          suggestedCorrection: `Unggah berkas "${resolved?.path || urlTarget}" ke proyek atau sesuaikan path url().`,
          filePath: activeHtmlPath,
          elementId,
          tag: "style",
        });
      }
    }
  };

  // Inspect <style> elements inside document
  doc.querySelectorAll("style").forEach((styleEl, idx) => {
    checkCssUrls(styleEl.textContent || "", `tag <style> #${idx + 1}`);
  });

  // Inspect elements with inline style="..."
  doc.querySelectorAll("[style*='url(']").forEach((el) => {
    const inline = el.getAttribute("style") || "";
    checkCssUrls(inline, `atribut style pada <${el.tagName.toLowerCase()}>`, el.getAttribute("data-ve-id") || undefined);
  });

  // Passed Checks reporting
  if (totalImagesChecked > 0 && issues.filter((i) => i.tag === "img" && i.category === "assets").length === 0) {
    passedChecks.push({
      id: `${activeHtmlPath}-assets-images-ok`,
      category: "assets",
      title: "Semua Gambar Lokal Tersedia",
      description: `${totalImagesChecked} gambar lokal berhasil diresolusi di dalam proyek.`,
    });
  }

  if (totalStylesheetsChecked > 0 && issues.filter((i) => i.tag === "link" && i.category === "assets").length === 0) {
    passedChecks.push({
      id: `${activeHtmlPath}-assets-css-ok`,
      category: "assets",
      title: "Semua File CSS Lokal Ditemukan",
      description: `${totalStylesheetsChecked} file stylesheet lokal terhubung dengan baik.`,
    });
  }

  if (totalLinksChecked > 0 && issues.filter((i) => i.category === "links" && i.severity === "error").length === 0) {
    passedChecks.push({
      id: `${activeHtmlPath}-links-ok`,
      category: "links",
      title: "Semua Tautan Halaman Internal Valid",
      description: `${totalLinksChecked} tautan mengarah ke halaman yang sah di dalam proyek.`,
    });
  }

  return { issues, passedChecks };
}
