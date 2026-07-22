import type { ImageMasonryLocaleText } from './types.ts';

const localeText = {
  imageMasonry: '圖片瀑布流',
  previewImage: (label) => `預覽 ${label}`,
} satisfies ImageMasonryLocaleText;

export default localeText;
