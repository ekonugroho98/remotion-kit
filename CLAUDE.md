# CLAUDE.md — Panduan & Aturan Wajib Produksi Video Remotion 4.x × Antigravity

Repo ini adalah studio produksi video motion graphics berbasis kode (**Remotion 4.x + React 18 + TypeScript**) untuk membuat video vertikal (`9:16 • 1080×1920`) maupun landscape (`16:9 • 1920×1080`) dengan kualitas setara studio profesional (`@galihry.id` / `GalihLabs`).

Semua AI Agent (**Antigravity**, **Claude Code**, **Hermes**, **Cursor**) yang menulis atau memodifikasi video di repo ini **WAJIB** mematuhi seluruh aturan arsitektur, teknis Remotion, resep style, dan verifikasi visual di bawah ini.

---

## 1. Alur Kerja Standar (`public/<slug>/` → Komponen React → Verifikasi Still)

Setiap project video memiliki folder bahan di `public/<slug>/` yang dihasilkan oleh **Prep Panel (`http://localhost:3030` / `prep.cortex-ai.my.id`)**:
- `public/<slug>/audio.wav` — File suara Voice-Over utama.
- `public/<slug>/data.json` & `transcript.txt` — Transkrip dengan **word-level timestamps** (`words` dan `phrases`, maksimal 4 kata per baris) untuk sinkronisasi adegan dan subtitle karaoke.
- `public/<slug>/concept.md` — Brief singkat, pilihan style (`L01`–`L25`), dan resep gaya visual.
- `public/<slug>/prompt.txt` — Spesifikasi lengkap tugas untuk AI Agent.
- `public/<slug>/assets/` — Gambar/screenshot/logo pendukung yang di-upload user (opsional).

Saat user meminta pembuatan/perubahan video dari `public/<slug>/`:
1. **Baca Bahan**: Baca `public/<slug>/transcript.txt` dan `public/<slug>/concept.md` terlebih dahulu, lalu cek semua file di `public/<slug>/assets/`.
2. **Peta Frame (`<Sequence>`)**: Bagi adegan menggunakan `<Sequence from={...} durationInFrames={...}>` berdasarkan nomor frame (`F0000`) yang tertera di `transcript.txt` agar visual masuk 100% sinkron dengan kalimat yang diucapkan VO.
3. **Tulis Kode Komponen**: Buat file `src/<slug>/<CompId>Video.tsx` dan daftarkan `<Composition id="<CompId>" ... />` di `src/Root.tsx` dengan `durationInFrames={data.durationInFrames}`.
4. **Verifikasi Visual Wajib**: Jalankan `npx tsc --noEmit` dan `node scripts/verify-stills.mjs <CompId>` lalu lihat hasil gambar PNG di `out/stills/<CompId>/` sebelum melapor selesai.

---

## 2. Aturan Teknis Remotion 4.x (Dilarang Melanggar!)

1. **Import Resmi Remotion**:
   - Selalu gunakan komponen dari paket `'remotion'`:
     ```tsx
     import {
       AbsoluteFill,
       Audio,
       Img,
       Sequence,
       interpolate,
       spring,
       staticFile,
       useCurrentFrame,
       useVideoConfig,
     } from 'remotion';
     ```
2. **Wajib Pakai `<Img>` + `staticFile()`, DILARANG Pakai `<img>` Biasa**:
   - Jika ada gambar di `public/<slug>/assets/<nama-file>`, **WAJIB** merendernya dengan:
     ```tsx
     <Img
       src={staticFile(`${slug}/assets/${fileName}`)}
       style={{ width: ..., height: ..., objectFit: 'contain' }}
     />
     ```
   - Tag `<img>` HTML biasa menyebabkan gambar berkedip (*flicker*) atau gagal termuat saat proses `remotion render`.
3. **Semua Animasi Wajib Berdasarkan `useCurrentFrame()`**:
   - **DILARANG KERAS** memakai CSS transition (`transition: all 0.3s`), CSS `@keyframes`, atau `setTimeout`. Semua perubahan posisi, ukuran, rotasi, dan opacity **harus** dihitung secara deterministik dari `const frame = useCurrentFrame()`.
4. **Gunakan `spring()` & `interpolate()` dengan Clamping**:
   - Untuk kemunculan elemen, selalu gunakan:
     ```tsx
     const enter = spring({ frame, fps, config: { damping: 14, stiffness: 150 } });
     ```
   - Setiap pemanggilan `interpolate()` **WAJIB** menyertakan `{ extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }` agar nilai tidak bocor di luar rentang frame.
