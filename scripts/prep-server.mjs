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
  L01: 'ANTIGRAVITY DARK UI (archetype: faux-ui, mode: dark): Kanvas #0F0F0E dot-matrix dengan spotlight coral #E07A5F & sage green #56C288. Gunakan <BackgroundCanvas styleId="L01" />, <WindowCard /> gelap (#181816), chip parameter miring skewX(-8deg), dan <AnimatedCursor />.',
  L02: 'KINETIC TYPOGRAPHY (archetype: kinetic-type, mode: dark): Kanvas karbon #0B0B0C dengan aksen kuning #FACC15 (kontras 12.8:1). Gunakan spring cepat (stiffness: 220, damping: 12), blok kata raksasa bertumpuk di <TemplateStage preset={getStylePreset("L02")} />, dan badge miring skewX(-8deg).',
  L03: 'ISOMETRIC 3D (archetype: isometric-3d, mode: light): Kanvas terang #EEF2FF, kartu #FFFFFF, teks indigo #1E1B4B, dan aksen #4338CA. Aktifkan perspektif 3D berlapis (perspective(1200px) rotateX(8deg) rotateY(-7deg)) untuk memvisualisasikan layer sistem.',
  L04: 'DOODLE / HAND-DRAWN (archetype: handcrafted-board, mode: light): Kanvas kertas krem #FFFBEB, kartu #FFFFFF ber-border tinta #1C1917 (2.5px) dengan hard offset shadow dan aksen amber #B45309 serta pita perekat di bagian atas kartu.',
  L05: 'COMIC / POP ART (archetype: pop-brutalist, mode: light): Kanvas kuning pop #FEF08A dengan pola halftone dots, kartu putih ber-border hitam tebal 3.5px (#18181B), bayangan blok keras (10px 10px 0px #18181B), dan aksen crimson #BE123C.',
  L06: '3D / CGI MOTION (archetype: isometric-3d, mode: dark): Kanvas deep-space #0D0B26 dengan cincin konsentris halus (pattern: rings), kartu #17143A ber-rim violet #C084FC & cyan #38BDF8, serta kemiringan 3D perspektif penuh.',
  L07: 'SWISS / EDITORIAL (archetype: editorial-grid, mode: light): Kanvas kertas arsip #F4F1EA, garis bantu struktural 1.5px #141413 (pattern: editorial-lines), sudut tajam (radius 6px), penomoran indeks 01/02/03, dan aksen merah vermilion #B83B22.',
  L08: 'GLITCH / DIGITAL (archetype: cyber-digital, mode: dark): Kanvas hitam #09090B (pattern: diagonal) dengan aksen cyan #22D3EE dan crimson #F43F5E. Tampilkan panel telemetri monospace, bar spektrum frekuensi, dan indikator status sistem.',
  L09: 'MEMPHIS GEOMETRIC (archetype: pop-brutalist, mode: light): Kanvas peach terang #FFF7ED (pattern: cross), kartu putih ber-border hitam 3px (#18181B), bayangan blok tegas, dan aksen magenta #BE185D serta indigo #4338CA.',
  L10: 'INFOGRAPHIC DATA (archetype: data-product, mode: dark): Kanvas navy #0B1120 dengan grid presisi, kartu #15203B, aksen sky-blue #38BDF8 & emerald #34D399. Tampilkan grafik bar horizontal teranimasi dengan persentase tabular jelas.',
  L11: 'PAPER CUTOUT (archetype: handcrafted-board, mode: light): Kanvas kertas kerajinan #F2ECE1 dengan kartu berlapis #FFFDF9, teks #1C1917, aksen hijau hutan #166534 (kontras WCAG AA 6.08:1), dan rotasi halus tiap kartu.',
  L12: '2D CHARACTER / DIALOG (archetype: data-product, mode: light): Kanvas mint lembut #ECFDF5 dengan teks zamrud pekat #064E3B (9.2:1) dan aksen terakota #C2410C. Susun kartu tanya-jawab edukatif bersudut membulat 26px.',
  L13: 'LIQUID MOTION (archetype: cyber-digital, mode: dark): Kanvas velvet gelap #0E0720 (pattern: rings) dengan kartu #1A1036 bersudut 28px, aksen lavender #D8B4FE (11.1:1), dan gelombang bar frekuensi yang bergerak organik.',
  L14: 'FLAT DESIGN CLEAN (archetype: faux-ui, mode: light): Kanvas biru es terang #F0F9FF, kartu putih #FFFFFF bersih, teks biru tua #0C4A6E, dan aksen #0369A1 dengan fokus penuh pada keterbacaan.',
  L15: 'CORPORATE GROWTH (archetype: data-product, mode: light): Kanvas bersih #F8FAFC (pattern: editorial-lines), kartu putih #FFFFFF dengan teks slate gelap #0F172A (17:1) dan aksen royal blue #1D4ED8 untuk laporan metrik B2B/SaaS.',
  L16: 'RETRO / VINTAGE (archetype: editorial-grid, mode: light): Kanvas perkamen hangat #F5E6C8, kartu #FFF9ED ber-border espresso #271609 (2px) dengan hard shadow, aksen rust #9A3412, dan tata letak indeks arsip klasik.',
  L17: 'CYBERPUNK NEON (archetype: cyber-digital, mode: dark): Kanvas malam #12071F dengan kartu #1E0E33, aksen electric cyan #38BDF8 & neon pink #F472B6, visualizer spektrum, dan pendaran glow terkontrol pada kata kunci utama.',
  L18: 'ABSTRACT PARTICLES (archetype: cyber-digital, mode: dark): Kanvas obsidian #0A0A0E dengan dot-matrix rapat, kartu #15151E, dan aksen rose-pink #F472B6 bersama visualizer spektrum audio broadcast.',
  L19: 'KINETIC COLLAGE (archetype: kinetic-type, mode: light): Kanvas kertas zine #EFECE6 dengan pola garis diagonal, kartu potongan tajam ber-border hitam 2.5px (#18181B), hard shadow, dan aksen merah cetak #B91C1C.',
  L20: 'UI/UX APP PROMO (archetype: data-product, mode: light): Kanvas terang #F8FAFC, kartu mockup produk #FFFFFF dengan aksen deep violet #6D28D9 (7.1:1) dan progress bar metrik adopsi fitur.',
  L21: 'CLAYMATION 3D (archetype: isometric-3d, mode: light): Kanvas kuning mentega hangat #FEF3C7, kartu #FFFBEB bersudut ekstra membulat 30px, teks cokelat tua #291809, dan aksen terakota #C2410C dengan perspektif 3D.',
  L22: 'STOP MOTION (archetype: handcrafted-board, mode: dark): Kanvas papan kayu gelap #261B12 (pattern: cross), kartu #38281C dengan aksen sticky-note kuning #FDE047 (10.7:1), dan kuantisasi frame steppedFrames=2 (sensasi 12fps stop-motion).',
  L23: 'PARALLAX 2.5D (archetype: isometric-3d, mode: dark): Kanvas midnight #0B1120 dengan kartu #172136 dan aksen sky-ice #7DD3FC. Gunakan susunan layer 3D bertingkat dengan kecepatan paralaks berbeda.',
  L24: 'CINEMATIC TRAILER (archetype: kinetic-type, mode: dark): Kanvas deep cinema teal #081014 (pattern: editorial-lines) dengan kartu #111E26 dan aksen warm gold #FDE047 (12.8:1). Gunakan spring lambat-berwibawa (stiffness: 130, damping: 17).',
  L25: 'MIXED MEDIA (archetype: editorial-grid, mode: light): Kanvas kertas hangat #F3EDE2 (pattern: cross) dipadukan kartu putih ber-border hitam 2px (#18181B), hard shadow, dan aksen crimson #BE123C serta indigo #4338CA.',
};

