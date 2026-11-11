import { getHtmlSummary } from "@/lib/html";
import {
  findEntryHtml,
  getTextFile,
  isHtmlPath,
  makeTextFile,
  normalizeProjectPath,
  type ProjectFiles,
  type ProjectSummary,
} from "@/lib/project-files";
import type { GlobalTheme } from "@/lib/style-files";

export interface ProjectVersion {
  id: string;
  timestamp: number;
  label: string;
  files: ProjectFiles;
  activePath: string;
}

export type ProjectSource = "template" | "upload" | "zip";
export type ProjectStorage = "local" | "indexeddb";

export interface Project {
  id: string;
  name: string;
  /** Snapshot of the entry HTML, kept for listing and backward compatibility. */
  html: string;
  files?: ProjectFiles;
  entry?: string;
  activePath?: string;
  source?: ProjectSource;
  storage?: ProjectStorage;
  summary?: ProjectSummary;
  fileCount?: number;
  createdAt: number;
  updatedAt: number;
  versions?: ProjectVersion[];
  pageOrder?: string[];
  globalTheme?: GlobalTheme;
}

export const PROJECTS_STORAGE_KEY = "kanvas.projects.v1";
export const MAX_HTML_FILE_BYTES = 5 * 1024 * 1024;
export const MAX_ZIP_FILE_BYTES = 30 * 1024 * 1024;

const LOCAL_STORAGE_CHAR_LIMIT = 3_500_000;
const DB_NAME = "kanvas.projects";
const DB_VERSION = 1;
const DB_STORE = "projects";

class StorageLimitError extends Error {
  constructor() {
    super("Project terlalu besar untuk localStorage.");
    this.name = "StorageLimitError";
  }
}

function isProject(value: unknown): value is Project {
  if (typeof value !== "object" || value === null) return false;
  const project = value as Record<string, unknown>;
  return (
    typeof project.id === "string" &&
    typeof project.name === "string" &&
    typeof project.html === "string" &&
    typeof project.createdAt === "number" &&
    typeof project.updatedAt === "number"
  );
}

export function readProjects(): Project[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(PROJECTS_STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter(isProject)
      .sort((a, b) => b.updatedAt - a.updatedAt);
  } catch {
    return [];
  }
}

export function getProject(id: string): Project | null {
  return readProjects().find((project) => project.id === id) ?? null;
}

export function writeProjects(projects: Project[]): void {
  const serialized = JSON.stringify(projects);
  if (serialized.length > LOCAL_STORAGE_CHAR_LIMIT) {
    throw new StorageLimitError();
  }
  window.localStorage.setItem(PROJECTS_STORAGE_KEY, serialized);
}

export function saveProject(project: Project): void {
  const hydrated = hydrateProject(project);
  const projects = readProjects();
  const index = projects.findIndex((item) => item.id === hydrated.id);
  if (index >= 0) {
    projects[index] = hydrated;
  } else {
    projects.push(hydrated);
  }
  writeProjects(projects);
}

function openProjectsDb(): Promise<IDBDatabase | null> {
  if (typeof window === "undefined" || !("indexedDB" in window)) {
    return Promise.resolve(null);
  }

  return new Promise((resolve, reject) => {
    const request = window.indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const database = request.result;
      if (!database.objectStoreNames.contains(DB_STORE)) {
        database.createObjectStore(DB_STORE, { keyPath: "id" });
      }
    };
    request.onsuccess = () => {
      const database = request.result;
      database.onversionchange = () => database.close();
      resolve(database);
    };
    request.onerror = () =>
      reject(request.error ?? new Error("IndexedDB tidak dapat dibuka."));
    request.onblocked = () =>
      reject(new Error("IndexedDB sedang dipakai tab lain."));
  });
}

let databasePromise: Promise<IDBDatabase | null> | null = null;

function getDatabase(): Promise<IDBDatabase | null> {
  if (!databasePromise) {
    databasePromise = openProjectsDb().catch((error) => {
      databasePromise = null;
      throw error;
    });
  }
  return databasePromise;
}

