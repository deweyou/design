// @vitest-environment jsdom
import { render } from '@testing-library/react';
import { IconHome } from '@tabler/icons-react';
import { describe, expect, it } from 'vite-plus/test';

import { createTablerIcon } from './index';

const HomeIcon = createTablerIcon(IconHome);

describe('createTablerIcon', () => {
  it('renders without aria-label as aria-hidden', () => {
    const { container } = render(<HomeIcon />);
    const svg = container.querySelector('svg');

    expect(svg).toBeTruthy();
    expect(svg?.getAttribute('aria-hidden')).toBe('true');
    expect(svg?.getAttribute('role')).toBeNull();
  });

  it('renders with aria-label as role=img', () => {
    const { container } = render(<HomeIcon aria-label="首页" />);
    const svg = container.querySelector('svg');

    expect(svg?.getAttribute('aria-hidden')).toBeNull();
    expect(svg?.getAttribute('aria-label')).toBe('首页');
    expect(svg?.getAttribute('role')).toBe('img');
  });

  it('applies square stroke caps', () => {
    const { container } = render(<HomeIcon />);
    const svg = container.querySelector('svg');

    expect(svg?.getAttribute('stroke-linecap')).toBe('square');
    expect(svg?.getAttribute('stroke-linejoin')).toBe('miter');
  });

  it('forwards size prop', () => {
    const { container } = render(<HomeIcon size={24} />);
    const svg = container.querySelector('svg');

    expect(svg?.getAttribute('width')).toBe('24');
    expect(svg?.getAttribute('height')).toBe('24');
  });
});
