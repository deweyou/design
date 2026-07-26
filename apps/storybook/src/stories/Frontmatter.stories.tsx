import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import {
  Frontmatter,
  type FrontmatterPropertyTypes,
  type FrontmatterRecord,
} from '@deweyou-design/react/frontmatter';

const initialValue: FrontmatterRecord = {
  title: 'Frontmatter support',
  draft: false,
  priority: 2,
  published: '2026-07-22',
  scheduled: '2026-07-22T14:30',
  tags: ['markdown', 'editor'],
  aliases: ['metadata'],
};

const initialPropertyTypes: FrontmatterPropertyTypes = {
  published: 'date',
  scheduled: 'datetime',
};

const EditableExample = () => {
  const [value, setValue] = useState(initialValue);
  const [propertyTypes, setPropertyTypes] = useState(initialPropertyTypes);

  return (
    <Frontmatter
      editable
      onChange={(details) => {
        setValue(details.frontmatter);

        if (details.action === 'rename' && details.previousKey) {
          setPropertyTypes((current) => {
            const previousType = current[details.previousKey!];
            if (!previousType) return current;

            return Object.fromEntries(
              Object.entries(current).map(([key, type]) =>
                key === details.previousKey ? [details.key, type] : [key, type],
              ),
            );
          });
        }

        if (details.action === 'delete') {
          setPropertyTypes((current) =>
            Object.fromEntries(Object.entries(current).filter(([key]) => key !== details.key)),
          );
        }
      }}
      onPropertyTypeChange={({ key, type }) =>
        setPropertyTypes((current) => ({ ...current, [key]: type }))
      }
      propertyTypes={propertyTypes}
      value={value}
    />
  );
};

const meta = {
  title: 'Components/Frontmatter',
  component: Frontmatter,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Frontmatter renders Obsidian-style Markdown metadata with inferred property controls, optional host-owned type hints, and recoverable YAML source editing.',
      },
    },
    layout: 'padded',
  },
  args: {
    propertyTypes: initialPropertyTypes,
    value: initialValue,
  },
} satisfies Meta<typeof Frontmatter>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Editable: Story = {
  render: () => <EditableExample />,
};

export const Empty: Story = {
  args: {
    editable: true,
    onChange: () => {},
    value: {},
  },
};

export const SourceRecovery: Story = {
  args: {
    error: 'Invalid frontmatter YAML: unexpected end of flow sequence.',
    source: 'title: [broken\n',
  },
};

const truncatedPropertyName = 'contentReviewAutomationStatus';

