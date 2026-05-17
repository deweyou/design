import iconRegistryJson from '../../../react-icons/src/icon-registry/icons.json' with { type: 'json' };

export type IconCatalogItem = {
  category: 'action' | 'feedback' | 'navigation' | 'status' | 'content';
  exportName: `${string}Icon`;
  importSnippet: string;
  keywords: readonly string[];
  source: 'tdesign' | 'local';
  sourceKey?: string;
  sourcePath?: string;
};

export const iconCatalog: IconCatalogItem[] = iconRegistryJson.map((icon) => ({
  ...icon,
  importSnippet: `import { ${icon.exportName} } from '@deweyou-design/react-icons';`,
})) as IconCatalogItem[];

export const findIcon = (name: string) => {
  const normalizedName = name.toLowerCase();

  return iconCatalog.find(
    (icon) =>
      icon.exportName.toLowerCase() === normalizedName ||
      icon.exportName.replace(/Icon$/, '').toLowerCase() === normalizedName ||
      icon.sourceKey?.toLowerCase() === normalizedName,
  );
};

export const listIcons = ({
  category,
  limit = 50,
  query,
}: {
  category?: IconCatalogItem['category'];
  limit?: number;
  query?: string;
} = {}) => {
  const normalizedQuery = query?.toLowerCase();
  const boundedLimit = Math.min(Math.max(limit, 1), 200);

  return iconCatalog
    .filter((icon) => !category || icon.category === category)
    .filter((icon) => {
      if (!normalizedQuery) {
        return true;
      }

      return (
        icon.exportName.toLowerCase().includes(normalizedQuery) ||
        icon.sourceKey?.toLowerCase().includes(normalizedQuery) ||
        icon.keywords.some((keyword) => keyword.toLowerCase().includes(normalizedQuery))
      );
    })
    .slice(0, boundedLimit);
};

export const getIconImportSnippet = (name: string) => {
  return findIcon(name)?.importSnippet;
};
