import type { FrontmatterLocaleText } from './types.ts';

const propertyTypeLabels = {
  checkbox: '核取方塊',
  date: '日期',
  datetime: '日期與時間',
  list: '清單',
  number: '數字',
  tags: '標籤',
  text: '文字',
} as const;

const localeText = {
  addListItem: (propertyKey) => `新增 ${propertyKey} 項目`,
  addProperty: '新增屬性',
  addValue: '新增值',
  cancelProperty: '取消新增屬性',
  changePropertyType: (propertyKey) => `變更 ${propertyKey} 的屬性類型`,
  createProperty: '建立屬性',
  deleteProperty: '刪除屬性',
  duplicateProperty: (propertyKey) => `已存在名為 ${propertyKey} 的屬性。`,
  editListItem: (value, propertyKey) => `編輯 ${propertyKey} 中的 ${value}`,
  empty: '空白',
  emptyList: '空白清單',
  emptyProperties: '尚無屬性',
  expectedValue: (propertyType) => `這裡需要 ${propertyType} 類型的值，請編輯 YAML 原始碼復原。`,
  frontmatterProperties: 'Frontmatter 屬性',
  listValues: (propertyKey) => `${propertyKey} 的值`,
  nestedValue: '巢狀值可在 YAML 原始碼模式中查看。',
  newProperty: '新屬性',
  properties: '屬性',
  propertyName: '屬性名稱',
  propertyNameRequired: '請輸入屬性名稱。',
  propertyType: (propertyType) => propertyTypeLabels[propertyType],
  removeListItem: (value, propertyKey) => `從 ${propertyKey} 中移除 ${value}`,
  renameProperty: (propertyKey) => `重新命名 ${propertyKey} 屬性`,
  source: '原始碼',
  yamlSource: 'Frontmatter YAML 原始碼',
} satisfies FrontmatterLocaleText;

export default localeText;
