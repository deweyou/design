import type { GroupedVirtualMasonryLocaleText } from './types.ts';

const localeText = {
  defaultGroup: (index) => `グループ ${index}`,
  groupedVirtualMasonry: 'グループ化された仮想画像メイソンリーレイアウト',
  previewImage: (label) => `${label}をプレビュー`,
} satisfies GroupedVirtualMasonryLocaleText;

export default localeText;
