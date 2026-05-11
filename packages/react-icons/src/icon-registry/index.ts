import iconRegistryJson from './icons.json';

export type IconCategory = 'action' | 'feedback' | 'navigation' | 'status' | 'content';

export type TDesignIconRegistryEntry = {
  readonly exportName: `${string}Icon`;
  readonly source: 'tdesign';
  readonly sourceKey: string;
  readonly category: IconCategory;
  readonly keywords: readonly string[];
};

export type LocalIconRegistryEntry = {
  readonly exportName: `${string}Icon`;
  readonly source: 'local';
  readonly sourcePath: `./assets/${string}.svg`;
  readonly category: IconCategory;
  readonly keywords: readonly string[];
};

export type IconRegistryEntry = TDesignIconRegistryEntry | LocalIconRegistryEntry;

const iconCategories = ['action', 'feedback', 'navigation', 'status', 'content'] as const;
const exportNamePattern = /^[A-Z][A-Za-z0-9]*Icon$/;
const localSourcePathPattern = /^\.\/assets\/[a-z0-9-]+\.svg$/;
const tdesignSourceKeyPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const assertString = <Value extends string = string>(
  value: unknown,
  message: string,
  validate?: (value: string) => boolean,
): Value => {
  if (typeof value !== 'string' || (validate && !validate(value))) {
    throw new Error(message);
  }

  return value as Value;
};

const assertNoProperty = (
  entry: Record<string, unknown>,
  propertyName: string,
  message: string,
) => {
  if (propertyName in entry) {
    throw new Error(message);
  }
};

export const validateIconRegistry = (registry: unknown): readonly IconRegistryEntry[] => {
  if (!Array.isArray(registry)) {
    throw new Error('Icon registry must be an array');
  }

  const exportNames = new Set<string>();

  return registry.map((entry, index): IconRegistryEntry => {
    if (!isRecord(entry)) {
      throw new Error(`Icon registry entry ${index} must be an object`);
    }

    const exportName = assertString<`${string}Icon`>(
      entry.exportName,
      `Icon registry entry ${index} has an invalid exportName`,
      (value) => exportNamePattern.test(value),
    );

    if (exportNames.has(exportName)) {
      throw new Error(`Icon registry exportName must be unique: ${exportName}`);
    }

    exportNames.add(exportName);

    const category = assertString<IconCategory>(
      entry.category,
      `Icon registry entry ${exportName} has an invalid category`,
      (value) => iconCategories.includes(value as IconCategory),
    );

    if (
      !Array.isArray(entry.keywords) ||
      !entry.keywords.every((keyword) => typeof keyword === 'string')
    ) {
      throw new Error(`Icon registry entry ${exportName} has invalid keywords`);
    }

    if (entry.source === 'tdesign') {
      const sourceKey = assertString(
        entry.sourceKey,
        `Icon registry entry ${exportName} has an invalid tdesign sourceKey`,
        (value) => tdesignSourceKeyPattern.test(value),
      );

      assertNoProperty(
        entry,
        'sourcePath',
        `Icon registry entry ${exportName} must not declare sourcePath for tdesign source`,
      );

      return {
        exportName,
        source: 'tdesign',
        sourceKey,
        category,
        keywords: entry.keywords,
      };
    }

    if (entry.source === 'local') {
      const sourcePath = assertString<`./assets/${string}.svg`>(
        entry.sourcePath,
        `Icon registry entry ${exportName} has an invalid local sourcePath`,
        (value) => localSourcePathPattern.test(value),
      );

      assertNoProperty(
        entry,
        'sourceKey',
        `Icon registry entry ${exportName} must not declare sourceKey for local source`,
      );

      return {
        exportName,
        source: 'local',
        sourcePath,
        category,
        keywords: entry.keywords,
      };
    }

    throw new Error(`Icon registry entry ${exportName} has an invalid source`);
  });
};

export const iconRegistry: readonly IconRegistryEntry[] = validateIconRegistry(iconRegistryJson);

export type IconExportName = IconRegistryEntry['exportName'];
