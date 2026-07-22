import type { VirtualMasonryLocaleText } from './types.ts';

const localeText = {
  previewImage: (label) => `${label}をプレビュー`,
  virtualMasonry: '仮想画像メイソンリーレイアウト',
} satisfies VirtualMasonryLocaleText;

export default localeText;
