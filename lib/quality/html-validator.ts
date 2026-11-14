import type { AuditIssue, PassedCheck } from "./types";
import { parseHtmlDocument } from "./parser";

const BLOCK_TAGS = new Set([
  "div",
  "p",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "ul",
  "ol",
  "li",
  "section",
  "article",
  "aside",
  "nav",
  "header",
  "footer",
  "main",
  "table",
  "form",
  "blockquote",
  "pre",
]);

/**
 * Validates HTML structure, syntax, attributes, IDs, nesting, and semantic hierarchy.
 * Does NOT modify user HTML.
 */
export function validateHtml(
  html: string,
  filePath: string = "index.html",
): { issues: AuditIssue[]; passedChecks: PassedCheck[] } {
  const issues: AuditIssue[] = [];
  const passedChecks: PassedCheck[] = [];

  if (typeof DOMParser === "undefined" || !html) {
    return { issues, passedChecks };
  }

  const doc = parseHtmlDocument(html);

  // 1. DOCTYPE and Basic Structure
  const trimmed = html.trim().toLowerCase();
  if (!trimmed.startsWith("<!doctype html>")) {
    issues.push({
      id: `${filePath}-missing-doctype`,
      category: "html",
      severity: "warning",
      title: "Deklarasi DOCTYPE tidak ditemukan",
      description: "Dokumen HTML sebaiknya diawali dengan deklarasi <!DOCTYPE html> untuk memastikan browser merender dalam mode standar.",
      suggestedCorrection: "Tambahkan <!DOCTYPE html> pada baris paling awal dokumen HTML Anda.",
      filePath,
      tag: "html",
      selector: "html",
    });
  } else {
    passedChecks.push({
      id: `${filePath}-doctype-passed`,
      category: "html",
      title: "Deklarasi DOCTYPE Valid",
      description: "Dokumen memiliki deklarasi <!DOCTYPE html> yang sesuai standar HTML5.",
    });
  }

  // 2. Document Title
  const titleEl = doc.querySelector("title");
  const titleText = titleEl?.textContent?.trim() || "";
  if (!titleEl || titleText.length === 0) {
    issues.push({
      id: `${filePath}-missing-title`,
      category: "html",
      severity: "error",
      title: "Judul dokumen (<title>) tidak ditemukan",
      description: "Elemen <title> di dalam <head> wajib ada untuk mendefinisikan nama halaman pada tab browser dan hasil pencarian.",
      suggestedCorrection: "Tambahkan elemen <title>Judul Halaman Anda</title> di dalam tag <head>.",
      filePath,
      tag: "title",
      selector: "head > title",
    });
  } else {
    passedChecks.push({
      id: `${filePath}-title-passed`,
      category: "html",
      title: "Judul Dokumen Ditemukan",
      description: `Tag <title> tersedia dengan isi "${titleText.slice(0, 40)}${titleText.length > 40 ? "..." : ""}".`,
    });
  }

  // 3. Document Language (lang attribute)
  const htmlEl = doc.documentElement;
  const lang = htmlEl?.getAttribute("lang")?.trim();
  if (!lang) {
    issues.push({
      id: `${filePath}-missing-lang`,
      category: "html",
      severity: "warning",
      title: "Atribut bahasa (lang) tidak ditemukan pada <html>",
      description: "Atribut lang membantu pembaca layar (screen reader) menentukan pelafalan fonetik dan membantu mesin pencari mengenali bahasa utama halaman.",
      suggestedCorrection: 'Tambahkan atribut lang="id" (untuk Bahasa Indonesia) atau lang="en" pada tag <html>.',
      filePath,
      tag: "html",
      selector: "html",
    });
  } else {
    passedChecks.push({
      id: `${filePath}-lang-passed`,
      category: "html",
      title: "Atribut Bahasa Didefinisikan",
      description: `Tag <html> memiliki atribut lang="${lang}".`,
    });
  }

  // 4. Duplicate ID Detection
  const idCounts = new Map<string, Element[]>();
  const allElements = doc.querySelectorAll("[id]");
  allElements.forEach((el) => {
    const rawId = el.getAttribute("id")?.trim();
    if (!rawId) return;
    const list = idCounts.get(rawId) || [];
    list.push(el);
    idCounts.set(rawId, list);
  });

  let duplicateCount = 0;
  idCounts.forEach((elements, id) => {
    if (elements.length > 1) {
      duplicateCount++;
      elements.slice(1).forEach((el, idx) => {
        const veId = el.getAttribute("data-ve-id") || undefined;
        issues.push({
          id: `${filePath}-duplicate-id-${id}-${idx}`,
          category: "html",
          severity: "error",
          title: `ID HTML duplikat terdeteksi: #${id}`,
          description: `Nilai ID "${id}" digunakan oleh ${elements.length} elemen berbeda. Standar W3C mengharuskan setiap ID unik dalam satu dokumen.`,
          suggestedCorrection: `Ganti ID elemen ini menjadi ID unik, misalnya "${id}-${idx + 1}", atau gunakan class sebagai gantinya.`,
          filePath,
          elementId: veId,
          tag: el.tagName.toLowerCase(),
          selector: `#${id}`,
        });
      });
    }
  });

  if (duplicateCount === 0) {
    passedChecks.push({
      id: `${filePath}-ids-unique-passed`,
      category: "html",
      title: "Semua ID Unik",
      description: "Tidak ditemukan ID duplikat pada seluruh elemen halaman.",
    });
  }

  // 5. Invalid Nesting Checks
  // A. Block inside <p>
  // Note: HTML parsers automatically close <p> when encountering a block element,
  // transforming <p><div>...</div></p> into <p></p><div>...</div> in the DOM tree.
  // We check both the parsed DOM and the source HTML to detect invalid nesting.
  let invalidPNesting = 0;
  const pElements = doc.querySelectorAll("p");
  pElements.forEach((p) => {
    const pVeId = p.getAttribute("data-ve-id") || undefined;
    Array.from(p.children).forEach((child) => {
      const childTag = child.tagName.toLowerCase();
      if (BLOCK_TAGS.has(childTag)) {
        invalidPNesting++;
        issues.push({
          id: `${filePath}-invalid-p-nesting-${pVeId || invalidPNesting}`,
          category: "html",
          severity: "error",
          title: `Elemen blok <${childTag}> di dalam paragraf <p>`,
          description: `Elemen <p> hanya boleh memuat konten inline. Menyisipkan <${childTag}> di dalam <p> akan diurai secara tidak valid oleh browser.`,
          suggestedCorrection: `Ubah pembungkus <p> menjadi <div> atau pindahkan <${childTag}> ke luar paragraf.`,
          filePath,
          elementId: child.getAttribute("data-ve-id") || pVeId,
          tag: childTag,
          selector: `p > ${childTag}`,
        });
      }
    });
  });

  // Source-level check for block elements nested within <p> before </p>
  if (invalidPNesting === 0) {
    const blockTagsList = Array.from(BLOCK_TAGS).filter((t) => t !== "p").join("|");
    const pBlockRegex = new RegExp(`<p\\b([^>]*)>((?:(?!<\\/p>)[\\s\\S])*?)<(${blockTagsList})\\b([^>]*)>`, "gi");
    let match: RegExpExecArray | null;
    while ((match = pBlockRegex.exec(html)) !== null) {
      invalidPNesting++;
      const childTag = match[3].toLowerCase();
      const childAttrs = match[4] || "";
      const pAttrs = match[1] || "";
      const idMatch = childAttrs.match(/\bid=["']([^"']+)["']/i) || pAttrs.match(/\bid=["']([^"']+)["']/i);
      const veIdMatch = childAttrs.match(/\bdata-ve-id=["']([^"']+)["']/i) || pAttrs.match(/\bdata-ve-id=["']([^"']+)["']/i);
      issues.push({
        id: `${filePath}-invalid-p-nesting-raw-${invalidPNesting}`,
        category: "html",
        severity: "error",
        title: `Elemen blok <${childTag}> di dalam paragraf <p>`,
        description: `Elemen <p> hanya boleh memuat konten inline. Menyisipkan <${childTag}> di dalam <p> akan diurai secara tidak valid oleh browser.`,
        suggestedCorrection: `Ubah pembungkus <p> menjadi <div> atau pindahkan <${childTag}> ke luar paragraf.`,
        filePath,
        elementId: veIdMatch ? veIdMatch[1] : undefined,
        tag: childTag,
        selector: `p > ${childTag}${idMatch ? `#${idMatch[1]}` : ""}`,
      });
    }
  }

  // B. Interactive inside Interactive (<a> inside <button>, <button> inside <a>, <a> inside <a>)
  const interactiveLinks = doc.querySelectorAll("a a, a button, button a, button button");
  interactiveLinks.forEach((el, index) => {
    const parentTag = el.parentElement?.tagName.toLowerCase() || "parent";
    const tag = el.tagName.toLowerCase();
    const veId = el.getAttribute("data-ve-id") || undefined;
    issues.push({
      id: `${filePath}-interactive-nesting-${index}`,
      category: "html",
      severity: "error",
      title: `Elemen interaktif <${tag}> di dalam <${parentTag}>`,
      description: `Menyisipkan elemen interaktif di dalam elemen interaktif lain melanggar spesifikasi HTML5 dan menyebabkan konflik klik serta navigasi.`,
      suggestedCorrection: `Pisahkan <${tag}> dan <${parentTag}> agar menjadi elemen yang berdampingan (siblings).`,
      filePath,
      elementId: veId,
      tag,
      selector: `${parentTag} > ${tag}`,
    });
  });

  if (invalidPNesting === 0 && interactiveLinks.length === 0) {
    passedChecks.push({
      id: `${filePath}-nesting-valid-passed`,
      category: "html",
      title: "Penumpukan Elemen (Nesting) Valid",
      description: "Tidak ditemukan penumpukan elemen blok di dalam paragraf atau elemen interaktif ganda.",
    });
  }

  // 6. Required Attributes
  // <img> must have src
  const images = doc.querySelectorAll("img");
  let missingSrcCount = 0;
  images.forEach((img, idx) => {
    const src = img.getAttribute("src");
    if (!src || src.trim() === "") {
      missingSrcCount++;
      issues.push({
        id: `${filePath}-img-missing-src-${idx}`,
        category: "html",
        severity: "error",
        title: "Elemen <img> tidak memiliki atribut src",
        description: "Gambar harus memiliki atribut src yang mengarah ke file gambar atau URL yang valid.",
        suggestedCorrection: 'Tambahkan atribut src="path/ke/gambar.jpg" pada tag <img>.',
        filePath,
        elementId: img.getAttribute("data-ve-id") || undefined,
        tag: "img",
        selector: "img",
      });
    }
  });

  // <input> must have type or name/id
  const inputs = doc.querySelectorAll("input");
  inputs.forEach((input, idx) => {
    const type = input.getAttribute("type");
    const name = input.getAttribute("name");
    const id = input.getAttribute("id");
    if (!type && !name && !id) {
      issues.push({
        id: `${filePath}-input-missing-attrs-${idx}`,
        category: "html",
        severity: "warning",
        title: "Elemen <input> tanpa type atau identifier",
        description: "Elemen input form sebaiknya memiliki atribut type (contoh: text, email), serta name atau id agar dapat diidentifikasi.",
        suggestedCorrection: 'Tambahkan atribut type="text" dan name="input_name" pada elemen input ini.',
        filePath,
        elementId: input.getAttribute("data-ve-id") || undefined,
        tag: "input",
        selector: "input",
      });
    }
  });

  // 7. Internal Fragment References (href="#section-id")
  const anchorLinks = doc.querySelectorAll('a[href^="#"]');
  let invalidInternalRef = 0;
  anchorLinks.forEach((a, idx) => {
    const href = a.getAttribute("href")?.trim() || "";
    if (href === "#" || href === "") return; // handled by empty link check
    const targetId = href.slice(1);
    // In HTML, characters like ':' or '.' in IDs need escaping if queried by selector, or use getElementById
    const targetEl = doc.getElementById(targetId);
    if (!targetEl) {
      invalidInternalRef++;
      issues.push({
        id: `${filePath}-invalid-internal-ref-${idx}`,
        category: "links",
        severity: "warning",
        title: `Target tautan internal tidak ditemukan: ${href}`,
        description: `Tautan mengarah ke "#${targetId}", namun tidak ada elemen di halaman ini yang memiliki id="${targetId}".`,
        suggestedCorrection: `Tambahkan id="${targetId}" pada section tujuan, atau perbaiki href tautan ini.`,
        filePath,
        elementId: a.getAttribute("data-ve-id") || undefined,
        tag: "a",
        selector: `a[href="${href}"]`,
      });
    }
  });

  // 8. Empty Links & Empty Buttons
  const allLinks = doc.querySelectorAll("a");
  let emptyLinksCount = 0;
  allLinks.forEach((a, idx) => {
    const href = a.getAttribute("href");
    const text = a.textContent?.trim() || "";
    const hasImageWithAlt = Boolean(
      a.querySelector("img[alt]")?.getAttribute("alt")?.trim(),
    );
    const ariaLabel = a.getAttribute("aria-label")?.trim();
    const hasAria = Boolean(ariaLabel || a.getAttribute("aria-labelledby"));

    // Check if link has no destination
    if (!href || href.trim() === "" || href.trim() === "#") {
      emptyLinksCount++;
      issues.push({
        id: `${filePath}-empty-href-${idx}`,
        category: "links",
        severity: "warning",
        title: "Tautan tanpa URL tujuan (href kosong atau '#')",
        description: `Tautan "${text.slice(0, 25) || "tanpa label"}" tidak memiliki alamat URL tujuan yang jelas.`,
        suggestedCorrection: 'Isi atribut href dengan alamat halaman (contoh: "about.html" atau "https://...").',
        filePath,
        elementId: a.getAttribute("data-ve-id") || undefined,
        tag: "a",
        selector: "a",
      });
    }

    // Check if link has no accessible content
    if (!text && !hasImageWithAlt && !hasAria) {
      issues.push({
        id: `${filePath}-empty-link-content-${idx}`,
        category: "html",
        severity: "error",
        title: "Elemen tautan <a> kosong",
        description: "Tautan tidak memiliki teks, gambar ber-alt, maupun atribut aria-label. Pengguna dan pembaca layar tidak mengetahui tujuan tautan ini.",
        suggestedCorrection: 'Tambahkan teks deskriptif di dalam tautan atau beri atribut aria-label="Deskripsi Tujuan".',
        filePath,
        elementId: a.getAttribute("data-ve-id") || undefined,
        tag: "a",
        selector: "a",
      });
    }
  });

  const buttons = doc.querySelectorAll("button");
  buttons.forEach((btn, idx) => {
    const text = btn.textContent?.trim() || "";
    const ariaLabel = btn.getAttribute("aria-label")?.trim();
    const hasAria = Boolean(ariaLabel || btn.getAttribute("aria-labelledby") || btn.getAttribute("title"));
    const hasImageWithAlt = Boolean(
      btn.querySelector("img[alt]")?.getAttribute("alt")?.trim() ||
      btn.querySelector("svg[aria-label]") ||
      btn.querySelector("svg title")
    );

    if (!text && !hasAria && !hasImageWithAlt) {
      issues.push({
        id: `${filePath}-empty-button-${idx}`,
        category: "html",
        severity: "error",
        title: "Tombol <button> kosong tanpa label",
        description: "Tombol tidak memiliki teks isi, ikon dengan teks alternatif, atau aria-label. Pembaca layar tidak dapat membacakan fungsi tombol ini.",
        suggestedCorrection: 'Beri teks pada tombol atau tambahkan atribut aria-label="Nama Aksi".',
        filePath,
        elementId: btn.getAttribute("data-ve-id") || undefined,
        tag: "button",
        selector: "button",
      });
    }
  });

  // 9. Heading Hierarchy
  const headings = Array.from(doc.querySelectorAll("h1, h2, h3, h4, h5, h6"));
  const h1Elements = doc.querySelectorAll("h1");

  if (h1Elements.length === 0) {
    issues.push({
      id: `${filePath}-no-h1`,
      category: "html",
      severity: "warning",
      title: "Halaman tidak memiliki heading utama <h1>",
      description: "Setiap halaman website sebaiknya memiliki satu tag <h1> sebagai judul topik utama konten.",
      suggestedCorrection: "Tambahkan satu elemen <h1> pada bagian hero atau judul utama halaman Anda.",
      filePath,
      tag: "h1",
      selector: "body",
    });
  } else if (h1Elements.length > 1) {
    issues.push({
      id: `${filePath}-multiple-h1`,
      category: "html",
      severity: "info",
      title: `Terdeteksi ${h1Elements.length} tag <h1> dalam satu halaman`,
      description: "Meskipun valid di HTML5, praktik terbaik SEO dan aksesibilitas menganjurkan satu <h1> per halaman untuk kejelasan struktur dokumen.",
      suggestedCorrection: "Pertimbangkan untuk menggunakan satu <h1> untuk judul utama, dan gunakan <h2> untuk sub-bagian penting.",
      filePath,
      elementId: h1Elements[1].getAttribute("data-ve-id") || undefined,
      tag: "h1",
      selector: "h1",
    });
  }

  // Check heading skips (e.g. h1 -> h3)
  let lastLevel = 0;
  let skippedHeadings = 0;
  headings.forEach((h) => {
    const level = parseInt(h.tagName.substring(1), 10);
    if (lastLevel > 0 && level > lastLevel + 1) {
      skippedHeadings++;
      issues.push({
        id: `${filePath}-skipped-heading-${h.getAttribute("data-ve-id") || Math.random()}`,
        category: "html",
        severity: "warning",
        title: `Tingkat heading melompat dari <h${lastLevel}> ke <h${level}>`,
        description: `Struktur heading sebaiknya berurutan secara hierarkis tanpa melompati tingkatan (misal: setelah <h2> adalah <h3>, bukan langsung <h4>).`,
        suggestedCorrection: `Ganti tag <h${level}> ini menjadi <h${lastLevel + 1}> atau sesuaikan urutan heading sebelumnya.`,
        filePath,
        elementId: h.getAttribute("data-ve-id") || undefined,
        tag: h.tagName.toLowerCase(),
        selector: h.tagName.toLowerCase(),
      });
    }
    lastLevel = level;
  });

  if (h1Elements.length === 1 && skippedHeadings === 0) {
    passedChecks.push({
      id: `${filePath}-heading-hierarchy-passed`,
      category: "html",
      title: "Hierarki Heading Logis & Berurutan",
      description: "Halaman memiliki satu <h1> dan urutan heading berikutnya tertata secara hierarkis tanpa melompati level.",
    });
  }

  return { issues, passedChecks };
}