function getStyleRecipe(styleId, styleName) {
  if (STYLE_RECIPES[styleId]) return STYLE_RECIPES[styleId];
  return `Terapkan preset visual "${styleName || styleId}" dari src/components/stylePresets.ts (getStylePreset("${styleId || 'L01'}")) secara konsisten pada kanvas, tipografi, dan panggung utama (Y: 540px–1460px).`;
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
      : '  - (tidak ada file aset gambar, gunakan komponen React & TemplateStage murni)';

  const styleId = payload.styleId || 'L01';
  const styleName = payload.styleName || 'Antigravity Dark UI';
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

▌ RESEP GAYA VISUAL & PRESET KODE (${styleId})
• ${styleRecipe}
• Preset lengkap tersedia di \`src/components/stylePresets.ts\` (\`getStylePreset('${styleId}')\`) dan panggung siap pakai di \`src/templates/TemplateStage.tsx\` (\`<TemplateStage preset={getStylePreset('${styleId}')} items={[...]} />\`).

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
3. Susun 4-Layer Kanvas (1080×1920) dengan meneruskan \`styleId="${styleId}"\`:
   - Layer 1: \`<BackgroundCanvas styleId="${styleId}" />\`.
   - Layer 2: \`<TopHudBar styleId="${styleId}" leftLabel="REMOTION × ANTIGRAVITY" steps={[...]} activeStepIndex={...} />\`.
   - Layer 3: \`<SceneHeader styleId="${styleId}" ... />\` + Panggung Tengah (\`<TemplateStage preset={getStylePreset('${styleId}')} items={[...]} />\`, \`WindowCard\`, \`PromptInputCard\`, \`AnimatedCursor\`, atau showcase aset gambar).
   - Layer 4: \`<KaraokeSubtitle styleId="${styleId}" phrases={data.phrases} />\` (1 baris, maks 4 kata) + \`<DiagonalStripeTransition />\` + SFX dari \`public/sfx/\`.
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
      const bundleName = `${slug}-remotion-kit`;
      const stageBase = fs.mkdtempSync(path.join('/tmp', 'remotion-bundle-'));
      const stageDir = path.join(stageBase, bundleName);
      fs.mkdirSync(stageDir, { recursive: true });
      const tarPath = path.join(stageBase, `${bundleName}.tar.gz`);
      const candidates = [
        'package.json',
        'package-lock.json',
        'tsconfig.json',
        'remotion.config.ts',
        'CLAUDE.md',
        'README.md',
        '.gitignore',
        '.agents',
        'panel',
        'src',
        'scripts',
        'public/sfx',
        'public/style-previews',
        'public/karaya-showcase',
        `public/${slug}`,
      ];
      for (const item of candidates) {
        const srcPath = path.join(rootDir, item);
        if (fs.existsSync(srcPath)) {
          const destPath = path.join(stageDir, item);
          fs.mkdirSync(path.dirname(destPath), { recursive: true });
          fs.cpSync(srcPath, destPath, { recursive: true });
        }
      }
      execFileSync('tar', ['-czf', tarPath, bundleName], { cwd: stageBase });
      res.writeHead(200, {
        'Content-Type': 'application/gzip',
        'Content-Disposition': `attachment; filename="${bundleName}.tar.gz"`,
      });
      const stream = fs.createReadStream(tarPath);
      stream.on('close', () => {
        fs.rmSync(stageBase, { recursive: true, force: true });
      });
      return stream.pipe(res);
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

