import { fileURLToPath } from 'node:url';

import { defineConfig } from 'vite-plus';

const componentsEntry = fileURLToPath(new URL('./packages/react/src/index.ts', import.meta.url));
const componentsSourceDir = fileURLToPath(new URL('./packages/react/src', import.meta.url));
const editorEntry = fileURLToPath(new URL('./packages/editor/src/index.ts', import.meta.url));
const hooksEntry = fileURLToPath(new URL('./packages/react-hooks/src/index.ts', import.meta.url));
const iconExportsDir = fileURLToPath(
  new URL('./packages/react-icons/src/exports', import.meta.url),
);
const iconsEntry = fileURLToPath(new URL('./packages/react-icons/src/index.ts', import.meta.url));
const stylesCssDir = fileURLToPath(new URL('./packages/styles/src/css', import.meta.url));
const stylesEntry = fileURLToPath(new URL('./packages/styles/src/index.ts', import.meta.url));

export default defineConfig({
  staged: {
    '*': 'vp check --fix',
  },
  lint: {
    ignorePatterns: [
      'dist/**',
      '.worktrees/**',
      'coverage/**',
      'storybook-static/**',
      'docs/specs/**',
      'packages/**/dist/**',
      'packages/**/src/generated/**',
      'packages/**/src/exports/**',
    ],
    options: { typeAware: true, typeCheck: true },
    plugins: ['typescript', 'react', 'unicorn'],
    overrides: [
      {
        files: [
          'apps/website/src/**/*.{ts,tsx}',
          'packages/react/src/**/*.{ts,tsx}',
          'packages/react-hooks/src/**/*.{ts,tsx}',
          'packages/infra/src/**/*.{ts,tsx}',
        ],
        rules: {
          'func-style': 'error',
          'unicorn/filename-case': [
            'error',
            {
              ignore: ['^AGENTS\\.md$', '^README\\.md$', '^index(\\.test)?\\.(ts|tsx)$'],
            },
          ],
        },
      },
    ],
  },
  fmt: {
    ignorePatterns: [
      'dist/**',
      '.worktrees/**',
      'coverage/**',
      'storybook-static/**',
      'packages/**/dist/**',
      'packages/**/src/generated/**',
      'packages/**/src/exports/**',
    ],
    singleQuote: true,
  },
  test: {
    include: ['apps/**/*.test.{ts,tsx}', 'packages/**/*.test.{ts,tsx}'],
  },
  resolve: {
    alias: [
      {
        find: /^@deweyou-design\/editor$/,
        replacement: editorEntry,
      },
      {
        find: /^@deweyou-design\/react\/(.+)$/,
        replacement: `${componentsSourceDir}/$1/index.tsx`,
      },
      {
        find: /^@deweyou-design\/react$/,
        replacement: componentsEntry,
      },
      {
        find: /^@deweyou-design\/react-hooks$/,
        replacement: hooksEntry,
      },
      {
        find: /^@deweyou-design\/react-icons\/(.+)$/,
        replacement: `${iconExportsDir}/$1.ts`,
      },
      {
        find: /^@deweyou-design\/react-icons$/,
        replacement: iconsEntry,
      },
      {
        find: /^@deweyou-design\/styles$/,
        replacement: stylesEntry,
      },
      {
        find: /^@deweyou-design\/styles\/theme\.css$/,
        replacement: `${stylesCssDir}/theme.css`,
      },
      {
        find: /^@deweyou-design\/styles\/theme-with-fonts\.css$/,
        replacement: `${stylesCssDir}/theme-with-fonts.css`,
      },
    ],
  },
});
