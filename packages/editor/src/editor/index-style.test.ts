import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { expect, test } from 'vite-plus/test';

const styles = readFileSync(resolve(import.meta.dirname, './index.module.less'), 'utf8');

test('empty editor paragraph aligns placeholder with the caret baseline', () => {
  expect(styles).toMatch(/\.root \{[\s\S]*?position: relative;/);
  expect(styles).toContain('.contentFrame');
  expect(styles).toContain('position: relative;');
  expect(styles).toContain('--editor-block-gap: max(var(--markdown-block-gap, 0rem), 1.4rem);');
  expect(styles).toContain('.contentEditable > :first-child');
  expect(styles).toContain('margin-block-start: 0;');
  expect(styles).toContain('.contentEditable > :first-child:last-child');
  expect(styles).toContain('margin-block: 0;');
});

test('inline code keeps selection backgrounds visually continuous', () => {
  expect(styles).toContain('.inlineCode');
  expect(styles).toContain('padding: 0;');
  expect(styles).toContain('border-radius: 0;');
  expect(styles).toContain('background-size: 100% 0.42em;');
});

test('links are visually distinct inside the editing surface', () => {
  expect(styles).toContain('.link');
  expect(styles).toContain('color: var(--ui-color-brand-text);');
  expect(styles).toContain('background-image: linear-gradient(currentColor, currentColor);');
  expect(styles).toContain('background-size: 100% 0.08em;');
  expect(styles).toContain('text-decoration-line: none;');
});

test('tables render visible cells inside the editing surface', () => {
  expect(styles).toContain('.table');
  expect(styles).toContain('border-collapse: collapse;');
  expect(styles).toContain('min-inline-size: 100%;');
  expect(styles).toContain('.tableCell');
  expect(styles).toContain('border: 1px solid var(--ui-color-border);');
  expect(styles).toContain('padding: 0.55rem 0.7rem;');
  expect(styles).toContain('.tableCellHeader');
  expect(styles).toContain(
    'background: color-mix(in srgb, var(--ui-color-surface) 96%, var(--ui-color-text) 4%);',
  );
  expect(styles).toContain('.tableSelection');
  expect(styles).toContain('user-select: none;');
  expect(styles).toContain('.tableCellSelected');
  expect(styles).toContain(
    'background: color-mix(in srgb, var(--ui-color-brand-text) 18%, var(--ui-color-surface));',
  );
  expect(styles).toContain(
    'border-color: color-mix(in srgb, var(--ui-color-brand-text) 30%, var(--ui-color-surface));',
  );
  expect(styles).not.toContain('box-shadow: inset 0 0 0 1px color-mix');
});

test('code blocks render as full width editing blocks', () => {
  expect(styles).toContain('.codeBlock');
  expect(styles).toContain('display: block;');
  expect(styles).toContain('position: relative;');
  expect(styles).toContain('inline-size: 100%;');
  expect(styles).toContain('border: 1px solid var(--code-block-border);');
  expect(styles).toContain('background: var(--code-block-bg);');
  expect(styles).toContain('0 1px 2px var(--code-block-shadow);');
  expect(styles).toContain('white-space: pre;');
  expect(styles).toContain('tab-size: 2;');
});

test('code blocks support editor level wrapping', () => {
  expect(styles).toContain(".root[data-editor-code-wrap='true'] .codeBlock");
  expect(styles).toContain('white-space: pre-wrap;');
  expect(styles).toContain('overflow-wrap: anywhere;');
});

test('code blocks expose a language label when markdown provides one', () => {
  expect(styles).toContain('.codeBlock[data-language]::before');
  expect(styles).toContain('display: inline-flex;');
  expect(styles).toContain('align-items: center;');
  expect(styles).toContain('block-size: 1.35rem;');
  expect(styles).toContain('content: attr(data-language);');
  expect(styles).toContain('text-transform: uppercase;');
});

test('code block language labels are hidden when code actions are enabled', () => {
  expect(styles).toContain(
    ".root[data-editor-code-actions='true'] .codeBlock[data-language]::before",
  );
  expect(styles).toContain('content: none;');
});

test('code blocks reserve a header row when code actions are enabled', () => {
  expect(styles).toContain(".root[data-editor-code-actions='true'] .codeBlock");
  expect(styles).toContain('padding-block-start: 3rem;');
  expect(styles).toContain('padding-inline-end: 1rem;');
});

test('code blocks expose syntax token classes aligned with Markdown rendering', () => {
  expect(styles).toContain('.codeTokenKeyword');
  expect(styles).toContain('color: var(--code-block-keyword);');
  expect(styles).toContain('.codeTokenString');
  expect(styles).toContain('color: var(--code-block-string);');
  expect(styles).toContain('.codeTokenComment');
  expect(styles).toContain('font-style: italic;');
  expect(styles).not.toContain('--editor-code-');
});
