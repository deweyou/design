import { renderToStaticMarkup } from 'react-dom/server';
import { expect, test } from 'vite-plus/test';

import { InfoCircleIcon } from '../exports/info-circle';
import { MenuIcon } from '../exports/menu';

test('docs examples cover both labeled and unlabeled icon usage', () => {
  const unlabeledMarkup = renderToStaticMarkup(<MenuIcon />);
  const labeledMarkup = renderToStaticMarkup(<InfoCircleIcon label="Information" />);

  expect(unlabeledMarkup).toContain('aria-hidden="true"');
  expect(labeledMarkup).toContain('aria-label="Information"');
});
