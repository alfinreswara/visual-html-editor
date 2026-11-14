"use client";

import { useEffect, useMemo, useRef, useState, type ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  SlidersHorizontal,
  Sparkles,
  Download,
  Trash2,
  Upload,
  Eye,
  Plus,
  Layers,
  FileCode2,
  LoaderCircle,
  FolderOpen,
  ArrowRight,
} from "lucide-react";
import { BUILTIN_TEMPLATES } from "@/lib/templates/builtin-templates";
import {
  TEMPLATE_CATEGORIES,
  type TemplateCategory,
  type WebsiteTemplate,
} from "@/lib/templates/types";
import {
  getUserTemplatesAsync,
  deleteUserTemplateAsync,
  exportTemplateZip,
  importTemplateZip,
  saveUserTemplateAsync,
} from "@/lib/templates/template-storage";
import { cloneTemplateToProject } from "@/lib/templates/template-cloner";
import { saveProjectAsync } from "@/lib/projects";
import TemplatePreviewModal from "./template-preview-modal";
import { cn } from "@/lib/utils";

interface TemplateGalleryProps {
  onSelectTemplate?: (template: WebsiteTemplate) => void;
  className?: string;
  isEmbedded?: boolean;
}

export default function TemplateGallery({
  onSelectTemplate,
  className,
  isEmbedded = false,
}: TemplateGalleryProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [activeCategory, setActiveCategory] = useState<TemplateCategory | "Kustom">("Semua");
  const [searchQuery, setSearchQuery] = useState("");
  const [onlyFeatured, setOnlyFeatured] = useState(false);
  const [sortBy, setSortBy] = useState<"featured" | "newest" | "alpha">("featured");

  const [userTemplates, setUserTemplates] = useState<WebsiteTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [importing, setImporting] = useState(false);
  const [actionError, setActionError] = useState("");
  const [actionSuccess, setActionSuccess] = useState("");

  const [previewTemplate, setPreviewTemplate] = useState<WebsiteTemplate | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);

  useEffect(() => {
    void getUserTemplatesAsync().then((list) => {
      setUserTemplates(list);
      setLoading(false);
    });
  }, []);

  const allTemplates = useMemo(() => {
    return [...BUILTIN_TEMPLATES, ...userTemplates];
  }, [userTemplates]);

  const filteredTemplates = useMemo(() => {
    return allTemplates.filter((template) => {
      // Category filter
      if (activeCategory === "Kustom") {
        if (!template.isCustom) return false;
      } else if (activeCategory !== "Semua") {
        if (template.category !== activeCategory) return false;
      }

      // Featured filter
      if (onlyFeatured && !template.featured) return false;

      // Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = template.name.toLowerCase().includes(q);
        const matchDesc = template.description.toLowerCase().includes(q);
        const matchCat = template.category.toLowerCase().includes(q);
        const matchTag = template.tags?.some((t) => t.toLowerCase().includes(q));
        if (!matchName && !matchDesc && !matchCat && !matchTag) return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === "alpha") return a.name.localeCompare(b.name);
      if (sortBy === "newest") return b.createdAt - a.createdAt;
      // "featured" default
      if (a.featured && !b.featured) return -1;
      if (!a.featured && b.featured) return 1;
      return a.name.localeCompare(b.name);
    });
  }, [allTemplates, activeCategory, onlyFeatured, searchQuery, sortBy]);

  async function handleCreateProjectFromTemplate(template: WebsiteTemplate) {
    try {
      setLoading(true);
      const project = cloneTemplateToProject(template, template.name);
      await saveProjectAsync(project);

      if (onSelectTemplate) {
        onSelectTemplate(template);
      } else {
        router.push(`/editor/${project.id}`);
      }
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Gagal membuat project dari template.");
      setLoading(false);
    }
  }

  async function handleDeleteUserTemplate(id: string, name: string) {
    if (!confirm(`Hapus template "${name}" dari pustaka pribadi Anda?`)) return;
    await deleteUserTemplateAsync(id);
    const updated = await getUserTemplatesAsync();
    setUserTemplates(updated);
    setActionSuccess(`Template "${name}" berhasil dihapus.`);
    setTimeout(() => setActionSuccess(""), 4000);
  }

  async function handleExportTemplateZip(template: WebsiteTemplate) {
    try {
      const { blob, filename } = await exportTemplateZip(template);
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = filename;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      setTimeout(() => URL.revokeObjectURL(url), 10_000);
      setActionSuccess(`Template "${template.name}" berhasil diekspor.`);
      setTimeout(() => setActionSuccess(""), 4000);
    } catch {
      setActionError("Gagal mengekspor template sebagai ZIP.");
    }
  }

  async function handleImportZipChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setImporting(true);
    setActionError("");
    setActionSuccess("");

    try {
      const buffer = await file.arrayBuffer();
      const imported = await importTemplateZip(buffer);
      await saveUserTemplateAsync(imported);
      const updated = await getUserTemplatesAsync();
      setUserTemplates(updated);
      setActiveCategory("Kustom");
      setActionSuccess(`Template "${imported.name}" berhasil diimpor ke pustaka Anda!`);
      setTimeout(() => setActionSuccess(""), 5000);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Gagal mengimpor file template ZIP.");
    } finally {
      setImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  function openPreview(template: WebsiteTemplate) {
    setPreviewTemplate(template);
    setPreviewOpen(true);
  }

  return (
    <div className={cn("space-y-6 text-zinc-100", className)}>
      {/* Hidden file input for ZIP import */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".zip,application/zip"
        onChange={handleImportZipChange}
        className="hidden"
      />

      {/* Header bar: Title & Actions */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white sm:text-2xl">
            Pustaka Template Lengkap
          </h1>
          <p className="mt-1 text-xs text-zinc-400">
            Pilih situs web multi-halaman siap pakai, pratinjau secara responsif, dan edit di kanvas visual.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={importing}
            data-testid="import-template-zip-btn"
            className="focus-ring inline-flex h-9 items-center gap-1.5 rounded-xl border border-white/[0.08] bg-white/[0.03] px-3.5 text-xs font-medium text-zinc-200 transition hover:bg-white/[0.07] hover:text-white"
          >
            {importing ? (
              <LoaderCircle className="size-3.5 animate-spin text-blue-400" />
            ) : (
              <Upload className="size-3.5 text-blue-400" />
            )}
            Impor Template (.zip)
          </button>
        </div>
      </div>

      {/* Alerts */}
      {actionError && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-xs text-red-300">
          {actionError}
        </div>
      )}
      {actionSuccess && (
        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3 text-xs text-emerald-300">
          {actionSuccess}
        </div>
      )}

      {/* Search, Categories, & Filters */}
      <div className="space-y-3.5">
        <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
          {/* Search box */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-zinc-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari template, fitur, atau kata kunci..."
              data-testid="search-template-input"
              className="focus-ring h-9 w-full rounded-xl border border-white/[0.08] bg-white/[0.025] pl-9 pr-3 text-xs text-zinc-200 outline-none transition placeholder:text-zinc-600 focus:border-[#3b82f6]/50 focus:bg-white/[0.04]"
            />
          </div>

          {/* Controls: Featured toggle & Sort */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setOnlyFeatured(!onlyFeatured)}
              data-testid="toggle-featured-btn"
              className={cn(
                "flex h-9 items-center gap-1.5 rounded-xl border px-3 text-xs font-medium transition",
                onlyFeatured
                  ? "border-amber-500/30 bg-amber-500/10 text-amber-300"
                  : "border-white/[0.08] bg-white/[0.025] text-zinc-400 hover:text-zinc-200",
              )}
            >
              <Sparkles className="size-3 text-amber-400" />
              Unggulan
            </button>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="focus-ring h-9 rounded-xl border border-white/[0.08] bg-white/[0.025] px-2.5 text-xs text-zinc-300 outline-none hover:bg-white/[0.04]"
            >
              <option value="featured" className="bg-[#18181b]">Urutkan: Rekomendasi</option>
              <option value="newest" className="bg-[#18181b]">Urutkan: Terbaru</option>
              <option value="alpha" className="bg-[#18181b]">Urutkan: Nama (A-Z)</option>
            </select>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {TEMPLATE_CATEGORIES.map((cat) => {
            const active = activeCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveCategory(cat)}
                data-testid={`category-filter-${cat.toLowerCase()}`}
                className={cn(
                  "shrink-0 rounded-xl px-3 py-1.5 text-xs font-medium transition",
                  active
                    ? "bg-[#3b82f6] text-white shadow-sm"
                    : "border border-white/[0.07] bg-white/[0.02] text-zinc-400 hover:border-white/[0.12] hover:text-zinc-200",
                )}
              >
                {cat}
              </button>
            );
          })}

          <button
            type="button"
            onClick={() => setActiveCategory("Kustom")}
            data-testid="category-filter-custom"
            className={cn(
              "shrink-0 rounded-xl px-3 py-1.5 text-xs font-medium transition flex items-center gap-1.5",
              activeCategory === "Kustom"
                ? "bg-[#3b82f6] text-white shadow-sm"
                : "border border-white/[0.07] bg-white/[0.02] text-zinc-400 hover:border-white/[0.12] hover:text-zinc-200",
            )}
          >
            <FolderOpen className="size-3" />
            Template Saya ({userTemplates.length})
          </button>
        </div>
      </div>

      {/* Grid of Template Cards */}
      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <LoaderCircle className="size-6 animate-spin text-blue-500" />
        </div>
      ) : filteredTemplates.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/[0.08] bg-white/[0.01] p-12 text-center">
          <FolderOpen className="size-10 text-zinc-600 mb-3" />
          <h3 className="text-sm font-semibold text-zinc-300">Tidak ada template ditemukan</h3>
          <p className="mt-1 text-xs text-zinc-500 max-w-sm">
            {activeCategory === "Kustom"
              ? "Anda belum menyimpan template pribadi. Anda dapat menyimpan proyek aktif apa pun sebagai template dari editor."
              : "Coba ubah kata kunci pencarian atau pilih kategori lain."}
          </p>
          {activeCategory === "Kustom" && (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="mt-4 focus-ring inline-flex h-8 items-center gap-1.5 rounded-lg bg-[#3b82f6] px-3 text-xs font-semibold text-white"
            >
              <Upload className="size-3.5" />
              Impor File ZIP
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredTemplates.map((template) => {
            const isCustom = Boolean(template.isCustom);
            return (
              <article
                key={template.id}
                data-testid={`template-card-${template.id}`}
                className="group relative flex flex-col overflow-hidden rounded-2xl border border-white/[0.08] bg-[#101014] transition duration-300 hover:-translate-y-1 hover:border-white/[0.18] hover:shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
              >
                {/* Visual Thumbnail Area */}
                <div
                  className="relative aspect-[16/10] overflow-hidden p-4 cursor-pointer"
                  style={{
                    background: `linear-gradient(145deg, ${template.thumbnailGradient.from} 0%, ${template.thumbnailGradient.to} 100%)`,
                  }}
                  onClick={() => openPreview(template)}
                >
                  {/* Browser window representation */}
                  <div className="absolute inset-x-5 top-5 bottom-0 overflow-hidden rounded-t-[10px] bg-white/95 shadow-xl ring-1 ring-black/[0.08]">
                    <div className="flex h-5 items-center gap-1 border-b border-black/[0.06] px-2.5">
                      <span className="size-1.5 rounded-full bg-red-400" />
                      <span className="size-1.5 rounded-full bg-amber-400" />
                      <span className="size-1.5 rounded-full bg-emerald-400" />
                      <span className="ml-2 h-1.5 w-16 rounded-full bg-black/10" />
                    </div>
                    <div className="p-3">
                      <span
                        className="text-[8px] font-bold uppercase tracking-wider block mb-1"
                        style={{ color: template.thumbnailGradient.accent }}
                      >
                        {template.category}
                      </span>
                      <h4 className="line-clamp-1 font-serif text-xs font-bold text-zinc-900">
                        {template.name}
                      </h4>
                      <div className="mt-2 space-y-1">
                        <span className="block h-1 w-[80%] rounded-full bg-black/10" />
                        <span className="block h-1 w-[50%] rounded-full bg-black/5" />
                      </div>
                    </div>
                  </div>

                  {/* Top Badges */}
                  <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                    <span className="rounded-full bg-black/60 px-2 py-0.5 text-[9px] font-semibold text-white backdrop-blur">
                      {template.category}
                    </span>
                    {template.featured && (
                      <span className="rounded-full bg-amber-500/90 px-2 py-0.5 text-[9px] font-bold text-black backdrop-blur flex items-center gap-0.5">
                        <Sparkles className="size-2.5" />
                        Unggulan
                      </span>
                    )}
                  </div>

                  <span className="absolute top-2.5 right-2.5 rounded-full bg-black/60 px-2 py-0.5 text-[9px] font-medium text-zinc-300 backdrop-blur">
                    {template.pages.length} Halaman
                  </span>

                  {/* Hover Overlay Button */}
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 backdrop-blur-[2px] transition duration-200 group-hover:opacity-100">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        openPreview(template);
                      }}
                      className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-white px-3 text-xs font-semibold text-zinc-900 shadow-xl transition hover:bg-zinc-100"
                    >
                      <Eye className="size-3.5" />
                      Pratinjau
                    </button>
                  </div>
                </div>

                {/* Content Details */}
                <div className="flex flex-1 flex-col p-4">
                  <div className="flex-1">
                    <h3 className="line-clamp-1 text-sm font-semibold text-zinc-100 group-hover:text-blue-400 transition-colors">
                      {template.name}
                    </h3>
                    <p className="mt-1 line-clamp-2 text-[11px] leading-relaxed text-zinc-400">
                      {template.description}
                    </p>
                  </div>

                  {/* Sections Breakdown Tags */}
                  <div className="mt-3 flex flex-wrap gap-1">
                    {template.tags?.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="rounded bg-white/[0.04] px-1.5 py-0.5 font-mono text-[9px] text-zinc-400"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>

                  {/* Footer Actions */}
                  <div className="mt-4 flex items-center justify-between border-t border-white/[0.06] pt-3">
                    {isCustom ? (
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => void handleExportTemplateZip(template)}
                          className="grid size-7 place-items-center rounded-lg border border-white/[0.08] text-zinc-400 hover:text-white hover:bg-white/[0.06]"
                          title="Ekspor sebagai ZIP"
                        >
                          <Download className="size-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => void handleDeleteUserTemplate(template.id, template.name)}
                          className="grid size-7 place-items-center rounded-lg border border-red-500/20 text-red-400 hover:bg-red-500/10"
                          title="Hapus template"
                        >
                          <Trash2 className="size-3" />
                        </button>
                      </div>
                    ) : (
                      <span className="text-[10px] text-zinc-500">Official</span>
                    )}

                    <button
                      type="button"
                      onClick={() => void handleCreateProjectFromTemplate(template)}
                      data-testid={`use-template-btn-${template.id}`}
                      className="focus-ring inline-flex h-7 items-center gap-1 rounded-lg bg-[#3b82f6] px-2.5 text-[11px] font-semibold text-white transition hover:bg-[#2563eb]"
                    >
                      <Plus className="size-3" />
                      Gunakan Template
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* Interactive Preview Modal */}
      <TemplatePreviewModal
        template={previewTemplate}
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        onUseTemplate={(t) => {
          setPreviewOpen(false);
          void handleCreateProjectFromTemplate(t);
        }}
      />
    </div>
  );
}
