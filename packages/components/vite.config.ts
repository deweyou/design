import { fileURLToPath } from 'node:url';

import { defineConfig } from 'vite-plus';

const entry = fileURLToPath(new URL('./src/index.ts', import.meta.url));

export default defineConfig({
  build: {
    lib: {
      entry,
      formats: ['es'],
      fileName: 'index',
    },
    rollupOptions: {
      external: [
        '@deweyou-ui/hooks',
        '@deweyou-ui/styles',
        'classnames',
        'react',
        'react-dom',
        'react/jsx-runtime',
        'react/jsx-dev-runtime',
      ],
      output: {
        assetFileNames: 'style.css',
      },
    },
  },
  test: {
    include: ['tests/**/*.test.ts', 'src/**/*.test.ts'],
  },
});
