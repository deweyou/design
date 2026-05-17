// @vitest-environment jsdom

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vite-plus/test';

import { Nav } from './index.tsx';

const stylesheet = readFileSync(resolve(import.meta.dirname, './index.module.less'), 'utf8');

beforeEach(() => {
  if (!window.ResizeObserver) {
    window.ResizeObserver = class ResizeObserver {
      observe() {}
      unobserve() {}
      disconnect() {}
    };
  }
});

afterEach(() => {
  cleanup();
});

describe('Nav.Responsive', () => {
  it('renders nav links from items and marks the active value', () => {
    render(
      <Nav.Responsive
        aria-label="Primary"
        value="components"
        items={[
          { href: '/', label: 'Overview', value: 'overview' },
          { href: '/components', label: 'Components', value: 'components' },
        ]}
      />,
    );

    expect(screen.getByRole('navigation', { name: 'Primary' })).toBeTruthy();
    expect(screen.getByRole('link', { name: 'Overview' }).getAttribute('href')).toBe('/');
    expect(screen.getByRole('link', { name: 'Components' }).getAttribute('aria-current')).toBe(
      'page',
    );
    expect(screen.getByRole('button', { name: 'Open navigation' })).toBeTruthy();
  });

  it('applies safe external link defaults', () => {
    render(
      <Nav.Responsive
        items={[{ external: true, href: 'https://example.com', label: 'Docs', value: 'docs' }]}
      />,
    );

    const link = screen.getByRole('link', { name: 'Docs' });
    expect(link.getAttribute('target')).toBe('_blank');
    expect(link.getAttribute('rel')).toBe('noopener noreferrer');
  });

  it('opens the collapsed overlay and calls item and root selection handlers', async () => {
    const onSelect = vi.fn();
    const onItemSelect = vi.fn(({ event }) => event?.preventDefault());
    const user = userEvent.setup();

    render(
      <Nav.Responsive
        onSelect={onSelect}
        items={[
          { href: '/', label: 'Overview', value: 'overview' },
          {
            href: '/components',
            label: 'Components',
            onSelect: onItemSelect,
            value: 'components',
          },
        ]}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Open navigation' }));
    const dialog = await waitFor(() => screen.getByRole('dialog'));
    await user.click(within(dialog).getByRole('link', { name: 'Components' }));

    expect(onItemSelect).toHaveBeenCalledWith(expect.objectContaining({ value: 'components' }));
    expect(onSelect).toHaveBeenCalledWith(expect.objectContaining({ value: 'components' }));
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).toBeNull();
    });
  });

  it('does not call selection handlers for disabled overlay items', async () => {
    const onSelect = vi.fn();
    render(
      <Nav.Responsive
        onSelect={onSelect}
        items={[{ disabled: true, label: 'Disabled', value: 'disabled' }]}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Open navigation' }));
    const dialog = await waitFor(() => screen.getByRole('dialog'));
    fireEvent.click(within(dialog).getByText('Disabled'));

    expect(onSelect).not.toHaveBeenCalled();
  });

  it('renders external href items as safe links in the collapsed overlay', async () => {
    const user = userEvent.setup();

    render(
      <Nav.Responsive
        items={[{ external: true, href: 'https://example.com', label: 'Docs', value: 'docs' }]}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Open navigation' }));
    const dialog = await waitFor(() => screen.getByRole('dialog'));
    const link = within(dialog).getByRole('link', { name: 'Docs' });

    expect(link.getAttribute('href')).toBe('https://example.com');
    expect(link.getAttribute('target')).toBe('_blank');
    expect(link.getAttribute('rel')).toBe('noopener noreferrer');
  });

  it('allows consumers to replace the collapsed trigger control', async () => {
    const user = userEvent.setup();

    render(
      <Nav.Responsive
        collapseTrigger={
          <button className="custom-trigger" type="button">
            Custom sections
          </button>
        }
        items={[{ href: '/', label: 'Overview', value: 'overview' }]}
      />,
    );

    const trigger = screen.getByRole('button', { name: 'Custom sections' });
    expect(trigger.className).toContain('custom-trigger');

    await user.click(trigger);
    const dialog = await waitFor(() => screen.getByRole('dialog'));

    expect(within(dialog).getByRole('link', { name: 'Overview' })).toBeTruthy();
  });

  it('moves overflowing desktop items into a More menu', async () => {
    const clientWidthSpy = vi
      .spyOn(HTMLElement.prototype, 'clientWidth', 'get')
      .mockReturnValue(220);
    const rectSpy = vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue({
      bottom: 0,
      height: 44,
      left: 0,
      right: 80,
      toJSON: () => ({}),
      top: 0,
      width: 80,
      x: 0,
      y: 0,
    });

    render(
      <Nav.Responsive
        aria-label="Overflowing"
        items={[
          { href: '#one', label: 'Section 1', value: 'section-1' },
          { href: '#two', label: 'Section 2', value: 'section-2' },
          { href: '#three', label: 'Section 3', value: 'section-3' },
          { href: '#four', label: 'Section 4', value: 'section-4' },
        ]}
      />,
    );

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'More navigation items' })).toBeTruthy();
    });

    expect(screen.getByRole('navigation', { name: 'Overflowing' })).toBeTruthy();

    clientWidthSpy.mockRestore();
    rectSpy.mockRestore();
  });

  it('keeps collapsed overlay content clear of the persistent close button', () => {
    expect(stylesheet).toContain('padding-block-end: calc(var(--ui-space-xl) + 72px);');
    expect(stylesheet).toContain('scroll-padding-block-end: calc(var(--ui-space-xl) + 72px);');
    expect(stylesheet).toContain('inline-size: var(--ui-touch-target-min);');
    expect(stylesheet).toContain('block-size: var(--ui-touch-target-min);');
  });

  it('collapses long horizontal navigation lists into a More menu without wrapping labels', () => {
    expect(stylesheet).toContain('inline-size: 100%;');
    expect(stylesheet).toContain('max-inline-size: 100%;');
    expect(stylesheet).toContain('flex: 0 1 auto;');
    expect(stylesheet).toContain('overflow-x: hidden;');
    expect(stylesheet).toContain('.responsiveMeasureList');
    expect(stylesheet).toContain('.moreTrigger');
    expect(stylesheet).toContain('white-space: nowrap;');
    expect(stylesheet).toContain('text-overflow: ellipsis;');
  });
});
