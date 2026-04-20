// packages/react/src/tooltip/index.test.tsx
// @vitest-environment jsdom

import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vite-plus/test';

import { Tooltip } from './index.tsx';

afterEach(() => {
  cleanup();
});

describe('Tooltip', () => {
  it('renders the trigger element', () => {
    render(
      <Tooltip.Root>
        <Tooltip.Trigger>
          <button>Hover me</button>
        </Tooltip.Trigger>
        <Tooltip.Content>Tooltip text</Tooltip.Content>
      </Tooltip.Root>,
    );
    expect(screen.getByRole('button', { name: 'Hover me' })).toBeTruthy();
  });

  it('tooltip content is not visible by default', () => {
    render(
      <Tooltip.Root>
        <Tooltip.Trigger>
          <button>Hover me</button>
        </Tooltip.Trigger>
        <Tooltip.Content>Tooltip text</Tooltip.Content>
      </Tooltip.Root>,
    );
    expect(screen.queryByText('Tooltip text')).toBeNull();
  });

  it('renders Tooltip.Root, Tooltip.Trigger, Tooltip.Content as compound components', () => {
    expect(typeof Tooltip.Root).toBe('function');
    expect(typeof Tooltip.Trigger).toBe('function');
    expect(typeof Tooltip.Content).toBe('function');
  });
});
