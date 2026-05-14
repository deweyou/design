import { Text } from '@deweyou-design/react';

import {
  COMPONENT_CATEGORIES,
  COMPONENT_CATALOG,
  type ComponentCatalogItem,
  getStorybookUrl,
} from '../data/component-catalog';
import styles from './components.module.less';

export const ComponentsPage = () => (
  <main className={styles.page}>
    <header className={styles.hero}>
      <p className={styles.eyebrow}>Component Manual</p>
      <h1>Components</h1>
      <Text className={styles.lead} variant="body">
        Website cards explain the role, import path, and visual rhythm of every public component.
        Storybook provides full controls, interaction tests, and edge states.
      </Text>
    </header>

    {COMPONENT_CATEGORIES.map((category) => {
      const items = COMPONENT_CATALOG.filter((item) => item.category === category.id);

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
    })}
  </main>
);

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
    <a
      href={getStorybookUrl(item.storyId)}
      target="_blank"
      rel="noopener noreferrer"
      className={styles.storyLink}
    >
      {item.name} Storybook ↗
    </a>
  </article>
);
