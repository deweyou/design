import type { VirtualMasonryLocaleText } from './types.ts';

const localeText = {
  previewImage: (label) => `预览 ${label}`,
  virtualMasonry: '虚拟图片瀑布流',
} satisfies VirtualMasonryLocaleText;

export default localeText;
