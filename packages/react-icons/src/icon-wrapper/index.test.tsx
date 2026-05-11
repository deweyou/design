// @vitest-environment jsdom
import { fireEvent, render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vite-plus/test';

import { createIcon } from './index';

const TestIcon = createIcon('TestIcon', {
  viewBox: '0 0 24 24',
  body: <path d="M4 12h16" />,
});

describe('createIcon', () => {
  it('renders without aria-label as decorative', () => {
    const { container } = render(<TestIcon />);
    const svg = container.querySelector('svg');

    expect(svg).toBeTruthy();
    expect(svg?.getAttribute('aria-hidden')).toBe('true');
    expect(svg?.getAttribute('role')).toBeNull();
  });

  it('renders with aria-label as a named image', () => {
    const { container } = render(<TestIcon aria-label="Search" />);
    const svg = container.querySelector('svg');

    expect(svg?.getAttribute('aria-hidden')).toBeNull();
    expect(svg?.getAttribute('aria-label')).toBe('Search');
    expect(svg?.getAttribute('role')).toBe('img');
  });

  it('allows explicit aria-hidden and role overrides', () => {
    const { container } = render(<TestIcon aria-hidden={false} role="presentation" />);
    const svg = container.querySelector('svg');

    expect(svg?.getAttribute('aria-hidden')).toBe('false');
    expect(svg?.getAttribute('role')).toBe('presentation');
  });

  it('maps named sizes and preserves custom size values', () => {
    const { container, rerender } = render(<TestIcon size="sm" />);
    const svg = container.querySelector('svg');

    expect(svg?.getAttribute('width')).toBe('16');
    expect(svg?.getAttribute('height')).toBe('16');

    rerender(<TestIcon size={28} />);
    expect(svg?.getAttribute('width')).toBe('28');
    expect(svg?.getAttribute('height')).toBe('28');

    rerender(<TestIcon size="2rem" />);
    expect(svg?.getAttribute('width')).toBe('2rem');
    expect(svg?.getAttribute('height')).toBe('2rem');
  });

  it('maps semantic colors and defaults to currentColor', () => {
    const { container, rerender } = render(<TestIcon />);
    const svg = container.querySelector('svg');

    expect(svg?.getAttribute('color')).toBe('currentColor');

    rerender(<TestIcon color="primary" />);
    expect(svg?.getAttribute('color')).toBe('var(--ui-color-brand-text)');

    rerender(<TestIcon color="danger" />);
    expect(svg?.getAttribute('color')).toBe('var(--ui-color-danger-text)');
  });

  it('passes through id, className, data attributes, style, and events', () => {
    const handleClick = vi.fn();
    const { container } = render(
      <TestIcon
        className="sample"
        data-testid="icon"
        id="sample-icon"
        style={{ marginInlineStart: 4 }}
        onClick={handleClick}
      />,
    );

    const svg = container.querySelector('svg')!;
    expect(svg.id).toBe('sample-icon');
    expect(svg.classList.contains('sample')).toBe(true);
    expect(svg.getAttribute('data-testid')).toBe('icon');
    expect(svg.style.marginInlineStart).toBe('4px');

    fireEvent.click(svg);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
