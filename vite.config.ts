import { defineConfig } from 'vite-plus';

export default defineConfig({
  staged: {
    '*': 'vp check --fix',
  },
  lint: {
    ignorePatterns: ['dist/**', 'coverage/**', 'storybook-static/**', 'specs/**'],
    options: { typeAware: true, typeCheck: true },
    plugins: ['typescript', 'react', 'unicorn'],
    overrides: [
      {
        files: [
          'apps/website/src/**/*.{ts,tsx}',
          'packages/components/src/**/*.{ts,tsx}',
          'packages/hooks/src/**/*.{ts,tsx}',
          'packages/utils/src/**/*.{ts,tsx}',
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
    singleQuote: true,
  },
});
