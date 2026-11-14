/**
 * Safely parse HTML documents for quality auditing without triggering
 * Happy-DOM or browser external resource fetch side-effects.
 */
export function parseHtmlDocument(html: string): Document {
  if (typeof DOMParser === "undefined") {
    throw new Error("DOMParser is not available in the current environment.");
  }

  // Happy-DOM attempts to load stylesheets asynchronously when rel="stylesheet" is parsed,
  // which logs "Failed to load external stylesheet. CSS file loading is disabled."
  // Neutralize rel="stylesheet" into data-audit-rel="stylesheet" during static parsing.
  const safeHtml = html.replace(
    /\brel=(["'])stylesheet\1/gi,
    'rel=$1stylesheet-audit$1 data-audit-rel=$1stylesheet$1'
  );

  const parser = new DOMParser();
  const doc = parser.parseFromString(safeHtml, "text/html");

  // Ensure deterministic ve-* IDs exist for canvas selection,
  // aligned with buildPreviewDocument from lib/html.ts
  if (doc.body) {
    const bodyElements = [doc.body, ...Array.from(doc.body.querySelectorAll("*"))];
    bodyElements.forEach((element, index) => {
      if (!element.hasAttribute("data-ve-id")) {
        element.setAttribute("data-ve-id", `ve-${index}`);
      }
    });
  }

  return doc;
}
