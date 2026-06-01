// @vitest-environment jsdom
import { render, screen, waitFor } from '@testing-library/react';
import { cleanup, fireEvent } from '@testing-library/react';
import { renderToStaticMarkup } from 'react-dom/server';
import { afterEach, beforeAll, describe, expect, it } from 'vite-plus/test';

import { MermaidRender, MindmapRender } from './index';

const flowchartDiagram = [
  'flowchart TD',
  '  A[Start] --> B{Ready?}',
  '  B -->|Yes| C[Render]',
  '  B -->|No| D[Fallback]',
].join('\n');

const mindmapDiagram = [
  'mindmap',
  '  root((Design System))',
  '    Components',
  '      MarkdownRender',
  '      MermaidRender',
  '    Tokens',
  '      Color',
  '      Typography',
].join('\n');

const pieDiagram = ['pie title Pets', '  "Dogs" : 42', '  "Cats" : 24'].join('\n');

describe('MermaidRender', () => {
  beforeAll(() => {
    class IntersectionObserverStub {
      observe() {}
      unobserve() {}
      disconnect() {}
    }

    class ResizeObserverStub {
      observe() {}
      unobserve() {}
      disconnect() {}
    }

    globalThis.IntersectionObserver =
      IntersectionObserverStub as unknown as typeof IntersectionObserver;
    globalThis.ResizeObserver = ResizeObserverStub as unknown as typeof ResizeObserver;

    if (typeof window !== 'undefined') {
      window.IntersectionObserver =
        IntersectionObserverStub as unknown as typeof IntersectionObserver;
      window.ResizeObserver = ResizeObserverStub as unknown as typeof ResizeObserver;
    }
  });

  afterEach(() => {
    cleanup();
  });

  it('routes beautiful-mermaid supported diagrams through the beautiful renderer', async () => {
    render(<MermaidRender value={flowchartDiagram} />);

    const diagram = await screen.findByTestId('mermaid-render');

    expect(diagram.getAttribute('data-mermaid-renderer')).toBe('beautiful');
    await waitFor(() => {
      expect(diagram.querySelector('svg')).not.toBeNull();
    });
  });

  it('routes mindmap diagrams through the Deweyou mindmap renderer', () => {
    const markup = renderToStaticMarkup(<MermaidRender value={mindmapDiagram} />);

    expect(markup).toContain('data-mermaid-renderer="mindmap"');
    expect(markup).toContain('data-testid="mermaid-scroll-area"');
    expect(markup).toContain('data-orientation="horizontal"');
    expect(markup).toContain('data-orientation="vertical"');
    expect(markup).toContain('data-mindmap-root="true"');
    expect(markup).toContain('data-mermaid-zoom-content="true"');
    expect(markup).toContain('Zoom in');
    expect(markup).toContain('Design System');
    expect(markup).toContain('MarkdownRender');
  });

  it('zooms rendered diagrams with accessible controls', () => {
    render(<MermaidRender value={mindmapDiagram} />);

    const diagram = screen.getByTestId('mermaid-render');
    const zoomContent = diagram.querySelector<HTMLElement>('[data-mermaid-zoom-content="true"]');

    expect(screen.getByText('100%')).not.toBeNull();
    expect(zoomContent?.style.getPropertyValue('--mermaid-zoom')).toBe('1');

    fireEvent.click(screen.getByRole('button', { name: 'Zoom in' }));

    expect(screen.getByText('110%')).not.toBeNull();
    expect(zoomContent?.style.getPropertyValue('--mermaid-zoom')).toBe('1.1');

    fireEvent.click(screen.getByRole('button', { name: 'Reset zoom' }));

    expect(screen.getByText('100%')).not.toBeNull();
    expect(zoomContent?.style.getPropertyValue('--mermaid-zoom')).toBe('1');
  });

  it('supports trackpad pinch zoom without hijacking normal wheel scrolling', () => {
    render(<MermaidRender value={mindmapDiagram} />);

    const diagram = screen.getByTestId('mermaid-render');
    const scroller = diagram.querySelector<HTMLElement>('[data-mermaid-scroll-area="true"]');
    const zoomContent = diagram.querySelector<HTMLElement>('[data-mermaid-zoom-content="true"]');

    expect(scroller).not.toBeNull();
    expect(zoomContent?.style.getPropertyValue('--mermaid-zoom')).toBe('1');

    fireEvent.wheel(scroller as HTMLElement, { deltaY: -100 });

    expect(screen.getByText('100%')).not.toBeNull();
    expect(zoomContent?.style.getPropertyValue('--mermaid-zoom')).toBe('1');

    fireEvent.wheel(scroller as HTMLElement, { ctrlKey: true, deltaY: -100 });

    expect(screen.getByText('110%')).not.toBeNull();
    expect(zoomContent?.style.getPropertyValue('--mermaid-zoom')).toBe('1.1');
  });

  it('pans the zoomed diagram by dragging the scroll area', () => {
    render(<MermaidRender value={mindmapDiagram} />);

    const diagram = screen.getByTestId('mermaid-render');
    const scroller = diagram.querySelector<HTMLElement>('[data-mermaid-scroll-area="true"]');

    expect(scroller).not.toBeNull();

    if (!scroller) {
      return;
    }

    scroller.setPointerCapture = () => undefined;
    scroller.releasePointerCapture = () => undefined;
    scroller.hasPointerCapture = () => true;
    scroller.scrollLeft = 40;
    scroller.scrollTop = 24;

    fireEvent.pointerDown(scroller, {
      button: 0,
      clientX: 100,
      clientY: 90,
      isPrimary: true,
      pointerId: 1,
    });
    fireEvent.pointerMove(scroller, {
      clientX: 70,
      clientY: 60,
      isPrimary: true,
      pointerId: 1,
    });

    expect(diagram.getAttribute('data-zoom-dragging')).toBe('true');
    expect(scroller.scrollLeft).toBe(70);
    expect(scroller.scrollTop).toBe(54);

    fireEvent.pointerUp(scroller, { isPrimary: true, pointerId: 1 });

    expect(diagram.getAttribute('data-zoom-dragging')).toBeNull();
  });

  it('falls back to native Mermaid for unsupported diagrams', () => {
    render(<MermaidRender value={pieDiagram} />);

    expect(screen.getByTestId('mermaid-render').getAttribute('data-mermaid-renderer')).toBe(
      'native',
    );
    expect(screen.getByText('Rendering diagram...')).not.toBeNull();
  });
});

