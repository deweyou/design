// @vitest-environment jsdom

import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, test } from 'vite-plus/test';

import { expect } from '../test-setup';
import { EditorPage } from './editor';

afterEach(() => {
  cleanup();
});

test('renders the editor playground as the first page experience', () => {
  render(<EditorPage />);

  expect(screen.getAllByRole('heading', { level: 1, name: 'Editor' }).length).toBeGreaterThan(0);
  expect(screen.getByRole('textbox')).toBeInTheDocument();
  expect(screen.getByRole('toolbar', { name: 'Editor formatting toolbar' })).toBeInTheDocument();
});

test('does not render a raw markdown output preview', () => {
  render(<EditorPage />);

  expect(screen.queryByLabelText('Markdown output')).not.toBeInTheDocument();
  expect(screen.queryByText('Markdown output')).not.toBeInTheDocument();
});
