# Remotion Motion Graphics Studio & Prep Panel (`remotion-kit`)

Studio produksi video motion graphics berbasis kode (**Remotion 4.x + React + AI Agent**) lengkap dengan **Prep Panel Web Lokal (`http://localhost:3030`)**, generator Voice-Over + Word-Level Timestamp otomatis, efek suara prosedural, dan loop verifikasi *still frame*.

---

## Cara Pakai Cepat (Langkah demi Langkah)

### 1. Jalankan Studio + Prep Panel Sekaligus
Dari folder project `remotion-kit`:
```bash
npm run studio
```
Perintah ini otomatis menyalakan 2 layanan sekaligus:
- **Prep Panel Web Lokal**: `http://localhost:3030` (tempat input naskah VO, drop aset, pilih 25+ template style, dan klik **Submit** untuk membuat `prompt.txt`).
- **Remotion Studio**: `http://localhost:3000` (tempat melihat live preview animasi per frame).

*(Atau jalankan terpisah dengan `npm run prep` untuk Prep Panel saja, dan `npm run dev` untuk Remotion Studio saja).*

---

### 2. Buat Project Video Baru Lewat Prep Panel (`http://localhost:3030`)
1. Ketik **Nama Project** (misal `promo-karaya-1`).
2. Di bagian **Voice-over**, kamu bisa:
   - Ketik naskah lalu klik **⚡ Generate VO + Timestamp** (otomatis membuat `audio.wav` dengan pelafalan istilah Inggris yang sudah disesuaikan + `data.json` & `transcript.txt` berisi waktu per kata), **ATAU**
   - Upload file `.wav` hasil unduhan dari **Google AI Studio (`gemini-2.5-flash-tts` — voice Bodi / Veda)**.
3. Upload screenshot/logo pendukung di bagian **Aset Pendukung** (opsional).
4. Pilih salah satu dari **25 Template Style Animasi** (`L01 AGY Dark UI` s/d `L25 Mixed Media`) atau upload video referensi.
5. Isi **Brief Singkat** lalu klik **Submit & Buat Prompt** → klik **Copy prompt**.

---

### 3. Minta Antigravity / Claude Code Membuat Komponen Videonya
Tempelkan isi `prompt.txt` ke chat Antigravity / Claude Code (atau cukup ketik: *"Bikin video baru dari folder `public/promo-karaya-1/` mengikuti aturan `CLAUDE.md`"*).

Agent akan:
1. Membaca `transcript.txt` & `concept.md`.
2. Membuat komponen video di `src/<project>/<Project>Video.tsx` dan mendaftarkannya di `src/Root.tsx`.
3. Menjalankan `node scripts/verify-stills.mjs <CompId>` untuk mengecek *typecheck* dan merender gambar *still frame* di `out/stills/<CompId>/` guna memastikan tidak ada teks yang bertumpukan.

---

### 4. Render Video ke File `.mp4`
Di sidebar kiri **Remotion Studio (`http://localhost:3000`)**, sudah tersedia:
- `KarayaShowcase` — Video showcase multi-scene lengkap dengan Voice-Over & Karaoke.
- `All25StylesReel` — Reel master yang menampilkan seluruh 25 style (`L01` s/d `L25`) secara berurutan.
- Folder `Templates-L01-L25` — **25 Komposisi Template Individual** (`L01-AntigravityDarkUI`, `L02-KineticTypography`, ..., `L25-MixedMedia`) yang bisa langsung diklik, dikustomisasi teks/prop-nya di Studio, dan di-render jadi MP4.

Setelah preview di `http://localhost:3000` sesuai keinginan:
```bash
npx remotion render <NamaComposition> out/<nama-file>.mp4
```
Contoh untuk video showcase bawaan atau salah satu dari 25 template:
```bash
npx remotion render KarayaShowcase out/karaya-showcase.mp4
npx remotion render L07-SwissEditorial out/swiss-editorial.mp4
```

---

## Deploy & Jalankan di VPS (Ubuntu / Debian)

1. Clone repo ini di VPS:
   ```bash
   git clone https://github.com/ekonugroho98/remotion-kit.git
   cd remotion-kit
   ```
2. Jalankan script instalasi dependensi VPS (Node 20+, FFmpeg, Headless Chromium libs, Python `edge-tts`):
   ```bash
   bash scripts/setup-vps.sh
   ```
3. Jalankan Studio + Prep Panel:
   ```bash
   npm run studio
   ```
4. Buka dari laptop lewat SSH Tunnel:
   ```bash
   ssh -L 3000:localhost:3000 -L 3030:localhost:3030 user@IP_VPS
   ```
   Lalu akses `http://localhost:3030` (Prep Panel) dan `http://localhost:3000` (Remotion Studio).

