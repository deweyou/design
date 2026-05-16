// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, useLocation } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, test, vi } from 'vite-plus/test';

import { expect } from '../test-setup';
import { Navbar } from './navbar';

class ResizeObserverStub {
  disconnect = () => undefined;
  observe = () => undefined;
  unobserve = () => undefined;
}

const originalResizeObserverDescriptor = Object.getOwnPropertyDescriptor(
  globalThis,
  'ResizeObserver',
);

beforeAll(() => {
  globalThis.ResizeObserver = ResizeObserverStub;
});

afterEach(() => {
  vi.restoreAllMocks();
  cleanup();
});

afterAll(() => {
  if (originalResizeObserverDescriptor) {
    Object.defineProperty(globalThis, 'ResizeObserver', originalResizeObserverDescriptor);
  } else {
    Reflect.deleteProperty(globalThis, 'ResizeObserver');
  }
});

const renderNavbar = (initialPath = '/') =>
  render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Navbar mode="light" onToggleMode={() => undefined} />
    </MemoryRouter>,
  );

const getTabByValue = (container: HTMLElement, value: string) => {
  const tab = container.querySelector<HTMLElement>(`[role="tab"][data-value="${value}"]`);

  if (!tab) {
    throw new Error(`Expected tab with value "${value}" to exist.`);
  }

  return tab;
};

const LocationProbe = () => {
  const location = useLocation();

  return <output aria-label="current path">{location.pathname}</output>;
};

test('renders the compact top navigation without a Theme destination', () => {
  renderNavbar();

  expect(screen.getByText('Deweyou Design')).toBeInTheDocument();
  expect(screen.getByText('Overview')).toBeInTheDocument();
  expect(screen.getByText('Components')).toBeInTheDocument();
  expect(screen.getByText('Icons')).toBeInTheDocument();
  expect(screen.getByText('Storybook')).toBeInTheDocument();
  expect(screen.getByText('GitHub')).toBeInTheDocument();
  expect(screen.queryByText('Theme')).not.toBeInTheDocument();
  expect(screen.queryByText('v1.0')).not.toBeInTheDocument();
  expect(screen.queryByText('light')).not.toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Switch to dark mode' })).toBeInTheDocument();
  expect(screen.getAllByRole('tab', { hidden: true })).toHaveLength(5);
  expect(screen.getByRole('button', { name: 'More' })).toBeInTheDocument();
});

test('marks Overview active on the home route', () => {
  const { container } = renderNavbar('/');
  expect(getTabByValue(container, '/')).toHaveAttribute('aria-selected', 'true');
});

test('marks Components active on /components', () => {
  const { container } = renderNavbar('/components');
  expect(getTabByValue(container, '/components')).toHaveAttribute('aria-selected', 'true');
});

test('marks Icons active on /icons', () => {
  const { container } = renderNavbar('/icons');
  expect(getTabByValue(container, '/icons')).toHaveAttribute('aria-selected', 'true');
});

test('route tabs preserve React Router client navigation', async () => {
  const { container } = render(
    <MemoryRouter initialEntries={['/']}>
      <Navbar mode="light" onToggleMode={() => undefined} />
      <LocationProbe />
    </MemoryRouter>,
  );

  fireEvent.click(getTabByValue(container, '/components'));

  return waitFor(() => {
    expect(screen.getByLabelText('current path')).toHaveTextContent('/components');
  });
});

test('external nav items are tabs and open in new tabs', () => {
  const open = vi.spyOn(window, 'open').mockImplementation(() => null);
  const { container } = renderNavbar();

  fireEvent.click(getTabByValue(container, 'storybook'));
  fireEvent.click(getTabByValue(container, 'github'));

  expect(open).toHaveBeenNthCalledWith(
    1,
    'https://design-storybook-deweyous-projects.vercel.app',
    '_blank',
    'noopener,noreferrer',
  );
  expect(open).toHaveBeenNthCalledWith(
    2,
    'https://github.com/deweyou/design',
    '_blank',
    'noopener,noreferrer',
  );
});
