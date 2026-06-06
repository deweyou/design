import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import {
  Editor,
  type EditorProps,
  markdownEditorAdapter,
  markdownShortcutPlugin,
  richTextPlugin,
  toolbarPlugin,
} from '@deweyou-design/editor';

const markdownAdapter = markdownEditorAdapter();
const basePlugins = [toolbarPlugin(), richTextPlugin(), markdownShortcutPlugin()];

type MarkdownEditorProps = Omit<EditorProps<string>, 'adapter' | 'plugins'>;

const MarkdownEditor = (props: MarkdownEditorProps) => (
  <Editor adapter={markdownAdapter} plugins={basePlugins} {...props} />
);

const meta = {
  title: 'Components/Editor',
  component: MarkdownEditor,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Editor provides Deweyou editor capabilities with adapters and plugins. This preview demonstrates a pluggable rich text toolbar with Markdown-oriented rich text input.',
      },
    },
    layout: 'padded',
  },
  args: {
    placeholder: 'Write a comment...',
  },
} satisfies Meta<typeof MarkdownEditor>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    defaultValue: 'Start with plain Markdown, then type shortcuts like #, -, or **bold**.',
  },
};

export const MarkdownShortcuts: Story = {
  args: {
    defaultValue: '# Heading\n\n- First item\n\n> Quote\n\n`inline code`',
  },
};

const ControlledExample = () => {
  const [value, setValue] = useState('Controlled markdown');

  return (
    <div style={{ display: 'grid', gap: '1rem' }}>
      <Editor
        adapter={markdownAdapter}
        plugins={basePlugins}
        value={value}
        onChange={({ value: nextValue }: { value: string }) => setValue(nextValue)}
      />
      <pre aria-label="Markdown output">{value}</pre>
    </div>
  );
};

export const Controlled: Story = {
  render: () => <ControlledExample />,
};

export const ReadOnly: Story = {
  args: {
    defaultValue: 'Read-only editor content',
    readOnly: true,
  },
};

export const Disabled: Story = {
  args: {
    defaultValue: 'Disabled editor content',
    disabled: true,
  },
};

export const Interaction: Story = {
  args: {
    placeholder: 'Write a comment...',
  },
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const canvas = within(canvasElement);
    const textbox = canvas.getByRole('textbox');

    await userEvent.click(textbox);
    await userEvent.type(textbox, '# Heading{enter}{enter}Hello **bold** text');

    await waitFor(() => {
      void expect(textbox).toHaveTextContent('Heading');
      void expect(textbox).toHaveTextContent('Hello bold text');
    });
  },
};
