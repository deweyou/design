// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, test } from 'vite-plus/test';

import { expect } from '../test-setup';

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
  expect(cells.length).toBeGreaterThanOrEqual(10);
});

test('search filters the icon list', () => {
  renderPage();
  const input = screen.getByPlaceholderText('搜索图标...');
  const allCells = screen.getAllByRole('button');

  fireEvent.change(input, { target: { value: 'arrow' } });

  const filteredCells = screen.getAllByRole('button');
  expect(filteredCells.length).toBeLessThan(allCells.length);
  filteredCells.forEach((cell) => {
    expect(cell.getAttribute('aria-label')).toContain('arrow');
  });
});

test('shows empty state when search has no results', () => {
  renderPage();
  const input = screen.getByPlaceholderText('搜索图标...');
  fireEvent.change(input, { target: { value: 'zzznomatch' } });
  expect(screen.getByText(/没有匹配/)).toBeInTheDocument();
});
