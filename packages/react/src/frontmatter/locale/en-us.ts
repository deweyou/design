import type { FrontmatterLocaleText } from './types.ts';

const propertyTypeLabels = {
  checkbox: 'Checkbox',
  date: 'Date',
  datetime: 'Date & time',
  list: 'List',
  number: 'Number',
  tags: 'Tags',
  text: 'Text',
} as const;

const localeText = {
  addListItem: (propertyKey) => `Add ${propertyKey} item`,
  addProperty: 'Add property',
  addValue: 'Add value',
  cancelProperty: 'Cancel property',
  changePropertyType: (propertyKey) => `Change ${propertyKey} property type`,
  createProperty: 'Create property',
  deleteProperty: 'Delete property',
  duplicateProperty: (propertyKey) => `A property named ${propertyKey} already exists.`,
  editListItem: (value, propertyKey) => `Edit ${value} in ${propertyKey}`,
  empty: 'Empty',
  emptyList: 'Empty list',
  emptyProperties: 'No properties',
  expectedValue: (propertyType) =>
    `Expected ${propertyType} value; edit the YAML source to recover.`,
  frontmatterProperties: 'Frontmatter properties',
  listValues: (propertyKey) => `${propertyKey} values`,
  nestedValue: 'Nested values are available in YAML source mode.',
  newProperty: 'new',
  properties: 'Properties',
  propertyName: 'Property name',
  propertyNameRequired: 'Enter a property name.',
  propertyType: (propertyType) => propertyTypeLabels[propertyType],
  removeListItem: (value, propertyKey) => `Remove ${value} from ${propertyKey}`,
  renameProperty: (propertyKey) => `Rename ${propertyKey} property`,
  source: 'Source',
  yamlSource: 'Frontmatter YAML source',
} satisfies FrontmatterLocaleText;

export default localeText;
