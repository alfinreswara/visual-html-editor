import Link from "next/link";
import { ArrowLeft, Compass } from "lucide-react";
import { Brand } from "@/components/brand";

export default function NotFound() {
  return (
    <div className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden bg-[#08080a] px-5 text-center">
      <div className="pointer-events-none absolute top-0 h-72 w-[600px] rounded-full bg-blue-600/10 blur-[100px]" />
      <Brand className="mb-8" />
      <span className="mb-4 grid size-12 place-items-center rounded-2xl border border-white/[0.08] bg-white/[0.025] text-zinc-500">
        <Compass className="size-5" />
      </span>
      <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-zinc-600">
        404 · Halaman tidak ditemukan
      </p>
      <h1 className="mt-3 text-xl font-semibold tracking-[-0.03em] text-zinc-100">
        Jalur ini belum ada.
      </h1>
      <p className="mt-2 max-w-sm text-xs leading-5 text-zinc-500">
        Kembali ke beranda untuk membuka project atau membuat project baru.
      </p>
      <Link
        href="/"
        className="focus-ring mt-6 inline-flex h-9 items-center gap-2 rounded-lg bg-white px-4 text-xs font-semibold text-[#111114] transition hover:bg-zinc-200"
      >
        <ArrowLeft className="size-3.5" />
        Kembali ke beranda
      </Link>
    </div>
  );
}
