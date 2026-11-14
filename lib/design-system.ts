import { POPULAR_GOOGLE_FONTS } from "@/lib/style-files";

export interface GlobalTheme {
  primaryColor?: string;
  secondaryColor?: string;
  accentColor?: string;
  backgroundColor?: string;
  surfaceColor?: string;
  textColor?: string;
  mutedTextColor?: string;
  borderColor?: string;
  headingFont?: string;
  bodyFont?: string;
  monoFont?: string;
  fontSizeBase?: string;
  radiusPreset?: "none" | "sm" | "md" | "lg" | "full";
  shadowPreset?: "none" | "subtle" | "medium" | "dramatic";
  presetId?: string;
}

export interface DesignTokens {
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    text: string;
    mutedText: string;
    border: string;
  };
  typography: {
    headingFont: string;
    bodyFont: string;
    monoFont: string;
    fontSizeBase: string;
  };
  radii: {
    sm: string;
    md: string;
    lg: string;
    full: string;
  };
  shadows: {
    sm: string;
    md: string;
    lg: string;
  };
  spacing: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
}

export interface DesignSystemPreset {
  id: string;
  name: string;
  description: string;
  theme: GlobalTheme;
}

export const RADIUS_VALUES: Record<NonNullable<GlobalTheme["radiusPreset"]>, { sm: string; md: string; lg: string; full: string }> = {
  none: { sm: "0px", md: "0px", lg: "0px", full: "0px" },
  sm: { sm: "2px", md: "4px", lg: "6px", full: "9999px" },
  md: { sm: "4px", md: "8px", lg: "12px", full: "9999px" },
  lg: { sm: "6px", md: "12px", lg: "20px", full: "9999px" },
  full: { sm: "8px", md: "16px", lg: "28px", full: "9999px" },
};

export const SHADOW_VALUES: Record<NonNullable<GlobalTheme["shadowPreset"]>, { sm: string; md: string; lg: string }> = {
  none: {
    sm: "none",
    md: "none",
    lg: "none",
  },
  subtle: {
    sm: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
    md: "0 4px 6px -1px rgba(0, 0, 0, 0.07), 0 2px 4px -2px rgba(0, 0, 0, 0.05)",
    lg: "0 10px 15px -3px rgba(0, 0, 0, 0.08), 0 4px 6px -4px rgba(0, 0, 0, 0.04)",
  },
  medium: {
    sm: "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)",
    md: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)",
    lg: "0 12px 24px -4px rgba(0, 0, 0, 0.15), 0 6px 12px -6px rgba(0, 0, 0, 0.1)",
  },
  dramatic: {
    sm: "0 2px 4px 0 rgba(0, 0, 0, 0.2)",
    md: "0 8px 16px -2px rgba(0, 0, 0, 0.25), 0 4px 8px -4px rgba(0, 0, 0, 0.2)",
    lg: "0 24px 48px -12px rgba(0, 0, 0, 0.35)",
  },
};

