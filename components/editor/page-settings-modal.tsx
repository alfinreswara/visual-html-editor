"use client";

import { useState } from "react";
import {
  Check,
  FileCode,
  Globe,
  Image as ImageIcon,
  LoaderCircle,
  Share2,
  Sparkles,
} from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { getPageMetadata, updatePageMetadata, type PageMetadata } from "@/lib/html";

interface PageSettingsModalProps {
  open: boolean;
  onClose: () => void;
  activePath: string;
  html: string;
  onSave: (nextHtml: string) => void;
}

export default function PageSettingsModal({
  open,
  onClose,
  activePath,
  html,
  onSave,
}: PageSettingsModalProps) {
  const initialMeta = getPageMetadata(html);
  const [meta, setMeta] = useState<PageMetadata>(initialMeta);
  const [activeTab, setActiveTab] = useState<"seo" | "og">("seo");
  const [saving, setSaving] = useState(false);

  function handleSave() {
    setSaving(true);
    try {
      const nextHtml = updatePageMetadata(html, meta);
      onSave(nextHtml);
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
      title={`Pengaturan Halaman · ${activePath}`}
      description="Atur judul, meta SEO, favicon, dan Open Graph (media sosial) untuk halaman ini."
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
            Simpan Pengaturan
          </button>
        </>
      }
    >
      <div className="space-y-4">
        {/* Tab switcher */}
        <div className="grid grid-cols-2 gap-1 rounded-lg border border-white/[0.08] bg-black/40 p-0.5">
          <button
            type="button"
            onClick={() => setActiveTab("seo")}
            className={`flex h-7.5 items-center justify-center gap-1.5 rounded-md text-xs font-medium transition ${
              activeTab === "seo"
                ? "bg-white/10 text-white shadow-sm"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <Globe className="size-3.5" />
            Meta & SEO
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("og")}
            className={`flex h-7.5 items-center justify-center gap-1.5 rounded-md text-xs font-medium transition ${
              activeTab === "og"
                ? "bg-white/10 text-white shadow-sm"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <Share2 className="size-3.5" />
            Open Graph (Sosial)
          </button>
        </div>

        {activeTab === "seo" ? (
          <div className="space-y-3.5">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-zinc-300">
                Judul Halaman (&lt;title&gt;)
              </label>
              <input
                type="text"
                value={meta.title}
                onChange={(e) => setMeta({ ...meta, title: e.target.value })}
                placeholder="Contoh: Beranda — Brand Keren"
                className={FIELD_CLASS}
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-zinc-300">
                Deskripsi Meta (&lt;meta name=&quot;description&quot;&gt;)
              </label>
              <textarea
                value={meta.description}
                onChange={(e) => setMeta({ ...meta, description: e.target.value })}
                rows={3}
                placeholder="Ringkasan isi halaman yang muncul di hasil pencarian Google..."
                className="focus-ring block min-h-[68px] w-full resize-y rounded-lg border border-white/[0.08] bg-white/[0.025] p-2.5 text-xs leading-5 text-zinc-200 outline-none transition placeholder:text-zinc-600 focus:border-[#3b82f6]/50 focus:bg-white/[0.04]"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-zinc-300">
                URL Favicon (Ikon Tab Browser)
              </label>
              <input
                type="text"
                value={meta.favicon}
                onChange={(e) => setMeta({ ...meta, favicon: e.target.value })}
                placeholder="favicon.ico atau https://.../favicon.png"
                className={FIELD_CLASS}
              />
            </div>

            {/* Google Search Snippet Preview */}
            <div className="rounded-xl border border-white/[0.07] bg-white/[0.015] p-3">
              <span className="mb-2 block text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
                Pratinjau Hasil Pencarian Google
              </span>
              <div className="font-sans text-xs">
                <span className="block text-[11px] text-zinc-500">
                  https://website-kamu.com › {activePath.replace(/\.html$/, "")}
                </span>
                <span className="mt-0.5 block text-[13px] font-medium text-[#8ab4f8] hover:underline cursor-pointer">
                  {meta.title || "Judul Halaman Belum Diatur"}
                </span>
                <span className="mt-1 block text-[11.5px] leading-4 text-zinc-400">
                  {meta.description ||
                    "Tambahkan deskripsi meta agar pengguna tahu gambaran isi halamanmu sebelum mengklik link di Google."}
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-3.5">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-zinc-300">
                OG Title (Judul Kartu Sosial)
              </label>
              <input
                type="text"
                value={meta.ogTitle}
                onChange={(e) => setMeta({ ...meta, ogTitle: e.target.value })}
                placeholder={meta.title || "Judul Open Graph..."}
                className={FIELD_CLASS}
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-zinc-300">
                OG Description (Deskripsi Kartu Sosial)
              </label>
              <textarea
                value={meta.ogDescription}
                onChange={(e) => setMeta({ ...meta, ogDescription: e.target.value })}
                rows={2}
                placeholder={meta.description || "Deskripsi saat dibagikan ke WhatsApp, Twitter, FB..."}
                className="focus-ring block min-h-[58px] w-full resize-y rounded-lg border border-white/[0.08] bg-white/[0.025] p-2.5 text-xs leading-5 text-zinc-200 outline-none transition placeholder:text-zinc-600 focus:border-[#3b82f6]/50 focus:bg-white/[0.04]"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-zinc-300">
                OG Image URL (Banner Gambar Saat Dishare)
              </label>
              <input
                type="text"
                value={meta.ogImage}
                onChange={(e) => setMeta({ ...meta, ogImage: e.target.value })}
                placeholder="https://.../og-banner.png atau assets/og.jpg"
                className={FIELD_CLASS}
              />
            </div>

            {/* Social Card Preview */}
            <div className="overflow-hidden rounded-xl border border-white/[0.08] bg-[#141418]">
              {meta.ogImage ? (
                <div className="relative h-32 w-full overflow-hidden bg-black/40">
                  <img
                    src={meta.ogImage}
                    alt="OG Preview"
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = "none";
                    }}
                  />
                </div>
              ) : (
                <div className="flex h-24 items-center justify-center bg-white/[0.02] text-zinc-600">
                  <ImageIcon className="mr-2 size-4" />
                  <span className="text-xs">Belum ada gambar OG</span>
                </div>
              )}
              <div className="p-3">
                <span className="block text-[10px] uppercase tracking-wider text-zinc-500">
                  website-kamu.com
                </span>
                <span className="mt-0.5 block text-xs font-semibold text-zinc-200">
                  {meta.ogTitle || meta.title || "Judul Belum Diatur"}
                </span>
                <span className="mt-1 block text-[11px] leading-4 text-zinc-400">
                  {meta.ogDescription || meta.description || "Deskripsi belum diatur."}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
