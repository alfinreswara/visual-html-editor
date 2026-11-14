"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import TemplateGallery from "@/components/templates/template-gallery";
import { Brand } from "@/components/brand";

export default function TemplatesPage() {
  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 flex flex-col">
      {/* Top Navbar */}
      <header className="border-b border-white/[0.08] bg-[#0c0c0f] sticky top-0 z-40">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white transition"
              aria-label="Kembali ke Beranda"
            >
              <ArrowLeft className="size-3.5" />
              <span>Beranda</span>
            </Link>
            <span className="h-4 w-px bg-white/10" />
            <Brand />
          </div>

          <Link
            href="/"
            className="focus-ring inline-flex h-8 items-center rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 text-xs font-medium text-zinc-300 hover:bg-white/[0.08] hover:text-white transition"
          >
            Buka Proyek Saya
          </Link>
        </div>
      </header>

      {/* Main Gallery Content */}
      <main className="flex-1 mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 sm:py-10">
        <TemplateGallery />
      </main>
    </div>
  );
}
