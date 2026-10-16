#!/usr/bin/env node
// PreToolUse hook: blocks direct edits to skill/agent copies produced by scripts/sync-skills.mjs.
// Copies are overwritten on the next sync, so edits there are silently lost.
// Only pack-managed items are guarded: skill folders starting with "bp-" and agent files
// that exist in <guideline>/agents/. Other skills/agents in those folders are left alone.
//
// Input: hook JSON on stdin (tool_input.file_path / notebook_path).
// Exit 2 = block, with the reason on stderr (shown to the agent). Exit 0 = allow.

import { existsSync, readFileSync } from 'node:fs';
import { basename, dirname, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const COPY_DIRS = ['.claude/skills', '.agents/skills', '.codex/skills', '.gemini/skills'];
const AGENT_COPY_DIR = '.claude/agents';

const guidelineRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const repoRoot = process.env.CLAUDE_PROJECT_DIR ? resolve(process.env.CLAUDE_PROJECT_DIR) : resolve(guidelineRoot, '..');

const readInput = () => {
  try {
    return JSON.parse(readFileSync(0, 'utf8') || '{}');
  } catch {
    return {};
  }
};

const input = readInput();
const filePath = input?.tool_input?.file_path ?? input?.tool_input?.notebook_path;
if (!filePath) process.exit(0);

const rel = relative(repoRoot, resolve(repoRoot, filePath)).split(sep).join('/');
if (rel.startsWith('..')) process.exit(0);

const guideline = relative(repoRoot, guidelineRoot).split(sep).join('/') || '.';

for (const dir of COPY_DIRS) {
  if (!rel.startsWith(`${dir}/`)) continue;
  const skill = rel.slice(dir.length + 1).split('/')[0];
  if (skill.startsWith('bp-')) {
    console.error(
      `Blocked: ${rel} is a synced copy of skill "${skill}" and will be overwritten.\n` +
      `Edit the source under ${guideline}/skills/tier-*/${skill}/ instead, then run: node ${guideline}/scripts/sync-skills.mjs`,
    );
    process.exit(2);
  }
}

if (rel.startsWith(`${AGENT_COPY_DIR}/`) && existsSync(resolve(guidelineRoot, 'agents', basename(rel)))) {
  console.error(
    `Blocked: ${rel} is a synced copy of a pack agent and will be overwritten.\n` +
    `Edit ${guideline}/agents/${basename(rel)} instead, then run: node ${guideline}/scripts/sync-skills.mjs`,
  );
  process.exit(2);
}

process.exit(0);
