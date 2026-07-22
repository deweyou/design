import type { ImageMasonryLocaleText } from './types.ts';

const localeText = {
  imageMasonry: '画像メイソンリーレイアウト',
  previewImage: (label) => `${label}をプレビュー`,
} satisfies ImageMasonryLocaleText;

export default localeText;
