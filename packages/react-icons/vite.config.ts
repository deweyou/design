import { readdirSync } from 'node:fs';
import { resolve } from 'node:path';

import { defineConfig } from 'vite-plus';
import { defineConfig as definePackConfig } from 'vite-plus/pack';

const srcDir = resolve(import.meta.dirname, 'src');
const exportsDir = resolve(srcDir, 'exports');
// Icons are an explicit exception to the default pack contract because each public icon gets its
// own generated entrypoint under `dist/icons`.
const iconEntryNames = readdirSync(exportsDir)
  .filter((file) => file.endsWith('.ts'))
  .map((file) => file.replace(/\.ts$/, ''));

const input = Object.fromEntries([
  ['index', resolve(srcDir, 'index.ts')],
  ...iconEntryNames.map((name) => [name, resolve(exportsDir, `${name}.ts`)]),
]);

export default defineConfig({
  build: {
    rolldownOptions: {
      input,
      output: {
        chunkFileNames: 'chunks/[name]-[hash].mjs',
        entryFileNames: ({ name }) => {
          if (name === 'index') {
            return 'index.mjs';
          }

          return 'icons/[name].mjs';
        },
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
