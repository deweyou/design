import type { Meta, StoryObj } from '@storybook/react';
import { expect, within } from 'storybook/test';

import { MarkdownRender, markdownRenderSizeOptions } from '@deweyou-design/react/markdown-render';

const comprehensiveMarkdown = [
  '# Building a Markdown Renderer',
  '',
  'A production markdown surface needs to feel comfortable in long-form articles and compact LLM messages. It should support [external links](https://example.com/docs), **strong emphasis**, *emphasis*, ~~deleted text~~, and `inline code` without changing the surrounding rhythm.',
  '',
  '## Rendering Goals',
  '',
  '> The renderer should make common Markdown readable by default, while keeping extension points open for code blocks, custom links, and future rich preview surfaces.',
  '',
  'The component keeps Markdown parsing separate from MDX execution. Consumers can still replace specific nodes through `components`, but the default path stays safe for untrusted text.',
  '',
  '### Checklist',
  '',
  '- [x] Publish package',
  '- [x] Preserve paragraph semantics',
  '- [ ] Verify dense message layouts',
  '- [ ] Add optional Mermaid renderer later',
  '',
  '### Mixed Lists',
  '',
  '- Token-aligned typography',
  '- Stable `data-markdown-node` selectors',
  '  - Nested unordered item',
  '  - Another nested item',
  '',
  '1. Parse Markdown',
  '2. Merge default node components',
  '3. Render safe React output',
  '',
  '### Code',
  '',
  '```ts',
  'const renderMessage = (value: string) => {',
  '  return <MarkdownRender value={value} size="sm" />;',
  '};',
  '```',
  '',
  '```',
  'fenced code without a language still renders as a block',
  '```',
  '',
  '### Data Table',
  '',
  '| Area | Status |',
  '| --- | --- |',
  '| Markdown | Ready |',
  '| GFM task list | Read-only marker |',
  '| Future blocks | Custom renderer |',
  '',
  '![Decorative placeholder](https://placehold.co/960x320?text=Markdown+Render)',
  '',
  '---',
  '',
  'The same renderer can power a blog preview, a chat message, or a future editor preview layer without giving each surface a separate Markdown implementation.',
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
    value: comprehensiveMarkdown,
    size: 'md',
  },
};

export const Sizes: Story = {
  args: {
    value: comprehensiveMarkdown,
  },
  render: () => (
    <div style={{ display: 'grid', gap: '24px', maxWidth: '720px' }}>
      {markdownRenderSizeOptions.map((size) => (
        <MarkdownRender key={size} value={comprehensiveMarkdown} size={size} />
      ))}
    </div>
  ),
};

export const Interaction: Story = {
  args: {
    value: comprehensiveMarkdown,
  },
  render: () => (
    <div data-testid="markdown-story">
      <MarkdownRender value={comprehensiveMarkdown} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(
      canvas.getByRole('heading', { name: 'Building a Markdown Renderer' }),
    ).toBeInTheDocument();
    await expect(canvas.getByText(/production markdown surface/)).toBeVisible();
    await expect(canvas.getByRole('link', { name: 'external links' })).toHaveAttribute(
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
    await expect(story.querySelector('.hljs-keyword')).toBeInTheDocument();
    await expect(story.querySelector('[data-markdown-node="table"]')).toBeInTheDocument();
    await expect(story.querySelector('[data-markdown-node="img"]')).toBeInTheDocument();
  },
};
