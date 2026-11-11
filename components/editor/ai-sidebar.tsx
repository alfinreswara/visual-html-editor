"use client";

import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import {
  AlertTriangle,
  ArrowUp,
  CheckCircle2,
  Code2,
  Globe2,
  LoaderCircle,
  Lock,
  Sparkles,
  WandSparkles,
  X,
} from "lucide-react";
import { getElementHtml } from "@/lib/html";
import type { SelectedElement } from "@/lib/editor-messages";
import { cn } from "@/lib/utils";

interface ChatMessage {
  id: number;
  role: "assistant" | "user";
  content: string;
  tone?: "normal" | "success" | "error";
}

interface AiResponse {
  html?: unknown;
  mode?: unknown;
  error?: unknown;
}

const MAX_HTML_FOR_AI = 500_000;

const EXAMPLE_PROMPTS = [
  "Ubah tema ke mode gelap modern dengan kontras tinggi",
  "Buat tombol hero lebih mencolok dengan efek hover",
  "Rapikan spasi, margin, dan padding antar section",
  "Tambahkan border tipis dan bayangan halus pada kartu",
];


function ChatAvatar({ error = false }: { error?: boolean }) {
  return (
    <span
      className={cn(
        "grid size-6 shrink-0 place-items-center rounded-lg border",
        error
          ? "border-red-500/15 bg-red-500/10 text-red-400"
          : "border-[#5b8cff]/20 bg-[#5b8cff]/10 text-[#85a7ff]",
      )}
      aria-hidden="true"
    >
      {error ? <AlertTriangle className="size-3" /> : <Sparkles className="size-3" />}
    </span>
  );
}

