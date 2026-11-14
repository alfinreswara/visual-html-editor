export interface SavedSection {
  id: string;
  name: string;
  category: string;
  html: string;
  description?: string;
  createdAt: number;
  previewSnippet?: string;
}

export const SAVED_SECTIONS_STORAGE_KEY = "kanvas.saved_sections.v1";
export const SAVED_SECTIONS_DB_NAME = "kanvas.saved_sections";
export const SAVED_SECTIONS_DB_VERSION = 1;
export const SAVED_SECTIONS_STORE_NAME = "sections";

let memoryCache: SavedSection[] | null = null;
let migrationCompleted = false;
let dbPromise: Promise<IDBDatabase | null> | null = null;

function readFromLocalStorage(): SavedSection[] {
  if (typeof window === "undefined" || !window.localStorage) return [];
  try {
    const raw = window.localStorage.getItem(SAVED_SECTIONS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeToLocalStorage(sections: SavedSection[]): void {
  if (typeof window === "undefined" || !window.localStorage) return;
  try {
    window.localStorage.setItem(
      SAVED_SECTIONS_STORAGE_KEY,
      JSON.stringify(sections),
    );
  } catch {
    // Gracefully handle storage quota error
  }
}

function openSavedSectionsDb(): Promise<IDBDatabase | null> {
  if (typeof window === "undefined" || !("indexedDB" in window)) {
    return Promise.resolve(null);
  }

  return new Promise((resolve) => {
    try {
      const request = window.indexedDB.open(
        SAVED_SECTIONS_DB_NAME,
        SAVED_SECTIONS_DB_VERSION,
      );

      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(SAVED_SECTIONS_STORE_NAME)) {
          db.createObjectStore(SAVED_SECTIONS_STORE_NAME, { keyPath: "id" });
        }
      };

      request.onsuccess = () => {
        const db = request.result;
        db.onversionchange = () => db.close();
        resolve(db);
      };

      request.onerror = () => {
        // Database unavailable or blocked (e.g. private window)
        resolve(null);
      };

      request.onblocked = () => {
        resolve(null);
      };
    } catch {
      resolve(null);
    }
  });
}

function getDatabase(): Promise<IDBDatabase | null> {
  if (!dbPromise) {
    dbPromise = openSavedSectionsDb().catch(() => null);
  }
  return dbPromise;
}

/**
 * Automatically migrates existing saved sections from localStorage into IndexedDB.
 * Verifies insertion before completing. Does not remove localStorage data prematurely.
 */
export async function migrateFromLocalStorage(): Promise<boolean> {
  if (migrationCompleted) return false;
  const localItems = readFromLocalStorage();
  if (localItems.length === 0) {
    migrationCompleted = true;
    return false;
  }

  const db = await getDatabase();
  if (!db) {
    // IndexedDB unavailable; keep using localStorage fallback
    return false;
  }

  try {
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(SAVED_SECTIONS_STORE_NAME, "readwrite");
      const store = tx.objectStore(SAVED_SECTIONS_STORE_NAME);

      for (const item of localItems) {
        store.put(item);
      }

      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
      tx.onabort = () => reject(new Error("Migrasi IndexedDB dibatalkan."));
    });

    migrationCompleted = true;
    return true;
  } catch {
    // If migration failed, keep localItems in localStorage
    return false;
  }
}

async function putRecord(item: SavedSection): Promise<boolean> {
  const db = await getDatabase();
  if (!db) return false;

  return new Promise((resolve) => {
    try {
      const tx = db.transaction(SAVED_SECTIONS_STORE_NAME, "readwrite");
      tx.objectStore(SAVED_SECTIONS_STORE_NAME).put(item);
      tx.oncomplete = () => resolve(true);
      tx.onerror = () => resolve(false);
      tx.onabort = () => resolve(false);
    } catch {
      resolve(false);
    }
  });
}

async function deleteRecord(id: string): Promise<boolean> {
  const db = await getDatabase();
  if (!db) return false;

  return new Promise((resolve) => {
    try {
      const tx = db.transaction(SAVED_SECTIONS_STORE_NAME, "readwrite");
      tx.objectStore(SAVED_SECTIONS_STORE_NAME).delete(id);
      tx.oncomplete = () => resolve(true);
      tx.onerror = () => resolve(false);
      tx.onabort = () => resolve(false);
    } catch {
      resolve(false);
    }
  });
}

/**
 * Reads all saved sections asynchronously from IndexedDB, falling back to
 * in-memory cache and localStorage if IndexedDB is not available.
 */
