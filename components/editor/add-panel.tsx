"use client";

import { useState } from "react";
import {
  Box,
  Heading2,
  Image as ImageIcon,
  LayoutPanelTop,
  Link2,
  MousePointer2,
  Plus,
  Type,
  Search,
  Component,
  BookmarkCheck,
  Trash2,
  ArrowRight,
} from "lucide-react";
import type { InsertPosition, NewElementKind } from "@/lib/html";
import {
  COMPONENT_LIBRARY,
  COMPONENT_CATEGORIES,
  type ComponentCategory,
} from "@/lib/component-library";
import type { SavedSection } from "@/lib/saved-sections";
import { cn } from "@/lib/utils";

const BASE_ELEMENTS: Array<{
  kind: NewElementKind;
  label: string;
  tag: string;
  description: string;
  icon: typeof Type;
  category: "Konten" | "Tata Letak";
}> = [
  {
    kind: "section",
    label: "Section",
    tag: "<section>",
    description: "Blok utama pembungkus bagian halaman",
    icon: LayoutPanelTop,
    category: "Tata Letak",
  },
  {
    kind: "container",
    label: "Container",
    tag: "<div>",
    description: "Kotak pembungkus flex atau grid",
    icon: Box,
    category: "Tata Letak",
  },
  {
    kind: "heading",
    label: "Heading",
    tag: "<h2>",
    description: "Judul section berukuran besar",
    icon: Heading2,
    category: "Konten",
  },
  {
    kind: "text",
    label: "Teks Paragraf",
    tag: "<p>",
    description: "Blok paragraf teks deskripsi",
    icon: Type,
    category: "Konten",
  },
  {
    kind: "button",
    label: "Tombol",
    tag: "<button>",
    description: "Tombol interaktif dengan style aksi",
    icon: MousePointer2,
    category: "Konten",
  },
  {
    kind: "link",
    label: "Tautan",
    tag: "<a>",
    description: "Link teks yang dapat dinavigasi",
    icon: Link2,
    category: "Konten",
  },
  {
    kind: "image",
    label: "Gambar",
    tag: "<img>",
    description: "Elemen gambar atau placeholder",
    icon: ImageIcon,
    category: "Konten",
  },
];

type LibraryTab = "elements" | "components" | "sections" | "saved";

export interface AddPanelProps {
  selectionId: string | null;
  selectionTag: string | null;
  canInsertInside: boolean;
  savedSections?: SavedSection[];
  onAdd: (kind: NewElementKind, position: InsertPosition) => void;
  onInsertHtml?: (html: string, position: InsertPosition) => void;
  onDeleteSavedSection?: (id: string) => void;
}

