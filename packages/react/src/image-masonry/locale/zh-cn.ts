import type { ImageMasonryLocaleText } from './types.ts';

const localeText = {
  imageMasonry: '图片瀑布流',
  previewImage: (label) => `预览 ${label}`,
} satisfies ImageMasonryLocaleText;

export default localeText;
