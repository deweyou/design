import type { Meta, StoryObj } from '@storybook/react-vite';
import { Suspense, useState } from 'react';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import {
  ConfigProvider,
  configLocales,
  type ConfigLocale,
} from '@deweyou-design/react/config-provider';
import { NumberInput } from '@deweyou-design/react/number-input';
import { Pagination } from '@deweyou-design/react/pagination';

const LocaleDemo = () => {
  const [locale, setLocale] = useState<ConfigLocale>('en-US');

  return (
    <div style={{ display: 'grid', gap: 20, maxWidth: 560 }}>
      <div aria-label="Locale" role="group" style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {configLocales.map((option) => (
          <button
            aria-pressed={locale === option}
            key={option}
            onClick={() => setLocale(option)}
            type="button"
          >
            {option}
          </button>
        ))}
      </div>
      <Suspense fallback={<span>Loading locale…</span>}>
        <ConfigProvider locale={locale}>
          <Pagination count={50} pageSize={10} />
          <NumberInput defaultValue="2" label="Quantity" max={5} min={0} />
          <Pagination count={50} localeText={{ previous: 'Back' }} pageSize={10} />
        </ConfigProvider>
      </Suspense>
    </div>
  );
};

const meta = {
  title: 'Components/ConfigProvider',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'ConfigProvider supplies a typed locale code to descendant components. English is synchronous; zh-CN, zh-TW, ja-JP, and ko-KR dictionaries load lazily per component. Each component keeps its own localeText override.',
      },
    },
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => <LocaleDemo />,
};

export const Interaction: Story = {
  render: () => <LocaleDemo />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    void expect(canvas.getAllByText('Next').length).toBe(2);
    void expect(canvas.getByRole('button', { name: 'Increase value' })).toBeInTheDocument();

    await userEvent.click(canvas.getByRole('button', { name: 'zh-CN' }));
    await waitFor(() => {
      void expect(canvas.getAllByText('下一页').length).toBe(2);
      void expect(canvas.getByRole('button', { name: '增加数值' })).toBeInTheDocument();
      void expect(canvas.getByText('Back')).toBeInTheDocument();
    });

    await userEvent.click(canvas.getByRole('button', { name: 'ja-JP' }));
    await waitFor(() => {
      void expect(canvas.getAllByText('次へ').length).toBe(2);
      void expect(canvas.getByRole('button', { name: '値を増やす' })).toBeInTheDocument();
    });
  },
};