5. **Font Global Sans-Serif di Dalam `<Sequence>`**:
   - Di dalam wrapper utama `<AbsoluteFill>`, selalu sertakan tag `<style>{'* { box-sizing: border-box; font-family: "Plus Jakarta Sans", "Noto Sans KR", -apple-system, BlinkMacSystemFont, sans-serif; }'}</style>` agar semua elemen di dalam `<Sequence>` tidak jatuh ke font serif default browser.

---

## 3. Arsitektur 4-Layer Kanvas (`1080 × 1920`)

Setiap adegan wajib disusun dalam 4 zona vertikal agar rapi dan tidak pernah bertumpukan (*overlap*):

1. **Layer 1 — Dynamic Background (`<BackgroundCanvas />`)**:
   - Mode `dark` (`#0F0F0E` dengan dot-matrix halus & radial spotlight glow di tengah) atau `light` (`#F4F1EA` kertas krem dengan grid halus).
   - Ganti warna aksen (`coral`, `green`, `purple`, `blue`, `gold`) di setiap pergantian bab/langkah.
2. **Layer 2 — Top HUD Bar (`Y: 60px – 180px`, `<TopHudBar />`)**:
   - Pill kiri atas (`REMOTION × ANTIGRAVITY` dengan spark berputar), pill kanan atas (`FRAME 0000`), dan progress bar 4 langkah di bawahnya.
3. **Layer 3 — Main Stage (`Y: 220px – 1480px`)**:
   - **Bagian Atas (`Y: 220px – 520px`)**: `<SceneHeader />` berisi badge langkah (`01 LANGKAH PERTAMA`), Headline **2–3 baris huruf kapital ekstrabal (`82px–92px`)** dengan kata kunci diberi *soft multi-layer neon bloom* (bukan kotak kaku), serta `subtitleLines` opsional di bawahnya.
   - **Bagian Tengah (`Y: 540px – 1460px`)**: Panggung visual utama. Gunakan `<WindowCard />` (dengan `tilt3D`), `<PromptInputCard />` (dengan chip miring `skewX(-8deg)`), `<FloatingSticker />`, `<AnimatedCursor />`, dan tampilkan gambar dari `public/<slug>/assets/` jika tersedia.
   - **Aturan Anti-Sesak**: Maksimal 3–4 kartu/elemen utama per layar. Ukuran font minimal `20px` untuk label kecil dan `32px–76px` untuk judul kartu.
4. **Layer 4 — Karaoke Subtitle 1 Baris (`Y: 1620px – 1820px`, `<KaraokeSubtitle />`) & Transisi**:
   - Subtitle di bawah layar maksimal **4 kata per frasa** (`max 25 karakter`) agar selalu muat **1 baris horizontal**, dengan kata aktif meloncat halus (`translateY(-5px)`) dan berpendar sesuai warna aksen scene.
   - Pasang `<DiagonalStripeTransition startFrame={...} />` + `<Audio src={staticFile('sfx/whoosh.wav')} />` di setiap perpindahan adegan utama.

---

## 4. Kamus Resep Gaya Visual (`L01` s/d `L25`)

Sesuaikan tata letak panggung tengah (Layer 3) dengan style yang dipilih di `concept.md`:

- **`L01 — Minimalist / AGY Dark UI`**: Kanvas `#0F0F0E`, aksen `#E87B58` (coral) & `#8AC98A` (sage green), kartu UI gelap `#171716` dengan border `#2D2C2A`, window 3D tilt, kursor interaktif.
- **`L02 — Kinetic Typography`**: Fokus pada tipografi raksasa yang bergerak dinamis mengikuti ketukan kata VO (`spring` cepat `stiffness: 220, damping: 12`), kata kunci meledak/scale-up dengan *neon bloom* kuat, badge kata kunci miring (`skewX(-8deg)`), dipadukan kartu visual yang ringkas dan punchy.
- **`L03 — Isometric 3D Cards`**: Semua kartu utama diberi transformasi perspektif 3D (`perspective(1100px) rotateX(8deg) rotateY(-10deg)`), bayangan berlapis dalam, dan stiker melayang di sekitarnya.
- **`L04 — Paper / Editorial Light`**: Mode `theme="light"` (`#F4F1EA`), kartu putih gading `#FFFFFF` dengan border tegas `#1A1A18`, tipografi kontras hitam pekat & aksen terakota.
- **`L05 — Neon Cyberpunk Glow`**: Kanvas hitam pekat `#09090D`, pendaran ganda ungu `#B58DED` & biru siber `#7CA6D8`, garis border bercahaya.
- **`L06` s/d `L25`**: Ikuti karakter nama style di `concept.md` sambil tetap menjaga keterbacaan di layar vertikal HP dan struktur 4-layer di atas.

