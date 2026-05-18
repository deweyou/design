import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { expect, test } from 'vite-plus/test';

const markdownRenderStyles = readFileSync(
  resolve(import.meta.dirname, 'markdown-render.module.less'),
  'utf8',
);

test('mobile editor mode keeps enough vertical editing room', () => {
  const mobileRule =
    markdownRenderStyles.match(/@media \(max-width: 760px\) \{[\s\S]*?\n\}/)?.[0] ?? '';

  expect(mobileRule).toContain(".editorPane[data-mobile-active='true']");
  expect(mobileRule).toContain(
    'min-block-size: max(28rem, calc(100vh - var(--website-nav-offset) - 220px));',
  );
});
