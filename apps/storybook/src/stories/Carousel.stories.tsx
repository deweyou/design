import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import { Carousel } from '@deweyou-design/react/carousel';

const meta: Meta = {
  title: 'Components/Carousel',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Carousel displays a sequence of slides with navigation controls. Import from `@deweyou-design/react/carousel`.',
      },
    },
  },
};

export default meta;

const slideColors = ['#6366f1', '#14b8a6', '#f59e0b', '#ef4444'];
const slideLabels = ['Slide 1', 'Slide 2', 'Slide 3', 'Slide 4'];

const NavButton = ({ children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
  <button
    style={{
      alignItems: 'center',
      background: 'color-mix(in srgb, var(--ui-color-surface) 80%, transparent)',
      border: '1px solid var(--ui-color-border)',
      borderRadius: '50%',
      color: 'var(--ui-color-text)',
      cursor: 'pointer',
      display: 'flex',
      fontSize: '1rem',
      height: '32px',
      justifyContent: 'center',
      width: '32px',
    }}
    type="button"
    {...props}
  >
    {children}
  </button>
);

export const Default: StoryObj = {
  render: () => (
    <div style={{ maxWidth: '480px', position: 'relative' }}>
      <Carousel.Root defaultIndex={0} loop slideCount={slideColors.length}>
        <Carousel.PrevTrigger>
          <NavButton aria-label="Previous slide">‹</NavButton>
        </Carousel.PrevTrigger>
        <Carousel.NextTrigger>
          <NavButton aria-label="Next slide">›</NavButton>
        </Carousel.NextTrigger>
        <Carousel.ItemGroup>
          {slideColors.map((color, i) => (
            <Carousel.Item key={i} index={i}>
              <div
                style={{
                  alignItems: 'center',
                  background: color,
                  borderRadius: 'var(--ui-radius-float)',
                  color: '#fff',
                  display: 'flex',
                  fontSize: '1.5rem',
                  fontWeight: 600,
                  height: '240px',
                  justifyContent: 'center',
                  width: '100%',
                }}
              >
                {slideLabels[i]}
              </div>
            </Carousel.Item>
          ))}
        </Carousel.ItemGroup>
        <Carousel.IndicatorGroup>
          {slideColors.map((_, i) => (
            <Carousel.Indicator key={i} index={i} />
          ))}
        </Carousel.IndicatorGroup>
      </Carousel.Root>
    </div>
  ),
};

export const Variants: StoryObj = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      <div>
        <p
          style={{
            color: 'var(--ui-color-text)',
            fontSize: '0.75rem',
            marginBottom: '8px',
            opacity: 0.6,
          }}
        >
          With loop
        </p>
        <div style={{ maxWidth: '480px', position: 'relative' }}>
          <Carousel.Root defaultIndex={0} loop slideCount={3}>
            <Carousel.PrevTrigger>
              <NavButton aria-label="Previous slide">‹</NavButton>
            </Carousel.PrevTrigger>
            <Carousel.NextTrigger>
              <NavButton aria-label="Next slide">›</NavButton>
            </Carousel.NextTrigger>
            <Carousel.ItemGroup>
              {slideColors.slice(0, 3).map((color, i) => (
                <Carousel.Item key={i} index={i}>
                  <div
                    style={{
                      alignItems: 'center',
                      background: color,
                      borderRadius: 'var(--ui-radius-float)',
                      color: '#fff',
                      display: 'flex',
                      fontSize: '1.25rem',
                      fontWeight: 600,
                      height: '180px',
                      justifyContent: 'center',
                      width: '100%',
                    }}
                  >
                    {slideLabels[i]}
                  </div>
                </Carousel.Item>
              ))}
            </Carousel.ItemGroup>
            <Carousel.IndicatorGroup>
              {[0, 1, 2].map((i) => (
                <Carousel.Indicator key={i} index={i} />
              ))}
            </Carousel.IndicatorGroup>
          </Carousel.Root>
        </div>
      </div>
    </div>
  ),
};

