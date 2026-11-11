import { buildPreviewDocument } from "@/lib/html";
import {
  getTextFile,
  isCssPath,
  isHtmlPath,
  projectFileUrl,
  resolveProjectReference,
  type ProjectFile,
  type ProjectFiles,
} from "@/lib/project-files";

export interface ProjectPreview {
  srcDoc: string;
  urls: string[];
}

const CSS_URL_PATTERN = /url\(\s*(['"]?)(.*?)\1\s*\)/gi;

function withHash(url: string, hash: string): string {
  return hash ? `${url}${hash}` : url;
}

function resolveAssetUrl(
  fromPath: string,
  reference: string,
  urlMap: Map<string, string>,
): string | null {
  const resolved = resolveProjectReference(fromPath, reference);
  if (!resolved) return null;
  const url = urlMap.get(resolved.path);
  return url ? withHash(url, resolved.hash) : null;
}

function rewriteCssUrls(
  css: string,
  fromPath: string,
  urlMap: Map<string, string>,
): string {
  return css.replace(CSS_URL_PATTERN, (match, quote: string, raw: string) => {
    const url = resolveAssetUrl(fromPath, raw, urlMap);
    if (!url) return match;
    const wrapper = quote || '"';
    return `url(${wrapper}${url}${wrapper})`;
  });
}

function rewriteSrcset(
  value: string,
  fromPath: string,
  urlMap: Map<string, string>,
): string {
  return value
    .split(",")
    .map((entry) => {
      const trimmed = entry.trim();
      if (!trimmed) return trimmed;
      const parts = trimmed.split(/\s+/);
      const url = resolveAssetUrl(fromPath, parts[0], urlMap);
      if (url) parts[0] = url;
      return parts.join(" ");
    })
    .filter(Boolean)
    .join(", ");
}

function rewriteAttribute(
  element: Element,
  attribute: string,
  fromPath: string,
  urlMap: Map<string, string>,
): void {
  const raw = element.getAttribute(attribute);
  if (!raw) return;
  const url = resolveAssetUrl(fromPath, raw, urlMap);
  if (url) element.setAttribute(attribute, url);
}

function rewriteHtmlDocument(
  html: string,
  htmlPath: string,
  urlMap: Map<string, string>,
): string {
  const doc = new DOMParser().parseFromString(html, "text/html");

  doc.querySelectorAll("link[href]").forEach((element) => {
    const rel = (element.getAttribute("rel") ?? "").toLowerCase();
    if (
      rel.split(/\s+/).some((part) =>
        ["stylesheet", "icon", "preload", "modulepreload"].includes(part),
      )
    ) {
      rewriteAttribute(element, "href", htmlPath, urlMap);
    }
  });

  doc.querySelectorAll("script[src]").forEach((element) => {
    rewriteAttribute(element, "src", htmlPath, urlMap);
  });

  doc
    .querySelectorAll(
      "img[src], source[src], video[src], audio[src], track[src], embed[src], input[src]",
    )
    .forEach((element) => {
      if (element.tagName.toLowerCase() === "img") {
        const source = element.getAttribute("src");
        if (source) element.setAttribute("data-ve-source-src", source);
      }
      rewriteAttribute(element, "src", htmlPath, urlMap);
    });

  doc.querySelectorAll("object[data]").forEach((element) => {
    rewriteAttribute(element, "data", htmlPath, urlMap);
  });

  doc.querySelectorAll("video[poster]").forEach((element) => {
    rewriteAttribute(element, "poster", htmlPath, urlMap);
  });

  doc.querySelectorAll("img[srcset], source[srcset]").forEach((element) => {
    const value = element.getAttribute("srcset");
    if (value) {
      element.setAttribute(
        "srcset",
        rewriteSrcset(value, htmlPath, urlMap),
      );
    }
  });

  doc.querySelectorAll("style").forEach((element) => {
    element.textContent = rewriteCssUrls(
      element.textContent ?? "",
      htmlPath,
      urlMap,
    );
  });

  doc.querySelectorAll("[style]").forEach((element) => {
    const value = element.getAttribute("style");
    if (value) {
      element.setAttribute(
        "style",
        rewriteCssUrls(value, htmlPath, urlMap),
      );
    }
  });

  const doctype = doc.doctype
    ? new XMLSerializer().serializeToString(doc.doctype)
    : "<!DOCTYPE html>";
  return `${doctype}\n${doc.documentElement.outerHTML}`;
}

/**
 * Builds a preview document with all local references replaced by in-memory
 * blob URLs. The caller owns the returned URLs and must revoke them when the
 * preview is replaced or the editor closes.
 */
export function buildProjectPreview(
  files: ProjectFiles,
  htmlPath: string,
): ProjectPreview {
  const html = getTextFile(files, htmlPath);
  if (!html) {
    throw new Error("Halaman HTML aktif tidak ditemukan.");
  }
  if (!isHtmlPath(htmlPath)) {
    throw new Error("File aktif bukan halaman HTML.");
  }

  const urls: string[] = [];
  const urlMap = new Map<string, string>();

  const makeUrl = (path: string, file: ProjectFile): string => {
    const url = URL.createObjectURL(projectFileUrl(file));
    urls.push(url);
    urlMap.set(path, url);
    return url;
  };

  try {
    // Aset non-CSS lebih dulu agar URL-nya tersedia saat url() di CSS ditulis
    // ulang. File CSS dibuat setelahnya karena isinya ikut ditransformasi.
    for (const [path, file] of Object.entries(files)) {
      if (isHtmlPath(path) || isCssPath(path)) continue;
      makeUrl(path, file);
    }

    for (const [path, file] of Object.entries(files)) {
      if (!isCssPath(path) || file.kind !== "text") continue;
      const rewritten = rewriteCssUrls(file.content, path, urlMap);
      const url = URL.createObjectURL(
        new Blob([rewritten], { type: file.mime }),
      );
      urls.push(url);
      urlMap.set(path, url);
    }

    const transformed = rewriteHtmlDocument(html, htmlPath, urlMap);
    return { srcDoc: buildPreviewDocument(transformed), urls };
  } catch (error) {
    for (const url of urls) URL.revokeObjectURL(url);
    throw error;
  }
}

export function revokePreviewUrls(urls: string[]): void {
  for (const url of urls) {
    try {
      URL.revokeObjectURL(url);
    } catch {
      // URL mungkin sudah dibersihkan browser.
    }
  }
}