async function putProjectRecord(project: Project): Promise<void> {
  const database = await getDatabase();
  if (!database) throw new Error("IndexedDB tidak tersedia di browser ini.");

  await new Promise<void>((resolve, reject) => {
    const transaction = database.transaction(DB_STORE, "readwrite");
    transaction.objectStore(DB_STORE).put(project);
    transaction.oncomplete = () => resolve();
    transaction.onerror = () =>
      reject(transaction.error ?? new Error("Gagal menyimpan ke IndexedDB."));
    transaction.onabort = () =>
      reject(transaction.error ?? new Error("Penyimpanan IndexedDB dibatalkan."));
  });
}

async function getProjectRecord(id: string): Promise<Project | null> {
  const database = await getDatabase();
  if (!database) return null;

  return new Promise<Project | null>((resolve, reject) => {
    const transaction = database.transaction(DB_STORE, "readonly");
    const request = transaction.objectStore(DB_STORE).get(id);
    request.onsuccess = () => {
      const value: unknown = request.result;
      resolve(isProject(value) ? value : null);
    };
    request.onerror = () =>
      reject(request.error ?? new Error("Gagal membaca IndexedDB."));
  });
}

async function deleteProjectRecord(id: string): Promise<void> {
  const database = await getDatabase();
  if (!database) return;

  await new Promise<void>((resolve, reject) => {
    const transaction = database.transaction(DB_STORE, "readwrite");
    transaction.objectStore(DB_STORE).delete(id);
    transaction.oncomplete = () => resolve();
    transaction.onerror = () =>
      reject(transaction.error ?? new Error("Gagal menghapus IndexedDB."));
  });
}

function metadataFor(project: Project, includeHtml: boolean): Project {
  return {
    ...project,
    files: {},
    html: includeHtml ? project.html : "",
    storage: "indexeddb",
    summary: project.summary,
    fileCount: project.fileCount,
  };
}

/**
 * Saves a project to localStorage, falling back to IndexedDB and a small
 * localStorage metadata record when the project exceeds the practical quota.
 */
export async function saveProjectAsync(project: Project): Promise<Project> {
  const hydrated = hydrateProject(project);
  const projects = readProjects();
  const index = projects.findIndex((item) => item.id === hydrated.id);
  const localProject: Project = { ...hydrated, storage: "local" };
  const nextProjects = projects.slice();
  if (index >= 0) nextProjects[index] = localProject;
  else nextProjects.push(localProject);

  try {
    writeProjects(nextProjects);
    await deleteProjectRecord(hydrated.id).catch(() => undefined);
    return localProject;
  } catch {
    // localStorage penuh atau melebihi batas aman: simpan project lengkap di
    // IndexedDB, lalu sisakan metadata ringan untuk daftar di beranda.
    await putProjectRecord(hydrated);

    let metadata = metadataFor(hydrated, true);
    const withMetadata = projects.slice();
    const metadataIndex = withMetadata.findIndex(
      (item) => item.id === hydrated.id,
    );
    if (metadataIndex >= 0) withMetadata[metadataIndex] = metadata;
    else withMetadata.push(metadata);

    try {
      writeProjects(withMetadata);
    } catch {
      metadata = metadataFor(hydrated, false);
      if (metadataIndex >= 0) withMetadata[metadataIndex] = metadata;
      else withMetadata[withMetadata.length - 1] = metadata;
      writeProjects(withMetadata);
    }

    return metadata;
  }
}

export async function loadProject(id: string): Promise<Project | null> {
  const local = readProjects().find((project) => project.id === id);
  if (!local) return null;

  if (local.storage === "indexeddb") {
    const record = await getProjectRecord(id);
    if (!record) return null;
    return hydrateProject({ ...record, storage: "indexeddb" });
  }

  return hydrateProject(local);
}

export function removeProject(id: string): void {
  try {
    writeProjects(readProjects().filter((project) => project.id !== id));
  } catch {
    // Tetap coba hapus catatan IndexedDB di bawah.
  }
  void deleteProjectRecord(id).catch(() => undefined);
}

