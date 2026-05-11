import { useState } from 'react';
import type { ComponentType } from 'react';

import { Input, Text, toast } from '@deweyou-design/react';
import * as Icons from '@deweyou-design/react-icons';
import type { IconProps } from '@deweyou-design/react-icons';

import styles from './icons.module.less';

type IconEntry = {
  name: string;
  Icon: ComponentType<IconProps>;
};

// Build the full icon list from all exports ending with "Icon"
const ALL_ICONS: IconEntry[] = (Object.entries(Icons) as Array<[string, ComponentType<IconProps>]>)
  .filter(([key]) => key.endsWith('Icon'))
  .map(([exportName, Icon]) => ({
    name: exportName
      .replace(/Icon$/, '')
      .replace(/([A-Z])/g, (match, letter, index) =>
        index === 0 ? letter.toLowerCase() : `-${letter.toLowerCase()}`,
      ),
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

  return (
    <main className={styles.page}>
      <div className={styles.container}>
        <div className={styles.header}>
          <Text className={styles.title} variant="h3">
            Icons
          </Text>
          <Text className={styles.subtitle} variant="caption">
            @deweyou-design/react-icons · default glyphs from tdesign-icons-svg · Deweyou curated
            list
          </Text>
          <Text className={styles.subtitle} variant="caption">
            This catalog shows Deweyou-supported icons, not the full upstream icon set.
          </Text>
          <Text className={styles.subtitle} variant="caption">
            Click an icon to copy its direct named import. Application code should use direct named
            imports. This catalog uses a namespace import because it intentionally renders every
            supported icon.
          </Text>
          <Text className={styles.subtitle} variant="caption">
            Examples: &lt;SearchIcon <code>size="sm"</code> /&gt; · &lt;SearchIcon{' '}
            <code>color="primary"</code> /&gt;
          </Text>
          <div className={styles.searchWrapper}>
            <Input
              placeholder="搜索图标..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
        </div>

        <div className={styles.grid}>
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
                  <Icon aria-hidden size="md" />
                </div>
                <span className={styles.iconName}>{name}</span>
              </button>
            ))
          )}
        </div>
      </div>
    </main>
  );
};
