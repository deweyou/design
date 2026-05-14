// @vitest-environment jsdom

import { cleanup, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, test } from 'vite-plus/test';

import { expect } from '../test-setup';
import { Navbar } from './navbar';

afterEach(() => {
  cleanup();
});

const renderNavbar = (initialPath = '/') =>
  render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Navbar mode="light" onToggleMode={() => undefined} />
    </MemoryRouter>,
  );

test('renders the compact top navigation without a Theme destination', () => {
  renderNavbar();

  expect(screen.getByText('Deweyou Design')).toBeInTheDocument();
  expect(screen.getByText('Overview')).toBeInTheDocument();
  expect(screen.getByText('Components')).toBeInTheDocument();
  expect(screen.getByText('Icons')).toBeInTheDocument();
  expect(screen.getByText('Storybook')).toBeInTheDocument();
  expect(screen.getByText('GitHub')).toBeInTheDocument();
  expect(screen.queryByText('Theme')).not.toBeInTheDocument();
  expect(screen.queryByText('v1.0')).not.toBeInTheDocument();
  expect(screen.queryByText('light')).not.toBeInTheDocument();
  expect(screen.getByRole('button', { name: '切换深色模式' })).toBeInTheDocument();
});

test('marks Overview active on the home route', () => {
  renderNavbar('/');
  expect(screen.getByText('Overview').closest('a')?.className).toContain('active');
});

test('marks Components active on /components', () => {
  renderNavbar('/components');
  expect(screen.getByText('Components').closest('a')?.className).toContain('active');
});

test('marks Icons active on /icons', () => {
  renderNavbar('/icons');
  expect(screen.getByText('Icons').closest('a')?.className).toContain('active');
});
