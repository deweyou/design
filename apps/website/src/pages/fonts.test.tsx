// @vitest-environment jsdom

import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, test } from 'vite-plus/test';

import { expect } from '../test-setup';
import { FontsPage } from './fonts';

afterEach(() => {
  cleanup();
});

test('renders the font strategy guide', () => {
  render(<FontsPage />);

  expect(screen.getByRole('heading', { name: 'Fonts' })).toBeInTheDocument();
  expect(screen.getByText('Control Sans')).toBeInTheDocument();
  expect(screen.getByText('Content Serif')).toBeInTheDocument();
  expect(screen.getByText("fullFonts: 'idle'")).toBeInTheDocument();
  expect(screen.getByText('browser cache')).toBeInTheDocument();
  expect(
    screen.getAllByText((_, element) =>
      Boolean(element?.textContent?.includes("import { fontSubset } from '@deweyou-design/styles")),
    ).length,
  ).toBeGreaterThan(0);
  expect(screen.getByText('ts')).toBeInTheDocument();
  expect(screen.getAllByText(/inject: true/).length).toBeGreaterThan(0);
  expect(screen.getByText(/subset CSS immediately/)).toBeInTheDocument();
});
