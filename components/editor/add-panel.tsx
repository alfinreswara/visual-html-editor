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
  Sparkles,
} from "lucide-react";
import type { InsertPosition, NewElementKind } from "@/lib/html";
import { cn } from "@/lib/utils";

const ELEMENTS: Array<{
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

export default function AddPanel({
  selectionId,
  selectionTag,
  canInsertInside,
  onAdd,
}: {
  selectionId: string | null;
  selectionTag: string | null;
  canInsertInside: boolean;
  onAdd: (kind: NewElementKind, position: InsertPosition) => void;
}) {
  const [position, setPosition] = useState<InsertPosition>("after");
  const [query, setQuery] = useState("");

  const filtered = ELEMENTS.filter(
    (item) =>
      item.label.toLowerCase().includes(query.toLowerCase()) ||
      item.tag.toLowerCase().includes(query.toLowerCase()) ||
      item.description.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <div className="flex h-full min-h-0 flex-col bg-[#0b0b0e]">
      <div className="border-b border-white/[0.07] p-3.5">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="grid size-6 place-items-center rounded-md bg-[#3b82f6]/15 text-[#60a5fa]">
              <Plus className="size-3.5" />
            </span>
            <h2 className="text-xs font-semibold text-zinc-100">Tambah Elemen</h2>
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
          <div className="mb-3 grid grid-cols-2 gap-1 rounded-lg border border-white/[0.07] bg-black/30 p-0.5">
            <button
              type="button"
              onClick={() => setPosition("after")}
              className={cn(
                "h-6.5 rounded-[5px] text-[10px] font-medium transition",
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
                "h-6.5 rounded-[5px] text-[10px] font-medium transition",
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

        {/* Search box */}
        <div className="relative">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3 -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari komponen..."
            className="focus-ring h-7.5 w-full rounded-lg border border-white/[0.08] bg-white/[0.025] pl-7.5 pr-2.5 text-[11px] text-zinc-200 outline-none transition placeholder:text-zinc-600 focus:border-[#3b82f6]/50 focus:bg-white/[0.04]"
          />
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto p-3">
        <div className="space-y-1.5">
          {filtered.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.kind}
                type="button"
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
          {filtered.length === 0 ? (
            <div className="py-8 text-center text-xs text-zinc-500">
              Tidak ada komponen yang cocok dengan &ldquo;{query}&rdquo;
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
