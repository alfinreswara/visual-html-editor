# Visual HTML Editor

Visual HTML editor berbahasa Indonesia dengan preview iframe, panel properti, editor kode, riwayat undo/redo, project multi-file, ekspor ZIP, dan asisten AI. Dibuat dengan Next.js App Router, TypeScript, dan Tailwind CSS.

## Menjalankan

```bash
npm install
cp .env.example .env.local
npm run dev
```

Buka `http://localhost:3000`.

Untuk mode produksi:

```bash
npm run build
npm run start
```

## Project dan file

- **Project baru** membuat satu halaman `index.html` dari template.
- **Impor HTML/ZIP** menerima satu file `.html`/`.htm` atau arsip `.zip` berisi project multi-file.
- ZIP dapat memuat HTML, CSS, JavaScript, gambar, font, JSON, dan file teks lain. Struktur folder asli dipertahankan.
- Sidebar file menampilkan pohon folder. Klik file HTML untuk membuka halamannya di preview; klik CSS, JS, SVG, atau file teks lain untuk membuka Monaco.
- Preview meresolve `<link>`, `<script src>`, `<img src>`, `srcset`, dan CSS `url()` lokal menjadi blob URL di memori. URL eksternal dan CDN tidak diubah.
- Blob URL lama dilepas saat file/halaman berganti, preview dibangun ulang, atau project ditutup.
- Saat mode **Lihat**, tautan ke halaman HTML lain di project akan membuka halaman tersebut tanpa keluar dari editor. Tautan eksternal tetap dibuka di tab baru setelah divalidasi.
- Edit visual disimpan sebagai teks pada file HTML aktif, atau sebagai rule CSS di stylesheet project saat memakai class/responsif.
- Undo/redo mencakup perubahan di semua file dalam satu riwayat project.

## Menyusun halaman

Panel **Layers** menampilkan struktur DOM halaman aktif sebagai pohon yang bisa dilipat. Klik node untuk memilih elemen di preview, atau klik elemen di preview untuk menyorot node-nya. Setiap node menampilkan tag, class, dan cuplikan teks.

Tombol **Tambah** menyisipkan teks, heading, tombol, gambar, link, container, atau section. Pilih **Di dalam** untuk memasukkan elemen ke container terpilih, atau **Setelah** untuk menaruhnya sebagai saudara setelah elemen terpilih. Elemen baru langsung terpilih dan memakai style dasar yang rapi.

| Aksi | Cara |
| --- | --- |
| Duplikat | Tombol duplikat atau `Ctrl/Cmd+D` |
| Hapus | Tombol hapus, `Delete`, atau `Backspace` |
| Urutkan | Tombol naik/turun atau tarik node di panel Layers |
| Undo / redo | Tombol toolbar, `Ctrl/Cmd+Z`, `Ctrl/Cmd+Shift+Z`, atau `Ctrl/Cmd+Y` |

Semua operasi struktur dan gaya masuk ke riwayat undo/redo yang sama, lalu langsung tersinkron ke tab Kode dan hasil ekspor.

### Gambar dan tautan

- Saat elemen `<img>` terpilih, unggah gambar baru (maksimal 8 MB) atau pilih gambar yang sudah ada di project. File upload disimpan sebagai aset biner di folder `assets` sebelah halaman dan atribut `src` langsung diperbarui.
- Format gambar yang didukung: PNG, JPG, WebP, GIF, SVG, AVIF, ICO, dan BMP.
- Elemen `<a>` dan `<button>` memiliki input **Href**. Di mode Lihat, tautan jangkar digulir di preview, halaman HTML lokal dibuka di editor, dan URL eksternal dibuka di tab baru setelah divalidasi.

### Style responsif dan class

Panel properti punya pilihan target **Inline elemen** atau **Class CSS**, serta target perangkat **Desktop**, **Tablet**, dan **Mobile**.

