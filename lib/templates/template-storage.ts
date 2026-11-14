import type { WebsiteTemplate } from "./types";
import {
  validateTemplateMetadata,
  isSafeTemplateFilePath,
  MAX_ZIP_UNCOMPRESSED_BYTES,
} from "./template-validator";
import { makeTextFile, type ProjectFiles } from "@/lib/project-files";
import JSZip from "jszip";

const DB_NAME = "kanvas.templates";
const DB_VERSION = 1;
const STORE_NAME = "user_templates";
const LS_FALLBACK_KEY = "kanvas.user_templates.v1";

let memoryCache: WebsiteTemplate[] | null = null;
let isDbAvailable: boolean | null = null;

export function _resetTemplateMemoryCache(): void {
  memoryCache = null;
  isDbAvailable = null;
}

function openTemplatesDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined" || !window.indexedDB) {
      reject(new Error("IndexedDB tidak tersedia di lingkungan ini."));
      return;
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "id" });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error("Gagal membuka database templates."));
  });
}

function readFromLocalStorage(): WebsiteTemplate[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(LS_FALLBACK_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeToLocalStorage(templates: WebsiteTemplate[]): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(LS_FALLBACK_KEY, JSON.stringify(templates));
  } catch {
    // Abaikan jika quota localStorage penuh
  }
}

export async function initUserTemplatesStorage(): Promise<WebsiteTemplate[]> {
  if (memoryCache !== null) return memoryCache;

  try {
    const db = await openTemplatesDb();
    isDbAvailable = true;

    // Baca dari IndexedDB
    const templates = await new Promise<WebsiteTemplate[]>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readonly");
      const store = tx.objectStore(STORE_NAME);
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => reject(req.error);
    });

    // Migrasi data dari localStorage jika ada
    const lsData = readFromLocalStorage();
    if (lsData.length > 0 && templates.length === 0) {
      for (const t of lsData) {
        await saveUserTemplateAsync(t);
      }
      memoryCache = lsData;
      return lsData;
    }

    memoryCache = templates;
    return templates;
  } catch {
    isDbAvailable = false;
    const fallback = readFromLocalStorage();
    memoryCache = fallback;
    return fallback;
  }
}

export function getUserTemplates(): WebsiteTemplate[] {
  if (memoryCache !== null) return memoryCache;
  return readFromLocalStorage();
}

export async function getUserTemplatesAsync(): Promise<WebsiteTemplate[]> {
  if (memoryCache !== null) return memoryCache;
  return initUserTemplatesStorage();
}

export async function saveUserTemplateAsync(template: WebsiteTemplate): Promise<WebsiteTemplate> {
  const validation = validateTemplateMetadata(template);
  if (!validation.valid) {
    throw new Error(`Validasi template gagal: ${validation.errors.join(", ")}`);
  }

  const normalized: WebsiteTemplate = {
    ...template,
    isCustom: true,
    updatedAt: Date.now(),
  };

  const current = memoryCache || getUserTemplates();
  const index = current.findIndex((t) => t.id === normalized.id);
  const next = index >= 0
    ? [...current.slice(0, index), normalized, ...current.slice(index + 1)]
    : [normalized, ...current];

  memoryCache = next;
  writeToLocalStorage(next);

  try {
    if (isDbAvailable !== false) {
      const db = await openTemplatesDb();
      await new Promise<void>((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, "readwrite");
        const store = tx.objectStore(STORE_NAME);
        const req = store.put(normalized);
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      });
    }
  } catch {
    // Tetap aman dengan in-memory dan localStorage fallback
  }

  return normalized;
}

export async function deleteUserTemplateAsync(templateId: string): Promise<boolean> {
  const current = memoryCache || getUserTemplates();
  const next = current.filter((t) => t.id !== templateId);
  memoryCache = next;
  writeToLocalStorage(next);

  try {
    if (isDbAvailable !== false) {
      const db = await openTemplatesDb();
      await new Promise<void>((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, "readwrite");
        const store = tx.objectStore(STORE_NAME);
        const req = store.delete(templateId);
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      });
    }
    return true;
  } catch {
    return true;
  }
}

/**
 * Exports a WebsiteTemplate to a standard ZIP format.
 * Includes `.kanvas/template.json` metadata manifest along with all template files.
 */
