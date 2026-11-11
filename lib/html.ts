import { BRIDGE_SCRIPT } from "@/lib/bridge";
import {
  CSS_PROPERTIES,
  type ElementStyle,
  type StyleKey,
} from "@/lib/editor-messages";
import {
  getTextFile,
  isHtmlPath,
  makeTextFile,
  relativeProjectReference,
  resolveProjectReference,
  type ProjectFiles,
} from "@/lib/project-files";

function parse(html: string): Document {
  return new DOMParser().parseFromString(html, "text/html");
}

function bodyElements(doc: Document): Element[] {
  const body = doc.body;
  if (!body) return [];
  return [body, ...Array.from(body.querySelectorAll("*"))];
}

function assignIds(doc: Document): void {
  doc.querySelectorAll("[data-ve-id]").forEach((element) => {
    element.removeAttribute("data-ve-id");
  });

  // ID hanya diberikan pada isi <body>. Menambah <link>/<style> di <head>
  // tidak boleh menggeser ID elemen yang sedang dipilih.
  bodyElements(doc).forEach((element, index) => {
    element.setAttribute("data-ve-id", `ve-${index}`);
  });
}

function stripEditorArtifacts(doc: Document): void {
  doc.querySelectorAll(
    "[data-ve-bridge], [data-ve-ui], #__ve_bridge__, #__ve_label, #__ve_toolbar",
  ).forEach((element) => element.remove());

  doc.querySelectorAll("*").forEach((element) => {
    const attributes = Array.from(element.attributes);
    for (const attribute of attributes) {
      if (attribute.name.startsWith("data-ve-")) {
        element.removeAttribute(attribute.name);
      }
    }
  });
}

function serialize(doc: Document): string {
  return `<!DOCTYPE html>\n${doc.documentElement.outerHTML}`;
}

function docWithIds(html: string): Document {
  const doc = parse(html);
  assignIds(doc);
  return doc;
}

function findById(doc: Document, id: string): Element | null {
  if (!/^ve-\d{1,8}$/.test(id)) return null;
  return doc.querySelector(`[data-ve-id="${id}"]`);
}

function clearEditorAttributes(element: Element): void {
  const nodes = [element, ...Array.from(element.querySelectorAll("*"))];
  for (const node of nodes) {
    for (const attribute of Array.from(node.attributes)) {
      if (attribute.name.startsWith("data-ve-")) {
        node.removeAttribute(attribute.name);
      }
    }
  }
}

function clearIdAttributes(element: Element): void {
  const nodes = [element, ...Array.from(element.querySelectorAll("[id]"))];
  for (const node of nodes) {
    node.removeAttribute("id");
  }
}

export function cleanEditorArtifacts(html: string): string {
  const doc = parse(html);
  stripEditorArtifacts(doc);
  return serialize(doc);
}

export function buildPreviewDocument(html: string): string {
  const doc = docWithIds(html);

  // CSP milik halaman bisa memblokir bridge inline. Atribut ini hanya
  // dihapus pada dokumen preview, bukan pada HTML sumber.
  doc.querySelectorAll('meta[http-equiv]').forEach((meta) => {
    const directive = meta.getAttribute("http-equiv")?.toLowerCase();
    if (directive === "content-security-policy") meta.remove();
  });

  const script = doc.createElement("script");
  script.id = "__ve_bridge__";
  script.setAttribute("data-ve-bridge", "");
  script.textContent = BRIDGE_SCRIPT;
  doc.body.appendChild(script);

  return serialize(doc);
}

export function updateElementSource(
  html: string,
  id: string,
  updater: (element: Element) => void,
): string | null {
  const doc = docWithIds(html);
  const element = findById(doc, id);
  if (!element) return null;

  updater(element);
  stripEditorArtifacts(doc);
  return serialize(doc);
}

export function updateElementStyle(
  html: string,
  id: string,
  styles: Partial<ElementStyle>,
): string | null {
  return updateElementSource(html, id, (element) => {
    const style = (element as HTMLElement).style;
    for (const key of Object.keys(styles) as StyleKey[]) {
      const value = styles[key];
      if (value === undefined) continue;
      const property = CSS_PROPERTIES[key];
      if (value.trim()) {
        style.setProperty(property, value.trim());
      } else {
        style.removeProperty(property);
      }
    }
  });
}

