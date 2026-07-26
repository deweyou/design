// @vitest-environment jsdom

import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, expect, expectTypeOf, test } from 'vite-plus/test';

import { Input, type InputProps } from './index';
import styles from './index.module.less';

const renderMarkup = (props: InputProps) => renderToStaticMarkup(createElement(Input, props));

afterEach(() => {
  cleanup();
});

test('input renders a root div with an inner input element by default', () => {
  const markup = renderMarkup({});
  expect(markup).toContain('<div');
  expect(markup).toContain('<input');
});

test('input applies the md size class by default', () => {
  const markup = renderMarkup({});
  expect(markup).toContain(styles.sizeMd);
});

test('input applies correct size class for each size value', () => {
  for (const size of ['sm', 'md', 'lg'] as const) {
    const markup = renderMarkup({ size });
    const expectedClass =
      size === 'sm' ? styles.sizeSm : size === 'lg' ? styles.sizeLg : styles.sizeMd;
    expect(markup).toContain(expectedClass);
  }
});

test('input renders label element with htmlFor when label prop is provided', () => {
  const markup = renderMarkup({ label: 'Email address', id: 'email' });
  expect(markup).toContain('<label');
  expect(markup).toContain('Email address');
  expect(markup).toContain('for="email"');
});

test('input links generated label and hint ids when id is omitted', () => {
  const markup = renderMarkup({
    hint: 'We will never share your email.',
    label: 'Email address',
  });

  expect(markup).toContain('for="field-');
  expect(markup).toContain('id="field-');
  expect(markup).toContain('aria-describedby="field-');
});

test('input does not render label element when label prop is absent', () => {
  const markup = renderMarkup({});
  expect(markup).not.toContain('<label');
});

test('input renders hint text when hint prop is provided', () => {
  const markup = renderMarkup({ hint: 'We will never share your email.' });
  expect(markup).toContain('We will never share your email.');
  expect(markup).toContain(styles.hint);
});

test('input renders error message and applies error classes when error prop is provided', () => {
  const markup = renderMarkup({ error: 'This field is required.' });
  expect(markup).toContain('This field is required.');
  expect(markup).toContain(styles.error);
  expect(markup).toContain(styles.fieldError);
  expect(markup).toContain('aria-invalid="true"');
});

test('input keeps hint and error text in aria-describedby when invalid', () => {
  const markup = renderMarkup({
    error: 'This field is required.',
    hint: 'Optional hint.',
    id: 'email',
  });

  expect(markup).toContain('id="email-error"');
  expect(markup).toContain('aria-describedby="email-description email-error"');
});

test('input does not apply error classes when error is absent', () => {
  const markup = renderMarkup({ hint: 'Some hint' });
  expect(markup).not.toContain(styles.error);
  expect(markup).not.toContain(styles.fieldError);
});

test('input applies disabled class and disabled attribute when disabled is true', () => {
  const markup = renderMarkup({ disabled: true });
  expect(markup).toContain('data-disabled="true"');
  expect(markup).toContain('disabled');
});

test('input forwards className and style to root element', () => {
  const markup = renderMarkup({ className: 'consumer-input', style: { marginTop: '8px' } });
  expect(markup).toContain('consumer-input');
  expect(markup).toContain('margin-top');
});

test('input renders outlined variant (default) with border class', () => {
  const markup = renderMarkup({});
  expect(markup).toContain(styles.variantOutlined);
});

test('input renders ghost variant without border class', () => {
  const markup = renderMarkup({ variant: 'ghost' });
  expect(markup).toContain(styles.variantGhost);
  expect(markup).not.toContain(styles.variantOutlined);
});

test('input exposes placeholder and clearable as public props', () => {
  expectTypeOf<InputProps['placeholder']>().toEqualTypeOf<string | undefined>();
  expectTypeOf<InputProps['clearable']>().toEqualTypeOf<boolean | undefined>();

  const markup = renderMarkup({ placeholder: 'Type a name' });
  expect(markup).toContain('placeholder="Type a name"');
  expect(markup).not.toContain('Clear input');
});

test('input clears an editable value through the existing change callback', async () => {
  const changedValues: string[] = [];
  const user = userEvent.setup();

  render(
    createElement(Input, {
      clearable: true,
      defaultValue: 'Alice',
      onChange: (event) => changedValues.push(event.currentTarget.value),
      placeholder: 'Type a name',
    }),
  );

  const input = screen.getByRole('textbox');
  await user.click(screen.getByRole('button', { name: 'Clear input' }));

  expect((input as HTMLInputElement).value).toBe('');
  expect(document.activeElement).toBe(input);
  expect(changedValues).toEqual(['']);
  expect(screen.queryByRole('button', { name: 'Clear input' })).toBeNull();
  expect(input.getAttribute('placeholder')).toBe('Type a name');
});

test('input hides the clear action when disabled or read only', () => {
  render(
    createElement('div', null, [
      createElement(Input, {
        clearable: true,
        defaultValue: 'Disabled',
        disabled: true,
        key: 'disabled',
      }),
      createElement(Input, {
        clearable: true,
        defaultValue: 'Read only',
        key: 'read-only',
        readOnly: true,
      }),
    ]),
  );

  expect(screen.queryByRole('button', { name: 'Clear input' })).toBeNull();
});
