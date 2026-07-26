import { useMemo, useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import {
  codePlugin,
  Editor,
  formatJsonPreservingDuplicateKeys,
  type EditorPlugin,
  type EditorProps,
  floatingToolbarPlugin,
  frontmatterPlugin,
  headingPlugin,
  historyPlugin,
  keyboardShortcutPlugin,
  linkPlugin,
  listPlugin,
  markdownEditorAdapter,
  markdownShortcutPlugin,
  pastePlugin,
  quotePlugin,
  tablePlugin,
  textFormatPlugin,
  toolbarPlugin,
} from '@deweyou-design/react';

const markdownAdapter = markdownEditorAdapter();

const frontmatterPlugins = [
  frontmatterPlugin({
    propertyTypes: { published: 'date' },
  }),
];

const textPlugins = [
  historyPlugin(),
  textFormatPlugin(),
  headingPlugin({ levels: [1, 2, 3] }),
  listPlugin(),
  quotePlugin(),
];
const codePlugins = [
  codePlugin({
    format: { formatters: { json: formatJsonPreservingDuplicateKeys } },
    wrap: true,
  }),
];
const tablePlugins = [tablePlugin()];
const linkPlugins = [linkPlugin()];
const fullPlugins = [
  ...frontmatterPlugins,
  ...textPlugins,
  ...linkPlugins,
  ...codePlugins,
  ...tablePlugins,
  toolbarPlugin(),
  floatingToolbarPlugin(),
  markdownShortcutPlugin(),
  keyboardShortcutPlugin(),
  pastePlugin(),
];

type MarkdownEditorProps = Omit<EditorProps<string>, 'adapter' | 'plugins'>;

const MarkdownEditor = (props: MarkdownEditorProps) => (
  <Editor adapter={markdownAdapter} plugins={fullPlugins} {...props} />
);

type PluginToggle = 'code' | 'floating' | 'link' | 'markdown' | 'table' | 'toolbar';

const pluginToggleOptions: Array<{ label: string; value: PluginToggle }> = [
  { label: 'Toolbar', value: 'toolbar' },
  { label: 'Floating', value: 'floating' },
  { label: 'Markdown', value: 'markdown' },
  { label: 'Link', value: 'link' },
  { label: 'Code', value: 'code' },
  { label: 'Table', value: 'table' },
];

const createPlugins = (enabled: Record<PluginToggle, boolean>): EditorPlugin[] => [
  ...frontmatterPlugins,
  ...textPlugins,
  ...(enabled.link ? linkPlugins : []),
  ...(enabled.code ? codePlugins : []),
  ...(enabled.table ? tablePlugins : []),
  ...(enabled.toolbar ? [toolbarPlugin()] : []),
  ...(enabled.floating ? [floatingToolbarPlugin()] : []),
  ...(enabled.markdown ? [markdownShortcutPlugin()] : []),
  keyboardShortcutPlugin(),
  pastePlugin(),
];

const PluginPlaygroundExample = () => {
  const [enabled, setEnabled] = useState<Record<PluginToggle, boolean>>({
    code: true,
    floating: true,
    link: true,
    markdown: true,
    table: true,
    toolbar: true,
  });
  const plugins = useMemo(() => createPlugins(enabled), [enabled]);

  return (
    <div style={{ display: 'grid', gap: '0.75rem' }}>
      <div
        aria-label="Editor plugins"
        role="group"
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '0.75rem',
          font: '600 0.78rem / 1.4 var(--ui-font-control)',
        }}
      >
        {pluginToggleOptions.map((option) => (
          <label
            key={option.value}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
          >
            <input
              checked={enabled[option.value]}
              onChange={(event) =>
                setEnabled((current) => ({
                  ...current,
                  [option.value]: event.currentTarget.checked,
                }))
              }
              type="checkbox"
            />
            {option.label}
          </label>
        ))}
      </div>
      <Editor
        adapter={markdownAdapter}
        defaultValue={[
          '---',
          'title: Plugin playground',
          'draft: false',
          'tags: [markdown, editor]',
          'published: 2026-07-22',
          '---',
          '',
          '# Plugin playground',
          '',
          'Toggle plugin groups and keep editing the same content.',
          '',
          '```json',
          '{"active":true}',
          '```',
        ].join('\n')}
        plugins={plugins}
        placeholder="Write a note..."
      />
    </div>
  );
};

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
    defaultValue: 'Start with plain Markdown, then type with the full editor plugin set.',
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
        plugins={fullPlugins}
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

export const PluginPlayground: Story = {
  render: () => <PluginPlaygroundExample />,
};

export const Interaction: Story = {
  render: () => <PluginPlaygroundExample />,
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const canvas = within(canvasElement);
    const codeToggle = canvas.getByRole('checkbox', { name: 'Code' });
    const textbox = canvas.getByRole('textbox', { name: 'Write a note...' });
    const titleInput = canvas.getByRole('textbox', { name: 'title' });
    const getCodeBlock = () => {
      const codeBlock = canvasElement.querySelector('code[data-language="json"]');

      if (!(codeBlock instanceof HTMLElement)) {
        throw new Error('Expected the playground code block to be rendered.');
      }

      return codeBlock;
    };

    await expect(canvas.getByRole('toolbar', { name: 'Editor formatting toolbar' })).toBeTruthy();
    await expect(canvas.getByRole('checkbox', { name: 'draft' })).toBeTruthy();
    await userEvent.clear(titleInput);
    await userEvent.type(titleInput, 'Updated playground');
    await expect(titleInput).toHaveValue('Updated playground');
    await expect(canvas.queryByRole('toolbar', { name: 'Editor block toolbar' })).toBeNull();

    await userEvent.click(getCodeBlock());

    await waitFor(() => {
      const codeToolbar = canvas.getByRole('toolbar', { name: 'Code block actions' });

      void expect(within(codeToolbar).getByRole('button', { name: 'Code language' })).toBeTruthy();
    });

    await userEvent.click(codeToggle);

    await waitFor(() => {
      void expect(canvas.queryByRole('button', { name: 'Code language' })).toBeNull();
    });

    await userEvent.click(codeToggle);
    await userEvent.click(getCodeBlock());

    await waitFor(() => {
      const codeToolbar = canvas.getByRole('toolbar', { name: 'Code block actions' });

      void expect(within(codeToolbar).getByRole('button', { name: 'Code language' })).toBeTruthy();
    });

    await userEvent.click(textbox);
    await userEvent.type(textbox, '{enter}Storybook e2e text');

    await waitFor(() => {
      void expect(textbox).toHaveTextContent('Storybook e2e text');
    });
  },
};
