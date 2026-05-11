import { expect, it } from 'vite-plus/test';

import { validateIconRegistry } from './index';

const validRegistryEntry = {
  exportName: 'SearchIcon',
  source: 'tdesign',
  sourceKey: 'search',
  category: 'action',
  keywords: ['find', 'query'],
};

it('rejects a non-array registry root', () => {
  expect(() => validateIconRegistry({ entries: [validRegistryEntry] })).toThrow(
    'Icon registry must be an array',
  );
});

it('rejects malformed export names', () => {
  expect(() =>
    validateIconRegistry([{ ...validRegistryEntry, exportName: 'search-icon' }]),
  ).toThrow('Icon registry entry 0 has an invalid exportName');
});

it('rejects malformed shared fields', () => {
  expect(() => validateIconRegistry([{ ...validRegistryEntry, category: 'brand' }])).toThrow(
    'Icon registry entry SearchIcon has an invalid category',
  );

  expect(() => validateIconRegistry([{ ...validRegistryEntry, keywords: ['find', 1] }])).toThrow(
    'Icon registry entry SearchIcon has invalid keywords',
  );

  expect(() => validateIconRegistry([{ ...validRegistryEntry, source: 'remote' }])).toThrow(
    'Icon registry entry SearchIcon has an invalid source',
  );
});

it('rejects duplicate export names', () => {
  expect(() => validateIconRegistry([validRegistryEntry, validRegistryEntry])).toThrow(
    'Icon registry exportName must be unique: SearchIcon',
  );
});

it('rejects malformed source-specific declarations', () => {
  expect(() => validateIconRegistry([{ ...validRegistryEntry, sourceKey: 'Search' }])).toThrow(
    'Icon registry entry SearchIcon has an invalid tdesign sourceKey',
  );

  expect(() =>
    validateIconRegistry([{ ...validRegistryEntry, sourcePath: './assets/search.svg' }]),
  ).toThrow('Icon registry entry SearchIcon must not declare sourcePath for tdesign source');

  expect(() =>
    validateIconRegistry([
      {
        exportName: 'BrandIcon',
        source: 'local',
        sourcePath: './asset/brand.svg',
        category: 'content',
        keywords: ['brand'],
      },
    ]),
  ).toThrow('Icon registry entry BrandIcon has an invalid local sourcePath');

  expect(() =>
    validateIconRegistry([
      {
        exportName: 'BrandIcon',
        source: 'local',
        sourceKey: 'brand',
        sourcePath: './assets/brand.svg',
        category: 'content',
        keywords: ['brand'],
      },
    ]),
  ).toThrow('Icon registry entry BrandIcon must not declare sourceKey for local source');
});
