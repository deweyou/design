import { defineConfig } from 'vite-plus';
import { defineConfig as definePackConfig } from 'vite-plus/pack';

const defaultPackConfig = definePackConfig({
  exports: true,
});

export default defineConfig({
  // Styles keep the default pack output, but still need a follow-up asset copy stage after build.
  pack: defaultPackConfig,
  test: {
    include: ['tests/**/*.test.ts'],
  },
});
