"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Laptop,
  Tablet,
  Smartphone,
  X,
  Plus,
  Layers,
  FileCode2,
  Check,
  ExternalLink,
} from "lucide-react";
import type { WebsiteTemplate } from "@/lib/templates/types";
import { buildProjectPreview, revokePreviewUrls } from "@/lib/project-preview";
import { cn } from "@/lib/utils";

interface TemplatePreviewModalProps {
  template: WebsiteTemplate | null;
  open: boolean;
  onClose: () => void;
  onUseTemplate: (template: WebsiteTemplate) => void;
}

type DeviceMode = "desktop" | "tablet" | "mobile";

export default function TemplatePreviewModal({
  template,
  open,
  onClose,
  onUseTemplate,
}: TemplatePreviewModalProps) {
  const [device, setDevice] = useState<DeviceMode>("desktop");
  const [activePage, setActivePage] = useState<string>("index.html");
  const [previewSrcDoc, setPreviewSrcDoc] = useState<string>("");

  useEffect(() => {
    if (!template || !open) return;
    const entry = template.pages.find((p) => p.isEntry)?.path || "index.html";
    setActivePage(entry);
  }, [template, open]);

  useEffect(() => {
    if (!template || !open) return;

    let urls: string[] = [];
    try {
      const pageToRender = template.files[activePage] ? activePage : "index.html";
      const preview = buildProjectPreview(template.files, pageToRender);
      urls = preview.urls;
      setPreviewSrcDoc(preview.srcDoc);
    } catch {
      // Fallback direct raw html
      const raw = template.files[activePage]?.content || template.files["index.html"]?.content || "";
      setPreviewSrcDoc(raw);
    }

    return () => {
      revokePreviewUrls(urls);
    };
  }, [template, activePage, open]);

  if (!open || !template) return null;

  const deviceWidths: Record<DeviceMode, string> = {
    desktop: "100%",
    tablet: "768px",
    mobile: "390px",
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#0b0b0e] text-zinc-100 animate-fade-in" role="dialog" aria-modal="true">
      {/* Top Bar Navigation */}
      <header className="flex h-14 shrink-0 items-center justify-between border-b border-white/[0.08] bg-[#121216] px-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onClose}
            className="grid size-8 place-items-center rounded-lg border border-white/[0.08] bg-white/[0.03] text-zinc-400 transition hover:bg-white/[0.08] hover:text-white"
            aria-label="Tutup preview template"
          >
            <X className="size-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold tracking-[-0.01em]">{template.name}</h2>
              <span className="rounded-full bg-blue-500/10 px-2 py-0.5 text-[10px] font-medium text-blue-400 border border-blue-500/20">
                {template.category}
              </span>
            </div>
            <p className="hidden text-[11px] text-zinc-500 sm:block truncate max-w-[480px]">
              {template.description}
            </p>
          </div>
        </div>

        {/* Device Switcher (Desktop, Tablet, Mobile) */}
        <div className="flex items-center gap-1 rounded-lg border border-white/[0.08] bg-black/40 p-1">
          <button
            type="button"
            onClick={() => setDevice("desktop")}
            data-testid="preview-device-desktop"
            className={cn(
              "flex h-7 items-center gap-1.5 rounded-md px-2.5 text-xs font-medium transition",
              device === "desktop"
                ? "bg-white/10 text-white shadow-sm"
                : "text-zinc-400 hover:text-zinc-200",
            )}
            title="Tampilan Desktop (1280px)"
          >
            <Laptop className="size-3.5" />
            <span className="hidden md:inline">Desktop</span>
          </button>
          <button
            type="button"
            onClick={() => setDevice("tablet")}
            data-testid="preview-device-tablet"
            className={cn(
              "flex h-7 items-center gap-1.5 rounded-md px-2.5 text-xs font-medium transition",
              device === "tablet"
                ? "bg-white/10 text-white shadow-sm"
                : "text-zinc-400 hover:text-zinc-200",
            )}
            title="Tampilan Tablet (768px)"
          >
            <Tablet className="size-3.5" />
            <span className="hidden md:inline">Tablet</span>
          </button>
          <button
            type="button"
            onClick={() => setDevice("mobile")}
            data-testid="preview-device-mobile"
            className={cn(
              "flex h-7 items-center gap-1.5 rounded-md px-2.5 text-xs font-medium transition",
              device === "mobile"
                ? "bg-white/10 text-white shadow-sm"
                : "text-zinc-400 hover:text-zinc-200",
            )}
            title="Tampilan Mobile (390px)"
          >
            <Smartphone className="size-3.5" />
            <span className="hidden md:inline">Mobile</span>
          </button>
        </div>

        {/* Action Button */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onUseTemplate(template)}
            data-testid="create-project-from-preview"
            className="focus-ring inline-flex h-8.5 items-center gap-1.5 rounded-lg bg-[#3b82f6] px-3.5 text-xs font-semibold text-white transition hover:bg-[#2563eb]"
          >
            <Plus className="size-3.5" />
            Gunakan Template Ini
          </button>
        </div>
      </header>

      {/* Secondary Bar: Multi-Page Switcher & Sections Breakdown */}
      <div className="flex h-10 shrink-0 items-center justify-between border-b border-white/[0.06] bg-[#0e0e12] px-4 text-xs">
        <div className="flex items-center gap-1.5 overflow-x-auto pr-4">
          <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider mr-1">
            Halaman:
          </span>
          {template.pages.map((p) => {
            const active = p.path === activePage;
            return (
              <button
                key={p.path}
                type="button"
                onClick={() => setActivePage(p.path)}
                data-testid={`preview-page-${p.path}`}
                className={cn(
                  "flex h-6.5 items-center gap-1.5 rounded-md px-2.5 text-[11px] font-medium transition",
                  active
                    ? "bg-[#3b82f6]/15 text-blue-300 border border-[#3b82f6]/30"
                    : "text-zinc-400 hover:bg-white/[0.04] hover:text-zinc-200 border border-transparent",
                )}
              >
                <FileCode2 className="size-3 text-blue-400" />
                <span>{p.title}</span>
                <span className="font-mono text-[9.5px] text-zinc-500">({p.path})</span>
              </button>
            );
          })}
        </div>

        <div className="hidden items-center gap-3 text-[11px] text-zinc-500 lg:flex shrink-0">
          <span className="flex items-center gap-1">
            <Layers className="size-3 text-zinc-400" />
            {template.sections.length} Section Bawaan
          </span>
          <span className="h-3 w-px bg-white/10" />
          <span>{template.pages.length} Halaman Siap Edit</span>
        </div>
      </div>

      {/* Main Canvas Area */}
      <main className="relative flex flex-1 items-center justify-center overflow-auto bg-[#08080a] p-2 sm:p-4">
        <div
          className={cn(
            "relative h-full overflow-hidden rounded-xl border border-white/[0.08] bg-white shadow-2xl transition-all duration-300",
            device === "mobile" && "ring-8 ring-zinc-900 rounded-[24px]",
            device === "tablet" && "ring-8 ring-zinc-900 rounded-[18px]",
          )}
          style={{ width: deviceWidths[device], maxWidth: "100%" }}
        >
          <iframe
            data-testid="template-preview-iframe"
            srcDoc={previewSrcDoc}
            title={template.name}
            className="h-full w-full border-0 bg-white"
            sandbox="allow-scripts allow-same-origin"
          />
        </div>
      </main>
    </div>
  );
}