export const TruncatedPropertyName: Story = {
  args: {
    editable: true,
    onChange: () => {},
    value: {
      [truncatedPropertyName]: 'pending',
      title: 'Frontmatter support',
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const propertyNameButton = canvas.getByRole('button', {
      name: `Rename ${truncatedPropertyName} property`,
    });
    const propertyName = canvas.getByText(truncatedPropertyName);

    await expect(propertyName.scrollWidth).toBeGreaterThan(propertyName.clientWidth);
    await userEvent.hover(propertyNameButton);
    await waitFor(() =>
      expect(
        within(document.body).getByText(truncatedPropertyName, {
          selector: '[data-scope="tooltip"][data-part="content"]',
        }),
      ).toBeVisible(),
    );
  },
};

export const Interaction: Story = {
  render: () => <EditableExample />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const titleInput = canvas.getByRole('textbox', { name: 'title' });
    const draftCheckbox = canvas.getByRole('checkbox', { name: 'draft' });
    const priorityInput = canvas.getByRole('spinbutton', { name: 'priority' });
    const publishedInput = canvas.getByRole('textbox', { name: 'published' });
    const scheduledInput = canvas.getByRole('textbox', { name: 'scheduled' });
    const tagsList = canvas.getByRole('list', { name: 'tags values' });
    const aliasesList = canvas.getByRole('list', { name: 'aliases values' });
    const priorityControl = priorityInput.closest<HTMLElement>('[data-part="control"]');
    const draftControl = draftCheckbox.closest<HTMLElement>(
      '[data-scope="checkbox"][data-part="root"]',
    );
    const draftMark = draftControl?.querySelector<HTMLElement>('[data-ui-checkbox-mark]');
    const publishedControl = publishedInput.closest<HTMLElement>('[data-part="control"]');
    const scheduledControl = scheduledInput.closest<HTMLElement>('[data-part="control"]');
    const inputContentStart = (input: HTMLElement) =>
      input.getBoundingClientRect().left +
      Number.parseFloat(getComputedStyle(input).paddingInlineStart);

    await expect(draftControl).not.toBeNull();
    await expect(draftMark).not.toBeNull();
    await expect(priorityControl).not.toBeNull();
    await expect(publishedControl).not.toBeNull();
    await expect(scheduledControl).not.toBeNull();
    await expect(publishedControl!.getBoundingClientRect().width).toBeLessThan(180);
    await expect(scheduledControl!.getBoundingClientRect().width).toBeGreaterThan(
      publishedControl!.getBoundingClientRect().width,
    );

    const valueStartByProperty = {
      aliases: aliasesList.getBoundingClientRect().left,
      draft: draftMark!.getBoundingClientRect().left,
      priority: priorityControl!.getBoundingClientRect().left,
      published: inputContentStart(publishedInput),
      scheduled: inputContentStart(scheduledInput),
      tags: tagsList.getBoundingClientRect().left,
      title: inputContentStart(titleInput),
    };
    const valueStarts = Object.values(valueStartByProperty);
    await expect(Math.max(...valueStarts) - Math.min(...valueStarts)).toBeLessThanOrEqual(1);

    await userEvent.clear(titleInput);
    await userEvent.type(titleInput, 'Published note');
    await expect(titleInput).toHaveValue('Published note');

    const currentPublishedInput = canvas.getByRole('textbox', { name: 'published' });
    await userEvent.clear(currentPublishedInput);
    await userEvent.type(currentPublishedInput, '2026-07-23');
    await userEvent.keyboard('{Enter}');
    await waitFor(() =>
      expect(canvas.getByRole('textbox', { name: 'published' })).toHaveValue('2026/07/23'),
    );

    await userEvent.click(draftCheckbox);
    await expect(draftCheckbox).toBeChecked();

    await expect(canvas.queryByRole('button', { name: 'Increase value' })).toBeNull();
    await userEvent.click(priorityInput);
    await userEvent.keyboard('{ArrowUp}');
    await expect(priorityInput).toHaveAttribute('aria-valuenow', '3');

    const removeTagButton = canvas.getByRole('button', {
      name: 'Remove editor from tags',
    });
    const removeTagGlyph = removeTagButton.querySelector<HTMLElement>('[aria-hidden]');
    const editableTagBadge = removeTagButton.parentElement;
    await expect(removeTagGlyph).not.toBeNull();
    await expect(editableTagBadge).not.toBeNull();
    await userEvent.hover(canvas.getByRole('button', { name: 'Edit editor in tags' }));
    await expect(getComputedStyle(removeTagButton).opacity).toBe('0');
    await expect(removeTagButton.getBoundingClientRect().width).toBeLessThanOrEqual(16);
    await expect(
      editableTagBadge!.getBoundingClientRect().right -
        removeTagButton.getBoundingClientRect().left,
    ).toBeLessThanOrEqual(17);
    removeTagButton.focus();
    await expect(getComputedStyle(removeTagButton).opacity).toBe('1');
    await expect(
      editableTagBadge!.getBoundingClientRect().right -
        removeTagGlyph!.getBoundingClientRect().right,
    ).toBeGreaterThanOrEqual(4);
    await expect(removeTagButton.getBoundingClientRect().right).toBeLessThanOrEqual(
      editableTagBadge!.getBoundingClientRect().right,
    );

    const editMarkdownButton = canvas.getByRole('button', { name: 'Edit markdown in tags' });
    const restingMarkdownBadge = editMarkdownButton.parentElement;
    await expect(restingMarkdownBadge).not.toBeNull();
    const restingMarkdownBadgeRect = restingMarkdownBadge!.getBoundingClientRect();
    await userEvent.click(editMarkdownButton);
    const editTagInput = canvas.getByRole('textbox', { name: 'Edit markdown in tags' });
    await userEvent.unhover(editTagInput);
    await expect(editTagInput).toHaveFocus();
    await expect(editTagInput.getBoundingClientRect().height).toBeCloseTo(
      restingMarkdownBadgeRect.height,
      0,
    );
    await expect(getComputedStyle(editTagInput).boxShadow).toBe('none');
    await userEvent.clear(editTagInput);
    await userEvent.type(editTagInput, 'markdown-updated');
    await userEvent.keyboard('{Enter}');
    await expect(canvas.getByText('markdown-updated')).toBeVisible();

    await userEvent.click(canvas.getByRole('button', { name: 'Add tags item' }));
    const tagInput = canvas.getByRole('textbox', { name: 'Add tags item' });
    const emptyTagInputWidth = tagInput.getBoundingClientRect().width;
    await userEvent.type(tagInput, 'frontmatter-extension');
    await expect(tagInput.getBoundingClientRect().width).toBeGreaterThan(emptyTagInputWidth);
    await userEvent.tab();
    await expect(canvas.getByText('frontmatter-extension')).toBeVisible();

    const editUpdatedMarkdownButton = canvas.getByRole('button', {
      name: 'Edit markdown-updated in tags',
    });
    const updatedMarkdownBadge = editUpdatedMarkdownButton.parentElement;
    const updatedMarkdownText = canvas.getByText('markdown-updated');
    await expect(updatedMarkdownBadge).not.toBeNull();
    const updatedMarkdownBadgeRect = updatedMarkdownBadge!.getBoundingClientRect();
    const unfocusedBadgeBorderColor = getComputedStyle(updatedMarkdownBadge!).borderTopColor;
    editUpdatedMarkdownButton.focus();
    await expect(editUpdatedMarkdownButton).toHaveFocus();
    await expect(editUpdatedMarkdownButton.matches(':focus-visible')).toBe(true);
    await expect(getComputedStyle(updatedMarkdownBadge!).boxShadow).toBe('none');
    await expect(getComputedStyle(updatedMarkdownBadge!).borderTopColor).toBe(
      unfocusedBadgeBorderColor,
    );
    await expect(getComputedStyle(updatedMarkdownText).textDecorationLine).toBe('underline');
    await expect(updatedMarkdownBadge!.getBoundingClientRect()).toEqual(updatedMarkdownBadgeRect);

    await userEvent.click(canvas.getByRole('button', { name: 'Add property' }));
    await userEvent.click(canvas.getByRole('button', { name: 'Change new property type' }));
    await userEvent.click(await within(document.body).findByRole('menuitem', { name: 'Checkbox' }));
    await userEvent.type(canvas.getByRole('textbox', { name: 'Property name' }), 'reviewed');
    await userEvent.click(canvas.getByRole('button', { name: 'Create property' }));
    await expect(canvas.getByRole('checkbox', { name: 'reviewed' })).not.toBeChecked();

    await userEvent.click(canvas.getByRole('button', { name: 'Rename reviewed property' }));
    const renameInput = canvas.getByRole('textbox', { name: 'Rename reviewed property' });
    await userEvent.clear(renameInput);
    await userEvent.type(renameInput, 'approved{Enter}');
    await expect(canvas.getByRole('checkbox', { name: 'approved' })).toBeInTheDocument();

    await userEvent.click(canvas.getByRole('button', { name: 'Change approved property type' }));
    await userEvent.click(
      await within(document.body).findByRole('menuitem', { name: 'Delete property' }),
    );
    await expect(canvas.queryByRole('checkbox', { name: 'approved' })).toBeNull();
  },
};
