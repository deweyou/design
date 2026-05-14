import { useState, type ComponentType } from 'react';

import { Input, Text, toast } from '@deweyou-design/react';
import * as Icons from '@deweyou-design/react-icons';

import styles from './icons.module.less';

type IconEntry = {
  name: string;
  Icon: ComponentType<{ size?: number; 'aria-hidden'?: boolean }>;
};

// Build the full icon list from all exports ending with "Icon"
const ALL_ICONS: IconEntry[] = (
  Object.entries(Icons) as Array<[string, ComponentType<{ size?: number }>]>
)
  .filter(([key]) => key.endsWith('Icon'))
  .map(([exportName, Icon]) => ({
    // "AlertCircleIcon" → "alert-circle"
    name: exportName
      .replace(/Icon$/, '')
      .replace(/([A-Z])/g, (m, l, i) => (i === 0 ? l.toLowerCase() : `-${l.toLowerCase()}`)),
    Icon,
  }));

const copyImport = (displayName: string) => {
  // Reconstruct the PascalCase export name from the kebab display name
  const exportName =
    displayName
      .split('-')
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join('') + 'Icon';

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

  const filtered = query.trim()
    ? ALL_ICONS.filter(({ name }) => name.includes(query.trim().toLowerCase()))
    : ALL_ICONS;
  const iconCount = ALL_ICONS.length;
  const resultCount = filtered.length;

  return (
    <main className={styles.page}>
      <header className={styles.hero}>
        <p className={styles.eyebrow}>Icon Imports</p>
        <h1>Icons</h1>
        <Text className={styles.lead} variant="body">
          Browse @deweyou-design/react-icons exports, filter by icon name, then click an icon to
          copy the import snippet.
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
          filtered.map(({ name, Icon }) => (
            <button
              key={name}
              aria-label={`复制 ${name} 图标的 import 语句`}
              className={styles.iconCell}
              type="button"
              onClick={() => copyImport(name)}
            >
              <div className={styles.iconBox}>
                <Icon aria-hidden size={22} />
              </div>
              <span className={styles.iconName}>{name}</span>
            </button>
          ))
        )}
      </div>
    </main>
  );
};
