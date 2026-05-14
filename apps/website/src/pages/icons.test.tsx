// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, test, vi } from 'vite-plus/test';

import * as Icons from '@deweyou-design/react-icons';

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

  expect(screen.getByText(/every @deweyou-design\/react-icons export/)).toBeInTheDocument();
  expect(cells).toHaveLength(exportedIconCount);
  expect(screen.queryByText(/Tabler Icons/)).not.toBeInTheDocument();
});

test('search filters the icon list', () => {
  renderPage();
  const input = screen.getByPlaceholderText('搜索图标...');
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
  const input = screen.getByPlaceholderText('搜索图标...');
  fireEvent.change(input, { target: { value: 'zzznomatch' } });
  expect(screen.getByText(/没有匹配/)).toBeInTheDocument();
});

test('copies an import snippet when clicking an icon', () => {
  const writeText = vi.fn().mockResolvedValue(undefined);
  Object.defineProperty(navigator, 'clipboard', {
    configurable: true,
    value: { writeText },
  });

  renderPage();
  fireEvent.click(screen.getByRole('button', { name: '复制 alert-circle 图标的 import 语句' }));

  expect(writeText).toHaveBeenCalledWith(
    "import { AlertCircleIcon } from '@deweyou-design/react-icons'",
  );
});
