import { defineConfig } from 'vite-plus';
import { defineConfig as definePackConfig } from 'vite-plus/pack';

export default defineConfig({
  pack: definePackConfig({
    entry: {
      'bin/index': 'src/bin/index.ts',
      index: 'src/index.ts',
      'server/index': 'src/server/index.ts',
    },
    exports: true,
  }),
  test: {
    include: ['src/**/*.test.ts', 'tests/**/*.test.ts'],
  },
});
