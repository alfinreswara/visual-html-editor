"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AlertTriangle, Check, Info, X } from "lucide-react";
import { cn } from "@/lib/utils";

export type ToastTone = "success" | "error" | "info";

export interface ToastMessage {
  id: number;
  message: string;
  tone: ToastTone;
}

export function useToast() {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const counter = useRef(0);
  const timers = useRef<number[]>([]);

  useEffect(() => {
    return () => {
      for (const timer of timers.current) window.clearTimeout(timer);
    };
  }, []);

  const toast = useCallback((message: string, tone: ToastTone = "info") => {
    const id = ++counter.current;
    setToasts((current) => [...current.slice(-2), { id, message, tone }]);
    const timer = window.setTimeout(() => {
      setToasts((current) => current.filter((item) => item.id !== id));
    }, 4200);
    timers.current.push(timer);
  }, []);

  const dismiss = useCallback((id: number) => {
    setToasts((current) => current.filter((item) => item.id !== id));
  }, []);

  return { toasts, toast, dismiss };
}

export function ToastViewport({
  toasts,
  dismiss,
}: {
  toasts: ToastMessage[];
  dismiss: (id: number) => void;
}) {
  return (
    <div
      className="pointer-events-none fixed inset-x-3 bottom-3 z-[200] flex flex-col items-end gap-2 sm:inset-x-auto sm:right-5 sm:bottom-5"
      aria-live="polite"
    >
      {toasts.map((item) => {
        const Icon =
          item.tone === "success"
            ? Check
            : item.tone === "error"
              ? AlertTriangle
              : Info;
        return (
          <div
            key={item.id}
            role="status"
            className="animate-fade-in pointer-events-auto flex w-full max-w-sm items-start gap-2.5 rounded-xl border border-white/10 bg-[#18181d]/95 py-3 pl-3 pr-2 text-sm text-zinc-200 shadow-2xl backdrop-blur-xl"
          >
            <span
              className={cn(
                "mt-0.5 grid size-5 shrink-0 place-items-center rounded-full",
                item.tone === "success" && "bg-emerald-500/15 text-emerald-400",
                item.tone === "error" && "bg-red-500/15 text-red-400",
                item.tone === "info" && "bg-blue-500/15 text-blue-400",
              )}
            >
              <Icon className="size-3" strokeWidth={2.5} />
            </span>
            <p className="min-w-0 flex-1 leading-5">{item.message}</p>
            <button
              type="button"
              onClick={() => dismiss(item.id)}
              className="focus-ring mt-0.5 grid size-5 place-items-center rounded text-zinc-500 transition hover:bg-white/5 hover:text-zinc-200"
              aria-label="Tutup notifikasi"
            >
              <X className="size-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