describe('MindmapRender', () => {
  it('renders root, branch, leaf, and connector elements from indentation', () => {
    const markup = renderToStaticMarkup(<MindmapRender value={mindmapDiagram} />);

    expect(markup).toContain('data-mindmap-root="true"');
    expect(markup).toContain('data-mindmap-node-depth="1"');
    expect(markup).toContain('data-mindmap-node-depth="2"');
    expect(markup).toContain('data-mindmap-edge="true"');
    expect(markup).toContain('data-mindmap-node-toggle="true"');
    expect(markup).toContain('--mindmap-branch-color:var(--mindmap-branch-1)');
    expect(markup).toContain('Components');
    expect(markup).toContain('Typography');
  });

  it('temporarily collapses and expands mindmap branches without changing the source', () => {
    const { rerender } = render(<MindmapRender value={mindmapDiagram} />);
    const svg = screen.getByRole('img', { name: 'Mermaid mindmap diagram' });
    const expandedHeight = svg.getAttribute('height');
    const expandedWidth = svg.getAttribute('width');

    expect(screen.getByText('MarkdownRender')).not.toBeNull();

    fireEvent.click(screen.getByLabelText('Collapse Components mindmap branch'));

    expect(svg.getAttribute('height')).toBe(expandedHeight);
    expect(svg.getAttribute('width')).toBe(expandedWidth);
    expect(screen.queryByText('MarkdownRender')).toBeNull();
    expect(screen.queryByText('MermaidRender')).toBeNull();
    expect(screen.getByLabelText('Expand Components mindmap branch')).not.toBeNull();

    fireEvent.keyDown(screen.getByLabelText('Expand Components mindmap branch'), {
      key: 'Enter',
    });

    expect(screen.getByText('MarkdownRender')).not.toBeNull();

    fireEvent.click(screen.getByLabelText('Collapse Components mindmap branch'));
    rerender(<MindmapRender value={`${mindmapDiagram}\n      Button`} />);

    expect(screen.getByText('MarkdownRender')).not.toBeNull();
    expect(screen.getByText('Button')).not.toBeNull();
  });
});
