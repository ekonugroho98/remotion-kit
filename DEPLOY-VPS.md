# Panduan Deploy Otomatis di VPS (`DEPLOY-VPS.md`)

Dokumen ini ditulis khusus untuk **Agent VPS (Hermes / Server Admin)** maupun eksekusi manual agar layanan **Remotion × Antigravity Studio (`remotion-kit`)** berjalan permanen di VPS Ubuntu/Debian dengan reverse proxy **Caddy**.

---

## 1. Arsitektur Layanan & Rekomendasi Subdomain

Project ini menjalankan **2 web service** secara bersamaan lewat `npm run studio`:

| Layanan | Port Lokal | Fungsi | Rekomendasi Subdomain (`cortex-ai.my.id`) | Alternatif Subdomain |
| :--- | :--- | :--- | :--- | :--- |
| **Prep Panel** | `127.0.0.1:3030` | Dashboard persiapan bahan video (pilih 25+ style, generate Voice-Over + timestamp `data.json`, upload gambar, & generate `prompt.txt`) | **`prep.cortex-ai.my.id`** | `motion.cortex-ai.my.id` |
| **Remotion Studio** | `127.0.0.1:3000` | Live preview animasi per frame di browser & tombol Render MP4 | **`remotion.cortex-ai.my.id`** | `studio.cortex-ai.my.id` |

---

## 2. Langkah Instalasi untuk Agent VPS

Jalankan perintah berikut secara berurutan di **Host VPS**:

### Langkah A — Clone Repository
```bash
sudo mkdir -p /opt/remotion-kit
sudo chown -R $(whoami):$(whoami) /opt/remotion-kit
git clone https://github.com/ekonugroho98/remotion-kit.git /opt/remotion-kit
cd /opt/remotion-kit
```

### Langkah B — Install Dependensi Sistem, Node 20+, FFmpeg, Python `edge-tts`, & Chromium
```bash
cd /opt/remotion-kit
bash scripts/setup-vps.sh
```
*(Script ini otomatis menginstal library Linux untuk Headless Chromium, `ffmpeg`, `fonts-noto`, `edge-tts`, `npm install`, dan `npx remotion browser ensure`).*

---

## 3. Pasang Systemd Service (Agar Jalan Permanen & Auto-Restart)

Buat file service `/etc/systemd/system/remotion-kit.service`:

```bash
sudo tee /etc/systemd/system/remotion-kit.service > /dev/null <<EOF
[Unit]
Description=Remotion x Antigravity Studio (3000) & Prep Panel (3030)
After=network.target

[Service]
Type=simple
User=$(whoami)
WorkingDirectory=/opt/remotion-kit
Environment=NODE_ENV=production
Environment=PORT=3030
Environment=STUDIO_PORT=3000
Environment=HOST=127.0.0.1
ExecStart=/usr/bin/npm run studio
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl daemon-reload
sudo systemctl enable --now remotion-kit.service
sudo systemctl status remotion-kit.service --no-pager
```

---

## 4. Konfigurasi Reverse Proxy Caddy (`/etc/caddy/Caddyfile`)

Tambahkan 2 blok subdomain berikut ke dalam `/etc/caddy/Caddyfile`:

```caddyfile
prep.cortex-ai.my.id {
    reverse_proxy 127.0.0.1:3030
}

remotion.cortex-ai.my.id {
    reverse_proxy 127.0.0.1:3000
}
```

Lalu validasi dan reload Caddy:
```bash
sudo caddy validate --config /etc/caddy/Caddyfile
sudo systemctl reload caddy
```

*(Pastikan DNS A Record untuk `prep` dan `remotion` di Cloudflare/DNS provider sudah diarahkan ke IP publik VPS).*

---

## 5. Verifikasi Pasca-Deploy (Checklist Wajib Agent VPS)

Setelah langkah 1–4 selesai, jalankan pengecekan berikut dan laporkan hasilnya ke user:

```bash
# 1. Cek port lokal Prep Panel (harus HTTP 200)
curl -sI http://127.0.0.1:3030 | head -n 5

# 2. Cek port lokal Remotion Studio (harus HTTP 200)
curl -sI http://127.0.0.1:3000 | head -n 5

# 3. Tes render 1 frame still untuk memastikan Headless Chromium di VPS berjalan normal
cd /opt/remotion-kit
npx remotion still KarayaShowcase out/vps-test.png --frame=55 --scale=0.5
ls -lh out/vps-test.png
```
