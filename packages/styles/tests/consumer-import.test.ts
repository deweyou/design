import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { expect, test } from 'vite-plus/test';

const root = resolve(import.meta.dirname, '../../..');

test('consumer setup keeps the global style import explicit', () => {
  const websiteMain = readFileSync(resolve(root, 'apps/website/src/main.tsx'), 'utf8');
  const storybookPreview = readFileSync(
    resolve(root, 'apps/storybook/.storybook/preview.ts'),
    'utf8',
  );
  const storybookMain = readFileSync(resolve(root, 'apps/storybook/.storybook/main.ts'), 'utf8');
  const lessBridge = readFileSync(resolve(root, 'packages/styles/src/less/bridge.less'), 'utf8');

  expect(websiteMain).toContain("import '@deweyou-design/styles/theme.css';");
  expect(websiteMain).toContain("import 'virtual:deweyou-website-fonts.css';");
  expect(storybookPreview).toContain("import '@deweyou-design/styles/theme-with-fonts.css';");
  expect(storybookMain).toContain('find: /^@deweyou-design\\/styles\\/theme-with-fonts\\.css$/');
  expect(websiteMain).not.toContain('theme-with-fonts.css');
  expect(lessBridge).toContain('@brand-bg');
  expect(lessBridge).toContain('@danger-bg');
  expect(lessBridge).toContain('@brand-text');
  expect(websiteMain).not.toContain('@deweyou-design/react/style.css');
  expect(storybookPreview).not.toContain('@deweyou-design/react/style.css');
});

test('website owns the Source Han Sans and Serif subset generation', () => {
  const websiteViteConfig = readFileSync(resolve(root, 'apps/website/vite.config.ts'), 'utf8');

  expect(websiteViteConfig).toContain("'subset-font'");
  expect(websiteViteConfig).toContain('virtual:deweyou-website-fonts.css');
  expect(websiteViteConfig).toContain('Source Han Sans SC Web');
  expect(websiteViteConfig).toContain('SourceHanSansSC-Regular.otf');
  expect(websiteViteConfig).toContain('Source Han Serif CN Web');
  expect(websiteViteConfig).toContain('SourceHanSerifCN-Regular.otf');
  expect(websiteViteConfig).toContain('font-display: swap');
});

test('subpath component stories do not require an extra component stylesheet import', () => {
  const buttonStory = readFileSync(
    resolve(root, 'apps/storybook/src/stories/Button.stories.tsx'),
    'utf8',
  );
  const popoverStory = readFileSync(
    resolve(root, 'apps/storybook/src/stories/Popover.stories.tsx'),
    'utf8',
  );
  const typographyStory = readFileSync(
    resolve(root, 'apps/storybook/src/stories/Typography.stories.tsx'),
    'utf8',
  );

  expect(buttonStory).toContain('@deweyou-design/react/button');
  expect(popoverStory).toContain('@deweyou-design/react/popover');
  expect(popoverStory).toContain('@deweyou-design/react/text');
  expect(typographyStory).toContain('@deweyou-design/react/text');
  expect(buttonStory).not.toContain('@deweyou-design/react/style.css');
  expect(popoverStory).not.toContain('@deweyou-design/react/style.css');
  expect(typographyStory).not.toContain('@deweyou-design/react/style.css');
});
