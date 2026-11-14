"use client";

import { useState } from "react";
import {
  Check,
  LoaderCircle,
  Palette,
  Sparkles,
  Type,
  Layers,
  Square,
} from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { POPULAR_GOOGLE_FONTS } from "@/lib/style-files";
import {
  DESIGN_SYSTEM_PRESETS,
  RADIUS_VALUES,
  SHADOW_VALUES,
  type GlobalTheme,
} from "@/lib/design-system";

interface GlobalThemeModalProps {
  open: boolean;
  onClose: () => void;
  currentTheme?: GlobalTheme;
  onSave: (theme: GlobalTheme) => void;
}

type TabKey = "presets" | "colors" | "typography" | "effects";

export default function GlobalThemeModal({
  open,
  onClose,
  currentTheme,
  onSave,
}: GlobalThemeModalProps) {
  const [activeTab, setActiveTab] = useState<TabKey>("presets");
  const [theme, setTheme] = useState<GlobalTheme>({
    primaryColor: currentTheme?.primaryColor || "#2563eb",
    secondaryColor: currentTheme?.secondaryColor || "#475569",
    accentColor: currentTheme?.accentColor || "#3b82f6",
    backgroundColor: currentTheme?.backgroundColor || "#ffffff",
    surfaceColor: currentTheme?.surfaceColor || "#f8fafc",
    textColor: currentTheme?.textColor || "#0f172a",
    mutedTextColor: currentTheme?.mutedTextColor || "#64748b",
    borderColor: currentTheme?.borderColor || "#e2e8f0",
    headingFont: currentTheme?.headingFont || "Inter",
    bodyFont: currentTheme?.bodyFont || "Inter",
    monoFont: currentTheme?.monoFont || "ui-monospace, monospace",
    fontSizeBase: currentTheme?.fontSizeBase || "16px",
    radiusPreset: currentTheme?.radiusPreset || "md",
    shadowPreset: currentTheme?.shadowPreset || "subtle",
    presetId: currentTheme?.presetId || "modern-minimal",
  });
  const [saving, setSaving] = useState(false);

  function applyPreset(presetId: string) {
    const found = DESIGN_SYSTEM_PRESETS.find((p) => p.id === presetId);
    if (!found) return;
    setTheme({
      ...found.theme,
      presetId: found.id,
    });
  }

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

  const currentRadius =
    RADIUS_VALUES[theme.radiusPreset || "md"]?.md || "8px";
  const currentShadow =
    SHADOW_VALUES[theme.shadowPreset || "subtle"]?.md || "none";

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Global Design System & Design Tokens"
      description="Kelola preset desain, token warna, tipografi Google Fonts, sudut dan bayangan yang diterapkan secara otomatis ke seluruh komponen dan stylesheet via CSS variables."
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
            data-testid="apply-theme-button"
            className="focus-ring inline-flex h-9 items-center gap-2 rounded-lg bg-[#3b82f6] px-4 text-xs font-semibold text-white transition hover:bg-[#2563eb]"
          >
            {saving ? (
              <LoaderCircle className="size-3.5 animate-spin" />
            ) : (
              <Check className="size-3.5" />
            )}
            Terapkan Design System
          </button>
        </>
      }
    >
      <div className="space-y-4">
        {/* Sub-navigation tabs */}
        <div className="flex border-b border-white/[0.08] pb-1">
          <button
            type="button"
            onClick={() => setActiveTab("presets")}
            data-testid="tab-presets"
            className={`flex items-center gap-1.5 border-b-2 px-3 py-1.5 text-xs font-medium transition ${
              activeTab === "presets"
                ? "border-[#3b82f6] text-white"
                : "border-transparent text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <Sparkles className="size-3.5" />
            Preset Desain
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("colors")}
            data-testid="tab-colors"
            className={`flex items-center gap-1.5 border-b-2 px-3 py-1.5 text-xs font-medium transition ${
              activeTab === "colors"
                ? "border-[#3b82f6] text-white"
                : "border-transparent text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <Palette className="size-3.5" />
            Token Warna
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("typography")}
            data-testid="tab-typography"
            className={`flex items-center gap-1.5 border-b-2 px-3 py-1.5 text-xs font-medium transition ${
              activeTab === "typography"
                ? "border-[#3b82f6] text-white"
                : "border-transparent text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <Type className="size-3.5" />
            Tipografi
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("effects")}
            data-testid="tab-effects"
            className={`flex items-center gap-1.5 border-b-2 px-3 py-1.5 text-xs font-medium transition ${
              activeTab === "effects"
                ? "border-[#3b82f6] text-white"
                : "border-transparent text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <Square className="size-3.5" />
            Sudut & Bayangan
          </button>
        </div>

        {/* Tab Content: Presets */}
        {activeTab === "presets" && (
          <div className="grid grid-cols-2 gap-2.5 max-h-60 overflow-y-auto pr-1">
            {DESIGN_SYSTEM_PRESETS.map((preset) => {
              const isSelected = theme.presetId === preset.id;
              return (
                <button
                  key={preset.id}
                  type="button"
                  data-testid={`preset-${preset.id}`}
                  onClick={() => applyPreset(preset.id)}
                  className={`group flex flex-col text-left rounded-xl border p-3 transition ${
                    isSelected
                      ? "border-[#3b82f6] bg-[#3b82f6]/10"
                      : "border-white/[0.08] bg-white/[0.02] hover:border-white/[0.16] hover:bg-white/[0.04]"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-semibold text-white">
                      {preset.name}
                    </span>
                    {isSelected && <Check className="size-3.5 text-[#3b82f6]" />}
                  </div>
                  <p className="text-[11px] text-zinc-400 line-clamp-2 mb-2 leading-relaxed">
                    {preset.description}
                  </p>
                  <div className="flex items-center gap-1.5 mt-auto">
                    <span
                      className="size-3.5 rounded-full border border-black/20"
                      style={{ backgroundColor: preset.theme.primaryColor }}
                    />
                    <span
                      className="size-3.5 rounded-full border border-black/20"
                      style={{ backgroundColor: preset.theme.backgroundColor }}
                    />
                    <span
                      className="size-3.5 rounded-full border border-black/20"
                      style={{ backgroundColor: preset.theme.surfaceColor }}
                    />
                    <span className="text-[10px] text-zinc-500 font-mono ml-auto">
                      {preset.theme.headingFont}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* Tab Content: Colors */}
        {activeTab === "colors" && (
          <div className="grid grid-cols-2 gap-3 max-h-60 overflow-y-auto pr-1">
            <div>
              <label className="mb-1 block text-xs font-medium text-zinc-300">
                Primary (Warna Utama)
              </label>
              <div className="flex h-8.5 items-center gap-2 rounded-lg border border-white/[0.08] bg-white/[0.025] px-2">
                <input
                  type="color"
                  data-testid="input-primary-color"
                  value={theme.primaryColor || "#2563eb"}
                  onChange={(e) =>
                    setTheme({ ...theme, primaryColor: e.target.value, presetId: undefined })
                  }
                  className="size-5 cursor-pointer rounded border border-white/20 bg-transparent"
                />
                <input
                  type="text"
                  value={theme.primaryColor}
                  onChange={(e) =>
                    setTheme({ ...theme, primaryColor: e.target.value, presetId: undefined })
                  }
                  className="min-w-0 flex-1 bg-transparent font-mono text-xs text-zinc-200 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-zinc-300">
                Secondary (Warna Kedua)
              </label>
              <div className="flex h-8.5 items-center gap-2 rounded-lg border border-white/[0.08] bg-white/[0.025] px-2">
                <input
                  type="color"
                  value={theme.secondaryColor || "#475569"}
                  onChange={(e) =>
                    setTheme({ ...theme, secondaryColor: e.target.value, presetId: undefined })
                  }
                  className="size-5 cursor-pointer rounded border border-white/20 bg-transparent"
                />
                <input
                  type="text"
                  value={theme.secondaryColor}
                  onChange={(e) =>
                    setTheme({ ...theme, secondaryColor: e.target.value, presetId: undefined })
                  }
                  className="min-w-0 flex-1 bg-transparent font-mono text-xs text-zinc-200 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-zinc-300">
                Background (Latar Halaman)
              </label>
              <div className="flex h-8.5 items-center gap-2 rounded-lg border border-white/[0.08] bg-white/[0.025] px-2">
                <input
                  type="color"
                  value={theme.backgroundColor || "#ffffff"}
                  onChange={(e) =>
                    setTheme({ ...theme, backgroundColor: e.target.value, presetId: undefined })
                  }
                  className="size-5 cursor-pointer rounded border border-white/20 bg-transparent"
                />
                <input
                  type="text"
                  value={theme.backgroundColor}
                  onChange={(e) =>
                    setTheme({ ...theme, backgroundColor: e.target.value, presetId: undefined })
                  }
                  className="min-w-0 flex-1 bg-transparent font-mono text-xs text-zinc-200 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-zinc-300">
                Surface (Latar Card/Komponen)
              </label>
              <div className="flex h-8.5 items-center gap-2 rounded-lg border border-white/[0.08] bg-white/[0.025] px-2">
                <input
                  type="color"
                  value={theme.surfaceColor || "#f8fafc"}
                  onChange={(e) =>
                    setTheme({ ...theme, surfaceColor: e.target.value, presetId: undefined })
                  }
                  className="size-5 cursor-pointer rounded border border-white/20 bg-transparent"
                />
                <input
                  type="text"
                  value={theme.surfaceColor}
                  onChange={(e) =>
                    setTheme({ ...theme, surfaceColor: e.target.value, presetId: undefined })
                  }
                  className="min-w-0 flex-1 bg-transparent font-mono text-xs text-zinc-200 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-zinc-300">
                Text (Teks Utama)
              </label>
              <div className="flex h-8.5 items-center gap-2 rounded-lg border border-white/[0.08] bg-white/[0.025] px-2">
                <input
                  type="color"
                  data-testid="input-text-color"
                  value={theme.textColor || "#0f172a"}
                  onChange={(e) =>
                    setTheme({ ...theme, textColor: e.target.value, presetId: undefined })
                  }
                  className="size-5 cursor-pointer rounded border border-white/20 bg-transparent"
                />
                <input
                  type="text"
                  value={theme.textColor}
                  onChange={(e) =>
                    setTheme({ ...theme, textColor: e.target.value, presetId: undefined })
                  }
                  className="min-w-0 flex-1 bg-transparent font-mono text-xs text-zinc-200 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-zinc-300">
                Border (Garis Tepi)
              </label>
              <div className="flex h-8.5 items-center gap-2 rounded-lg border border-white/[0.08] bg-white/[0.025] px-2">
                <input
                  type="color"
                  value={theme.borderColor || "#e2e8f0"}
                  onChange={(e) =>
                    setTheme({ ...theme, borderColor: e.target.value, presetId: undefined })
                  }
                  className="size-5 cursor-pointer rounded border border-white/20 bg-transparent"
                />
                <input
                  type="text"
                  value={theme.borderColor}
                  onChange={(e) =>
                    setTheme({ ...theme, borderColor: e.target.value, presetId: undefined })
                  }
                  className="min-w-0 flex-1 bg-transparent font-mono text-xs text-zinc-200 outline-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* Tab Content: Typography */}
        {activeTab === "typography" && (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-zinc-300">
                Font Judul (Heading)
              </label>
              <select
                value={theme.headingFont}
                data-testid="select-heading-font"
                onChange={(e) =>
                  setTheme({ ...theme, headingFont: e.target.value, presetId: undefined })
                }
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
                data-testid="select-body-font"
                onChange={(e) =>
                  setTheme({ ...theme, bodyFont: e.target.value, presetId: undefined })
                }
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
                Ukuran Font Dasar
              </label>
              <select
                value={theme.fontSizeBase || "16px"}
                onChange={(e) =>
                  setTheme({ ...theme, fontSizeBase: e.target.value, presetId: undefined })
                }
                className={`${FIELD_CLASS} cursor-pointer appearance-none`}
              >
                <option value="14px">14px (Kompak)</option>
                <option value="16px">16px (Standar)</option>
                <option value="18px">18px (Besar)</option>
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-zinc-300">
                Font Monospace
              </label>
              <select
                value={theme.monoFont || "ui-monospace, monospace"}
                onChange={(e) =>
                  setTheme({ ...theme, monoFont: e.target.value, presetId: undefined })
                }
                className={`${FIELD_CLASS} cursor-pointer appearance-none`}
              >
                <option value="ui-monospace, monospace">System Monospace</option>
                <option value="'Space Grotesk', monospace">Space Grotesk</option>
                <option value="'Courier New', monospace">Courier New</option>
              </select>
            </div>
          </div>
        )}

        {/* Tab Content: Effects */}
        {activeTab === "effects" && (
          <div className="space-y-3">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-zinc-300">
                Preset Sudut (Radius)
              </label>
              <div className="grid grid-cols-5 gap-2">
                {(["none", "sm", "md", "lg", "full"] as const).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setTheme({ ...theme, radiusPreset: r, presetId: undefined })}
                    className={`flex flex-col items-center justify-center p-2 rounded-lg border text-xs font-medium transition ${
                      theme.radiusPreset === r
                        ? "border-[#3b82f6] bg-[#3b82f6]/10 text-white"
                        : "border-white/[0.08] text-zinc-400 hover:border-white/[0.16] hover:text-zinc-200"
                    }`}
                  >
                    <span className="capitalize">{r}</span>
                    <span className="text-[10px] text-zinc-500 mt-0.5">
                      {RADIUS_VALUES[r].md}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-zinc-300">
                Preset Bayangan (Shadow)
              </label>
              <div className="grid grid-cols-4 gap-2">
                {(["none", "subtle", "medium", "dramatic"] as const).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setTheme({ ...theme, shadowPreset: s, presetId: undefined })}
                    className={`flex flex-col items-center justify-center p-2 rounded-lg border text-xs font-medium transition ${
                      theme.shadowPreset === s
                        ? "border-[#3b82f6] bg-[#3b82f6]/10 text-white"
                        : "border-white/[0.08] text-zinc-400 hover:border-white/[0.16] hover:text-zinc-200"
                    }`}
                  >
                    <span className="capitalize">{s}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Interactive Live Preview Card */}
        <div
          data-testid="theme-live-preview"
          className="rounded-xl border p-4 transition-all duration-300"
          style={{
            backgroundColor: theme.surfaceColor || "#f8fafc",
            borderColor: theme.borderColor || "#e2e8f0",
            borderRadius: currentRadius,
            boxShadow: currentShadow,
          }}
        >
          <div className="flex items-center justify-between mb-2">
            <span
              className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full"
              style={{
                backgroundColor: theme.primaryColor || "#2563eb",
                color: "#ffffff",
                borderRadius: currentRadius,
              }}
            >
              Pratinjau Live Design System
            </span>
            <span
              className="text-[10px] font-mono"
              style={{ color: theme.mutedTextColor || "#64748b" }}
            >
              {theme.headingFont} · {theme.fontSizeBase || "16px"}
            </span>
          </div>

          <h3
            className="text-base font-bold tracking-tight"
            style={{
              color: theme.textColor || "#0f172a",
              fontFamily: `'${theme.headingFont}', sans-serif`,
            }}
          >
            Sistem Desain Visual yang Konsisten
          </h3>

          <p
            className="mt-1 text-xs leading-5"
            style={{
              color: theme.mutedTextColor || "#64748b",
              fontFamily: `'${theme.bodyFont}', sans-serif`,
            }}
          >
            Perubahan pada token warna, font, radius, dan bayangan langsung mengubah variabel
            CSS proyek secara terpusat tanpa merusak kode kustom pengguna.
          </p>

          <div className="mt-3 flex items-center gap-2">
            <button
              type="button"
              className="px-3 py-1.5 text-xs font-semibold text-white transition hover:opacity-90"
              style={{
                backgroundColor: theme.primaryColor || "#2563eb",
                borderRadius: currentRadius,
              }}
            >
              Tombol Utama
            </button>
            <button
              type="button"
              className="border px-3 py-1.5 text-xs font-medium transition hover:opacity-90"
              style={{
                backgroundColor: theme.backgroundColor || "#ffffff",
                borderColor: theme.borderColor || "#e2e8f0",
                color: theme.textColor || "#0f172a",
                borderRadius: currentRadius,
              }}
            >
              Tombol Sekunder
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
