// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, useLocation } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, test, vi } from 'vite-plus/test';

import { expect } from '../test-setup';

vi.mock('@deweyou-design/react-icons', () => ({
  ExternalLinkIcon: () => <span aria-hidden data-testid="mock-external-link-icon" />,
  LogoGithubIcon: () => <span aria-hidden data-testid="mock-github-icon" />,
  MenuApplicationIcon: () => <span aria-hidden data-testid="mock-menu-icon" />,
  MenuIcon: () => <span aria-hidden data-testid="mock-nav-menu-icon" />,
  MoonIcon: () => <span aria-hidden data-testid="mock-moon-icon" />,
  SunnyIcon: () => <span aria-hidden data-testid="mock-sunny-icon" />,
  XIcon: () => <span aria-hidden data-testid="mock-x-icon" />,
}));

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

const LocationProbe = () => {
  const location = useLocation();

  return <output aria-label="current path">{location.pathname}</output>;
};

test('renders the compact top navigation without a Theme destination', () => {
  renderNavbar();

  expect(screen.getByText('Deweyou Design')).toBeInTheDocument();
  expect(screen.getByText('Overview')).toBeInTheDocument();
  expect(screen.getByText('Components')).toBeInTheDocument();
  expect(screen.getByText('Fonts')).toBeInTheDocument();
  expect(screen.getByText('Icons')).toBeInTheDocument();
  expect(screen.getByText('Storybook')).toBeInTheDocument();
  expect(screen.queryByRole('tab', { name: 'GitHub', hidden: true })).not.toBeInTheDocument();
  expect(screen.queryByText('Theme')).not.toBeInTheDocument();
  expect(screen.queryByText('v1.0')).not.toBeInTheDocument();
  expect(screen.queryByText('light')).not.toBeInTheDocument();
  expect(screen.getByRole('link', { name: 'GitHub' })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Switch to dark mode' })).toBeInTheDocument();
  expect(screen.queryAllByRole('tab', { hidden: true })).toHaveLength(0);
  expect(screen.getByRole('button', { name: 'Open navigation' })).toHaveClass(/actionButton/);
});

test('marks Overview active on the home route', () => {
  renderNavbar('/');
  expect(screen.getByRole('link', { name: 'Overview' })).toHaveAttribute('aria-current', 'page');
});

test('marks Components active on /components', () => {
  renderNavbar('/components');
  expect(screen.getByRole('link', { name: 'Components' })).toHaveAttribute('aria-current', 'page');
});

test('marks Icons active on /icons', () => {
  renderNavbar('/icons');
  expect(screen.getByRole('link', { name: 'Icons' })).toHaveAttribute('aria-current', 'page');
});

test('marks Fonts active on /fonts', () => {
  renderNavbar('/fonts');
  expect(screen.getByRole('link', { name: 'Fonts' })).toHaveAttribute('aria-current', 'page');
});

test('route links preserve React Router client navigation', async () => {
  render(
    <MemoryRouter initialEntries={['/']}>
      <Navbar mode="light" onToggleMode={() => undefined} />
      <LocationProbe />
    </MemoryRouter>,
  );

  fireEvent.click(screen.getByRole('link', { name: 'Components' }));

  return waitFor(() => {
    expect(screen.getByLabelText('current path')).toHaveTextContent('/components');
  });
});

test('storybook remains a nav link and GitHub moves to the action icon link', () => {
  renderNavbar();

  const storybookLink = screen.getByRole('link', { name: 'Storybook' });
  const githubLink = screen.getByRole('link', { name: 'GitHub' });

  expect(storybookLink).toHaveAttribute(
    'href',
    'https://design-storybook-deweyous-projects.vercel.app',
  );
  expect(storybookLink).toHaveAttribute('target', '_blank');
  expect(storybookLink).toHaveAttribute('rel', 'noopener noreferrer');
  expect(githubLink).toHaveAttribute('href', 'https://github.com/deweyou/design');
  expect(githubLink).toHaveAttribute('target', '_blank');
  expect(githubLink).toHaveAttribute('rel', 'noopener noreferrer');
});
