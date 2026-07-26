import type { FrontmatterLocaleText } from './types.ts';

const propertyTypeLabels = {
  checkbox: 'チェックボックス',
  date: '日付',
  datetime: '日時',
  list: 'リスト',
  number: '数値',
  tags: 'タグ',
  text: 'テキスト',
} as const;

const localeText = {
  addListItem: (propertyKey) => `${propertyKey} に項目を追加`,
  addProperty: 'プロパティを追加',
  addValue: '値を追加',
  cancelProperty: 'プロパティの追加をキャンセル',
  changePropertyType: (propertyKey) => `${propertyKey} のプロパティ型を変更`,
  createProperty: 'プロパティを作成',
  deleteProperty: 'プロパティを削除',
  duplicateProperty: (propertyKey) => `${propertyKey} というプロパティは既に存在します。`,
  editListItem: (value, propertyKey) => `${propertyKey} の ${value} を編集`,
  empty: '空',
  emptyList: '空のリスト',
  emptyProperties: 'プロパティはありません',
  expectedValue: (propertyType) =>
    `${propertyType} 型の値が必要です。YAML ソースを編集して復元してください。`,
  frontmatterProperties: 'Frontmatter プロパティ',
  listValues: (propertyKey) => `${propertyKey} の値`,
  nestedValue: 'ネストされた値は YAML ソースモードで確認できます。',
  newProperty: '新しいプロパティ',
  properties: 'プロパティ',
  propertyName: 'プロパティ名',
  propertyNameRequired: 'プロパティ名を入力してください。',
  propertyType: (propertyType) => propertyTypeLabels[propertyType],
  removeListItem: (value, propertyKey) => `${propertyKey} から ${value} を削除`,
  renameProperty: (propertyKey) => `${propertyKey} プロパティの名前を変更`,
  source: 'ソース',
  yamlSource: 'Frontmatter YAML ソース',
} satisfies FrontmatterLocaleText;

export default localeText;