const ControlledCarousel = () => {
  const [index, setIndex] = useState(0);
  return (
    <div>
      <p
        style={{
          color: 'var(--ui-color-text)',
          fontSize: '0.75rem',
          marginBottom: '8px',
          opacity: 0.6,
        }}
      >
        Controlled — current index: {index}
      </p>
      <div style={{ maxWidth: '480px', position: 'relative' }}>
        <Carousel.Root index={index} onIndexChange={setIndex} loop slideCount={slideColors.length}>
          <Carousel.PrevTrigger>
            <NavButton aria-label="Previous slide">‹</NavButton>
          </Carousel.PrevTrigger>
          <Carousel.NextTrigger>
            <NavButton aria-label="Next slide">›</NavButton>
          </Carousel.NextTrigger>
          <Carousel.ItemGroup>
            {slideColors.map((color, i) => (
              <Carousel.Item key={i} index={i}>
                <div
                  style={{
                    alignItems: 'center',
                    background: color,
                    borderRadius: 'var(--ui-radius-float)',
                    color: '#fff',
                    display: 'flex',
                    fontSize: '1.25rem',
                    fontWeight: 600,
                    height: '200px',
                    justifyContent: 'center',
                    width: '100%',
                  }}
                >
                  {slideLabels[i]}
                </div>
              </Carousel.Item>
            ))}
          </Carousel.ItemGroup>
          <Carousel.IndicatorGroup>
            {slideColors.map((_, i) => (
              <Carousel.Indicator key={i} index={i} />
            ))}
          </Carousel.IndicatorGroup>
        </Carousel.Root>
      </div>
    </div>
  );
};

export const States: StoryObj = { render: () => <ControlledCarousel /> };

export const Interaction: StoryObj = {
  name: 'Interaction',
  render: () => (
    <div style={{ maxWidth: '480px', position: 'relative' }}>
      <Carousel.Root defaultIndex={0} slideCount={2}>
        <Carousel.PrevTrigger>
          <NavButton aria-label="Previous slide">‹</NavButton>
        </Carousel.PrevTrigger>
        <Carousel.NextTrigger>
          <NavButton aria-label="Next slide" data-testid="next-trigger">
            ›
          </NavButton>
        </Carousel.NextTrigger>
        <Carousel.ItemGroup>
          <Carousel.Item index={0}>
            <div
              data-testid="slide-0"
              style={{
                background: '#6366f1',
                borderRadius: 'var(--ui-radius-float)',
                color: '#fff',
                height: '200px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.25rem',
                fontWeight: 600,
                width: '100%',
              }}
            >
              Slide 1
            </div>
          </Carousel.Item>
          <Carousel.Item index={1}>
            <div
              data-testid="slide-1"
              style={{
                background: '#14b8a6',
                borderRadius: 'var(--ui-radius-float)',
                color: '#fff',
                height: '200px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.25rem',
                fontWeight: 600,
                width: '100%',
              }}
            >
              Slide 2
            </div>
          </Carousel.Item>
        </Carousel.ItemGroup>
        <Carousel.IndicatorGroup>
          <Carousel.Indicator index={0} data-testid="indicator-0" />
          <Carousel.Indicator index={1} data-testid="indicator-1" />
        </Carousel.IndicatorGroup>
      </Carousel.Root>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const indicator0 = canvas.getByTestId('indicator-0');
    const indicator1 = canvas.getByTestId('indicator-1');
    expect(indicator0).toHaveAttribute('data-current');
    expect(indicator1).not.toHaveAttribute('data-current');

    const nextBtn = canvas.getByTestId('next-trigger');
    await userEvent.click(nextBtn);

    await waitFor(() => {
      expect(indicator1).toHaveAttribute('data-current');
      expect(indicator0).not.toHaveAttribute('data-current');
    });
  },
};