---

## 5. Aturan Wajib Anti-Slop Video (`V-01`..`V-08`) & Anti-Slop Voice (`VO-01`..`VO-06`)

Sebelum menulis naskah VO atau kode komponen Remotion, terapkan filter **Anti-Slop Video** (`.agents/skills/antislop-video/SKILL.md`) dan **Anti-Slop Voice** (`.agents/skills/antislop-voice/SKILL.md`):

### A. Anti-Slop Video (Motion Graphics & Layout)
- **V-01 (Single Focal Motion):** Jangan menggerakkan semua elemen bersamaan. Gunakan *staggered spring entrance* (`F00–F08` headline, `F06–F16` kartu utama); setelah masuk, elemen pendukung diam dan hanya 1 elemen fokus (kata kunci aktif atau kursor) yang bergerak.
- **V-02 (Strict Glow Dose Cap):** Dilarang memberi glow pada semua border kartu dan background. *Soft multi-layer neon bloom* hanya boleh dipasang pada **1–2 kata kunci utama di headline**; kartu tetap memakai border struktural tipis `1px` (`#2D2C2A`).
- **V-03 (Real Assets Only & Zero Emoji Slop):** Dilarang membuat bar *skeleton* abu-abu kosong, statistik karangan (`10K+ Users`), atau menaruh emoji dekoratif (`🚀`, `🔥`, `✅`) di judul. Wajib merender aset asli dari `public/<slug>/assets/` via `<Img src={staticFile(...)} />`.
- **V-04 (Audio-Driven Cut):** Dilarang membagi durasi `<Sequence>` rata tanpa melihat transkrip. Semua perpindahan scene wajib mengikuti batas frame kalimat (`F0000`) di `public/<slug>/transcript.txt`.
- **V-05 (1-Line Safe-Zone Subtitle):** `<KaraokeSubtitle />` wajib tetap **1 baris horizontal** (maksimal 4 kata / 25 karakter) di zona aman `bottom: 185px` (`Y: 1620px–1820px`) agar tidak bertabrakan dengan tombol UI Reels/TikTok/Shorts.

### B. Anti-Slop Voice AI (Naskah Tutur, G2P & Broadcast Audio)
- **VO-01 (Bahasa Tutur 1 Napas):** Naskah VO wajib menggunakan kalimat lisan pendek (**8–12 kata per tarikan napas**), tanpa *em-dash* (`—`), dan tanpa struktur terjemahan kaku (*"Di era digital saat ini..."*, *"Bukan hanya X, tapi juga Y"*).
- **VO-02 (Smart Indonesian G2P Phonetic Mapping):** Saat menjalankan `scripts/generate-vo.py`, mata uang (`Rp9rb`, `Rp25.000`), dimensi (`1080x1920`, `9:16`), persentase, dan istilah Inggris (`Remotion` $\rightarrow$ `rimousyen`, `AI` $\rightarrow$ `e-ai`, `Claude` $\rightarrow$ `klod`, `DM` $\rightarrow$ `di-em`, `VPS` $\rightarrow$ `vi-pi-es`, `UI/UX` $\rightarrow$ `yu-ai/yu-eks`) otomatis dikonversi ke ejaan fonetik Indonesia untuk TTS sementara teks subtitle di `data.json` tetap memakai ejaan asli yang bersih.
- **VO-04 & VO-05 (FFmpeg Warm Broadcast Chain):** `generate-vo.py` otomatis memfilter output TTS dengan `highpass=80Hz`, `chest warmth +2dB @ 200Hz`, `de-harsh vocoder -2.5dB @ 3600Hz`, kompresor studio, normalisasi `-16 LUFS`, dan *tail pad* `0.35s` agar kata terakhir tidak pernah terpotong.
- **VO-06 (Acoustic Bed):** Selalu sertakan `public/sfx/music-loop.wav` pada `volume={0.12}`–`0.15` di bawah VO agar jeda antarkata tidak terdengar hampa.

---

## 6. Checklist Verifikasi Wajib Sebelum Selesai (Delivery Gate)

1. Jalankan `npx tsc --noEmit` — harus **0 error**.
2. Jalankan `node scripts/verify-stills.mjs <CompId>` untuk merender gambar *still frame* dari setiap adegan.
3. Periksa gambar-gambar di `out/stills/<CompId>/` secara visual: pastikan lulus **V-01 s/d V-08** (tidak ada teks bertumpukan, tidak ada gambar aset yang gepeng/pecah, glow hanya pada kata kunci headline, dan subtitle bawah tetap 1 baris rapi).
