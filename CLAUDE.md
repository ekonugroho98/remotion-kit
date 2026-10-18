# CLAUDE.md — Aturan Produksi Video Motion Graphics (Remotion × AI Studio Kit)

Repo ini adalah studio produksi video programatik berbasis **Remotion 4.x + React + TypeScript** yang dirancang untuk menghasilkan video vertikal (`9:16 • 1080×1920`) maupun landscape (`16:9 • 1920×1080`) selevel kreator motion graphics profesional (`@galihry.id` / `GalihLabs`).

---

## 1. Alur Kerja Standar (`public/<slug>/` → Komponen React → Verifikasi Still)

Setiap project video memiliki folder bahan di `public/<slug>/` yang disiapkan oleh **Prep Panel (`http://localhost:3030`)** atau CLI:
- `public/<slug>/audio.wav` — Voice-over utama.
- `public/<slug>/data.json` & `transcript.txt` — Transkrip dengan **word-level timestamps** (`words` dan `phrases`) untuk sinkronisasi adegan dan subtitle karaoke.
- `public/<slug>/concept.md` — Brief singkat, pilihan style (`L01`–`L25`), dan pembagian alur adegan.
- `public/<slug>/prompt.txt` — Instruksi lengkap spesifikasi composition.
- `public/<slug>/assets/` — Screenshot aplikasi, logo, atau video pendukung (opsional).

Saat user meminta: *"Bikin video baru dari folder `public/<slug>/`"* atau menempelkan isi `prompt.txt`, lakukan langkah berikut secara berurutan:
1. Baca **hanya** `public/<slug>/transcript.txt` dan `public/<slug>/concept.md` terlebih dahulu, serta cek daftar file di `public/<slug>/assets/`.
2. Susun pembagian frame setiap adegan (`<Sequence from={...} durationInFrames={...}>`) mengikuti detik/frame kalimat di `transcript.txt`.
3. Tulis komponen video di `src/<slug>/<CompId>Video.tsx` menggunakan komponen reusable di `src/components/`.
4. Daftarkan `<Composition id="<CompId>" ... />` di `src/Root.tsx` dengan `durationInFrames` mengikuti `data.json`.

---

## 2. Arsitektur 4-Layer yang Wajib Menempel di Semua Scene

Setiap video wajib memiliki 4 elemen permanen agar tampak hidup, konsisten, dan profesional:
1. **Layer 1 — Dynamic Background (`<BackgroundCanvas />`)**:
   - Mode `dark` (`#0F0F0E` dengan dot-matrix halus & radial spotlight glow di tengah) atau `light` (`#F4F1EA` kertas krem dengan grid halus).
   - Ubah warna aksen (`coral`, `green`, `purple`, `blue`, `gold`) setiap kali berganti bab/langkah utama.
2. **Layer 2 — Top HUD Bar (`<TopHudBar />`)**:
   - Pill kiri atas dengan ikon spark berputar (`ClaudeSparkIcon`) + pill kanan atas (nama brand atau penghitung `FRAME 0000`) + progress bar langkah di bawahnya.
3. **Layer 3 — Main Stage (`Y: 230px – 1480px`)**:
   - Bagian atas: `<SceneHeader />` berisi badge langkah (`1 LANGKAH`) dan Headline **2–3 baris huruf kapital tebal** dengan kata kunci diberi warna aksen atau `highlightBox`.
   - Bagian tengah: Gunakan `<WindowCard />` (dengan `tilt3D`), `<PromptInputCard />`, `<FloatingSticker />`, dan `<AnimatedCursor />`, atau tampilkan gambar dari `public/<slug>/assets/` dengan animasi zoom/pan halus.
   - **Aturan Anti-Berantakan**: Maksimal 3–4 elemen kartu per adegan, ukuran font minimal `20px` untuk label dan `28px–70px` untuk teks utama agar terbaca jelas di layar HP.
4. **Layer 4 — Karaoke Subtitle (`<KaraokeSubtitle />`) & Transisi (`<DiagonalStripeTransition />`)**:
   - Pasang `<KaraokeSubtitle phrases={data.phrases} />` di bagian bawah layar.
   - Pasang `<DiagonalStripeTransition startFrame={...} />` + `<Audio src={staticFile('sfx/whoosh.wav')} />` di setiap pergantian adegan utama, serta `sfx/pop.wav`, `sfx/click.wav`, dan `sfx/success.wav` pada elemen interaktif.

---

## 3. Aturan Verifikasi Kualitas (Wajib Sebelum Melapor Selesai!)

1. **Jangan pernah pakai animasi linear kaku**: Selalu gunakan `spring({ frame, fps, config: { damping: 14, stiffness: 150 } })` untuk kemunculan kartu, teks, dan stiker.
2. **Jalankan Typecheck & Visual Still Loop**:
   ```bash
   node scripts/verify-stills.mjs <CompId> <durationInFrames> 12
   ```
3. **Inspeksi Still Frame**: Lihat file gambar di `out/stills/<CompId>/` untuk memastikan tidak ada teks yang bertumpukan (*overlap*), terpotong, atau kontrasnya mati.
4. **Penutup CTA Lead Magnet (Khusus Reels/TikTok)**: Jika naskah ditutup dengan ajakan komentar (misal *"Buat yang mau link Remotion-nya, langsung comment MAU di kolom komentar!"*), tambahkan scene penutup khusus berisi kartu Faux-UI kolom komentar Instagram dengan efek ketik otomatis kata kunci (`MAU`), animasi kursor mengeklik tombol `KIRIM ↑`, dan balasan `⚡ AUTO-DM OTOMATIS TERKIRIM!`.
5. Jangan merender MP4 penuh kecuali diminta user (atau saat membuat video final dengan `npx remotion render <CompId> out/<slug>.mp4`).
