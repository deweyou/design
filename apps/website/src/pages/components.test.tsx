// @vitest-environment jsdom

import { cleanup, render, screen, within } from '@testing-library/react';
import { afterAll, afterEach, beforeAll, test } from 'vite-plus/test';

import { COMPONENT_CATEGORIES, COMPONENT_CATALOG } from '../data/component-catalog';
import { expect } from '../test-setup';
import { ComponentsPage } from './components';

const OriginalResizeObserver = globalThis.ResizeObserver;
const OriginalIntersectionObserver = globalThis.IntersectionObserver;

beforeAll(() => {
  globalThis.ResizeObserver = class ResizeObserver {
    disconnect = () => undefined;
    observe = () => undefined;
    unobserve = () => undefined;
  };
  globalThis.IntersectionObserver = class IntersectionObserver {
    readonly root = null;
    readonly rootMargin = '';
    readonly thresholds = [];

    constructor(_callback: IntersectionObserverCallback, _options?: IntersectionObserverInit) {}

    disconnect = () => undefined;
    observe = () => undefined;
    takeRecords = () => [];
    unobserve = () => undefined;
  } as unknown as typeof IntersectionObserver;
});

afterEach(() => {
  cleanup();
});

afterAll(() => {
  globalThis.ResizeObserver = OriginalResizeObserver;
  globalThis.IntersectionObserver = OriginalIntersectionObserver;
});

test('renders a manual-style component catalog with every public component', () => {
  render(<ComponentsPage />);

  expect(screen.getByRole('heading', { name: 'Components' })).toBeInTheDocument();
  expect(screen.getByText(/Storybook provides full controls/)).toBeInTheDocument();

  expect(
    screen.queryByRole('navigation', { name: 'Component categories' }),
  ).not.toBeInTheDocument();

  for (const category of COMPONENT_CATEGORIES) {
    expect(screen.getByRole('heading', { name: category.label })).toBeInTheDocument();
  }

  for (const item of COMPONENT_CATALOG) {
    const card = screen.getByRole('article', { name: item.name });

    expect(within(card).getByRole('heading', { name: item.name })).toBeInTheDocument();
    expect(within(card).getByText(item.description)).toBeInTheDocument();
    expect(within(card).getByText(item.importSnippet)).toBeInTheDocument();

    for (const dimension of item.dimensions) {
      expect(within(card).getByText(dimension)).toBeInTheDocument();
    }

    expect(within(card).getByRole('group', { name: `${item.name} preview` })).toBeInTheDocument();
    const storyLink = within(card).getByRole('link', { name: `${item.name} Storybook ↗` });
    expect(storyLink).toHaveAttribute('target', '_blank');
    expect(storyLink).toHaveAttribute('rel', 'noopener noreferrer');
  }
});
