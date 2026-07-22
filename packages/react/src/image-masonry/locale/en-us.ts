import type { ImageMasonryLocaleText } from './types.ts';

const localeText = {
  imageMasonry: 'Image masonry',
  previewImage: (label) => `Preview ${label}`,
} satisfies ImageMasonryLocaleText;

export default localeText;
