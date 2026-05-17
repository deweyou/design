import { describe, expect, test } from 'vite-plus/test';

import { colorFamilies, semanticThemeTokens, styleEntrypoints } from './index.js';

describe('style catalog', () => {
  test('includes public style entrypoints', () => {
    expect(styleEntrypoints.map((entrypoint) => entrypoint.importPath)).toEqual(
      expect.arrayContaining([
        '@deweyou-design/styles/theme.css',
        '@deweyou-design/styles/color.css',
        '@deweyou-design/styles/less/bridge',
        '@deweyou-design/styles/unplugin-font-subset',
      ]),
    );
  });

  test('summarizes palette families and semantic tokens', () => {
    expect(colorFamilies).toContain('red');
    expect(colorFamilies).toContain('olive');
    expect(semanticThemeTokens).toContain('--ui-color-brand-bg');
    expect(semanticThemeTokens).toContain('--ui-font-body');
  });
});
