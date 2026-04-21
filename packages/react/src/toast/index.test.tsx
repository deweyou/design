// @vitest-environment jsdom

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { cleanup, render } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vite-plus/test';

import { Toaster, toast } from './index.tsx';

const stylesheet = readFileSync(resolve(import.meta.dirname, 'index.module.less'), 'utf8');

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

  it('warning variant uses semantic token instead of hardcoded color', () => {
    expect(stylesheet).toContain('.warning');
    expect(stylesheet).toContain('var(--ui-color-warning-bg)');
    expect(stylesheet).not.toContain('#d97706');
  });

  it('success variant uses palette token instead of hardcoded color', () => {
    expect(stylesheet).toContain('.success');
    expect(stylesheet).toContain('var(--ui-color-palette-green-600)');
    expect(stylesheet).not.toContain('#16a34a');
  });
});
