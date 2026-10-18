#!/usr/bin/env node
/**
 * Starts both the Prep Panel (http://localhost:3030) and Remotion Studio (http://localhost:3000)
 * in a single command (`npm run studio`), matching the "Studio + Prep" terminal workflow.
 */
import { spawn } from 'node:child_process';
import path from 'node:path';

const rootDir = path.resolve(import.meta.dirname, '..');

console.log('🚀 Starting Remotion Studio (port 3000) + Prep Panel (port 3030)...\n');

const prep = spawn('node', ['scripts/prep-server.mjs'], {
  cwd: rootDir,
  stdio: 'inherit',
});

const studio = spawn('npx', ['remotion', 'studio'], {
  cwd: rootDir,
  stdio: 'inherit',
});

function cleanup() {
  prep.kill('SIGTERM');
  studio.kill('SIGTERM');
  process.exit(0);
}

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