export async function deleteProject(id: string): Promise<void> {
  const projects = readProjects().filter((project) => project.id !== id);
  try {
    writeProjects(projects);
  } finally {
    await deleteProjectRecord(id).catch(() => undefined);
  }
}

export function makeProjectId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `project-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function cleanProjectName(value: string): string {
  return value.replace(/\s+/g, " ").trim().slice(0, 80) || "Project tanpa judul";
}

function legacyFiles(project: Project): ProjectFiles {
  const preferred = normalizeProjectPath(project.entry ?? "") ?? "index.html";
  const path = isHtmlPath(preferred) ? preferred : "index.html";
  return { [path]: makeTextFile(project.html, path) };
}

export function hydrateProject(project: Project): Project {
  const hasFiles =
    project.files &&
    typeof project.files === "object" &&
    Object.keys(project.files).length > 0;
  const files = hasFiles ? project.files! : legacyFiles(project);
  const entry =
    findEntryHtml(files, project.entry) ??
    Object.keys(files).find((path) => isHtmlPath(path)) ??
    "index.html";
  const activePath =
    project.activePath &&
    files[project.activePath] &&
    isHtmlPath(project.activePath)
      ? project.activePath
      : entry;
  const html = getTextFile(files, entry) ?? project.html;
  const summary = getHtmlSummary(html);

  return {
    ...project,
    files,
    entry,
    activePath,
    html,
    source: project.source ?? "template",
    summary,
    fileCount: Object.keys(files).length,
  };
}

export function makeProject(
  name: string,
  html: string,
  path = "index.html",
  source: ProjectSource = "template",
): Project {
  const entry = normalizeProjectPath(path) ?? "index.html";
  const safeEntry = isHtmlPath(entry) ? entry : "index.html";
  const files: ProjectFiles = {
    [safeEntry]: makeTextFile(html, safeEntry),
  };
  const now = Date.now();
  return hydrateProject({
    id: makeProjectId(),
    name: cleanProjectName(name),
    html,
    files,
    entry: safeEntry,
    activePath: safeEntry,
    source,
    createdAt: now,
    updatedAt: now,
  });
}

export function makeProjectFromFiles(
  name: string,
  files: ProjectFiles,
  entry: string,
  source: ProjectSource = "zip",
): Project {
  const now = Date.now();
  const html = getTextFile(files, entry) ?? "";
  return hydrateProject({
    id: makeProjectId(),
    name: cleanProjectName(name),
    html,
    files,
    entry,
    activePath: entry,
    source,
    createdAt: now,
    updatedAt: now,
  });
}

export function formatRelativeTime(timestamp: number): string {
  const diff = Math.max(0, Date.now() - timestamp);
  const minute = 60_000;
  const hour = 60 * minute;
  const day = 24 * hour;

  if (diff < minute) return "baru saja";
  if (diff < hour) return `${Math.floor(diff / minute)} menit lalu`;
  if (diff < day) return `${Math.floor(diff / hour)} jam lalu`;
  if (diff < 7 * day) return `${Math.floor(diff / day)} hari lalu`;

  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(timestamp);
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function fileStem(filename: string): string {
  return filename.replace(/\.(?:zip|html?)$/i, "").trim() || "Halaman impor";
}

export function slugify(value: string): string {
  const slug = value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
  return slug || "kanvas-export";
}

export function validateHtmlFile(file: File): string | null {
  if (!/\.html?$/i.test(file.name)) {
    return "Pilih file dengan ekstensi .html atau .htm.";
  }
  if (file.size > MAX_HTML_FILE_BYTES) {
    return "Ukuran file terlalu besar. Maksimal 5 MB.";
  }
  return null;
}

export function validateProjectFile(file: File): string | null {
  if (/\.zip$/i.test(file.name) || file.type === "application/zip") {
    if (file.size > MAX_ZIP_FILE_BYTES) {
      return "Ukuran ZIP terlalu besar. Maksimal 30 MB.";
    }
    return null;
  }

  if (/\.html?$/i.test(file.name) || file.type === "text/html") {
    return validateHtmlFile(file);
  }

  return "Pilih file dengan ekstensi .html atau .htm. Untuk project multi-file, pilih arsip .zip.";
}
