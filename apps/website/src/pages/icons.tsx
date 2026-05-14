import { useState, type ComponentType } from 'react';

import { Input, Text, toast } from '@deweyou-design/react';
import * as Icons from '@deweyou-design/react-icons';
import type { IconProps } from '@deweyou-design/react-icons';

import { iconRegistry } from '../../../../packages/react-icons/src/icon-registry';
import styles from './icons.module.less';

type PublicIconExportName = Extract<keyof typeof Icons, `${string}Icon`>;

type IconEntry = {
  category: string;
  exportName: PublicIconExportName;
  keywords: readonly string[];
  name: string;
  Icon: ComponentType<IconProps>;
  sourceName: string;
};

const isPublicIconExportName = (exportName: string): exportName is PublicIconExportName =>
  exportName in Icons;

const getPublicIconComponent = (exportName: `${string}Icon`): ComponentType<IconProps> => {
  if (!isPublicIconExportName(exportName)) {
    throw new Error(`Icon registry export is missing from the public surface: ${exportName}`);
  }

  return Icons[exportName] as ComponentType<IconProps>;
};

const toIconName = (exportName: `${string}Icon`) =>
  exportName
    .replace(/Icon$/, '')
    .replace(/([a-z])([0-9])/g, '$1-$2')
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .toLowerCase();

const ALL_ICONS: IconEntry[] = iconRegistry.map((entry) => {
  const { exportName } = entry;
  const publicExportName = isPublicIconExportName(exportName) ? exportName : undefined;

  if (!publicExportName) {
    throw new Error(`Icon registry export is missing from the public surface: ${exportName}`);
  }

  return {
    Icon: getPublicIconComponent(publicExportName),
    category: entry.category,
    exportName: publicExportName,
    keywords: entry.keywords,
    name: toIconName(publicExportName),
    sourceName: entry.source === 'tdesign' ? entry.sourceKey : entry.sourcePath,
  };
});

const copyImport = (exportName: PublicIconExportName) => {
  navigator.clipboard
    .writeText(`import { ${exportName} } from '@deweyou-design/react-icons'`)
    .then(() => {
      toast.create({ title: '已复制', description: exportName });
    })
    .catch(() => {
      toast.create({ title: '复制失败' });
    });
};

export const IconsPage = () => {
  const [query, setQuery] = useState('');
  const normalizedQuery = query.trim().toLowerCase();

  const filtered = normalizedQuery
    ? ALL_ICONS.filter(({ category, exportName, keywords, name, sourceName }) =>
        [name, exportName, category, sourceName, ...keywords].some((value) =>
          value.toLowerCase().includes(normalizedQuery),
        ),
      )
    : ALL_ICONS;
  const iconCount = ALL_ICONS.length;
  const resultCount = filtered.length;

  return (
    <main className={styles.page}>
      <header className={styles.hero}>
        <p className={styles.eyebrow}>Icon Imports</p>
        <h1>Icons</h1>
        <Text className={styles.lead} variant="body">
          Browse every @deweyou-design/react-icons export from the full TDesign registry, filter by
          name, category, or keyword, then click an icon to copy the import snippet.
        </Text>
        <div className={styles.sample}>
          <code>import {'{ AlertCircleIcon }'} from '@deweyou-design/react-icons'</code>
        </div>
      </header>

      <section className={styles.toolbar} aria-label="Icon search and summary">
        <div className={styles.searchWrapper}>
          <Input
            id="icons-search"
            label="Search icons"
            placeholder="搜索图标..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <div className={styles.stats} aria-live="polite">
          <span>{resultCount}</span>
          <Text variant="caption">shown of {iconCount} icons</Text>
        </div>
      </section>

      <div className={styles.grid} aria-label="Icon list">
        {filtered.length === 0 ? (
          <div className={styles.empty}>
            <Text variant="caption">没有匹配「{query}」的图标</Text>
          </div>
        ) : (
          filtered.map(({ exportName, name, Icon }) => (
            <button
              key={name}
              aria-label={`复制 ${name} 图标的 import 语句`}
              className={styles.iconCell}
              type="button"
              onClick={() => copyImport(exportName)}
            >
              <div className={styles.iconBox}>
                <Icon aria-hidden size="md" />
              </div>
              <span className={styles.iconName}>{name}</span>
            </button>
          ))
        )}
      </div>
    </main>
  );
};
