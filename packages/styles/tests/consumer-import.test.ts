import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { expect, test } from 'vite-plus/test';

const root = resolve(import.meta.dirname, '../../..');

test('consumer setup keeps the global style import explicit', () => {
  const websiteMain = readFileSync(resolve(root, 'apps/website/src/main.tsx'), 'utf8');
  const stylesReadme = readFileSync(resolve(root, 'packages/styles/README.md'), 'utf8');
  const storybookPreview = readFileSync(
    resolve(root, 'apps/storybook/.storybook/preview.ts'),
    'utf8',
  );
  const storybookStory = readFileSync(
    resolve(root, 'apps/storybook/src/stories/Button.stories.tsx'),
    'utf8',
  );
  const storybookTypography = readFileSync(
    resolve(root, 'apps/storybook/src/stories/Typography.stories.tsx'),
    'utf8',
  );
  const storybookColor = readFileSync(
    resolve(root, 'apps/storybook/src/stories/Color.stories.tsx'),
    'utf8',
  );
  const lessBridge = readFileSync(resolve(root, 'packages/styles/src/less/bridge.less'), 'utf8');

  expect(websiteMain).toContain("import '@deweyou-ui/styles/theme.css';");
  expect(websiteMain).toContain('Color foundation');
  expect(websiteMain).toContain('非必要不得新增特化 token');
  expect(storybookPreview).toContain("import '@deweyou-ui/styles/theme.css';");
  expect(storybookStory).not.toContain('TypographyContract');
  expect(storybookTypography).toContain('ReadingSurface');
  expect(storybookTypography).toContain('FontWeights');
  expect(storybookTypography).toContain('Weight comparison');
  expect(storybookColor).toContain('Shared color foundation');
  expect(storybookColor).toContain('Use Storybook theme switching');
  expect(stylesReadme).toContain('共享基础色卡');
  expect(stylesReadme).toContain('非必要不得新增特化 token');
  expect(stylesReadme).toContain('Source Han Serif');
  expect(lessBridge).toContain('@brand-bg');
  expect(lessBridge).toContain('@danger-bg');
  expect(lessBridge).toContain('@link');
  expect(websiteMain).not.toContain('@deweyou-ui/components/style.css');
  expect(storybookPreview).not.toContain('@deweyou-ui/components/style.css');
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

  expect(buttonStory).toContain('@deweyou-ui/components/button');
  expect(popoverStory).toContain('@deweyou-ui/components/popover');
  expect(popoverStory).toContain('@deweyou-ui/components/text');
  expect(typographyStory).toContain('@deweyou-ui/components/text');
  expect(buttonStory).not.toContain('@deweyou-ui/components/style.css');
  expect(popoverStory).not.toContain('@deweyou-ui/components/style.css');
  expect(typographyStory).not.toContain('@deweyou-ui/components/style.css');
});
