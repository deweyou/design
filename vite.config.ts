import { defineConfig } from 'vite-plus';

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
});
