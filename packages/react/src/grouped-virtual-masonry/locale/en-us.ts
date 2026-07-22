import type { GroupedVirtualMasonryLocaleText } from './types.ts';

const localeText = {
  defaultGroup: (index) => `Group ${index}`,
  groupedVirtualMasonry: 'Grouped virtual masonry',
  previewImage: (label) => `Preview ${label}`,
} satisfies GroupedVirtualMasonryLocaleText;

export default localeText;