export function clearElementInlineStyles(
  html: string,
  id: string,
  keys: StyleKey[],
): string | null {
  return updateElementSource(html, id, (element) => {
    const style = (element as HTMLElement).style;
    for (const key of keys) {
      style.removeProperty(CSS_PROPERTIES[key]);
    }
  });
}

export function updateElementText(
  html: string,
  id: string,
  text: string,
): string | null {
  return updateElementSource(html, id, (element) => {
    element.textContent = text;
  });
}

export function updateElementHref(
  html: string,
  id: string,
  href: string,
): string | null {
  return updateElementSource(html, id, (element) => {
    const tag = element.tagName.toLowerCase();
    if (tag !== "a" && tag !== "button") return;
    const value = href.trim();
    if (value) element.setAttribute("href", value);
    else element.removeAttribute("href");
    element.removeAttribute("data-href");
  });
}

export function updateElementImageSource(
  html: string,
  id: string,
  src: string,
): string | null {
  return updateElementSource(html, id, (element) => {
    if (element.tagName.toLowerCase() !== "img") return;
    const value = src.trim();
    if (value) element.setAttribute("src", value);
    else element.removeAttribute("src");
    element.removeAttribute("srcset");
    element.removeAttribute("sizes");
  });
}

export function deleteElement(html: string, id: string): string | null {
  const doc = docWithIds(html);
  const element = findById(doc, id);
  if (!element || element === doc.body) return null;

  element.remove();
  stripEditorArtifacts(doc);
  return serialize(doc);
}

export function getElementHtml(html: string, id: string): string | null {
  const doc = docWithIds(html);
  const element = findById(doc, id);
  if (!element) return null;

  const clone = element.cloneNode(true) as Element;
  const wrappers = [clone, ...Array.from(clone.querySelectorAll("*"))];
  for (const node of wrappers) {
    for (const attribute of Array.from(node.attributes)) {
      if (attribute.name.startsWith("data-ve-")) {
        node.removeAttribute(attribute.name);
      }
    }
  }
  return clone.outerHTML;
}

export class AiMergeError extends Error {}

export function replaceElementWithHtml(
  html: string,
  id: string,
  fragment: string,
): string {
  if (/<\s*(?:!doctype|html|head|body)\b/i.test(fragment)) {
    throw new AiMergeError("AI mengembalikan dokumen penuh, bukan satu elemen.");
  }

  const doc = docWithIds(html);
  const target = findById(doc, id);
  if (!target) {
    throw new AiMergeError("Elemen yang dipilih sudah tidak ada.");
  }

  const fragmentDoc = parse(fragment);
  const roots = Array.from(fragmentDoc.body.children);
  if (roots.length !== 1) {
    throw new AiMergeError(
      "Respons AI harus berupa tepat satu elemen HTML untuk elemen terpilih.",
    );
  }

  const imported = document.importNode(roots[0], true);
  clearEditorAttributes(imported);
  target.replaceWith(imported);
  stripEditorArtifacts(doc);
  return serialize(doc);
}

export function normalizePageHtml(html: string): string {
  const doc = parse(html);
  stripEditorArtifacts(doc);
  return serialize(doc);
}

export function getExportHtml(html: string): string {
  const doc = parse(html);
  stripEditorArtifacts(doc);
  return serialize(doc);
}

export function getHtmlSummary(html: string): {
  title: string;
  heading: string;
  elementCount: number;
} {
  try {
    const doc = parse(html);
    const title = doc.querySelector("title")?.textContent?.trim() ?? "";
    const heading =
      (doc.querySelector("h1")?.textContent ?? "").replace(/\s+/g, " ").trim() ||
      (doc.querySelector("h2")?.textContent ?? "").replace(/\s+/g, " ").trim();
    return {
      title,
      heading,
      elementCount: doc.querySelectorAll("*").length,
    };
  } catch {
    return { title: "", heading: "", elementCount: 0 };
  }
}

export interface DomTreeNode {
  id: string;
  tag: string;
  className: string;
  text: string;
  children: DomTreeNode[];
}

const TREE_SKIP_TAGS = new Set([
  "script",
  "style",
  "noscript",
  "template",
  "link",
  "meta",
  "base",
  "title",
]);

