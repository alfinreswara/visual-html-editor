export type AuditCategory =
  | "html"
  | "seo"
  | "a11y"
  | "responsive"
  | "assets"
  | "links";

export type AuditSeverity = "error" | "warning" | "info";

export interface AuditIssue {
  id: string;
  category: AuditCategory;
  severity: AuditSeverity;
  title: string;
  description: string;
  suggestedCorrection: string;
  filePath: string;
  elementId?: string; // data-ve-id for canvas selection
  selector?: string; // CSS selector or human readable selector
  tag?: string; // HTML tag name
  line?: number;
}

export interface PassedCheck {
  id: string;
  category: AuditCategory;
  title: string;
  description: string;
}

export interface AuditReport {
  timestamp: number;
  issues: AuditIssue[];
  passedChecks: PassedCheck[];
  stats: {
    errors: number;
    warnings: number;
    infos: number;
    total: number;
    passed: number;
  };
  pageSummaries: Record<
    string,
    {
      errors: number;
      warnings: number;
      infos: number;
      passed: number;
    }
  >;
  disclaimer: string;
}

export interface ResponsiveCheckOptions {
  viewportWidth: number;
  viewportHeight: number;
  deviceLabel?: string;
}
