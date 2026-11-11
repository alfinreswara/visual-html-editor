"use client";

import { useState } from "react";
import {
  Clock,
  History,
  RotateCcw,
  Plus,
  Trash2,
  FileCode,
  AlertTriangle,
  Check,
} from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { formatRelativeTime, type ProjectVersion } from "@/lib/projects";

interface VersionHistoryModalProps {
  open: boolean;
  onClose: () => void;
  versions: ProjectVersion[];
  onCreateSnapshot: (label: string) => void;
  onRestoreVersion: (version: ProjectVersion) => void;
}

export default function VersionHistoryModal({
  open,
  onClose,
  versions = [],
  onCreateSnapshot,
  onRestoreVersion,
}: VersionHistoryModalProps) {
  const [snapshotLabel, setSnapshotLabel] = useState("");
  const [confirmRestore, setConfirmRestore] = useState<ProjectVersion | null>(null);

  function handleCreate() {
    const label = snapshotLabel.trim() || `Snapshot Manual (${new Date().toLocaleTimeString("id-ID")})`;
    onCreateSnapshot(label);
    setSnapshotLabel("");
  }

  function handleConfirmRestore() {
    if (!confirmRestore) return;
    onRestoreVersion(confirmRestore);
    setConfirmRestore(null);
    onClose();
  }

  return (
    <>
      <Modal
        open={open && !confirmRestore}
        onClose={onClose}
        title="Riwayat Versi & Snapshot"
        description="Snapshot disimpan otomatis secara berkala dan sebelum operasi besar. Kamu bisa memulihkan proyek ke titik waktu sebelumnya."
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
          {/* Create Manual Snapshot Box */}
          <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-3">
            <label className="mb-1.5 block text-xs font-medium text-zinc-300">
              Buat Snapshot Versi Baru
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={snapshotLabel}
                onChange={(e) => setSnapshotLabel(e.target.value)}
                placeholder="Catatan versi (mis: Sebelum rombak hero)..."
                className="focus-ring h-8.5 min-w-0 flex-1 rounded-lg border border-white/[0.08] bg-white/[0.025] px-2.5 text-xs text-zinc-200 outline-none transition placeholder:text-zinc-600 focus:border-[#3b82f6]/50 focus:bg-white/[0.04]"
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleCreate();
                }}
              />
              <button
                type="button"
                onClick={handleCreate}
                className="focus-ring inline-flex h-8.5 items-center gap-1.5 rounded-lg bg-[#3b82f6] px-3 text-xs font-semibold text-white transition hover:bg-[#2563eb]"
              >
                <Plus className="size-3.5" />
                Snapshot
              </button>
            </div>
          </div>

          {/* Version List */}
          <div className="space-y-2">
            <span className="block text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
              Daftar Versi Tersimpan ({versions.length})
            </span>

            {versions.length === 0 ? (
              <div className="rounded-xl border border-dashed border-white/[0.08] py-8 text-center text-xs text-zinc-500">
                <Clock className="mx-auto mb-2 size-5 text-zinc-600" />
                Belum ada snapshot versi. Snapshot dibuat otomatis saat kamu bekerja.
              </div>
            ) : (
              <div className="max-h-72 space-y-1.5 overflow-y-auto pr-1">
                {versions.map((ver, idx) => {
                  const dateStr = new Date(ver.timestamp).toLocaleString("id-ID", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  });
                  return (
                    <div
                      key={ver.id || idx}
                      className="group flex items-center justify-between gap-3 rounded-xl border border-white/[0.06] bg-white/[0.015] p-3 transition hover:border-white/[0.12] hover:bg-white/[0.03]"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-xs text-zinc-200">
                            {ver.label}
                          </span>
                          <span className="rounded bg-white/[0.06] px-1.5 py-0.2 font-mono text-[9px] text-zinc-400">
                            {Object.keys(ver.files || {}).length} file
                          </span>
                        </div>
                        <div className="mt-1 flex items-center gap-1.5 text-[10.5px] text-zinc-500">
                          <Clock className="size-3" />
                          <span>{formatRelativeTime(ver.timestamp)}</span>
                          <span>·</span>
                          <span>{dateStr}</span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => setConfirmRestore(ver)}
                        className="focus-ring flex h-7 items-center gap-1.5 rounded-md border border-white/[0.08] bg-white/[0.03] px-2.5 text-[10.5px] font-medium text-zinc-300 transition hover:border-[#3b82f6]/40 hover:bg-[#3b82f6]/10 hover:text-white"
                        title="Pulihkan proyek ke versi ini"
                      >
                        <RotateCcw className="size-3" />
                        Restore
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </Modal>

      {/* Confirmation Dialog before Restore */}
      <Modal
        open={Boolean(confirmRestore)}
        onClose={() => setConfirmRestore(null)}
        title="Pulihkan ke Versi Ini?"
        description="Perubahan saat ini akan digantikan oleh isi file dari snapshot terpilih."
        footer={
          <>
            <button
              type="button"
              onClick={() => setConfirmRestore(null)}
              className="focus-ring h-9 rounded-lg px-3.5 text-xs font-medium text-zinc-400 transition hover:bg-white/[0.04]"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleConfirmRestore}
              className="focus-ring inline-flex h-9 items-center gap-2 rounded-lg bg-amber-500 px-4 text-xs font-semibold text-black transition hover:bg-amber-400"
            >
              <RotateCcw className="size-3.5" />
              Ya, Pulihkan Versi
            </button>
          </>
        }
      >
        <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-3 text-xs text-amber-200">
          <div className="flex items-center gap-2 font-semibold text-amber-100">
            <AlertTriangle className="size-4 text-amber-400" />
            Snapshot: &ldquo;{confirmRestore?.label}&rdquo;
          </div>
          <p className="mt-1.5 text-[11px] leading-5 text-amber-200/80">
            Sebelum memulihkan, snapshot otomatis dari kondisi saat ini akan disimpan terlebih dahulu sehingga kamu selalu bisa membatalkan pemulihan ini jika diperlukan.
          </p>
        </div>
      </Modal>
    </>
  );
}
