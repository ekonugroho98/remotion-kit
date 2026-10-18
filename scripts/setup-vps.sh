#!/usr/bin/env bash
set -euo pipefail

echo "========================================================"
echo "🚀 Setup Remotion × Antigravity Studio untuk VPS (Ubuntu/Debian)"
echo "========================================================"

# 1. Update & install paket sistem yang wajib untuk Headless Chromium (Remotion) + Audio
echo "📦 [1/4] Menginstal paket Linux untuk Headless Browser & FFmpeg..."
sudo apt-get update -y
sudo apt-get install -y \
  curl \
  git \
  ffmpeg \
  python3 \
  python3-pip \
  python3-venv \
  fonts-noto-core \
  fonts-noto-color-emoji \
  libnss3 \
  libatk1.0-0 \
  libatk-bridge2.0-0 \
  libcups2 \
  libdrm2 \
  libxkbcommon0 \
  libxcomposite1 \
  libxdamage1 \
  libxfixes3 \
  libxrandr2 \
  libgbm1 \
  libpango-1.0-0 \
  libcairo2 \
  libasound2t64 || sudo apt-get install -y libasound2

# 2. Pastikan Node.js >= 20 terpasang
if ! command -v node >/dev/null 2>&1 || [ "$(node -v | cut -d. -f1 | tr -d 'v')" -lt 20 ]; then
  echo "🟢 [2/4] Menginstal Node.js 20 LTS..."
  curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
  sudo apt-get install -y nodejs
else
  echo "✅ [2/4] Node.js sudah terpasang: $(node -v)"
fi

# 3. Install library Python untuk Voice-Over otomatis (edge-tts)
echo "🎙️ [3/4] Menginstal Python edge-tts untuk auto Voice-Over + Word Timestamps..."
pip3 install --break-system-packages edge-tts || pip3 install edge-tts

# 4. Install dependencies NPM & download Headless Browser Remotion
echo "🎬 [4/4] Menginstal paket NPM & Remotion Browser..."
npm install
npx remotion browser ensure

echo ""
echo "========================================================"
echo "✅ SETUP VPS SELESAI!"
echo "--------------------------------------------------------"
echo "Cara menjalankan:"
echo "  npm run studio"
echo ""
echo "Akses dari laptop kamu (pilih salah satu):"
echo "  A) Lewat SSH Tunnel (Paling Aman, tanpa buka port firewall):"
echo "     ssh -L 3000:localhost:3000 -L 3030:localhost:3030 user@IP-VPS"
echo "     Lalu buka di browser Mac: http://localhost:3030 & http://localhost:3000"
echo ""
echo "  B) Render video langsung ke MP4 lewat terminal VPS:"
echo "     npx remotion render KarayaShowcase out/karaya-showcase.mp4"
echo "========================================================"
