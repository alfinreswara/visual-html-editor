"use client";

import { useMemo, useState } from "react";
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  FileCode2,
  FileSearch,
  Filter,
  Image as ImageIcon,
  Info,
  Layers,
  Lightbulb,
  Link2,
  MousePointer2,
  RefreshCw,
  Search,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Type,
  X,
} from "lucide-react";
import { Modal } from "@/components/ui/modal";
import {
  runProjectAudit,
  type AuditCategory,
  type AuditIssue,
  type AuditReport,
  type AuditSeverity,
  type PassedCheck,
} from "@/lib/quality";
import { makeTextFile, type ProjectFiles } from "@/lib/project-files";
import { cn } from "@/lib/utils";

interface AuditModalProps {
  open: boolean;
  onClose: () => void;
  files?: ProjectFiles;
  html?: string;
  activePath?: string;
  onSelectElement: (id: string, pagePath?: string) => void;
  onNavigateToPage?: (path: string) => void;
}

const CATEGORY_LABELS: Record<AuditCategory | "all", string> = {
  all: "Semua Kategori",
  html: "HTML",
  seo: "SEO",
  a11y: "Aksesibilitas",
  responsive: "Responsif",
  assets: "Aset & Berkas",
  links: "Tautan",
};

export default function AuditModal({
  open,
  onClose,
  files,
  html,
  activePath = "index.html",
  onSelectElement,
  onNavigateToPage,
}: AuditModalProps) {
  const [activeTab, setActiveTab] = useState<"issues" | "passed">("issues");
  const [selectedCategory, setSelectedCategory] = useState<AuditCategory | "all">("all");
  const [selectedSeverity, setSelectedSeverity] = useState<AuditSeverity | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [auditMode, setAuditMode] = useState<"active" | "all">("active");
  const [auditKey, setAuditKey] = useState(0);

  // Normalize files object
  const projectFiles: ProjectFiles = useMemo(() => {
    if (files && Object.keys(files).length > 0) return files;
    return {
      [activePath]: makeTextFile(html || "", activePath),
    };
  }, [files, html, activePath]);

  // Compute audit report
  const report: AuditReport = useMemo(() => {
    return runProjectAudit(projectFiles, {
      activePath,
      auditAllPages: auditMode === "all",
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectFiles, activePath, auditMode, auditKey]);

  // Available HTML pages in project
  const availablePages = useMemo(() => {
    return Object.keys(projectFiles).filter(
      (p) => p.endsWith(".html") || p.endsWith(".htm"),
    );
  }, [projectFiles]);

  // Filter issues
  const filteredIssues = useMemo(() => {
    return report.issues.filter((issue) => {
      if (selectedCategory !== "all" && issue.category !== selectedCategory) {
        return false;
      }
      if (selectedSeverity !== "all" && issue.severity !== selectedSeverity) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = issue.title.toLowerCase().includes(q);
        const matchDesc = issue.description.toLowerCase().includes(q);
        const matchSelector = issue.selector?.toLowerCase().includes(q) || false;
        const matchFile = issue.filePath.toLowerCase().includes(q);
        if (!matchTitle && !matchDesc && !matchSelector && !matchFile) {
          return false;
        }
      }
      return true;
    });
  }, [report.issues, selectedCategory, selectedSeverity, searchQuery]);

  // Filter passed checks
  const filteredPassed = useMemo(() => {
    return report.passedChecks.filter((check) => {
      if (selectedCategory !== "all" && check.category !== selectedCategory) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          check.title.toLowerCase().includes(q) ||
          check.description.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [report.passedChecks, selectedCategory, searchQuery]);

  function handleSelectFinding(issue: AuditIssue) {
    if (issue.filePath !== activePath && onNavigateToPage) {
      onNavigateToPage(issue.filePath);
    }
    if (issue.elementId) {
      onSelectElement(issue.elementId, issue.filePath);
    }
    onClose();
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Audit Kualitas Situs Web (Quality Dashboard)"
      description="Inspeksi komprehensif struktur HTML, metadata SEO, standar aksesibilitas WCAG, aset lokal, dan kesiapan responsif."
      className="max-w-4xl"
      footer={
        <div className="flex w-full flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[10px] text-zinc-500 max-w-lg leading-relaxed">
            {report.disclaimer}
          </p>
          <div className="flex items-center gap-2 shrink-0 self-end">
            <button
              type="button"
              onClick={() => setAuditKey((k) => k + 1)}
              data-testid="rerun-audit-btn"
              className="focus-ring inline-flex h-8 items-center gap-1.5 rounded-lg border border-white/[0.09] bg-white/[0.03] px-3 text-xs font-medium text-zinc-300 transition hover:bg-white/[0.06] hover:text-white"
            >
              <RefreshCw className="size-3 text-blue-400" />
              Jalankan Ulang
            </button>
            <button
              type="button"
              onClick={onClose}
              data-testid="audit-close-btn"
              className="focus-ring inline-flex h-8 items-center rounded-lg bg-white/10 px-4 text-xs font-semibold text-zinc-200 transition hover:bg-white/15 hover:text-white"
            >
              Tutup
            </button>
          </div>
        </div>
      }
    >
      <div className="space-y-4" data-testid="audit-modal">
        {/* Top Metric Counter Chips & Page Scope Selector */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-white/[0.06] pb-3.5">
          <div className="flex flex-wrap items-center gap-2">
            {/* Errors */}
            <div className="flex items-center gap-1.5 rounded-xl border border-red-500/20 bg-red-500/[0.08] px-3 py-1.5">
              <AlertCircle className="size-4 text-red-400" />
              <div className="leading-tight">
                <span
                  className="font-mono text-xs font-bold text-red-300"
                  data-testid="audit-error-count"
                >
                  {report.stats.errors}
                </span>
                <span className="ml-1 text-[10px] text-red-400/80">Error</span>
              </div>
            </div>

            {/* Warnings */}
            <div className="flex items-center gap-1.5 rounded-xl border border-amber-500/20 bg-amber-500/[0.08] px-3 py-1.5">
              <AlertTriangle className="size-4 text-amber-400" />
              <div className="leading-tight">
                <span
                  className="font-mono text-xs font-bold text-amber-300"
                  data-testid="audit-warning-count"
                >
                  {report.stats.warnings}
                </span>
                <span className="ml-1 text-[10px] text-amber-400/80">Peringatan</span>
              </div>
            </div>

            {/* Infos */}
            <div className="flex items-center gap-1.5 rounded-xl border border-blue-500/20 bg-blue-500/[0.08] px-3 py-1.5">
              <Info className="size-4 text-blue-400" />
              <div className="leading-tight">
                <span
                  className="font-mono text-xs font-bold text-blue-300"
                  data-testid="audit-info-count"
                >
                  {report.stats.infos}
                </span>
                <span className="ml-1 text-[10px] text-blue-400/80">Info</span>
              </div>
            </div>

            {/* Passed */}
            <div className="flex items-center gap-1.5 rounded-xl border border-emerald-500/20 bg-emerald-500/[0.08] px-3 py-1.5">
              <CheckCircle2 className="size-4 text-emerald-400" />
              <div className="leading-tight">
                <span
                  className="font-mono text-xs font-bold text-emerald-300"
                  data-testid="audit-passed-count"
                >
                  {report.stats.passed}
                </span>
                <span className="ml-1 text-[10px] text-emerald-400/80">Berhasil</span>
              </div>
            </div>
          </div>

          {/* Scope Selector: Single page vs Multi-page */}
          {availablePages.length > 1 && (
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-zinc-500 shrink-0">Cakupan Audit:</span>
              <select
                value={auditMode}
                onChange={(e) => setAuditMode(e.target.value as any)}
                data-testid="audit-page-select"
                className="focus-ring h-8 rounded-lg border border-white/[0.09] bg-[#141418] px-2.5 text-xs text-zinc-300 outline-none"
              >
                <option value="active">Halaman Aktif ({activePath})</option>
                <option value="all">Semua Halaman ({availablePages.length} Halaman)</option>
              </select>
            </div>
          )}
        </div>

        {/* Primary Tabs: Issues vs Passed */}
        <div className="flex items-center justify-between border-b border-white/[0.06] pb-2">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveTab("issues")}
              data-testid="tab-audit-issues"
              data-test="audit-tab-issues"
              className={cn(
                "focus-ring flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition",
                activeTab === "issues"
                  ? "bg-white/10 text-white shadow-sm"
                  : "text-zinc-400 hover:text-zinc-200",
              )}
            >
              <span>Temuan Masalah</span>
              <span className="rounded-full bg-white/[0.07] px-1.5 py-0.2 font-mono text-[10px] text-zinc-300">
                {report.issues.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("passed")}
              data-testid="tab-audit-passed"
              data-test="audit-tab-passed"
              className={cn(
                "focus-ring flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition",
                activeTab === "passed"
                  ? "bg-emerald-500/15 text-emerald-300 shadow-sm"
                  : "text-zinc-400 hover:text-zinc-200",
              )}
            >
              <CheckCircle2 className="size-3.5 text-emerald-400" />
              <span>Pemeriksaan Berhasil</span>
              <span className="rounded-full bg-emerald-500/15 px-1.5 py-0.2 font-mono text-[10px] text-emerald-300">
                {report.passedChecks.length}
              </span>
            </button>
          </div>

          {/* Quick Search */}
          <div className="relative w-48 sm:w-60">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3 text-zinc-500" />
            <input
              type="text"
              data-testid="audit-search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari isu, elemen, atau selector..."
              className="focus-ring h-7.5 w-full rounded-lg border border-white/[0.08] bg-white/[0.025] pl-8 pr-2.5 text-[11px] text-zinc-200 outline-none placeholder:text-zinc-600 focus:border-blue-500/50"
            />
          </div>
        </div>

        {/* Secondary Filter Bar: Category & Severity */}
        {activeTab === "issues" && (
          <div className="flex flex-wrap items-center justify-between gap-2.5">
            {/* Category Pills */}
            <div className="flex items-center gap-1 overflow-x-auto pb-1 max-w-full">
              {(
                [
                  "all",
                  "html",
                  "seo",
                  "a11y",
                  "responsive",
                  "assets",
                  "links",
                ] as const
              ).map((cat) => {
                const count =
                  cat === "all"
                    ? report.issues.length
                    : report.issues.filter((i) => i.category === cat).length;
                const active = selectedCategory === cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedCategory(cat)}
                    data-testid={`audit-category-${cat}`}
                    data-test={`audit-category-filter-${cat}`}
                    className={cn(
                      "flex shrink-0 items-center gap-1.5 rounded-lg px-2.5 py-1 text-[11px] font-medium transition",
                      active
                        ? "bg-blue-600 text-white shadow-sm"
                        : "border border-white/[0.06] bg-white/[0.015] text-zinc-400 hover:border-white/[0.12] hover:text-zinc-200",
                    )}
                  >
                    <span>{CATEGORY_LABELS[cat]}</span>
                    {count > 0 && (
                      <span
                        className={cn(
                          "rounded-full px-1.5 py-0.2 font-mono text-[9px]",
                          active ? "bg-white/20 text-white" : "bg-white/[0.05] text-zinc-400",
                        )}
                      >
                        {count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Severity Dropdown Filter */}
            <div className="flex items-center gap-1.5 shrink-0">
              <Filter className="size-3 text-zinc-500" />
              <select
                value={selectedSeverity}
                onChange={(e) => setSelectedSeverity(e.target.value as any)}
                data-testid="audit-severity-select"
                className="focus-ring h-7 rounded-lg border border-white/[0.08] bg-[#141418] px-2 text-[11px] text-zinc-300 outline-none"
              >
                <option value="all">Semua Tingkat</option>
                <option value="error">Hanya Error ({report.stats.errors})</option>
                <option value="warning">Hanya Peringatan ({report.stats.warnings})</option>
                <option value="info">Hanya Info ({report.stats.infos})</option>
              </select>
            </div>
          </div>
        )}

        {/* Content Area */}
        <div className="max-h-[380px] overflow-y-auto space-y-2.5 pr-1.5">
          {activeTab === "issues" ? (
            filteredIssues.length === 0 ? (
              <div
                data-testid="audit-empty-state"
                className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/[0.08] bg-white/[0.01] py-12 text-center"
              >
                <CheckCircle2 className="size-10 text-emerald-400 mb-2.5" />
                <h3 className="text-sm font-semibold text-zinc-200">
                  Tidak Ada Masalah Ditemukan
                </h3>
                <p className="mt-1 text-xs text-zinc-500 max-w-sm">
                  {selectedCategory !== "all" || selectedSeverity !== "all"
                    ? "Tidak ada temuan yang cocok dengan filter yang aktif saat ini."
                    : "Halaman telah lolos dari semua uji HTML, SEO, aksesibilitas, aset, dan responsif dasar."}
                </p>
              </div>
            ) : (
              filteredIssues.map((issue) => {
                const isError = issue.severity === "error";
                const isWarning = issue.severity === "warning";

                return (
                  <article
                    key={issue.id}
                    data-testid={`audit-issue-card-${issue.id}`}
                    className={cn(
                      "group rounded-xl border p-3.5 transition duration-150",
                      isError
                        ? "border-red-500/20 bg-red-500/[0.025] hover:border-red-500/35"
                        : isWarning
                          ? "border-amber-500/20 bg-amber-500/[0.025] hover:border-amber-500/35"
                          : "border-blue-500/20 bg-blue-500/[0.025] hover:border-blue-500/35",
                    )}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        {/* Meta Tags Row */}
                        <div className="mb-1.5 flex flex-wrap items-center gap-1.5 text-[10px]">
                          {/* Severity Badge */}
                          <span
                            className={cn(
                              "inline-flex items-center gap-1 rounded-md px-2 py-0.5 font-bold uppercase tracking-wider text-[9px]",
                              isError
                                ? "bg-red-500/15 text-red-300 border border-red-500/30"
                                : isWarning
                                  ? "bg-amber-500/15 text-amber-300 border border-amber-500/30"
                                  : "bg-blue-500/15 text-blue-300 border border-blue-500/30",
                            )}
                          >
                            {isError ? (
                              <AlertCircle className="size-2.5" />
                            ) : isWarning ? (
                              <AlertTriangle className="size-2.5" />
                            ) : (
                              <Info className="size-2.5" />
                            )}
                            {issue.severity}
                          </span>

                          {/* Category Badge */}
                          <span className="rounded-md border border-white/[0.08] bg-white/[0.03] px-2 py-0.5 font-medium text-zinc-400">
                            {CATEGORY_LABELS[issue.category]}
                          </span>

                          {/* File Path Badge */}
                          <span className="flex items-center gap-1 rounded-md border border-white/[0.06] bg-black/30 px-2 py-0.5 font-mono text-[9.5px] text-zinc-400">
                            <FileCode2 className="size-2.5 text-blue-400" />
                            {issue.filePath}
                          </span>

                          {/* Target Tag / Selector */}
                          {issue.tag && (
                            <span className="font-mono text-[9.5px] text-blue-300/80">
                              &lt;{issue.tag}&gt;
                            </span>
                          )}
                        </div>

                        {/* Issue Title */}
                        <h4 className="text-xs font-semibold text-zinc-100">
                          {issue.title}
                        </h4>

                        {/* Description */}
                        <p className="mt-1 text-[11px] leading-relaxed text-zinc-400">
                          {issue.description}
                        </p>

                        {/* Suggested Fix Box */}
                        {issue.suggestedCorrection && (
                          <div className="mt-2.5 flex items-start gap-2 rounded-lg border border-white/[0.06] bg-white/[0.02] p-2 text-[10.5px] text-zinc-300">
                            <Lightbulb className="size-3.5 shrink-0 text-amber-400 mt-0.5" />
                            <div className="leading-relaxed">
                              <span className="font-medium text-amber-300 mr-1">
                                Solusi:
                              </span>
                              {issue.suggestedCorrection}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Action Button: Navigate & Select Element in Canvas */}
                      {issue.elementId && (
                        <button
                          type="button"
                          onClick={() => handleSelectFinding(issue)}
                          data-testid={`audit-select-canvas-${issue.id}`}
                          className="focus-ring flex shrink-0 items-center gap-1.5 rounded-lg border border-blue-500/30 bg-blue-500/10 px-2.5 py-1.5 text-xs font-medium text-blue-300 transition hover:bg-blue-500/20 hover:text-white"
                          title="Fokus dan pilih elemen ini di canvas preview"
                        >
                          <MousePointer2 className="size-3" />
                          <span>Pilih di Canvas</span>
                        </button>
                      )}
                    </div>
                  </article>
                );
              })
            )
          ) : (
            /* Passed Checks Tab */
            filteredPassed.length === 0 ? (
              <div className="rounded-xl border border-white/[0.06] bg-white/[0.015] p-6 text-center text-xs text-zinc-500">
                Tidak ada pemeriksaan berhasil yang cocok dengan pencarian.
              </div>
            ) : (
              <div className="space-y-2">
                {filteredPassed.map((check) => (
                  <div
                    key={check.id}
                    className="flex items-start gap-3 rounded-xl border border-emerald-500/15 bg-emerald-500/[0.025] p-3 text-xs"
                  >
                    <CheckCircle2 className="size-4 shrink-0 text-emerald-400 mt-0.5" />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-emerald-200">
                          {check.title}
                        </span>
                        <span className="rounded bg-emerald-500/10 px-1.5 py-0.2 font-mono text-[9px] text-emerald-300 uppercase">
                          {CATEGORY_LABELS[check.category]}
                        </span>
                      </div>
                      <p className="mt-0.5 text-[11px] leading-relaxed text-zinc-400">
                        {check.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )
          )}
        </div>
      </div>
    </Modal>
  );
}
