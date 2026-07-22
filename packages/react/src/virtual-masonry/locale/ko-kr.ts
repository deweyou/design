import type { VirtualMasonryLocaleText } from './types.ts';

const localeText = {
  previewImage: (label) => `${label} 미리보기`,
  virtualMasonry: '가상 이미지 메이슨리',
} satisfies VirtualMasonryLocaleText;

export default localeText;
