#!/usr/bin/env node
/**
 * Automated Visual Inspection Loop (Gaya @galihry.id / GalihLabs):
 * 1. Runs `npx tsc --noEmit` to ensure 0 TypeScript errors.
 * 2. Renders low-res keyframes across the composition into `out/stills/<CompId>/`
 *    so the AI agent (Claude Code / Antigravity) can inspect every scene visually
 *    before running a full video render.
 *
 * Usage:
 *   node scripts/verify-stills.mjs <CompositionId> [durationInFrames] [count]
 */
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const compId = process.argv[2] || 'KarayaShowcase';
const totalFrames = Number(process.argv[3] || 900);
const numSamples = Number(process.argv[4] || 12);

const rootDir = path.resolve(import.meta.dirname, '..');
const outDir = path.join(rootDir, 'out', 'stills', compId);
fs.mkdirSync(outDir, { recursive: true });

console.log(`[verify-stills] 1/2 Running TypeScript check (tsc --noEmit)...`);
execSync('npx tsc --noEmit', { cwd: rootDir, stdio: 'inherit' });
console.log(`[verify-stills] Typecheck PASSED.`);

const step = Math.max(15, Math.floor((totalFrames - 30) / Math.max(1, numSamples - 1)));
const frames = [];
for (let i = 0; i < numSamples; i++) {
  const f = Math.min(totalFrames - 5, 15 + i * step);
  if (!frames.includes(f)) frames.push(f);
}

console.log(`[verify-stills] 2/2 Rendering ${frames.length} low-res keyframes for "${compId}"...`);
for (const frame of frames) {
  const padded = String(frame).padStart(4, '0');
  const outFile = path.join(outDir, `frame-${padded}.jpeg`);
  execSync(
    `npx remotion still "${compId}" "${outFile}" --frame=${frame} --scale=0.4 --quiet`,
    { cwd: rootDir, stdio: 'inherit' }
  );
  console.log(`  ✓ Saved ${path.relative(rootDir, outFile)} (frame ${frame})`);
}

console.log(`\n[verify-stills] Done! Inspect stills in: ${outDir}`);