export default function AiSidebar({
  html,
  stylesheets = [],
  selection,
  onApplyElement,
  onApplyPage,
  onClose,
}: {
  html: string;
  stylesheets?: Array<{ path: string; content: string }>;
  selection: SelectedElement | null;
  onApplyElement: (id: string, fragment: string, baseHtml: string) => void;
  onApplyPage: (nextHtml: string, baseHtml: string) => void;
  onClose?: () => void;
}) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 1,
      role: "assistant",
      content:
        "Halo! Aku bisa merapikan tata letak, menulis ulang konten, atau mengubah gaya halaman. Pilih elemen di preview kalau ingin perubahanku tetap terarah.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messageId = useRef(2);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  function applyExample(promptText: string) {
    setInput(promptText);
    inputRef.current?.focus();
  }

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ block: "end", behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    return () => abortControllerRef.current?.abort();
  }, []);

  function append(message: Omit<ChatMessage, "id">) {
    const next = { ...message, id: messageId.current++ };
    setMessages((current) => [...current, next]);
  }

  async function submit(event?: FormEvent) {
    event?.preventDefault();
    const instruction = input.trim();
    if (!instruction || loading) return;

    if (html.length > MAX_HTML_FOR_AI) {
      append({
        role: "assistant",
        tone: "error",
        content:
          "HTML terlalu besar untuk dikirim ke AI (maksimal 500 ribu karakter). Persingkat halaman atau edit lewat tab Kode.",
      });
      return;
    }

    let selectedPayload: { tag: string; className: string; html: string } | null =
      null;

    if (selection) {
      const selectedHtml = getElementHtml(html, selection.id);
      if (!selectedHtml) {
        append({
          role: "assistant",
          tone: "error",
          content: "Elemen yang dipilih sudah tidak ada. Pilih ulang elemen di preview.",
        });
        return;
      }
      selectedPayload = {
        tag: selection.tag,
        className: selection.className,
        html: selectedHtml,
      };
    }

    const baseHtml = html;
    const scope = selection ? `elemen <${selection.tag}>` : "seluruh halaman";

    append({ role: "user", content: instruction });
    setInput("");
    setLoading(true);

    const controller = new AbortController();
    abortControllerRef.current = controller;
    const timeout = window.setTimeout(() => controller.abort(), 110_000);

    try {
      const response = await fetch("/api/ai", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          html: baseHtml,
          instruction,
          selected: selectedPayload,
          stylesheets,
        }),
        signal: controller.signal,
      });

      const data = (await response.json().catch(() => ({}))) as AiResponse;

      if (!response.ok) {
        throw new Error(
          typeof data.error === "string"
            ? data.error
            : `Permintaan AI gagal (status ${response.status}).`,
        );
      }

      if (typeof data.html !== "string" || !data.html.trim()) {
        throw new Error("AI tidak mengembalikan HTML yang valid.");
      }

      if (selection && data.mode !== "element") {
        throw new Error(
          "AI mencoba mengubah halaman di luar elemen terpilih. Perubahan dibatalkan.",
        );
      }
      if (!selection && data.mode !== "page") {
        throw new Error("Mode respons AI tidak sesuai. Perubahan dibatalkan.");
      }

      if (selection) {
        onApplyElement(selection.id, data.html, baseHtml);
      } else {
        onApplyPage(data.html, baseHtml);
      }

      append({
        role: "assistant",
        tone: "success",
        content: selection
          ? `Selesai. Perubahan diterapkan hanya pada ${scope}.`
          : "Selesai. Perubahan diterapkan ke seluruh halaman.",
      });
    } catch (error) {
      const message =
        error instanceof DOMException && error.name === "AbortError"
          ? "Permintaan dihentikan karena memakan waktu terlalu lama. Coba lagi."
          : error instanceof Error
            ? error.message
            : "Terjadi kesalahan saat memproses permintaan AI.";
      append({ role: "assistant", tone: "error", content: message });
      setInput(instruction);
    } finally {
      window.clearTimeout(timeout);
      abortControllerRef.current = null;
      setLoading(false);
    }
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) {
      event.preventDefault();
      void submit();
    }
  }

  return (
    <div className="flex h-full min-h-0 flex-col bg-[#0b0b0e]">
      <div className="flex h-14 shrink-0 items-center justify-between gap-2 border-b border-white/[0.07] px-3.5">
        <div className="flex min-w-0 items-center gap-2.5">
          <span className="relative grid size-8 shrink-0 place-items-center rounded-xl border border-[#5b8cff]/20 bg-[linear-gradient(140deg,rgba(91,140,255,0.18),rgba(124,92,255,0.08))] text-[#8aabff]">
            <WandSparkles className="size-4" />
            <span className="absolute -right-0.5 -top-0.5 size-2 rounded-full border-2 border-[#0b0b0e] bg-emerald-400" />
          </span>
          <div className="min-w-0">
            <h2 className="truncate text-[12px] font-semibold tracking-[-0.015em] text-zinc-100">
              Asisten AI
            </h2>
            <p className="truncate text-[10px] text-zinc-500">
              Ubah halaman lewat percakapan
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <span className="hidden rounded-md border border-white/[0.07] bg-white/[0.025] px-1.5 py-0.5 font-mono text-[8px] font-medium text-zinc-500 sm:inline">
            OPENAI
          </span>
          {onClose ? (
            <button
              type="button"
              onClick={onClose}
              className="focus-ring grid size-7 place-items-center rounded-lg text-zinc-500 transition hover:bg-white/5 hover:text-zinc-200 xl:hidden"
              aria-label="Tutup asisten AI"
            >
              <X className="size-4" />
            </button>
          ) : null}
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-3.5 py-4">
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                "flex gap-2.5",
                message.role === "user" && "flex-row-reverse",
              )}
            >
              {message.role === "assistant" ? (
                <ChatAvatar error={message.tone === "error"} />
              ) : (
                <span className="grid size-6 shrink-0 place-items-center rounded-lg border border-white/[0.08] bg-white/[0.04] text-[9px] font-semibold text-zinc-400">
                  Kamu
                </span>
              )}
              <div
                className={cn(
                  "max-w-[calc(100%_-_32px)] rounded-xl border px-3 py-2.5 text-[11.5px] leading-[1.65]",
                  message.role === "user"
                    ? "rounded-tr-[4px] border-[#5b8cff]/25 bg-[#5b8cff]/[0.12] text-blue-100"
                    : message.tone === "error"
                      ? "rounded-tl-[4px] border-red-500/15 bg-red-500/[0.055] text-red-200/90"
                      : message.tone === "success"
                        ? "rounded-tl-[4px] border-emerald-500/15 bg-emerald-500/[0.055] text-emerald-100/90"
                        : "rounded-tl-[4px] border-white/[0.065] bg-white/[0.025] text-zinc-300",
                )}
              >
                {message.tone === "success" ? (
                  <span className="mb-1 flex items-center gap-1 text-[9px] font-semibold uppercase tracking-[0.08em] text-emerald-400">
                    <CheckCircle2 className="size-2.5" />
                    Diterapkan
                  </span>
                ) : null}
                {message.tone === "error" ? (
                  <span className="mb-1 flex items-center gap-1 text-[9px] font-semibold uppercase tracking-[0.08em] text-red-400">
                    <AlertTriangle className="size-2.5" />
                    Gagal
                  </span>
                ) : null}
                <p className="whitespace-pre-wrap break-words">{message.content}</p>
              </div>
            </div>
          ))}
          {messages.length <= 1 && !loading ? (
            <div className="mt-3 rounded-xl border border-white/[0.06] bg-white/[0.015] p-3">
              <p className="mb-2 text-[10px] font-medium uppercase tracking-wider text-zinc-500">
                Contoh Instruksi Cepat:
              </p>
              <div className="flex flex-col gap-1.5">
                {EXAMPLE_PROMPTS.map((prompt) => (
                  <button
                    key={prompt}
                    type="button"
                    onClick={() => applyExample(prompt)}
                    className="group flex items-start gap-2 rounded-lg border border-white/[0.06] bg-white/[0.02] p-2 text-left text-[11px] text-zinc-300 transition hover:border-[#3b82f6]/40 hover:bg-[#3b82f6]/10 hover:text-white"
                  >
                    <Sparkles className="mt-0.5 size-3 shrink-0 text-blue-400 group-hover:text-blue-300" />
                    <span>{prompt}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          {loading ? (
            <div className="flex gap-2.5">
              <ChatAvatar />
              <div className="rounded-xl rounded-tl-[4px] border border-white/[0.065] bg-white/[0.025] px-3 py-2.5">
                <div className="flex items-center gap-2 text-[10.5px] text-zinc-500">
                  <span>Sedang mengerjakan</span>
                  <span className="flex gap-1">
                    <span className="typing-dot size-1 rounded-full bg-[#7da4ff]" />
                    <span className="typing-dot size-1 rounded-full bg-[#7da4ff]" />
                    <span className="typing-dot size-1 rounded-full bg-[#7da4ff]" />
                  </span>
                </div>
              </div>
            </div>
          ) : null}
          <div ref={chatEndRef} />
        </div>
      </div>

      <form
        onSubmit={(event) => void submit(event)}
        className="shrink-0 border-t border-white/[0.07] bg-[#0b0b0e] p-3"
      >
        <div
          className={cn(
            "mb-2 flex items-center justify-between gap-2 rounded-lg border px-2.5 py-1.5",
            selection
              ? "border-[#5b8cff]/20 bg-[#5b8cff]/[0.055]"
              : "border-white/[0.06] bg-white/[0.02]",
          )}
        >
          <div className="flex min-w-0 items-center gap-1.5 text-[9.5px]">
            {selection ? (
              <Code2 className="size-3 shrink-0 text-[#7da4ff]" />
            ) : (
              <Globe2 className="size-3 shrink-0 text-zinc-500" />
            )}
            <span className="text-zinc-500">Cakupan</span>
            <span className="truncate font-medium text-zinc-300">
              {selection ? (
                <>
                  &lt;{selection.tag}&gt;
                  {selection.className ? (
                    <span className="text-zinc-500"> · {selection.className.split(/\s+/)[0]}</span>
                  ) : null}
                </>
              ) : (
                "Seluruh halaman"
              )}
            </span>
          </div>
          <span
            className={cn(
              "shrink-0 rounded px-1.5 py-0.5 text-[8px] font-semibold uppercase tracking-[0.06em]",
              selection
                ? "bg-[#5b8cff]/15 text-[#9db9ff]"
                : "bg-amber-400/10 text-amber-300/80",
            )}
          >
            {selection ? "Elemen" : "Halaman"}
          </span>
        </div>

        <div className="rounded-xl border border-white/[0.09] bg-white/[0.025] p-2 transition focus-within:border-[#5b8cff]/40 focus-within:bg-white/[0.035]">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={handleKeyDown}
            maxLength={4000}
            rows={3}
            placeholder={
              selection
                ? `Contoh: buat warna ${selection.tag} ini lebih menonjol...`
                : "Contoh: buat landing page ini lebih minimal dan modern..."
            }
            aria-label="Instruksi untuk AI"
            className="block max-h-36 min-h-[58px] w-full resize-none bg-transparent px-1.5 py-1 text-[11.5px] leading-5 text-zinc-200 outline-none placeholder:text-zinc-600"
          />
          <div className="flex items-center justify-between gap-2 px-0.5">
            <div className="flex items-center gap-1.5 text-[8.5px] text-zinc-600">
              {input.length > 3500 ? (
                <span className={input.length > 3900 ? "text-amber-400" : ""}>
                  {input.length}/4000
                </span>
              ) : (
                <span>
                  <kbd className="rounded border border-white/10 bg-white/[0.03] px-1 py-0.5 font-mono text-[8px]">
                    Enter
                  </kbd>{" "}
                  kirim
                </span>
              )}
            </div>
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="focus-ring grid size-7 place-items-center rounded-lg bg-[#5b8cff] text-white transition hover:bg-[#6d9bff] disabled:cursor-not-allowed disabled:bg-white/[0.055] disabled:text-zinc-600"
              aria-label="Kirim instruksi ke AI"
            >
              {loading ? (
                <LoaderCircle className="size-3.5 animate-spin" />
              ) : (
                <ArrowUp className="size-3.5" strokeWidth={2.5} />
              )}
            </button>
          </div>
        </div>
        <p className="mt-2 flex items-start gap-1.5 px-0.5 text-[8.5px] leading-3.5 text-zinc-600">
          <Lock className="mt-px size-2.5 shrink-0" />
          HTML halaman aktif dan CSS yang dirujuk dikirim ke server AI hanya saat kamu
          mengirim instruksi. Hasil dibersihkan sebelum diterapkan.
        </p>
      </form>
    </div>
  );
}
