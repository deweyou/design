import { useState } from 'react';

import { Button, Input, Text } from '@deweyou-design/react';
import { ExternalLinkIcon } from '@deweyou-design/react-icons';

import {
  COMPONENT_CATEGORIES,
  COMPONENT_CATALOG,
  type ComponentCatalogItem,
  getStorybookUrl,
} from '../data/component-catalog';
import styles from './components.module.less';

const matchesComponentQuery = (item: ComponentCatalogItem, normalizedQuery: string) =>
  [
    item.name,
    item.description,
    item.category,
    item.importSnippet,
    item.storyId,
    ...item.dimensions,
  ].some((value) => value.toLowerCase().includes(normalizedQuery));

export const ComponentsPage = () => {
  const [query, setQuery] = useState('');
  const normalizedQuery = query.trim().toLowerCase();
  const filtered = normalizedQuery
    ? COMPONENT_CATALOG.filter((item) => matchesComponentQuery(item, normalizedQuery))
    : COMPONENT_CATALOG;

  return (
    <main className={styles.page}>
      <header className={styles.hero}>
        <p className={styles.eyebrow}>Component Manual</p>
        <h1>Components</h1>
        <Text className={styles.lead} variant="body">
          Website cards explain the role, import path, and visual rhythm of every public component.
          Storybook provides full controls, interaction tests, and edge states.
        </Text>
      </header>

      <section className={styles.toolbar} aria-label="Component search and summary">
        <div className={styles.searchWrapper}>
          <Input
            id="components-search"
            label="Search components"
            placeholder="Search components..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <div className={styles.stats} aria-live="polite">
          <span>{filtered.length}</span>
          <Text variant="caption">shown of {COMPONENT_CATALOG.length} components</Text>
        </div>
      </section>

      {filtered.length === 0 ? (
        <div className={styles.empty}>
          <Text variant="caption">No components match "{query}"</Text>
        </div>
      ) : (
        COMPONENT_CATEGORIES.map((category) => {
          const items = filtered.filter((item) => item.category === category.id);
          if (items.length === 0) return null;

          return (
            <section key={category.id} className={styles.section}>
              <header className={styles.sectionHead}>
                <span>{String(items.length).padStart(2, '0')}</span>
                <h2>{category.label}</h2>
              </header>
              <div className={styles.grid}>
                {items.map((item) => (
                  <ComponentCard key={item.name} item={item} />
                ))}
              </div>
            </section>
          );
        })
      )}
    </main>
  );
};

type ComponentCardProps = {
  item: ComponentCatalogItem;
};

const ComponentCard = ({ item }: ComponentCardProps) => (
  <article className={styles.card} aria-label={item.name}>
    <div className={styles.cardHeader}>
      <h3>{item.name}</h3>
      <span>{item.category}</span>
    </div>
    <p>{item.description}</p>
    <code>{item.importSnippet}</code>
    <div className={styles.dimensions}>
      {item.dimensions.map((dimension) => (
        <span key={dimension}>{dimension}</span>
      ))}
    </div>
    <div className={styles.preview} role="group" aria-label={`${item.name} preview`}>
      {item.preview}
    </div>
    <Button
      aria-label={`${item.name} Storybook`}
      href={getStorybookUrl(item.storyId)}
      className={styles.storyLink}
      icon={<ExternalLinkIcon aria-hidden size="xs" />}
      rel="noopener noreferrer"
      target="_blank"
      variant="link"
    >
      {item.name} Storybook
    </Button>
  </article>
);
