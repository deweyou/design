import { renderToStaticMarkup } from 'react-dom/server';
import { expect, test } from 'vite-plus/test';

import { Icon } from './index';

test('unsupported names fail explicitly instead of rendering a fallback icon', () => {
  expect(() => renderToStaticMarkup(<Icon name={'unknown-icon' as never} />)).toThrow(
    'Unsupported icon name "unknown-icon".',
  );
});
