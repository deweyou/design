import type { VirtualMasonryLocaleText } from './types.ts';

const localeText = {
  previewImage: (label) => `預覽 ${label}`,
  virtualMasonry: '虛擬圖片瀑布流',
} satisfies VirtualMasonryLocaleText;

export default localeText;
