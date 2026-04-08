import { renderToStaticMarkup } from 'react-dom/server';
import { expect, test } from 'vite-plus/test';

import { Icon } from './index';

test('unlabeled icons render as decorative output', () => {
  const markup = renderToStaticMarkup(<Icon name="menu" />);

  expect(markup).toContain('aria-hidden="true"');
  expect(markup).not.toContain('aria-label=');
  expect(markup).not.toContain('role="img"');
});

test('labeled icons expose an accessible name', () => {
  const markup = renderToStaticMarkup(<Icon label="Open menu" name="menu" />);

  expect(markup).toContain('aria-label="Open menu"');
  expect(markup).toContain('role="img"');
  expect(markup).not.toContain('aria-hidden="true"');
});
