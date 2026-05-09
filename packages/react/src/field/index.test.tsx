import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vite-plus/test';

import { Field } from './index.tsx';

const renderField = (props: { disabled?: boolean; error?: string; hint?: string; id?: string }) =>
  renderToStaticMarkup(
    <Field.Root
      disabled={props.disabled}
      hasDescription={props.hint !== undefined}
      hasError={props.error !== undefined}
      id={props.id}
      invalid={props.error !== undefined}
      required
    >
      <Field.Label>Email</Field.Label>
      <Field.Control>
        <input />
      </Field.Control>
      {props.hint && <Field.Description>{props.hint}</Field.Description>}
      {props.error && <Field.ErrorText>{props.error}</Field.ErrorText>}
    </Field.Root>,
  );

describe('Field', () => {
  it('links label, control, and description with an explicit id', () => {
    const markup = renderField({ hint: 'Use a work email.', id: 'email' });

    expect(markup).toContain('for="email"');
    expect(markup).toContain('id="email"');
    expect(markup).toContain('id="email-description"');
    expect(markup).toContain('aria-describedby="email-description"');
    expect(markup).toContain('aria-required="true"');
  });

  it('uses error text as the aria description when invalid', () => {
    const markup = renderField({
      error: 'Email is required.',
      hint: 'Use a work email.',
      id: 'email',
    });

    expect(markup).toContain('id="email-error"');
    expect(markup).toContain('role="alert"');
    expect(markup).toContain('aria-invalid="true"');
    expect(markup).toContain('aria-describedby="email-error"');
  });

  it('passes disabled state to the wrapped control', () => {
    const markup = renderField({ disabled: true, id: 'email' });

    expect(markup).toContain('data-disabled="true"');
    expect(markup).toContain('disabled=""');
  });

  it('generates stable control ids when no id is provided', () => {
    const markup = renderField({ hint: 'Generated id field.' });

    expect(markup).toContain('<label');
    expect(markup).toContain('for="field-');
    expect(markup).toContain('aria-describedby="field-');
  });

  it('exports compound field parts from a single object', () => {
    expect(typeof Field.Root).toBe('function');
    expect(typeof Field.Label).toBe('function');
    expect(typeof Field.Control).toBe('function');
    expect(typeof Field.Description).toBe('function');
    expect(typeof Field.ErrorText).toBe('function');
  });

  it('can render without a control child for layout-only field copy', () => {
    const markup = renderToStaticMarkup(
      createElement(
        Field.Root,
        { id: 'copy', hasDescription: true },
        createElement(Field.Label, null, 'Copy'),
        createElement(Field.Description, null, 'Description'),
      ),
    );

    expect(markup).toContain('Copy');
    expect(markup).toContain('Description');
  });
});
