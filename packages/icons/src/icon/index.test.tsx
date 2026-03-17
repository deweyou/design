import { renderToStaticMarkup } from 'react-dom/server';
import { expect, test } from 'vite-plus/test';

import { Icon } from './index';

test('icon resolves medium size by default and hides unlabeled output from assistive technology', () => {
  const markup = renderToStaticMarkup(<Icon name="add" />);

  expect(markup).toContain('data-icon-loading="true"');
  expect(markup).toContain('aria-hidden="true"');
  expect(markup).toContain('width:16px');
  expect(markup).toContain('height:16px');
});

test('icon supports numeric size overrides', () => {
  const markup = renderToStaticMarkup(<Icon name="search" size={28} />);

  expect(markup).toContain('width:28px');
  expect(markup).toContain('height:28px');
});

test('icon throws a descriptive error for unsupported icon names at runtime', () => {
  expect(() => renderToStaticMarkup(<Icon name={'missing' as never} />)).toThrow(
    'Unsupported icon name "missing".',
  );
});
