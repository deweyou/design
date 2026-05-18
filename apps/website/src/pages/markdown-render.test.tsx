// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, test, vi } from 'vite-plus/test';

import { expect } from '../test-setup';

import { MarkdownRenderPage } from './markdown-render';

vi.mock('@deweyou-design/react-icons', () => ({
  CheckIcon: () => <span aria-hidden data-testid="mock-check-icon" />,
  EditIcon: () => <span aria-hidden data-testid="mock-edit-icon" />,
  EyeIcon: () => <span aria-hidden data-testid="mock-eye-icon" />,
  MinusIcon: () => <span aria-hidden data-testid="mock-minus-icon" />,
}));

afterEach(() => {
  cleanup();
});

test('renders the default markdown sample in the live preview', () => {
  render(<MarkdownRenderPage />);

  const preview = screen.getByRole('region', { name: 'Markdown preview' });

  expect(screen.getByRole('heading', { name: 'Markdown Render' })).toBeInTheDocument();
  expect(within(preview).getByRole('heading', { name: 'Release note' })).toBeInTheDocument();
  expect(within(preview).getByText('Inline code')).toBeInTheDocument();
  expect(within(preview).getByRole('table')).toBeInTheDocument();
});

test('updates the preview as the user edits markdown', () => {
  render(<MarkdownRenderPage />);

  fireEvent.change(screen.getByLabelText('Markdown source'), {
    target: { value: '# Custom title\n\nA focused preview.' },
  });

  const preview = screen.getByRole('region', { name: 'Markdown preview' });

  expect(within(preview).getByRole('heading', { name: 'Custom title' })).toBeInTheDocument();
  expect(within(preview).getByText('A focused preview.')).toBeInTheDocument();
  expect(within(preview).queryByRole('heading', { name: 'Release note' })).not.toBeInTheDocument();
});

test('mobile controls start in preview mode and toggle to editing', () => {
  render(<MarkdownRenderPage />);

  expect(screen.getByRole('button', { name: 'Edit markdown source' })).toBeInTheDocument();
  expect(screen.getByRole('region', { name: 'Markdown preview' })).toHaveAttribute(
    'data-mobile-active',
    'true',
  );
  expect(screen.getByRole('region', { name: 'Markdown editor' })).toHaveAttribute(
    'data-mobile-active',
    'false',
  );

  fireEvent.click(screen.getByRole('button', { name: 'Edit markdown source' }));

  expect(screen.getByRole('button', { name: 'Preview rendered markdown' })).toBeInTheDocument();
  expect(screen.getByRole('region', { name: 'Markdown preview' })).toHaveAttribute(
    'data-mobile-active',
    'false',
  );
  expect(screen.getByRole('region', { name: 'Markdown editor' })).toHaveAttribute(
    'data-mobile-active',
    'true',
  );
});
