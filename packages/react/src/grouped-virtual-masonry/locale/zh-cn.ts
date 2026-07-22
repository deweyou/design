import type { GroupedVirtualMasonryLocaleText } from './types.ts';

const localeText = {
  defaultGroup: (index) => `分组 ${index}`,
  groupedVirtualMasonry: '分组虚拟图片瀑布流',
  previewImage: (label) => `预览 ${label}`,
} satisfies GroupedVirtualMasonryLocaleText;

export default localeText;
