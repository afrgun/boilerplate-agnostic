// Architecture boundary rules (ESLint flat config) — eslint-plugin-boundaries v7 syntax.
//
// Usage in the target repo's eslint.config.mjs:
//   import boundaries from './guideline/lint/eslint.boundaries.mjs';
//   export default [...stackConfigs, ...boundaries];
//
// Requires: eslint-plugin-boundaries@^7, eslint-import-resolver-typescript.
// Folder patterns must match the "Layer map" in stack-profile.md.
// Element order matters: the FIRST matching element wins, so specific
// patterns (app, di) come before broad ones (core).

import boundaries from 'eslint-plugin-boundaries';

const FRAMEWORK_AND_IO = [
  'react', 'react-dom', 'react/*', 'next', 'next/*',
  '@angular/*', 'rxjs', 'rxjs/*', 'solid-js', 'solid-js/*',
  'axios', '@tanstack/*', 'zustand',
];

const el = (type) => ({ to: { element: { type } } });
const sameFeature = (type) => ({
  to: { element: { type, captured: { feature: '{{ from.element.captured.feature }}' } } },
});
const from = (type) => ({ element: { type } });

export default [
  {
    files: ['src/**/*.{ts,tsx}'],
    plugins: { boundaries },
    settings: {
      'import/resolver': { typescript: { alwaysTryTypes: true } },
      'boundaries/include': ['src/**/*'],
      'boundaries/elements': [
        // Composition root, part 1: route/app shell. Creates adapters, nobody imports it.
        // Next.js: route files; React: AppProviders/router; Angular: app.config/app.routes.
        { type: 'app', pattern: 'src/app/**' },
        // Framework entry files directly under src/ (Next: proxy.ts — formerly middleware.ts — instrumentation.ts;
        // Vite/Angular: main.ts; env.ts; global *.d.ts) behave like the composition root.
        // 'mode: file' is deprecated in v7 but is the only working option for single-file elements.
        { type: 'app', pattern: 'src/*.{ts,tsx}', mode: 'file' },
        // Angular: feature route files are composition roots too (same 'mode: file' note).
        { type: 'app', pattern: 'src/features/*/*.routes.ts', capture: ['feature'], mode: 'file' },
        // Composition root, part 2: DI accessors presentation may use
        // (React: PortsProvider/usePorts; Next: createServerPorts). Only place besides app that names adapters.
        { type: 'di', pattern: 'src/core/di/**' },
        { type: 'kernel', pattern: 'src/shared/kernel/**' },
        { type: 'shared-ui', pattern: 'src/shared/ui/**' },
        { type: 'shared-lib', pattern: 'src/shared/lib/**' },
        { type: 'core', pattern: 'src/core/**' },
        { type: 'domain', pattern: 'src/features/*/domain/**', capture: ['feature'] },
        { type: 'application', pattern: 'src/features/*/application/**', capture: ['feature'] },
        { type: 'infrastructure', pattern: 'src/features/*/infrastructure/**', capture: ['feature'] },
        { type: 'presentation', pattern: 'src/features/*/presentation/**', capture: ['feature'] },
      ],
    },
    rules: {
      // Every file under src/ must belong to a layer — no blind spots.
      // Keep test setup files (vitest.setup.ts, test-setup.ts) OUTSIDE src/ or add an element for them.
      'boundaries/no-unknown-files': 'error',
      'boundaries/dependencies': ['error', {
        default: 'disallow',
        message: '{{ from.element.types.[0] }} must not import {{ to.element.types.[0] }} (see bp-architecture)',
        policies: [
          { from: from('kernel'), allow: [el('kernel')] },
          { from: from('shared-lib'), allow: [el('kernel'), el('shared-lib')] },
          { from: from('domain'), allow: [el('kernel'), el('shared-lib'), sameFeature('domain')] },
          { from: from('application'), allow: [el('kernel'), el('shared-lib'), sameFeature('domain'), sameFeature('application')] },
          { from: from('infrastructure'), allow: [el('kernel'), el('shared-lib'), el('core'), sameFeature('domain'), sameFeature('application'), sameFeature('infrastructure')] },
          { from: from('presentation'), allow: [el('kernel'), el('shared-lib'), el('shared-ui'), el('di'), sameFeature('domain'), sameFeature('application'), sameFeature('presentation')] },
          { from: from('shared-ui'), allow: [el('kernel'), el('shared-lib'), el('shared-ui')] },
          { from: from('core'), allow: [el('kernel'), el('shared-lib'), el('core')] },
          { from: from('di'), allow: [el('kernel'), el('core'), el('di'), el('domain'), el('application'), el('infrastructure')] },
          { from: from('app'), allow: [el('kernel'), el('shared-lib'), el('shared-ui'), el('core'), el('di'), el('domain'), el('application'), el('infrastructure'), el('presentation'), el('app')] },
        ],
      }],
    },
  },

  // Domain, kernel, shared/lib stay framework-free and I/O-free.
  {
    files: ['src/shared/kernel/**/*.{ts,tsx}', 'src/shared/lib/**/*.{ts,tsx}', 'src/features/*/domain/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': ['error', {
        patterns: [{ group: FRAMEWORK_AND_IO, message: 'Domain/kernel must be framework-free and I/O-free (bp-architecture).' }],
      }],
    },
  },

  // Application layer: no UI framework, no HTTP client.
  {
    files: ['src/features/*/application/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': ['error', {
        patterns: [{ group: ['react', 'react-dom', 'next', 'next/*', 'solid-js', 'axios', '@tanstack/*', 'zustand'], message: 'Application layer holds ports and use cases only (bp-architecture).' }],
      }],
    },
  },

  // Presentation never talks HTTP directly.
  {
    files: ['src/features/*/presentation/**/*.{ts,tsx}', 'src/shared/ui/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': ['error', {
        patterns: [{ group: ['axios', '@angular/common/http', '**/infrastructure/**'], message: 'Presentation must go through the store/ports, not HTTP or adapters (bp-architecture).' }],
      }],
    },
  },
];
