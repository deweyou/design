import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';

import { CodeBlock } from '@deweyou-design/react/code-block';

const sampleCode = [
  "import { CodeBlock } from '@deweyou-design/react/code-block';",
  '',
  'export const Example = () => (',
  '  <CodeBlock language="tsx">',
  '    {`const value = "Deweyou";`}',
  '  </CodeBlock>',
  ');',
].join('\n');

const meta = {
  title: 'Components/CodeBlock',
  component: CodeBlock,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'CodeBlock renders syntax-highlighted code with optional language labeling, horizontal scrolling, and an accessible copy action.',
      },
    },
    layout: 'padded',
  },
  argTypes: {
    copy: {
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } },
    },
    language: {
      control: { type: 'select' },
      options: ['tsx', 'ts', 'jsx', 'js', 'json', 'css', 'html', 'bash', 'markdown'],
      table: { defaultValue: { summary: 'undefined' } },
    },
    onCopy: {
      table: { type: { summary: '(details: CodeBlockCopyDetails) => void' } },
    },
    size: {
      control: { type: 'select' },
      options: ['sm', 'md'],
      table: { defaultValue: { summary: 'md' } },
    },
  },
} satisfies Meta<typeof CodeBlock>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: sampleCode,
    copy: true,
    language: 'tsx',
  },
  render: (args) => (
    <div style={{ maxWidth: '720px' }}>
      <CodeBlock {...args} />
    </div>
  ),
};

export const Plain: Story = {
  args: {
    children: 'plain text without a language label',
  },
};

export const Interaction: Story = {
  args: {
    children: sampleCode,
    copy: true,
    language: 'tsx',
  },
  render: (args) => (
    <div data-testid="code-block-story" style={{ maxWidth: '720px' }}>
      <CodeBlock {...args} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const story = canvas.getByTestId('code-block-story');

    await expect(canvas.getByText('tsx')).toBeInTheDocument();
    const copyButton = canvas.getByRole('button', { name: 'Copy code' });

    await expect(copyButton).toBeInTheDocument();
    await expect(story.querySelector('[data-ui-code-block="true"]')).toBeInTheDocument();
    await expect(story.querySelector('[data-code-block-actions="true"]')).toBeInTheDocument();
    await expect(story.querySelector('.hljs-keyword')).toBeInTheDocument();
    await expect(story.querySelector('[data-part="viewport"]')).toBeInTheDocument();
  },
};
