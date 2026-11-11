import JSZip from "jszip";
export type ProjectFileKind = "text" | "binary";

export interface ProjectFile {
  kind: ProjectFileKind;
  /** Text content, or base64-encoded bytes for binary files. */
  content: string;
  mime: string;
}

export type ProjectFiles = Record<string, ProjectFile>;

export interface ProjectSummary {
  title: string;
  heading: string;
  elementCount: number;
}

export interface ReferencedStylesheet {
  path: string;
  content: string;
}

export interface ResolvedReference {
  path: string;
  query: string;
  hash: string;
}

const TEXT_EXTENSIONS = new Set([
  "html",
  "htm",
  "css",
  "js",
  "mjs",
  "cjs",
  "jsx",
  "ts",
  "tsx",
  "json",
  "svg",
  "txt",
  "xml",
  "md",
  "map",
  "webmanifest",
]);

const MIME_TYPES: Record<string, string> = {
  html: "text/html;charset=utf-8",
  htm: "text/html;charset=utf-8",
  css: "text/css;charset=utf-8",
  js: "text/javascript;charset=utf-8",
  mjs: "text/javascript;charset=utf-8",
  cjs: "text/javascript;charset=utf-8",
  jsx: "text/javascript;charset=utf-8",
  ts: "text/plain;charset=utf-8",
  tsx: "text/plain;charset=utf-8",
  json: "application/json;charset=utf-8",
  map: "application/json;charset=utf-8",
  webmanifest: "application/manifest+json;charset=utf-8",
  svg: "image/svg+xml;charset=utf-8",
  txt: "text/plain;charset=utf-8",
  xml: "application/xml;charset=utf-8",
  md: "text/markdown;charset=utf-8",
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  gif: "image/gif",
  webp: "image/webp",
  avif: "image/avif",
  ico: "image/x-icon",
  bmp: "image/bmp",
  woff: "font/woff",
  woff2: "font/woff2",
  ttf: "font/ttf",
  otf: "font/otf",
  eot: "application/vnd.ms-fontobject",
  mp4: "video/mp4",
  webm: "video/webm",
  mp3: "audio/mpeg",
  wav: "audio/wav",
  pdf: "application/pdf",
};

const IGNORED_BASENAMES = new Set([".DS_Store", "Thumbs.db"]);

export const MAX_PROJECT_FILES = 500;
export const MAX_PROJECT_TOTAL_BYTES = 40 * 1024 * 1024;

export function fileExtension(path: string): string {
  const name = path.split("/").pop() ?? "";
  const dot = name.lastIndexOf(".");
  if (dot < 0 || dot === name.length - 1) return "";
  return name.slice(dot + 1).toLowerCase();
}

export function mimeForPath(path: string): string {
  return MIME_TYPES[fileExtension(path)] ?? "application/octet-stream";
}

export function isTextExtension(path: string): boolean {
  return TEXT_EXTENSIONS.has(fileExtension(path));
}

export function isHtmlPath(path: string): boolean {
  const extension = fileExtension(path);
  return extension === "html" || extension === "htm";
}

export function isCssPath(path: string): boolean {
  return fileExtension(path) === "css";
}

export function isJavaScriptPath(path: string): boolean {
  return ["js", "mjs", "cjs", "jsx"].includes(fileExtension(path));
}

export function isSvgPath(path: string): boolean {
  return fileExtension(path) === "svg";
}

export function isImagePath(path: string): boolean {
  return ["png", "jpg", "jpeg", "gif", "webp", "avif", "ico", "bmp", "svg"].includes(
    fileExtension(path),
  );
}

export function isFontPath(path: string): boolean {
  return ["woff", "woff2", "ttf", "otf", "eot"].includes(fileExtension(path));
}

export function monacoLanguageForPath(path: string): string {
  switch (fileExtension(path)) {
    case "html":
    case "htm":
      return "html";
    case "css":
      return "css";
    case "js":
    case "mjs":
    case "cjs":
    case "jsx":
      return "javascript";
    case "ts":
      return "typescript";
    case "tsx":
      return "typescript";
    case "json":
    case "map":
    case "webmanifest":
      return "json";
    case "svg":
    case "xml":
      return "xml";
    case "md":
      return "markdown";
    default:
      return "plaintext";
  }
}

export function languageLabelForPath(path: string): string {
  const language = monacoLanguageForPath(path);
  if (language === "javascript") return "JavaScript";
  if (language === "typescript") return "TypeScript";
  if (language === "plaintext") return "Teks";
  return language.toUpperCase();
}

