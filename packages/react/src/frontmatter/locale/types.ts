import type { FrontmatterPropertyType } from '../index.tsx';

export type FrontmatterLocaleText = {
  addListItem: (propertyKey: string) => string;
  addProperty: string;
  addValue: string;
  cancelProperty: string;
  changePropertyType: (propertyKey: string) => string;
  createProperty: string;
  deleteProperty: string;
  duplicateProperty: (propertyKey: string) => string;
  editListItem: (value: string, propertyKey: string) => string;
  empty: string;
  emptyList: string;
  emptyProperties: string;
  expectedValue: (propertyType: FrontmatterPropertyType) => string;
  frontmatterProperties: string;
  listValues: (propertyKey: string) => string;
  nestedValue: string;
  newProperty: string;
  properties: string;
  propertyName: string;
  propertyNameRequired: string;
  propertyType: (propertyType: FrontmatterPropertyType) => string;
  removeListItem: (value: string, propertyKey: string) => string;
  renameProperty: (propertyKey: string) => string;
  source: string;
  yamlSource: string;
};
