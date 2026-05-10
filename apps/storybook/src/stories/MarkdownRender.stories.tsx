import type { Meta, StoryObj } from '@storybook/react';
import { expect, within } from 'storybook/test';

import { MarkdownRender, markdownRenderSizeOptions } from '@deweyou-design/react/markdown-render';

const representativeMarkdown = [
  '# Release notes',
  '',
  'Paragraph content with [documentation](https://example.com/docs), **strong text**, and `inline code`.',
  '',
  '- [x] Publish package',
  '- [ ] Verify story',
  '',
  '```ts',
  'const status = "ready";',
  '```',
  '',
  '| Area | Status |',
  '| --- | --- |',
  '| Markdown | Ready |',
].join('\n');

const meta = {
  title: 'Components/MarkdownRender',
  component: MarkdownRender,
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: { type: 'select' },
      options: markdownRenderSizeOptions,
      table: { defaultValue: { summary: 'md' } },
    },
  },
} satisfies Meta<typeof MarkdownRender>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    value: representativeMarkdown,
    size: 'md',
  },
};

export const Sizes: Story = {
  args: {
    value: representativeMarkdown,
  },
  render: () => (
    <div style={{ display: 'grid', gap: '24px', maxWidth: '720px' }}>
      {markdownRenderSizeOptions.map((size) => (
        <MarkdownRender key={size} value={representativeMarkdown} size={size} />
      ))}
    </div>
  ),
};

export const Interaction: Story = {
  args: {
    value: representativeMarkdown,
  },
  render: () => (
    <div data-testid="markdown-story">
      <MarkdownRender value={representativeMarkdown} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByRole('heading', { name: 'Release notes' })).toBeInTheDocument();
    await expect(canvas.getByText(/Paragraph content/)).toBeVisible();
    await expect(canvas.getByRole('link', { name: 'documentation' })).toHaveAttribute(
      'target',
      '_blank',
    );

    const story = canvas.getByTestId('markdown-story');
    const root = story.querySelector('[data-markdown-root="true"]');
    await expect(root).toBeInTheDocument();
    await expect(root).toHaveAttribute('data-markdown-size', 'md');

    const paragraph = story.querySelector('[data-markdown-node="p"]');
    await expect(paragraph?.tagName.toLowerCase()).toBe('p');

    const checkedTask = story.querySelector(
      '[data-markdown-task-marker="true"][data-checked="true"]',
    );
    await expect(checkedTask).toBeInTheDocument();

    await expect(story.querySelector('[data-markdown-node="pre"]')).toBeInTheDocument();
    await expect(story.querySelector('[data-markdown-node="table"]')).toBeInTheDocument();
  },
};
