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

export const iconRegistry = iconRegistryJson as readonly IconRegistryEntry[];

export type IconExportName = (typeof iconRegistry)[number]['exportName'];