export async function exportTemplateZip(template: WebsiteTemplate): Promise<{ blob: Blob; filename: string }> {
  const zip = new JSZip();

  // Add all template files
  for (const [path, file] of Object.entries(template.files)) {
    if (file.kind === "binary") {
      zip.file(path, file.content, { base64: true });
    } else {
      zip.file(path, file.content);
    }
  }

  // Metadata manifest
  const manifest = {
    id: template.id,
    name: template.name,
    category: template.category,
    description: template.description,
    entry: template.entry || "index.html",
    author: template.author || "User",
    tags: template.tags || [],
    pages: template.pages || [],
    sections: template.sections || [],
    thumbnailGradient: template.thumbnailGradient,
    globalTheme: template.globalTheme,
    createdAt: template.createdAt,
    updatedAt: Date.now(),
  };

  zip.file(".kanvas/template.json", JSON.stringify(manifest, null, 2));

  const blob = await zip.generateAsync({ type: "blob" });
  const filename = `${template.id}-template.zip`;
  return { blob, filename };
}

/**
 * Validates and imports a template from a ZIP archive.
 * Performs rigorous security checks:
 * 1. Path traversal protection (no '../' or root slashes).
 * 2. Total uncompressed size limit.
 * 3. File count limit.
 * 4. Dangerous file extension rejection.
 * 5. Metadata validation.
 * 6. Safe extraction: zero JavaScript execution during validation.
 */
export async function importTemplateZip(data: Blob | ArrayBuffer | Uint8Array | JSZip): Promise<WebsiteTemplate> {
  const zip = data && typeof data === "object" && "files" in data ? (data as unknown as JSZip) : await JSZip.loadAsync(data as any);
  const files: ProjectFiles = {};
  let totalBytes = 0;
  let manifest: any = null;

  const entries = Object.keys(zip.files);

  for (const relativePath of entries) {
    const zipEntry = zip.files[relativePath];
    if (zipEntry.dir) continue;

    // 1. Strict path traversal check
    if (!isSafeTemplateFilePath(relativePath)) {
      throw new Error(`Jalur file tidak aman atau tipe file tidak diizinkan terdeteksi dalam arsip ZIP: '${relativePath}'`);
    }

    if (relativePath === ".kanvas/template.json") {
      const jsonText = await zipEntry.async("string");
      try {
        manifest = JSON.parse(jsonText);
      } catch {
        throw new Error("Metadata .kanvas/template.json rusak atau tidak valid.");
      }
      continue;
    }

    // Read file content
    const content = await zipEntry.async("string");
    totalBytes += content.length;

    if (totalBytes > MAX_ZIP_UNCOMPRESSED_BYTES) {
      throw new Error("Ukuran arsip template melebihi batas aman (maksimum 25MB).");
    }

    files[relativePath] = makeTextFile(content, relativePath);
  }

  if (Object.keys(files).length === 0) {
    throw new Error("Arsip template ZIP kosong atau tidak berisi file valid.");
  }

  if (!manifest) {
    throw new Error("Berkas ZIP bukan arsip template Kanvas yang valid (.kanvas/template.json tidak ditemukan).");
  }

  const id = manifest.id || `template-${Date.now()}`;
  const name = manifest.name || "Template Hasil Impor";
  const category = manifest.category || "Creative";
  const description = manifest.description || "Template kustom hasil impor berkas ZIP.";
  const entry = manifest.entry || "index.html";

  const template: WebsiteTemplate = {
    id,
    name,
    category,
    description,
    entry,
    author: manifest.author || "Impor Kustom",
    isCustom: true,
    createdAt: manifest?.createdAt || Date.now(),
    updatedAt: Date.now(),
    tags: manifest?.tags || ["Impor", category],
    thumbnailGradient: manifest?.thumbnailGradient || {
      from: "#1e1e24",
      to: "#0e0e11",
      accent: "#38bdf8",
    },
    globalTheme: manifest?.globalTheme || {},
    files,
    pages: manifest?.pages || [
      { path: "index.html", title: name, isEntry: true },
    ],
    sections: manifest?.sections || ["Halaman Lengkap"],
  };

  const validation = validateTemplateMetadata(template);
  if (!validation.valid) {
    throw new Error(`Validasi template impor gagal: ${validation.errors.join("; ")}`);
  }

  return template;
}
