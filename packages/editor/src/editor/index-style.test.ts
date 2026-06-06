import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { expect, test } from 'vite-plus/test';

const styles = readFileSync(resolve(import.meta.dirname, './index.module.less'), 'utf8');

test('empty editor paragraph aligns placeholder with the caret baseline', () => {
  expect(styles).toContain('.contentFrame');
  expect(styles).toContain('position: relative;');
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

test('code blocks render as full width editing blocks', () => {
  expect(styles).toContain('.codeBlock');
  expect(styles).toContain('display: block;');
  expect(styles).toContain('position: relative;');
  expect(styles).toContain('inline-size: 100%;');
  expect(styles).toContain('white-space: pre;');
  expect(styles).toContain('tab-size: 2;');
});

test('code blocks expose a language label when markdown provides one', () => {
  expect(styles).toContain('.codeBlock[data-language]::before');
  expect(styles).toContain('display: inline-flex;');
  expect(styles).toContain('align-items: center;');
  expect(styles).toContain('block-size: 1.35rem;');
  expect(styles).toContain('content: attr(data-language);');
  expect(styles).toContain('text-transform: uppercase;');
});

test('code blocks expose syntax token classes aligned with Markdown rendering', () => {
  expect(styles).toContain('.codeTokenKeyword');
  expect(styles).toContain('color: var(--editor-code-keyword);');
  expect(styles).toContain('.codeTokenString');
  expect(styles).toContain('color: var(--editor-code-string);');
  expect(styles).toContain('.codeTokenComment');
  expect(styles).toContain('font-style: italic;');
});
