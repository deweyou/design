// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { afterAll, afterEach, beforeAll, test, vi } from 'vite-plus/test';

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
  vi.restoreAllMocks();
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
    const storyLink = within(card).getByRole('link', { name: `${item.name} Storybook` });
    expect(storyLink).toHaveAttribute('target', '_blank');
    expect(storyLink).toHaveAttribute('rel', 'noopener noreferrer');
  }
});

test('search filters component cards and summary count', () => {
  render(<ComponentsPage />);

  fireEvent.change(screen.getByPlaceholderText('Search components...'), {
    target: { value: 'button' },
  });

  expect(screen.getByText(`shown of ${COMPONENT_CATALOG.length} components`)).toBeInTheDocument();
  expect(screen.getByRole('article', { name: 'Button' })).toBeInTheDocument();
  expect(screen.getByRole('article', { name: 'IconButton' })).toBeInTheDocument();
  expect(screen.queryByRole('article', { name: 'Card' })).not.toBeInTheDocument();
});

test('component storybook links open the generated story URL', () => {
  const open = vi.spyOn(window, 'open').mockImplementation(() => ({}) as Window);
  render(<ComponentsPage />);

  fireEvent.click(screen.getByRole('link', { name: 'Button Storybook' }));

  expect(open).toHaveBeenCalledWith(
    'https://design-storybook-deweyous-projects.vercel.app/?path=/docs/components-button--overview',
    '_blank',
    'noopener,noreferrer',
  );
});

test('dialog preview opens an interactive dialog', async () => {
  render(<ComponentsPage />);

  const card = screen.getByRole('article', { name: 'Dialog' });
  fireEvent.click(within(card).getByRole('button', { name: 'Open dialog' }));

  await waitFor(() => {
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });
  expect(screen.getByRole('heading', { name: 'Catalog dialog' })).toBeInTheDocument();
  expect(screen.getByText('Ready for review')).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Confirm' })).toBeInTheDocument();
});

test('field catalog preview uses the design-system input surface', () => {
  render(<ComponentsPage />);

  const card = screen.getByRole('article', { name: 'Field' });

  expect(within(card).getByPlaceholderText('Deweyou')).toBeInTheDocument();
  expect(within(card).getByText('Short field hint')).toBeInTheDocument();
});

test('shows empty state when component search has no results', () => {
  render(<ComponentsPage />);

  fireEvent.change(screen.getByPlaceholderText('Search components...'), {
    target: { value: 'zzznomatch' },
  });

  expect(screen.getByText(/No components match/)).toBeInTheDocument();
  expect(screen.queryByRole('article')).not.toBeInTheDocument();
});
