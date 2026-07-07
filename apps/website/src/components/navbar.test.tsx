// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, useLocation } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, test, vi } from 'vite-plus/test';

import { expect } from '../test-setup';

vi.mock('@deweyou-design/react-icons', () => {
  const icons = {
    CheckIcon: () => <span aria-hidden data-testid="mock-check-icon" />,
    ChevronDownIcon: () => <span aria-hidden data-testid="mock-chevron-down-icon" />,
    ExternalLinkIcon: () => <span aria-hidden data-testid="mock-external-link-icon" />,
    EyeIcon: () => <span aria-hidden data-testid="mock-eye-icon" />,
    EditIcon: () => <span aria-hidden data-testid="mock-edit-icon" />,
    FileMarkdownIcon: () => <span aria-hidden data-testid="mock-file-markdown-icon" />,
    LogoGithubIcon: () => <span aria-hidden data-testid="mock-github-icon" />,
    MenuApplicationIcon: () => <span aria-hidden data-testid="mock-menu-icon" />,
    MenuIcon: () => <span aria-hidden data-testid="mock-nav-menu-icon" />,
    MinusIcon: () => <span aria-hidden data-testid="mock-minus-icon" />,
    MoonIcon: () => <span aria-hidden data-testid="mock-moon-icon" />,
    SunnyIcon: () => <span aria-hidden data-testid="mock-sunny-icon" />,
    XIcon: () => <span aria-hidden data-testid="mock-x-icon" />,
  };

  return new Proxy(icons, {
    get: (target, property) => {
      if (property === '__esModule') {
        return true;
      }

      if (property === 'then' || typeof property !== 'string') {
        return undefined;
      }

      return (
        Reflect.get(target, property) ??
        (property.endsWith('Icon')
          ? () => <span aria-hidden data-testid={`mock-${property}`} />
          : undefined)
      );
    },
    getOwnPropertyDescriptor: (target, property) => {
      const descriptor = Reflect.getOwnPropertyDescriptor(target, property);
      if (descriptor || typeof property !== 'string' || !property.endsWith('Icon')) {
        return descriptor;
      }

      return {
        configurable: true,
        enumerable: false,
        value: () => <span aria-hidden data-testid={`mock-${property}`} />,
      };
    },
    has: (target, property) =>
      Reflect.has(target, property) || (typeof property === 'string' && property.endsWith('Icon')),
  });
});

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

test('renders the compact top navigation with grouped explore destinations', () => {
  renderNavbar();

  expect(screen.getByRole('link', { name: 'Deweyou Design' })).toBeInTheDocument();
  expect(screen.getByRole('link', { name: 'Overview' })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Explore' })).toBeInTheDocument();
  expect(screen.getByRole('link', { name: 'AI' })).toBeInTheDocument();
  expect(screen.getByRole('link', { name: 'Storybook' })).toBeInTheDocument();
  expect(screen.queryByRole('link', { name: 'Components' })).not.toBeInTheDocument();
  expect(screen.queryByRole('link', { name: 'Fonts' })).not.toBeInTheDocument();
  expect(screen.queryByRole('link', { name: 'Icons' })).not.toBeInTheDocument();
  expect(screen.queryByRole('link', { name: 'Markdown' })).not.toBeInTheDocument();
  expect(screen.queryByRole('link', { name: 'Mermaid' })).not.toBeInTheDocument();
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
  expect(screen.getByRole('button', { name: 'Explore' })).toHaveAttribute('aria-current', 'page');
});

test('marks Editor active on /editor', () => {
  renderNavbar('/editor');
  expect(screen.getByRole('button', { name: 'Explore' })).toHaveAttribute('aria-current', 'page');
});

test('marks AI active on /ai', () => {
  renderNavbar('/ai');
  expect(screen.getByRole('link', { name: 'AI' })).toHaveAttribute('aria-current', 'page');
});

test('marks Icons active on /icons', () => {
  renderNavbar('/icons');
  expect(screen.getByRole('button', { name: 'Explore' })).toHaveAttribute('aria-current', 'page');
});

test('marks Fonts active on /fonts', () => {
  renderNavbar('/fonts');
  expect(screen.getByRole('button', { name: 'Explore' })).toHaveAttribute('aria-current', 'page');
});

test('marks Markdown active on /markdown-render', () => {
  renderNavbar('/markdown-render');
  expect(screen.getByRole('button', { name: 'Explore' })).toHaveAttribute('aria-current', 'page');
});

test('marks Mermaid active on /mermaid-render', () => {
  renderNavbar('/mermaid-render');
  expect(screen.getByRole('button', { name: 'Explore' })).toHaveAttribute('aria-current', 'page');
});

test('explore menu exposes grouped destinations', async () => {
  renderNavbar('/fonts');

  fireEvent.click(screen.getByRole('button', { name: 'Explore' }));

  expect(await screen.findByRole('menuitem', { name: 'Components' })).toBeInTheDocument();
  expect(screen.getByRole('menuitem', { name: 'Editor' })).toBeInTheDocument();
  expect(screen.getByRole('menuitem', { name: 'Fonts' })).toBeInTheDocument();
  expect(screen.getByRole('menuitem', { name: 'Icons' })).toBeInTheDocument();
  expect(screen.getByRole('menuitem', { name: 'Markdown' })).toBeInTheDocument();
  expect(screen.getByRole('menuitem', { name: 'Mermaid' })).toBeInTheDocument();
});

test('explore menu closes when clicking outside the menu', async () => {
  renderNavbar('/fonts');

  fireEvent.click(screen.getByRole('button', { name: 'Explore' }));
  expect(await screen.findByRole('menuitem', { name: 'Markdown' })).toBeInTheDocument();

  fireEvent.pointerDown(document.body);

  await waitFor(() => {
    expect(screen.queryByRole('menuitem', { name: 'Markdown' })).not.toBeInTheDocument();
  });
});

test('route links preserve React Router client navigation', async () => {
  render(
    <MemoryRouter initialEntries={['/']}>
      <Navbar mode="light" onToggleMode={() => undefined} />
      <LocationProbe />
    </MemoryRouter>,
  );

  fireEvent.click(screen.getByRole('button', { name: 'Explore' }));
  fireEvent.click(await screen.findByRole('menuitem', { name: 'Mermaid' }));

  return waitFor(() => {
    expect(screen.getByLabelText('current path')).toHaveTextContent('/mermaid-render');
  });
});

test('explore menu preserves React Router client navigation', async () => {
  render(
    <MemoryRouter initialEntries={['/']}>
      <Navbar mode="light" onToggleMode={() => undefined} />
      <LocationProbe />
    </MemoryRouter>,
  );

  fireEvent.click(screen.getByRole('button', { name: 'Explore' }));
  fireEvent.click(await screen.findByRole('menuitem', { name: 'Icons' }));

  return waitFor(() => {
    expect(screen.getByLabelText('current path')).toHaveTextContent('/icons');
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
