import { defineConfig } from 'vite-plus';

export default defineConfig({
  staged: {
    '*': 'vp check --fix',
  },
  lint: {
    ignorePatterns: ['dist/**', 'coverage/**', 'storybook-static/**'],
    options: { typeAware: true, typeCheck: true },
  },
  fmt: {
    singleQuote: true,
  },
});
