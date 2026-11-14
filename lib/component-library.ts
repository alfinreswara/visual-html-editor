export interface ComponentTemplate {
  id: string;
  name: string;
  category: "Hero" | "Fitur" | "Pricing" | "Testimoni" | "CTA" | "Navigasi" | "Komponen";
  description: string;
  html: string;
}

export const COMPONENT_CATEGORIES = [
  "Semua",
  "Hero",
  "Fitur",
  "Pricing",
  "Testimoni",
  "CTA",
  "Navigasi",
  "Komponen",
] as const;

export type ComponentCategory = (typeof COMPONENT_CATEGORIES)[number];

export const COMPONENT_LIBRARY: ComponentTemplate[] = [
  // --- HERO SECTIONS ---
  {
    id: "hero-modern",
    name: "Hero Modern Terpusat",
    category: "Hero",
    description: "Header halaman hero dengan badge peluncuran, judul tebal, deskripsi, dan tombol CTA ganda.",
    html: `<section class="hero-section" style="padding: 72px 24px; text-align: center; background-color: var(--color-bg, #ffffff);">
  <div style="max-width: 800px; margin: 0 auto;">
    <div style="margin-bottom: 16px;">
      <span class="badge badge-primary">✨ Solusi Desain Generasi Baru</span>
    </div>
    <h1 style="font-size: 46px; font-weight: 800; letter-spacing: -0.025em; margin-bottom: 20px; color: var(--color-text, #0f172a);">
      Bangun Website Impian Secara Visual & Presisi
    </h1>
    <p style="font-size: 18px; color: var(--color-muted, #64748b); margin-bottom: 32px; line-height: 1.6;">
      Editor HTML visual profesional dengan kendali penuh atas kode, integrasi desain sistem fleksibel, dan hasil ekspor yang bersih.
    </p>
    <div style="display: flex; gap: 12px; justify-content: center; flex-wrap: wrap;">
      <a href="#mulai" class="btn btn-primary" style="padding: 12px 28px; font-size: 15px;">Mulai Sekarang</a>
      <a href="#fitur" class="btn btn-secondary" style="padding: 12px 24px; font-size: 15px;">Lihat Dokumentasi</a>
    </div>
  </div>
</section>`,
  },
  {
    id: "hero-split",
    name: "Hero 2 Kolom (Split)",
    category: "Hero",
    description: "Hero berdampingan dengan copywriter di kiri dan kartu visual/mockup di kanan.",
    html: `<section class="hero-split-section" style="padding: 64px 24px; background-color: var(--color-surface, #f8fafc);">
  <div style="max-width: 1140px; margin: 0 auto; display: flex; align-items: center; justify-content: space-between; gap: 48px; flex-wrap: wrap;">
    <div style="flex: 1; min-width: 300px;">
      <span class="badge" style="margin-bottom: 14px;">Platform Terpadu</span>
      <h1 style="font-size: 40px; font-weight: 800; margin-bottom: 16px; color: var(--color-text, #0f172a);">
        Kelola Website Bisnis Tanpa Hambatan
      </h1>
      <p style="font-size: 16px; color: var(--color-muted, #64748b); margin-bottom: 24px; line-height: 1.6;">
        Tingkatkan efisiensi kerja tim dengan pustaka komponen reusable dan pengaturan tema global dalam satu antarmuka.
      </p>
      <div style="display: flex; gap: 12px; flex-wrap: wrap;">
        <a href="#coba" class="btn btn-primary">Uji Coba 14 Hari</a>
        <a href="#demo" class="btn btn-outline">Jadwalkan Demo</a>
      </div>
    </div>
    <div style="flex: 1; min-width: 300px;">
      <div class="card" style="padding: 32px; background-color: var(--color-bg, #ffffff); border-radius: var(--radius-lg, 16px); box-shadow: var(--shadow-lg);">
        <h3 style="margin-top: 0; margin-bottom: 12px; font-size: 20px;">Dashboard Ringkas</h3>
        <p style="color: var(--color-muted, #64748b); font-size: 14px; margin-bottom: 20px;">
          Statistik performa dan interaksi pengunjung terpantau secara real-time.
        </p>
        <div style="height: 140px; background: linear-gradient(135deg, var(--color-primary, #3b82f6) 0%, var(--color-accent, #f59e0b) 100%); border-radius: var(--radius-md, 8px); opacity: 0.85;"></div>
      </div>
    </div>
  </div>
</section>`,
  },

  // --- FEATURES ---
  {
    id: "features-grid-3",
    name: "Grid Fitur 3 Kolom",
    category: "Fitur",
    description: "Tiga kartu fitur dengan ikon, judul, deskripsi, dan hover efek berbasis design tokens.",
    html: `<section class="features-section" style="padding: 64px 24px; background-color: var(--color-bg, #ffffff);">
  <div style="max-width: 1140px; margin: 0 auto;">
    <div style="text-align: center; max-width: 640px; margin: 0 auto 48px auto;">
      <span class="badge" style="margin-bottom: 8px;">Keunggulan Utama</span>
      <h2 style="font-size: 32px; font-weight: 700; color: var(--color-text, #0f172a); margin-bottom: 12px;">
        Dirancang untuk Kecepatan & Produktivitas
      </h2>
      <p style="color: var(--color-muted, #64748b); font-size: 16px;">
        Solusi lengkap untuk merancang, mengedit, dan mengekspor proyek website statis.
      </p>
    </div>
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 24px;">
      <div class="card">
        <div style="font-size: 28px; margin-bottom: 12px;">⚡</div>
        <h3 style="font-size: 18px; font-weight: 600; margin-bottom: 8px; color: var(--color-text, #0f172a);">Performa Cepat</h3>
        <p style="font-size: 14px; color: var(--color-muted, #64748b); line-height: 1.5;">
          Proses rendering instan tanpa jeda, menghasilkan kode HTML dan CSS murni yang ringan di browser.
        </p>
      </div>
      <div class="card">
        <div style="font-size: 28px; margin-bottom: 12px;">🎨</div>
        <h3 style="font-size: 18px; font-weight: 600; margin-bottom: 8px; color: var(--color-text, #0f172a);">Design Tokens</h3>
        <p style="font-size: 14px; color: var(--color-muted, #64748b); line-height: 1.5;">
          Ubah warna dan tipografi seluruh halaman dalam hitungan detik melalui sistem token global.
        </p>
      </div>
      <div class="card">
        <div style="font-size: 28px; margin-bottom: 12px;">🔒</div>
        <h3 style="font-size: 18px; font-weight: 600; margin-bottom: 8px; color: var(--color-text, #0f172a);">Aman & Portabel</h3>
        <p style="font-size: 14px; color: var(--color-muted, #64748b); line-height: 1.5;">
          Data tersimpan lokal di browser pengguna dan bebas diekspor kapan saja menjadi arsip ZIP siap hosting.
        </p>
      </div>
    </div>
  </div>
</section>`,
  },

  // --- STATS BAR ---
  {
    id: "stats-bar",
    name: "Bar Statistik (Stats Counter)",
    category: "Fitur",
    description: "Empat metrik angka pencapaian penting untuk membangun kredibilitas.",
    html: `<section class="stats-section" style="padding: 48px 24px; background-color: var(--color-surface, #f8fafc); border-top: 1px solid var(--color-border, #e2e8f0); border-bottom: 1px solid var(--color-border, #e2e8f0);">
  <div style="max-width: 1140px; margin: 0 auto; display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 24px; text-align: center;">
    <div>
      <div style="font-size: 38px; font-weight: 800; color: var(--color-primary, #3b82f6); margin-bottom: 4px;">99.9%</div>
      <div style="font-size: 14px; font-weight: 500; color: var(--color-muted, #64748b);">Tingkat Kepuasan</div>
    </div>
    <div>
      <div style="font-size: 38px; font-weight: 800; color: var(--color-primary, #3b82f6); margin-bottom: 4px;">10K+</div>
      <div style="font-size: 14px; font-weight: 500; color: var(--color-muted, #64748b);">Proyek Dibuat</div>
    </div>
    <div>
      <div style="font-size: 38px; font-weight: 800; color: var(--color-primary, #3b82f6); margin-bottom: 4px;">&lt; 50ms</div>
      <div style="font-size: 14px; font-weight: 500; color: var(--color-muted, #64748b);">Waktu Render</div>
    </div>
    <div>
      <div style="font-size: 38px; font-weight: 800; color: var(--color-primary, #3b82f6); margin-bottom: 4px;">100%</div>
      <div style="font-size: 14px; font-weight: 500; color: var(--color-muted, #64748b);">Privasi Lokal</div>
    </div>
  </div>
</section>`,
  },

  // --- PRICING ---
  {
    id: "pricing-cards-3",
    name: "Tabel Harga 3 Paket",
    category: "Pricing",
    description: "Tiga kartu paket harga (Dasar, Pro dengan badge unggulan, dan Enterprise).",
    html: `<section class="pricing-section" style="padding: 72px 24px; background-color: var(--color-bg, #ffffff);">
  <div style="max-width: 1140px; margin: 0 auto;">
    <div style="text-align: center; max-width: 600px; margin: 0 auto 48px auto;">
      <span class="badge badge-primary" style="margin-bottom: 8px;">Pilihan Fleksibel</span>
      <h2 style="font-size: 32px; font-weight: 700; color: var(--color-text, #0f172a); margin-bottom: 8px;">
        Pilih Paket Sesuai Kebutuhan
      </h2>
      <p style="color: var(--color-muted, #64748b); font-size: 15px;">
        Mulai gratis sekarang dan tingkatkan kapan saja sesuai pertumbuhan proyek Anda.
      </p>
    </div>
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 24px; align-items: stretch;">
      <!-- Starter -->
      <div class="card" style="display: flex; flex-direction: column;">
        <h3 style="font-size: 18px; margin-top: 0; color: var(--color-text, #0f172a);">Pemula</h3>
        <p style="color: var(--color-muted, #64748b); font-size: 13px;">Cocok untuk eksplorasi dan portofolio pribadi.</p>
        <div style="font-size: 36px; font-weight: 800; margin: 16px 0; color: var(--color-text, #0f172a);">Gratis</div>
        <ul style="padding-left: 18px; font-size: 14px; color: var(--color-muted, #64748b); line-height: 1.8; margin-bottom: 24px; flex: 1;">
          <li>Hingga 3 Halaman</li>
          <li>Export ZIP Standar</li>
          <li>Editor Visual & Monaco</li>
        </ul>
        <a href="#daftar" class="btn btn-secondary" style="width: 100%;">Mulai Gratis</a>
      </div>
      <!-- Pro (Featured) -->
      <div class="card" style="display: flex; flex-direction: column; border-color: var(--color-primary, #3b82f6); box-shadow: var(--shadow-lg); position: relative;">
        <div style="position: absolute; top: -12px; right: 24px;">
          <span class="badge badge-primary">Paling Populer</span>
        </div>
        <h3 style="font-size: 18px; margin-top: 0; color: var(--color-text, #0f172a);">Profesional</h3>
        <p style="color: var(--color-muted, #64748b); font-size: 13px;">Untuk kreator, agensi, dan developer aktif.</p>
        <div style="font-size: 36px; font-weight: 800; margin: 16px 0; color: var(--color-primary, #3b82f6);">
          Rp 99rb<span style="font-size: 14px; font-weight: 500; color: var(--color-muted, #64748b);"> /bulan</span>
        </div>
        <ul style="padding-left: 18px; font-size: 14px; color: var(--color-muted, #64748b); line-height: 1.8; margin-bottom: 24px; flex: 1;">
          <li>Halaman Tanpa Batas</li>
          <li>Pustaka Komponen Lengkap</li>
          <li>Saved Sections Kustom</li>
          <li>Dukungan Asisten AI Cepat</li>
        </ul>
        <a href="#upgrade" class="btn btn-primary" style="width: 100%;">Pilih Paket Pro</a>
      </div>
      <!-- Enterprise -->
      <div class="card" style="display: flex; flex-direction: column;">
        <h3 style="font-size: 18px; margin-top: 0; color: var(--color-text, #0f172a);">Enterprise</h3>
        <p style="color: var(--color-muted, #64748b); font-size: 13px;">Solusi khusus perusahaan dan tim berskala besar.</p>
        <div style="font-size: 36px; font-weight: 800; margin: 16px 0; color: var(--color-text, #0f172a);">Kustom</div>
        <ul style="padding-left: 18px; font-size: 14px; color: var(--color-muted, #64748b); line-height: 1.8; margin-bottom: 24px; flex: 1;">
          <li>Semua Fitur Pro</li>
          <li>Design System Tim Terpadu</li>
          <li>Integrasi Hosting Pribadi</li>
          <li>Dukungan Prioritas 24/7</li>
        </ul>
        <a href="#kontak" class="btn btn-secondary" style="width: 100%;">Hubungi Tim Kami</a>
      </div>
    </div>
  </div>
</section>`,
  },

  // --- TESTIMONIALS ---
  {
    id: "testimonials-grid",
    name: "Kartu Testimoni Pengguna",
    category: "Testimoni",
    description: "Tiga kartu ulasan pelanggan dengan rating bintang, kutipan testimoni, dan nama.",
    html: `<section class="testimonials-section" style="padding: 64px 24px; background-color: var(--color-surface, #f8fafc);">
  <div style="max-width: 1140px; margin: 0 auto;">
    <div style="text-align: center; max-width: 600px; margin: 0 auto 40px auto;">
      <h2 style="font-size: 30px; font-weight: 700; color: var(--color-text, #0f172a); margin-bottom: 8px;">
        Dipercaya oleh Developer & Desainer
      </h2>
      <p style="color: var(--color-muted, #64748b); font-size: 15px;">
        Lihat bagaimana para profesional mempercepat alur kerja pembuatan web mereka.
      </p>
    </div>
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 24px;">
      <div class="card">
        <div style="color: #f59e0b; margin-bottom: 8px;">★★★★★</div>
        <p style="font-size: 14px; font-style: italic; color: var(--color-text, #0f172a); margin-bottom: 16px; line-height: 1.6;">
          &ldquo;Editor ini menghemat waktu pembuatan landing page hingga 70%. Kode hasil ekspornya sangat bersih tanpa kotoran framework.&rdquo;
        </p>
        <div style="font-weight: 600; font-size: 14px;">Budi Santoso</div>
        <div style="font-size: 12px; color: var(--color-muted, #64748b);">Lead Frontend Developer</div>
      </div>
      <div class="card">
        <div style="color: #f59e0b; margin-bottom: 8px;">★★★★★</div>
        <p style="font-size: 14px; font-style: italic; color: var(--color-text, #0f172a); margin-bottom: 16px; line-height: 1.6;">
          &ldquo;Integrasi CSS variables dan Google Fonts bekerja mulus. Begitu tema diubah, semua section langsung sinkron otomatis.&rdquo;
        </p>
        <div style="font-weight: 600; font-size: 14px;">Siti Rahmawati</div>
        <div style="font-size: 12px; color: var(--color-muted, #64748b);">UI/UX Designer</div>
      </div>
      <div class="card">
        <div style="color: #f59e0b; margin-bottom: 8px;">★★★★★</div>
        <p style="font-size: 14px; font-style: italic; color: var(--color-text, #0f172a); margin-bottom: 16px; line-height: 1.6;">
          &ldquo;Fitur Saved Sections sangat membantu saya menduplikasi komponen favorit ke berbagai halaman dalam satu klik.&rdquo;
        </p>
        <div style="font-weight: 600; font-size: 14px;">Rian Pratama</div>
        <div style="font-size: 12px; color: var(--color-muted, #64748b);">Agency Founder</div>
      </div>
    </div>
  </div>
</section>`,
  },

  // --- CTA BANNER ---
  {
    id: "cta-banner",
    name: "Banner Ajakan Aksi (CTA)",
    category: "CTA",
    description: "Banner konversi kontras tinggi untuk menarik pengunjung melakukan registrasi atau kontak.",
    html: `<section class="cta-section" style="padding: 60px 24px; background-color: var(--color-bg, #ffffff);">
  <div style="max-width: 960px; margin: 0 auto; background: linear-gradient(135deg, var(--color-primary, #3b82f6) 0%, var(--color-accent, #6366f1) 100%); border-radius: var(--radius-lg, 16px); padding: 48px 32px; text-align: center; color: #ffffff; box-shadow: var(--shadow-lg);">
    <h2 style="font-size: 34px; font-weight: 800; margin-bottom: 14px; color: #ffffff;">
      Siap Meluncurkan Website Impian Anda?
    </h2>
    <p style="font-size: 16px; opacity: 0.92; max-width: 600px; margin: 0 auto 28px auto; line-height: 1.6;">
      Daftar sekarang dan nikmati kebebasan berkreasi tanpa batas dengan Visual HTML Editor.
    </p>
    <div style="display: flex; gap: 12px; justify-content: center; flex-wrap: wrap;">
      <a href="#mulai" class="btn" style="background-color: #ffffff; color: var(--color-primary, #3b82f6); padding: 12px 28px; font-size: 15px; font-weight: 700;">
        Daftar Gratis Sekarang
      </a>
      <a href="#bantuan" class="btn" style="background-color: transparent; border: 1px solid rgba(255,255,255,0.4); color: #ffffff; padding: 12px 24px;">
        Konsultasi Tim
      </a>
    </div>
  </div>
</section>`,
  },

  // --- FAQ ---
  {
    id: "faq-section",
    name: "Tanya Jawab (FAQ)",
    category: "Fitur",
    description: "Daftar tanya jawab umum dengan tampilan kartu terpisah rapi.",
    html: `<section id="faq-section" class="faq-section" style="padding: 64px 24px; background-color: var(--color-bg, #ffffff);">
  <div style="max-width: 800px; margin: 0 auto;">
    <div style="text-align: center; margin-bottom: 40px;">
      <span class="badge" style="margin-bottom: 8px;">Informasi Bantuan</span>
      <h2 id="faq-title" style="font-size: 30px; font-weight: 700; color: var(--color-text, #0f172a);">Pertanyaan yang Sering Diajukan</h2>
      <a href="#faq-section" style="font-size: 13px; color: var(--color-primary, #3b82f6);">Kembali ke atas FAQ</a>
    </div>
    <div style="display: flex; flex-direction: column; gap: 16px;">
      <div class="card" style="padding: 20px;">
        <h4 id="faq-q1" style="font-size: 16px; margin: 0 0 8px 0; color: var(--color-text, #0f172a);">Apakah hasil ekspor bisa di-hosting di mana saja?</h4>
        <p id="faq-a1" aria-labelledby="faq-q1" style="font-size: 14px; color: var(--color-muted, #64748b); margin: 0; line-height: 1.6;">
          Ya, hasil ekspor adalah file HTML, CSS, dan gambar statis murni yang dapat langsung di-upload ke Vercel, Netlify, GitHub Pages, atau web server apa pun.
        </p>
      </div>
      <div class="card" style="padding: 20px;">
        <h4 id="faq-q2" style="font-size: 16px; margin: 0 0 8px 0; color: var(--color-text, #0f172a);">Apakah saya bisa mengedit kode sumbernya langsung?</h4>
        <p id="faq-a2" aria-labelledby="faq-q2" style="font-size: 14px; color: var(--color-muted, #64748b); margin: 0; line-height: 1.6;">
          Tentu saja. Tersedia editor kode Monaco bawaan dengan sinkronisasi dua arah real-time ke kanvas visual.
        </p>
      </div>
      <div class="card" style="padding: 20px;">
        <h4 id="faq-q3" style="font-size: 16px; margin: 0 0 8px 0; color: var(--color-text, #0f172a);">Bagaimana cara menyimpan komponen favorit?</h4>
        <p id="faq-a3" aria-labelledby="faq-q3" style="font-size: 14px; color: var(--color-muted, #64748b); margin: 0; line-height: 1.6;">
          Cukup klik kanan pada elemen atau section apa pun di kanvas, lalu pilih "Simpan sebagai Section Reusable".
        </p>
      </div>
    </div>
  </div>
</section>`,
  },

  // --- NAVBAR ---
  {
    id: "navbar-modern",
    name: "Navigasi Header Bersih",
    category: "Navigasi",
    description: "Header navigasi responsif dengan logo, daftar tautan menu, dan tombol aksi.",
    html: `<header class="navbar" style="padding: 16px 24px; background-color: var(--color-bg, #ffffff); border-bottom: 1px solid var(--color-border, #e2e8f0);">
  <div style="max-width: 1140px; margin: 0 auto; display: flex; align-items: center; justify-content: space-between; gap: 20px;">
    <div style="display: flex; align-items: center; gap: 8px;">
      <span style="font-size: 20px; font-weight: 800; color: var(--color-primary, #3b82f6);">✦ BrandKu</span>
    </div>
    <nav style="display: flex; gap: 24px; align-items: center;">
      <a href="#fitur" style="color: var(--color-text, #0f172a); font-size: 14px; font-weight: 500;">Fitur</a>
      <a href="#harga" style="color: var(--color-text, #0f172a); font-size: 14px; font-weight: 500;">Harga</a>
      <a href="#testimoni" style="color: var(--color-text, #0f172a); font-size: 14px; font-weight: 500;">Testimoni</a>
      <a href="#kontak" style="color: var(--color-text, #0f172a); font-size: 14px; font-weight: 500;">Kontak</a>
    </nav>
    <div>
      <a href="#mulai" class="btn btn-primary" style="padding: 8px 18px; font-size: 13px;">Mulai Gratis</a>
    </div>
  </div>
</header>`,
  },

  // --- FOOTER ---
  {
    id: "footer-columns",
    name: "Footer Kolom Lengkap",
    category: "Navigasi",
    description: "Footer profesional 4 kolom dengan profil brand, link produk, dan hak cipta.",
    html: `<footer class="footer-section" style="padding: 48px 24px 24px 24px; background-color: var(--color-surface, #f8fafc); border-top: 1px solid var(--color-border, #e2e8f0);">
  <div style="max-width: 1140px; margin: 0 auto;">
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 32px; margin-bottom: 40px;">
      <div>
        <div style="font-size: 18px; font-weight: 800; color: var(--color-primary, #3b82f6); margin-bottom: 12px;">✦ BrandKu</div>
        <p style="font-size: 13px; color: var(--color-muted, #64748b); line-height: 1.6;">
          Platform pembuatan website visual modern dengan standar kode industri terdepan.
        </p>
      </div>
      <div>
        <h4 style="font-size: 14px; margin-top: 0; margin-bottom: 12px; color: var(--color-text, #0f172a);">Produk</h4>
        <ul style="list-style: none; padding: 0; margin: 0; font-size: 13px; line-height: 2;">
          <li><a href="#fitur" style="color: var(--color-muted, #64748b);">Fitur Editor</a></li>
          <li><a href="#templates" style="color: var(--color-muted, #64748b);">Template Siap Pakai</a></li>
          <li><a href="#komponen" style="color: var(--color-muted, #64748b);">Pustaka Komponen</a></li>
        </ul>
      </div>
      <div>
        <h4 style="font-size: 14px; margin-top: 0; margin-bottom: 12px; color: var(--color-text, #0f172a);">Perusahaan</h4>
        <ul style="list-style: none; padding: 0; margin: 0; font-size: 13px; line-height: 2;">
          <li><a href="#tentang" style="color: var(--color-muted, #64748b);">Tentang Kami</a></li>
          <li><a href="#karir" style="color: var(--color-muted, #64748b);">Karir</a></li>
          <li><a href="#kontak" style="color: var(--color-muted, #64748b);">Hubungi Kami</a></li>
        </ul>
      </div>
      <div>
        <h4 style="font-size: 14px; margin-top: 0; margin-bottom: 12px; color: var(--color-text, #0f172a);">Bantuan</h4>
        <ul style="list-style: none; padding: 0; margin: 0; font-size: 13px; line-height: 2;">
          <li><a href="#faq" style="color: var(--color-muted, #64748b);">Pusat Bantuan</a></li>
          <li><a href="#privasi" style="color: var(--color-muted, #64748b);">Kebijakan Privasi</a></li>
          <li><a href="#syarat" style="color: var(--color-muted, #64748b);">Syarat Layanan</a></li>
        </ul>
      </div>
    </div>
    <div style="border-top: 1px solid var(--color-border, #e2e8f0); padding-top: 24px; text-align: center; font-size: 12px; color: var(--color-muted, #64748b);">
      &copy; 2026 BrandKu. Hak Cipta Dilindungi. Dibuat dengan Visual HTML Editor.
    </div>
  </div>
</footer>`,
  },

  // --- UI COMPONENTS ---
  {
    id: "card-feature-single",
    name: "Kartu Fitur Tunggal",
    category: "Komponen",
    description: "Komponen kartu individual siap pakai dengan badge, judul, dan tautan.",
    html: `<div class="card" style="max-width: 380px;">
  <span class="badge badge-primary" style="margin-bottom: 12px;">Fitur Unggulan</span>
  <h3 style="font-size: 18px; margin: 0 0 8px 0; color: var(--color-text, #0f172a);">Otomatisasi Desain</h3>
  <p style="font-size: 14px; color: var(--color-muted, #64748b); line-height: 1.5; margin-bottom: 16px;">
    Sinkronkan desain antar halaman secara otomatis menggunakan sistem token terpusat.
  </p>
  <a href="#pelajari" style="font-size: 13px; font-weight: 600; display: inline-flex; align-items: center; gap: 4px;">
    Pelajari lebih lanjut &rarr;
  </a>
</div>`,
  },
  {
    id: "button-group-ui",
    name: "Grup Tombol Aksi",
    category: "Komponen",
    description: "Tiga varian tombol: Utama (Primary), Sekunder (Surface), dan Garis Luar (Outline).",
    html: `<div style="display: flex; gap: 10px; align-items: center; flex-wrap: wrap;">
  <button type="button" class="btn btn-primary">Tombol Utama</button>
  <button type="button" class="btn btn-secondary">Tombol Sekunder</button>
  <button type="button" class="btn btn-outline">Tombol Outline</button>
</div>`,
  },
  {
    id: "newsletter-form",
    name: "Form Berlangganan Newsletter",
    category: "Komponen",
    description: "Input email dengan tombol berlangganan inline yang responsif.",
    html: `<div class="card" style="max-width: 480px; padding: 24px;">
  <h4 style="margin: 0 0 6px 0; font-size: 16px; color: var(--color-text, #0f172a);">Berlangganan Kabar Terbaru</h4>
  <p style="font-size: 13px; color: var(--color-muted, #64748b); margin: 0 0 16px 0;">
    Dapatkan tips desain dan pembaruan fitur langsung di kotak masuk Anda.
  </p>
  <form onsubmit="return false;" style="display: flex; gap: 8px;">
    <label for="newsletter-email" style="position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0, 0, 0, 0); white-space: nowrap; border: 0;">Email</label>
    <input id="newsletter-email" type="email" placeholder="nama@email.com" required style="flex: 1; padding: 8px 14px; font-size: 14px; border: 1px solid var(--color-border, #e2e8f0); border-radius: var(--radius-md, 8px); outline: none; background: var(--color-bg, #ffffff); color: var(--color-text, #0f172a);" />
    <button type="submit" class="btn btn-primary" style="padding: 8px 18px; font-size: 13px;">Langganan</button>
  </form>
</div>`,
  },
  {
    id: "alert-banner",
    name: "Banner Notifikasi / Alert",
    category: "Komponen",
    description: "Kotak informasi beraksen dengan warna tema utama dan tombol aksi ringkas.",
    html: `<div style="display: flex; align-items: center; justify-content: space-between; gap: 16px; padding: 14px 20px; background-color: var(--color-surface, #f8fafc); border-left: 4px solid var(--color-primary, #3b82f6); border-radius: var(--radius-md, 8px); box-shadow: var(--shadow-sm);">
  <div style="font-size: 14px; color: var(--color-text, #0f172a);">
    <strong style="margin-right: 6px;">Pemberitahuan:</strong> Pembaruan sistem design token telah aktif di proyek ini.
  </div>
  <a href="#info" class="btn btn-primary" style="padding: 6px 14px; font-size: 12px; shrink-0;">Lihat Info</a>
</div>`,
  },
];
