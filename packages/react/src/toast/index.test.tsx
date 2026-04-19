// @vitest-environment jsdom

import { cleanup, render } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vite-plus/test';

import { Toaster, toast } from './index.tsx';

afterEach(() => {
  cleanup();
});

describe('Toaster', () => {
  it('renders without crashing', () => {
    render(<Toaster />);
    expect(document.body).toBeTruthy();
  });

  it('renders a valid React component', () => {
    const { container } = render(<Toaster />);
    expect(container).toBeTruthy();
  });
});

describe('toast', () => {
  it('toast.create is a function', () => {
    expect(typeof toast.create).toBe('function');
  });
});
