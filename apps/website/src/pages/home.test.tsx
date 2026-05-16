// @vitest-environment jsdom

import { cleanup, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, test } from 'vite-plus/test';

import { expect } from '../test-setup';
import { HomePage } from './home';

class ResizeObserverStub {
  disconnect = () => undefined;
  observe = () => undefined;
  unobserve = () => undefined;
}

const originalResizeObserverDescriptor = Object.getOwnPropertyDescriptor(
  globalThis,
  'ResizeObserver',
);

beforeAll(() => {
  globalThis.ResizeObserver = ResizeObserverStub;
});

afterEach(() => {
  cleanup();
});

afterAll(() => {
  if (originalResizeObserverDescriptor) {
    Object.defineProperty(globalThis, 'ResizeObserver', originalResizeObserverDescriptor);
  } else {
    Reflect.deleteProperty(globalThis, 'ResizeObserver');
  }
});

test('renders Overview as a design specification cover', () => {
  render(
    <MemoryRouter>
      <HomePage />
    </MemoryRouter>,
  );

  expect(screen.getByRole('heading', { name: 'Deweyou Design' })).toBeInTheDocument();
  expect(screen.getByText('Get Started')).toBeInTheDocument();
  expect(screen.getByText('Principles')).toBeInTheDocument();
  expect(screen.getByText('Color Semantics')).toBeInTheDocument();
  expect(screen.getByText('Typography')).toBeInTheDocument();
  expect(screen.queryByText('Shape & Interaction')).not.toBeInTheDocument();
  expect(screen.queryByText('Component Evidence')).not.toBeInTheDocument();
  expect(screen.getByText(/font subset/)).toBeInTheDocument();
  expect(screen.getByText(/semantic color model.*neutral.*primary.*danger/)).toBeInTheDocument();
  expect(screen.getByRole('link', { name: 'Components' })).toBeInTheDocument();
  expect(screen.getAllByRole('link', { name: 'Storybook' }).length).toBeGreaterThan(0);
  expect(screen.getByRole('link', { name: 'GitHub' })).toBeInTheDocument();
  expect(screen.getAllByText('01').length).toBeGreaterThan(0);
  expect(document.body.innerHTML).toContain('--ui-color-brand-bg-hover');
  expect(document.body.innerHTML).toContain('--ui-color-danger-bg-hover');
  expect(document.body.innerHTML).not.toContain('--ui-text-background-');
});
