// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, test } from 'vite-plus/test';

import { expect } from '../test-setup';

import { iconRegistry } from '../../../../packages/react-icons/src/icon-registry';
import { IconsPage } from './icons';

afterEach(() => {
  cleanup();
});

const renderPage = () =>
  render(
    <MemoryRouter>
      <IconsPage />
    </MemoryRouter>,
  );

test('renders icon grid with all icons', () => {
  renderPage();
  const cells = screen.getAllByRole('button');
  expect(cells).toHaveLength(iconRegistry.length);
  expect(
    screen.getByText(`${iconRegistry.length} / ${iconRegistry.length} icons`),
  ).toBeInTheDocument();
});

test('documents the TDesign source and Deweyou curated list', () => {
  renderPage();

  expect(screen.getAllByText(/tdesign-icons-svg/i).length).toBeGreaterThan(0);
  expect(screen.getByText(/Deweyou curated/i)).toBeInTheDocument();
  expect(screen.getByText(/full tdesign-icons-svg source set/i)).toBeInTheDocument();
});

test('documents direct imports while reserving namespace imports for the catalog', () => {
  renderPage();

  expect(screen.getByText(/direct named imports/i)).toBeInTheDocument();
  expect(screen.getByText(/namespace import/i)).toBeInTheDocument();
  expect(screen.getByText(/every supported icon/i)).toBeInTheDocument();
});

test('renders named size and color examples', () => {
  renderPage();

  expect(screen.getByText('size="sm"')).toBeInTheDocument();
  expect(screen.getByText('color="primary"')).toBeInTheDocument();
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
