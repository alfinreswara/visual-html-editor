"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/modal";
import {
  TEMPLATE_CATEGORIES,
  type TemplateCategory,
  type WebsiteTemplate,
} from "@/lib/templates/types";
import { saveUserTemplateAsync } from "@/lib/templates/template-storage";
import type { ProjectFiles } from "@/lib/project-files";
import type { GlobalTheme } from "@/lib/style-files";
import { BookmarkPlus, LoaderCircle, Check } from "lucide-react";

interface SaveTemplateModalProps {
  open: boolean;
  onClose: () => void;
  files: ProjectFiles;
  activePath: string;
  projectName: string;
  globalTheme?: GlobalTheme;
  onSaved?: (template: WebsiteTemplate) => void;
}

export default function SaveTemplateModal({
  open,
  onClose,
  files,
  activePath,
  projectName,
  globalTheme,
  onSaved,
}: SaveTemplateModalProps) {
  const [name, setName] = useState(projectName || "Template Kustom Saya");
  const [description, setDescription] = useState(
    "Template lengkap yang disimpan langsung dari proyek editor.",
  );
  const [category, setCategory] = useState<Exclude<TemplateCategory, "Semua">>("Creative");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const categories = TEMPLATE_CATEGORIES.filter((c): c is Exclude<TemplateCategory, "Semua"> => c !== "Semua");

  async function handleSave() {
    const trimmedName = name.trim();
    if (!trimmedName) {
      setError("Nama template wajib diisi.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const id = `custom-${Date.now()}`;
      const pages = Object.keys(files)
        .filter((path) => path.endsWith(".html") || path.endsWith(".htm"))
        .map((path) => ({
          path,
          title: path === "index.html" ? trimmedName : path.replace(/\.html?$/i, ""),
          isEntry: path === "index.html",
        }));

      const template: WebsiteTemplate = {
        id,
        name: trimmedName,
        category,
        description: description.trim() || "Template kustom pengguna.",
        isCustom: true,
        author: "Pengguna (Lokal)",
        createdAt: Date.now(),
        updatedAt: Date.now(),
        tags: ["Kustom", category],
        thumbnailGradient: {
          from: "#1e1e24",
          to: "#121216",
          accent: "#3b82f6",
        },
        globalTheme: globalTheme || {},
        files: { ...files },
        pages: pages.length > 0 ? pages : [{ path: "index.html", title: trimmedName, isEntry: true }],
        sections: ["Section Kustom"],
      };

      const saved = await saveUserTemplateAsync(template);
      onSaved?.(saved);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menyimpan template.");
    } finally {
      setSaving(false);
    }
  }

  const FIELD_CLASS =
    "focus-ring w-full rounded-lg border border-white/[0.08] bg-white/[0.025] px-3 py-2 text-xs text-zinc-200 outline-none transition placeholder:text-zinc-600 focus:border-[#3b82f6]/50 focus:bg-white/[0.04]";

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Simpan Proyek sebagai Template"
      description="Jadikan seluruh file, styling, dan halaman proyek ini sebagai template yang dapat digunakan kembali kapan saja."
      footer={
        <div className="flex w-full items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="focus-ring h-8.5 rounded-lg px-3.5 text-xs font-medium text-zinc-400 transition hover:bg-white/[0.04] hover:text-zinc-200"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={() => void handleSave()}
            disabled={saving}
            data-testid="confirm-save-template-btn"
            className="focus-ring inline-flex h-8.5 items-center gap-1.5 rounded-lg bg-[#3b82f6] px-4 text-xs font-semibold text-white transition hover:bg-[#2563eb] disabled:opacity-50"
          >
            {saving ? (
              <LoaderCircle className="size-3.5 animate-spin" />
            ) : (
              <BookmarkPlus className="size-3.5" />
            )}
            Simpan ke Pustaka Template
          </button>
        </div>
      }
    >
      <div className="space-y-4">
        {error && (
          <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-2.5 text-xs text-red-300">
            {error}
          </div>
        )}

        <div>
          <label className="mb-1.5 block text-xs font-medium text-zinc-300">
            Nama Template
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Contoh: Modern SaaS Dark Edition"
            data-testid="save-template-name-input"
            className={FIELD_CLASS}
            autoFocus
          />
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-medium text-zinc-300">
            Kategori
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as any)}
            data-testid="save-template-category-select"
            className={FIELD_CLASS}
          >
            {categories.map((c) => (
              <option key={c} value={c} className="bg-[#18181b] text-zinc-200">
                {c}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-medium text-zinc-300">
            Deskripsi Singkat
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            placeholder="Jelaskan tujuan atau fitur utama template ini..."
            data-testid="save-template-description-input"
            className={FIELD_CLASS}
          />
        </div>
      </div>
    </Modal>
  );
}