function directText(element: Element): string {
  let text = "";
  for (const node of Array.from(element.childNodes)) {
    if (node.nodeType === Node.TEXT_NODE) {
      text += ` ${node.textContent ?? ""}`;
    }
  }
  text = text.replace(/\s+/g, " ").trim();
  if (text) return text;

  const tag = element.tagName.toLowerCase();
  if (tag === "img") {
    return (
      element.getAttribute("alt")?.trim() ||
      element.getAttribute("src")?.split("/").pop() ||
      ""
    );
  }
  if (tag === "input" || tag === "textarea" || tag === "select") {
    return (
      element.getAttribute("placeholder")?.trim() ||
      element.getAttribute("aria-label")?.trim() ||
      ""
    );
  }
  return element.getAttribute("aria-label")?.trim() ?? "";
}

function toTreeNode(element: Element): DomTreeNode | null {
  const tag = element.tagName.toLowerCase();
  if (TREE_SKIP_TAGS.has(tag)) return null;

  const children: DomTreeNode[] = [];
  for (const child of Array.from(element.children)) {
    const node = toTreeNode(child);
    if (node) children.push(node);
  }

  return {
    id: element.getAttribute("data-ve-id") || "",
    tag,
    className: element.getAttribute("class")?.trim() ?? "",
    text: directText(element).slice(0, 120),
    children,
  };
}

export function getDomTree(html: string): DomTreeNode | null {
  if (typeof DOMParser === "undefined") return null;
  const doc = docWithIds(html);
  if (!doc.body) return null;
  return toTreeNode(doc.body);
}

function escapeCssIdentifier(value: string): string {
  if (typeof CSS !== "undefined" && typeof CSS.escape === "function") {
    return CSS.escape(value);
  }
  return value.replace(/[^a-zA-Z0-9_-]/g, (character) => `\\${character}`);
}

function elementIndexInBody(doc: Document, element: Element): number {
  return bodyElements(doc).indexOf(element);
}

export interface StructureResult {
  html: string;
  id: string;
  tag: string;
}

function updateStructure(
  html: string,
  updater: (doc: Document) => Element | null,
): StructureResult | null {
  const doc = docWithIds(html);
  const element = updater(doc);
  if (!element) return null;

  const index = elementIndexInBody(doc, element);
  if (index < 0) return null;

  const tag = element.tagName.toLowerCase();
  stripEditorArtifacts(doc);
  return { html: serialize(doc), id: `ve-${index}`, tag };
}

export type InsertPosition = "inside" | "after";

export type NewElementKind =
  | "text"
  | "heading"
  | "button"
  | "image"
  | "link"
  | "container"
  | "section";

const INSERT_INSIDE_TAGS = new Set([
  "body",
  "div",
  "section",
  "article",
  "main",
  "header",
  "footer",
  "nav",
  "aside",
  "ul",
  "ol",
  "li",
  "dl",
  "form",
  "fieldset",
  "figure",
  "figcaption",
  "blockquote",
  "details",
  "summary",
  "td",
  "th",
  "tr",
  "tbody",
  "thead",
  "tfoot",
  "table",
  "picture",
  "video",
  "audio",
]);

export function canInsertInsideTag(tag: string): boolean {
  return INSERT_INSIDE_TAGS.has(tag.toLowerCase());
}

const PLACEHOLDER_IMAGE =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='500' viewBox='0 0 800 500'%3E%3Crect width='800' height='500' fill='%23e4e4e7'/%3E%3Cpath d='M300 335l78-92 64 74 45-50 110 133H300z' fill='%23a1a1aa'/%3E%3Ccircle cx='300' cy='184' r='38' fill='%23a1a1aa'/%3E%3C/svg%3E";

