import type { GroupedVirtualMasonryLocaleText } from './types.ts';

const localeText = {
  defaultGroup: (index) => `그룹 ${index}`,
  groupedVirtualMasonry: '그룹화된 가상 이미지 메이슨리',
  previewImage: (label) => `${label} 미리보기`,
} satisfies GroupedVirtualMasonryLocaleText;

export default localeText;
