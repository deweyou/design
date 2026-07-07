// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, test, vi } from 'vite-plus/test';

import { expect } from '../test-setup';

import { MermaidRenderPage } from './mermaid-render';

vi.mock('@deweyou-design/react-icons', () => {
  const icons = {
    EditIcon: () => <span aria-hidden data-testid="mock-edit-icon" />,
    EyeIcon: () => <span aria-hidden data-testid="mock-eye-icon" />,
    RefreshIcon: () => <span aria-hidden data-testid="mock-refresh-icon" />,
    ZoomInIcon: () => <span aria-hidden data-testid="mock-zoom-in-icon" />,
    ZoomOutIcon: () => <span aria-hidden data-testid="mock-zoom-out-icon" />,
  };

  return new Proxy(icons, {
    get: (target, property) => {
      if (property === '__esModule') {
        return true;
      }

      if (property === 'then' || typeof property !== 'string') {
        return undefined;
      }

      return (
        Reflect.get(target, property) ??
        (property.endsWith('Icon')
          ? () => <span aria-hidden data-testid={`mock-${property}`} />
          : undefined)
      );
    },
    getOwnPropertyDescriptor: (target, property) => {
      const descriptor = Reflect.getOwnPropertyDescriptor(target, property);
      if (descriptor || typeof property !== 'string' || !property.endsWith('Icon')) {
        return descriptor;
      }

      return {
        configurable: true,
        enumerable: false,
        value: () => <span aria-hidden data-testid={`mock-${property}`} />,
      };
    },
    has: (target, property) =>
      Reflect.has(target, property) || (typeof property === 'string' && property.endsWith('Icon')),
  });
});

afterEach(() => {
  cleanup();
});

test('renders the default mermaid sample in the live preview', () => {
  render(<MermaidRenderPage />);

  const preview = screen.getByRole('region', { name: 'Mermaid preview' });

  expect(screen.getByRole('heading', { name: 'Mermaid Render' })).toBeInTheDocument();
  expect(within(preview).getByTestId('mermaid-render')).toHaveAttribute(
    'data-mermaid-renderer',
    'mindmap',
  );
  expect(within(preview).getByText('MermaidRender')).toBeInTheDocument();
});

test('updates the preview as the user edits mermaid source', () => {
  render(<MermaidRenderPage />);

  fireEvent.change(screen.getByLabelText('Mermaid source'), {
    target: {
      value: ['mindmap', '  root((Custom diagram))', '    Live preview'].join('\n'),
    },
  });

  const preview = screen.getByRole('region', { name: 'Mermaid preview' });

  expect(within(preview).getByText('Custom diagram')).toBeInTheDocument();
  expect(within(preview).getByText('Live preview')).toBeInTheDocument();
  expect(within(preview).queryByText('MermaidRender')).not.toBeInTheDocument();
});

test('mobile controls start in preview mode and toggle to editing', () => {
  render(<MermaidRenderPage />);

  expect(screen.getByRole('button', { name: 'Edit mermaid source' })).toBeInTheDocument();
  expect(screen.getByRole('region', { name: 'Mermaid preview' })).toHaveAttribute(
    'data-mobile-active',
    'true',
  );
  expect(screen.getByRole('region', { name: 'Mermaid editor' })).toHaveAttribute(
    'data-mobile-active',
    'false',
  );

  fireEvent.click(screen.getByRole('button', { name: 'Edit mermaid source' }));

  expect(screen.getByRole('button', { name: 'Preview rendered mermaid' })).toBeInTheDocument();
  expect(screen.getByRole('region', { name: 'Mermaid preview' })).toHaveAttribute(
    'data-mobile-active',
    'false',
  );
  expect(screen.getByRole('region', { name: 'Mermaid editor' })).toHaveAttribute(
    'data-mobile-active',
    'true',
  );
});
