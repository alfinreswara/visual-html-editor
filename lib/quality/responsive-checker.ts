import type { AuditIssue, PassedCheck, ResponsiveCheckOptions } from "./types";
import { parseHtmlDocument } from "./parser";

/**
 * Checks responsive layout issues statically for a given viewport width (e.g., 390px for mobile, 768px for tablet, 1280px for desktop).
 */
export function checkResponsiveLayout(
  html: string,
  options: ResponsiveCheckOptions,
  filePath: string = "index.html",
): { issues: AuditIssue[]; passedChecks: PassedCheck[] } {
  const issues: AuditIssue[] = [];
  const passedChecks: PassedCheck[] = [];

  if (typeof DOMParser === "undefined" || !html) {
    return { issues, passedChecks };
  }

  const { viewportWidth, deviceLabel = `${viewportWidth}px` } = options;
  const doc = parseHtmlDocument(html);

  // 1. Missing Viewport Meta Tag (Critical for Mobile/Tablet)
  const viewportMeta = doc.querySelector('meta[name="viewport" i]');
  if (!viewportMeta && viewportWidth < 1000) {
    issues.push({
      id: `${filePath}-resp-no-viewport-meta`,
      category: "responsive",
      severity: "error",
      title: `Tag meta viewport tidak ditemukan pada tampilan ${deviceLabel}`,
      description: "Tanpa <meta name=\"viewport\" content=\"width=device-width, initial-scale=1\">, perangkat seluler akan memperkecil tampilan seluruh halaman dan mengabaikan breakpoint CSS responsif.",
      suggestedCorrection: 'Tambahkan <meta name="viewport" content="width=device-width, initial-scale=1.0"> ke dalam tag <head>.',
      filePath,
      tag: "meta",
      selector: "head",
    });
  }

  // 2. Scan elements with fixed inline widths exceeding viewportWidth
  const allElements = doc.querySelectorAll("[style]");
  allElements.forEach((el, idx) => {
    const styleAttr = el.getAttribute("style") || "";
    const tag = el.tagName.toLowerCase();
    const veId = el.getAttribute("data-ve-id") || undefined;

    // Check fixed width: width: 600px;
    const widthMatch = styleAttr.match(/(?:^|;)\s*width\s*:\s*(\d+)px/i);
    if (widthMatch) {
      const pxWidth = parseInt(widthMatch[1], 10);
      if (pxWidth > viewportWidth) {
        issues.push({
          id: `${filePath}-resp-fixed-width-${idx}`,
          category: "responsive",
          severity: "error",
          title: `Elemen <${tag}> memiliki lebar tetap (${pxWidth}px) melebihi viewport (${viewportWidth}px)`,
          description: `Elemen ini memiliki inline style width: ${pxWidth}px, menyebabkan horizontal overflow / scrollbar mendatar pada layar ${deviceLabel}.`,
          suggestedCorrection: `Ganti width: ${pxWidth}px menjadi max-width: 100% atau gunakan persentase/rem agar responsif.`,
          filePath,
          elementId: veId,
          tag,
          selector: `${tag}[style*="width: ${pxWidth}px"]`,
        });
      }
    }

    // Check min-width: min-width: 500px;
    const minWidthMatch = styleAttr.match(/(?:^|;)\s*min-width\s*:\s*(\d+)px/i);
    if (minWidthMatch) {
      const minPx = parseInt(minWidthMatch[1], 10);
      if (minPx > viewportWidth) {
        issues.push({
          id: `${filePath}-resp-fixed-min-width-${idx}`,
          category: "responsive",
          severity: "error",
          title: `Elemen <${tag}> memiliki min-width (${minPx}px) melebihi viewport (${viewportWidth}px)`,
          description: `Pengaturan min-width: ${minPx}px memaksa kontainer melebar melampaui batas layar ${deviceLabel}.`,
          suggestedCorrection: `Gunakan min-width: 0 atau min-width: 100% untuk mencegah overflow horizontal pada perangkat kecil.`,
          filePath,
          elementId: veId,
          tag,
          selector: `${tag}[style*="min-width: ${minPx}px"]`,
        });
      }
    }

    // Check flex-basis: flex-basis: 500px or flex: 0 0 500px
    const flexBasisMatch = styleAttr.match(/(?:^|;)\s*(?:flex-basis\s*:\s*(\d+)px|flex\s*:\s*[0-9.]+\s+[0-9.]+\s+(\d+)px)/i);
    if (flexBasisMatch) {
      const basisPx = parseInt(flexBasisMatch[1] || flexBasisMatch[2], 10);
      if (basisPx > viewportWidth) {
        issues.push({
          id: `${filePath}-resp-flex-basis-${idx}`,
          category: "responsive",
          severity: "error",
          title: `[Heuristik Statis] Elemen <${tag}> memiliki flex-basis (${basisPx}px) melebihi viewport (${viewportWidth}px)`,
          description: `[Heuristik Statis] Nilai flex basis ${basisPx}px melebihi lebar layar ${deviceLabel}, berpotensi memicu overflow horizontal.`,
          suggestedCorrection: "Gunakan flex-basis: 100% atau persentase responsif pada breakpoint seluler.",
          filePath,
          elementId: veId,
          tag,
          selector: tag,
        });
      }
    }

    // Check nowrap on small viewports
    if (viewportWidth < 600 && /(?:^|;)\s*white-space\s*:\s*nowrap/i.test(styleAttr)) {
      const textLen = el.textContent?.trim().length || 0;
      if (textLen > 40) {
        issues.push({
          id: `${filePath}-resp-nowrap-${idx}`,
          category: "responsive",
          severity: "warning",
          title: `Teks panjang dengan white-space: nowrap pada <${tag}>`,
          description: `Teks sepanjang ${textLen} karakter dicegah berpindah baris (nowrap) pada layar mobile, berpotensi memicu teks terpotong atau overflow.`,
          suggestedCorrection: "Gunakan white-space: normal pada breakpoint mobile agar teks dapat membungkus secara fleksibel.",
          filePath,
          elementId: veId,
          tag,
          selector: tag,
        });
      }
    }
  });

  // 3. Scan Tables with fixed width attribute or style
  const tables = doc.querySelectorAll("table");
  tables.forEach((tbl, idx) => {
    const widthAttr = tbl.getAttribute("width");
    const styleAttr = tbl.getAttribute("style") || "";
    let declaredWidth = 0;
    if (widthAttr && /^\d+$/.test(widthAttr)) {
      declaredWidth = parseInt(widthAttr, 10);
    } else {
      const m = styleAttr.match(/(?:^|;)\s*width\s*:\s*(\d+)px/i);
      if (m) declaredWidth = parseInt(m[1], 10);
    }
    if (declaredWidth > viewportWidth) {
      issues.push({
        id: `${filePath}-resp-table-overflow-${idx}`,
        category: "responsive",
        severity: "error",
        title: `[Heuristik Statis] Tabel <table> memiliki lebar tetap (${declaredWidth}px) melebihi viewport (${viewportWidth}px)`,
        description: `[Heuristik Statis] Tabel berukuran ${declaredWidth}px tidak muat pada viewport ${deviceLabel}.`,
        suggestedCorrection: 'Bungkus tabel di dalam <div style="overflow-x: auto;"> atau ubah width menjadi 100%.',
        filePath,
        elementId: tbl.getAttribute("data-ve-id") || undefined,
        tag: "table",
        selector: "table",
      });
    }
  });

  // 4. Scan Images without responsive max-width
  const images = doc.querySelectorAll("img");
  images.forEach((img, idx) => {
    const widthAttr = img.getAttribute("width");
    const styleAttr = img.getAttribute("style") || "";
    const veId = img.getAttribute("data-ve-id") || undefined;

    let declaredWidth = 0;
    if (widthAttr) {
      declaredWidth = parseInt(widthAttr, 10);
    } else {
      const m = styleAttr.match(/(?:^|;)\s*width\s*:\s*(\d+)px/i);
      if (m) declaredWidth = parseInt(m[1], 10);
    }

    const hasMaxWidth = /max-width\s*:\s*(?:100%|none|unset)/i.test(styleAttr);

    if (declaredWidth > viewportWidth && !hasMaxWidth) {
      issues.push({
        id: `${filePath}-resp-oversized-img-${idx}`,
        category: "responsive",
        severity: "warning",
        title: `[Heuristik Statis] Gambar <img width="${declaredWidth}"> melebihi lebar layar ${deviceLabel}`,
        description: `[Heuristik Statis] Gambar memiliki lebar tetap ${declaredWidth}px tanpa pembatas max-width: 100%, sehingga akan meluap (overflow) pada perangkat ini.`,
        suggestedCorrection: 'Tambahkan class CSS img-fluid atau inline style "max-width: 100%; height: auto;".',
        filePath,
        elementId: veId,
        tag: "img",
        selector: `img[width="${declaredWidth}"]`,
      });
    }
  });

  // 5. Scan Embedded Media (video, canvas, iframe) with fixed pixel widths
  const mediaElements = doc.querySelectorAll("video, canvas, iframe");
  mediaElements.forEach((med, idx) => {
    const widthAttr = med.getAttribute("width");
    const styleAttr = med.getAttribute("style") || "";
    let declaredWidth = 0;
    if (widthAttr && /^\d+$/.test(widthAttr)) {
      declaredWidth = parseInt(widthAttr, 10);
    } else {
      const m = styleAttr.match(/(?:^|;)\s*width\s*:\s*(\d+)px/i);
      if (m) declaredWidth = parseInt(m[1], 10);
    }
    const hasMaxWidth = /max-width\s*:\s*(?:100%|none|unset)/i.test(styleAttr);
    if (declaredWidth > viewportWidth && !hasMaxWidth) {
      const tag = med.tagName.toLowerCase();
      issues.push({
        id: `${filePath}-resp-media-${tag}-${idx}`,
        category: "responsive",
        severity: "warning",
        title: `[Heuristik Statis] Media <${tag}> memiliki lebar tetap (${declaredWidth}px) melebihi viewport (${viewportWidth}px)`,
        description: `[Heuristik Statis] Elemen media berukuran ${declaredWidth}px tanpa batas responsif max-width: 100%.`,
        suggestedCorrection: 'Gunakan inline style "max-width: 100%; height: auto;" atau pembungkus responsif (aspect-ratio container).',
        filePath,
        elementId: med.getAttribute("data-ve-id") || undefined,
        tag,
        selector: tag,
      });
    }
  });

  // 6. Scan unconstrained <pre> or <code> blocks
  const preElements = doc.querySelectorAll("pre");
  preElements.forEach((pre, idx) => {
    const styleAttr = pre.getAttribute("style") || "";
    const hasScroll = /overflow(?:-x)?\s*:\s*(?:auto|scroll)/i.test(styleAttr);
    if (!hasScroll && viewportWidth < 768) {
      issues.push({
        id: `${filePath}-resp-pre-overflow-${idx}`,
        category: "responsive",
        severity: "info",
        title: `Blok kode <pre> tanpa kontrol overflow mendatar`,
        description: "[Heuristik Statis] Tag <pre> menampilkan teks tanpa pemotongan kata. Pada layar ponsel, ini dapat mendorong lebar halaman keluar batas jika tidak diberi overflow-x: auto.",
        suggestedCorrection: 'Tambahkan style="overflow-x: auto;" pada elemen <pre>.',
        filePath,
        elementId: pre.getAttribute("data-ve-id") || undefined,
        tag: "pre",
        selector: "pre",
      });
    }
  });

  // Passed checks
  if (issues.length === 0) {
    passedChecks.push({
      id: `${filePath}-resp-ok-${viewportWidth}`,
      category: "responsive",
      title: `Heuristik Responsif Bebas Masalah (${deviceLabel})`,
      description: `Analisis statis tidak menemukan deklarasi lebar tetap atau gambar tanpa batasan lebar pada viewport ${deviceLabel}. Catatan: Penataan responsif penuh memerlukan verifikasi layout rendering browser nyata.`,
    });
  }

  return { issues, passedChecks };
}

/**
 * Script injected into iframe or bridge to detect live layout overflow dynamically.
 */
export function getLiveResponsiveOverflowScript(viewportWidth: number): string {
  return `
    (function() {
      const results = [];
      const vw = window.innerWidth || document.documentElement.clientWidth;
      const docWidth = document.documentElement.scrollWidth;

      if (docWidth > vw + 2) {
        results.push({
          type: "page-horizontal-overflow",
          scrollWidth: docWidth,
          clientWidth: vw,
          overflowPx: docWidth - vw
        });
      }

      document.body.querySelectorAll('*').forEach((el) => {
        if (el.id && el.id.startsWith('__ve_')) return;
        const rect = el.getBoundingClientRect();
        if (rect.right > vw + 3) {
          results.push({
            id: el.getAttribute('data-ve-id') || '',
            tag: el.tagName.toLowerCase(),
            right: rect.right,
            viewportWidth: vw,
            overflowPx: rect.right - vw
          });
        }
      });

      return results;
    })();
  `;
}
