import type { GroupedVirtualMasonryLocaleText } from './types.ts';

const localeText = {
  defaultGroup: (index) => `群組 ${index}`,
  groupedVirtualMasonry: '分組虛擬圖片瀑布流',
  previewImage: (label) => `預覽 ${label}`,
} satisfies GroupedVirtualMasonryLocaleText;

export default localeText;