const NEW_ELEMENT_MARKUP: Record<NewElementKind, string> = {
  text:
    '<p style="margin:0 0 12px;font-size:16px;line-height:1.65;">Teks baru</p>',
  heading:
    '<h2 style="margin:0 0 14px;font-size:28px;line-height:1.2;font-weight:700;letter-spacing:-0.02em;">Judul baru</h2>',
  button:
    '<button type="button" href="#" style="display:inline-flex;align-items:center;justify-content:center;padding:11px 20px;border:0;border-radius:8px;background:#17171c;color:#ffffff;cursor:pointer;font-family:inherit;font-size:14px;font-weight:600;line-height:1;">Tombol</button>',
  image: `<img src="${PLACEHOLDER_IMAGE}" alt="Gambar baru" style="display:block;width:100%;max-width:480px;height:auto;border-radius:12px;" />`,
  link:
    '<a href="#" style="display:inline-flex;align-items:center;gap:6px;color:#2563eb;font-size:15px;font-weight:600;text-decoration:underline;text-underline-offset:3px;">Tautan baru</a>',
  container:
    '<div style="width:100%;max-width:1120px;margin:0 auto;padding:24px;"></div>',
  section:
    '<section style="padding:64px 24px;"><div style="width:100%;max-width:1120px;margin:0 auto;"><h2 style="margin:0 0 14px;font-size:32px;line-height:1.2;font-weight:700;letter-spacing:-0.02em;">Judul section</h2><p style="margin:0;font-size:16px;line-height:1.65;">Tulis deskripsi section di sini.</p></div></section>',
};

export function insertElement(
  html: string,
  id: string | null,
  position: InsertPosition,
  kind: NewElementKind,
): StructureResult | null {
  return updateStructure(html, (doc) => {
    const target = id ? findById(doc, id) : doc.body;
    if (!target) return null;

    const fragmentDoc = parse(NEW_ELEMENT_MARKUP[kind]);
    const roots = Array.from(fragmentDoc.body.children);
    if (roots.length === 0) return null;

    const nodes = roots.map((node) => doc.importNode(node, true));
    const targetTag = target.tagName.toLowerCase();

    if (position === "after" && target !== doc.body) {
      const parent = target.parentElement;
      if (!parent) return null;
      let reference = target.nextSibling;
      for (const node of nodes) {
        parent.insertBefore(node, reference);
      }
      return nodes[0];
    }

    if (target !== doc.body && !canInsertInsideTag(targetTag)) return null;
    for (const node of nodes) target.appendChild(node);
    return nodes[0];
  });
}

export function insertHtmlFragment(
  html: string,
  id: string | null,
  position: InsertPosition,
  fragment: string,
): StructureResult | null {
  return updateStructure(html, (doc) => {
    const target = id ? findById(doc, id) : doc.body;
    if (!target) return null;

    const fragmentDoc = parse(fragment);
    const roots = Array.from(fragmentDoc.body.children);
    if (roots.length === 0) return null;

    const nodes = roots.map((node) => doc.importNode(node, true));
    const targetTag = target.tagName.toLowerCase();

    if (position === "after" && target !== doc.body) {
      const parent = target.parentElement;
      if (!parent) return null;
      const reference = target.nextSibling;
      for (const node of nodes) {
        parent.insertBefore(node, reference);
      }
      return nodes[0];
    }

    if (target !== doc.body && !canInsertInsideTag(targetTag)) return null;
    for (const node of nodes) target.appendChild(node);
    return nodes[0];
  });
}

export function duplicateElement(
  html: string,
  id: string,
): StructureResult | null {
  return updateStructure(html, (doc) => {
    const element = findById(doc, id);
    if (!element || element === doc.body) return null;

    const clone = element.cloneNode(true) as Element;
    clearEditorAttributes(clone);
    clearIdAttributes(clone);
    element.after(clone);
    return clone;
  });
}

export function moveElement(
  html: string,
  id: string,
  direction: "up" | "down",
): StructureResult | null {
  return updateStructure(html, (doc) => {
    const element = findById(doc, id);
    if (!element || element === doc.body) return null;
    const parent = element.parentElement;
    if (!parent) return null;

    if (direction === "up") {
      const previous = element.previousElementSibling;
      if (!previous) return null;
      parent.insertBefore(element, previous);
      return element;
    }

    const next = element.nextElementSibling;
    if (!next) return null;
    parent.insertBefore(element, next.nextSibling);
    return element;
  });
}

export function moveElementTo(
  html: string,
  sourceId: string,
  targetId: string,
  position: "before" | "after" | "inside",
): StructureResult | null {
  return updateStructure(html, (doc) => {
    const source = findById(doc, sourceId);
    const target = findById(doc, targetId);
    if (!source || !target || source === target || source === doc.body) {
      return null;
    }
    if (source.contains(target)) return null;

    if (position === "inside") {
      if (target !== doc.body && !canInsertInsideTag(target.tagName)) {
        return null;
      }
      target.appendChild(source);
      return source;
    }

    if (target === doc.body) return null;
    const parent = target.parentElement;
    if (!parent) return null;
    if (position === "before") parent.insertBefore(source, target);
    else parent.insertBefore(source, target.nextSibling);
    return source;
  });
}

