// @vitest-environment jsdom

import { act, cleanup, render } from '@testing-library/react';
import { Link, MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, test, vi } from 'vite-plus/test';

import { expect } from '../test-setup';
import { ScrollToTop } from './scroll-to-top';

afterEach(() => {
  vi.restoreAllMocks();
  cleanup();
});

const TestApp = () => (
  <MemoryRouter initialEntries={['/']}>
    <ScrollToTop />
    <Link to="/components">Components</Link>
    <Routes>
      <Route path="/" element={<div>Overview</div>} />
      <Route path="/components" element={<div>Components</div>} />
    </Routes>
  </MemoryRouter>
);

test('scrolls to the top before route pages paint', () => {
  const scrollTo = vi.spyOn(window, 'scrollTo').mockImplementation(() => undefined);

  const { getByRole } = render(<TestApp />);

  expect(scrollTo).toHaveBeenLastCalledWith({ behavior: 'instant', left: 0, top: 0 });

  act(() => {
    getByRole('link', { name: 'Components' }).click();
  });

  expect(scrollTo).toHaveBeenLastCalledWith({ behavior: 'instant', left: 0, top: 0 });
  expect(scrollTo).toHaveBeenCalledTimes(2);
});

test('disables browser scroll restoration while mounted', () => {
  const scrollTo = vi.spyOn(window, 'scrollTo').mockImplementation(() => undefined);
  const previousScrollRestoration = window.history.scrollRestoration;

  const { unmount } = render(<TestApp />);

  expect(window.history.scrollRestoration).toBe('manual');
  expect(scrollTo).toHaveBeenCalled();

  unmount();

  expect(window.history.scrollRestoration).toBe(previousScrollRestoration);
});
