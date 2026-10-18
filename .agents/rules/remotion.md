---
trigger: always_on
description: "Aturan wajib produksi video Remotion 4.x x Antigravity Studio di repo remotion-kit"
---

# Aturan Produksi Video Remotion 4.x × Antigravity

Saat mengerjakan tugas pembuatan atau pengeditan video di repo `remotion-kit` ini, kamu **WAJIB** mengikuti seluruh panduan di `CLAUDE.md`:

1. **Baca Bahan Dulu**: Selalu baca `public/<slug>/transcript.txt` (untuk frame/detik setiap kata) dan `public/<slug>/concept.md` (untuk style & brief), serta cek semua file di `public/<slug>/assets/`.
2. **Wajib Tampilkan Aset Gambar**: Jika ada file gambar di `public/<slug>/assets/`, tampilkan di dalam adegan yang relevan menggunakan `<Img src={staticFile('<slug>/assets/<nama-file>')} />` dari paket `'remotion'` (jangan pernah gunakan tag `<img>` HTML biasa).
3. **Animasi Deterministik**: Gunakan `useCurrentFrame()`, `spring()`, dan `interpolate(..., { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })`. Dilarang menggunakan CSS `transition` atau `@keyframes`.
4. **Arsitektur 4-Layer (`1080×1920`)**:
   - `<BackgroundCanvas />` (dark dot-matrix / light grid + radial spotlight glow)
   - `<TopHudBar />` (header pill + frame counter + step progress bar)
   - `<SceneHeader />` (soft multi-layer neon bloom tanpa kotak kaku) + Main Stage Cards (`WindowCard`, `PromptInputCard`, `AnimatedCursor`)
   - `<KaraokeSubtitle />` (1 baris, maks 4 kata per frasa) + `<DiagonalStripeTransition />` + SFX dari `public/sfx/`.
5. **Verifikasi Visual Wajib**: Sebelum melapor selesai, selalu jalankan `npx tsc --noEmit` dan `node scripts/verify-stills.mjs <CompId>`, lalu periksa hasil gambar still di `out/stills/<CompId>/`.
