// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, test, vi } from 'vite-plus/test';

import * as Icons from '@deweyou-design/react-icons';

import { iconRegistry } from '../../../../packages/react-icons/src/icon-registry';
import { expect } from '../test-setup';

import { IconsPage } from './icons';

const originalClipboardDescriptor = Object.getOwnPropertyDescriptor(navigator, 'clipboard');

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();

  if (originalClipboardDescriptor) {
    Object.defineProperty(navigator, 'clipboard', originalClipboardDescriptor);
  } else {
    Reflect.deleteProperty(navigator, 'clipboard');
  }
});

const renderPage = () =>
  render(
    <MemoryRouter>
      <IconsPage />
    </MemoryRouter>,
  );

test('renders icon grid with all icons', () => {
  renderPage();
  const exportedIconCount = Object.keys(Icons).filter((key) => key.endsWith('Icon')).length;
  const cells = screen.getAllByRole('button');

  expect(screen.getByText(/full TDesign registry/)).toBeInTheDocument();
  expect(cells).toHaveLength(exportedIconCount);
  expect(cells).toHaveLength(iconRegistry.length);
  expect(iconRegistry.length).toBeGreaterThan(2000);
  expect(screen.queryByText(/Tabler Icons/)).not.toBeInTheDocument();
});

test('search filters the icon list', () => {
  renderPage();
  const input = screen.getByPlaceholderText('Search icons...');
  const allCells = screen.getAllByRole('button');

  fireEvent.change(input, { target: { value: 'arrow' } });

  const filteredCells = screen.getAllByRole('button');
  expect(filteredCells.length).toBeLessThan(allCells.length);
  filteredCells.forEach((cell: HTMLElement) => {
    expect(cell.getAttribute('aria-label')).toContain('arrow');
  });
});

test('shows empty state when search has no results', () => {
  renderPage();
  const input = screen.getByPlaceholderText('Search icons...');
  fireEvent.change(input, { target: { value: 'zzznomatch' } });
  expect(screen.getByText(/No icons match/)).toBeInTheDocument();
});

test('copies an import snippet when clicking an icon', () => {
  const writeText = vi.fn().mockResolvedValue(undefined);
  Object.defineProperty(navigator, 'clipboard', {
    configurable: true,
    value: { writeText },
  });

  renderPage();
  fireEvent.click(
    screen.getByRole('button', { name: 'Copy the import statement for alert-circle' }),
  );

  expect(writeText).toHaveBeenCalledWith(
    "import { AlertCircleIcon } from '@deweyou-design/react-icons'",
  );
});

test('falls back to document copy when clipboard api is unavailable', () => {
  Reflect.deleteProperty(navigator, 'clipboard');
  const execCommand = vi.fn().mockReturnValue(true);
  Object.defineProperty(document, 'execCommand', {
    configurable: true,
    value: execCommand,
  });

  renderPage();
  fireEvent.click(
    screen.getByRole('button', { name: 'Copy the import statement for alert-circle' }),
  );

  expect(execCommand).toHaveBeenCalledWith('copy');
});
