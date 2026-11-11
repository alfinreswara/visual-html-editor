import { ensureStylesheetLink } from "@/lib/html";
import type { ElementStyle, StyleScope } from "@/lib/editor-messages";
import { hasStyleRule, upsertStyleRule } from "@/lib/css-rules";
import {
  getReferencedStylesheetPaths,
  getTextFile,
  makeTextFile,
  relativeProjectReference,
  type ProjectFiles,
} from "@/lib/project-files";

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

export interface GlobalTheme {
  primaryColor?: string;
  textColor?: string;
  headingFont?: string;
  bodyFont?: string;
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

export function writeGlobalThemeToProject(
  files: ProjectFiles,
  htmlPath: string,
  theme: GlobalTheme,
): StyleFileResult | null {
  const html = getTextFile(files, htmlPath);
  if (html === null) return null;

  const stylesheetPaths = getReferencedStylesheetPaths(files, htmlPath);
  const targetPath = stylesheetPaths[0] || stylesheetCandidate(htmlPath);

  let nextFiles = files;
  let nextHtml = html;

  if (!nextFiles[targetPath]) {
    nextFiles = {
      ...nextFiles,
      [targetPath]: makeTextFile("", targetPath),
    };
  }

  const relHref = relativeProjectReference(htmlPath, targetPath);
  nextHtml = ensureStylesheetLink(nextHtml, relHref);

  const neededFonts = [theme.headingFont, theme.bodyFont].filter(
    (f): f is string => Boolean(f && POPULAR_GOOGLE_FONTS.includes(f)),
  );
  if (neededFonts.length > 0 && typeof DOMParser !== "undefined") {
    const doc = new DOMParser().parseFromString(nextHtml, "text/html");
    const head = doc.head || doc.documentElement;
    if (!doc.querySelector('link[href="https://fonts.googleapis.com"]')) {
      const preconnect1 = doc.createElement("link");
      preconnect1.setAttribute("rel", "preconnect");
      preconnect1.setAttribute("href", "https://fonts.googleapis.com");
      head.appendChild(preconnect1);
      const preconnect2 = doc.createElement("link");
      preconnect2.setAttribute("rel", "preconnect");
      preconnect2.setAttribute("href", "https://fonts.gstatic.com");
      preconnect2.setAttribute("crossorigin", "");
      head.appendChild(preconnect2);
    }
    const fontUrl = buildGoogleFontsUrl(neededFonts);
    let fontLink = doc.querySelector("link[data-kanvas-fonts]");
    if (!fontLink) {
      fontLink = doc.createElement("link");
      fontLink.setAttribute("rel", "stylesheet");
      fontLink.setAttribute("data-kanvas-fonts", "");
      head.appendChild(fontLink);
    }
    fontLink.setAttribute("href", fontUrl);
    nextHtml = `<!DOCTYPE html>\n${doc.documentElement.outerHTML}`;
  }

  if (nextHtml !== html) {
    nextFiles = {
      ...nextFiles,
      [htmlPath]: makeTextFile(nextHtml, htmlPath),
    };
  }

  const currentCss = getTextFile(nextFiles, targetPath) ?? "";
  const primary = theme.primaryColor || "#3b82f6";
  const text = theme.textColor || "#17171c";
  const heading = theme.headingFont ? `'${theme.headingFont}', sans-serif` : "system-ui, sans-serif";
  const body = theme.bodyFont ? `'${theme.bodyFont}', sans-serif` : "system-ui, sans-serif";

  const themeBlock = `/* --- KANVAS GLOBAL THEME --- */
:root {
  --primary: ${primary};
  --text: ${text};
  --font-heading: ${heading};
  --font-body: ${body};
}

body {
  color: var(--text);
  font-family: var(--font-body);
}

h1, h2, h3, h4, h5, h6 {
  font-family: var(--font-heading);
}

.btn-primary, button.primary {
  background-color: var(--primary);
  color: #ffffff;
}
/* --- END KANVAS GLOBAL THEME --- */`;

  let updatedCss = currentCss;
  const themeRegex = /\/\* --- KANVAS GLOBAL THEME --- \*\/[\s\S]*?\/\* --- END KANVAS GLOBAL THEME --- \*\//;
  if (themeRegex.test(updatedCss)) {
    updatedCss = updatedCss.replace(themeRegex, themeBlock);
  } else {
    updatedCss = `${themeBlock}\n\n${updatedCss}`;
  }

  nextFiles = {
    ...nextFiles,
    [targetPath]: makeTextFile(updatedCss, targetPath),
  };

  return { files: nextFiles, cssPath: targetPath, html: nextHtml };
}
