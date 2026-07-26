// @vitest-environment jsdom
import '../test-setup';

import { useState } from 'react';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vite-plus/test';

import { ConfigProvider } from '../config-provider/index';
import {
  Frontmatter,
  type FrontmatterChangeDetails,
  type FrontmatterPropertyTypes,
  type FrontmatterRecord,
  type FrontmatterRenderValueContext,
} from './index';

beforeEach(() => {
  if (!window.ResizeObserver) {
    window.ResizeObserver = class ResizeObserver {
      observe() {}
      unobserve() {}
      disconnect() {}
    };
  }
});

describe('Frontmatter', () => {
  afterEach(() => {
    cleanup();
  });

  it('renders inferred text, number, checkbox, list, and tag values', () => {
    const { container } = render(
      <Frontmatter
        value={{
          title: 'Frontmatter support',
          priority: 2,
          draft: true,
          aliases: ['metadata', 'properties'],
          tags: ['markdown', 'editor'],
        }}
      />,
    );

    expect(screen.getByText('Frontmatter support')).toBeTruthy();
    expect(screen.getByText('2')).toBeTruthy();
    expect(screen.getByRole('checkbox', { name: 'draft' }).getAttribute('aria-checked')).toBe(
      'true',
    );
    expect(container.querySelectorAll('[data-frontmatter-list-item]')).toHaveLength(4);
    expect(
      container
        .querySelector('[data-frontmatter-property="tags"]')
        ?.getAttribute('data-property-type'),
    ).toBe('tags');
  });

  it('exposes structural and resolved type details to renderValue', () => {
    const contexts: FrontmatterRenderValueContext[] = [];

    render(
      <Frontmatter
        propertyTypes={{ published: 'date' }}
        renderValue={(context) => {
          contexts.push(context);
          return context.defaultNode;
        }}
        value={{ draft: false, published: '2026-07-22', tags: ['markdown'] }}
      />,
    );

    expect(contexts).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          key: 'draft',
          propertyType: 'checkbox',
          typeSource: 'inferred',
          valueType: 'boolean',
        }),
        expect.objectContaining({
          key: 'published',
          propertyType: 'date',
          typeSource: 'explicit',
          valueType: 'string',
        }),
        expect.objectContaining({
          key: 'tags',
          propertyType: 'tags',
          typeSource: 'builtin',
          valueType: 'array',
        }),
      ]),
    );
  });

  it('lets renderValue return null to hide the default value', () => {
    render(<Frontmatter renderValue={() => null} value={{ title: 'Hidden title' }} />);

    expect(screen.queryByText('Hidden title')).toBeNull();
  });

  it('shows the complete property name in a tooltip when the label is truncated', async () => {
    const propertyKey = 'contentReviewAutomationStatus';
    const clientWidthSpy = vi
      .spyOn(HTMLElement.prototype, 'clientWidth', 'get')
      .mockReturnValue(64);
    const scrollWidthSpy = vi
      .spyOn(HTMLElement.prototype, 'scrollWidth', 'get')
      .mockReturnValue(192);
    const user = userEvent.setup();

    try {
      render(<Frontmatter editable onChange={vi.fn()} value={{ [propertyKey]: 'pending' }} />);

      const propertyNameButton = screen.getByRole('button', {
        name: `Rename ${propertyKey} property`,
      });
      await user.hover(propertyNameButton);

      expect(
        await screen.findByText(propertyKey, {
          selector: '[data-scope="tooltip"][data-part="content"]',
        }),
      ).toBeVisible();
    } finally {
      clientWidthSpy.mockRestore();
      scrollWidthSpy.mockRestore();
    }
  });

  it('edits text, checkbox, and free-form list values through one controlled callback', async () => {
    const onChange = vi.fn();

    render(
      <Frontmatter
        editable
        onChange={onChange}
        value={{ title: 'Draft', draft: false, tags: ['markdown'] }}
      />,
    );

    fireEvent.change(screen.getByRole('textbox', { name: 'title' }), {
      target: { value: 'Published' },
    });
    fireEvent.click(screen.getByRole('checkbox', { name: 'draft' }));
    expect(screen.queryByRole('textbox', { name: 'Add tags item' })).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'Add tags item' }));
    fireEvent.change(screen.getByRole('textbox', { name: 'Add tags item' }), {
      target: { value: 'editor' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Add tags item' }));

    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ key: 'title', path: ['title'], value: 'Published' }),
    );
    await waitFor(() => {
      expect(onChange).toHaveBeenCalledWith(
        expect.objectContaining({ key: 'draft', path: ['draft'], value: true }),
      );
    });
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ key: 'tags', path: ['tags'], value: ['markdown', 'editor'] }),
    );
  });

  it('commits a new list value on blur and cancels an empty draft', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();

    render(<Frontmatter editable onChange={onChange} value={{ tags: ['markdown'] }} />);

    await user.click(screen.getByRole('button', { name: 'Add tags item' }));
    const addInput = screen.getByRole('textbox', { name: 'Add tags item' });
    await user.type(addInput, 'frontmatter');
    await user.tab();

    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        key: 'tags',
        path: ['tags'],
        value: ['markdown', 'frontmatter'],
      }),
    );
    expect(screen.queryByRole('textbox', { name: 'Add tags item' })).toBeNull();

    onChange.mockClear();
    await user.click(screen.getByRole('button', { name: 'Add tags item' }));
    await user.tab();

    expect(onChange).not.toHaveBeenCalled();
    expect(screen.queryByRole('textbox', { name: 'Add tags item' })).toBeNull();
  });

  it('edits list values inline and supports commit and cancel', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();

    render(<Frontmatter editable onChange={onChange} value={{ tags: ['markdown', '43423'] }} />);

    await user.click(screen.getByRole('button', { name: 'Edit markdown in tags' }));
    const cancelledInput = screen.getByRole('textbox', { name: 'Edit markdown in tags' });
    await user.clear(cancelledInput);
    await user.type(cancelledInput, 'cancelled');
    await user.keyboard('{Escape}');

    expect(screen.getByRole('button', { name: 'Edit markdown in tags' })).toBeTruthy();
    expect(onChange).not.toHaveBeenCalled();

    await user.click(screen.getByRole('button', { name: 'Edit 43423 in tags' }));
    const committedInput = screen.getByRole('textbox', { name: 'Edit 43423 in tags' });
    await user.clear(committedInput);
    await user.type(committedInput, 'updated');
    await user.tab();

    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        key: 'tags',
        path: ['tags'],
        value: ['markdown', 'updated'],
      }),
    );

    await user.click(screen.getByRole('button', { name: 'Remove 43423 from tags' }));
    expect(onChange).toHaveBeenLastCalledWith(
      expect.objectContaining({
        key: 'tags',
        path: ['tags'],
        value: ['markdown'],
      }),
    );
  });

  it('preserves scalar types when editing list values', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();

    render(<Frontmatter editable onChange={onChange} value={{ aliases: [23, true] }} />);

    await user.click(screen.getByRole('button', { name: 'Edit 23 in aliases' }));
    const numberInput = screen.getByRole('textbox', { name: 'Edit 23 in aliases' });
    await user.clear(numberInput);
    await user.type(numberInput, '42{Enter}');

    expect(onChange).toHaveBeenLastCalledWith(
      expect.objectContaining({
        key: 'aliases',
        path: ['aliases'],
        value: [42, true],
      }),
    );
  });

  it('does not let free-form list editing change an existing scalar type', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();

    render(<Frontmatter editable onChange={onChange} value={{ weights: [23, true, null] }} />);

    expect(screen.queryByRole('button', { name: 'Add weights item' })).toBeNull();

    await user.click(screen.getByRole('button', { name: 'Edit 23 in weights' }));
    const numberInput = screen.getByRole('textbox', { name: 'Edit 23 in weights' });
    await user.clear(numberInput);
    await user.type(numberInput, 'not-a-number{Enter}');

    expect(onChange).not.toHaveBeenCalled();
    expect(screen.getByRole('button', { name: 'Edit 23 in weights' })).toBeTruthy();
  });

  it('moves property type changes behind an icon menu', async () => {
    const onPropertyTypeChange = vi.fn();
    const user = userEvent.setup();

    render(
      <Frontmatter
        editable
        onPropertyTypeChange={onPropertyTypeChange}
        value={{ published: '2026-07-22' }}
      />,
    );

    expect(screen.queryByRole('combobox', { name: 'published type' })).toBeNull();
    await user.click(screen.getByRole('button', { name: 'Change published property type' }));
    await user.click(await screen.findByRole('menuitem', { name: 'Date' }));

    await waitFor(() => {
      expect(onPropertyTypeChange).toHaveBeenCalledWith({ key: 'published', type: 'date' });
    });
  });

  it('disables property types that are incompatible with the current YAML value', async () => {
    const user = userEvent.setup();

    render(
      <Frontmatter
        editable
        onPropertyTypeChange={vi.fn()}
        value={{ title: 'Draft', tags: ['markdown'] }}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Change title property type' }));

    expect(await screen.findByRole('menuitem', { name: 'Text' })).not.toHaveAttribute(
      'aria-disabled',
    );
    expect(screen.getByRole('menuitem', { name: 'Number' })).toHaveAttribute(
      'aria-disabled',
      'true',
    );
    expect(screen.getByRole('menuitem', { name: 'Date' })).toHaveAttribute('aria-disabled', 'true');

    await user.keyboard('{Escape}');
    await user.click(screen.getByRole('button', { name: 'Change tags property type' }));
    expect(await screen.findByRole('menuitem', { name: 'List' })).not.toHaveAttribute(
      'aria-disabled',
    );
  });

  it('adds, renames, and deletes typed properties through one controlled callback', async () => {
    const onChange = vi.fn<(details: FrontmatterChangeDetails) => void>();
    const user = userEvent.setup();

    const Example = () => {
      const [value, setValue] = useState<FrontmatterRecord>({ title: 'Draft' });
      const [propertyTypes, setPropertyTypes] = useState<FrontmatterPropertyTypes>({});

      return (
        <Frontmatter
          editable
          onChange={(details) => {
            onChange(details);
            setValue(details.frontmatter);
          }}
          onPropertyTypeChange={({ key, type }) =>
            setPropertyTypes((current) => ({ ...current, [key]: type }))
          }
          propertyTypes={propertyTypes}
          value={value}
        />
      );
    };

    render(<Example />);

    await user.click(screen.getByRole('button', { name: 'Add property' }));
    await user.click(screen.getByRole('button', { name: 'Change new property type' }));
    await user.click(await screen.findByRole('menuitem', { name: 'Number' }));
    await user.type(screen.getByRole('textbox', { name: 'Property name' }), 'priority');
    await user.click(screen.getByRole('button', { name: 'Create property' }));

    expect(screen.getByRole('spinbutton', { name: 'priority' })).toHaveValue('0');
    expect(onChange).toHaveBeenLastCalledWith(
      expect.objectContaining({
        action: 'add',
        frontmatter: { title: 'Draft', priority: 0 },
        key: 'priority',
        path: ['priority'],
        value: 0,
      }),
    );

    await user.click(screen.getByRole('button', { name: 'Rename priority property' }));
    const propertyNameInput = screen.getByRole('textbox', { name: 'Rename priority property' });
    await user.clear(propertyNameInput);
    await user.type(propertyNameInput, 'score{Enter}');

    expect(screen.getByRole('spinbutton', { name: 'score' })).toBeTruthy();
    expect(onChange).toHaveBeenLastCalledWith(
      expect.objectContaining({
        action: 'rename',
        frontmatter: { title: 'Draft', score: 0 },
        key: 'score',
        path: ['score'],
        previousKey: 'priority',
        value: 0,
      }),
    );

    await user.click(screen.getByRole('button', { name: 'Change score property type' }));
    await user.click(await screen.findByRole('menuitem', { name: 'Delete property' }));

    expect(screen.queryByRole('spinbutton', { name: 'score' })).toBeNull();
    expect(onChange).toHaveBeenLastCalledWith(
      expect.objectContaining({
        action: 'delete',
        frontmatter: { title: 'Draft' },
        key: 'score',
        path: ['score'],
        value: 0,
      }),
    );
  });

  it('keeps empty and duplicate property names recoverable while adding and renaming', async () => {
    const user = userEvent.setup();

    render(<Frontmatter editable onChange={vi.fn()} value={{ title: 'Draft', draft: false }} />);

    await user.click(screen.getByRole('button', { name: 'Add property' }));
    await user.type(screen.getByRole('textbox', { name: 'Property name' }), 'title');
    await user.click(screen.getByRole('button', { name: 'Create property' }));

    expect(screen.getByRole('alert')).toHaveTextContent('A property named title already exists.');
    expect(screen.getByRole('textbox', { name: 'Property name' })).toHaveFocus();

    await user.keyboard('{Escape}');
    await user.click(screen.getByRole('button', { name: 'Rename draft property' }));
    const renameInput = screen.getByRole('textbox', { name: 'Rename draft property' });
    await user.clear(renameInput);
    await user.type(renameInput, 'title{Enter}');

    expect(screen.getByRole('alert')).toHaveTextContent('A property named title already exists.');
    expect(renameInput).toHaveFocus();
  });

  it('supports per-property editing and numeric input options', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();

    render(
      <Frontmatter
        editable
        onChange={onChange}
        propertyOptions={{
          priority: { number: { max: 5, min: 0, step: 2 }, placeholder: 'Set priority' },
          title: { editable: false },
        }}
        value={{ title: 'Read-only title', priority: 2 }}
      />,
    );

    expect(screen.queryByRole('textbox', { name: 'title' })).toBeNull();
    expect(screen.getByText('Read-only title')).toBeTruthy();

    const priorityInput = screen.getByRole('spinbutton', { name: 'priority' });
    expect(priorityInput).toHaveAttribute('placeholder', 'Set priority');
    await user.click(priorityInput);
    await user.keyboard('{ArrowUp}');

    expect(onChange).toHaveBeenLastCalledWith(
      expect.objectContaining({ action: 'set', key: 'priority', value: 4 }),
    );
  });

  it('inherits localized component-owned copy and supports explicit overrides', async () => {
    render(
      <ConfigProvider locale="zh-CN">
        <Frontmatter
          editable
          localeText={{ addProperty: '新增元数据' }}
          onChange={vi.fn()}
          value={{}}
        />
      </ConfigProvider>,
    );

    expect(await screen.findByText('属性')).toBeTruthy();
    expect(screen.getByRole('button', { name: '新增元数据' })).toBeTruthy();
    expect(screen.getByText('暂无属性')).toBeTruthy();
  });

  it('uses a chrome-free NumberInput with keyboard stepping for numeric properties', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();

    render(<Frontmatter editable onChange={onChange} value={{ priority: 2 }} />);

    const input = screen.getByRole('spinbutton', { name: 'priority' });
    expect(input.closest('[data-part="control"]')).toHaveAttribute('data-focus-ring', 'false');
    expect(screen.queryByRole('button', { name: 'Increase value' })).toBeNull();
    expect(screen.queryByRole('button', { name: 'Decrease value' })).toBeNull();

    await user.click(input);
    await user.keyboard('{ArrowUp}');

    expect(onChange).toHaveBeenLastCalledWith(
      expect.objectContaining({
        key: 'priority',
        path: ['priority'],
        value: 3,
      }),
    );
  });

  it('edits date and date-time properties through DatePicker while preserving YAML strings', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(
      <Frontmatter
        editable
        onChange={onChange}
        propertyTypes={{ published: 'date', scheduled: 'datetime' }}
        value={{ published: '2026-07-22', scheduled: '2026-07-22T14:30' }}
      />,
    );

    const publishedInput = screen.getByRole('textbox', { name: 'published' });
    const scheduledInput = screen.getByRole<HTMLInputElement>('textbox', { name: 'scheduled' });
    expect(publishedInput).toHaveValue('2026/07/22');
    expect(scheduledInput.value).toContain('2026/07/22');

    await user.clear(publishedInput);
    await user.type(publishedInput, '2026-07-23');
    await user.keyboard('{Enter}');

    expect(onChange).toHaveBeenLastCalledWith(
      expect.objectContaining({
        frontmatter: { published: '2026-07-23', scheduled: '2026-07-22T14:30' },
        key: 'published',
        path: ['published'],
        value: '2026-07-23',
      }),
    );

    await user.keyboard('{Escape}');
    await user.click(scheduledInput);
    await user.click(screen.getByRole('button', { name: /Choose Thursday, July 23, 2026/i }));
    await user.click(screen.getByRole('button', { name: 'Confirm' }));

    expect(onChange).toHaveBeenLastCalledWith(
      expect.objectContaining({
        frontmatter: { published: '2026-07-22', scheduled: '2026-07-23T14:30' },
        key: 'scheduled',
        path: ['scheduled'],
        value: '2026-07-23T14:30',
      }),
    );
  });

  it('clears a DatePicker property back to an empty YAML string', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(
      <Frontmatter
        editable
        onChange={onChange}
        propertyTypes={{ published: 'date' }}
        value={{ published: '2026-07-22' }}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Clear date' }));

    expect(onChange).toHaveBeenLastCalledWith(
      expect.objectContaining({
        frontmatter: { published: '' },
        key: 'published',
        path: ['published'],
        value: '',
      }),
    );
  });

  it('recovers an invalid canonical date through YAML source mode instead of crashing', () => {
    render(
      <Frontmatter
        editable
        onChange={vi.fn()}
        propertyTypes={{ published: 'date' }}
        value={{ published: 'not-a-date' }}
      />,
    );

    expect(screen.getByText('not-a-date')).toBeTruthy();
    expect(screen.getByText(/Expected date value; edit the YAML source to recover/)).toBeTruthy();
  });

  it('uses source mode for invalid YAML and keeps it editable', () => {
    const onSourceChange = vi.fn();

    render(
      <Frontmatter
        editable
        error="Invalid YAML"
        onSourceChange={onSourceChange}
        source="title: [broken\n"
      />,
    );

    expect(screen.getByRole('alert').textContent).toContain('Invalid YAML');
    fireEvent.change(screen.getByRole('textbox', { name: 'Frontmatter YAML source' }), {
      target: { value: 'title: fixed\n' },
    });
    expect(onSourceChange).toHaveBeenCalledWith('title: fixed\n');
  });
});