export default function AddPanel({
  selectionId,
  selectionTag,
  canInsertInside,
  savedSections = [],
  onAdd,
  onInsertHtml,
  onDeleteSavedSection,
}: AddPanelProps) {
  const [activeTab, setActiveTab] = useState<LibraryTab>("elements");
  const [position, setPosition] = useState<InsertPosition>("after");
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("Semua");

  const filteredBase = BASE_ELEMENTS.filter(
    (item) =>
      item.label.toLowerCase().includes(query.toLowerCase()) ||
      item.tag.toLowerCase().includes(query.toLowerCase()) ||
      item.description.toLowerCase().includes(query.toLowerCase()),
  );

  const uiComponents = COMPONENT_LIBRARY.filter(
    (item) => item.category === "Komponen",
  ).filter(
    (item) =>
      item.name.toLowerCase().includes(query.toLowerCase()) ||
      item.description.toLowerCase().includes(query.toLowerCase()),
  );

  const readySections = COMPONENT_LIBRARY.filter(
    (item) => item.category !== "Komponen",
  )
    .filter(
      (item) =>
        selectedCategory === "Semua" || item.category === selectedCategory,
    )
    .filter(
      (item) =>
        item.name.toLowerCase().includes(query.toLowerCase()) ||
        item.description.toLowerCase().includes(query.toLowerCase()) ||
        item.category.toLowerCase().includes(query.toLowerCase()),
    );

  const filteredSaved = savedSections.filter(
    (item) =>
      item.name.toLowerCase().includes(query.toLowerCase()) ||
      (item.category && item.category.toLowerCase().includes(query.toLowerCase())) ||
      (item.description && item.description.toLowerCase().includes(query.toLowerCase())),
  );

  function handleInsertComponent(html: string) {
    if (onInsertHtml) {
      onInsertHtml(html, position);
    }
  }

  return (
    <div className="flex h-full min-h-0 flex-col bg-[#0b0b0e]">
      {/* Top Header & Position Selector */}
      <div className="border-b border-white/[0.07] p-3">
        <div className="mb-2.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="grid size-6 place-items-center rounded-md bg-[#3b82f6]/15 text-[#60a5fa]">
              <Plus className="size-3.5" />
            </span>
            <h2 className="text-xs font-semibold text-zinc-100">
              Pustaka Komponen & Section
            </h2>
          </div>
          {selectionId ? (
            <span className="rounded border border-white/[0.08] bg-white/[0.03] px-1.5 py-0.5 font-mono text-[9px] text-zinc-400">
              Target: &lt;{selectionTag}&gt;
            </span>
          ) : (
            <span className="rounded border border-white/[0.08] bg-white/[0.03] px-1.5 py-0.5 text-[9px] text-zinc-500">
              Di akhir halaman
            </span>
          )}
        </div>

        {/* Position picker */}
        {selectionId ? (
          <div className="mb-2.5 grid grid-cols-2 gap-1 rounded-lg border border-white/[0.07] bg-black/30 p-0.5">
            <button
              type="button"
              onClick={() => setPosition("after")}
              className={cn(
                "h-6 rounded-[5px] text-[10px] font-medium transition",
                position === "after"
                  ? "bg-white/10 text-zinc-100 shadow-sm"
                  : "text-zinc-500 hover:text-zinc-300",
              )}
            >
              Setelah elemen
            </button>
            <button
              type="button"
              disabled={!canInsertInside}
              onClick={() => setPosition("inside")}
              className={cn(
                "h-6 rounded-[5px] text-[10px] font-medium transition",
                position === "inside"
                  ? "bg-white/10 text-zinc-100 shadow-sm"
                  : "text-zinc-500 hover:text-zinc-300",
                !canInsertInside && "cursor-not-allowed opacity-40",
              )}
              title={
                canInsertInside
                  ? "Masukkan ke dalam container terpilih"
                  : "Elemen ini tidak dapat memuat elemen anak"
              }
            >
              Di dalam elemen
            </button>
          </div>
        ) : null}

        {/* Tab navigation */}
        <div className="grid grid-cols-4 gap-1 rounded-lg border border-white/[0.07] bg-white/[0.02] p-0.5 mb-2.5">
          <button
            type="button"
            data-testid="tab-elements"
            onClick={() => setActiveTab("elements")}
            className={cn(
              "flex flex-col items-center justify-center py-1.5 rounded-[5px] text-[10px] font-medium transition",
              activeTab === "elements"
                ? "bg-[#3b82f6]/20 text-[#60a5fa] font-semibold"
                : "text-zinc-400 hover:text-zinc-200",
            )}
          >
            Elemen
          </button>
          <button
            type="button"
            data-testid="tab-components"
            onClick={() => setActiveTab("components")}
            className={cn(
              "flex flex-col items-center justify-center py-1.5 rounded-[5px] text-[10px] font-medium transition",
              activeTab === "components"
                ? "bg-[#3b82f6]/20 text-[#60a5fa] font-semibold"
                : "text-zinc-400 hover:text-zinc-200",
            )}
          >
            Komponen
          </button>
          <button
            type="button"
            data-testid="tab-sections"
            onClick={() => setActiveTab("sections")}
            className={cn(
              "flex flex-col items-center justify-center py-1.5 rounded-[5px] text-[10px] font-medium transition",
              activeTab === "sections"
                ? "bg-[#3b82f6]/20 text-[#60a5fa] font-semibold"
                : "text-zinc-400 hover:text-zinc-200",
            )}
          >
            Section
          </button>
          <button
            type="button"
            data-testid="tab-saved"
            onClick={() => setActiveTab("saved")}
            className={cn(
              "flex flex-col items-center justify-center py-1.5 rounded-[5px] text-[10px] font-medium transition",
              activeTab === "saved"
                ? "bg-[#3b82f6]/20 text-[#60a5fa] font-semibold"
                : "text-zinc-400 hover:text-zinc-200",
            )}
          >
            Tersimpan
          </button>
        </div>

        {/* Search box */}
        <div className="relative">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3 -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            value={query}
            data-testid="search-library"
            onChange={(e) => setQuery(e.target.value)}
            placeholder={
              activeTab === "elements"
                ? "Cari elemen dasar..."
                : activeTab === "components"
                ? "Cari komponen UI..."
                : activeTab === "sections"
                ? "Cari template section..."
                : "Cari section tersimpan..."
            }
            className="focus-ring h-7 w-full rounded-lg border border-white/[0.08] bg-white/[0.025] pl-7.5 pr-2.5 text-[11px] text-zinc-200 outline-none transition placeholder:text-zinc-600 focus:border-[#3b82f6]/50 focus:bg-white/[0.04]"
          />
        </div>

        {/* Category pills for Sections tab */}
        {activeTab === "sections" && (
          <div className="flex gap-1 overflow-x-auto pt-2 no-scrollbar">
            {COMPONENT_CATEGORIES.filter((c) => c !== "Komponen").map((category) => (
              <button
                key={category}
                type="button"
                onClick={() => setSelectedCategory(category)}
                className={cn(
                  "px-2 py-0.5 rounded-full text-[10px] font-medium whitespace-nowrap transition",
                  selectedCategory === category
                    ? "bg-[#3b82f6] text-white"
                    : "bg-white/[0.04] text-zinc-400 hover:text-zinc-200",
                )}
              >
                {category}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Main Tab Content */}
      <div className="min-h-0 flex-1 overflow-y-auto p-3">
        {/* Tab 1: Elemen Dasar */}
        {activeTab === "elements" && (
          <div className="space-y-1.5">
            {filteredBase.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.kind}
                  type="button"
                  data-testid={`add-element-${item.kind}`}
                  onClick={() => onAdd(item.kind, position)}
                  className="group flex w-full items-start gap-3 rounded-xl border border-white/[0.05] bg-white/[0.015] p-2.5 text-left transition hover:border-[#3b82f6]/40 hover:bg-[#3b82f6]/[0.06]"
                >
                  <span className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-lg border border-white/[0.08] bg-white/[0.03] text-zinc-400 transition group-hover:border-[#3b82f6]/40 group-hover:bg-[#3b82f6]/15 group-hover:text-[#60a5fa]">
                    <Icon className="size-3.5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[11.5px] font-medium text-zinc-200 group-hover:text-white">
                        {item.label}
                      </span>
                      <span className="font-mono text-[9px] text-zinc-500">
                        {item.tag}
                      </span>
                    </div>
                    <p className="mt-0.5 text-[10px] leading-4 text-zinc-500 group-hover:text-zinc-400">
                      {item.description}
                    </p>
                  </div>
                </button>
              );
            })}
            {filteredBase.length === 0 ? (
              <div className="py-8 text-center text-xs text-zinc-500">
                Tidak ada elemen yang cocok dengan &ldquo;{query}&rdquo;
              </div>
            ) : null}
          </div>
        )}

        {/* Tab 2: Komponen UI */}
        {activeTab === "components" && (
          <div className="space-y-2">
            {uiComponents.map((item) => (
              <div
                key={item.id}
                data-testid={`component-item-${item.id}`}
                className="group rounded-xl border border-white/[0.06] bg-white/[0.02] p-2.5 transition hover:border-[#3b82f6]/40 hover:bg-[#3b82f6]/[0.04]"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-[11.5px] font-semibold text-zinc-200 group-hover:text-white">
                      {item.name}
                    </h3>
                    <p className="mt-0.5 text-[10.5px] leading-4 text-zinc-400">
                      {item.description}
                    </p>
                  </div>
                  <span className="rounded bg-white/[0.06] px-1.5 py-0.5 text-[9px] font-medium text-zinc-400">
                    UI
                  </span>
                </div>
                <div className="mt-2.5 flex items-center justify-end">
                  <button
                    type="button"
                    data-testid={`insert-component-${item.id}`}
                    onClick={() => handleInsertComponent(item.html)}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-[#3b82f6] px-2.5 py-1 text-[10.5px] font-semibold text-white transition hover:bg-[#2563eb]"
                  >
                    Sisipkan Komponen
                    <ArrowRight className="size-3" />
                  </button>
                </div>
              </div>
            ))}
            {uiComponents.length === 0 ? (
              <div className="py-8 text-center text-xs text-zinc-500">
                Tidak ada komponen UI yang cocok dengan &ldquo;{query}&rdquo;
              </div>
            ) : null}
          </div>
        )}

        {/* Tab 3: Section Siap Pakai */}
        {activeTab === "sections" && (
          <div className="space-y-2.5">
            {readySections.map((item) => (
              <div
                key={item.id}
                data-testid={`section-item-${item.id}`}
                className="group rounded-xl border border-white/[0.06] bg-white/[0.02] p-3 transition hover:border-[#3b82f6]/40 hover:bg-[#3b82f6]/[0.04]"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="rounded-full bg-[#3b82f6]/15 px-2 py-0.5 text-[9.5px] font-semibold text-[#60a5fa]">
                        {item.category}
                      </span>
                      <h3 className="text-[12px] font-semibold text-zinc-200 group-hover:text-white">
                        {item.name}
                      </h3>
                    </div>
                    <p className="mt-1 text-[11px] leading-relaxed text-zinc-400">
                      {item.description}
                    </p>
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-end">
                  <button
                    type="button"
                    data-testid={`insert-section-${item.id}`}
                    onClick={() => handleInsertComponent(item.html)}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-[#3b82f6] px-3 py-1.5 text-[11px] font-semibold text-white transition hover:bg-[#2563eb]"
                  >
                    Sisipkan Section
                    <ArrowRight className="size-3" />
                  </button>
                </div>
              </div>
            ))}
            {readySections.length === 0 ? (
              <div className="py-8 text-center text-xs text-zinc-500">
                Tidak ada section yang cocok dengan filter.
              </div>
            ) : null}
          </div>
        )}

        {/* Tab 4: Section Tersimpan */}
        {activeTab === "saved" && (
          <div className="space-y-2">
            {filteredSaved.map((item) => (
              <div
                key={item.id}
                data-testid={`saved-section-${item.id}`}
                className="group rounded-xl border border-white/[0.06] bg-white/[0.02] p-3 transition hover:border-white/[0.12]"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="rounded bg-white/[0.06] px-1.5 py-0.5 text-[9px] font-medium text-zinc-400">
                        {item.category || "Kustom"}
                      </span>
                      <h3 className="truncate text-[11.5px] font-semibold text-zinc-200">
                        {item.name}
                      </h3>
                    </div>
                    {item.previewSnippet && (
                      <p className="mt-1 line-clamp-2 text-[10.5px] text-zinc-400">
                        {item.previewSnippet}
                      </p>
                    )}
                  </div>
                  {onDeleteSavedSection && (
                    <button
                      type="button"
                      data-testid={`delete-saved-${item.id}`}
                      onClick={() => onDeleteSavedSection(item.id)}
                      className="rounded p-1 text-zinc-500 hover:bg-rose-500/10 hover:text-rose-400 transition"
                      title="Hapus section tersimpan"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  )}
                </div>
                <div className="mt-2.5 flex items-center justify-end">
                  <button
                    type="button"
                    data-testid={`insert-saved-${item.id}`}
                    onClick={() => handleInsertComponent(item.html)}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-white/[0.08] px-2.5 py-1 text-[10.5px] font-semibold text-zinc-200 transition hover:bg-[#3b82f6] hover:text-white"
                  >
                    Sisipkan
                    <ArrowRight className="size-3" />
                  </button>
                </div>
              </div>
            ))}

            {filteredSaved.length === 0 ? (
              <div className="rounded-xl border border-dashed border-white/[0.08] p-6 text-center">
                <BookmarkCheck className="mx-auto size-7 text-zinc-600 mb-2" />
                <h4 className="text-xs font-semibold text-zinc-300">
                  Belum ada section tersimpan
                </h4>
                <p className="mt-1 text-[11px] leading-relaxed text-zinc-500">
                  Pilih elemen atau section apa pun di canvas lalu klik &ldquo;Simpan Section&rdquo; di menu klik kanan atau panel inspector untuk menyimpannya ke sini.
                </p>
              </div>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}