function selectionPath(doc: Document, element: Element): string {
  if (element === doc.body) return "body";

  const parts: string[] = [];
  let current: Element | null = element;
  while (current && current !== doc.body) {
    const parent: Element | null = current.parentElement;
    if (!parent) break;

    const tag = current.tagName.toLowerCase();
    let index = 1;
    let sibling = current.previousElementSibling;
    while (sibling) {
      if (sibling.tagName.toLowerCase() === tag) index += 1;
      sibling = sibling.previousElementSibling;
    }
    parts.unshift(`${tag}:nth-of-type(${index})`);
    current = parent;
  }

  if (current === doc.body) parts.unshift("body");
  return parts.join(" > ");
}

/**
 * Selector stabil untuk menulis aturan CSS responsif elemen tanpa class.
 * Elemen dengan ID unik memakai #id; selain itu memakai jalur nth-of-type.
 */
export function getElementCssSelector(
  html: string,
  id: string,
): string | null {
  const doc = docWithIds(html);
  const element = findById(doc, id);
  if (!element) return null;
  if (element === doc.body) return "body";

  const rawId = element.getAttribute("id");
  if (rawId) {
    const selector = `#${escapeCssIdentifier(rawId)}`;
    try {
      if (doc.querySelectorAll(selector).length === 1) return selector;
    } catch {
      // ID tidak dapat dipakai sebagai selector, lanjut ke jalur elemen.
    }
  }

  return selectionPath(doc, element);
}

