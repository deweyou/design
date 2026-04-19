// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vite-plus/test';

import { Carousel } from './index.tsx';

class IntersectionObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}

class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}

beforeEach(() => {
  globalThis.IntersectionObserver =
    IntersectionObserverMock as unknown as typeof IntersectionObserver;
  globalThis.ResizeObserver = ResizeObserverMock as unknown as typeof ResizeObserver;
});

afterEach(() => {
  cleanup();
});

describe('Carousel', () => {
  const renderCarousel = () =>
    render(
      <Carousel.Root defaultIndex={0}>
        <Carousel.PrevTrigger>
          <button>Previous</button>
        </Carousel.PrevTrigger>
        <Carousel.NextTrigger>
          <button>Next</button>
        </Carousel.NextTrigger>
        <Carousel.ItemGroup>
          <Carousel.Item index={0}>Slide 1</Carousel.Item>
          <Carousel.Item index={1}>Slide 2</Carousel.Item>
          <Carousel.Item index={2}>Slide 3</Carousel.Item>
        </Carousel.ItemGroup>
        <Carousel.IndicatorGroup>
          <Carousel.Indicator index={0} />
          <Carousel.Indicator index={1} />
          <Carousel.Indicator index={2} />
        </Carousel.IndicatorGroup>
      </Carousel.Root>,
    );

  it('renders carousel items', () => {
    renderCarousel();
    expect(screen.getByText('Slide 1')).toBeTruthy();
    expect(screen.getByText('Slide 2')).toBeTruthy();
    expect(screen.getByText('Slide 3')).toBeTruthy();
  });

  it('renders prev and next trigger buttons', () => {
    renderCarousel();
    expect(screen.getByRole('button', { name: 'Previous' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Next' })).toBeTruthy();
  });

  it('renders compound components as functions', () => {
    expect(typeof Carousel.Root).toBe('function');
    expect(typeof Carousel.ItemGroup).toBe('function');
    expect(typeof Carousel.Item).toBe('function');
    expect(typeof Carousel.PrevTrigger).toBe('function');
    expect(typeof Carousel.NextTrigger).toBe('function');
    expect(typeof Carousel.IndicatorGroup).toBe('function');
    expect(typeof Carousel.Indicator).toBe('function');
  });

  it('clicking next trigger does not throw', () => {
    renderCarousel();
    const nextBtn = screen.getByRole('button', { name: 'Next' });
    expect(() => fireEvent.click(nextBtn)).not.toThrow();
  });
});
