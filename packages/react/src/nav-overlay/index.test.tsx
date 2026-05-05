// @vitest-environment jsdom

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vite-plus/test';

import { NavOverlay } from './index.tsx';

const stylesheet = readFileSync(resolve(import.meta.dirname, 'index.module.less'), 'utf8');

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
});

describe('NavOverlay stylesheet', () => {
  it('uses position fixed and inset 0 for fullscreen', () => {
    expect(stylesheet).toContain('position: fixed');
    expect(stylesheet).toContain('inset: 0');
  });

  it('uses --ui-color-surface as background', () => {
    expect(stylesheet).toContain('--ui-color-surface');
  });

  it('uses --ui-z-dialog for z-index', () => {
    expect(stylesheet).toContain('--ui-z-dialog');
  });

  it('defines open/closed animations', () => {
    expect(stylesheet).toContain("data-state='open'");
    expect(stylesheet).toContain("data-state='closed'");
  });

  it('responds to prefers-reduced-motion', () => {
    expect(stylesheet).toContain('prefers-reduced-motion');
  });

  it('does not use raw palette tokens', () => {
    expect(stylesheet).not.toContain('--ui-color-palette-');
  });
});
