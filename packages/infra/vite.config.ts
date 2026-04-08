import { defineConfig } from 'vite-plus';
import { defineConfig as definePackConfig } from 'vite-plus/pack';

const defaultPackConfig = definePackConfig({
  exports: true,
});

export default defineConfig({
  // Utils should follow the default Vite+ pack path and not rely on a package-only wrapper.
  pack: defaultPackConfig,
  test: {
    include: ['tests/**/*.test.ts', 'src/**/*.test.ts'],
  },
});
