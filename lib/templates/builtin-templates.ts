import type { WebsiteTemplate } from "./types";
import { makeTextFile } from "@/lib/project-files";

export const BUILTIN_TEMPLATES: WebsiteTemplate[] = [
  // 1. MODERN SAAS
  {
    id: "saas-cloudscale",
    entry: "index.html",
    name: "CloudScale — Modern SaaS Platform",
    category: "SaaS",
    description: "Platform analitik cloud dan otomatisasi infrastruktur modern dengan dashboard live preview, perbandingan fitur, tabel harga multi-tier, dan FAQ interaktif.",
    featured: true,
    author: "Kanvas Official",
    createdAt: 1715000000000,
    updatedAt: 1715000000000,
    tags: ["SaaS", "Dashboard", "Pricing", "Cloud", "Responsive"],
    thumbnailGradient: {
      from: "#1e3a8a",
      to: "#0f172a",
      accent: "#38bdf8",
    },
    globalTheme: {
      presetId: "modern-saas",
      primaryColor: "#2563eb",
      secondaryColor: "#64748b",
      accentColor: "#38bdf8",
      backgroundColor: "#ffffff",
      surfaceColor: "#f8fafc",
      textColor: "#0f172a",
      mutedTextColor: "#64748b",
      borderColor: "#e2e8f0",
      headingFont: "Plus Jakarta Sans",
      bodyFont: "Inter",
      fontSizeBase: "16px",
      radiusPreset: "md",
      shadowPreset: "medium",
    },
    pages: [
      { path: "index.html", title: "Beranda CloudScale", isEntry: true },
      { path: "pricing.html", title: "Paket & Harga Langganan" },
    ],
    sections: [
      "Navigasi Utama",
      "Hero & Live Metrics",
      "Logo Mitra Mitra",
      "Pilar Fitur Utama",
      "Tabel Harga Multi-Tier",
      "Tanya Jawab (FAQ)",
      "Banner Call-to-Action",
      "Footer Komprehensif",
    ],
    files: {
      "index.html": makeTextFile(
        `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>CloudScale — Skalakan Aplikasi Tanpa Batas</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="">
  <link rel="stylesheet" data-kanvas-fonts="" href="https://fonts.googleapis.com/css2?family=Plus%20Jakarta%20Sans:wght@400;500;600;700;800&family=Inter:wght@400;500;600&display=swap">
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <!-- Header / Nav -->
  <header class="header">
    <div class="container nav-container">
      <a href="index.html" class="logo">
        <span class="logo-icon">⚡</span>
        <span class="logo-text">CloudScale</span>
      </a>
      <nav class="nav-links">
        <a href="#fitur">Fitur</a>
        <a href="pricing.html">Harga</a>
        <a href="#faq">FAQ</a>
        <a href="pricing.html" class="btn btn-outline btn-sm">Masuk</a>
        <a href="pricing.html" class="btn btn-primary btn-sm">Mulai Gratis</a>
      </nav>
    </div>
  </header>

  <main>
    <!-- Hero Section -->
    <section class="hero-section">
      <div class="container">
        <div class="badge-pill">✨ Versi 3.0 Kini Mendukung Multi-Region Cloud</div>
        <h1 class="hero-title">Skalakan Aplikasi Cloud Anda Tanpa Hambatan Performa</h1>
        <p class="hero-subtitle">Platform observabilitas dan deployment real-time otomatis untuk tim rekayasa perangkat lunak modern. Hemat waktu, pantau metrik server, dan kurangi latency hingga 60%.</p>
        <div class="hero-actions">
          <a href="pricing.html" class="btn btn-primary">Uji Coba Gratis 14 Hari</a>
          <a href="#fitur" class="btn btn-secondary">Pelajari Arsitektur</a>
        </div>

        <!-- Dashboard Mockup -->
        <div class="dashboard-preview">
          <div class="preview-header">
            <div class="preview-dots"><span></span><span></span><span></span></div>
            <div class="preview-url">app.cloudscale.io/cluster/apac-jakarta</div>
            <div class="preview-status">99.99% Uptime</div>
          </div>
          <div class="preview-body">
            <div class="metric-card">
              <span class="metric-label">Request / Detik</span>
              <span class="metric-val">42,850</span>
              <span class="metric-trend text-emerald">+12.4% vs kemarin</span>
            </div>
            <div class="metric-card">
              <span class="metric-label">Latency Rata-Rata</span>
              <span class="metric-val">18.2 ms</span>
              <span class="metric-trend text-emerald">-35% optimal</span>
            </div>
            <div class="metric-card">
              <span class="metric-label">Active Pods</span>
              <span class="metric-val">128</span>
              <span class="metric-trend text-blue">Auto-scaling on</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Social Proof Logos -->
    <section class="logos-section">
      <div class="container">
        <p class="logos-caption">Dipercaya oleh ribuan arsitek cloud di Asia Pasifik</p>
        <div class="logos-grid">
          <span class="logo-item">GoScale Inc</span>
          <span class="logo-item">NusantaraPay</span>
          <span class="logo-item">AeroData Labs</span>
          <span class="logo-item">Kinetik Cloud</span>
          <span class="logo-item">Logika AI</span>
        </div>
      </div>
    </section>

    <!-- Feature Pillars -->
    <section class="features-section" id="fitur">
      <div class="container">
        <div class="section-header">
          <span class="badge">Keunggulan Inti</span>
          <h2>Dirancang untuk Beban Kerja Berkinerja Ekstrem</h2>
          <p>Semua yang Anda butuhkan untuk memantau, mendiagnosis, dan menaikkan skala infrastruktur.</p>
        </div>
        <div class="features-grid">
          <div class="feature-card">
            <div class="feature-icon">🚀</div>
            <h3>Penyebaran Global Nol Downtime</h3>
            <p>Rollout versi aplikasi baru dengan strategi blue-green dan canary deployment secara terotomasi hanya dengan satu perintah git push.</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">🔍</div>
            <h3>Tracing & Log Terdistribusi</h3>
            <p>Temukan bottleneck kueri database dan microservices terisolasi dalam hitungan detik dengan visualisasi grafik call-tree interaktif.</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">🛡️</div>
            <h3>Keamanan Enterprise Bawaan</h3>
            <p>Enkripsi end-to-end mTLS, audit log SOC2 compliant, dan kontrol akses berbasis peran (RBAC) yang siap pakai untuk kepatuhan regulasi.</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Pricing Preview -->
    <section class="pricing-preview-section">
      <div class="container">
        <div class="section-header">
          <span class="badge">Investasi Jernih</span>
          <h2>Mulai Kecil, Naikkan Skala Kapan Saja</h2>
          <p>Harga transparan tanpa biaya tersembunyi. Disesuaikan dengan kebutuhan beban server Anda.</p>
        </div>
        <div class="pricing-grid">
          <div class="pricing-card">
            <h3>Starter</h3>
            <p class="pricing-desc">Cocok untuk project sampingan dan MVP awal.</p>
            <div class="price">Rp 0 <span>/ bulan</span></div>
            <ul class="pricing-features">
              <li>✓ Hingga 3 Node Cluster</li>
              <li>✓ Retensi Metrik 7 Hari</li>
              <li>✓ Dukungan Komunitas Discord</li>
            </ul>
            <a href="pricing.html" class="btn btn-outline btn-full">Mulai Sekarang</a>
          </div>
          <div class="pricing-card popular">
            <div class="card-badge">Paling Populer</div>
            <h3>Pro Team</h3>
            <p class="pricing-desc">Untuk startup dan tim teknologi yang bertumbuh cepat.</p>
            <div class="price">Rp 499.000 <span>/ bulan</span></div>
            <ul class="pricing-features">
              <li>✓ Node Cluster Tanpa Batas</li>
              <li>✓ Retensi Metrik 90 Hari</li>
              <li>✓ Alerting Cerdas via Slack & WA</li>
              <li>✓ SLA Garansi 99.95%</li>
            </ul>
            <a href="pricing.html" class="btn btn-primary btn-full">Pilih Paket Pro</a>
          </div>
        </div>
      </div>
    </section>

    <!-- FAQ -->
    <section class="faq-section" id="faq">
      <div class="container">
        <div class="section-header">
          <span class="badge">Bantuan</span>
          <h2>Pertanyaan yang Sering Diajukan</h2>
        </div>
        <div class="faq-list">
          <div class="faq-item">
            <h4>Berapa lama proses integrasi ke cluster kami?</h4>
            <p>Hanya butuh waktu kurang dari 5 menit. Cukup pasang satu baris agent daemon kami pada cluster Kubernetes atau virtual machine Linux Anda.</p>
          </div>
          <div class="faq-item">
            <h4>Apakah ada masa percobaan gratis untuk fitur Pro?</h4>
            <p>Ya, Anda dapat mencoba paket Pro Team selama 14 hari penuh tanpa kewajiban memasukkan data kartu kredit.</p>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA Banner -->
    <section class="cta-section">
      <div class="container cta-card">
        <h2>Siap Mengakselerasi Efisiensi Cloud Anda?</h2>
        <p>Bergabunglah dengan ratusan tim teknologi yang mempercayakan monitoring pada CloudScale.</p>
        <div class="cta-actions">
          <a href="pricing.html" class="btn btn-white">Mulai Gratis 14 Hari</a>
          <a href="pricing.html" class="btn btn-transparent">Jadwalkan Demo Teknis</a>
        </div>
      </div>
    </section>
  </main>

  <footer class="footer">
    <div class="container footer-content">
      <div class="footer-brand">
        <span class="logo-text">CloudScale</span>
        <p>Platform orkestrasi & pemantauan awan berkinerja tinggi untuk developer.</p>
      </div>
      <div class="footer-links">
        <a href="#fitur">Fitur</a>
        <a href="pricing.html">Harga</a>
        <a href="#faq">Dokumentasi</a>
        <a href="#">Privasi</a>
      </div>
    </div>
  </footer>
</body>
</html>`,
        "index.html",
      ),
      "pricing.html": makeTextFile(
        `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Paket & Harga — CloudScale</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="">
  <link rel="stylesheet" data-kanvas-fonts="" href="https://fonts.googleapis.com/css2?family=Plus%20Jakarta%20Sans:wght@400;500;600;700;800&family=Inter:wght@400;500;600&display=swap">
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <header class="header">
    <div class="container nav-container">
      <a href="index.html" class="logo">
        <span class="logo-icon">⚡</span>
        <span class="logo-text">CloudScale</span>
      </a>
      <nav class="nav-links">
        <a href="index.html">Beranda</a>
        <a href="index.html#fitur">Fitur</a>
        <a href="pricing.html" class="active">Harga</a>
        <a href="index.html" class="btn btn-primary btn-sm">Mulai Gratis</a>
      </nav>
    </div>
  </header>

  <main style="padding: 64px 0;">
    <div class="container">
      <div class="section-header">
        <span class="badge">Paket Transparan</span>
        <h1>Pilih Paket yang Sesuai dengan Skala Anda</h1>
        <p>Uji coba gratis 14 hari pada semua paket berbayar. Batalkan kapan saja tanpa penalti.</p>
      </div>

      <div class="pricing-grid" style="margin-top: 48px;">
        <div class="pricing-card">
          <h3>Developer</h3>
          <p class="pricing-desc">Untuk pengujian lokal dan eksperimen personal.</p>
          <div class="price">Rp 0 <span>/ bulan</span></div>
          <ul class="pricing-features">
            <li>✓ 3 Node Kluster</li>
            <li>✓ 5.000 Event / Menit</li>
            <li>✓ Retensi Data 7 Hari</li>
          </ul>
          <a href="#" class="btn btn-outline btn-full">Gunakan Gratis</a>
        </div>
        <div class="pricing-card popular">
          <div class="card-badge">Rekomendasi</div>
          <h3>Pro Team</h3>
          <p class="pricing-desc">Kekuatan penuh untuk produk skala produksi.</p>
          <div class="price">Rp 499.000 <span>/ bulan</span></div>
          <ul class="pricing-features">
            <li>✓ Kluster Tanpa Batas</li>
            <li>✓ 100.000 Event / Menit</li>
            <li>✓ Retensi Data 90 Hari</li>
            <li>✓ Notifikasi Instan WhatsApp & Slack</li>
          </ul>
          <a href="#" class="btn btn-primary btn-full">Mulai Uji Coba Pro</a>
        </div>
        <div class="pricing-card">
          <h3>Enterprise</h3>
          <p class="pricing-desc">Dukungan kustom, private cloud & SLA dedicated.</p>
          <div class="price">Kustom <span>/ tahun</span></div>
          <ul class="pricing-features">
            <li>✓ Dedicated Technical Account Manager</li>
            <li>✓ Audit Log SOC2 & HIPAA</li>
            <li>✓ Garansi Uptime 99.99%</li>
          </ul>
          <a href="#" class="btn btn-secondary btn-full">Hubungi Sales</a>
        </div>
      </div>
    </div>
  </main>
</body>
</html>`,
        "pricing.html",
      ),
      "styles.css": makeTextFile(
        `/* --- KANVAS GLOBAL THEME --- */
:root {
  --color-primary: #2563eb;
  --color-secondary: #64748b;
  --color-accent: #38bdf8;
  --color-bg: #ffffff;
  --color-surface: #f8fafc;
  --color-text: #0f172a;
  --color-muted: #64748b;
  --color-border: #e2e8f0;
  --font-heading: "Plus Jakarta Sans", system-ui, sans-serif;
  --font-body: "Inter", system-ui, sans-serif;
  --radius-md: 10px;
  --radius-lg: 16px;
  --shadow-md: 0 4px 12px rgba(15, 23, 42, 0.08);
  --shadow-lg: 0 16px 36px rgba(15, 23, 42, 0.12);
}
/* --- END KANVAS GLOBAL THEME --- */

* { box-sizing: border-box; margin: 0; padding: 0; }
body {
  font-family: var(--font-body);
  background-color: var(--color-bg);
  color: var(--color-text);
  line-height: 1.6;
}
.container {
  width: 100%;
  max-width: 1140px;
  margin: 0 auto;
  padding: 0 20px;
}
.header {
  border-bottom: 1px solid var(--color-border);
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(8px);
  position: sticky;
  top: 0;
  z-index: 40;
}
.nav-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 68px;
}
.logo {
  display: flex;
  align-items: center;
  gap: 8px;
  text-decoration: none;
  font-weight: 800;
  font-size: 19px;
  color: var(--color-text);
}
.nav-links {
  display: flex;
  align-items: center;
  gap: 20px;
}
.nav-links a {
  text-decoration: none;
  color: var(--color-muted);
  font-size: 14px;
  font-weight: 500;
  transition: color 0.15s;
}
.nav-links a:hover, .nav-links a.active { color: var(--color-primary); }

.hero-section {
  padding: 72px 0 56px;
  text-align: center;
  background: radial-gradient(circle at 50% 10%, #eff6ff 0%, transparent 60%);
}
.badge-pill {
  display: inline-block;
  padding: 6px 16px;
  border-radius: 999px;
  background: #dbeafe;
  color: #1e40af;
  font-size: 13px;
  font-weight: 600;
  margin-bottom: 20px;
}
.hero-title {
  font-family: var(--font-heading);
  font-size: clamp(32px, 5vw, 54px);
  font-weight: 800;
  letter-spacing: -0.03em;
  line-height: 1.15;
  margin-bottom: 18px;
}
.hero-subtitle {
  max-width: 720px;
  margin: 0 auto 32px;
  color: var(--color-muted);
  font-size: 17px;
}
.hero-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
  margin-bottom: 48px;
  flex-wrap: wrap;
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 10px 22px;
  font-size: 14px;
  font-weight: 600;
  border-radius: var(--radius-md);
  text-decoration: none;
  transition: all 0.15s ease;
  cursor: pointer;
}
.btn-sm { padding: 6px 14px; font-size: 13px; }
.btn-primary { background: var(--color-primary); color: #fff; border: 1px solid var(--color-primary); }
.btn-primary:hover { opacity: 0.9; }
.btn-secondary { background: var(--color-surface); color: var(--color-text); border: 1px solid var(--color-border); }
.btn-outline { background: transparent; border: 1px solid var(--color-border); color: var(--color-text); }
.btn-white { background: #fff; color: var(--color-primary); border: none; }
.btn-transparent { background: rgba(255, 255, 255, 0.15); color: #fff; border: 1px solid rgba(255, 255, 255, 0.3); }
.btn-full { width: 100%; }

.dashboard-preview {
  max-width: 860px;
  margin: 0 auto;
  background: #0f172a;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
  overflow: hidden;
  border: 1px solid #334155;
  text-align: left;
}
.preview-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 18px;
  background: #1e293b;
  border-bottom: 1px solid #334155;
}
.preview-dots span {
  display: inline-block;
  width: 9px;
  height: 9px;
  border-radius: 50%;
  background: #64748b;
  margin-right: 5px;
}
.preview-url { font-family: monospace; font-size: 11px; color: #94a3b8; }
.preview-status { font-size: 11px; color: #34d399; font-weight: 600; }
.preview-body {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  padding: 24px;
}
.metric-card {
  background: #1e293b;
  padding: 16px;
  border-radius: var(--radius-md);
  border: 1px solid #334155;
}
.metric-label { font-size: 11px; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.05em; display: block; margin-bottom: 4px; }
.metric-val { font-size: 26px; font-weight: 800; color: #f8fafc; font-family: var(--font-heading); display: block; }
.metric-trend { font-size: 11px; font-weight: 500; }
.text-emerald { color: #34d399; }
.text-blue { color: #60a5fa; }

.logos-section {
  padding: 40px 0;
  border-top: 1px solid var(--color-border);
  border-bottom: 1px solid var(--color-border);
  text-align: center;
}
.logos-caption { font-size: 12px; text-transform: uppercase; letter-spacing: 0.08em; color: var(--color-muted); margin-bottom: 20px; font-weight: 600; }
.logos-grid { display: flex; justify-content: center; gap: 32px; flex-wrap: wrap; }
.logo-item { font-size: 16px; font-weight: 700; color: #94a3b8; letter-spacing: -0.01em; }

.section-header { text-align: center; max-width: 640px; margin: 0 auto 48px; }
.badge { display: inline-block; padding: 4px 12px; background: #eff6ff; color: var(--color-primary); border-radius: 999px; font-size: 12px; font-weight: 600; margin-bottom: 10px; }
.section-header h2 { font-family: var(--font-heading); font-size: 32px; font-weight: 800; margin-bottom: 10px; }
.section-header p { color: var(--color-muted); font-size: 16px; }

.features-section { padding: 64px 0; }
.features-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 24px; }
.feature-card { background: var(--color-surface); padding: 28px; border-radius: var(--radius-lg); border: 1px solid var(--color-border); }
.feature-icon { font-size: 32px; margin-bottom: 16px; }
.feature-card h3 { font-family: var(--font-heading); font-size: 18px; margin-bottom: 10px; }
.feature-card p { color: var(--color-muted); font-size: 14px; }

.pricing-preview-section { padding: 64px 0; background: var(--color-surface); }
.pricing-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 24px; max-width: 860px; margin: 0 auto; }
.pricing-card { background: #fff; padding: 32px; border-radius: var(--radius-lg); border: 1px solid var(--color-border); position: relative; }
.pricing-card.popular { border-color: var(--color-primary); box-shadow: var(--shadow-lg); }
.card-badge { position: absolute; top: -12px; right: 24px; background: var(--color-primary); color: #fff; font-size: 11px; font-weight: 700; padding: 2px 10px; border-radius: 999px; }
.pricing-desc { color: var(--color-muted); font-size: 13px; margin: 6px 0 18px; }
.price { font-size: 36px; font-weight: 800; font-family: var(--font-heading); margin-bottom: 20px; }
.price span { font-size: 14px; font-weight: 400; color: var(--color-muted); }
.pricing-features { list-style: none; margin-bottom: 24px; }
.pricing-features li { padding: 6px 0; font-size: 13px; color: var(--color-text); }

.faq-section { padding: 64px 0; }
.faq-list { max-width: 720px; margin: 0 auto; display: flex; flex-direction: column; gap: 16px; }
.faq-item { background: var(--color-surface); padding: 20px; border-radius: var(--radius-md); border: 1px solid var(--color-border); }
.faq-item h4 { font-size: 16px; margin-bottom: 8px; }
.faq-item p { color: var(--color-muted); font-size: 14px; }

.cta-section { padding: 64px 0; }
.cta-card { background: linear-gradient(135deg, #1e40af 0%, #2563eb 100%); color: #fff; padding: 48px 32px; border-radius: var(--radius-lg); text-align: center; }
.cta-card h2 { font-size: 32px; font-family: var(--font-heading); margin-bottom: 12px; }
.cta-card p { font-size: 16px; color: #bfdbfe; margin-bottom: 28px; max-width: 600px; margin-left: auto; margin-right: auto; }
.cta-actions { display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; }

.footer { border-top: 1px solid var(--color-border); padding: 40px 0; font-size: 14px; color: var(--color-muted); }
.footer-content { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 20px; }
.footer-links { display: flex; gap: 20px; }
.footer-links a { color: var(--color-muted); text-decoration: none; }
.footer-links a:hover { color: var(--color-text); }

@media (max-width: 768px) {
  .nav-links { display: none; }
  .hero-title { font-size: 32px; }
}
`,
        "styles.css",
      ),
    },
  },

  // 2. BUSINESS CORPORATE
  {
    id: "business-apex",
    entry: "index.html",
    name: "Apex Advisory — Konsultan Bisnis & Korporasi",
    category: "Business",
    description: "Website korporasi terpercaya untuk firma konsultasi manajemen, penasihat keuangan, dan transformasi digital enterprise.",
    featured: true,
    author: "Kanvas Official",
    createdAt: 1715000000000,
    updatedAt: 1715000000000,
    tags: ["Business", "Corporate", "Consulting", "Finance", "Enterprise"],
    thumbnailGradient: {
      from: "#0f172a",
      to: "#1e3a8a",
      accent: "#f59e0b",
    },
    globalTheme: {
      presetId: "corporate-trust",
      primaryColor: "#1e3a8a",
      secondaryColor: "#475569",
      accentColor: "#d97706",
      backgroundColor: "#ffffff",
      surfaceColor: "#f8fafc",
      textColor: "#0f172a",
      mutedTextColor: "#475569",
      borderColor: "#e2e8f0",
      headingFont: "Playfair Display",
      bodyFont: "Inter",
      fontSizeBase: "16px",
      radiusPreset: "md",
      shadowPreset: "medium",
    },
    pages: [
      { path: "index.html", title: "Beranda Apex Advisory", isEntry: true },
      { path: "services.html", title: "Layanan Konsultasi & Enterprise" },
    ],
    sections: [
      "Top Bar Kontak",
      "Navigasi Korporasi",
      "Hero Eksekutif",
      "Pencapaian & Statistik (Metrics)",
      "Layanan Utama",
      "Studi Kasus Klien",
      "Konsultasi CTA",
      "Footer Korporasi",
    ],
    files: {
      "index.html": makeTextFile(
        `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Apex Advisory — Mitra Transformasi Korporasi</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="">
  <link rel="stylesheet" data-kanvas-fonts="" href="https://fonts.googleapis.com/css2?family=Playfair%20Display:wght@600;700;800&family=Inter:wght@400;500;600&display=swap">
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <div class="topbar">
    <div class="container topbar-inner">
      <span>📍 Menara Sudirman Lt. 24, Jakarta Pusat</span>
      <span>📞 +62 21 5550 8900 | advisory@apex-group.id</span>
    </div>
  </div>

  <header class="corp-header">
    <div class="container corp-nav">
      <a href="index.html" class="corp-logo">APEX ADVISORY</a>
      <nav class="corp-links">
        <a href="index.html">Beranda</a>
        <a href="services.html">Layanan</a>
        <a href="#studi-kasus">Studi Kasus</a>
        <a href="#kontak" class="btn btn-primary btn-sm">Jadwalkan Konsultasi</a>
      </nav>
    </div>
  </header>

  <main>
    <section class="corp-hero">
      <div class="container">
        <span class="eyebrow">Strategic Consulting & Financial Advisory</span>
        <h1>Memandu Keputusan Strategis untuk Pertumbuhan Korporasi Berkelanjutan</h1>
        <p>Kami bermitra dengan dewan direksi dan pemimpin enterprise dalam merancang tata kelola finansial, efisiensi operasional, serta akuisisi bernilai tinggi.</p>
        <div class="hero-btns">
          <a href="services.html" class="btn btn-primary">Eksplorasi Solusi</a>
          <a href="#studi-kasus" class="btn btn-outline">Lihat Rekam Jejak</a>
        </div>
      </div>
    </section>

    <section class="stats-bar">
      <div class="container stats-grid">
        <div class="stat-box">
          <span class="stat-number">Rp 4.2 T+</span>
          <span class="stat-label">Nilai Transaksi M&A Difasilitasi</span>
        </div>
        <div class="stat-box">
          <span class="stat-number">280+</span>
          <span class="stat-label">Mitra Korporat & BUMN</span>
        </div>
        <div class="stat-box">
          <span class="stat-number">99.2%</span>
          <span class="stat-label">Tingkat Retensi Klien Tahunan</span>
        </div>
      </div>
    </section>

    <section class="services-overview">
      <div class="container">
        <div class="section-heading">
          <h2>Kapabilitas & Solusi Inti</h2>
          <p>Pendekatan berbasis data dengan ketelitian analitik kelas dunia.</p>
        </div>
        <div class="services-grid">
          <div class="service-item">
            <h3>Restrukturisasi Finansial</h3>
            <p>Optimalisasi neraca keuangan, manajemen likuiditas, dan perencanaan skenario risiko untuk ketahanan jangka panjang.</p>
          </div>
          <div class="service-item">
            <h3>Merger & Akuisisi (M&A)</h3>
            <p>Uji tuntas komprehensif, valuasi aset strategis, serta integrasi pasca-akuisisi yang mulus.</p>
          </div>
          <div class="service-item">
            <h3>Transformasi Operasional</h3>
            <p>Modernisasi proses bisnis untuk meningkatkan margin operasional dan kapabilitas digital terdepan.</p>
          </div>
        </div>
      </div>
    </section>

    <section class="consult-cta" id="kontak">
      <div class="container cta-inner">
        <h2>Siap Membuka Potensi Pertumbuhan Perusahaan Anda?</h2>
        <p>Konsultan senior kami siap mendiskusikan roadmap strategis bisnis Anda.</p>
        <a href="services.html" class="btn btn-gold">Konsultasikan Kebutuhan</a>
      </div>
    </section>
  </main>

  <footer class="corp-footer">
    <div class="container footer-grid">
      <div>
        <h4>Apex Advisory Indonesia</h4>
        <p>Firma konsultasi manajemen independen terdaftar.</p>
      </div>
      <div>
        <p>© 2026 Apex Advisory. Seluruh hak cipta dilindungi undang-undang.</p>
      </div>
    </div>
  </footer>
</body>
</html>`,
        "index.html",
      ),
      "services.html": makeTextFile(
        `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Layanan Strategis — Apex Advisory</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="">
  <link rel="stylesheet" data-kanvas-fonts="" href="https://fonts.googleapis.com/css2?family=Playfair%20Display:wght@600;700;800&family=Inter:wght@400;500;600&display=swap">
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <header class="corp-header">
    <div class="container corp-nav">
      <a href="index.html" class="corp-logo">APEX ADVISORY</a>
      <nav class="corp-links">
        <a href="index.html">Beranda</a>
        <a href="services.html" class="active">Layanan</a>
        <a href="index.html#kontak" class="btn btn-primary btn-sm">Jadwalkan Konsultasi</a>
      </nav>
    </div>
  </header>

  <main style="padding: 64px 0;">
    <div class="container">
      <div class="section-heading">
        <span class="eyebrow">Solusi Terpadu</span>
        <h1>Layanan Konsultasi Komprehensif</h1>
        <p>Metodologi teruji untuk mengatasi tantangan bisnis paling krusial di era disrupsi.</p>
      </div>

      <div class="services-grid" style="margin-top: 48px;">
        <div class="service-item">
          <h3>Valuasi & Penasihat Investasi</h3>
          <p>Analisis valuasi independen menggunakan model discounted cash-flow dan transaksi pasar pembanding terkini.</p>
        </div>
        <div class="service-item">
          <h3>Audit Kepatuhan & Risiko Korporat</h3>
          <p>Identifikasi celah kepatuhan hukum, risiko regulasi sektoral, serta mitigasi sanksi institusional.</p>
        </div>
        <div class="service-item">
          <h3>Strategi Suksesi & Tata Kelola Keluarga</h3>
          <p>Perencanaan kepemimpinan transisi bagi konglomerasi dan perusahaan keluarga untuk menjaga keberlanjutan dinasti bisnis.</p>
        </div>
      </div>
    </div>
  </main>
</body>
</html>`,
        "services.html",
      ),
      "styles.css": makeTextFile(
        `/* --- KANVAS GLOBAL THEME --- */
:root {
  --color-primary: #1e3a8a;
  --color-secondary: #475569;
  --color-accent: #d97706;
  --color-bg: #ffffff;
  --color-surface: #f8fafc;
  --color-text: #0f172a;
  --color-muted: #475569;
  --color-border: #e2e8f0;
  --font-heading: "Playfair Display", Georgia, serif;
  --font-body: "Inter", system-ui, sans-serif;
  --radius-md: 6px;
  --radius-lg: 12px;
}
/* --- END KANVAS GLOBAL THEME --- */

* { box-sizing: border-box; margin: 0; padding: 0; }
body { font-family: var(--font-body); color: var(--color-text); line-height: 1.6; }
.container { max-width: 1100px; margin: 0 auto; padding: 0 24px; }

.topbar { background: #0f172a; color: #94a3b8; font-size: 12px; padding: 8px 0; }
.topbar-inner { display: flex; justify-content: space-between; flex-wrap: wrap; gap: 8px; }

.corp-header { border-bottom: 1px solid var(--color-border); background: #fff; }
.corp-nav { display: flex; justify-content: space-between; align-items: center; height: 72px; }
.corp-logo { font-family: var(--font-heading); font-size: 20px; font-weight: 800; letter-spacing: 0.08em; text-decoration: none; color: var(--color-primary); }
.corp-links { display: flex; gap: 20px; align-items: center; }
.corp-links a { text-decoration: none; font-size: 14px; font-weight: 500; color: var(--color-muted); }
.corp-links a:hover, .corp-links a.active { color: var(--color-primary); }

.corp-hero { padding: 84px 0 64px; text-align: center; background: #fafafa; }
.eyebrow { text-transform: uppercase; letter-spacing: 0.12em; font-size: 12px; font-weight: 700; color: var(--color-accent); display: block; margin-bottom: 12px; }
.corp-hero h1 { font-family: var(--font-heading); font-size: clamp(32px, 4.5vw, 48px); line-height: 1.2; max-width: 900px; margin: 0 auto 20px; font-weight: 700; }
.corp-hero p { max-width: 680px; margin: 0 auto 36px; color: var(--color-muted); font-size: 17px; }
.hero-btns { display: flex; justify-content: center; gap: 14px; }

.btn { display: inline-flex; align-items: center; padding: 10px 24px; border-radius: var(--radius-md); text-decoration: none; font-size: 14px; font-weight: 600; cursor: pointer; }
.btn-sm { padding: 6px 14px; font-size: 13px; }
.btn-primary { background: var(--color-primary); color: #fff; border: 1px solid var(--color-primary); }
.btn-outline { background: transparent; border: 1px solid var(--color-primary); color: var(--color-primary); }
.btn-gold { background: var(--color-accent); color: #fff; border: 1px solid var(--color-accent); }

.stats-bar { background: var(--color-primary); color: #fff; padding: 40px 0; }
.stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 24px; text-align: center; }
.stat-number { font-family: var(--font-heading); font-size: 38px; font-weight: 700; display: block; margin-bottom: 4px; color: #fde68a; }
.stat-label { font-size: 13px; color: #cbd5e1; }

.services-overview { padding: 80px 0; }
.section-heading { text-align: center; max-width: 680px; margin: 0 auto 48px; }
.section-heading h2, .section-heading h1 { font-family: var(--font-heading); font-size: 34px; margin-bottom: 12px; }
.section-heading p { color: var(--color-muted); font-size: 16px; }
.services-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 32px; }
.service-item { padding: 32px; background: var(--color-surface); border: 1px solid var(--color-border); border-radius: var(--radius-lg); border-top: 4px solid var(--color-primary); }
.service-item h3 { font-family: var(--font-heading); font-size: 20px; margin-bottom: 12px; }
.service-item p { color: var(--color-muted); font-size: 14px; }

.consult-cta { background: #0f172a; color: #fff; padding: 64px 0; text-align: center; }
.cta-inner h2 { font-family: var(--font-heading); font-size: 32px; margin-bottom: 12px; }
.cta-inner p { color: #94a3b8; font-size: 16px; margin-bottom: 24px; }

.corp-footer { background: #fff; border-top: 1px solid var(--color-border); padding: 32px 0; font-size: 13px; color: var(--color-muted); }
.footer-grid { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px; }

@media (max-width: 768px) {
  .corp-links { display: none; }
}
`,
        "styles.css",
      ),
    },
  },

  // 3. DIGITAL AGENCY
  {
    id: "agency-vanguard",
    entry: "index.html",
    name: "Vanguard Creative — Studio Desain & Web Digital",
    category: "Agency",
    description: "Portofolio agensi digital dengan tipografi kontras tinggi, etalase proyek terpilih, dan alur kerja kolaboratif berani.",
    featured: true,
    author: "Kanvas Official",
    createdAt: 1715000000000,
    updatedAt: 1715000000000,
    tags: ["Agency", "Creative", "Dark Mode", "Portfolio", "Web Design"],
    thumbnailGradient: {
      from: "#09090b",
      to: "#18181b",
      accent: "#06b6d4",
    },
    globalTheme: {
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
      shadowPreset: "medium",
    },
    pages: [
      { path: "index.html", title: "Vanguard Studio Showcase", isEntry: true },
      { path: "works.html", title: "Karya Terpilih & Studi Kasus" },
    ],
    sections: [
      "Navigasi Tipografis",
      "Hero Agensi Eksplosif",
      "Etalase Karya Terpilih",
      "Alur Kerja (Process)",
      "Testimoni Klien",
      "Formulir Brief Proyek",
      "Footer Agensi",
    ],
    files: {
      "index.html": makeTextFile(
        `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Vanguard Creative — Digital Product & Design Agency</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="">
  <link rel="stylesheet" data-kanvas-fonts="" href="https://fonts.googleapis.com/css2?family=Space%20Grotesk:wght@600;700&family=Inter:wght@400;500;600&display=swap">
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <header class="agency-header">
    <div class="container agency-nav">
      <a href="index.html" class="agency-logo">VANGUARD / LAB</a>
      <div class="status-pill"><span class="dot"></span> Tersedia untuk Q3/Q4</div>
      <nav class="agency-links">
        <a href="index.html">Beranda</a>
        <a href="works.html">Karya</a>
        <a href="#proses">Proses</a>
        <a href="#kontak" class="btn btn-cyan btn-sm">Mulai Proyek</a>
      </nav>
    </div>
  </header>

  <main>
    <section class="agency-hero">
      <div class="container">
        <p class="tagline">// DIGITAL PRODUCT STUDIO</p>
        <h1>Membangun Pengalaman Web yang Mengubah Pengunjung Menjadi Pembeli Setia.</h1>
        <p class="hero-desc">Kami menggabungkan strategi brand berani, interaksi visual presisi tinggi, dan arsitektur kode modern untuk brand visioner.</p>
      </div>
    </section>

    <section class="portfolio-grid-section">
      <div class="container">
        <div class="section-title-wrap">
          <h2>Karya Pilihan (2025–2026)</h2>
          <a href="works.html" class="link-arrow">Lihat semua arsip ↗</a>
        </div>
        <div class="work-cards">
          <div class="work-card">
            <div class="work-cover" style="background: linear-gradient(135deg, #0e7490, #1e1b4b);"></div>
            <div class="work-info">
              <span class="work-cat">Fintech Mobile & Web App</span>
              <h3>Nusantara Capital Platform</h3>
              <p>Redesain platform investasi retail dengan peningkatan konversi onboarding 84%.</p>
            </div>
          </div>
          <div class="work-card">
            <div class="work-cover" style="background: linear-gradient(135deg, #701a75, #312e81);"></div>
            <div class="work-info">
              <span class="work-cat">E-Commerce Luxury Goods</span>
              <h3>Aura Haute Horlogerie</h3>
              <p>Pengalaman belanja jam tangan mewah digital dengan konfigurasi 3D real-time.</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="process-section" id="proses">
      <div class="container">
        <div class="section-title-wrap">
          <h2>Metodologi Eksekusi</h2>
        </div>
        <div class="process-steps">
          <div class="step">
            <span class="step-num">01</span>
            <h4>Audit & Discovery</h4>
            <p>Menganalisis data analitik, wawancara pengguna, dan pemetaan posisi brand.</p>
          </div>
          <div class="step">
            <span class="step-num">02</span>
            <h4>Design & Prototype</h4>
            <p>Eksplorasi visual interaktif, design tokens, dan pengujian kegunaan mendalam.</p>
          </div>
          <div class="step">
            <span class="step-num">03</span>
            <h4>Code & Launch</h4>
            <p>Pembangunan kode bersih, optimalisasi SEO, dan implementasi deployment kilat.</p>
          </div>
        </div>
      </div>
    </section>

    <section class="agency-cta" id="kontak">
      <div class="container cta-box">
        <h2>Punya Rencana Proyek Ambisius?</h2>
        <p>Mari diskusikan visi Anda bersama lead designer dan tech architect kami.</p>
        <a href="mailto:halo@vanguard-lab.id" class="btn btn-cyan btn-lg">Kirim Brief Proyek</a>
      </div>
    </section>
  </main>

  <footer class="agency-footer">
    <div class="container footer-row">
      <span>VANGUARD CREATIVE STUDIO — JAKARTA / BALI</span>
      <span>Dibuat dengan Kanvas Editor</span>
    </div>
  </footer>
</body>
</html>`,
        "index.html",
      ),
      "works.html": makeTextFile(
        `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Karya Pilihan — Vanguard Creative</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="">
  <link rel="stylesheet" data-kanvas-fonts="" href="https://fonts.googleapis.com/css2?family=Space%20Grotesk:wght@600;700&family=Inter:wght@400;500;600&display=swap">
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <header class="agency-header">
    <div class="container agency-nav">
      <a href="index.html" class="agency-logo">VANGUARD / LAB</a>
      <nav class="agency-links">
        <a href="index.html">Beranda</a>
        <a href="works.html" class="active">Karya</a>
        <a href="index.html#kontak" class="btn btn-cyan btn-sm">Mulai Proyek</a>
      </nav>
    </div>
  </header>

  <main style="padding: 72px 0;">
    <div class="container">
      <p class="tagline">// SELECTED ARCHIVE</p>
      <h1 style="font-family: var(--font-heading); font-size: 42px; margin-bottom: 24px;">Portofolio Proyek Klien</h1>
      <p style="color: var(--color-muted); max-width: 600px; margin-bottom: 48px;">Kumpulan studi kasus interaksi digital, web app, dan identitas visual yang kami hasilkan dalam 2 tahun terakhir.</p>

      <div class="work-cards">
        <div class="work-card">
          <div class="work-cover" style="background: linear-gradient(135deg, #1e3a8a, #06b6d4);"></div>
          <div class="work-info">
            <span class="work-cat">SaaS Interface</span>
            <h3>Kinetik Logistics ERP</h3>
            <p>Dashboard pelacakan armada maritim terdistribusi untuk korporasi logistik nasional.</p>
          </div>
        </div>
        <div class="work-card">
          <div class="work-cover" style="background: linear-gradient(135deg, #831843, #f43f5e);"></div>
          <div class="work-info">
            <span class="work-cat">Direct-to-Consumer</span>
            <h3>Botanica Living Lab</h3>
            <p>Situs e-commerce produk perawatan organik dengan storytelling interaktif.</p>
          </div>
        </div>
      </div>
    </div>
  </main>
</body>
</html>`,
        "works.html",
      ),
      "styles.css": makeTextFile(
        `/* --- KANVAS GLOBAL THEME --- */
:root {
  --color-primary: #06b6d4;
  --color-secondary: #8b5cf6;
  --color-accent: #f43f5e;
  --color-bg: #09090b;
  --color-surface: #18181b;
  --color-text: #f4f4f5;
  --color-muted: #a1a1aa;
  --color-border: #27272a;
  --font-heading: "Space Grotesk", monospace, sans-serif;
  --font-body: "Inter", system-ui, sans-serif;
  --radius-md: 8px;
  --radius-lg: 14px;
}
/* --- END KANVAS GLOBAL THEME --- */

* { box-sizing: border-box; margin: 0; padding: 0; }
body { background: var(--color-bg); color: var(--color-text); font-family: var(--font-body); line-height: 1.6; }
.container { max-width: 1140px; margin: 0 auto; padding: 0 24px; }

.agency-header { border-bottom: 1px solid var(--color-border); background: rgba(9, 9, 11, 0.85); backdrop-filter: blur(12px); position: sticky; top: 0; z-index: 40; }
.agency-nav { display: flex; justify-content: space-between; align-items: center; height: 72px; }
.agency-logo { font-family: var(--font-heading); font-size: 18px; font-weight: 700; color: #fff; text-decoration: none; letter-spacing: 0.05em; }
.status-pill { display: inline-flex; align-items: center; gap: 8px; background: #18181b; border: 1px solid #27272a; padding: 4px 12px; border-radius: 999px; font-size: 11px; color: #a1a1aa; }
.status-pill .dot { width: 6px; height: 6px; border-radius: 50%; background: #10b981; }
.agency-links { display: flex; gap: 20px; align-items: center; }
.agency-links a { color: var(--color-muted); text-decoration: none; font-size: 14px; }
.agency-links a:hover, .agency-links a.active { color: #fff; }

.agency-hero { padding: 96px 0 64px; }
.tagline { font-family: var(--font-heading); color: var(--color-primary); font-size: 13px; font-weight: 600; margin-bottom: 16px; letter-spacing: 0.1em; }
.agency-hero h1 { font-family: var(--font-heading); font-size: clamp(34px, 5.5vw, 56px); line-height: 1.15; font-weight: 700; max-width: 960px; margin-bottom: 24px; }
.hero-desc { color: var(--color-muted); font-size: 18px; max-width: 640px; }

.btn { display: inline-flex; align-items: center; justify-content: center; padding: 10px 22px; border-radius: var(--radius-md); font-weight: 600; text-decoration: none; cursor: pointer; }
.btn-sm { padding: 6px 14px; font-size: 12px; }
.btn-cyan { background: var(--color-primary); color: #000; }
.btn-cyan:hover { opacity: 0.9; }
.btn-lg { padding: 14px 32px; font-size: 16px; }

.portfolio-grid-section { padding: 64px 0; }
.section-title-wrap { display: flex; justify-content: space-between; align-items: center; margin-bottom: 36px; }
.section-title-wrap h2 { font-family: var(--font-heading); font-size: 28px; }
.link-arrow { color: var(--color-primary); text-decoration: none; font-size: 14px; }

.work-cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 32px; }
.work-card { background: var(--color-surface); border: 1px solid var(--color-border); border-radius: var(--radius-lg); overflow: hidden; }
.work-cover { height: 240px; }
.work-info { padding: 24px; }
.work-cat { font-size: 11px; text-transform: uppercase; color: var(--color-primary); letter-spacing: 0.08em; display: block; margin-bottom: 8px; }
.work-info h3 { font-family: var(--font-heading); font-size: 20px; margin-bottom: 8px; color: #fff; }
.work-info p { color: var(--color-muted); font-size: 14px; }

.process-section { padding: 64px 0; border-top: 1px solid var(--color-border); }
.process-steps { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 28px; }
.step { background: var(--color-surface); padding: 28px; border-radius: var(--radius-md); border: 1px solid var(--color-border); }
.step-num { font-family: var(--font-heading); font-size: 32px; color: var(--color-primary); font-weight: 700; display: block; margin-bottom: 12px; }
.step h4 { font-family: var(--font-heading); font-size: 18px; margin-bottom: 8px; }
.step p { color: var(--color-muted); font-size: 13px; }

.agency-cta { padding: 80px 0; }
.cta-box { background: linear-gradient(145deg, #18181b 0%, #111113 100%); border: 1px solid #27272a; border-radius: var(--radius-lg); padding: 64px 32px; text-align: center; }
.cta-box h2 { font-family: var(--font-heading); font-size: 36px; margin-bottom: 14px; }
.cta-box p { color: var(--color-muted); font-size: 16px; margin-bottom: 32px; }

.agency-footer { border-top: 1px solid var(--color-border); padding: 32px 0; font-size: 12px; color: var(--color-muted); font-family: var(--font-heading); }
.footer-row { display: flex; justify-content: space-between; flex-wrap: wrap; gap: 12px; }

@media (max-width: 768px) {
  .status-pill { display: none; }
  .agency-links { display: none; }
}
`,
        "styles.css",
      ),
    },
  },

  // 4. PERSONAL PORTFOLIO
  {
    id: "portfolio-minimal",
    entry: "index.html",
    name: "Elena Rinjani — Senior Product & Interface Designer",
    category: "Portfolio",
    description: "Portofolio pribadi desainer digital dengan pendekatan tipografi editorial bersih, kartu studi kasus mendalam, dan daftar keahlian.",
    featured: false,
    author: "Kanvas Official",
    createdAt: 1715000000000,
    updatedAt: 1715000000000,
    tags: ["Portfolio", "Designer", "Minimalist", "Editorial", "Personal"],
    thumbnailGradient: {
      from: "#f4f4f5",
      to: "#e4e4e7",
      accent: "#4f46e5",
    },
    globalTheme: {
      presetId: "clean-slate",
      primaryColor: "#18181b",
      secondaryColor: "#71717a",
      accentColor: "#4f46e5",
      backgroundColor: "#fafafa",
      surfaceColor: "#ffffff",
      textColor: "#18181b",
      mutedTextColor: "#71717a",
      borderColor: "#e4e4e7",
      headingFont: "Space Grotesk",
      bodyFont: "Inter",
      fontSizeBase: "16px",
      radiusPreset: "md",
      shadowPreset: "subtle",
    },
    pages: [
      { path: "index.html", title: "Elena Rinjani — Portfolio", isEntry: true },
      { path: "case-study.html", title: "Studi Kasus: FinFlow App" },
    ],
    sections: [
      "Header Identitas Minimal",
      "Bio Editorial Hero",
      "Studi Kasus Terpilih",
      "Pengalaman Kerja & Riwayat",
      "Keahlian & Toolkit",
      "Rekomendasi Rekan Kerja",
      "Footer Personal",
    ],
    files: {
      "index.html": makeTextFile(
        `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Elena Rinjani — Product Designer</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="">
  <link rel="stylesheet" data-kanvas-fonts="" href="https://fonts.googleapis.com/css2?family=Space%20Grotesk:wght@600;700&family=Inter:wght@400;500;600&display=swap">
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <header class="port-header">
    <div class="container port-nav">
      <a href="index.html" class="port-name">ELENA RINJANI</a>
      <span class="status-tag">Bekerja di Jakarta · Terbuka untuk Advisor</span>
      <nav class="port-links">
        <a href="#karya">Karya</a>
        <a href="#pengalaman">Riwayat</a>
        <a href="case-study.html">Studi Kasus</a>
        <a href="mailto:elena@rinjani.design" class="btn btn-dark btn-sm">Kontak</a>
      </nav>
    </div>
  </header>

  <main>
    <section class="port-hero">
      <div class="container">
        <h1>Desainer Produk Digital yang Berfokus pada Kesederhanaan & Interaksi Manusiawi.</h1>
        <p class="port-bio">8 tahun merancang sistem desain dan antarmuka web/mobile untuk 10+ juta pengguna aktif harian di Asia Tenggara. Berpengalaman di bidang FinTech, EdTech, dan SaaS B2B.</p>
      </div>
    </section>

    <section class="port-works" id="karya">
      <div class="container">
        <h2 class="sub-title">Studi Kasus Terpilih</h2>
        <div class="case-grid">
          <article class="case-card">
            <div class="case-badge">FinTech · 2025</div>
            <h3>FinFlow — Redesain Pengalaman Transfer Uang Antar-Negara</h3>
            <p>Menyederhanakan alur transaksi remitansi multi-mata uang, menurunkan tingkat pembatalan transfer sebesar 42%.</p>
            <a href="case-study.html" class="case-link">Baca Studi Kasus Lengkap →</a>
          </article>
          <article class="case-card">
            <div class="case-badge">EdTech Platform · 2024</div>
            <h3>Kolektif Edukasi — Ruang Belajar Mandiri Interaktif</h3>
            <p>Membangun sistem desain terpadu dengan 120+ token komponen untuk platform kursus coding online.</p>
            <a href="case-study.html" class="case-link">Baca Studi Kasus Lengkap →</a>
          </article>
        </div>
      </div>
    </section>

    <section class="port-experience" id="pengalaman">
      <div class="container">
        <h2 class="sub-title">Riwayat Karir</h2>
        <div class="exp-list">
          <div class="exp-item">
            <span class="exp-year">2023 — Sekarang</span>
            <div class="exp-desc">
              <h4>Lead Product Designer · FinFlow Asia</h4>
              <p>Memimpin tim desain beranggotakan 6 desainer UI/UX dalam mengelola 3 pilar produk konsumen.</p>
            </div>
          </div>
          <div class="exp-item">
            <span class="exp-year">2020 — 2023</span>
            <div class="exp-desc">
              <h4>Senior UI/UX Specialist · Kolektif Tech</h4>
              <p>Merancang modul belajar interaktif dan memvalidasi prototipe langsung ke pengguna.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  </main>

  <footer class="port-footer">
    <div class="container footer-box">
      <p>© 2026 Elena Rinjani. Semua hak cipta dilindungi.</p>
      <div class="socials">
        <a href="#">LinkedIn</a>
        <a href="#">Twitter / X</a>
        <a href="#">GitHub</a>
      </div>
    </div>
  </footer>
</body>
</html>`,
        "index.html",
      ),
      "case-study.html": makeTextFile(
        `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Studi Kasus FinFlow — Elena Rinjani</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="">
  <link rel="stylesheet" data-kanvas-fonts="" href="https://fonts.googleapis.com/css2?family=Space%20Grotesk:wght@600;700&family=Inter:wght@400;500;600&display=swap">
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <header class="port-header">
    <div class="container port-nav">
      <a href="index.html" class="port-name">ELENA RINJANI</a>
      <nav class="port-links">
        <a href="index.html">← Kembali ke Beranda</a>
      </nav>
    </div>
  </header>

  <main style="padding: 64px 0;">
    <div class="container" style="max-width: 780px;">
      <span class="case-badge">Studi Kasus FinTech</span>
      <h1 style="font-family: var(--font-heading); font-size: 38px; margin: 12px 0 20px;">FinFlow: Mentransformasi Transaksi Lintas Batas</h1>
      <p style="color: var(--color-muted); font-size: 18px; line-height: 1.7; margin-bottom: 40px;">Proyek kolaborasi 6 bulan untuk mendesain ulang arsitektur informasi aplikasi pengiriman uang lintas negara.</p>

      <div style="background: #fff; border: 1px solid var(--color-border); padding: 32px; border-radius: var(--radius-md); margin-bottom: 32px;">
        <h3 style="font-family: var(--font-heading); margin-bottom: 12px;">Tantangan Utama</h3>
        <p style="color: var(--color-muted); font-size: 15px;">Pengguna sering kali bingung dengan fluktuasi kurs real-time dan biaya provisi tersembunyi, yang menyebabkan 42% transaksi dibatalkan sebelum pembayaran selesai.</p>
      </div>

      <div style="background: #fff; border: 1px solid var(--color-border); padding: 32px; border-radius: var(--radius-md);">
        <h3 style="font-family: var(--font-heading); margin-bottom: 12px;">Solusi Desain</h3>
        <p style="color: var(--color-muted); font-size: 15px;">Kami merancang antarmuka kalkulator transparan dengan jaminan penguncian kurs selama 15 menit, serta integrasi status transfer bergaya live-tracker.</p>
      </div>
    </div>
  </main>
</body>
</html>`,
        "case-study.html",
      ),
      "styles.css": makeTextFile(
        `/* --- KANVAS GLOBAL THEME --- */
:root {
  --color-primary: #18181b;
  --color-secondary: #71717a;
  --color-accent: #4f46e5;
  --color-bg: #fafafa;
  --color-surface: #ffffff;
  --color-text: #18181b;
  --color-muted: #71717a;
  --color-border: #e4e4e7;
  --font-heading: "Space Grotesk", sans-serif;
  --font-body: "Inter", system-ui, sans-serif;
  --radius-md: 8px;
}
/* --- END KANVAS GLOBAL THEME --- */

* { box-sizing: border-box; margin: 0; padding: 0; }
body { background: var(--color-bg); color: var(--color-text); font-family: var(--font-body); line-height: 1.6; }
.container { max-width: 960px; margin: 0 auto; padding: 0 24px; }

.port-header { border-bottom: 1px solid var(--color-border); background: #fff; position: sticky; top: 0; z-index: 30; }
.port-nav { display: flex; justify-content: space-between; align-items: center; height: 68px; }
.port-name { font-family: var(--font-heading); font-weight: 700; font-size: 15px; text-decoration: none; color: var(--color-text); letter-spacing: 0.05em; }
.status-tag { font-size: 12px; color: var(--color-muted); }
.port-links { display: flex; gap: 20px; align-items: center; }
.port-links a { text-decoration: none; color: var(--color-muted); font-size: 13px; font-weight: 500; }
.port-links a:hover { color: var(--color-text); }

.btn { display: inline-flex; align-items: center; padding: 8px 16px; border-radius: var(--radius-md); font-weight: 600; text-decoration: none; }
.btn-sm { padding: 6px 12px; font-size: 12px; }
.btn-dark { background: var(--color-primary); color: #fff; }

.port-hero { padding: 80px 0 60px; }
.port-hero h1 { font-family: var(--font-heading); font-size: clamp(28px, 4.5vw, 44px); line-height: 1.25; margin-bottom: 20px; font-weight: 700; }
.port-bio { font-size: 17px; color: var(--color-muted); max-width: 720px; }

.sub-title { font-family: var(--font-heading); font-size: 20px; margin-bottom: 24px; text-transform: uppercase; letter-spacing: 0.08em; }

.port-works { padding: 48px 0; }
.case-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 24px; }
.case-card { background: var(--color-surface); border: 1px solid var(--color-border); padding: 32px; border-radius: var(--radius-md); transition: transform 0.2s; }
.case-card:hover { transform: translateY(-3px); }
.case-badge { display: inline-block; font-size: 11px; font-weight: 600; color: var(--color-accent); margin-bottom: 10px; }
.case-card h3 { font-family: var(--font-heading); font-size: 20px; margin-bottom: 12px; line-height: 1.3; }
.case-card p { color: var(--color-muted); font-size: 14px; margin-bottom: 18px; }
.case-link { font-size: 13px; font-weight: 600; color: var(--color-primary); text-decoration: none; }

.port-experience { padding: 48px 0; }
.exp-list { display: flex; flex-direction: column; gap: 20px; }
.exp-item { display: flex; gap: 24px; padding: 20px; background: #fff; border: 1px solid var(--color-border); border-radius: var(--radius-md); flex-wrap: wrap; }
.exp-year { font-family: var(--font-heading); font-size: 13px; color: var(--color-muted); width: 130px; font-weight: 600; }
.exp-desc h4 { font-size: 15px; margin-bottom: 4px; }
.exp-desc p { color: var(--color-muted); font-size: 13px; }

.port-footer { border-top: 1px solid var(--color-border); padding: 32px 0; font-size: 13px; color: var(--color-muted); }
.footer-box { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px; }
.socials { display: flex; gap: 16px; }
.socials a { color: var(--color-muted); text-decoration: none; }

@media (max-width: 768px) {
  .status-tag { display: none; }
}
`,
        "styles.css",
      ),
    },
  },

  // 5. E-COMMERCE PRODUCT
  {
    id: "ecommerce-lumina",
    entry: "index.html",
    name: "Lumina Acoustic — Headphone Nirkabel Premium",
    category: "E-commerce",
    description: "Landing page produk e-commerce berestetika tinggi dengan ulasan pembeli bintang lima, spesifikasi akustik, dan alur checkout langsung.",
    featured: false,
    author: "Kanvas Official",
    createdAt: 1715000000000,
    updatedAt: 1715000000000,
    tags: ["E-commerce", "Product", "Audio", "Retail", "Landing"],
    thumbnailGradient: {
      from: "#78350f",
      to: "#451a03",
      accent: "#f59e0b",
    },
    globalTheme: {
      presetId: "warm-editorial",
      primaryColor: "#d97706",
      secondaryColor: "#78350f",
      accentColor: "#f59e0b",
      backgroundColor: "#ffffff",
      surfaceColor: "#fefce8",
      textColor: "#1c1917",
      mutedTextColor: "#78716c",
      borderColor: "#e7e5e4",
      headingFont: "Plus Jakarta Sans",
      bodyFont: "Inter",
      fontSizeBase: "16px",
      radiusPreset: "md",
      shadowPreset: "medium",
    },
    pages: [
      { path: "index.html", title: "Lumina Acoustic — Studio Sound", isEntry: true },
      { path: "specs.html", title: "Spesifikasi Teknis & Garansi" },
    ],
    sections: [
      "Bar Pengumuman Penjualan",
      "Navigasi Keranjang Belanja",
      "Hero Showcase Produk Utama",
      "Teknologi Driver Akustik",
      "Matriks Fitur & Peredam Kebisingan",
      "Ulasan Bintang 5 Pembeli",
      "Garansi & Pengiriman Bebas Biaya",
      "Footer E-commerce",
    ],
    files: {
      "index.html": makeTextFile(
        `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Lumina Acoustic One — Kemurnian Suara Tanpa Kompromi</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="">
  <link rel="stylesheet" data-kanvas-fonts="" href="https://fonts.googleapis.com/css2?family=Plus%20Jakarta%20Sans:wght@600;700;800&family=Inter:wght@400;500;600&display=swap">
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <div class="sale-banner">⚡ Pengiriman Bebas Biaya Seluruh Indonesia + Garansi Tukar Baru 2 Tahun</div>

  <header class="shop-header">
    <div class="container shop-nav">
      <a href="index.html" class="shop-logo">LUMINA ACOUSTIC</a>
      <nav class="shop-links">
        <a href="#fitur">Keunggulan</a>
        <a href="specs.html">Spesifikasi</a>
        <a href="#ulasan">Ulasan</a>
        <a href="specs.html" class="btn btn-primary btn-sm">Beli — Rp 2.899.000</a>
      </nav>
    </div>
  </header>

  <main>
    <section class="prod-hero">
      <div class="container prod-hero-grid">
        <div class="hero-left">
          <span class="badge">Edisi Flagship 2026</span>
          <h1>Dengarkan Musik Sebagaimana Sang Seniman Menciptakannya.</h1>
          <p>Driver kustom 45mm Titanium-composite, Active Noise Cancellation adaptif generasi 3, dan daya tahan baterai hingga 50 jam tanpa jeda pengisian.</p>
          <div class="price-row">
            <span class="current-price">Rp 2.899.000</span>
            <span class="old-price">Rp 3.499.000</span>
            <span class="discount-pill">Hemat 17%</span>
          </div>
          <div class="hero-btns">
            <a href="specs.html" class="btn btn-primary btn-lg">Pesan Sekarang</a>
            <a href="specs.html" class="btn btn-outline btn-lg">Spesifikasi Lengkap</a>
          </div>
        </div>
        <div class="hero-right">
          <div class="product-visual">
            <div class="visual-circle"></div>
            <div class="product-badge">🎵 50 Jam Baterai</div>
          </div>
        </div>
      </div>
    </section>

    <section class="tech-specs" id="fitur">
      <div class="container">
        <div class="section-title">
          <h2>Teknologi Akustik Terdepan</h2>
          <p>Direkayasa dengan material kelas dirgantara untuk kenyamanan mendengar berjam-jam.</p>
        </div>
        <div class="spec-cards">
          <div class="spec-card">
            <h3>Peredam Suara Hybrid ANC</h3>
            <p>4 mikrofon array memblokir 98.7% kebisingan frekuensi rendah seperti kabin pesawat dan suara lalu lintas jalan raya.</p>
          </div>
          <div class="spec-card">
            <h3>Dukungan Audio Hi-Res LDAC</h3>
            <p>Streaming resolusi audio nirkabel hingga 990 kbps untuk detail vokal dan instrumen yang luar biasa bening.</p>
          </div>
          <div class="spec-card">
            <h3>Bantalan Memory Foam Alcantara</h3>
            <p>Tekanan seimbang pada telinga tanpa rasa panas, didesain untuk penggunaan maraton harian.</p>
          </div>
        </div>
      </div>
    </section>

    <section class="reviews-section" id="ulasan">
      <div class="container">
        <div class="section-title">
          <h2>Kata Mereka yang Telah Mencobanya</h2>
        </div>
        <div class="review-grid">
          <div class="review-card">
            <div class="stars">★★★★★</div>
            <p class="review-text">"Kualitas soundstage-nya benar-benar di luar ekspektasi saya. Bass rapat tanpa menenggelamkan artikulasi vokal."</p>
            <span class="reviewer">— Aris Munandar, Audio Engineer</span>
          </div>
          <div class="review-card">
            <div class="stars">★★★★★</div>
            <p class="review-text">"Sangat nyaman dipakai meeting zoom berjam-jam. ANC-nya membuat saya bisa fokus bekerja di coffee shop yang ramai."</p>
            <span class="reviewer">— Clarissa T., Product Manager</span>
          </div>
        </div>
      </div>
    </section>
  </main>

  <footer class="shop-footer">
    <div class="container footer-flex">
      <span>LUMINA AUDIO INDONESIA</span>
      <span>Garansi Resmi 2 Tahun Distribusi Nasional</span>
    </div>
  </footer>
</body>
</html>`,
        "index.html",
      ),
      "specs.html": makeTextFile(
        `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Spesifikasi Teknis — Lumina Acoustic One</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="">
  <link rel="stylesheet" data-kanvas-fonts="" href="https://fonts.googleapis.com/css2?family=Plus%20Jakarta%20Sans:wght@600;700;800&family=Inter:wght@400;500;600&display=swap">
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <header class="shop-header">
    <div class="container shop-nav">
      <a href="index.html" class="shop-logo">LUMINA ACOUSTIC</a>
      <nav class="shop-links">
        <a href="index.html">← Kembali ke Produk</a>
        <a href="index.html" class="btn btn-primary btn-sm">Beli Sekarang</a>
      </nav>
    </div>
  </header>

  <main style="padding: 64px 0;">
    <div class="container" style="max-width: 800px;">
      <h1 style="font-family: var(--font-heading); font-size: 34px; margin-bottom: 24px;">Lembar Spesifikasi Teknis</h1>

      <table style="width: 100%; border-collapse: collapse; background: #fff; border: 1px solid var(--color-border); border-radius: var(--radius-md); overflow: hidden;">
        <tbody>
          <tr style="border-bottom: 1px solid var(--color-border);"><td style="padding: 16px; font-weight: 600; width: 35%;">Diameter Driver</td><td style="padding: 16px; color: var(--color-muted);">45mm Titanium-Bio Compound</td></tr>
          <tr style="border-bottom: 1px solid var(--color-border);"><td style="padding: 16px; font-weight: 600;">Respon Frekuensi</td><td style="padding: 16px; color: var(--color-muted);">10 Hz — 40.000 Hz (Hi-Res Certified)</td></tr>
          <tr style="border-bottom: 1px solid var(--color-border);"><td style="padding: 16px; font-weight: 600;">Konektivitas</td><td style="padding: 16px; color: var(--color-muted);">Bluetooth 5.3 + Kabel 3.5mm Analog Audio</td></tr>
          <tr style="border-bottom: 1px solid var(--color-border);"><td style="padding: 16px; font-weight: 600;">Daya Tahan Baterai</td><td style="padding: 16px; color: var(--color-muted);">50 Jam (ANC On) / 70 Jam (ANC Off)</td></tr>
          <tr style="border-bottom: 1px solid var(--color-border);"><td style="padding: 16px; font-weight: 600;">Waktu Pengisian</td><td style="padding: 16px; color: var(--color-muted);">Fast Charge 10 Menit untuk 6 Jam Putar</td></tr>
          <tr><td style="padding: 16px; font-weight: 600;">Berat Perangkat</td><td style="padding: 16px; color: var(--color-muted);">248 gram (Ultra-lightweight)</td></tr>
        </tbody>
      </table>
    </div>
  </main>
</body>
</html>`,
        "specs.html",
      ),
      "styles.css": makeTextFile(
        `/* --- KANVAS GLOBAL THEME --- */
:root {
  --color-primary: #d97706;
  --color-secondary: #78350f;
  --color-accent: #f59e0b;
  --color-bg: #ffffff;
  --color-surface: #fefce8;
  --color-text: #1c1917;
  --color-muted: #78716c;
  --color-border: #e7e5e4;
  --font-heading: "Plus Jakarta Sans", system-ui, sans-serif;
  --font-body: "Inter", system-ui, sans-serif;
  --radius-md: 10px;
  --radius-lg: 16px;
}
/* --- END KANVAS GLOBAL THEME --- */

* { box-sizing: border-box; margin: 0; padding: 0; }
body { background: var(--color-bg); color: var(--color-text); font-family: var(--font-body); line-height: 1.6; }
.container { max-width: 1140px; margin: 0 auto; padding: 0 24px; }

.sale-banner { background: #1c1917; color: #fef08a; text-align: center; padding: 8px 12px; font-size: 12px; font-weight: 600; }
.shop-header { border-bottom: 1px solid var(--color-border); background: #fff; position: sticky; top: 0; z-index: 30; }
.shop-nav { display: flex; justify-content: space-between; align-items: center; height: 72px; }
.shop-logo { font-family: var(--font-heading); font-weight: 800; text-decoration: none; color: var(--color-text); font-size: 18px; letter-spacing: 0.05em; }
.shop-links { display: flex; gap: 20px; align-items: center; }
.shop-links a { color: var(--color-muted); text-decoration: none; font-size: 14px; font-weight: 500; }
.shop-links a:hover { color: var(--color-primary); }

.btn { display: inline-flex; align-items: center; justify-content: center; padding: 10px 22px; border-radius: var(--radius-md); font-weight: 600; text-decoration: none; cursor: pointer; }
.btn-sm { padding: 6px 14px; font-size: 13px; }
.btn-lg { padding: 12px 28px; font-size: 15px; }
.btn-primary { background: var(--color-primary); color: #fff; border: 1px solid var(--color-primary); }
.btn-outline { background: transparent; border: 1px solid var(--color-border); color: var(--color-text); }

.prod-hero { padding: 72px 0; }
.prod-hero-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 48px; align-items: center; }
.badge { display: inline-block; padding: 4px 12px; background: #fef3c7; color: #92400e; border-radius: 999px; font-size: 12px; font-weight: 600; margin-bottom: 12px; }
.hero-left h1 { font-family: var(--font-heading); font-size: clamp(32px, 4.5vw, 48px); line-height: 1.18; margin-bottom: 18px; }
.hero-left p { color: var(--color-muted); font-size: 16px; margin-bottom: 24px; }
.price-row { display: flex; align-items: baseline; gap: 12px; margin-bottom: 28px; }
.current-price { font-size: 32px; font-weight: 800; font-family: var(--font-heading); color: var(--color-text); }
.old-price { font-size: 18px; text-decoration: line-through; color: var(--color-muted); }
.discount-pill { background: #fee2e2; color: #b91c1c; font-size: 12px; font-weight: 700; padding: 2px 8px; border-radius: 4px; }
.hero-btns { display: flex; gap: 12px; flex-wrap: wrap; }

.product-visual { height: 360px; background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border-radius: var(--radius-lg); display: flex; align-items: center; justify-content: center; position: relative; }
.visual-circle { width: 180px; height: 180px; border-radius: 50%; background: #d97706; opacity: 0.2; }
.product-badge { position: absolute; bottom: 20px; right: 20px; background: #fff; padding: 8px 16px; border-radius: 999px; font-size: 12px; font-weight: 700; box-shadow: 0 4px 12px rgba(0,0,0,0.08); }

.tech-specs { padding: 64px 0; background: var(--color-surface); }
.section-title { text-align: center; max-width: 600px; margin: 0 auto 48px; }
.section-title h2 { font-family: var(--font-heading); font-size: 32px; margin-bottom: 10px; }
.section-title p { color: var(--color-muted); font-size: 15px; }
.spec-cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 24px; }
.spec-card { background: #fff; padding: 28px; border-radius: var(--radius-md); border: 1px solid var(--color-border); }
.spec-card h3 { font-size: 18px; margin-bottom: 8px; }
.spec-card p { color: var(--color-muted); font-size: 14px; }

.reviews-section { padding: 64px 0; }
.review-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 24px; max-width: 860px; margin: 0 auto; }
.review-card { background: var(--color-surface); padding: 28px; border-radius: var(--radius-md); border: 1px solid var(--color-border); }
.stars { color: #f59e0b; margin-bottom: 12px; font-size: 18px; }
.review-text { font-size: 15px; margin-bottom: 16px; font-style: italic; }
.reviewer { font-size: 13px; font-weight: 600; color: var(--color-muted); display: block; }

.shop-footer { border-top: 1px solid var(--color-border); padding: 32px 0; font-size: 13px; color: var(--color-muted); }
.footer-flex { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px; }

@media (max-width: 768px) {
  .shop-links { display: none; }
}
`,
        "styles.css",
      ),
    },
  },

  // 6. STARTUP
  {
    id: "startup-nexus",
    entry: "index.html",
    name: "Nexus Flow — Otomatisasi Alur Kerja Tim AI",
    category: "Startup",
    description: "Landing page startup dinamis dengan pendaftaran akses awal (waitlist), komparasi sebelum-sesudah alur kerja, dan testimoni pengguna awal.",
    featured: false,
    author: "Kanvas Official",
    createdAt: 1715000000000,
    updatedAt: 1715000000000,
    tags: ["Startup", "Automation", "Workflow", "Waitlist", "Modern"],
    thumbnailGradient: {
      from: "#065f46",
      to: "#022c22",
      accent: "#10b981",
    },
    globalTheme: {
      presetId: "emerald-growth",
      primaryColor: "#059669",
      secondaryColor: "#047857",
      accentColor: "#10b981",
      backgroundColor: "#ffffff",
      surfaceColor: "#f0fdf4",
      textColor: "#064e3b",
      mutedTextColor: "#047857",
      borderColor: "#d1fae5",
      headingFont: "Plus Jakarta Sans",
      bodyFont: "Inter",
      fontSizeBase: "16px",
      radiusPreset: "md",
      shadowPreset: "medium",
    },
    pages: [
      { path: "index.html", title: "Nexus Flow — Workspace Otomasi", isEntry: true },
      { path: "features.html", title: "Fitur Mendalam & Integrasi" },
    ],
    sections: [
      "Navigasi Startup Akses Awal",
      "Hero Waitlist Dinamis",
      "Investor & Pendukung Ticker",
      "Perbandingan Before/After",
      "4 Pilar Fitur Inti",
      "Testimoni Early Adopter",
      "Roadmap Milestone",
      "Footer Startup",
    ],
    files: {
      "index.html": makeTextFile(
        `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Nexus Flow — Otomatisasi Pekerjaan Berulang Tim Anda</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="">
  <link rel="stylesheet" data-kanvas-fonts="" href="https://fonts.googleapis.com/css2?family=Plus%20Jakarta%20Sans:wght@700;800&family=Inter:wght@400;500;600&display=swap">
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <header class="su-header">
    <div class="container su-nav">
      <a href="index.html" class="su-logo">NEXUS FLOW</a>
      <nav class="su-links">
        <a href="#fitur">Fitur</a>
        <a href="features.html">Integrasi</a>
        <a href="#waitlist" class="btn btn-emerald btn-sm">Gabung Waitlist</a>
      </nav>
    </div>
  </header>

  <main>
    <section class="su-hero" id="waitlist">
      <div class="container">
        <span class="beta-badge">🚀 Private Beta — 2.400+ Tim Bergabung</span>
        <h1>Otomatiskan Pekerjaan Manual Membosankan dengan Satu Prompt Alur Kerja.</h1>
        <p class="su-desc">Nexus Flow menghubungkan spreadsheet, chat Slack, email, dan CRM Anda ke dalam sistem kerja cerdas yang berjalan 24/7 tanpa henti.</p>

        <form class="waitlist-form" onsubmit="return false;">
          <input type="email" placeholder="Masukkan email kerja Anda (nama@perusahaan.com)" required>
          <button type="submit" class="btn btn-emerald">Dapatkan Akses Awal</button>
        </form>
      </div>
    </section>

    <section class="compare-section" id="fitur">
      <div class="container">
        <div class="section-center">
          <h2>Cara Lama vs Nexus Flow</h2>
          <p>Tingkatkan produktivitas tim Anda hingga 5x lipat.</p>
        </div>
        <div class="compare-grid">
          <div class="compare-card old-way">
            <h3>❌ Cara Konvensional</h3>
            <ul>
              <li>Salin-tempel data manual antar tab browser</li>
              <li>Lupa follow-up prospek klien potensial</li>
              <li>Menghabiskan 3 jam per hari hanya untuk sinkronisasi</li>
            </ul>
          </div>
          <div class="compare-card new-way">
            <h3>✨ Dengan Nexus Flow</h3>
            <ul>
              <li>Ekstraksi dan validasi data instan via AI agent</li>
              <li>Otomasi pesan pengingat sesuai perilaku pengguna</li>
              <li>Fokus pada strategi inti tanpa pusing urusan repetitif</li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  </main>

  <footer class="su-footer">
    <div class="container footer-center">
      <p>© 2026 Nexus Flow Inc. Didukung oleh inkubator startup terkemuka.</p>
    </div>
  </footer>
</body>
</html>`,
        "index.html",
      ),
      "features.html": makeTextFile(
        `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Integrasi & Fitur — Nexus Flow</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="">
  <link rel="stylesheet" data-kanvas-fonts="" href="https://fonts.googleapis.com/css2?family=Plus%20Jakarta%20Sans:wght@700;800&family=Inter:wght@400;500;600&display=swap">
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <header class="su-header">
    <div class="container su-nav">
      <a href="index.html" class="su-logo">NEXUS FLOW</a>
      <nav class="su-links">
        <a href="index.html">← Beranda</a>
        <a href="index.html#waitlist" class="btn btn-emerald btn-sm">Daftar Beta</a>
      </nav>
    </div>
  </header>

  <main style="padding: 64px 0;">
    <div class="container">
      <div class="section-center">
        <h1>Terintegrasi dengan Seluruh Alat Kerja Anda</h1>
        <p>Hubungkan aplikasi favorit Anda tanpa perlu menulis satu baris kode pemrograman pun.</p>
      </div>

      <div class="compare-grid" style="margin-top: 48px;">
        <div class="compare-card new-way">
          <h3>Slack & Discord Bot</h3>
          <p>Terima ringkasan notifikasi penting dan jalankan aksi langsung dari ruang obrolan kerja tim Anda.</p>
        </div>
        <div class="compare-card new-way">
          <h3>Google Workspace & Notion</h3>
          <p>Sinkronisasi dokumen otomatis dua arah saat ada perubahan status proyek.</p>
        </div>
      </div>
    </div>
  </main>
</body>
</html>`,
        "features.html",
      ),
      "styles.css": makeTextFile(
        `/* --- KANVAS GLOBAL THEME --- */
:root {
  --color-primary: #059669;
  --color-secondary: #047857;
  --color-accent: #10b981;
  --color-bg: #ffffff;
  --color-surface: #f0fdf4;
  --color-text: #064e3b;
  --color-muted: #047857;
  --color-border: #d1fae5;
  --font-heading: "Plus Jakarta Sans", sans-serif;
  --font-body: "Inter", sans-serif;
  --radius-md: 8px;
  --radius-lg: 16px;
}
/* --- END KANVAS GLOBAL THEME --- */

* { box-sizing: border-box; margin: 0; padding: 0; }
body { background: var(--color-bg); color: var(--color-text); font-family: var(--font-body); line-height: 1.6; }
.container { max-width: 1040px; margin: 0 auto; padding: 0 24px; }

.su-header { border-bottom: 1px solid var(--color-border); background: #fff; position: sticky; top: 0; z-index: 30; }
.su-nav { display: flex; justify-content: space-between; align-items: center; height: 68px; }
.su-logo { font-family: var(--font-heading); font-weight: 800; font-size: 18px; text-decoration: none; color: var(--color-primary); letter-spacing: 0.05em; }
.su-links { display: flex; gap: 20px; align-items: center; }
.su-links a { color: var(--color-muted); text-decoration: none; font-size: 14px; }

.btn { display: inline-flex; align-items: center; justify-content: center; padding: 10px 20px; border-radius: var(--radius-md); font-weight: 600; text-decoration: none; border: none; cursor: pointer; }
.btn-sm { padding: 6px 14px; font-size: 12px; }
.btn-emerald { background: var(--color-primary); color: #fff; }

.su-hero { padding: 80px 0 64px; text-align: center; background: radial-gradient(circle at 50% 10%, #ecfdf5 0%, transparent 70%); }
.beta-badge { display: inline-block; padding: 6px 16px; background: #d1fae5; color: #065f46; border-radius: 999px; font-size: 13px; font-weight: 600; margin-bottom: 20px; }
.su-hero h1 { font-family: var(--font-heading); font-size: clamp(30px, 4.5vw, 48px); line-height: 1.2; max-width: 860px; margin: 0 auto 20px; }
.su-desc { font-size: 17px; color: var(--color-muted); max-width: 680px; margin: 0 auto 36px; }

.waitlist-form { display: flex; gap: 8px; justify-content: center; max-width: 520px; margin: 0 auto; flex-wrap: wrap; }
.waitlist-form input { flex: 1; min-width: 260px; padding: 12px 16px; border: 1px solid var(--color-border); border-radius: var(--radius-md); font-size: 14px; outline: none; }
.waitlist-form input:focus { border-color: var(--color-primary); }

.compare-section { padding: 64px 0; }
.section-center { text-align: center; max-width: 600px; margin: 0 auto 40px; }
.section-center h2, .section-center h1 { font-family: var(--font-heading); font-size: 30px; margin-bottom: 8px; }
.compare-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 24px; }
.compare-card { padding: 32px; border-radius: var(--radius-lg); border: 1px solid var(--color-border); }
.compare-card.old-way { background: #fef2f2; border-color: #fecaca; }
.compare-card.new-way { background: var(--color-surface); border-color: var(--color-border); }
.compare-card h3 { font-family: var(--font-heading); font-size: 18px; margin-bottom: 16px; }
.compare-card ul { list-style: none; }
.compare-card li { padding: 8px 0; font-size: 14px; }

.su-footer { border-top: 1px solid var(--color-border); padding: 32px 0; font-size: 13px; color: var(--color-muted); }
.footer-center { text-align: center; }

@media (max-width: 768px) {
  .su-links { display: none; }
}
`,
        "styles.css",
      ),
    },
  },

  // 7. MODERN BLOG / EDITORIAL
  {
    id: "blog-chronicle",
    entry: "index.html",
    name: "The Chronicle — Majalah Desain & Budaya Web",
    category: "Blog",
    description: "Template publikasi editorial dan blog modern dengan tajuk majalah elegan, grid artikel terkurasi, dan form buletin berkala.",
    featured: false,
    author: "Kanvas Official",
    createdAt: 1715000000000,
    updatedAt: 1715000000000,
    tags: ["Blog", "Editorial", "Magazine", "Typography", "Content"],
    thumbnailGradient: {
      from: "#1e1e24",
      to: "#0e0e11",
      accent: "#f59e0b",
    },
    globalTheme: {
      presetId: "warm-editorial",
      primaryColor: "#0f172a",
      secondaryColor: "#854d0e",
      accentColor: "#f59e0b",
      backgroundColor: "#fffdfa",
      surfaceColor: "#ffffff",
      textColor: "#1c1917",
      mutedTextColor: "#78716c",
      borderColor: "#e7e5e4",
      headingFont: "Lora",
      bodyFont: "Inter",
      fontSizeBase: "16px",
      radiusPreset: "md",
      shadowPreset: "subtle",
    },
    pages: [
      { path: "index.html", title: "The Chronicle — Edisi Terbaru", isEntry: true },
      { path: "article.html", title: "Artikel: Masa Depan Tipografi Web" },
    ],
    sections: [
      "Masthead Majalah & Tanggal Edisi",
      "Navigasi Kategori Editorial",
      "Tajuk Utama (Lead Story)",
      "Grid Artikel Terkurasi",
      "Kotak Berlangganan Buletin",
      "Catatan Redaksi",
      "Footer Editorial & Arsip",
    ],
    files: {
      "index.html": makeTextFile(
        `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>The Chronicle — Jurnal Desain & Budaya Digital</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="">
  <link rel="stylesheet" data-kanvas-fonts="" href="https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,600;0,700;1,400&family=Inter:wght@400;500;600&display=swap">
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <header class="blog-header">
    <div class="container top-masthead">
      <span>Edisi 48 · Musim Semi 2026</span>
      <span class="center-tag">JURNAL DESAIN & REKAYASA DIGITAL</span>
      <span>Jakarta, Indonesia</span>
    </div>
    <div class="container main-masthead">
      <a href="index.html" class="blog-title">THE CHRONICLE</a>
    </div>
    <div class="container sub-nav">
      <a href="index.html" class="active">Terbaru</a>
      <a href="article.html">Tipografi</a>
      <a href="article.html">Arsitektur Web</a>
      <a href="article.html">Opini</a>
      <a href="article.html">Karier</a>
    </div>
  </header>

  <main>
    <section class="lead-story-section">
      <div class="container">
        <article class="lead-card">
          <div class="lead-cat">ESAI UTAMA · 8 MENIT BACA</div>
          <h1><a href="article.html">Masa Depan Tipografi Web di Era Antarmuka Adaptif Generasi Baru</a></h1>
          <p class="lead-excerpt">Bagaimana perkembangan variable fonts dan model layout kontemporer mengubah cara manusia mencerna informasi panjang di layar digital.</p>
          <div class="author-meta">Oleh <strong>Raditya Wibowo</strong> — Editor Senior</div>
        </article>
      </div>
    </section>

    <section class="articles-grid-section">
      <div class="container">
        <h2 class="section-rule"><span>Artikel Terkurasi</span></h2>
        <div class="blog-grid">
          <article class="blog-card">
            <span class="post-cat">Rekayasa Web</span>
            <h3><a href="article.html">Mengapa Kami Berhenti Menggunakan Framework Berat untuk Landing Page</a></h3>
            <p>Evolusi HTML statis modern membuktikan performa kilat mampu meningkatkan engagement pengguna hingga 3x lipat.</p>
          </article>
          <article class="blog-card">
            <span class="post-cat">Filosofi Desain</span>
            <h3><a href="article.html">Etika Aksesibilitas: Desain Inklusif Bukan Sekadar Ceklis Kepatuhan</a></h3>
            <p>Membangun empati nyata dalam hierarki visual dan navigasi pembaca layar.</p>
          </article>
        </div>
      </div>
    </section>

    <section class="newsletter-section">
      <div class="container newsletter-box">
        <h3>Dapatkan Buletin Mingguan The Chronicle</h3>
        <p>Curahan gagasan desain terbaik langsung ke kotak masuk surel Anda setiap hari Jumat.</p>
        <form class="news-form" onsubmit="return false;">
          <input type="email" placeholder="nama@email.com" required>
          <button type="submit" class="btn btn-dark">Berlangganan</button>
        </form>
      </div>
    </section>
  </main>

  <footer class="blog-footer">
    <div class="container footer-row">
      <p>© 2026 The Chronicle Media. Diterbitkan untuk komunitas kreatif nusantara.</p>
    </div>
  </footer>
</body>
</html>`,
        "index.html",
      ),
      "article.html": makeTextFile(
        `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Masa Depan Tipografi Web — The Chronicle</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="">
  <link rel="stylesheet" data-kanvas-fonts="" href="https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,600;0,700;1,400&family=Inter:wght@400;500;600&display=swap">
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <header class="blog-header">
    <div class="container main-masthead" style="padding: 16px 0;">
      <a href="index.html" class="blog-title" style="font-size: 32px;">THE CHRONICLE</a>
    </div>
    <div class="container sub-nav">
      <a href="index.html">← Kembali ke Edisi Terbaru</a>
    </div>
  </header>

  <main style="padding: 64px 0;">
    <article class="container" style="max-width: 720px;">
      <span class="lead-cat">Tipografi & Desain · 13 Mei 2026</span>
      <h1 style="font-family: var(--font-heading); font-size: 38px; line-height: 1.25; margin: 12px 0 24px;">Masa Depan Tipografi Web di Era Antarmuka Adaptif Generasi Baru</h1>
      <div class="author-meta" style="margin-bottom: 32px;">Oleh <strong>Raditya Wibowo</strong> · 8 Menit Membaca</div>

      <div style="font-size: 17px; line-height: 1.8; color: #292524;">
        <p style="margin-bottom: 20px;">Huruf bukan sekadar pembungkus kata; ia adalah arsitektur pikiran manusia yang diwujudkan secara visual. Ketika resolusi layar semakin tinggi dan variasi perangkat semakin masif, tipografi digital menghadapi tantangan baru untuk tetap mempertahankan keindahan dan keterbacaannya.</p>

        <blockquote style="border-left: 3px solid var(--color-primary); padding-left: 20px; font-style: italic; margin: 32px 0; color: #57534e;">
          "Sebuah tipografi yang baik adalah suara tenang di tengah hiruk-pikuk konten internet."
        </blockquote>

        <p style="margin-bottom: 20px;">Penggunaan variable fonts memungkinkan desainer mengatur bobot (weight), optical sizing, dan kemiringan (slant) secara kontinu dalam ukuran file yang sangat hemat, menghadirkan nuansa editorial cetak ke dalam browser.</p>
      </div>
    </article>
  </main>
</body>
</html>`,
        "article.html",
      ),
      "styles.css": makeTextFile(
        `/* --- KANVAS GLOBAL THEME --- */
:root {
  --color-primary: #0f172a;
  --color-secondary: #854d0e;
  --color-accent: #f59e0b;
  --color-bg: #fffdfa;
  --color-surface: #ffffff;
  --color-text: #1c1917;
  --color-muted: #78716c;
  --color-border: #e7e5e4;
  --font-heading: "Lora", Georgia, serif;
  --font-body: "Inter", system-ui, sans-serif;
  --radius-md: 4px;
}
/* --- END KANVAS GLOBAL THEME --- */

* { box-sizing: border-box; margin: 0; padding: 0; }
body { background: var(--color-bg); color: var(--color-text); font-family: var(--font-body); line-height: 1.6; }
.container { max-width: 1040px; margin: 0 auto; padding: 0 20px; }

.blog-header { border-bottom: 2px solid #1c1917; }
.top-masthead { display: flex; justify-content: space-between; font-size: 11px; text-transform: uppercase; color: var(--color-muted); padding: 8px 0; border-bottom: 1px solid var(--color-border); }
.main-masthead { text-align: center; padding: 32px 0 24px; }
.blog-title { font-family: var(--font-heading); font-size: clamp(38px, 6vw, 68px); font-weight: 700; letter-spacing: -0.02em; color: #1c1917; text-decoration: none; }
.sub-nav { display: flex; justify-content: center; gap: 28px; padding: 12px 0; font-size: 13px; text-transform: uppercase; font-weight: 600; letter-spacing: 0.05em; }
.sub-nav a { text-decoration: none; color: var(--color-muted); }
.sub-nav a:hover, .sub-nav a.active { color: #1c1917; }

.lead-story-section { padding: 48px 0; border-bottom: 1px solid var(--color-border); }
.lead-card { max-width: 840px; margin: 0 auto; text-align: center; }
.lead-cat { font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em; color: var(--color-secondary); font-weight: 700; margin-bottom: 12px; }
.lead-card h1 { font-family: var(--font-heading); font-size: clamp(28px, 4.5vw, 44px); line-height: 1.25; margin-bottom: 18px; }
.lead-card h1 a { color: #1c1917; text-decoration: none; }
.lead-excerpt { font-size: 18px; color: var(--color-muted); line-height: 1.7; margin-bottom: 20px; }
.author-meta { font-size: 13px; color: var(--color-muted); }

.articles-grid-section { padding: 48px 0; }
.section-rule { text-align: center; border-bottom: 1px solid var(--color-border); line-height: 0.1em; margin: 20px 0 36px; }
.section-rule span { background: var(--color-bg); padding: 0 16px; font-family: var(--font-heading); font-size: 18px; font-style: italic; }
.blog-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 32px; }
.blog-card { padding: 24px; background: #fff; border: 1px solid var(--color-border); }
.post-cat { font-size: 11px; text-transform: uppercase; color: var(--color-secondary); font-weight: 700; display: block; margin-bottom: 8px; }
.blog-card h3 { font-family: var(--font-heading); font-size: 20px; line-height: 1.35; margin-bottom: 10px; }
.blog-card h3 a { color: #1c1917; text-decoration: none; }
.blog-card p { color: var(--color-muted); font-size: 14px; }

.newsletter-section { padding: 64px 0; }
.newsletter-box { background: #f5f5f4; border: 1px solid var(--color-border); padding: 40px; text-align: center; max-width: 680px; margin: 0 auto; }
.newsletter-box h3 { font-family: var(--font-heading); font-size: 24px; margin-bottom: 8px; }
.newsletter-box p { color: var(--color-muted); font-size: 14px; margin-bottom: 20px; }
.news-form { display: flex; gap: 8px; justify-content: center; max-width: 440px; margin: 0 auto; flex-wrap: wrap; }
.news-form input { flex: 1; min-width: 200px; padding: 10px 14px; border: 1px solid var(--color-border); font-size: 14px; }
.btn-dark { background: #1c1917; color: #fff; border: none; padding: 10px 18px; font-weight: 600; cursor: pointer; }

.blog-footer { border-top: 1px solid var(--color-border); padding: 24px 0; font-size: 12px; color: var(--color-muted); text-align: center; }

@media (max-width: 768px) {
  .sub-nav { display: none; }
  .center-tag { display: none; }
}
`,
        "styles.css",
      ),
    },
  },

  // 8. CREATIVE STUDIO
  {
    id: "creative-atelier",
    entry: "index.html",
    name: "Atelier Monolit — Studio Arsitektur & Desain Ruang",
    category: "Creative",
    description: "Website studio arsitektur kontemporer dengan tata letak visual luas, galeri proyek interior & eksterior, serta filosofi ruang berkelanjutan.",
    featured: false,
    author: "Kanvas Official",
    createdAt: 1715000000000,
    updatedAt: 1715000000000,
    tags: ["Creative", "Architecture", "Minimalist", "Space", "Studio"],
    thumbnailGradient: {
      from: "#18181b",
      to: "#09090b",
      accent: "#e4e4e7",
    },
    globalTheme: {
      presetId: "dark-tech",
      primaryColor: "#f4f4f5",
      secondaryColor: "#71717a",
      accentColor: "#a1a1aa",
      backgroundColor: "#0c0c0e",
      surfaceColor: "#18181b",
      textColor: "#f4f4f5",
      mutedTextColor: "#a1a1aa",
      borderColor: "#27272a",
      headingFont: "Space Grotesk",
      bodyFont: "Inter",
      fontSizeBase: "16px",
      radiusPreset: "md",
      shadowPreset: "medium",
    },
    pages: [
      { path: "index.html", title: "Atelier Monolit — Beranda Arsitektur", isEntry: true },
      { path: "gallery.html", title: "Galeri Proyek Terpilih" },
    ],
    sections: [
      "Navigasi Spasial Minimal",
      "Hero Arsitektur Sinematik",
      "Galeri Proyek Residensial & Komersial",
      "Manifes Filosofi Ruang",
      "Daftar Penghargaan Arsitektur",
      "Konsultasi Ruang CTA",
      "Footer Studio",
    ],
    files: {
      "index.html": makeTextFile(
        `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Atelier Monolit — Arsitektur & Ruang Berkelanjutan</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="">
  <link rel="stylesheet" data-kanvas-fonts="" href="https://fonts.googleapis.com/css2?family=Space%20Grotesk:wght@500;600;700&family=Inter:wght@400;500&display=swap">
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <header class="arch-header">
    <div class="container arch-nav">
      <a href="index.html" class="arch-logo">ATELIER MONOLIT</a>
      <span class="coord-tag">6°12'S · 106°49'E</span>
      <nav class="arch-links">
        <a href="index.html">Ruang</a>
        <a href="gallery.html">Galeri</a>
        <a href="#filosofi">Filosofi</a>
        <a href="#kontak" class="btn btn-outline btn-sm">Inkuiri Desain</a>
      </nav>
    </div>
  </header>

  <main>
    <section class="arch-hero">
      <div class="container">
        <span class="arch-badge">Praktik Arsitektur Kontemporer</span>
        <h1>Mengharmoniskan Material Alami, Cahaya Tropis, dan Kesederhanaan Spasial.</h1>
        <p class="hero-desc">Setiap garis struktur dirancang untuk merespons iklim tropis, mereduksi jejak karbon, dan menciptakan kedamaian bagi penghuninya.</p>
      </div>
    </section>

    <section class="gallery-preview">
      <div class="container">
        <div class="gallery-grid">
          <div class="arch-card">
            <div class="arch-img" style="background: linear-gradient(145deg, #27272a, #18181b);"></div>
            <div class="arch-meta">
              <h4>Rumah Candi — Ubud, Bali</h4>
              <p>Residensial Pribadi · Selesai 2025</p>
            </div>
          </div>
          <div class="arch-card">
            <div class="arch-img" style="background: linear-gradient(145deg, #3f3f46, #27272a);"></div>
            <div class="arch-meta">
              <h4>Paviliun Kopi Selaras — Bandung</h4>
              <p>Ruang Komersial Terbuka · Selesai 2024</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="arch-philosophy" id="filosofi">
      <div class="container">
        <div class="philo-box">
          <span class="philo-num">MANIFES</span>
          <h2>"Arsitektur bukan tentang membangun dinding yang masif, melainkan bagaimana kita membingkai ruang hampa dan membiarkan angin serta cahaya berbicara."</h2>
          <span class="philo-author">— Bambang Pratama, Prinsipal Desain</span>
        </div>
      </div>
    </section>

    <section class="arch-cta" id="kontak">
      <div class="container cta-center">
        <h2>Rancang Hunian atau Ruang Komersial Impian Anda</h2>
        <p>Konsultasikan konsep tata ruang Anda langsung dengan tim arsitek Atelier Monolit.</p>
        <a href="gallery.html" class="btn btn-white">Lihat Semua Proyek</a>
      </div>
    </section>
  </main>

  <footer class="arch-footer">
    <div class="container footer-row">
      <span>ATELIER MONOLIT ARCHITECTS</span>
      <span>Studio Jakarta & Studio Denpasar</span>
    </div>
  </footer>
</body>
</html>`,
        "index.html",
      ),
      "gallery.html": makeTextFile(
        `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Galeri Proyek — Atelier Monolit</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="">
  <link rel="stylesheet" data-kanvas-fonts="" href="https://fonts.googleapis.com/css2?family=Space%20Grotesk:wght@500;600;700&family=Inter:wght@400;500&display=swap">
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <header class="arch-header">
    <div class="container arch-nav">
      <a href="index.html" class="arch-logo">ATELIER MONOLIT</a>
      <nav class="arch-links">
        <a href="index.html">← Beranda</a>
        <a href="index.html#kontak" class="btn btn-outline btn-sm">Inkuiri Desain</a>
      </nav>
    </div>
  </header>

  <main style="padding: 72px 0;">
    <div class="container">
      <h1 style="font-family: var(--font-heading); font-size: 38px; margin-bottom: 16px;">Katalog Karya Arsitektur</h1>
      <p style="color: var(--color-muted); max-width: 600px; margin-bottom: 48px;">Eksplorasi bangunan publik, residensial privat, dan ruang komunal dengan materialitas kayu jati, beton ekspos, dan batu alam lokal.</p>

      <div class="gallery-grid">
        <div class="arch-card">
          <div class="arch-img" style="background: linear-gradient(145deg, #18181b, #27272a);"></div>
          <div class="arch-meta">
            <h4>Villa Samudra — Lombok</h4>
            <p>Retreat Pribadi Berkelanjutan · 2025</p>
          </div>
        </div>
        <div class="arch-card">
          <div class="arch-img" style="background: linear-gradient(145deg, #27272a, #18181b);"></div>
          <div class="arch-meta">
            <h4>Pusat Seni Rupa Nusantara — Yogyakarta</h4>
            <p>Galeri & Ruang Publik · 2024</p>
          </div>
        </div>
      </div>
    </div>
  </main>
</body>
</html>`,
        "gallery.html",
      ),
      "styles.css": makeTextFile(
        `/* --- KANVAS GLOBAL THEME --- */
:root {
  --color-primary: #f4f4f5;
  --color-secondary: #71717a;
  --color-accent: #a1a1aa;
  --color-bg: #0c0c0e;
  --color-surface: #18181b;
  --color-text: #f4f4f5;
  --color-muted: #a1a1aa;
  --color-border: #27272a;
  --font-heading: "Space Grotesk", sans-serif;
  --font-body: "Inter", sans-serif;
  --radius-md: 4px;
}
/* --- END KANVAS GLOBAL THEME --- */

* { box-sizing: border-box; margin: 0; padding: 0; }
body { background: var(--color-bg); color: var(--color-text); font-family: var(--font-body); line-height: 1.6; }
.container { max-width: 1100px; margin: 0 auto; padding: 0 24px; }

.arch-header { border-bottom: 1px solid var(--color-border); background: #0c0c0e; position: sticky; top: 0; z-index: 30; }
.arch-nav { display: flex; justify-content: space-between; align-items: center; height: 72px; }
.arch-logo { font-family: var(--font-heading); font-size: 16px; font-weight: 700; color: #fff; text-decoration: none; letter-spacing: 0.12em; }
.coord-tag { font-family: monospace; font-size: 11px; color: var(--color-muted); }
.arch-links { display: flex; gap: 24px; align-items: center; }
.arch-links a { color: var(--color-muted); text-decoration: none; font-size: 13px; text-transform: uppercase; letter-spacing: 0.05em; }
.arch-links a:hover { color: #fff; }

.btn { display: inline-flex; align-items: center; padding: 8px 18px; border-radius: var(--radius-md); font-weight: 500; text-decoration: none; font-size: 13px; cursor: pointer; }
.btn-sm { padding: 6px 14px; font-size: 12px; }
.btn-outline { border: 1px solid var(--color-border); color: #fff; background: transparent; }
.btn-white { background: #fff; color: #000; border: none; font-weight: 600; padding: 12px 24px; }

.arch-hero { padding: 96px 0 64px; }
.arch-badge { font-family: var(--font-heading); font-size: 12px; text-transform: uppercase; letter-spacing: 0.15em; color: var(--color-accent); display: block; margin-bottom: 16px; }
.arch-hero h1 { font-family: var(--font-heading); font-size: clamp(32px, 5vw, 52px); line-height: 1.2; max-width: 960px; margin-bottom: 24px; }
.hero-desc { color: var(--color-muted); font-size: 17px; max-width: 640px; }

.gallery-preview { padding: 48px 0; }
.gallery-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 32px; }
.arch-card { background: var(--color-surface); border: 1px solid var(--color-border); }
.arch-img { height: 260px; }
.arch-meta { padding: 20px; }
.arch-meta h4 { font-family: var(--font-heading); font-size: 17px; margin-bottom: 4px; }
.arch-meta p { font-size: 13px; color: var(--color-muted); }

.arch-philosophy { padding: 72px 0; border-top: 1px solid var(--color-border); border-bottom: 1px solid var(--color-border); }
.philo-box { max-width: 800px; margin: 0 auto; text-align: center; }
.philo-num { font-size: 11px; letter-spacing: 0.2em; color: var(--color-muted); display: block; margin-bottom: 16px; }
.philo-box h2 { font-family: var(--font-heading); font-size: 26px; line-height: 1.5; font-style: italic; margin-bottom: 20px; font-weight: 500; }
.philo-author { font-size: 14px; color: var(--color-muted); }

.arch-cta { padding: 80px 0; text-align: center; }
.cta-center h2 { font-family: var(--font-heading); font-size: 32px; margin-bottom: 12px; }
.cta-center p { color: var(--color-muted); font-size: 16px; margin-bottom: 28px; }

.arch-footer { border-top: 1px solid var(--color-border); padding: 28px 0; font-size: 12px; color: var(--color-muted); font-family: var(--font-heading); }
.footer-row { display: flex; justify-content: space-between; flex-wrap: wrap; gap: 12px; }

@media (max-width: 768px) {
  .coord-tag { display: none; }
  .arch-links { display: none; }
}
`,
        "styles.css",
      ),
    },
  },
];