export function normalizeProjectPath(raw: string): string | null {
  const normalizedSlashes = raw.replace(/\\/g, "/").trim();
  if (!normalizedSlashes || normalizedSlashes.endsWith("/")) return null;
  if (normalizedSlashes.includes("\0")) return null;

  const segments: string[] = [];
  for (const segment of normalizedSlashes.split("/")) {
    if (!segment || segment === ".") continue;
    if (segment === "..") {
      if (segments.length === 0) return null;
      segments.pop();
      continue;
    }
    segments.push(segment);
  }

  const path = segments.join("/");
  if (!path || path.length > 320) return null;
  return path;
}

export function shouldIgnoreProjectPath(path: string): boolean {
  const segments = path.split("/");
  if (segments.some((segment) => segment === "__MACOSX" || segment === ".git")) {
    return true;
  }
  const basename = segments[segments.length - 1] ?? "";
  return IGNORED_BASENAMES.has(basename) || basename.startsWith("._");
}

export function makeTextFile(content: string, path: string): ProjectFile {
  return { kind: "text", content, mime: mimeForPath(path) };
}

export function makeBinaryFile(content: string, path: string): ProjectFile {
  return { kind: "binary", content, mime: mimeForPath(path) };
}

export function fileKindForPath(path: string): ProjectFileKind {
  return isTextExtension(path) ? "text" : "binary";
}

export function findEntryHtml(
  files: ProjectFiles,
  preferred?: string | null,
): string | null {
  if (preferred && files[preferred] && isHtmlPath(preferred)) return preferred;

  const htmlPaths = Object.keys(files)
    .filter((path) => isHtmlPath(path) && files[path]?.kind === "text")
    .sort((a, b) => a.localeCompare(b));

  const index = htmlPaths.find((path) => /^index\.html?$/i.test(path));
  if (index) return index;

  const nestedIndex = htmlPaths.find((path) => /(?:^|\/)index\.html?$/i.test(path));
  if (nestedIndex) return nestedIndex;

  return htmlPaths[0] ?? null;
}

export function getTextFile(files: ProjectFiles, path: string): string | null {
  const file = files[path];
  return file?.kind === "text" ? file.content : null;
}

export function isExternalReference(reference: string): boolean {
  const value = reference.trim();
  return (
    !value ||
    value.startsWith("#") ||
    value.startsWith("//") ||
    /^[a-z][a-z0-9+.-]*:/i.test(value)
  );
}

/**
 * Resolves a relative or root-relative reference against the file containing
 * it. Returns null for external URLs, anchors, and paths outside the project.
 */
export function resolveProjectReference(
  fromPath: string,
  reference: string,
): ResolvedReference | null {
  const value = reference.trim();
  if (isExternalReference(value)) return null;

  const hashIndex = value.indexOf("#");
  const hash = hashIndex >= 0 ? value.slice(hashIndex) : "";
  const beforeHash = hashIndex >= 0 ? value.slice(0, hashIndex) : value;
  const queryIndex = beforeHash.indexOf("?");
  const query = queryIndex >= 0 ? beforeHash.slice(queryIndex) : "";
  let target = queryIndex >= 0 ? beforeHash.slice(0, queryIndex) : beforeHash;

  if (!target) return null;

  try {
    target = decodeURI(target);
  } catch {
    // Biarkan path apa adanya bila encoding tidak valid.
  }

  const baseSegments = target.startsWith("/")
    ? []
    : fromPath.split("/").slice(0, -1);
  const combined = target.startsWith("/")
    ? target.replace(/^\/+/, "")
    : [...baseSegments, target].join("/");
  const path = normalizeProjectPath(combined);

  return path ? { path, query, hash } : null;
}

export function getReferencedStylesheetPaths(
  files: ProjectFiles,
  htmlPath: string,
): string[] {
  const html = getTextFile(files, htmlPath);
  if (!html || typeof DOMParser === "undefined") return [];

  const doc = new DOMParser().parseFromString(html, "text/html");
  const seen = new Set<string>();
  const paths: string[] = [];

  doc.querySelectorAll("link[rel][href]").forEach((element) => {
    const rel = (element.getAttribute("rel") ?? "").toLowerCase();
    if (!rel.split(/\s+/).includes("stylesheet")) return;

    const href = element.getAttribute("href");
    if (!href) return;
    const resolved = resolveProjectReference(htmlPath, href);
    if (!resolved || seen.has(resolved.path)) return;
    if (!isCssPath(resolved.path)) return;
    if (files[resolved.path]?.kind !== "text") return;

    seen.add(resolved.path);
    paths.push(resolved.path);
  });

  return paths;
}

/**
 * Relative reference from one project file to another, used for images and
 * stylesheets inserted by the visual editor.
 */
