import type { VirtualMasonryLocaleText } from './types.ts';

const localeText = {
  previewImage: (label) => `Preview ${label}`,
  virtualMasonry: 'Virtual masonry',
} satisfies VirtualMasonryLocaleText;

export default localeText;
