import type { FrontmatterLocaleText } from './types.ts';

const propertyTypeLabels = {
  checkbox: '复选框',
  date: '日期',
  datetime: '日期与时间',
  list: '列表',
  number: '数字',
  tags: '标签',
  text: '文本',
} as const;

const localeText = {
  addListItem: (propertyKey) => `添加 ${propertyKey} 项`,
  addProperty: '添加属性',
  addValue: '添加值',
  cancelProperty: '取消添加属性',
  changePropertyType: (propertyKey) => `更改 ${propertyKey} 的属性类型`,
  createProperty: '创建属性',
  deleteProperty: '删除属性',
  duplicateProperty: (propertyKey) => `已存在名为 ${propertyKey} 的属性。`,
  editListItem: (value, propertyKey) => `编辑 ${propertyKey} 中的 ${value}`,
  empty: '空',
  emptyList: '空列表',
  emptyProperties: '暂无属性',
  expectedValue: (propertyType) => `这里需要 ${propertyType} 类型的值，请编辑 YAML 源码恢复。`,
  frontmatterProperties: 'Frontmatter 属性',
  listValues: (propertyKey) => `${propertyKey} 的值`,
  nestedValue: '嵌套值可在 YAML 源码模式中查看。',
  newProperty: '新属性',
  properties: '属性',
  propertyName: '属性名称',
  propertyNameRequired: '请输入属性名称。',
  propertyType: (propertyType) => propertyTypeLabels[propertyType],
  removeListItem: (value, propertyKey) => `从 ${propertyKey} 中删除 ${value}`,
  renameProperty: (propertyKey) => `重命名 ${propertyKey} 属性`,
  source: '源码',
  yamlSource: 'Frontmatter YAML 源码',
} satisfies FrontmatterLocaleText;

export default localeText;
