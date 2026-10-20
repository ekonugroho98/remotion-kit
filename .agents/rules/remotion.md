---
trigger: always_on
description: "Aturan wajib produksi video Remotion 4.x x Antigravity Studio di repo remotion-kit"
---

# Aturan Produksi Video Remotion 4.x × Antigravity

Saat mengerjakan tugas pembuatan atau pengeditan video di repo `remotion-kit` ini, kamu **WAJIB** mengikuti seluruh panduan di `CLAUDE.md` serta skill `.agents/skills/antislop-video/SKILL.md` dan `.agents/skills/antislop-voice/SKILL.md`:

1. **Baca Bahan Dulu**: Selalu baca `public/<slug>/transcript.txt` (untuk frame/detik setiap kata) dan `public/<slug>/concept.md` (untuk style & brief), serta cek semua file di `public/<slug>/assets/`.
2. **Wajib Tampilkan Aset Gambar (`V-03`)**: Jika ada file gambar di `public/<slug>/assets/`, tampilkan di dalam adegan yang relevan menggunakan `<Img src={staticFile('<slug>/assets/<nama-file>')} />` dari paket `'remotion'` (jangan pernah gunakan tag `<img>` HTML biasa, bar skeleton abu-abu kosong, atau emoji dekoratif `🚀🔥✅`).
3. **Animasi Deterministik & Hierarki Fokus (`V-01`, `V-06`)**: Gunakan `useCurrentFrame()`, `spring()`, dan `interpolate(..., { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })`. Dilarang menggunakan CSS `transition` atau `@keyframes`. Gunakan *staggered entrance* agar hanya 1 elemen fokus yang bergerak aktif di satu waktu.
4. **Arsitektur 4-Layer (`1080×1920`) & Glow Dose Cap (`V-02`, `V-05`)**:
   - `<BackgroundCanvas />` (dark dot-matrix / light grid + radial spotlight glow)
   - `<TopHudBar />` (header pill + frame counter + step progress bar)
   - `<SceneHeader />` (soft multi-layer neon bloom khusus pada 1–2 kata kunci headline tanpa kotak kaku) + Main Stage Cards (`WindowCard`, `PromptInputCard`, `AnimatedCursor`) dengan border tipis `1px`
   - `<KaraokeSubtitle />` (1 baris di zona aman `bottom: 185px`, maks 4 kata per frasa) + `<DiagonalStripeTransition />` + SFX dari `public/sfx/`.
5. **Anti-Slop Voice AI (`VO-01`..`VO-06`)**: Naskah VO wajib menggunakan kalimat lisan pendek (8–12 kata per napas, tanpa em-dash `—`), diproses lewat `scripts/generate-vo.py` yang menerapkan *Indonesian Smart Phonetic G2P* (`Rp9rb` $\rightarrow$ `sembilan-ribu-rupiah`, `AI` $\rightarrow$ `e-ai`, `Remotion` $\rightarrow$ `rimousyen`) serta filter *FFmpeg Warm Broadcast EQ*.
6. **Verifikasi Visual Wajib (`V-07`)**: Sebelum melapor selesai, selalu jalankan `npx tsc --noEmit` dan `node scripts/verify-stills.mjs <CompId>`, lalu periksa hasil gambar still di `out/stills/<CompId>/`.
