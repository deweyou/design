import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { expect, test } from 'vite-plus/test';

import { Breadcrumb } from './index';

const stylesheet = readFileSync(resolve(import.meta.dirname, 'index.module.less'), 'utf8');

const renderBreadcrumbMarkup = () =>
  renderToStaticMarkup(
    createElement(
      Breadcrumb.Root,
      null,
      createElement(
        Breadcrumb.List,
        null,
        createElement(
          Breadcrumb.Item,
          null,
          createElement(Breadcrumb.Link, { href: '/' }, 'Home'),
          createElement(Breadcrumb.Separator, null),
        ),
        createElement(
          Breadcrumb.Item,
          null,
          createElement(Breadcrumb.Current, null, 'Current Page'),
        ),
      ),
    ),
  );

test('breadcrumb root renders as a nav element', () => {
  const markup = renderBreadcrumbMarkup();
  expect(markup).toContain('<nav');
});

test('breadcrumb list renders as an ol element', () => {
  const markup = renderBreadcrumbMarkup();
  expect(markup).toContain('<ol');
});

test('breadcrumb item renders as an li element', () => {
  const markup = renderBreadcrumbMarkup();
  expect(markup).toContain('<li');
});

test('breadcrumb link renders as an anchor element', () => {
  const markup = renderBreadcrumbMarkup();
  expect(markup).toContain('<a');
  expect(markup).toContain('href="/"');
  expect(markup).toContain('Home');
});

test('breadcrumb current renders with aria-current="page"', () => {
  const markup = renderBreadcrumbMarkup();
  expect(markup).toContain('aria-current="page"');
  expect(markup).toContain('Current Page');
});

test('breadcrumb separator renders with aria-hidden="true"', () => {
  const markup = renderBreadcrumbMarkup();
  expect(markup).toContain('aria-hidden="true"');
});

test('breadcrumb root has aria-label', () => {
  const markup = renderToStaticMarkup(
    createElement(Breadcrumb.Root, { 'aria-label': 'Navigation trail' }, null),
  );
  expect(markup).toContain('aria-label="Navigation trail"');
});

test('breadcrumb stylesheet uses semantic tokens', () => {
  expect(stylesheet).toContain('--ui-color-text');
  expect(stylesheet).toContain('--ui-color-text-muted');
  expect(stylesheet).not.toContain('--ui-color-palette-');
});

test('breadcrumb stylesheet defines list and item layout', () => {
  expect(stylesheet).toContain('list');
  expect(stylesheet).toContain('item');
  expect(stylesheet).toContain('flex');
});
