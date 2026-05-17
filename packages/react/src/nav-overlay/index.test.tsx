// @vitest-environment jsdom

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vite-plus/test';

import { NavOverlay } from './index.tsx';

const stylesheet = readFileSync(resolve(import.meta.dirname, './index.module.less'), 'utf8');

afterEach(() => {
  cleanup();
});

describe('NavOverlay', () => {
  it('renders the trigger element', () => {
    render(
      <NavOverlay.Root>
        <NavOverlay.Trigger>
          <button>Open nav</button>
        </NavOverlay.Trigger>
        <NavOverlay.Content>Navigation content</NavOverlay.Content>
      </NavOverlay.Root>,
    );
    expect(screen.getByRole('button', { name: 'Open nav' })).toBeTruthy();
  });

  it('content is not visible by default (lazyMount + unmountOnExit)', () => {
    render(
      <NavOverlay.Root>
        <NavOverlay.Trigger>
          <button>Open nav</button>
        </NavOverlay.Trigger>
        <NavOverlay.Content>Navigation content</NavOverlay.Content>
      </NavOverlay.Root>,
    );
    expect(screen.queryByText('Navigation content')).toBeNull();
  });

  it('exports Root, Trigger, Content, CloseButton as compound components', () => {
    expect(typeof NavOverlay.Root).toBe('function');
    expect(typeof NavOverlay.Trigger).toBe('function');
    expect(typeof NavOverlay.Content).toBe('function');
    expect(typeof NavOverlay.CloseButton).toBe('function');
  });

  it('accepts controlled open/onOpenChange props without error', () => {
    const onOpenChange = () => {};
    expect(() =>
      render(
        <NavOverlay.Root open={false} onOpenChange={onOpenChange}>
          <NavOverlay.Trigger>
            <button>Open</button>
          </NavOverlay.Trigger>
          <NavOverlay.Content>Content</NavOverlay.Content>
        </NavOverlay.Root>,
      ),
    ).not.toThrow();
  });

  it('keeps the fullscreen panel scroll-contained with room for the close button', () => {
    expect(stylesheet).toContain('overscroll-behavior: contain;');
    expect(stylesheet).toContain(
      'padding-block-end: calc(var(--ui-space-xl) + 72px + env(safe-area-inset-bottom));',
    );
    expect(stylesheet).toContain(
      'scroll-padding-block-end: calc(var(--ui-space-xl) + 72px + env(safe-area-inset-bottom));',
    );
    expect(stylesheet).toContain('position: fixed;');
    expect(stylesheet).toContain('z-index: var(--ui-z-dialog);');
    expect(stylesheet).toContain('bottom: max(var(--ui-space-lg), env(safe-area-inset-bottom));');
    expect(stylesheet).toContain('transform: translateX(-50%);');
  });
});
