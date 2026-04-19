import { resolve } from 'node:path';

import { defineConfig } from 'vite-plus';
import { defineConfig as definePackConfig } from 'vite-plus/pack';

const srcDir = resolve(import.meta.dirname, 'src');

export default defineConfig({
  build: {
    rolldownOptions: {
      input: {
        index: resolve(srcDir, 'index.ts'),
      },
      output: {
        chunkFileNames: 'chunks/[name]-[hash].mjs',
        entryFileNames: 'index.mjs',
      },
    },
  },
  pack: definePackConfig({
    exports: true,
  }),
  test: {
    include: ['src/**/*.test.ts', 'src/**/*.test.tsx'],
  },
});
