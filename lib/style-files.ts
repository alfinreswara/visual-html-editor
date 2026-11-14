import { ensureStylesheetLink } from "@/lib/html";
import type { ElementStyle, StyleScope } from "@/lib/editor-messages";
import { hasStyleRule, upsertStyleRule } from "@/lib/css-rules";
import {
  getReferencedStylesheetPaths,
  getTextFile,
  isHtmlPath,
  makeTextFile,
  relativeProjectReference,
  type ProjectFiles,
} from "@/lib/project-files";
import { generateDesignSystemCss, type GlobalTheme } from "@/lib/design-system";

export type { GlobalTheme };

export interface StyleFileResult {
  files: ProjectFiles;
  cssPath: string;
  html: string;
}

function stylesheetCandidate(htmlPath: string): string {
  const directory = htmlPath.includes("/")
    ? htmlPath.slice(0, htmlPath.lastIndexOf("/") + 1)
    : "";
  return `${directory}styles.css`;
}

/**
 * Writes a style change to an external project stylesheet and links the
 * stylesheet to the active page when needed. Existing class rules are reused
 * so "terapkan ke class" really updates the project CSS, not a duplicate.
 */
export function writeStyleRuleToProject(
  files: ProjectFiles,
  htmlPath: string,
  selector: string,
  styles: Partial<ElementStyle>,
  scope: StyleScope,
  important: boolean,
): StyleFileResult | null {
  const html = getTextFile(files, htmlPath);
  if (html === null) return null;

  const stylesheetPaths = getReferencedStylesheetPaths(files, htmlPath);
  let targetPath: string | undefined;

  for (const path of stylesheetPaths) {
    const css = getTextFile(files, path);
    if (css === null) continue;
    if (
      hasStyleRule(css, selector, "desktop") ||
      hasStyleRule(css, selector, scope)
    ) {
      targetPath = path;
      break;
    }
  }

  targetPath ??= stylesheetPaths[0];

  let nextFiles = files;
  let nextHtml = html;

  if (!targetPath) {
    targetPath = stylesheetCandidate(htmlPath);
    if (!nextFiles[targetPath]) {
      nextFiles = {
        ...nextFiles,
        [targetPath]: makeTextFile("", targetPath),
      };
    }

    const href = relativeProjectReference(htmlPath, targetPath);
    nextHtml = ensureStylesheetLink(nextHtml, href);
    if (nextHtml !== html) {
      nextFiles = {
        ...nextFiles,
        [htmlPath]: makeTextFile(nextHtml, htmlPath),
      };
    }
  }

  const currentCss = getTextFile(nextFiles, targetPath) ?? "";
  const nextCss = upsertStyleRule(
    currentCss,
    selector,
    styles,
    scope,
    important,
  );
  nextFiles = {
    ...nextFiles,
    [targetPath]: makeTextFile(nextCss, targetPath),
  };

  return { files: nextFiles, cssPath: targetPath, html: nextHtml };
}

export const POPULAR_GOOGLE_FONTS = [
  "Inter",
  "Plus Jakarta Sans",
  "Poppins",
  "Roboto",
  "Outfit",
  "Montserrat",
  "Playfair Display",
  "Merriweather",
  "Lora",
  "Space Grotesk",
];

export function buildGoogleFontsUrl(fonts: string[]): string {
  const families = Array.from(new Set(fonts))
    .filter(Boolean)
    .map((f) => `family=${encodeURIComponent(f)}:wght@400;500;600;700`)
    .join("&");
  return families ? `https://fonts.googleapis.com/css2?${families}&display=swap` : "";
}