export async function getUserSavedSectionsAsync(): Promise<SavedSection[]> {
  await migrateFromLocalStorage();

  const db = await getDatabase();
  if (!db) {
    const fallback = memoryCache ?? readFromLocalStorage();
    memoryCache = fallback;
    return fallback;
  }

  return new Promise((resolve) => {
    try {
      const tx = db.transaction(SAVED_SECTIONS_STORE_NAME, "readonly");
      const store = tx.objectStore(SAVED_SECTIONS_STORE_NAME);
      const req = store.getAll();

      req.onsuccess = () => {
        const records = Array.isArray(req.result) ? req.result : [];
        records.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
        memoryCache = records;
        writeToLocalStorage(records);
        resolve(records);
      };

      req.onerror = () => {
        const fallback = memoryCache ?? readFromLocalStorage();
        resolve(fallback);
      };
    } catch {
      const fallback = memoryCache ?? readFromLocalStorage();
      resolve(fallback);
    }
  });
}

/**
 * Saves a user section asynchronously to IndexedDB and mirrors to memory and localStorage.
 */
export async function saveUserSectionAsync(
  section: Omit<SavedSection, "id" | "createdAt"> & {
    id?: string;
    createdAt?: number;
  },
): Promise<SavedSection> {
  const now = Date.now();
  const id =
    section.id || `sec_${now}_${Math.random().toString(36).slice(2, 7)}`;
  const cleanSnippet =
    section.previewSnippet ||
    section.html
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 120);

  const newSection: SavedSection = {
    id,
    name: section.name.trim() || "Section Tersimpan",
    category: section.category?.trim() || "Kustom",
    html: section.html,
    description: section.description,
    createdAt: section.createdAt ?? now,
    previewSnippet: cleanSnippet,
  };

  const current = memoryCache ?? readFromLocalStorage();
  const existingIdx = current.findIndex((s) => s.id === id);
  let nextSections: SavedSection[];
  if (existingIdx >= 0) {
    nextSections = [...current];
    nextSections[existingIdx] = newSection;
  } else {
    nextSections = [newSection, ...current];
  }

  memoryCache = nextSections;
  writeToLocalStorage(nextSections);

  await putRecord(newSection);
  return newSection;
}

/**
 * Deletes a user section asynchronously from IndexedDB and mirrors to memory and localStorage.
 */
export async function deleteUserSectionAsync(id: string): Promise<void> {
  const current = memoryCache ?? readFromLocalStorage();
  const nextSections = current.filter((s) => s.id !== id);
  memoryCache = nextSections;
  writeToLocalStorage(nextSections);

  await deleteRecord(id);
}

/**
 * Initializes saved sections storage on application mount: migrates data,
 * populates in-memory cache, and returns current saved sections.
 */
export async function initSavedSectionsStorage(): Promise<SavedSection[]> {
  return getUserSavedSectionsAsync();
}

/**
 * Synchronous getter for backward compatibility. Uses memoryCache or localStorage.
 */
export function getUserSavedSections(): SavedSection[] {
  if (memoryCache !== null) {
    return memoryCache;
  }
  const local = readFromLocalStorage();
  memoryCache = local;
  if (typeof window !== "undefined") {
    void getUserSavedSectionsAsync().then((items) => {
      memoryCache = items;
    });
  }
  return local;
}

/**
 * Synchronous save for backward compatibility with immediate state updates.
 */
export function saveUserSection(
  section: Omit<SavedSection, "id" | "createdAt"> & {
    id?: string;
    createdAt?: number;
  },
): SavedSection {
  const now = Date.now();
  const id =
    section.id || `sec_${now}_${Math.random().toString(36).slice(2, 7)}`;
  const cleanSnippet =
    section.previewSnippet ||
    section.html
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 120);

  const newSection: SavedSection = {
    id,
    name: section.name.trim() || "Section Tersimpan",
    category: section.category?.trim() || "Kustom",
    html: section.html,
    description: section.description,
    createdAt: section.createdAt ?? now,
    previewSnippet: cleanSnippet,
  };

  const current = memoryCache ?? readFromLocalStorage();
  const existingIdx = current.findIndex((s) => s.id === id);
  let nextSections: SavedSection[];
  if (existingIdx >= 0) {
    nextSections = [...current];
    nextSections[existingIdx] = newSection;
  } else {
    nextSections = [newSection, ...current];
  }

  memoryCache = nextSections;
  writeToLocalStorage(nextSections);

  // Asynchronously commit to IndexedDB in the background
  void putRecord(newSection);

  return newSection;
}

/**
 * Synchronous delete for backward compatibility with immediate state updates.
 */
export function deleteUserSection(id: string): void {
  const current = memoryCache ?? readFromLocalStorage();
  const nextSections = current.filter((s) => s.id !== id);
  memoryCache = nextSections;
  writeToLocalStorage(nextSections);

  // Asynchronously commit to IndexedDB in the background
  void deleteRecord(id);
}

export function createSavedSectionFromHtml(
  name: string,
  html: string,
  category = "Kustom",
  description?: string,
): SavedSection {
  return saveUserSection({
    name,
    html,
    category,
    description,
  });
}

/**
 * Resets memory cache (primarily useful for tests).
 */
export function _resetMemoryCache(): void {
  memoryCache = null;
  migrationCompleted = false;
  dbPromise = null;
}
