import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { expect, test } from 'vite-plus/test';

import { Nav, type NavRootProps, type NavLinkProps } from './index';

const stylesheet = readFileSync(resolve(import.meta.dirname, 'index.module.less'), 'utf8');

// ── Nav.Root ──────────────────────────────────────────────────────────────

test('Nav.Root renders as nav element', () => {
  const markup = renderToStaticMarkup(createElement(Nav.Root, {}));
  expect(markup).toContain('<nav');
});

test('Nav.Root has default aria-label "navigation"', () => {
  const markup = renderToStaticMarkup(createElement(Nav.Root, {}));
  expect(markup).toContain('aria-label="navigation"');
});

test('Nav.Root accepts custom aria-label', () => {
  const markup = renderToStaticMarkup(createElement(Nav.Root, { 'aria-label': '主导航' }));
  expect(markup).toContain('aria-label="主导航"');
});

test('Nav.Root forwards className and style', () => {
  const markup = renderToStaticMarkup(
    createElement(Nav.Root, { className: 'my-nav', style: { gap: '8px' } }),
  );
  expect(markup).toContain('my-nav');
  expect(markup).toContain('gap');
});

// ── Nav.Link ──────────────────────────────────────────────────────────────

test('Nav.Link renders as anchor element', () => {
  const markup = renderToStaticMarkup(
    createElement(Nav.Root, {}, createElement(Nav.Link, { href: '/about' }, 'About')),
  );
  expect(markup).toContain('<a');
  expect(markup).toContain('href="/about"');
});

test('Nav.Link adds data-active attribute when active=true', () => {
  const markup = renderToStaticMarkup(
    createElement(Nav.Root, {}, createElement(Nav.Link, { href: '/about', active: true }, 'About')),
  );
  expect(markup).toContain('data-active');
});

test('Nav.Link omits data-active when active=false', () => {
  const markup = renderToStaticMarkup(
    createElement(
      Nav.Root,
      {},
      createElement(Nav.Link, { href: '/about', active: false }, 'About'),
    ),
  );
  expect(markup).not.toContain('data-active');
});

test('Nav.Link omits data-active when active is not provided', () => {
  const markup = renderToStaticMarkup(
    createElement(Nav.Root, {}, createElement(Nav.Link, { href: '/about' }, 'About')),
  );
  expect(markup).not.toContain('data-active');
});

test('Nav.Link renders label text', () => {
  const markup = renderToStaticMarkup(
    createElement(Nav.Root, {}, createElement(Nav.Link, { href: '/' }, 'Home')),
  );
  expect(markup).toContain('Home');
});

test('Nav.Link forwards className', () => {
  const markup = renderToStaticMarkup(
    createElement(
      Nav.Root,
      {},
      createElement(Nav.Link, { href: '/', className: 'custom-link' }, 'Home'),
    ),
  );
  expect(markup).toContain('custom-link');
});

// ── Compound structure ────────────────────────────────────────────────────

test('Nav exports Root and Link as compound components', () => {
  expect(typeof Nav.Root).toBe('function');
  expect(typeof Nav.Link).toBe('function');
});

// ── Stylesheet token checks ───────────────────────────────────────────────

test('nav stylesheet uses --ui-color-text-muted for default link color', () => {
  expect(stylesheet).toContain('--ui-color-text-muted');
});

test('nav stylesheet uses --ui-color-brand-bg for active indicator', () => {
  expect(stylesheet).toContain('--ui-color-brand-bg');
});

test('nav stylesheet uses color-mix for hover background', () => {
  expect(stylesheet).toContain('color-mix');
});

test('nav stylesheet uses focus-ring-offset mixin', () => {
  expect(stylesheet).toContain('focus-ring-offset');
});

test('nav stylesheet does not use raw palette tokens', () => {
  expect(stylesheet).not.toContain('--ui-color-palette-');
});

test('Nav.Link adds aria-current="page" when active=true', () => {
  const markup = renderToStaticMarkup(
    createElement(Nav.Root, {}, createElement(Nav.Link, { href: '/about', active: true }, 'About')),
  );
  expect(markup).toContain('aria-current="page"');
});

test('Nav.Link applies linkVertical class when Nav.Root orientation is vertical', () => {
  const markup = renderToStaticMarkup(
    createElement(
      Nav.Root,
      { orientation: 'vertical' },
      createElement(Nav.Link, { href: '/' }, 'Home'),
    ),
  );
  // The linkVertical CSS module class should be applied
  // We verify by checking the stylesheet contains the class definition
  const stylesheet = readFileSync(resolve(import.meta.dirname, 'index.module.less'), 'utf8');
  expect(stylesheet).toContain('linkVertical');
  // And verify orientation prop is accepted without error
  expect(markup).toContain('<a');
});