- **Desktop** menulis inline style seperti sebelumnya. Jika memilih **Class CSS**, perubahan ditulis ke rule class di stylesheet project dan properti inline yang sama dilepas agar rule class berlaku.
- **Tablet** menulis ke `@media (max-width: 1024px) and (min-width: 641px)`.
- **Mobile** menulis ke `@media (max-width: 640px)`.
- Rule responsif memakai `!important` agar menang atas inline style, sementara tampilan desktop tetap dipertahankan.
- Jika project belum punya stylesheet lokal yang dirujuk, editor membuat `styles.css` di folder halaman dan menambahkan `<link rel="stylesheet">` secara otomatis.
- Preview Desktop dirender pada lebar 1280 px lalu diskalakan agar pas di panel editor; Tablet memakai 768 px dan Mobile 390 px. Dengan begitu breakpoint tablet tidak aktif hanya karena panel editor sempit.

## Batas impor

| Jenis | Batas |
| --- | --- |
| File HTML tunggal | 5 MB |
| Arsip ZIP | 30 MB |
| Jumlah file dalam ZIP | 500 |
| Total isi ZIP setelah diekstrak | 40 MB |

## Ekspor

Tombol **Ekspor** menghasilkan satu ZIP dengan path file asli, termasuk `styles.css` dan aset gambar yang ditambahkan lewat editor, tanpa artefak editor seperti bridge preview, outline, atau `data-ve-id`. Project template satu halaman tetap memakai nama `${slug}.html`; hasil impor HTML/ZIP mempertahankan nama file aslinya. Hasil ekspor dapat dibuka langsung sebagai situs statis.

## Penyimpanan

Project kecil disimpan di `localStorage` (`kanvas.projects.v1`). Jika project melewati batas praktis `localStorage`, file lengkap dipindahkan ke IndexedDB (`kanvas.projects`, object store `projects`) dan `localStorage` hanya menyimpan metadata ringan untuk daftar project. Project lama dengan model satu HTML dimigrasikan otomatis ke bentuk file-map.

## Konfigurasi AI

Fitur AI dipanggil dari server melalui route `POST /api/ai`. API key tidak pernah dikirim ke browser.

Aplikasi memakai endpoint OpenAI-compatible:

```text
{AI_BASE_URL}/chat/completions
```

Isi variabel berikut di `.env.local`:

| Variabel | Wajib | Default | Keterangan |
| --- | --- | --- | --- |
| `AI_BASE_URL` | Tidak | `http://localhost:20128/v1` | Base URL provider, tanpa `/chat/completions`. 9router lokal memakai default ini. |
| `AI_API_KEY` | Ya | — | Dikirim sebagai `Authorization: Bearer ...`. Hanya dibaca di server. |
| `AI_MODEL` | Ya | — | Nama model yang tersedia di provider/9router. |

Contoh untuk 9router:

```env
AI_BASE_URL=http://localhost:20128/v1
AI_API_KEY=isi-key-dari-9router
AI_MODEL=nama-model-yang-tersedia
```

Contoh provider OpenAI-compatible lain:

```env
AI_BASE_URL=https://provider.example.com/v1
AI_API_KEY=isi-key-provider
AI_MODEL=nama-model
```

Restart server setelah mengubah env. Jika `AI_API_KEY` atau `AI_MODEL` kosong, route mengembalikan `503` dengan pesan konfigurasi yang jelas.

### Perilaku AI

- AI hanya menerima HTML halaman yang sedang aktif dan file CSS lokal yang dirujuk langsung oleh halaman itu. File JavaScript, gambar, dan halaman lain tidak dikirim.
- Mode halaman mengirim HTML aktif dan meminta satu dokumen HTML lengkap; tautan `<link rel="stylesheet">` yang ada dipertahankan.
- Mode elemen terpilih hanya meminta `outerHTML` dari elemen target; server menolak dokumen penuh.
- Respons dibersihkan dari code fence markdown, penjelasan, serta teks sebelum/sesudah HTML.
- HTML disanitasi: script, event handler, iframe, form, dan URL berbahaya dibuang. Tag `<style>` dan `<link>` untuk stylesheet tetap diizinkan.
- Respons yang bukan HTML valid atau tidak seimbang ditolak dengan error; HTML yang sudah ada tidak ditimpa.
- Timeout permintaan ke provider adalah 90 detik.
- Error koneksi, `401`/`403`, `404`, `429`, dan `5xx` ditampilkan dengan pesan yang ramah.

Jangan pernah memakai prefix `NEXT_PUBLIC_` untuk variabel AI karena akan membocorkan konfigurasi ke browser.
