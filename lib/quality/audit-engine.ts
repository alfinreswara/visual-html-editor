import type {
  AuditCategory,
  AuditIssue,
  AuditReport,
  PassedCheck,
  ResponsiveCheckOptions,
} from "./types";
import { validateHtml } from "./html-validator";
import { analyzeSeo } from "./seo-analyzer";
import { checkAccessibility } from "./a11y-checker";
import { detectBrokenAssets } from "./asset-detector";
import { checkResponsiveLayout } from "./responsive-checker";
import type { ProjectFiles } from "@/lib/project-files";

export interface AuditProjectOptions {
  activePath?: string;
  auditAllPages?: boolean;
  responsiveViewports?: ResponsiveCheckOptions[];
}

const DEFAULT_VIEWPORTS: ResponsiveCheckOptions[] = [
  { viewportWidth: 1280, viewportHeight: 800, deviceLabel: "Desktop (1280px)" },
  { viewportWidth: 768, viewportHeight: 1024, deviceLabel: "Tablet (768px)" },
  { viewportWidth: 390, viewportHeight: 844, deviceLabel: "Mobile (390px)" },
];

/**
 * Executes a comprehensive, rigorous quality audit across the project's HTML pages.
 * Supports multi-page project audits and isolated single-page audits.
 */
export function runProjectAudit(
  files: ProjectFiles,
  options: AuditProjectOptions = {},
): AuditReport {
  const {
    activePath = "index.html",
    auditAllPages = false,
    responsiveViewports = DEFAULT_VIEWPORTS,
  } = options;

  // Determine pages to audit
  const htmlPages: string[] = [];
  if (auditAllPages) {
    Object.keys(files).forEach((path) => {
      if (path.endsWith(".html") || path.endsWith(".htm")) {
        htmlPages.push(path);
      }
    });
    // Ensure activePath or index.html is first
    if (!htmlPages.includes(activePath) && files[activePath]) {
      htmlPages.unshift(activePath);
    }
  } else {
    htmlPages.push(files[activePath] ? activePath : "index.html");
  }

  const allIssues: AuditIssue[] = [];
  const allPassedChecks: PassedCheck[] = [];
  const pageSummaries: AuditReport["pageSummaries"] = {};

  for (const pagePath of htmlPages) {
    const file = files[pagePath];
    if (!file || file.kind !== "text") continue;

    const htmlContent = file.content;
    const pageIssues: AuditIssue[] = [];
    const pagePassed: PassedCheck[] = [];

    // 1. HTML Validation
    const htmlRes = validateHtml(htmlContent, pagePath);
    pageIssues.push(...htmlRes.issues);
    pagePassed.push(...htmlRes.passedChecks);

    // 2. SEO Analysis
    const seoRes = analyzeSeo(htmlContent, pagePath);
    pageIssues.push(...seoRes.issues);
    pagePassed.push(...seoRes.passedChecks);

    // 3. Accessibility Checking
    const a11yRes = checkAccessibility(htmlContent, pagePath);
    pageIssues.push(...a11yRes.issues);
    pagePassed.push(...a11yRes.passedChecks);

    // 4. Broken Asset & Link Detection
    const assetRes = detectBrokenAssets(files, pagePath);
    pageIssues.push(...assetRes.issues);
    pagePassed.push(...assetRes.passedChecks);

    // 5. Responsive Checks for Mobile & Desktop
    for (const vp of responsiveViewports) {
      const respRes = checkResponsiveLayout(htmlContent, vp, pagePath);
      pageIssues.push(...respRes.issues);
      pagePassed.push(...respRes.passedChecks);
    }

    allIssues.push(...pageIssues);
    allPassedChecks.push(...pagePassed);

    const errCount = pageIssues.filter((i) => i.severity === "error").length;
    const warnCount = pageIssues.filter((i) => i.severity === "warning").length;
    const infoCount = pageIssues.filter((i) => i.severity === "info").length;

    pageSummaries[pagePath] = {
      errors: errCount,
      warnings: warnCount,
      infos: infoCount,
      passed: pagePassed.length,
    };
  }

  const errors = allIssues.filter((i) => i.severity === "error").length;
  const warnings = allIssues.filter((i) => i.severity === "warning").length;
  const infos = allIssues.filter((i) => i.severity === "info").length;

  return {
    timestamp: Date.now(),
    issues: allIssues,
    passedChecks: allPassedChecks,
    stats: {
      errors,
      warnings,
      infos,
      total: allIssues.length,
      passed: allPassedChecks.length,
    },
    pageSummaries,
    disclaimer:
      "Pemeriksaan kualitas otomatis ini mendeteksi kesalahan sintaks HTML, indikator SEO, kesesuaian aksesibilitas struktural (WCAG), aset lokal rusak, dan potensi masalah responsif. Audit statis otomatis mencakup sebagian kriteria WCAG (~30-40%); pengujian manual dengan screen reader, navigasi keyboard penuh, dan verifikasi perangkat nyata tetap diwajibkan untuk kepatuhan aksesibilitas menyeluruh.",
  };
}
