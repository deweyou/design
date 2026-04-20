// @vitest-environment jsdom

import { cleanup, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, expect, test } from 'vite-plus/test';
import * as jestDomMatchers from '@testing-library/jest-dom/matchers';

expect.extend(jestDomMatchers);

afterEach(() => {
  cleanup();
});

import { Navbar } from './navbar';

const renderNavbar = (initialPath = '/') =>
  render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Navbar />
    </MemoryRouter>,
  );

test('renders all four nav links', () => {
  renderNavbar();
  expect(screen.getByText('Home')).toBeInTheDocument();
  expect(screen.getByText('Icons')).toBeInTheDocument();
  expect(screen.getByText('Storybook ↗')).toBeInTheDocument();
  expect(screen.getByText('GitHub ↗')).toBeInTheDocument();
});

test('Home link is active on /', () => {
  renderNavbar('/');
  const homeLink = screen.getByText('Home').closest('a');
  expect(homeLink?.className).toContain('active');
});

test('Icons link is active on /icons', () => {
  renderNavbar('/icons');
  const iconsLink = screen.getByText('Icons').closest('a');
  expect(iconsLink?.className).toContain('active');
});
