import { defineConfig } from 'vite-plus';
import { defineConfig as definePackConfig } from 'vite-plus/pack';

const defaultPackConfig = definePackConfig({
  exports: true,
});

export default defineConfig({
  // Hooks stay on the default Vite+ pack contract unless a future release proves otherwise.
  pack: defaultPackConfig,
  test: {
    include: ['tests/**/*.test.ts', 'src/**/*.test.ts'],
  },
});
