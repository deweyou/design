import type { FrontmatterLocaleText } from './types.ts';

const propertyTypeLabels = {
  checkbox: '체크박스',
  date: '날짜',
  datetime: '날짜 및 시간',
  list: '목록',
  number: '숫자',
  tags: '태그',
  text: '텍스트',
} as const;

const localeText = {
  addListItem: (propertyKey) => `${propertyKey} 항목 추가`,
  addProperty: '속성 추가',
  addValue: '값 추가',
  cancelProperty: '속성 추가 취소',
  changePropertyType: (propertyKey) => `${propertyKey} 속성 유형 변경`,
  createProperty: '속성 만들기',
  deleteProperty: '속성 삭제',
  duplicateProperty: (propertyKey) => `${propertyKey} 속성이 이미 있습니다.`,
  editListItem: (value, propertyKey) => `${propertyKey}의 ${value} 편집`,
  empty: '비어 있음',
  emptyList: '빈 목록',
  emptyProperties: '속성 없음',
  expectedValue: (propertyType) =>
    `${propertyType} 유형의 값이 필요합니다. YAML 소스를 편집해 복구하세요.`,
  frontmatterProperties: 'Frontmatter 속성',
  listValues: (propertyKey) => `${propertyKey} 값`,
  nestedValue: '중첩 값은 YAML 소스 모드에서 확인할 수 있습니다.',
  newProperty: '새 속성',
  properties: '속성',
  propertyName: '속성 이름',
  propertyNameRequired: '속성 이름을 입력하세요.',
  propertyType: (propertyType) => propertyTypeLabels[propertyType],
  removeListItem: (value, propertyKey) => `${propertyKey}에서 ${value} 삭제`,
  renameProperty: (propertyKey) => `${propertyKey} 속성 이름 변경`,
  source: '소스',
  yamlSource: 'Frontmatter YAML 소스',
} satisfies FrontmatterLocaleText;

export default localeText;
