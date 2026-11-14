import type { ProjectFiles } from "@/lib/project-files";
import type { GlobalTheme } from "@/lib/style-files";

export const TEMPLATE_CATEGORIES = [
  "Semua",
  "SaaS",
  "Business",
  "Agency",
  "Portfolio",
  "E-commerce",
  "Startup",
  "Blog",
  "Creative",
] as const;

export type TemplateCategory = (typeof TEMPLATE_CATEGORIES)[number];

export interface TemplatePage {
  path: string;
  title: string;
  description?: string;
  isEntry?: boolean;
}

export interface WebsiteTemplate {
  id: string;
  name: string;
  category: Exclude<TemplateCategory, "Semua">;
  description: string;
  entry?: string;
  featured?: boolean;
  author?: string;
  isCustom?: boolean;
  createdAt: number;
  updatedAt: number;
  tags: string[];
  thumbnailGradient: {
    from: string;
    to: string;
    accent: string;
  };
  globalTheme: GlobalTheme;
  files: ProjectFiles;
  pages: TemplatePage[];
  sections: string[];
}