export const DESIGN_SYSTEM_PRESETS: DesignSystemPreset[] = [
  {
    id: "modern-minimal",
    name: "Modern Minimal",
    description: "Tampilan bersih bernuansa biru modern dengan font Inter yang tajam dan kontras ideal.",
    theme: {
      presetId: "modern-minimal",
      primaryColor: "#3b82f6",
      secondaryColor: "#64748b",
      accentColor: "#f59e0b",
      backgroundColor: "#ffffff",
      surfaceColor: "#f8fafc",
      textColor: "#0f172a",
      mutedTextColor: "#64748b",
      borderColor: "#e2e8f0",
      headingFont: "Inter",
      bodyFont: "Inter",
      fontSizeBase: "16px",
      radiusPreset: "md",
      shadowPreset: "medium",
    },
  },
  {
    id: "dark-tech",
    name: "Dark Tech",
    description: "Mode gelap futuristik dengan aksen neon cyan dan tipografi modern yang berani.",
    theme: {
      presetId: "dark-tech",
      primaryColor: "#06b6d4",
      secondaryColor: "#8b5cf6",
      accentColor: "#f43f5e",
      backgroundColor: "#09090b",
      surfaceColor: "#18181b",
      textColor: "#f4f4f5",
      mutedTextColor: "#a1a1aa",
      borderColor: "#27272a",
      headingFont: "Space Grotesk",
      bodyFont: "Inter",
      fontSizeBase: "16px",
      radiusPreset: "md",
      shadowPreset: "dramatic",
    },
  },
  {
    id: "warm-editorial",
    name: "Warm Editorial",
    description: "Kombinasi klasik elegan bertema krem hangat, merah anggur, dan tipografi serif Playfair Display.",
    theme: {
      presetId: "warm-editorial",
      primaryColor: "#991b1b",
      secondaryColor: "#78350f",
      accentColor: "#d97706",
      backgroundColor: "#fdfbf7",
      surfaceColor: "#f5f0ea",
      textColor: "#292524",
      mutedTextColor: "#78716c",
      borderColor: "#e7e5e4",
      headingFont: "Playfair Display",
      bodyFont: "Lora",
      fontSizeBase: "17px",
      radiusPreset: "sm",
      shadowPreset: "subtle",
    },
  },
  {
    id: "clean-saas",
    name: "Clean SaaS",
    description: "Nuansa startup SaaS profesional dengan ungu violet energik dan Plus Jakarta Sans yang ramah.",
    theme: {
      presetId: "clean-saas",
      primaryColor: "#7c3aed",
      secondaryColor: "#3b82f6",
      accentColor: "#10b981",
      backgroundColor: "#ffffff",
      surfaceColor: "#faf5ff",
      textColor: "#18181b",
      mutedTextColor: "#71717a",
      borderColor: "#ede9fe",
      headingFont: "Plus Jakarta Sans",
      bodyFont: "Plus Jakarta Sans",
      fontSizeBase: "16px",
      radiusPreset: "lg",
      shadowPreset: "medium",
    },
  },
  {
    id: "ocean-corporate",
    name: "Ocean Corporate",
    description: "Biru laut dalam berpadu langit cerah, menghadirkan rasa percaya diri dan profesionalisme institusi.",
    theme: {
      presetId: "ocean-corporate",
      primaryColor: "#0284c7",
      secondaryColor: "#0f172a",
      accentColor: "#0d9488",
      backgroundColor: "#ffffff",
      surfaceColor: "#f0f9ff",
      textColor: "#0f172a",
      mutedTextColor: "#475569",
      borderColor: "#e0f2fe",
      headingFont: "Outfit",
      bodyFont: "Roboto",
      fontSizeBase: "16px",
      radiusPreset: "md",
      shadowPreset: "medium",
    },
  },
  {
    id: "emerald-growth",
    name: "Emerald Growth",
    description: "Hijau zamrud segar bertema ekologi dan pertumbuhan bisnis dengan tipografi Poppins modern.",
    theme: {
      presetId: "emerald-growth",
      primaryColor: "#10b981",
      secondaryColor: "#047857",
      accentColor: "#f59e0b",
      backgroundColor: "#ffffff",
      surfaceColor: "#ecfdf5",
      textColor: "#064e3b",
      mutedTextColor: "#059669",
      borderColor: "#d1fae5",
      headingFont: "Poppins",
      bodyFont: "Inter",
      fontSizeBase: "16px",
      radiusPreset: "lg",
      shadowPreset: "medium",
    },
  },
];

export const DEFAULT_DESIGN_SYSTEM: GlobalTheme = DESIGN_SYSTEM_PRESETS[0].theme;

export function resolveDesignTokens(theme?: GlobalTheme): DesignTokens {
  const merged: GlobalTheme = { ...DEFAULT_DESIGN_SYSTEM, ...(theme || {}) };
  const radKey = merged.radiusPreset || "md";
  const shdKey = merged.shadowPreset || "medium";

  return {
    colors: {
      primary: merged.primaryColor || "#3b82f6",
      secondary: merged.secondaryColor || "#64748b",
      accent: merged.accentColor || "#f59e0b",
      background: merged.backgroundColor || "#ffffff",
      surface: merged.surfaceColor || "#f8fafc",
      text: merged.textColor || "#0f172a",
      mutedText: merged.mutedTextColor || "#64748b",
      border: merged.borderColor || "#e2e8f0",
    },
    typography: {
      headingFont: merged.headingFont ? `'${merged.headingFont}', sans-serif` : "system-ui, sans-serif",
      bodyFont: merged.bodyFont ? `'${merged.bodyFont}', sans-serif` : "system-ui, sans-serif",
      monoFont: merged.monoFont || "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
      fontSizeBase: merged.fontSizeBase || "16px",
    },
    radii: RADIUS_VALUES[radKey] || RADIUS_VALUES.md,
    shadows: SHADOW_VALUES[shdKey] || SHADOW_VALUES.medium,
    spacing: {
      xs: "4px",
      sm: "8px",
      md: "16px",
      lg: "24px",
      xl: "32px",
    },
  };
}

