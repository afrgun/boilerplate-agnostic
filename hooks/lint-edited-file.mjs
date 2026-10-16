#!/usr/bin/env node
// PostToolUse hook: runs ESLint on the file the agent just edited, so boundary and
// project rules are reported immediately instead of at the end of the task.
// Only source files under src/ are linted. If ESLint is not installed locally, it does nothing.
//
// Input: hook JSON on stdin (tool_input.file_path).
// Exit 2 = lint errors (output on stderr, shown to the agent so it can fix them). Exit 0 = ok/skipped.

import { existsSync, readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { dirname, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const LINTED = /\.(ts|tsx|js|jsx|mjs|cjs)$/;
const TIMEOUT_MS = 60_000;

const guidelineRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const repoRoot = process.env.CLAUDE_PROJECT_DIR ? resolve(process.env.CLAUDE_PROJECT_DIR) : resolve(guidelineRoot, '..');

let input = {};
try {
  input = JSON.parse(readFileSync(0, 'utf8') || '{}');
} catch {
  process.exit(0);
}

const filePath = input?.tool_input?.file_path;
if (!filePath) process.exit(0);

const absolute = resolve(repoRoot, filePath);
const rel = relative(repoRoot, absolute).split(sep).join('/');
if (rel.startsWith('..') || !rel.startsWith('src/') || !LINTED.test(rel) || !existsSync(absolute)) process.exit(0);

const eslintBin = join(repoRoot, 'node_modules', 'eslint', 'bin', 'eslint.js');
if (!existsSync(eslintBin)) process.exit(0);

const result = spawnSync(process.execPath, [eslintBin, '--no-warn-ignored', rel], {
  cwd: repoRoot,
  encoding: 'utf8',
  timeout: TIMEOUT_MS,
});

if (result.status === 1) {
  console.error(`ESLint errors in ${rel} — fix them before continuing:\n${result.stdout || result.stderr}`);
  process.exit(2);
}

process.exit(0);
