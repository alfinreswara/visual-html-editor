import type { WebsiteTemplate, TemplateCategory } from "./types";
import { TEMPLATE_CATEGORIES } from "./types";
import { isHtmlPath, isCssPath, isImagePath, isJavaScriptPath } from "@/lib/project-files";

export const MAX_TEMPLATE_NAME_LENGTH = 100;
export const MAX_TEMPLATE_DESCRIPTION_LENGTH = 500;
export const MAX_TEMPLATE_FILES_COUNT = 100;
export const MAX_ZIP_UNCOMPRESSED_BYTES = 25 * 1024 * 1024; // 25MB

const DANGEROUS_EXTENSIONS = [
  ".exe",
  ".bat",
  ".cmd",
  ".sh",
  ".bash",
  ".bin",
  ".app",
  ".msi",
  ".vbs",
  ".ps1",
];

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  metadata?: Partial<WebsiteTemplate>;
}

/**
 * Validates a file path within a template zip or project.
 * Enforces strict path traversal prevention (no '../', no leading slashes, no absolute drive paths).
 */
export function isSafeTemplateFilePath(path: string): boolean {
  if (!path || typeof path !== "string") return false;
  const normalized = path.replace(/\\/g, "/");

  // Prevent directory traversal
  if (normalized.includes("../") || normalized.includes("/..") || normalized === "..") {
    return false;
  }

  // Prevent root absolute paths
  if (normalized.startsWith("/") || /^[a-zA-Z]:/.test(normalized)) {
    return false;
  }

  // Reject dangerous extensions
  const lower = normalized.toLowerCase();
  for (const ext of DANGEROUS_EXTENSIONS) {
    if (lower.endsWith(ext)) return false;
  }

  return true;
}

/**
 * Validates template metadata.
 */
export function validateTemplateMetadata(template: Partial<WebsiteTemplate>): ValidationResult {
  const errors: string[] = [];

  if (!template.id || typeof template.id !== "string" || !/^[a-zA-Z0-9_-]+$/.test(template.id)) {
    errors.push("ID template harus berupa string alfanumerik tanpa spasi.");
  }

  if (
    !template.name ||
    typeof template.name !== "string" ||
    template.name.trim().length === 0 ||
    template.name.length > MAX_TEMPLATE_NAME_LENGTH
  ) {
    errors.push(`Nama template harus antara 1 sampai ${MAX_TEMPLATE_NAME_LENGTH} karakter.`);
  }

  const validCategories = TEMPLATE_CATEGORIES.filter((c) => c !== "Semua");
  if (!template.category || !validCategories.includes(template.category as any)) {
    errors.push(`Kategori template tidak valid. Pilih salah satu dari: ${validCategories.join(", ")}`);
  }

  if (template.files !== undefined) {
    if (typeof template.files !== "object" || Object.keys(template.files).length === 0) {
      errors.push("Template harus memiliki setidaknya satu file.");
    } else {
      const fileCount = Object.keys(template.files).length;
      if (fileCount > MAX_TEMPLATE_FILES_COUNT) {
        errors.push(`Jumlah file melebihi batas maksimum (${MAX_TEMPLATE_FILES_COUNT} file).`);
      }

      // Must have index.html
      const hasIndexHtml = Object.keys(template.files).some((p) => p === "index.html" || isHtmlPath(p));
      if (!hasIndexHtml) {
        errors.push("Template harus memiliki setidaknya satu file HTML sebagai titik awal (index.html).");
      }

      // Validate every file path
      for (const filePath of Object.keys(template.files)) {
        if (!isSafeTemplateFilePath(filePath)) {
          errors.push(`Jalur file '${filePath}' mengandung karakter tidak aman atau berpotensi path-traversal.`);
        }
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    metadata: errors.length === 0 ? template : undefined,
  };
}
