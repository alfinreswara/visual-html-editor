import type { AuditIssue, PassedCheck } from "./types";
import { parseHtmlDocument } from "./parser";

const GENERIC_ANCHOR_TEXTS = new Set([
  "klik di sini",
  "click here",
  "di sini",
  "here",
  "baca",
  "baca selengkapnya",
  "read more",
  "learn more",
  "pelajari lebih lanjut",
  "more",
  "link",
  "tautan",
  "unduh",
  "download",
  "lihat",
  "view",
]);

/**
 * Analyzes SEO readiness, metadata, Open Graph tags, heading structure, and anchor text quality.
 * Analyzes pages independently without fabricated numerical scores.
 */
export function analyzeSeo(
  html: string,
  filePath: string = "index.html",
): { issues: AuditIssue[]; passedChecks: PassedCheck[] } {
  const issues: AuditIssue[] = [];
  const passedChecks: PassedCheck[] = [];

  if (typeof DOMParser === "undefined" || !html) {
    return { issues, passedChecks };
  }

  const doc = parseHtmlDocument(html);

  // 1. Page Title
  const titleEl = doc.querySelector("title");
  const title = titleEl?.textContent?.trim() || "";

  if (!title) {
    issues.push({
      id: `${filePath}-seo-missing-title`,
      category: "seo",
      severity: "error",
      title: "Judul halaman (title) tidak ditemukan",
      description: "Tag <title> merupakan faktor peringkat SEO terpenting untuk menentukan relevansi kata kunci halaman.",
      suggestedCorrection: "Tambahkan tag <title> di dalam <head> dengan panjang antara 30 hingga 60 karakter.",
      filePath,
      tag: "title",
      selector: "head > title",
    });
  } else if (title.length < 20) {
    issues.push({
      id: `${filePath}-seo-short-title`,
      category: "seo",
      severity: "warning",
      title: `Judul halaman terlalu pendek (${title.length} karakter)`,
      description: `Judul "${title}" terlalu singkat. Mesin pencari merekomendasikan judul antara 30-60 karakter agar informatif dan mencakup kata kunci utama.`,
      suggestedCorrection: "Perpanjang judul halaman dengan menyertakan nama produk, layanan, atau nama brand.",
      filePath,
      tag: "title",
      selector: "head > title",
    });
  } else if (title.length > 60) {
    issues.push({
      id: `${filePath}-seo-long-title`,
      category: "seo",
      severity: "warning",
      title: `Judul halaman berpotensi terpotong (${title.length} karakter)`,
      description: `Judul "${title.slice(0, 50)}..." melebihi 60 karakter dan kemungkinan akan terpotong (elipsis) di hasil pencarian Google.`,
      suggestedCorrection: "Persingkat judul menjadi maksimal 60 karakter dengan meletakkan kata kunci terpenting di depan.",
      filePath,
      tag: "title",
      selector: "head > title",
    });
  } else {
    passedChecks.push({
      id: `${filePath}-seo-title-optimal`,
      category: "seo",
      title: "Panjang Judul Halaman Optimal",
      description: `Tag <title> memiliki panjang ideal (${title.length} karakter): "${title}".`,
    });
  }

  // 2. Meta Description
  const metaDescEl = doc.querySelector('meta[name="description" i]');
  const metaDesc = metaDescEl?.getAttribute("content")?.trim() || "";

  if (!metaDesc) {
    issues.push({
      id: `${filePath}-seo-missing-meta-description`,
      category: "seo",
      severity: "warning",
      title: "Meta Description tidak ditemukan",
      description: "Deskripsi meta memberikan ringkasan konten halaman yang ditampilkan di bawah judul pada snippet hasil pencarian Google.",
      suggestedCorrection: 'Tambahkan tag <meta name="description" content="Ringkasan informatif 120-160 karakter..."> pada bagian <head>.',
      filePath,
      tag: "meta",
      selector: "head",
    });
  } else if (metaDesc.length < 50) {
    issues.push({
      id: `${filePath}-seo-short-meta-description`,
      category: "seo",
      severity: "warning",
      title: `Meta description terlalu singkat (${metaDesc.length} karakter)`,
      description: "Meta description yang terlalu singkat kurang menarik klik pengguna pada hasil pencarian (CTR lebih rendah).",
      suggestedCorrection: "Perjelas deskripsi hingga panjangnya antara 120-160 karakter untuk merangkum manfaat halaman secara lengkap.",
      filePath,
      tag: "meta",
      selector: 'meta[name="description"]',
    });
  } else if (metaDesc.length > 160) {
    issues.push({
      id: `${filePath}-seo-long-meta-description`,
      category: "seo",
      severity: "warning",
      title: `Meta description melebihi 160 karakter (${metaDesc.length} karakter)`,
      description: "Teks deskripsi meta yang melebihi 160 karakter akan dipotong oleh Google di halaman hasil pencarian desktop & mobile.",
      suggestedCorrection: "Persingkat meta description agar tetap berada di bawah 160 karakter.",
      filePath,
      tag: "meta",
      selector: 'meta[name="description"]',
    });
  } else {
    passedChecks.push({
      id: `${filePath}-seo-desc-optimal`,
      category: "seo",
      title: "Meta Description Optimal",
      description: `Meta description memiliki panjang yang baik (${metaDesc.length} karakter).`,
    });
  }

  // 3. Viewport Meta
  const viewportMeta = doc.querySelector('meta[name="viewport" i]');
  if (!viewportMeta) {
    issues.push({
      id: `${filePath}-seo-missing-viewport`,
      category: "seo",
      severity: "error",
      title: "Meta Viewport untuk Responsif Mobile tidak ditemukan",
      description: "Google mengutamakan situs ramah seluler (mobile-first indexing). Tanpa meta viewport, browser seluler akan merender halaman dalam skala desktop.",
      suggestedCorrection: 'Tambahkan <meta name="viewport" content="width=device-width, initial-scale=1.0"> pada tag <head>.',
      filePath,
      tag: "meta",
      selector: "head",
    });
  } else {
    passedChecks.push({
      id: `${filePath}-seo-viewport-passed`,
      category: "seo",
      title: "Meta Viewport Responsif Dikonfigurasi",
      description: "Halaman memiliki konfigurasi viewport seluler yang memadai.",
    });
  }

  // 4. Canonical URL
  const canonicalEl = doc.querySelector('link[rel="canonical" i]');
  const canonicalHref = canonicalEl?.getAttribute("href")?.trim();
  if (!canonicalHref) {
    issues.push({
      id: `${filePath}-seo-missing-canonical`,
      category: "seo",
      severity: "info",
      title: "Tag Canonical URL belum didefinisikan",
      description: "Tag rel='canonical' mencegah masalah konten duplikat jika halaman dapat diakses dari beberapa URL berbeda (contoh: dengan atau tanpa www, trailing slash).",
      suggestedCorrection: 'Tambahkan <link rel="canonical" href="https://domain-anda.com/path"> di tag <head>.',
      filePath,
      tag: "link",
      selector: "head",
    });
  } else {
    passedChecks.push({
      id: `${filePath}-seo-canonical-passed`,
      category: "seo",
      title: "Canonical URL Didefinisikan",
      description: `Tag canonical terkonfigurasi ke: "${canonicalHref}".`,
    });
  }

  // 5. Robots Meta
  const robotsMeta = doc.querySelector('meta[name="robots" i]');
  const robotsContent = robotsMeta?.getAttribute("content")?.toLowerCase() || "";
  if (robotsContent.includes("noindex")) {
    issues.push({
      id: `${filePath}-seo-robots-noindex`,
      category: "seo",
      severity: "warning",
      title: "Halaman memiliki petunjuk 'noindex' pada meta robots",
      description: `Tag meta robots berisi "${robotsContent}", yang meminta mesin pencari agar TIDAK mengindeks halaman ini. Pastikan ini disengaja.`,
      suggestedCorrection: "Hapus petunjuk 'noindex' jika halaman ini ditujukan untuk publik dan ingin ditemukan di Google.",
      filePath,
      tag: "meta",
      selector: 'meta[name="robots"]',
    });
  }

  // 6. Open Graph Metadata
  const ogTitle = doc.querySelector('meta[property="og:title" i]')?.getAttribute("content");
  const ogDesc = doc.querySelector('meta[property="og:description" i]')?.getAttribute("content");
  const ogImage = doc.querySelector('meta[property="og:image" i]')?.getAttribute("content");

  const missingOgTags: string[] = [];
  if (!ogTitle) missingOgTags.push("og:title");
  if (!ogDesc) missingOgTags.push("og:description");
  if (!ogImage) missingOgTags.push("og:image");

  if (missingOgTags.length > 0) {
    issues.push({
      id: `${filePath}-seo-missing-og-tags`,
      category: "seo",
      severity: "info",
      title: `Tag Open Graph belum lengkap: ${missingOgTags.join(", ")}`,
      description: "Tag Open Graph (Facebook, WhatsApp, LinkedIn, X/Twitter) menentukan gambar cuplikan, judul, dan deskripsi saat link dibagikan di media sosial.",
      suggestedCorrection: `Lengkapi tag <meta property="og:title">, <meta property="og:description">, dan <meta property="og:image"> pada <head>.`,
      filePath,
      tag: "meta",
      selector: "head",
    });
  } else {
    passedChecks.push({
      id: `${filePath}-seo-og-passed`,
      category: "seo",
      title: "Metadata Media Sosial (Open Graph) Lengkap",
      description: "og:title, og:description, dan og:image telah terdefinisi untuk pratinjau media sosial.",
    });
  }

  // 7. Heading Hierarchy for SEO
  const h1Elements = doc.querySelectorAll("h1");
  if (h1Elements.length === 0) {
    issues.push({
      id: `${filePath}-seo-no-h1`,
      category: "seo",
      severity: "warning",
      title: "Heading utama <h1> tidak ditemukan",
      description: "Mesin pencari menggunakan tag <h1> untuk memahami topik utama halaman.",
      suggestedCorrection: "Sediakan tepat satu <h1> yang memuat kata kunci utama halaman.",
      filePath,
      tag: "h1",
      selector: "body",
    });
  } else if (h1Elements.length > 1) {
    issues.push({
      id: `${filePath}-seo-multiple-h1`,
      category: "seo",
      severity: "info",
      title: `Terdapat ${h1Elements.length} tag <h1>`,
      description: "Memiliki lebih dari satu <h1> dapat melemahkan fokus kata kunci halaman.",
      suggestedCorrection: "Gunakan satu <h1> utama dan turunkan sisanya menjadi <h2>.",
      filePath,
      elementId: h1Elements[1].getAttribute("data-ve-id") || undefined,
      tag: "h1",
      selector: "h1",
    });
  }

  // 8. Image Alt Attributes for SEO
  const images = doc.querySelectorAll("img");
  let missingAltImages = 0;
  images.forEach((img, idx) => {
    const alt = img.getAttribute("alt");
    if (alt === null || alt.trim() === "") {
      missingAltImages++;
      issues.push({
        id: `${filePath}-seo-img-missing-alt-${idx}`,
        category: "seo",
        severity: "warning",
        title: "Gambar tanpa teks alt untuk pencarian gambar",
        description: `Gambar (src="${(img.getAttribute("src") || "").slice(0, 35)}") tidak memiliki teks alt, sehingga tidak dapat diindeks di Google Images.`,
        suggestedCorrection: 'Tambahkan atribut alt="Deskripsi gambar informatif" pada tag <img>.',
        filePath,
        elementId: img.getAttribute("data-ve-id") || undefined,
        tag: "img",
        selector: "img",
      });
    }
  });

  if (images.length > 0 && missingAltImages === 0) {
    passedChecks.push({
      id: `${filePath}-seo-all-images-alt-passed`,
      category: "seo",
      title: "Semua Gambar Memiliki Teks Alternatif",
      description: `${images.length} gambar memiliki atribut alt yang terisi dengan baik.`,
    });
  }

  // 9. Descriptive Anchor Text Quality
  const links = doc.querySelectorAll("a");
  let genericAnchorCount = 0;
  links.forEach((a, idx) => {
    const text = a.textContent?.trim().toLowerCase() || "";
    if (GENERIC_ANCHOR_TEXTS.has(text)) {
      genericAnchorCount++;
      issues.push({
        id: `${filePath}-seo-generic-anchor-${idx}`,
        category: "seo",
        severity: "info",
        title: `Teks tautan kurang deskriptif: "${a.textContent?.trim()}"`,
        description: `Teks tautan generik seperti "${a.textContent?.trim()}" tidak memberi konteks kepada mesin pencari tentang halaman tujuan.`,
        suggestedCorrection: `Ganti teks tautan dengan frasa yang mendeskripsikan topik halaman tujuan (contoh: "Pelajari Fitur Keamanan Cloud" alih-alih "Klik di sini").`,
        filePath,
        elementId: a.getAttribute("data-ve-id") || undefined,
        tag: "a",
        selector: "a",
      });
    }
  });

  if (links.length > 0 && genericAnchorCount === 0) {
    passedChecks.push({
      id: `${filePath}-seo-anchor-text-passed`,
      category: "seo",
      title: "Teks Tautan Informatif & Deskriptif",
      description: "Tautan tidak menggunakan kata-kata generik seperti 'klik di sini'.",
    });
  }

  return { issues, passedChecks };
}
