// @vitest-environment jsdom

import { cleanup, render, screen, within } from '@testing-library/react';
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
  expect(screen.getByRole('textbox')).toHaveAttribute('spellcheck', 'false');
  expect(screen.getByRole('textbox')).toHaveAttribute('autocorrect', 'off');
  expect(screen.getByRole('textbox')).toHaveAttribute('autocapitalize', 'off');
});

test('does not render a raw markdown output preview', () => {
  render(<EditorPage />);

  expect(screen.queryByLabelText('Markdown output')).not.toBeInTheDocument();
  expect(screen.queryByText('Markdown output')).not.toBeInTheDocument();
});

test('seeds the full feature editor with each markdown-backed content type', async () => {
  render(<EditorPage />);
  const editorElement = screen.getByRole('textbox');
  const editor = within(editorElement);

  expect(editor.getByRole('heading', { level: 1, name: 'Editor' })).toBeInTheDocument();
  expect(editor.getByRole('heading', { level: 2, name: 'Structured blocks' })).toBeInTheDocument();
  expect(editor.getByRole('heading', { level: 3, name: 'Inline formatting' })).toBeInTheDocument();
  expect(editor.getByText('bold')).toBeInTheDocument();
  expect(editor.getByText('italic')).toBeInTheDocument();
  expect(editor.getByText('strikethrough')).toBeInTheDocument();
  expect(editor.getByText('inline code')).toBeInTheDocument();
  expect(editor.getByRole('link', { name: 'Deweyou Design' })).toHaveAttribute(
    'href',
    'https://deweyou.com',
  );
  expect(editor.getByText('Numbered follow-up')).toBeInTheDocument();
  expect(editor.getByText('Editing state is owned by Lexical nodes.')).toBeInTheDocument();
  const jsonCodeBlock = editorElement.querySelector('code[data-language="json"]');

  expect(jsonCodeBlock).toBeInstanceOf(HTMLElement);
  expect(jsonCodeBlock?.textContent).toContain('"plugins"');
  expect(jsonCodeBlock?.querySelector('[class*="codeToken"]')).toBeInstanceOf(HTMLElement);
  expect(await editor.findByRole('table')).toBeInTheDocument();
  expect(await editor.findByText('Feature')).toBeInTheDocument();
  expect(editor.getByText('tablePlugin')).toBeInTheDocument();
});