function normalizeHref(value: string): string {
  return value.trim().replace(/^\.\//, "");
}

export function ensureStylesheetLink(html: string, href: string): string {
  const doc = parse(html);
  const target = normalizeHref(href);
  const exists = Array.from(doc.querySelectorAll('link[rel][href]')).some(
    (element) => {
      const rel = (element.getAttribute("rel") ?? "").toLowerCase();
      return (
        rel.split(/\s+/).includes("stylesheet") &&
        normalizeHref(element.getAttribute("href") ?? "") === target
      );
    },
  );
  if (exists) return html;

  const head = doc.head;
  if (!head) return html;
  const link = doc.createElement("link");
  link.setAttribute("rel", "stylesheet");
  link.setAttribute("href", href);
  head.appendChild(link);
  return serialize(doc);
}

export function updateInternalLinks(
  files: ProjectFiles,
  oldPath: string,
  newPath: string,
): ProjectFiles {
  const nextFiles = { ...files };
  const htmlPaths = Object.keys(files).filter(isHtmlPath);

  for (const filePath of htmlPaths) {
    const content = getTextFile(files, filePath);
    if (!content) continue;

    const doc = parse(content);
    let modified = false;

    doc.querySelectorAll("a[href], link[href]").forEach((el) => {
      const rawHref = el.getAttribute("href")?.trim();
      if (!rawHref) return;

      const resolved = resolveProjectReference(filePath, rawHref);
      if (resolved && resolved.path === oldPath) {
        const baseRel = relativeProjectReference(filePath, newPath);
        const query = resolved.query || "";
        const hash = resolved.hash || "";
        const nextHref = `${baseRel}${query}${hash}`;
        el.setAttribute("href", nextHref);
        modified = true;
      }
    });

    if (modified) {
      stripEditorArtifacts(doc);
      nextFiles[filePath] = makeTextFile(serialize(doc), filePath);
    }
  }

  return nextFiles;
}

export function createBlankPageHtml(title: string = "Halaman Baru"): string {
  return `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    * { box-sizing: border-box; }
    html, body { margin: 0; min-height: 100%; }
    body {
      min-height: 100vh;
      padding: 32px;
      background-color: #ffffff;
      color: #18181b;
      font-family: Inter, system-ui, -apple-system, sans-serif;
    }
    .container {
      max-width: 960px;
      margin: 0 auto;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>${title}</h1>
    <p>Mulai rancang halaman ini dengan menambahkan elemen dari panel Tambah di sebelah kiri.</p>
  </div>
</body>
</html>`;
}

export interface PageMetadata {
  title: string;
  description: string;
  favicon: string;
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
}

export function getPageMetadata(html: string): PageMetadata {
  const doc = parse(html);
  const title = doc.querySelector("title")?.textContent || "";
  const description =
    doc.querySelector('meta[name="description"]')?.getAttribute("content") || "";
  const favicon =
    doc.querySelector('link[rel~="icon"]')?.getAttribute("href") || "";
  const ogTitle =
    doc.querySelector('meta[property="og:title"]')?.getAttribute("content") || "";
  const ogDescription =
    doc.querySelector('meta[property="og:description"]')?.getAttribute("content") || "";
  const ogImage =
    doc.querySelector('meta[property="og:image"]')?.getAttribute("content") || "";

  return { title, description, favicon, ogTitle, ogDescription, ogImage };
}

export function updatePageMetadata(
  html: string,
  meta: Partial<PageMetadata>,
): string {
  const doc = parse(html);
  let head = doc.head;
  if (!head) {
    head = doc.createElement("head");
    doc.documentElement.insertBefore(head, doc.body);
  }

  if (meta.title !== undefined) {
    let el = head.querySelector("title");
    if (!el) {
      el = doc.createElement("title");
      head.appendChild(el);
    }
    el.textContent = meta.title;
  }

  function setMetaTag(selector: string, attr: "name" | "property", key: string, content?: string) {
    if (content === undefined) return;
    let el = head!.querySelector(selector);
    if (!content.trim()) {
      if (el) el.remove();
      return;
    }
    if (!el) {
      el = doc.createElement("meta");
      el.setAttribute(attr, key);
      head!.appendChild(el);
    }
    el.setAttribute("content", content);
  }

  setMetaTag('meta[name="description"]', "name", "description", meta.description);
  setMetaTag('meta[property="og:title"]', "property", "og:title", meta.ogTitle);
  setMetaTag('meta[property="og:description"]', "property", "og:description", meta.ogDescription);
  setMetaTag('meta[property="og:image"]', "property", "og:image", meta.ogImage);

  if (meta.favicon !== undefined) {
    let favEl = head.querySelector('link[rel~="icon"]');
    if (!meta.favicon.trim()) {
      if (favEl) favEl.remove();
    } else {
      if (!favEl) {
        favEl = doc.createElement("link");
        favEl.setAttribute("rel", "icon");
        head.appendChild(favEl);
      }
      favEl.setAttribute("href", meta.favicon);
    }
  }

  stripEditorArtifacts(doc);
  return serialize(doc);
}

export interface AuditIssue {
  id: string;
  tag: string;
  type: "missing-alt" | "empty-link" | "empty-heading";
  label: string;
  detail: string;
}

export function auditHtml(html: string): AuditIssue[] {
  const doc = docWithIds(html);
  const issues: AuditIssue[] = [];

  doc.querySelectorAll("img").forEach((img) => {
    const id = img.getAttribute("data-ve-id") || "";
    const alt = img.getAttribute("alt");
    if (alt === null || alt.trim() === "") {
      issues.push({
        id,
        tag: "img",
        type: "missing-alt",
        label: "Gambar tanpa atribut alt",
        detail: `Gambar (src="${(img.getAttribute("src") || "").slice(0, 30)}") tidak memiliki deskripsi alt untuk pembaca layar.`,
      });
    }
  });

  doc.querySelectorAll("a").forEach((a) => {
    const id = a.getAttribute("data-ve-id") || "";
    const href = a.getAttribute("href");
    if (!href || href.trim() === "" || href.trim() === "#") {
      const text = a.textContent?.trim() || "Tautan";
      issues.push({
        id,
        tag: "a",
        type: "empty-link",
        label: "Tautan kosong atau tanpa tujuan",
        detail: `Tautan "${text.slice(0, 25)}" memiliki href kosong atau hanya "#".`,
      });
    }
  });

  doc.querySelectorAll("h1, h2, h3, h4, h5, h6").forEach((h) => {
    const id = h.getAttribute("data-ve-id") || "";
    const text = h.textContent?.trim() || "";
    if (!text && h.children.length === 0) {
      issues.push({
        id,
        tag: h.tagName.toLowerCase(),
        type: "empty-heading",
        label: `Judul <${h.tagName.toLowerCase()}> kosong`,
        detail: `Elemen heading tidak memiliki konten teks.`,
      });
    }
  });

  return issues;
}
