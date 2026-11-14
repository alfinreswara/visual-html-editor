import type { AuditIssue, PassedCheck } from "./types";
import { parseHtmlDocument } from "./parser";

/**
 * Calculates relative luminance of an sRGB color.
 */
function parseColor(colorStr: string): [number, number, number] | null {
  if (!colorStr) return null;
  const s = colorStr.trim().toLowerCase();

  // Hex #RGB or #RRGGBB
  if (s.startsWith("#")) {
    if (s.length === 4) {
      const r = parseInt(s[1] + s[1], 16);
      const g = parseInt(s[2] + s[2], 16);
      const b = parseInt(s[3] + s[3], 16);
      return [r, g, b];
    }
    if (s.length === 7) {
      const r = parseInt(s.slice(1, 3), 16);
      const g = parseInt(s.slice(3, 5), 16);
      const b = parseInt(s.slice(5, 7), 16);
      return [r, g, b];
    }
  }

  // rgb(r, g, b)
  const rgbMatch = s.match(/rgb\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)/);
  if (rgbMatch) {
    return [parseInt(rgbMatch[1], 10), parseInt(rgbMatch[2], 10), parseInt(rgbMatch[3], 10)];
  }

  // Standard named colors
  if (s === "black") return [0, 0, 0];
  if (s === "white") return [255, 255, 255];
  if (s === "red") return [255, 0, 0];
  if (s === "blue") return [0, 0, 255];
  if (s === "green") return [0, 128, 0];
  if (s === "yellow") return [255, 255, 0];

  return null;
}

function getLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map((val) => {
    const s = val / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

function getContrastRatio(rgb1: [number, number, number], rgb2: [number, number, number]): number {
  const l1 = getLuminance(...rgb1);
  const l2 = getLuminance(...rgb2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Evaluates WCAG 2.1 accessibility indicators:
 * - Alt text
 * - Form labels
 * - Button & link accessible names
 * - Language declaration
 * - Heading structure
 * - Landmark regions
 * - Measurable color contrast
 * - Static keyboard accessibility
 */
export function checkAccessibility(
  html: string,
  filePath: string = "index.html",
): { issues: AuditIssue[]; passedChecks: PassedCheck[] } {
  const issues: AuditIssue[] = [];
  const passedChecks: PassedCheck[] = [];

  if (typeof DOMParser === "undefined" || !html) {
    return { issues, passedChecks };
  }

  const doc = parseHtmlDocument(html);

  // 1. Missing Image Alt Text
  const images = doc.querySelectorAll("img");
  let altMissingCount = 0;
  images.forEach((img, idx) => {
    const role = (img.getAttribute("role") || "").toLowerCase().trim();
    const ariaHidden = (img.getAttribute("aria-hidden") || "").toLowerCase().trim();
    const isExplicitlyDecorative =
      role === "presentation" || role === "none" || ariaHidden === "true";

    const alt = img.getAttribute("alt");
    if (alt === null && !isExplicitlyDecorative) {
      altMissingCount++;
      issues.push({
        id: `${filePath}-a11y-img-no-alt-${idx}`,
        category: "a11y",
        severity: "error",
        title: "Gambar tanpa atribut alt (WCAG 1.1.1)",
        description: `Elemen <img> (src="${(img.getAttribute("src") || "").slice(0, 30)}") tidak memiliki atribut alt sama sekali. Pengguna tuna netra tidak dapat memahami konten visual ini.`,
        suggestedCorrection: 'Tambahkan alt="Deskripsi gambar" atau alt="" / role="presentation" jika gambar murni dekoratif.',
        filePath,
        elementId: img.getAttribute("data-ve-id") || undefined,
        tag: "img",
        selector: "img",
      });
    }
  });

  if (images.length > 0 && altMissingCount === 0) {
    passedChecks.push({
      id: `${filePath}-a11y-images-have-alt`,
      category: "a11y",
      title: "Semua Gambar Memiliki Atribut Alt atau Dinyatakan Dekoratif",
      description: "Setiap elemen <img> memiliki atribut teks alternatif atau role='presentation' / aria-hidden='true' untuk screen reader.",
    });
  }

  // 2. Form Control Labels
  const formControls = doc.querySelectorAll("input, select, textarea");
  let unlabelledControls = 0;
  formControls.forEach((el, idx) => {
    const tag = el.tagName.toLowerCase();
    const type = el.getAttribute("type")?.toLowerCase();
    if (tag === "input" && (type === "hidden" || type === "submit" || type === "button" || type === "reset")) {
      return;
    }

    const id = el.getAttribute("id");
    const hasLabelFor = id ? Boolean(doc.querySelector(`label[for="${id}"]`)) : false;
    const hasWrappingLabel = Boolean(el.closest("label"));
    const ariaLabel = el.getAttribute("aria-label")?.trim();
    const ariaLabelledby = el.getAttribute("aria-labelledby")?.trim();
    const title = el.getAttribute("title")?.trim();

    if (!hasLabelFor && !hasWrappingLabel && !ariaLabel && !ariaLabelledby && !title) {
      unlabelledControls++;
      issues.push({
        id: `${filePath}-a11y-unlabelled-form-control-${idx}`,
        category: "a11y",
        severity: "error",
        title: `Elemen form <${tag}> tanpa label (WCAG 3.3.2 / 1.3.1)`,
        description: `Elemen form <${tag}> ini tidak memiliki <label for>, aria-label, atau pembungkus <label>. Pembaca layar tidak dapat memberitahukan tujuan input ini.`,
        suggestedCorrection: `Hubungkan dengan <label for="${id || "field_id"}">Label Input</label> atau tambahkan atribut aria-label="Nama Input".`,
        filePath,
        elementId: el.getAttribute("data-ve-id") || undefined,
        tag,
        selector: tag,
      });
    }
  });

  if (formControls.length > 0 && unlabelledControls === 0) {
    passedChecks.push({
      id: `${filePath}-a11y-form-labels-passed`,
      category: "a11y",
      title: "Semua Kontrol Form Memiliki Label Aksesibel",
      description: "Setiap input, select, dan textarea terhubung dengan label atau atribut nama aksesibel.",
    });
  }

  // 3. Buttons Without Accessible Name
  const buttons = doc.querySelectorAll("button");
  let namelessButtons = 0;
  buttons.forEach((btn, idx) => {
    const text = btn.textContent?.trim() || "";
    const ariaLabel = btn.getAttribute("aria-label")?.trim();
    const ariaLabelledby = btn.getAttribute("aria-labelledby")?.trim();
    const title = btn.getAttribute("title")?.trim();
    const hasAltImg = Boolean(btn.querySelector("img[alt]")?.getAttribute("alt")?.trim());
    const hasSvgTitle = Boolean(btn.querySelector("svg title")?.textContent?.trim());

    if (!text && !ariaLabel && !ariaLabelledby && !title && !hasAltImg && !hasSvgTitle) {
      namelessButtons++;
      issues.push({
        id: `${filePath}-a11y-nameless-button-${idx}`,
        category: "a11y",
        severity: "error",
        title: "Tombol <button> tanpa nama aksesibel (WCAG 4.1.2)",
        description: "Tombol ini (sering berupa tombol ikon tanpa teks) tidak dapat diumumkan fungsinya oleh pembaca layar.",
        suggestedCorrection: 'Tambahkan teks atau atribut aria-label="Nama Tombol" pada elemen <button>.',
        filePath,
        elementId: btn.getAttribute("data-ve-id") || undefined,
        tag: "button",
        selector: "button",
      });
    }
  });

  if (buttons.length > 0 && namelessButtons === 0) {
    passedChecks.push({
      id: `${filePath}-a11y-buttons-named-passed`,
      category: "a11y",
      title: "Semua Tombol Memiliki Nama Aksesibel",
      description: "Tombol memiliki teks atau atribut aria-label yang dapat dibacakan screen reader.",
    });
  }

  // 4. Links Without Accessible Name
  const links = doc.querySelectorAll("a");
  let namelessLinks = 0;
  links.forEach((a, idx) => {
    const text = a.textContent?.trim() || "";
    const ariaLabel = a.getAttribute("aria-label")?.trim();
    const ariaLabelledby = a.getAttribute("aria-labelledby")?.trim();
    const title = a.getAttribute("title")?.trim();
    const hasAltImg = Boolean(a.querySelector("img[alt]")?.getAttribute("alt")?.trim());

    if (!text && !ariaLabel && !ariaLabelledby && !title && !hasAltImg) {
      namelessLinks++;
      issues.push({
        id: `${filePath}-a11y-nameless-link-${idx}`,
        category: "a11y",
        severity: "error",
        title: "Tautan <a> tanpa nama aksesibel (WCAG 2.4.4)",
        description: "Tautan tanpa teks atau aria-label menyebabkan screen reader membacakan URL mentah atau 'unlabelled link'.",
        suggestedCorrection: 'Tambahkan teks tautan deskriptif atau atribut aria-label="Tujuan Tautan".',
        filePath,
        elementId: a.getAttribute("data-ve-id") || undefined,
        tag: "a",
        selector: "a",
      });
    }
  });

  if (links.length > 0 && namelessLinks === 0) {
    passedChecks.push({
      id: `${filePath}-a11y-links-named-passed`,
      category: "a11y",
      title: "Semua Tautan Memiliki Teks Aksesibel",
      description: "Tautan memiliki teks atau atribut aria-label yang menjelaskan tujuannya.",
    });
  }

  // 5. Document Language
  const langAttr = doc.documentElement?.getAttribute("lang")?.trim();
  if (!langAttr) {
    issues.push({
      id: `${filePath}-a11y-missing-lang`,
      category: "a11y",
      severity: "error",
      title: "Bahasa dokumen tidak dideklarasikan (WCAG 3.1.1)",
      description: "Tanpa atribut lang pada tag <html>, alat pembaca layar tidak mengetahui aksen bahasa yang tepat untuk membaca konten.",
      suggestedCorrection: 'Tambahkan lang="id" (Bahasa Indonesia) atau lang="en" pada tag <html>.',
      filePath,
      tag: "html",
      selector: "html",
    });
  } else {
    passedChecks.push({
      id: `${filePath}-a11y-lang-passed`,
      category: "a11y",
      title: "Bahasa Dokumen Dideklarasikan",
      description: `Tag <html> memiliki atribut lang="${langAttr}".`,
    });
  }

  // 6. Landmark Structure
  const mainEl = doc.querySelector("main, [role='main']");
  if (!mainEl) {
    issues.push({
      id: `${filePath}-a11y-missing-main-landmark`,
      category: "a11y",
      severity: "warning",
      title: "Landmark utama <main> tidak ditemukan (WCAG 1.3.1 / 2.4.1)",
      description: "Elemen <main> membantu pengguna pembaca layar dan keyboard melompati navigasi header dan langsung menuju ke konten pokok halaman.",
      suggestedCorrection: "Bungkus konten utama halaman Anda di dalam tag <main>.",
      filePath,
      tag: "main",
      selector: "body",
    });
  } else {
    passedChecks.push({
      id: `${filePath}-a11y-landmark-main-passed`,
      category: "a11y",
      title: "Struktur Landmark <main> Tersedia",
      description: "Halaman memiliki elemen konten utama (<main>) yang dikenali assistive technology.",
    });
  }

  // 7. Positive Tabindex Anti-pattern
  const positiveTabindexElements = doc.querySelectorAll("[tabindex]");
  positiveTabindexElements.forEach((el, idx) => {
    const rawVal = el.getAttribute("tabindex");
    const val = parseInt(rawVal || "0", 10);
    if (val > 0) {
      issues.push({
        id: `${filePath}-a11y-positive-tabindex-${idx}`,
        category: "a11y",
        severity: "warning",
        title: `Atribut tabindex positif (tabindex="${val}") terdeteksi`,
        description: "Nilai tabindex lebih besar dari 0 merusak urutan navigasi keyboard alami dan membingungkan pengguna.",
        suggestedCorrection: 'Gunakan tabindex="0" (agar dapat difokuskan sesuai urutan dokumen) atau perbaiki urutan elemen dalam DOM.',
        filePath,
        elementId: el.getAttribute("data-ve-id") || undefined,
        tag: el.tagName.toLowerCase(),
        selector: `[tabindex="${val}"]`,
      });
    }
  });

  // 8. Measurable Static Color Contrast & Dynamic Background Detection
  // Checks inline styles like style="color: #...; background-color: #..."
  const elementsWithInlineStyles = doc.querySelectorAll("[style]");
  let measurableContrastCount = 0;
  let lowContrastCount = 0;

  elementsWithInlineStyles.forEach((el, idx) => {
    const styleAttr = el.getAttribute("style") || "";
    const colorMatch = styleAttr.match(/(?:^|;)\s*color\s*:\s*([^;]+)/i);
    const bgMatch = styleAttr.match(/(?:^|;)\s*background(?:-color|-image)?\s*:\s*([^;]+)/i);

    if (colorMatch && bgMatch) {
      const colorRaw = colorMatch[1].trim();
      const bgRaw = bgMatch[1].trim();

      // Check for dynamic / gradient / image background
      const isDynamicBg = /gradient|url\(/i.test(bgRaw);

      if (isDynamicBg) {
        issues.push({
          id: `${filePath}-a11y-dynamic-bg-${idx}`,
          category: "a11y",
          severity: "info",
          title: "[Heuristik Visual] Latar belakang dinamis atau gradien terdeteksi (WCAG 1.4.3)",
          description: `Elemen memiliki gaya latar belakang dinamis/gradien/gambar ("${bgRaw.slice(0, 45)}..."). Kontras teks statis tidak dapat diukur secara andal; verifikasi keterbacaan teks secara visual untuk memastikan rasio kontras >= 4.5:1.`,
          suggestedCorrection: "Periksa kontras visual secara manual atau tambahkan layer latar belakang solid pendukung di belakang teks.",
          filePath,
          elementId: el.getAttribute("data-ve-id") || undefined,
          tag: el.tagName.toLowerCase(),
          selector: el.tagName.toLowerCase(),
        });
      } else {
        const fg = parseColor(colorRaw);
        const bg = parseColor(bgRaw);

        if (fg && bg) {
          measurableContrastCount++;
          const ratio = getContrastRatio(fg, bg);
          // Normal text requires 4.5:1
          if (ratio < 4.5) {
            lowContrastCount++;
            issues.push({
              id: `${filePath}-a11y-low-contrast-${idx}`,
              category: "a11y",
              severity: "warning",
              title: `Rasio kontras warna rendah: ${ratio.toFixed(2)}:1 (WCAG 1.4.3)`,
              description: `Warna teks (${colorRaw}) dan latar belakang (${bgRaw}) memiliki kontras ${ratio.toFixed(2)}:1, di bawah standar minimum 4.5:1.`,
              suggestedCorrection: "Gunakan warna teks yang lebih gelap atau latar belakang yang lebih terang untuk memenuhi standar WCAG AA (minimal 4.5:1).",
              filePath,
              elementId: el.getAttribute("data-ve-id") || undefined,
              tag: el.tagName.toLowerCase(),
              selector: el.tagName.toLowerCase(),
            });
          }
        }
      }
    }
  });

  if (measurableContrastCount > 0 && lowContrastCount === 0) {
    passedChecks.push({
      id: `${filePath}-a11y-contrast-passed`,
      category: "a11y",
      title: "Kontras Warna Statis Memenuhi Standar WCAG AA",
      description: `${measurableContrastCount} elemen dengan warna teks dan latar belakang statis terukur memenuhi rasio kontras minimum 4.5:1.`,
    });
  }

  return { issues, passedChecks };
}