function synchronizePageFontsAndStylesheet(
  html: string,
  htmlPath: string,
  targetCssPath: string,
  neededFonts: string[],
): string {
  let updatedHtml = html;
  const relHref = relativeProjectReference(htmlPath, targetCssPath);
  updatedHtml = ensureStylesheetLink(updatedHtml, relHref);

  if (typeof DOMParser === "undefined") {
    return updatedHtml;
  }

  const doc = new DOMParser().parseFromString(updatedHtml, "text/html");
  const head = doc.head || doc.documentElement;

  if (neededFonts.length > 0) {
    const firstStyleOrScript = head.querySelector("style, script");
    const insertTarget = firstStyleOrScript || null;

    // 1. Ensure preconnects without duplicates
    const existingPreconnects = Array.from(doc.querySelectorAll('link[rel="preconnect"]'));
    const hasGoogleApis = existingPreconnects.some((link) =>
      link.getAttribute("href")?.includes("fonts.googleapis.com"),
    );
    const hasGstatic = existingPreconnects.some((link) =>
      link.getAttribute("href")?.includes("fonts.gstatic.com"),
    );

    if (!hasGoogleApis) {
      const preconnect1 = doc.createElement("link");
      preconnect1.setAttribute("rel", "preconnect");
      preconnect1.setAttribute("href", "https://fonts.googleapis.com");
      head.insertBefore(preconnect1, insertTarget);
    }
    if (!hasGstatic) {
      const preconnect2 = doc.createElement("link");
      preconnect2.setAttribute("rel", "preconnect");
      preconnect2.setAttribute("href", "https://fonts.gstatic.com");
      preconnect2.setAttribute("crossorigin", "");
      head.insertBefore(preconnect2, insertTarget);
    }

    // 2. Ensure single font link without duplicate
    const fontUrl = buildGoogleFontsUrl(neededFonts);
    const existingFontLinks = Array.from(doc.querySelectorAll("link[data-kanvas-fonts]"));

    // Remove extra duplicate font links if any exist
    if (existingFontLinks.length > 1) {
      for (let i = 1; i < existingFontLinks.length; i++) {
        existingFontLinks[i].remove();
      }
    }

    let fontLink = existingFontLinks[0];
    if (!fontLink) {
      fontLink = doc.createElement("link");
      fontLink.setAttribute("rel", "stylesheet");
      fontLink.setAttribute("data-kanvas-fonts", "");
      head.insertBefore(fontLink, insertTarget);
    }
    fontLink.setAttribute("href", fontUrl);
  } else {
    // If no Google fonts needed, clean up any existing data-kanvas-fonts link
    const existingFontLinks = Array.from(doc.querySelectorAll("link[data-kanvas-fonts]"));
    for (const link of existingFontLinks) {
      link.remove();
    }
  }

  return `<!DOCTYPE html>\n${doc.documentElement.outerHTML}`;
}

export function writeGlobalThemeToProject(
  files: ProjectFiles,
  htmlPath: string,
  theme: GlobalTheme,
): StyleFileResult | null {
  const activeHtml = getTextFile(files, htmlPath);
  if (activeHtml === null) return null;

  const stylesheetPaths = getReferencedStylesheetPaths(files, htmlPath);
  const targetPath = stylesheetPaths[0] || stylesheetCandidate(htmlPath);

  let nextFiles = { ...files };

  if (!nextFiles[targetPath]) {
    nextFiles[targetPath] = makeTextFile("", targetPath);
  }

  // Update theme block in target stylesheet
  const currentCss = getTextFile(nextFiles, targetPath) ?? "";
  const themeBlock = generateDesignSystemCss(theme);

  let updatedCss = currentCss;
  const themeRegex = /\/\* --- KANVAS GLOBAL THEME --- \*\/[\s\S]*?\/\* --- END KANVAS GLOBAL THEME --- \*\//;
  if (themeRegex.test(updatedCss)) {
    updatedCss = updatedCss.replace(themeRegex, themeBlock);
  } else {
    updatedCss = `${themeBlock}\n\n${updatedCss}`;
  }

  nextFiles[targetPath] = makeTextFile(updatedCss, targetPath);

  // Also update any other stylesheets in project that contain the theme block
  for (const [path, file] of Object.entries(nextFiles)) {
    if (path !== targetPath && file.kind === "text" && path.endsWith(".css")) {
      if (themeRegex.test(file.content)) {
        nextFiles[path] = makeTextFile(
          file.content.replace(themeRegex, themeBlock),
          path,
        );
      }
    }
  }

  const neededFonts = [theme.headingFont, theme.bodyFont].filter(
    (f): f is string => Boolean(f && POPULAR_GOOGLE_FONTS.includes(f)),
  );

  // Synchronize ALL HTML pages in project files!
  let nextActiveHtml = activeHtml;
  for (const [path, file] of Object.entries(nextFiles)) {
    if (isHtmlPath(path) && file.kind === "text") {
      const updatedPage = synchronizePageFontsAndStylesheet(
        file.content,
        path,
        targetPath,
        neededFonts,
      );
      nextFiles[path] = makeTextFile(updatedPage, path);
      if (path === htmlPath) {
        nextActiveHtml = updatedPage;
      }
    }
  }

  return { files: nextFiles, cssPath: targetPath, html: nextActiveHtml };
}
