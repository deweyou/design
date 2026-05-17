// @vitest-environment jsdom

import { render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vite-plus/test';
import { cleanup } from '@testing-library/react';

import { CheckboxMark } from './index.tsx';

afterEach(() => {
  cleanup();
});

describe('CheckboxMark', () => {
  it('renders the shared checked visual marker with an accessible state label when provided', () => {
    render(<CheckboxMark state="checked" stateLabel="Completed task" />);

    const marker = screen.getByText('Completed task').parentElement;

    expect(marker?.getAttribute('data-ui-checkbox-mark')).toBe('');
    expect(marker?.getAttribute('data-state')).toBe('checked');
  });

  it('can defer state ownership to an Ark checkbox control', () => {
    const { container } = render(<CheckboxMark aria-label="Visual checkbox mark" />);

    const marker = container.querySelector('[data-ui-checkbox-mark]');

    expect(marker?.hasAttribute('data-state')).toBe(false);
  });
});