export function relativeProjectReference(
  fromPath: string,
  targetPath: string,
): string {
  const fromSegments = fromPath.split("/").slice(0, -1);
  const targetSegments = targetPath.split("/");
  let common = 0;
  while (
    common < fromSegments.length &&
    common < targetSegments.length - 1 &&
    fromSegments[common] === targetSegments[common]
  ) {
    common += 1;
  }
  const up = fromSegments.length - common;
  return [
    ...Array.from({ length: up }, () => ".."),
    ...targetSegments.slice(common),
  ].join("/");
}

export function getReferencedStylesheets(
  files: ProjectFiles,
  htmlPath: string,
): ReferencedStylesheet[] {
  const html = getTextFile(files, htmlPath);
  if (!html || typeof DOMParser === "undefined") return [];

  const doc = new DOMParser().parseFromString(html, "text/html");
  const seen = new Set<string>();
  const stylesheets: ReferencedStylesheet[] = [];
  let total = 0;

  doc.querySelectorAll('link[rel][href]').forEach((element) => {
    const rel = (element.getAttribute("rel") ?? "").toLowerCase();
    if (!rel.split(/\s+/).includes("stylesheet")) return;

    const href = element.getAttribute("href");
    if (!href) return;
    const resolved = resolveProjectReference(htmlPath, href);
    if (!resolved || seen.has(resolved.path)) return;

    const content = getTextFile(files, resolved.path);
    if (content === null || !isCssPath(resolved.path)) return;

    total += content.length;
    if (total > 300_000) return;

    seen.add(resolved.path);
    stylesheets.push({ path: resolved.path, content });
  });

  return stylesheets;
}

export function projectNameFromFilename(filename: string): string {
  return filename
    .replace(/\.(?:zip|html?)$/i, "")
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function bytesToBase64(bytes: Uint8Array): string {
  let binary = "";
  const chunkSize = 0x8000;
  for (let index = 0; index < bytes.length; index += chunkSize) {
    binary += String.fromCharCode(
      ...bytes.subarray(index, index + chunkSize),
    );
  }
  return btoa(binary);
}

export function base64ToBytes(base64: string): Uint8Array<ArrayBuffer> {
  const binary = atob(base64);
  const bytes = new Uint8Array(new ArrayBuffer(binary.length));
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  return bytes;
}

export function projectFileUrl(file: ProjectFile): Blob {
  if (file.kind === "binary") {
    return new Blob([base64ToBytes(file.content)], { type: file.mime });
  }
  return new Blob([file.content], { type: file.mime });
}

export interface BackupMetadata {
  id?: string;
  name?: string;
  versions?: unknown[];
  pageOrder?: string[];
  globalTheme?: {
    primaryColor?: string;
    textColor?: string;
    headingFont?: string;
    bodyFont?: string;
  };
  activePath?: string;
}

export interface ZipImportResult {
  files: ProjectFiles;
  entry: string;
  totalBytes: number;
  backupMetadata?: BackupMetadata;
}

export async function importProjectZip(file: File): Promise<ZipImportResult> {
  const archive = await JSZip.loadAsync(file);
  const files: ProjectFiles = {};
  let backupMetadata: BackupMetadata | undefined;
  let totalBytes = 0;
  for (const entry of Object.values(archive.files)) {
    if (entry.name === ".kanvas/project.json") {
      try {
        const text = await entry.async("string");
        backupMetadata = JSON.parse(text) as BackupMetadata;
      } catch {
        // Abaikan bila metadata tidak valid
      }
      continue;
    }
    if (entry.dir) continue;
    const path = normalizeProjectPath(entry.name);
    if (!path || shouldIgnoreProjectPath(path)) continue;
    if (Object.keys(files).length >= MAX_PROJECT_FILES) {
      throw new Error(
        `ZIP memiliki terlalu banyak file. Maksimal ${MAX_PROJECT_FILES} file.`,
      );
    }

    const uncompressedSize = (
      entry as unknown as { _data?: { uncompressedSize?: number } }
    )._data?.uncompressedSize;
    if (typeof uncompressedSize === "number") {
      totalBytes += uncompressedSize;
      if (totalBytes > MAX_PROJECT_TOTAL_BYTES) {
        throw new Error("Ukuran isi ZIP terlalu besar. Maksimal 40 MB.");
      }
    }

    if (isTextExtension(path)) {
      const content = await entry.async("string");
      files[path] = makeTextFile(content, path);
    } else {
      const content = await entry.async("base64");
      files[path] = makeBinaryFile(content, path);
    }
  }

  const entry = findEntryHtml(files);
  if (!entry) {
    throw new Error("ZIP harus berisi setidaknya satu file HTML.");
  }

  return { files, entry, totalBytes, backupMetadata };
}
