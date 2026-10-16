#!/usr/bin/env node
// Copies skills from <guideline>/skills/tier-*/<skill> (source of truth) into flat
// agent skill folders, e.g. .claude/skills/<skill>. Also copies <guideline>/agents/*.md
// into .claude/agents/.
//
// Usage (run from anywhere; paths resolve relative to the repo root):
//   node guideline/scripts/sync-skills.mjs            # write copies
//   node guideline/scripts/sync-skills.mjs --check    # exit 1 if any copy drifted (for CI)
//   node guideline/scripts/sync-skills.mjs --targets .claude/skills,.agents/skills
//   node scripts/sync-skills.mjs --repo-root ../some-project   # explicit target repo
//
// Repo root = parent of the guideline folder, unless --repo-root is given.
// When run inside the pack's own source repo (guideline folder is a git root),
// --repo-root is required so nothing is written outside the repo by accident.
// No machine-specific paths.

import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const args = process.argv.slice(2);

// Supports both `--name value` and `--name=value`.
const argValue = (name) => {
  const arg = args.find((a) => a === name || a.startsWith(`${name}=`));
  if (!arg) return undefined;
  return arg.includes('=') ? arg.split('=')[1] : args[args.indexOf(arg) + 1];
};

const guidelineRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const repoRootArg = argValue('--repo-root');

if (!repoRootArg && existsSync(join(guidelineRoot, '.git'))) {
  console.error(
    'This is the guideline pack source repo: there is no target repo above it.\n' +
    'Copy the pack into a project as guideline/ and run it there, or pass --repo-root <path>.',
  );
  process.exit(2);
}

const repoRoot = repoRootArg ? resolve(process.cwd(), repoRootArg) : resolve(guidelineRoot, '..');

// Default agent folders. Drop the ones your team does not use with --targets, e.g.
//   --targets .claude/skills,.agents/skills
const DEFAULT_TARGETS = ['.claude/skills', '.agents/skills', '.codex/skills', '.gemini/skills'];
const AGENT_TARGET = '.claude/agents';

const checkOnly = args.includes('--check');
const targetsValue = argValue('--targets');
const targets = targetsValue
  ? targetsValue.split(',').map((t) => t.trim()).filter(Boolean)
  : DEFAULT_TARGETS;

const listSkills = () => {
  const skillsDir = join(guidelineRoot, 'skills');
  const skills = new Map();
  for (const tier of readdirSync(skillsDir).filter((d) => d.startsWith('tier-'))) {
    for (const name of readdirSync(join(skillsDir, tier))) {
      const dir = join(skillsDir, tier, name);
      if (!statSync(dir).isDirectory() || !existsSync(join(dir, 'SKILL.md'))) continue;
      if (skills.has(name)) throw new Error(`Duplicate skill name "${name}" in ${tier} and ${skills.get(name)}`);
      skills.set(name, dir);
    }
  }
  return skills;
};

const listFiles = (dir, base = dir) =>
  readdirSync(dir).flatMap((entry) => {
    const full = join(dir, entry);
    return statSync(full).isDirectory() ? listFiles(full, base) : [relative(base, full)];
  });

const sameTree = (src, dest) => {
  if (!existsSync(dest)) return false;
  const a = listFiles(src).sort();
  const b = listFiles(dest).sort();
  if (a.length !== b.length || a.some((f, i) => f !== b[i])) return false;
  return a.every((f) => readFileSync(join(src, f)).equals(readFileSync(join(dest, f))));
};

const syncDir = (src, dest, drift) => {
  if (sameTree(src, dest)) return;
  drift.push(relative(repoRoot, dest));
  if (checkOnly) return;
  rmSync(dest, { recursive: true, force: true });
  mkdirSync(dirname(dest), { recursive: true });
  cpSync(src, dest, { recursive: true });
};

const syncFile = (src, dest, drift) => {
  if (existsSync(dest) && readFileSync(src).equals(readFileSync(dest))) return;
  drift.push(relative(repoRoot, dest));
  if (checkOnly) return;
  mkdirSync(dirname(dest), { recursive: true });
  cpSync(src, dest);
};

const drift = [];
const skills = listSkills();

for (const target of targets) {
  for (const [name, src] of skills) syncDir(src, join(repoRoot, target, name), drift);
}

const agentsDir = join(guidelineRoot, 'agents');
if (existsSync(agentsDir)) {
  for (const file of readdirSync(agentsDir).filter((f) => f.endsWith('.md'))) {
    syncFile(join(agentsDir, file), join(repoRoot, AGENT_TARGET, file), drift);
  }
}

if (checkOnly) {
  if (drift.length) {
    console.error(`Skill copies out of sync (${drift.length}):\n  ${drift.join('\n  ')}\nRun: node ${relative(repoRoot, fileURLToPath(import.meta.url))}`);
    process.exit(1);
  }
  console.log(`OK — ${skills.size} skills in sync across ${targets.length} target(s).`);
} else {
  console.log(`Synced ${skills.size} skills to ${targets.join(', ')}; ${drift.length} path(s) updated.`);
}
