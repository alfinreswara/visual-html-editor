export * from "./templates/index";

export interface ProjectTemplate {
  id: "kosong" | "landing";
  name: string;
  description: string;
  html: string;
}

const BLANK_TEMPLATE = `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Halaman Baru</title>
  <style>
    * { box-sizing: border-box; }
    html, body { margin: 0; min-height: 100%; }
    body {
      min-height: 100vh;
      display: grid;
      place-items: center;
      padding: 32px;
      background:
        radial-gradient(circle at 20% 15%, #e7efff 0, transparent 34%),
        radial-gradient(circle at 80% 85%, #f4e9ff 0, transparent 30%),
        #f8f7f4;
      color: #17171c;
      font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    }
    .kanvas {
      width: min(100%, 620px);
      padding: 64px 48px;
      text-align: center;
      border: 1px solid rgba(23, 23, 28, 0.08);
      border-radius: 28px;
      background: rgba(255, 255, 255, 0.72);
      box-shadow: 0 24px 80px rgba(31, 38, 66, 0.1);
      backdrop-filter: blur(12px);
    }
    .label {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      margin: 0 0 24px;
      padding: 7px 12px;
      border: 1px solid #dbe4f8;
      border-radius: 999px;
      background: #f4f8ff;
      color: #315dce;
      font-size: 12px;
      font-weight: 700;
      letter-spacing: 0.08em;
      text-transform: uppercase;
    }
    .label::before {
      content: "";
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: #4879f0;
    }
    h1 {
      margin: 0;
      font-size: clamp(38px, 7vw, 58px);
      line-height: 1.02;
      letter-spacing: -0.055em;
      font-weight: 760;
    }
    p {
      max-width: 440px;
      margin: 22px auto 0;
      color: #65646d;
      font-size: 16px;
      line-height: 1.7;
    }
    .actions {
      display: flex;
      justify-content: center;
      flex-wrap: wrap;
      gap: 10px;
      margin-top: 32px;
    }
    .actions a {
      display: inline-flex;
      align-items: center;
      min-height: 44px;
      padding: 0 20px;
      border-radius: 12px;
      background: #17171c;
      color: #fff;
      font-size: 14px;
      font-weight: 650;
      text-decoration: none;
    }
    .actions .secondary {
      border: 1px solid #dedde3;
      background: #fff;
      color: #303038;
    }
    @media (max-width: 520px) {
      .kanvas { padding: 48px 24px; border-radius: 20px; }
      body { padding: 16px; }
    }
  </style>
</head>
<body>
  <main class="kanvas">
    <span class="label">Halaman baru</span>
    <h1>Mulai bentuk idemu.</h1>
    <p>Pilih elemen mana pun di halaman preview, ubah gaya lewat panel kanan, atau minta bantuan AI untuk menulis dan menata ulang halaman.</p>
    <div class="actions">
      <a href="#">Mulai jelajahi</a>
      <a href="#" class="secondary">Pelajari dulu</a>
    </div>
  </main>
</body>
</html>`;

