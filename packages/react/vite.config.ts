import { resolve } from 'node:path';

import { defineConfig } from 'vite-plus';

const srcDir = resolve(import.meta.dirname, 'src');
const input = {
  index: resolve(srcDir, 'index.ts'),
  'button/index': resolve(srcDir, 'button/index.tsx'),
  'menu/index': resolve(srcDir, 'menu/index.tsx'),
  'popover/index': resolve(srcDir, 'popover/index.tsx'),
  'text/index': resolve(srcDir, 'text/index.tsx'),
};

export default defineConfig({
  build: {
    // Components stay as a documented exception because the package needs per-component entrypoints
    // plus style delivery that works without an extra consumer-side stylesheet import.
    cssCodeSplit: true,
    lib: {
      entry: input,
      formats: ['es'],
      fileName: (_format, entryName) => {
        return `${entryName}.js`;
      },
    },
    rollupOptions: {
      external: [
        '@deweyou-design/react-hooks',
        '@deweyou-design/styles',
        'classnames',
        'react',
        'react-dom',
        'react/jsx-runtime',
        'react/jsx-dev-runtime',
      ],
      output: {
        chunkFileNames: 'chunks/[name]-[hash].js',
      },
    },
  },
  test: {
    include: ['tests/**/*.test.{ts,tsx}', 'src/**/*.test.{ts,tsx}'],
    setupFiles: ['src/test-setup.ts'],
    coverage: {
      provider: 'v8',
      // Only measure coverage on component implementation files, not barrel exports or type stubs
      include: ['src/*/index.tsx', 'src/*/index.ts'],
      exclude: ['src/index.ts', 'src/test-setup.ts', 'src/modules.d.ts'],
      thresholds: {
        statements: 80,
        branches: 80,
        functions: 80,
        lines: 80,
      },
    },
  },
});
