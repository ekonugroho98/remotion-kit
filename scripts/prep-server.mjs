#!/usr/bin/env node
/**
 * Local Backend Server for Prep Panel (http://localhost:3030)
 * Zero external dependencies — uses Node.js built-in http, fs, path, child_process.
 *
 * Endpoints:
 *   GET  /                     -> serves panel/index.html
 *   GET  /public/*             -> serves static files from public/ (audio, assets, prompt.txt)
 *   GET  /api/projects         -> lists projects in public/
 *   POST /api/upload           -> saves uploaded base64 file into public/<project>/ or assets/
 *   POST /api/generate-vo      -> runs scripts/generate-vo.py to create audio.wav + data.json
 *   POST /api/transcribe       -> runs scripts/transcribe-audio.py on existing audio.wav
 *   POST /api/submit           -> generates concept.md + prompt.txt inside public/<project>/
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';

const PORT = Number(process.env.PREP_PORT || 3030);
const rootDir = path.resolve(import.meta.dirname, '..');
const publicDir = path.join(rootDir, 'public');
const panelHtmlPath = path.join(rootDir, 'panel', 'index.html');

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.md': 'text/plain; charset=utf-8',
  '.wav': 'audio/wav',
  '.mp3': 'audio/mpeg',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.gif': 'image/gif',
};

function sendJson(res, status, data) {
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
  });
  res.end(JSON.stringify(data));
}

function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', (c) => chunks.push(c));
    req.on('end', () => {
      try {
        const raw = Buffer.concat(chunks).toString('utf-8');
        resolve(raw ? JSON.parse(raw) : {});
      } catch (err) {
        reject(err);
      }
    });
    req.on('error', reject);
  });
}

function sanitizeSlug(slug) {
  return String(slug || 'project-1')
    .toLowerCase()
    .replace(/[^a-z0-9-_]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '') || 'project-1';
}

function toPascalCase(slug) {
  return slug
    .split(/[-_]+/)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join('');
}

const STYLE_RECIPES = {
  L01: 'Gunakan kanvas gelap #0F0F0E dengan dot-matrix halus & radial spotlight glow. Kartu Faux-UI gelap (#171716, border #2D2C2A) dengan aksen coral (#E87B58) dan sage green (#8AC98A), kursor klik interaktif, dan window 3D tilt.',
  L02: 'KINETIC TYPOGRAPHY: Tonjolkan tipografi raksasa yang bergerak enerjik mengikuti ketukan kata di data.json (spring cepat stiffness: 220, damping: 12). Kata kunci utama diberi soft multi-layer neon bloom dan badge miring (skewX(-8deg)), dipadukan kartu visual yang punchy dan dinamis.',
  L03: 'ISOMETRIC 3D: Gunakan WindowCard dengan tilt3D aktif (perspective(1100px) rotateX(8deg) rotateY(-10deg)), bayangan berlapis dalam, dan FloatingSticker yang melayang di sekitar kartu utama.',
  L04: 'PAPER EDITORIAL: Gunakan BackgroundCanvas dengan theme="light" (#F4F1EA), kartu putih bersih dengan border kontras, dan aksen hangat terakota.',
  L05: 'NEON CYBERPUNK: Gunakan kanvas gelap pekat dengan kombinasi aksen purple (#B58DED) dan blue (#7CA6D8), pendaran neon ganda pada judul dan kartu.',
};

function getStyleRecipe(styleId, styleName) {
  if (STYLE_RECIPES[styleId]) return STYLE_RECIPES[styleId];
  return `Terapkan karakter visual "${styleName || styleId}" secara konsisten pada pemilihan warna aksen, ritme spring animation, dan tata letak kartu di panggung utama (Y: 540px–1460px).`;
}

function buildPromptTxt(payload) {
  const slug = sanitizeSlug(payload.project);
  const compId = toPascalCase(slug);
  const formatStr =
    payload.aspectRatio === '16:9'
      ? `16:9 • 1920×1080 • ${payload.fps || 30} fps`
      : `9:16 • 1080×1920 • ${payload.fps || 30} fps`;
  const codeFile = `src/${slug}/${compId}Video.tsx`;
  const assets = Array.isArray(payload.assets) ? payload.assets : [];
  const assetLines =
    assets.length > 0
      ? assets.map((a) => `  - ${a} -> gunakan <Img src={staticFile('${slug}/assets/${a}')} />`).join('\n')
      : '  - (tidak ada file aset gambar, gunakan komponen Faux-UI React murni)';

  const styleId = payload.styleId || 'L01';
  const styleName = payload.styleName || 'Minimalist / AGY Dark UI';
  const styleInfo =
    payload.styleMode === 'reference'
      ? `Clone style dari video referensi: public/${slug}/reference.mp4 (${payload.referenceNotes || 'warna, tipografi, ritme'})`
      : payload.styleMode === 'free'
      ? 'Bebas (sesuaikan otomatis dengan mood naskah & brief)'
      : `${styleId} — ${styleName} (${payload.styleDesc || ''})`;

  const styleRecipe = getStyleRecipe(styleId, styleName);

  const sourceLine =
    payload.sourceType === 'clipper'
      ? `YouTube Clipper (${payload.youtubeUrl || '-'} | segmen: ${JSON.stringify(payload.clipSegments || [])})`
      : 'Voice-over';

  return `PROMPT • REMOTION VIDEO • ${slug}
────────────────────────────────────────────────────────────

▌ TUGAS
Buat video baru "${compId}" di repo Remotion ini dari bahan yang sudah disiapkan di public/${slug}/.
Semua proses (baca transkrip, susun adegan, coding komponen React, cek still frame) dikerjakan oleh kamu (Antigravity / Claude Agent) mengikuti aturan di CLAUDE.md dan .agents/rules/remotion.md.

▌ SPESIFIKASI
• Composition id : ${compId}
• Format         : ${formatStr}
• File kode      : ${codeFile}
• Folder bahan   : public/${slug}/
• Bahasa         : ${payload.language || 'Indonesia'}
• Font           : ${payload.font || 'Plus Jakarta Sans (default)'}
• Style visual   : ${styleInfo}

▌ RESEP GAYA VISUAL (${styleId})
• ${styleRecipe}

▌ BAHAN
• Sumber utama   : ${sourceLine}
• Voice-over     : public/${slug}/audio.wav
• Word Timestamp : public/${slug}/data.json & public/${slug}/transcript.txt
• Backsound      : ${payload.backsoundFile ? `public/${slug}/${payload.backsoundFile}` : 'public/sfx/music-loop.wav'} • volume ${((payload.backsoundVolume ?? 15) / 100).toFixed(2)}
• Aset pendukung : ${assets.length} file di public/${slug}/assets/
${assetLines}
• Brief          : public/${slug}/concept.md

▌ ATURAN TEKNIS REMOTION 4.x (WAJIB DIIKUTI AGENT)
1. Import resmi dari 'remotion': AbsoluteFill, Sequence, Audio, Img, staticFile, useCurrentFrame, useVideoConfig, spring, interpolate.
2. WAJIB tampilkan semua file di public/${slug}/assets/ menggunakan <Img src={staticFile('${slug}/assets/<nama-file>')} /> (DILARANG memakai tag <img> HTML biasa agar tidak flicker saat render).
3. Susun 4-Layer Kanvas (1080×1920):
   - Layer 1: <BackgroundCanvas accent="..." /> (ganti warna aksen tiap ganti bab/langkah).
   - Layer 2: <TopHudBar leftLabel="REMOTION × ANTIGRAVITY" steps={[...]} activeStep={...} />.
   - Layer 3: <SceneHeader /> (soft neon bloom tanpa kotak kaku) + Panggung Tengah (WindowCard, PromptInputCard dengan chip miring skewX(-8deg), AnimatedCursor, dan showcase aset gambar).
   - Layer 4: <KaraokeSubtitle phrases={data.phrases} /> (1 baris, maks 4 kata) + <DiagonalStripeTransition /> + SFX dari public/sfx/.
4. Semua animasi wajib deterministik dari useCurrentFrame() + spring() / interpolate(..., { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }). Dilarang memakai CSS transition/@keyframes.

▌ INSTRUKSI EKSEKUSI
1. Baca public/${slug}/transcript.txt dan public/${slug}/concept.md.
2. Buat atau perbarui komponen video di ${codeFile} dan pastikan Composition "${compId}" terdaftar di src/Root.tsx dengan durationInFrames sesuai data.json.
3. Jalankan \`npx tsc --noEmit\` dan \`node scripts/verify-stills.mjs ${compId}\` untuk mengecek still frame kunci di out/stills/${compId}/ sebelum melapor selesai.
`;
}

function listProjects() {
  if (!fs.existsSync(publicDir)) return [];
  const entries = fs.readdirSync(publicDir, { withFileTypes: true });
  const out = [];
  for (const ent of entries) {
    if (!ent.isDirectory() || ent.name === 'sfx') continue;
    const pDir = path.join(publicDir, ent.name);
    const hasAudio = fs.existsSync(path.join(pDir, 'audio.wav'));
    const hasData = fs.existsSync(path.join(pDir, 'data.json'));
    const hasPrompt = fs.existsSync(path.join(pDir, 'prompt.txt'));
    const assetsDir = path.join(pDir, 'assets');
    const assets = fs.existsSync(assetsDir)
      ? fs.readdirSync(assetsDir).filter((f) => !f.startsWith('.'))
      : [];
    out.push({
      slug: ent.name,
      hasAudio,
      hasData,
      hasPrompt,
      assets,
    });
  }
  return out;
}

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url || '/', `http://localhost:${PORT}`);

    if (req.method === 'OPTIONS') {
      res.writeHead(204, {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      });
      return res.end();
    }

    if (req.method === 'GET' && (url.pathname === '/' || url.pathname === '/index.html')) {
      const html = fs.readFileSync(panelHtmlPath, 'utf-8');
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      return res.end(html);
    }

    if (req.method === 'GET' && url.pathname.startsWith('/public/')) {
      const rel = decodeURIComponent(url.pathname.replace(/^\/public\//, ''));
      const safePath = path.normalize(path.join(publicDir, rel));
      if (!safePath.startsWith(publicDir) || !fs.existsSync(safePath)) {
        res.writeHead(404);
        return res.end('Not found');
      }
      const ext = path.extname(safePath).toLowerCase();
      res.writeHead(200, { 'Content-Type': MIME_TYPES[ext] || 'application/octet-stream' });
      return fs.createReadStream(safePath).pipe(res);
    }

    if (req.method === 'GET' && url.pathname === '/api/projects') {
      return sendJson(res, 200, { projects: listProjects() });
    }

    if (req.method === 'POST' && url.pathname === '/api/upload') {
      const body = await readJsonBody(req);
      const slug = sanitizeSlug(body.project);
      const targetSubdir = body.kind === 'asset' ? path.join(publicDir, slug, 'assets') : path.join(publicDir, slug);
      fs.mkdirSync(targetSubdir, { recursive: true });
      const fileName = path.basename(String(body.fileName || 'file.bin'));
      const destPath = path.join(targetSubdir, fileName);
      const base64Data = String(body.dataBase64 || '').replace(/^data:[^;]+;base64,/, '');
      fs.writeFileSync(destPath, Buffer.from(base64Data, 'base64'));
      return sendJson(res, 200, {
        ok: true,
        path: `/public/${slug}/${body.kind === 'asset' ? 'assets/' : ''}${fileName}`,
        fileName,
      });
    }

    if (req.method === 'POST' && url.pathname === '/api/generate-vo') {
      const body = await readJsonBody(req);
      const slug = sanitizeSlug(body.project);
      const text = String(body.text || '').trim();
      const voice = String(body.voice || 'id-ID-ArdiNeural');
      if (!text) {
        return sendJson(res, 400, { ok: false, error: 'Teks naskah VO tidak boleh kosong' });
      }
      const projDir = path.join(publicDir, slug);
      fs.mkdirSync(projDir, { recursive: true });
      fs.writeFileSync(path.join(projDir, 'script.txt'), text, 'utf-8');

      execFileSync(
        'python3',
        [path.join(rootDir, 'scripts', 'generate-vo.py'), '--project', slug, '--text', text, '--voice', voice],
        { cwd: rootDir, stdio: 'inherit' }
      );
      const dataJson = JSON.parse(fs.readFileSync(path.join(projDir, 'data.json'), 'utf-8'));
      return sendJson(res, 200, {
        ok: true,
        audioUrl: `/public/${slug}/audio.wav?t=${Date.now()}`,
        duration: dataJson.duration,
        wordCount: dataJson.words.length,
        phraseCount: dataJson.phrases.length,
      });
    }

    if (req.method === 'POST' && url.pathname === '/api/transcribe') {
      const body = await readJsonBody(req);
      const slug = sanitizeSlug(body.project);
      const args = [path.join(rootDir, 'scripts', 'transcribe-audio.py'), '--project', slug];
      if (body.text) {
        args.push('--text', String(body.text));
      }
      execFileSync('python3', args, { cwd: rootDir, stdio: 'inherit' });
      const dataJson = JSON.parse(fs.readFileSync(path.join(publicDir, slug, 'data.json'), 'utf-8'));
      return sendJson(res, 200, {
        ok: true,
        duration: dataJson.duration,
        wordCount: dataJson.words.length,
      });
    }

    if (req.method === 'GET' && url.pathname === '/api/download-bundle') {
      const slug = sanitizeSlug(url.searchParams.get('project') || 'karaya-showcase');
      const projDir = path.join(publicDir, slug);
      if (!fs.existsSync(projDir)) {
        res.writeHead(404);
        return res.end('Project folder not found');
      }
      const tarPath = path.join('/tmp', `${slug}-remotion-kit.tar.gz`);
      const candidates = [
        'package.json',
        'package-lock.json',
        'tsconfig.json',
        'remotion.config.ts',
        'CLAUDE.md',
        'README.md',
        '.gitignore',
        '.agents',
        'src',
        'scripts',
        'public/sfx',
        `public/${slug}`,
      ];
      const itemsToPack = candidates.filter((item) => fs.existsSync(path.join(rootDir, item)));
      execFileSync('tar', ['-czf', tarPath, ...itemsToPack], { cwd: rootDir });
      res.writeHead(200, {
        'Content-Type': 'application/gzip',
        'Content-Disposition': `attachment; filename="${slug}-remotion-kit.tar.gz"`,
      });
      return fs.createReadStream(tarPath).pipe(res);
    }

    if (req.method === 'POST' && url.pathname === '/api/submit') {
      const body = await readJsonBody(req);
      const slug = sanitizeSlug(body.project);
      const projDir = path.join(publicDir, slug);
      const assetsDir = path.join(projDir, 'assets');
      fs.mkdirSync(assetsDir, { recursive: true });

      const existingAssets = fs.readdirSync(assetsDir).filter((f) => !f.startsWith('.'));
      const payload = { ...body, project: slug, assets: existingAssets };
      const styleId = payload.styleId || 'L01';
      const styleName = payload.styleName || 'Antigravity Dark UI';

      const conceptMd = `# Concept & Brief — ${slug}

- **Format**: ${payload.aspectRatio || '9:16'} @ ${payload.fps || 30} fps
- **Style**: ${styleId} — ${styleName}
- **Font**: ${payload.font || 'Plus Jakarta Sans (default)'}
- **Bahasa**: ${payload.language || 'Indonesia'}
- **Aset Gambar**: ${existingAssets.length > 0 ? existingAssets.join(', ') : 'Tidak ada'}

## Resep Gaya Visual (${styleId})
${getStyleRecipe(styleId, styleName)}

## Brief / Alur Cerita
${payload.brief || 'Buat video motion graphic edukatif dengan hook kuat di 3 detik pertama, animasi spring halus, dan subtitle karaoke otomatis.'}
`;
      fs.writeFileSync(path.join(projDir, 'concept.md'), conceptMd, 'utf-8');

      const promptTxt = buildPromptTxt(payload);
      fs.writeFileSync(path.join(projDir, 'prompt.txt'), promptTxt, 'utf-8');

      return sendJson(res, 200, {
        ok: true,
        project: slug,
        promptPath: `public/${slug}/prompt.txt`,
        promptTxt,
      });
    }

    res.writeHead(404);
    res.end('Not found');
  } catch (err) {
    console.error('[prep-server] Error:', err);
    sendJson(res, 500, { ok: false, error: String(err.message || err) });
  }
});

const HOST = process.env.HOST || '0.0.0.0';
server.listen(PORT, HOST, () => {
  console.log(`\n✨ Remotion Prep Panel running at: http://localhost:${PORT} (bound to ${HOST}:${PORT})`);
});