const LANDING_TEMPLATE = `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Ruang — Studio Desain Digital</title>
  <style>
    * { box-sizing: border-box; }
    html { scroll-behavior: smooth; }
    body {
      margin: 0;
      min-height: 100vh;
      background: #10110f;
      color: #f1f2e9;
      font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      -webkit-font-smoothing: antialiased;
    }
    .page {
      position: relative;
      min-height: 100vh;
      overflow: hidden;
      padding: 0 clamp(22px, 6vw, 88px) 52px;
    }
    .glow {
      position: absolute;
      top: -260px;
      right: -160px;
      width: 680px;
      height: 680px;
      border-radius: 50%;
      background: radial-gradient(circle, rgba(202, 255, 94, 0.2), rgba(202, 255, 94, 0) 66%);
      pointer-events: none;
    }
    nav {
      position: relative;
      z-index: 1;
      display: flex;
      align-items: center;
      justify-content: space-between;
      max-width: 1180px;
      margin: 0 auto;
      padding: 26px 0;
      border-bottom: 1px solid rgba(241, 242, 233, 0.1);
    }
    .brand {
      display: flex;
      align-items: center;
      gap: 10px;
      font-size: 17px;
      font-weight: 750;
      letter-spacing: -0.03em;
    }
    .brand-mark {
      display: grid;
      place-items: center;
      width: 28px;
      height: 28px;
      border-radius: 9px;
      background: #caff5e;
      color: #10110f;
      font-size: 14px;
      font-weight: 900;
    }
    .nav-links {
      display: flex;
      align-items: center;
      gap: 30px;
      color: #a9aa9f;
      font-size: 13px;
      font-weight: 550;
    }
    .nav-links a { color: inherit; text-decoration: none; }
    .nav-cta {
      padding: 10px 16px;
      border: 1px solid rgba(241, 242, 233, 0.18);
      border-radius: 999px;
      color: #f1f2e9 !important;
    }
    main {
      position: relative;
      z-index: 1;
      max-width: 1180px;
      margin: 0 auto;
    }
    .hero {
      display: grid;
      grid-template-columns: minmax(0, 1.15fr) minmax(280px, 0.85fr);
      gap: clamp(40px, 8vw, 110px);
      align-items: center;
      min-height: 640px;
      padding: 78px 0 60px;
    }
    .eyebrow {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 26px;
      color: #caff5e;
      font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
      font-size: 11px;
      font-weight: 600;
      letter-spacing: 0.12em;
      text-transform: uppercase;
    }
    .eyebrow::before {
      content: "";
      width: 20px;
      height: 1px;
      background: currentColor;
    }
    h1 {
      max-width: 760px;
      margin: 0;
      font-family: Georgia, "Times New Roman", serif;
      font-size: clamp(52px, 7.4vw, 94px);
      font-weight: 400;
      line-height: 0.96;
      letter-spacing: -0.055em;
    }
    h1 em {
      color: #caff5e;
      font-weight: 400;
    }
    .intro {
      max-width: 500px;
      margin: 30px 0 0;
      color: #a6a79d;
      font-size: 16px;
      line-height: 1.75;
    }
    .hero-actions {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
      margin-top: 34px;
    }
    .button {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      min-height: 48px;
      padding: 0 22px;
      border-radius: 999px;
      background: #caff5e;
      color: #11120f;
      font-size: 13px;
      font-weight: 750;
      text-decoration: none;
    }
    .button.secondary {
      border: 1px solid rgba(241, 242, 233, 0.16);
      background: transparent;
      color: #f1f2e9;
    }
    .showcase {
      position: relative;
      min-height: 420px;
    }
    .orb {
      position: absolute;
      top: 18%;
      left: 16%;
      width: 250px;
      height: 250px;
      border-radius: 50%;
      background: linear-gradient(140deg, #e4ffad, #7ea33b 70%);
      box-shadow: 0 40px 120px rgba(166, 222, 63, 0.2);
    }
    .card {
      position: absolute;
      right: 0;
      bottom: 20px;
      width: min(100%, 330px);
      padding: 26px;
      border: 1px solid rgba(241, 242, 233, 0.14);
      border-radius: 24px;
      background: rgba(29, 31, 27, 0.78);
      backdrop-filter: blur(18px);
      box-shadow: 0 32px 90px rgba(0, 0, 0, 0.36);
    }
    .card-top {
      display: flex;
      justify-content: space-between;
      align-items: center;
      color: #a6a79d;
      font-size: 11px;
      letter-spacing: 0.08em;
      text-transform: uppercase;
    }
    .card-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #caff5e;
      box-shadow: 0 0 24px #caff5e;
    }
    .card h2 {
      margin: 56px 0 8px;
      font-family: Georgia, "Times New Roman", serif;
      font-size: 33px;
      font-weight: 400;
      letter-spacing: -0.04em;
    }
    .card p {
      margin: 0;
      color: #9a9c91;
      font-size: 13px;
      line-height: 1.65;
    }
    .stats {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 1px;
      margin-top: 20px;
      border-top: 1px solid rgba(241, 242, 233, 0.1);
      padding-top: 20px;
    }
    .stats span {
      display: block;
      margin-bottom: 4px;
      font-size: 22px;
      letter-spacing: -0.05em;
    }
    .stats small {
      color: #7f8178;
      font-size: 10px;
      text-transform: uppercase;
      letter-spacing: 0.08em;
    }
    .logos {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: space-between;
      gap: 20px;
      padding: 26px 0;
      border-top: 1px solid rgba(241, 242, 233, 0.1);
      color: #6f7168;
      font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
      font-size: 11px;
      letter-spacing: 0.08em;
      text-transform: uppercase;
    }
    @media (max-width: 820px) {
      .hero { grid-template-columns: 1fr; min-height: auto; padding: 64px 0 48px; }
      .showcase { min-height: 340px; }
      .orb { width: 210px; height: 210px; top: 0; left: 5%; }
      .card { width: 78%; padding: 22px; }
      .nav-links a:not(.nav-cta) { display: none; }
    }
    @media (max-width: 480px) {
      .page { padding-inline: 20px; }
      .showcase { min-height: 300px; }
      .orb { width: 180px; height: 180px; left: 0; }
      .card { width: 86%; padding: 18px; border-radius: 18px; }
      .card h2 { margin-top: 38px; font-size: 28px; }
      .stats span { font-size: 19px; }
    }
  </style>
</head>
<body>
  <div class="page">
    <div class="glow"></div>
    <nav>
      <div class="brand"><span class="brand-mark">R</span> ruang.</div>
      <div class="nav-links">
        <a href="#karya">Karya</a>
        <a href="#studio">Studio</a>
        <a href="#kontak">Kontak</a>
        <a href="#" class="nav-cta">Mulai proyek</a>
      </div>
    </nav>

    <main>
      <section class="hero">
        <div>
          <span class="eyebrow">Studio desain independen</span>
          <h1>Bentuk digital yang terasa <em>manusiawi.</em></h1>
          <p class="intro">Kami merancang identitas, situs web, dan pengalaman digital untuk brand yang ingin tampil berbeda—bukan sekadar terlihat baru.</p>
          <div class="hero-actions">
            <a href="#karya" class="button">Lihat karya kami <span>↗</span></a>
            <a href="#studio" class="button secondary">Kenali studio</a>
          </div>
        </div>
        <div class="showcase">
          <div class="orb"></div>
          <article class="card">
            <div class="card-top"><span>Selected work</span><span class="card-dot"></span></div>
            <h2>Nara Living</h2>
            <p>Identitas visual dan pengalaman digital untuk hidup yang lebih pelan.</p>
            <div class="stats">
              <div><span>24</span><small>Proyek</small></div>
              <div><span>08</span><small>Tahun</small></div>
              <div><span>12</span><small>Penghargaan</small></div>
            </div>
          </article>
        </div>
      </section>

      <section class="logos" id="studio">
        <span>Dipercaya oleh</span>
        <span>Arunika</span>
        <span>Nara Living</span>
        <span>Kolektif</span>
        <span>Rintik</span>
        <span>Mori</span>
      </section>
    </main>
  </div>
</body>
</html>`;

export const PROJECT_TEMPLATES: ProjectTemplate[] = [
  {
    id: "kosong",
    name: "Halaman kosong",
    description: "Halaman pembuka minimal untuk mulai dari nol.",
    html: BLANK_TEMPLATE,
  },
  {
    id: "landing",
    name: "Landing page",
    description: "Hero editorial gelap dengan tipografi kontras.",
    html: LANDING_TEMPLATE,
  },
];

export const DEFAULT_TEMPLATE = PROJECT_TEMPLATES[0];
