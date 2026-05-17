// @vitest-environment jsdom

import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, test } from 'vite-plus/test';

import { expect } from '../test-setup';
import { AiPage } from './ai';

afterEach(() => {
  cleanup();
});

test('renders the AI entrypoints page with llms, MCP, and skill usage', () => {
  render(<AiPage />);

  expect(screen.getByRole('heading', { name: 'AI' })).toBeInTheDocument();
  expect(screen.getByRole('heading', { name: 'llms.txt' })).toBeInTheDocument();
  expect(screen.getByRole('heading', { name: 'MCP' })).toBeInTheDocument();
  expect(screen.getByRole('heading', { name: 'Skill' })).toBeInTheDocument();
  expect(screen.getByRole('link', { name: '/llms.txt' })).toHaveAttribute('href', '/llms.txt');
  expect(screen.getByText('npm install @deweyou-design/mcp')).toBeInTheDocument();
  expect(screen.getByText('npx deweyou-design-mcp')).toBeInTheDocument();
  expect(
    screen.getByText(
      'npx skills add https://github.com/deweyou/design/tree/main/skills/deweyou-design-components -g -a codex',
    ),
  ).toBeInTheDocument();
  expect(screen.getByText(/three separate integration surfaces/)).toBeInTheDocument();
});
