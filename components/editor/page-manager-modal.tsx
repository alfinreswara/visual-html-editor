"use client";

import { useState } from "react";
import {
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  Check,
  Copy,
  Edit2,
  FileCode,
  FilePlus,
  LoaderCircle,
  Plus,
  Trash2,
} from "lucide-react";
import { Modal } from "@/components/ui/modal";

interface PageManagerModalProps {
  open: boolean;
  onClose: () => void;
  pages: string[];
  activePage: string;
  onSelectPage: (path: string) => void;
  onCreatePage: (name: string, fromTemplate: "blank" | "duplicate") => void;
  onRenamePage: (oldPath: string, newPath: string) => void;
  onDuplicatePage: (path: string) => void;
  onDeletePage: (path: string) => void;
  onReorderPages: (reordered: string[]) => void;
}

export default function PageManagerModal({
  open,
  onClose,
  pages,
  activePage,
  onSelectPage,
  onCreatePage,
  onRenamePage,
  onDuplicatePage,
  onDeletePage,
  onReorderPages,
}: PageManagerModalProps) {
  const [createOpen, setCreateOpen] = useState(false);
  const [newPageName, setNewPageName] = useState("");
  const [newType, setNewType] = useState<"blank" | "duplicate">("blank");

  const [renameTarget, setRenameTarget] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");

  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  function handleCreate() {
    let name = newPageName.trim();
    if (!name) return;
    if (!name.endsWith(".html") && !name.endsWith(".htm")) {
      name = `${name}.html`;
    }
    onCreatePage(name, newType);
    setNewPageName("");
    setCreateOpen(false);
  }

  function handleRename() {
    if (!renameTarget) return;
    let name = renameValue.trim();
    if (!name) return;
    if (!name.endsWith(".html") && !name.endsWith(".htm")) {
      name = `${name}.html`;
    }
    if (name !== renameTarget) {
      onRenamePage(renameTarget, name);
    }
    setRenameTarget(null);
  }

  function handleDelete() {
    if (!deleteTarget) return;
    onDeletePage(deleteTarget);
    setDeleteTarget(null);
  }

  function move(index: number, direction: -1 | 1) {
    const next = [...pages];
    const target = index + direction;
    if (target < 0 || target >= next.length) return;
    const temp = next[index];
    next[index] = next[target];
    next[target] = temp;
    onReorderPages(next);
  }

  const FIELD_CLASS =
    "focus-ring h-8.5 w-full rounded-lg border border-white/[0.08] bg-white/[0.025] px-2.5 text-xs text-zinc-200 outline-none transition placeholder:text-zinc-600 focus:border-[#3b82f6]/50 focus:bg-white/[0.04]";

  return (
    <>
      <Modal
        open={open && !createOpen && !renameTarget && !deleteTarget}
        onClose={onClose}
        title="Kelola Halaman Proyek"
        description="Tambah halaman baru, ubah urutan, duplikat, atau ganti nama halaman. Tautan internal otomatis disinkronkan."
        footer={
          <div className="flex w-full items-center justify-between">
            <button
              type="button"
              onClick={() => {
                setNewPageName("");
                setCreateOpen(true);
              }}
              className="focus-ring inline-flex h-8.5 items-center gap-1.5 rounded-lg bg-[#3b82f6] px-3.5 text-xs font-semibold text-white transition hover:bg-[#2563eb]"
            >
              <Plus className="size-3.5" />
              Tambah Halaman Baru
            </button>
            <button
              type="button"
              onClick={onClose}
              className="focus-ring h-8.5 rounded-lg px-3.5 text-xs font-medium text-zinc-400 transition hover:bg-white/[0.04] hover:text-zinc-200"
            >
              Selesai
            </button>
          </div>
        }
      >
        <div className="space-y-2">
          <span className="block text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
            Daftar Halaman ({pages.length})
          </span>

          <div className="max-h-72 space-y-1.5 overflow-y-auto pr-1">
            {pages.map((p, idx) => {
              const active = p === activePage;
              return (
                <div
                  key={p}
                  className={`flex items-center justify-between gap-2 rounded-xl border p-2.5 transition ${
                    active
                      ? "border-[#3b82f6]/40 bg-[#3b82f6]/[0.08]"
                      : "border-white/[0.06] bg-white/[0.015] hover:bg-white/[0.03]"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => {
                      onSelectPage(p);
                      onClose();
                    }}
                    className="flex min-w-0 flex-1 items-center gap-2.5 text-left"
                  >
                    <FileCode
                      className={`size-4 shrink-0 ${
                        active ? "text-blue-400" : "text-zinc-500"
                      }`}
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`truncate text-xs font-medium ${
                            active ? "text-blue-200" : "text-zinc-200"
                          }`}
                        >
                          {p}
                        </span>
                        {active && (
                          <span className="rounded bg-blue-500/20 px-1.5 py-0.2 text-[8px] font-semibold uppercase text-blue-300">
                            Aktif
                          </span>
                        )}
                      </div>
                    </div>
                  </button>

                  <div className="flex shrink-0 items-center gap-1">
                    {/* Move Up/Down */}
                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={() => move(idx, -1)}
                      className="grid size-6 place-items-center rounded text-zinc-500 transition hover:bg-white/[0.08] hover:text-zinc-200 disabled:opacity-20"
                      title="Pindahkan ke atas"
                    >
                      <ArrowUp className="size-3" />
                    </button>
                    <button
                      type="button"
                      disabled={idx === pages.length - 1}
                      onClick={() => move(idx, 1)}
                      className="grid size-6 place-items-center rounded text-zinc-500 transition hover:bg-white/[0.08] hover:text-zinc-200 disabled:opacity-20"
                      title="Pindahkan ke bawah"
                    >
                      <ArrowDown className="size-3" />
                    </button>

                    {/* Rename */}
                    <button
                      type="button"
                      onClick={() => {
                        setRenameTarget(p);
                        setRenameValue(p);
                      }}
                      className="grid size-6 place-items-center rounded text-zinc-500 transition hover:bg-white/[0.08] hover:text-zinc-200"
                      title="Ganti nama halaman"
                    >
                      <Edit2 className="size-3" />
                    </button>

                    {/* Duplicate */}
                    <button
                      type="button"
                      onClick={() => onDuplicatePage(p)}
                      className="grid size-6 place-items-center rounded text-zinc-500 transition hover:bg-white/[0.08] hover:text-zinc-200"
                      title="Duplikat halaman"
                    >
                      <Copy className="size-3" />
                    </button>

                    {/* Delete */}
                    <button
                      type="button"
                      disabled={pages.length <= 1}
                      onClick={() => setDeleteTarget(p)}
                      className="grid size-6 place-items-center rounded text-zinc-500 transition hover:bg-red-500/20 hover:text-red-400 disabled:opacity-20"
                      title={
                        pages.length <= 1
                          ? "Proyek harus memiliki setidaknya satu halaman"
                          : "Hapus halaman"
                      }
                    >
                      <Trash2 className="size-3" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </Modal>

      {/* Modal Tambah Halaman Baru */}
      <Modal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title="Tambah Halaman Baru"
        description="Pilih template titik awal dan masukkan nama file halaman."
        footer={
          <>
            <button
              type="button"
              onClick={() => setCreateOpen(false)}
              className="focus-ring h-9 rounded-lg px-3.5 text-xs font-medium text-zinc-400 transition hover:bg-white/[0.04]"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleCreate}
              className="focus-ring inline-flex h-9 items-center gap-1.5 rounded-lg bg-[#3b82f6] px-4 text-xs font-semibold text-white transition hover:bg-[#2563eb]"
            >
              <Plus className="size-3.5" />
              Buat Halaman
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-zinc-300">
              Nama File Halaman
            </label>
            <input
              type="text"
              value={newPageName}
              onChange={(e) => setNewPageName(e.target.value)}
              placeholder="tentang.html, kontak.html, blog.html..."
              className={FIELD_CLASS}
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter") handleCreate();
              }}
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-zinc-300">
              Titik Awal (Template)
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setNewType("blank")}
                className={`flex flex-col items-start rounded-xl border p-3 text-left transition ${
                  newType === "blank"
                    ? "border-[#3b82f6] bg-[#3b82f6]/10 text-white"
                    : "border-white/[0.08] bg-white/[0.02] text-zinc-400 hover:bg-white/[0.04]"
                }`}
              >
                <FilePlus className="mb-2 size-4 text-blue-400" />
                <span className="text-xs font-semibold text-zinc-200">
                  Halaman Kosong
                </span>
                <span className="mt-0.5 text-[10px] text-zinc-500">
                  Mulai dari nol dengan layout dasar bersih.
                </span>
              </button>

              <button
                type="button"
                onClick={() => setNewType("duplicate")}
                className={`flex flex-col items-start rounded-xl border p-3 text-left transition ${
                  newType === "duplicate"
                    ? "border-[#3b82f6] bg-[#3b82f6]/10 text-white"
                    : "border-white/[0.08] bg-white/[0.02] text-zinc-400 hover:bg-white/[0.04]"
                }`}
              >
                <Copy className="mb-2 size-4 text-indigo-400" />
                <span className="text-xs font-semibold text-zinc-200">
                  Duplikat Halaman Aktif
                </span>
                <span className="mt-0.5 text-[10px] text-zinc-500">
                  Salin seluruh isi & gaya dari {activePage}.
                </span>
              </button>
            </div>
          </div>
        </div>
      </Modal>

      {/* Modal Rename Halaman */}
      <Modal
        open={Boolean(renameTarget)}
        onClose={() => setRenameTarget(null)}
        title="Ganti Nama Halaman"
        description="Tautan internal di halaman lain yang mengarah ke file ini akan otomatis diperbarui."
        footer={
          <>
            <button
              type="button"
              onClick={() => setRenameTarget(null)}
              className="focus-ring h-9 rounded-lg px-3.5 text-xs font-medium text-zinc-400 transition hover:bg-white/[0.04]"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleRename}
              className="focus-ring inline-flex h-9 items-center gap-1.5 rounded-lg bg-[#3b82f6] px-4 text-xs font-semibold text-white transition hover:bg-[#2563eb]"
            >
              <Check className="size-3.5" />
              Simpan Nama Baru
            </button>
          </>
        }
      >
        <div>
          <label className="mb-1.5 block text-xs font-medium text-zinc-300">
            Nama File Baru
          </label>
          <input
            type="text"
            value={renameValue}
            onChange={(e) => setRenameValue(e.target.value)}
            className={FIELD_CLASS}
            autoFocus
            onKeyDown={(e) => {
              if (e.key === "Enter") handleRename();
            }}
          />
        </div>
      </Modal>

      {/* Modal Konfirmasi Hapus Halaman */}
      <Modal
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        title="Hapus Halaman?"
        description="Tindakan ini akan menghapus file halaman ini dari proyek."
        footer={
          <>
            <button
              type="button"
              onClick={() => setDeleteTarget(null)}
              className="focus-ring h-9 rounded-lg px-3.5 text-xs font-medium text-zinc-400 transition hover:bg-white/[0.04]"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleDelete}
              className="focus-ring inline-flex h-9 items-center gap-1.5 rounded-lg bg-red-600 px-4 text-xs font-semibold text-white transition hover:bg-red-500"
            >
              <Trash2 className="size-3.5" />
              Hapus Halaman
            </button>
          </>
        }
      >
        <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-xs text-red-200">
          <div className="flex items-center gap-2 font-semibold text-red-100">
            <AlertTriangle className="size-4 text-red-400" />
            File: &ldquo;{deleteTarget}&rdquo;
          </div>
          <p className="mt-1 text-[11px] leading-5 text-red-200/80">
            Pastikan kamu sudah membuat cadangan atau snapshot jika file ini masih diperlukan di masa depan.
          </p>
        </div>
      </Modal>
    </>
  );
}
