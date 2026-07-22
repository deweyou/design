import type { ImageMasonryLocaleText } from './types.ts';

const localeText = {
  imageMasonry: '이미지 메이슨리',
  previewImage: (label) => `${label} 미리보기`,
} satisfies ImageMasonryLocaleText;

export default localeText;
