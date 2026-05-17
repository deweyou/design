import { describe, expect, test } from 'vite-plus/test';

import { findIcon, getIconImportSnippet, iconCatalog, listIcons } from './index.js';

describe('icon catalog', () => {
  test('includes the full generated react-icons registry', () => {
    expect(iconCatalog.length).toBeGreaterThan(1000);
    expect(findIcon('SearchIcon')?.exportName).toBe('SearchIcon');
    expect(findIcon('search')?.exportName).toBe('SearchIcon');
  });

  test('lists icons with query, category, and limit filters', () => {
    const icons = listIcons({ category: 'content', limit: 10, query: 'add' });

    expect(icons.length).toBeGreaterThan(0);
    expect(icons.length).toBeLessThanOrEqual(10);
    expect(icons.every((icon) => icon.category === 'content')).toBe(true);
  });

  test('generates icon import snippets', () => {
    expect(getIconImportSnippet('SearchIcon')).toBe(
      "import { SearchIcon } from '@deweyou-design/react-icons';",
    );
    expect(getIconImportSnippet('missing')).toBeUndefined();
  });
});