export function generateDesignSystemCss(theme?: GlobalTheme): string {
  const tokens = resolveDesignTokens(theme);
  const primary = tokens.colors.primary;
  const secondary = tokens.colors.secondary;
  const accent = tokens.colors.accent;
  const bg = tokens.colors.background;
  const surface = tokens.colors.surface;
  const text = tokens.colors.text;
  const muted = tokens.colors.mutedText;
  const border = tokens.colors.border;

  return `/* --- KANVAS GLOBAL THEME --- */
:root {
  /* Colors */
  --primary: ${primary};
  --color-primary: ${primary};
  --color-secondary: ${secondary};
  --color-accent: ${accent};
  --color-bg: ${bg};
  --color-surface: ${surface};
  --text: ${text};
  --color-text: ${text};
  --color-muted: ${muted};
  --color-border: ${border};

  /* Typography */
  --font-heading: ${tokens.typography.headingFont};
  --font-body: ${tokens.typography.bodyFont};
  --font-mono: ${tokens.typography.monoFont};
  --font-size-base: ${tokens.typography.fontSizeBase};

  /* Border Radius */
  --radius-sm: ${tokens.radii.sm};
  --radius-md: ${tokens.radii.md};
  --radius-lg: ${tokens.radii.lg};
  --radius-full: ${tokens.radii.full};

  /* Shadows */
  --shadow-sm: ${tokens.shadows.sm};
  --shadow-md: ${tokens.shadows.md};
  --shadow-lg: ${tokens.shadows.lg};

  /* Spacing */
  --spacing-xs: ${tokens.spacing.xs};
  --spacing-sm: ${tokens.spacing.sm};
  --spacing-md: ${tokens.spacing.md};
  --spacing-lg: ${tokens.spacing.lg};
  --spacing-xl: ${tokens.spacing.xl};
}

body {
  background-color: var(--color-bg);
  color: var(--color-text);
  font-family: var(--font-body);
  font-size: var(--font-size-base);
  margin: 0;
  line-height: 1.6;
}

h1, h2, h3, h4, h5, h6 {
  font-family: var(--font-heading);
  color: var(--color-text);
  line-height: 1.25;
  margin-top: 0;
}

a {
  color: var(--color-primary);
  text-decoration: none;
  transition: opacity 150ms ease;
}

a:hover {
  opacity: 0.85;
}

/* Design System Component Utilities */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px 20px;
  font-family: var(--font-body);
  font-size: 14px;
  font-weight: 600;
  border-radius: var(--radius-md);
  cursor: pointer;
  border: 1px solid transparent;
  transition: all 180ms ease;
  text-decoration: none;
}

.btn-primary, button.primary {
  background-color: var(--color-primary);
  color: #ffffff;
  border-color: var(--color-primary);
}

.btn-primary:hover, button.primary:hover {
  filter: brightness(1.1);
  box-shadow: var(--shadow-md);
}

.btn-secondary {
  background-color: var(--color-surface);
  color: var(--color-text);
  border-color: var(--color-border);
}

.btn-secondary:hover {
  background-color: var(--color-bg);
  box-shadow: var(--shadow-sm);
}

.btn-outline {
  background-color: transparent;
  color: var(--color-primary);
  border-color: var(--color-primary);
}

.btn-outline:hover {
  background-color: var(--color-primary);
  color: #ffffff;
}

.card, .card-surface {
  background-color: var(--color-surface);
  color: var(--color-text);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: 24px;
  box-shadow: var(--shadow-sm);
  transition: transform 200ms ease, box-shadow 200ms ease;
}

.card:hover {
  box-shadow: var(--shadow-md);
}

.badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  border-radius: var(--radius-full);
  font-size: 12px;
  font-weight: 600;
  background-color: var(--color-surface);
  color: var(--color-text);
  border: 1px solid var(--color-border);
}

.badge-primary {
  background-color: var(--color-primary);
  color: #ffffff;
  border-color: var(--color-primary);
}

.text-muted {
  color: var(--color-muted);
}

.border-default {
  border-color: var(--color-border);
}
/* --- END KANVAS GLOBAL THEME --- */`;
}

export function extractDesignSystemFromCss(css: string): Partial<GlobalTheme> | null {
  const match = css.match(/\/\* --- KANVAS GLOBAL THEME --- \*\/([\s\S]*?)\/\* --- END KANVAS GLOBAL THEME --- \*\//);
  if (!match) return null;

  const block = match[1];
  const result: Partial<GlobalTheme> = {};

  const primaryMatch = block.match(/--color-primary:\s*([^;]+);/);
  if (primaryMatch) result.primaryColor = primaryMatch[1].trim();

  const secMatch = block.match(/--color-secondary:\s*([^;]+);/);
  if (secMatch) result.secondaryColor = secMatch[1].trim();

  const accentMatch = block.match(/--color-accent:\s*([^;]+);/);
  if (accentMatch) result.accentColor = accentMatch[1].trim();

  const bgMatch = block.match(/--color-bg:\s*([^;]+);/);
  if (bgMatch) result.backgroundColor = bgMatch[1].trim();

  const surfMatch = block.match(/--color-surface:\s*([^;]+);/);
  if (surfMatch) result.surfaceColor = surfMatch[1].trim();

  const textMatch = block.match(/--color-text:\s*([^;]+);/);
  if (textMatch) result.textColor = textMatch[1].trim();

  const mutMatch = block.match(/--color-muted:\s*([^;]+);/);
  if (mutMatch) result.mutedTextColor = mutMatch[1].trim();

  const borderMatch = block.match(/--color-border:\s*([^;]+);/);
  if (borderMatch) result.borderColor = borderMatch[1].trim();

  const fontHeadMatch = block.match(/--font-heading:\s*'([^']+)'/);
  if (fontHeadMatch) result.headingFont = fontHeadMatch[1].trim();

  const fontBodyMatch = block.match(/--font-body:\s*'([^']+)'/);
  if (fontBodyMatch) result.bodyFont = fontBodyMatch[1].trim();

  const fsMatch = block.match(/--font-size-base:\s*([^;]+);/);
  if (fsMatch) result.fontSizeBase = fsMatch[1].trim();

  return result;
}
