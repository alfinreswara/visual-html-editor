"use client";

import { useMemo } from "react";
import {
  AlertCircle,
  CheckCircle2,
  ExternalLink,
  FileSearch,
  Image as ImageIcon,
  Link2,
  MousePointer2,
  Type,
} from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { auditHtml, type AuditIssue } from "@/lib/html";

interface AuditModalProps {
  open: boolean;
  onClose: () => void;
  html: string;
  onSelectElement: (id: string) => void;
}

export default function AuditModal({
  open,
  onClose,
  html,
  onSelectElement,
}: AuditModalProps) {
  const issues = useMemo(() => auditHtml(html), [html]);

  const altIssues = issues.filter((i) => i.type === "missing-alt");
  const linkIssues = issues.filter((i) => i.type === "empty-link");
  const headingIssues = issues.filter((i) => i.type === "empty-heading");

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Pemeriksaan Aksesibilitas & Link (Audit)"
      description="Pemeriksaan otomatis untuk memastikan halaman ramah pengguna, mudah diindeks mesin pencari, dan bebas dari tautan rusak."
      footer={
        <button
          type="button"
          onClick={onClose}
          className="focus-ring h-9 rounded-lg px-4 text-xs font-medium text-zinc-300 transition hover:bg-white/[0.05]"
        >
          Tutup
        </button>
      }
    >
      <div className="space-y-4">
        {/* Summary Chips */}
        <div className="grid grid-cols-3 gap-2">
          <div className="flex items-center gap-2 rounded-xl border border-white/[0.06] bg-white/[0.015] p-2.5">
            <span className="grid size-6 place-items-center rounded-lg bg-amber-500/15 text-amber-400">
              <ImageIcon className="size-3.5" />
            </span>
            <div>
              <span className="block text-xs font-bold text-zinc-200">
                {altIssues.length}
              </span>
              <span className="text-[10px] text-zinc-500">Tanpa Alt</span>
            </div>
          </div>

          <div className="flex items-center gap-2 rounded-xl border border-white/[0.06] bg-white/[0.015] p-2.5">
            <span className="grid size-6 place-items-center rounded-lg bg-red-500/15 text-red-400">
              <Link2 className="size-3.5" />
            </span>
            <div>
              <span className="block text-xs font-bold text-zinc-200">
                {linkIssues.length}
              </span>
              <span className="text-[10px] text-zinc-500">Link Kosong</span>
            </div>
          </div>

          <div className="flex items-center gap-2 rounded-xl border border-white/[0.06] bg-white/[0.015] p-2.5">
            <span className="grid size-6 place-items-center rounded-lg bg-blue-500/15 text-blue-400">
              <Type className="size-3.5" />
            </span>
            <div>
              <span className="block text-xs font-bold text-zinc-200">
                {headingIssues.length}
              </span>
              <span className="text-[10px] text-zinc-500">Judul Kosong</span>
            </div>
          </div>
        </div>

        {/* Issue List */}
        <div className="space-y-2">
          <span className="block text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
            Daftar Masalah Terdeteksi ({issues.length})
          </span>

          {issues.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-xl border border-emerald-500/20 bg-emerald-500/10 py-8 text-center">
              <CheckCircle2 className="mb-2 size-8 text-emerald-400" />
              <h4 className="text-xs font-semibold text-emerald-200">
                Halaman Sangat Rapi!
              </h4>
              <p className="mt-1 max-w-xs text-[11px] text-emerald-300/80">
                Tidak ada gambar tanpa alt, link kosong, atau heading tanpa konten yang ditemukan pada halaman aktif.
              </p>
            </div>
          ) : (
            <div className="max-h-72 space-y-1.5 overflow-y-auto pr-1">
              {issues.map((issue) => (
                <div
                  key={`${issue.id}-${issue.type}`}
                  className="flex items-center justify-between gap-3 rounded-xl border border-white/[0.06] bg-white/[0.015] p-3 transition hover:border-[#3b82f6]/40 hover:bg-[#3b82f6]/[0.05]"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="rounded bg-white/[0.06] px-1.5 py-0.2 font-mono text-[9px] text-zinc-300">
                        &lt;{issue.tag}&gt;
                      </span>
                      <span className="text-xs font-medium text-zinc-200">
                        {issue.label}
                      </span>
                    </div>
                    <p className="mt-1 text-[11px] leading-4 text-zinc-400">
                      {issue.detail}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      onSelectElement(issue.id);
                      onClose();
                    }}
                    className="focus-ring flex h-7 shrink-0 items-center gap-1.5 rounded-md border border-[#3b82f6]/30 bg-[#3b82f6]/10 px-2.5 text-[10.5px] font-medium text-[#93c5fd] transition hover:bg-[#3b82f6]/20"
                    title="Pilih elemen ini di preview"
                  >
                    <MousePointer2 className="size-3" />
                    Pilih
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}
