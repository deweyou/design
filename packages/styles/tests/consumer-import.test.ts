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

  expect(websiteMain).toContain("import '@deweyou-ui/styles/theme.css';");
  expect(websiteMain).toContain('Typography direction');
  expect(websiteMain).toContain('Mixed-script review');
  expect(storybookPreview).toContain("import '@deweyou-ui/styles/theme.css';");
  expect(storybookStory).not.toContain('TypographyContract');
  expect(storybookTypography).toContain('ReadingSurface');
  expect(storybookTypography).toContain('FontWeights');
  expect(storybookTypography).toContain('Weight comparison');
  expect(stylesReadme).toContain('Consumers should override only these color tokens in v1.');
  expect(stylesReadme).toContain('Source Han Serif');
});
