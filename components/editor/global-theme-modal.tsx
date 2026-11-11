"use client";

import { useState } from "react";
import { Check, LoaderCircle, Palette, Sparkles, Type } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { POPULAR_GOOGLE_FONTS, type GlobalTheme } from "@/lib/style-files";

const PRESET_PRIMARY_COLORS = [
  "#3b82f6", // Blue
  "#6366f1", // Indigo
  "#8b5cf6", // Purple
  "#ec4899", // Pink
  "#10b981", // Emerald
  "#06b6d4", // Cyan
  "#f59e0b", // Amber
  "#ef4444", // Red
  "#18181b", // Dark
];

const PRESET_TEXT_COLORS = [
  "#17171c",
  "#27272a",
  "#3f3f46",
  "#f4f4f5",
  "#e4e4e7",
  "#d4d4d8",
];

interface GlobalThemeModalProps {
  open: boolean;
  onClose: () => void;
  currentTheme?: GlobalTheme;
  onSave: (theme: GlobalTheme) => void;
}

export default function GlobalThemeModal({
  open,
  onClose,
  currentTheme,
  onSave,
}: GlobalThemeModalProps) {
  const [theme, setTheme] = useState<GlobalTheme>({
    primaryColor: currentTheme?.primaryColor || "#3b82f6",
    textColor: currentTheme?.textColor || "#17171c",
    headingFont: currentTheme?.headingFont || "Inter",
    bodyFont: currentTheme?.bodyFont || "Inter",
  });
  const [saving, setSaving] = useState(false);

  function handleSave() {
    setSaving(true);
    try {
      onSave(theme);
      onClose();
    } finally {
      setSaving(false);
    }
  }

  const FIELD_CLASS =
    "focus-ring h-8.5 w-full rounded-lg border border-white/[0.08] bg-white/[0.025] px-2.5 text-xs text-zinc-200 outline-none transition placeholder:text-zinc-600 hover:border-white/[0.14] focus:border-[#3b82f6]/50 focus:bg-white/[0.04]";

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Pengaturan Tema & Font Global"
      description="Atur warna utama, teks, dan tipografi Google Fonts yang berlaku untuk seluruh stylesheet proyek via CSS variables."
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            className="focus-ring h-9 rounded-lg px-3.5 text-xs font-medium text-zinc-400 transition hover:bg-white/[0.04] hover:text-zinc-200"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="focus-ring inline-flex h-9 items-center gap-2 rounded-lg bg-[#3b82f6] px-4 text-xs font-semibold text-white transition hover:bg-[#2563eb]"
          >
            {saving ? (
              <LoaderCircle className="size-3.5 animate-spin" />
            ) : (
              <Check className="size-3.5" />
            )}
            Terapkan Tema Global
          </button>
        </>
      }
    >
      <div className="space-y-4">
        {/* Colors Section */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-zinc-300">
              Warna Utama (Primary)
            </label>
            <div className="flex h-8.5 items-center gap-2 rounded-lg border border-white/[0.08] bg-white/[0.025] px-2">
              <input
                type="color"
                value={theme.primaryColor || "#3b82f6"}
                onChange={(e) => setTheme({ ...theme, primaryColor: e.target.value })}
                className="size-5 cursor-pointer rounded border border-white/20 bg-transparent"
              />
              <input
                type="text"
                value={theme.primaryColor}
                onChange={(e) => setTheme({ ...theme, primaryColor: e.target.value })}
                className="min-w-0 flex-1 bg-transparent font-mono text-xs text-zinc-200 outline-none"
              />
            </div>
            <div className="mt-1.5 flex flex-wrap gap-1">
              {PRESET_PRIMARY_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setTheme({ ...theme, primaryColor: c })}
                  className="size-3.5 rounded-full border border-white/20 transition-transform hover:scale-125"
                  style={{ backgroundColor: c }}
                  title={c}
                />
              ))}
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-zinc-300">
              Warna Teks Default
            </label>
            <div className="flex h-8.5 items-center gap-2 rounded-lg border border-white/[0.08] bg-white/[0.025] px-2">
              <input
                type="color"
                value={theme.textColor || "#17171c"}
                onChange={(e) => setTheme({ ...theme, textColor: e.target.value })}
                className="size-5 cursor-pointer rounded border border-white/20 bg-transparent"
              />
              <input
                type="text"
                value={theme.textColor}
                onChange={(e) => setTheme({ ...theme, textColor: e.target.value })}
                className="min-w-0 flex-1 bg-transparent font-mono text-xs text-zinc-200 outline-none"
              />
            </div>
            <div className="mt-1.5 flex flex-wrap gap-1">
              {PRESET_TEXT_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setTheme({ ...theme, textColor: c })}
                  className="size-3.5 rounded-full border border-white/20 transition-transform hover:scale-125"
                  style={{ backgroundColor: c }}
                  title={c}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Fonts Section */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-zinc-300">
              Font Judul (Heading)
            </label>
            <select
              value={theme.headingFont}
              onChange={(e) => setTheme({ ...theme, headingFont: e.target.value })}
              className={`${FIELD_CLASS} cursor-pointer appearance-none`}
            >
              {POPULAR_GOOGLE_FONTS.map((font) => (
                <option key={font} value={font}>
                  {font}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-zinc-300">
              Font Teks (Body)
            </label>
            <select
              value={theme.bodyFont}
              onChange={(e) => setTheme({ ...theme, bodyFont: e.target.value })}
              className={`${FIELD_CLASS} cursor-pointer appearance-none`}
            >
              {POPULAR_GOOGLE_FONTS.map((font) => (
                <option key={font} value={font}>
                  {font}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Live Preview Card */}
        <div className="rounded-xl border border-white/[0.08] bg-white p-4 text-[#17171c] shadow-lg">
          <span className="mb-2 block text-[9.5px] font-bold uppercase tracking-wider text-zinc-400">
            Pratinjau Langsung
          </span>
          <h3
            className="text-lg font-bold tracking-tight"
            style={{ fontFamily: `'${theme.headingFont}', sans-serif` }}
          >
            Membangun Masa Depan Visual
          </h3>
          <p
            className="mt-1.5 text-xs leading-5"
            style={{
              color: theme.textColor,
              fontFamily: `'${theme.bodyFont}', sans-serif`,
            }}
          >
            Semua elemen heading dan teks secara otomatis mengadopsi variabel font dan warna
            ini. Tombol aksi memakai warna utama.
          </p>
          <div className="mt-3 flex items-center gap-2">
            <button
              type="button"
              className="rounded-lg px-3 py-1.5 text-xs font-semibold text-white shadow-sm"
              style={{ backgroundColor: theme.primaryColor }}
            >
              Tombol Utama
            </button>
            <button
              type="button"
              className="rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-1.5 text-xs font-medium text-zinc-700"
            >
              Tombol Sekunder
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
