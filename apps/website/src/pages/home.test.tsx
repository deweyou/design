// @vitest-environment jsdom

import { cleanup, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, test } from 'vite-plus/test';

import { expect } from '../test-setup';
import { HomePage } from './home';

class ResizeObserverMock {
  disconnect = () => {};
  observe = () => {};
  unobserve = () => {};
}

globalThis.ResizeObserver = ResizeObserverMock;

afterEach(() => {
  cleanup();
});

const renderPage = () =>
  render(
    <MemoryRouter>
      <HomePage />
    </MemoryRouter>,
  );

test('documents the font loading paths on the home page', () => {
  renderPage();

  expect(screen.getByText('Font Loading')).toBeInTheDocument();
  expect(screen.getByText('fontSubset.vite')).toBeInTheDocument();
  expect(screen.getByText('virtual:deweyou-font-subset.css')).toBeInTheDocument();
  expect(screen.getByText('@deweyou-design/styles/theme-with-fonts.css')).toBeInTheDocument();
});
