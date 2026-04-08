import { renderToStaticMarkup } from 'react-dom/server';
import { expect, test } from 'vite-plus/test';

import { AddIcon } from '../exports/add';
import { Icon } from '../icon';
import { SearchIcon } from '../exports/search';

test('generic icon renders a loading placeholder on the server while named exports stay synchronous', () => {
  const genericMarkup = renderToStaticMarkup(<Icon label="Add item" name="add" size="large" />);
  const namedMarkup = renderToStaticMarkup(<AddIcon label="Add item" size="large" />);

  expect(genericMarkup).toContain('data-icon-loading="true"');
  expect(namedMarkup).toContain('class="dy-icon"');
  expect(namedMarkup).toContain('<svg');
});

test('named icon exports support standard and numeric sizing', () => {
  const extraSmallMarkup = renderToStaticMarkup(<SearchIcon size="extra-small" />);
  const numericMarkup = renderToStaticMarkup(<SearchIcon size={18} />);

  expect(extraSmallMarkup).toContain('width:12px');
  expect(extraSmallMarkup).toContain('height:12px');
  expect(extraSmallMarkup).toContain('line-height:0');
  expect(numericMarkup).toContain('width:18px');
  expect(numericMarkup).toContain('height:18px');
});

test('named icon exports inherit the surrounding font size when size is omitted', () => {
  const inheritedMarkup = renderToStaticMarkup(<SearchIcon />);

  expect(inheritedMarkup).toContain('width:1em');
  expect(inheritedMarkup).toContain('height:1em');
});
