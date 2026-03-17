import { defineConfig } from 'vite-plus';
import { defineConfig as definePackConfig } from 'vite-plus/pack';

export default defineConfig({
  pack: definePackConfig({
    exports: true,
  }),
  test: {
    include: ['tests/**/*.test.ts', 'src/**/*.test.ts'],
  },
});
