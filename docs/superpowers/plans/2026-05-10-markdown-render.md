# Markdown Render Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a token-aligned `MarkdownRender` React component that safely renders CommonMark plus GFM Markdown with size-based density, node overrides, and reusable default node infrastructure.

**Architecture:** Use `react-markdown` with `remark-gfm` as the parsing/rendering adapter. Keep `MarkdownRender` as a thin shell that merges consumer `components` with local default Markdown node components. Default styles live in a CSS module and expose stable `data-markdown-*` attributes for lightweight overrides and future editor preview reuse.

**Tech Stack:** TypeScript 5, React 19, Less CSS Modules, `react-markdown`, `remark-gfm`, `vite-plus/test`, `react-dom/server`.

---

## File Structure

- Modify: `pnpm-workspace.yaml` — add catalog entries for `react-markdown` and `remark-gfm`.
- Modify: `packages/react/package.json` — add runtime dependencies for Markdown parsing/rendering.
- Create: `packages/react/src/markdown-render/index.tsx` — public component, prop types, default node components, override merge helper, language extraction helper.
- Create: `packages/react/src/markdown-render/index.module.less` — token-driven Markdown typography, block, list, table, code, image, and task marker styles.
- Create: `packages/react/src/markdown-render/index.test.tsx` — colocated unit tests for Markdown behavior and component overrides.
- Modify: `packages/react/src/index.ts` — root export for `MarkdownRender`.
- Modify: `packages/react/package.json` — subpath export `./markdown-render`.
- Modify: `packages/react/tests/package-entrypoint.test.ts` — root public API contract.
- Modify: `packages/react/tests/subpath-entrypoint.test.ts` — subpath public API contract.
- Modify: `docs/design/components.md` — public docs matrix and component notes.

## Task 1: Add Markdown Runtime Dependencies

**Files:**

- Modify: `pnpm-workspace.yaml`
- Modify: `packages/react/package.json`
- Modify: `pnpm-lock.yaml`

- [ ] **Step 1: Add catalog entries**

Edit `pnpm-workspace.yaml` catalog:

```yaml
catalog:
  react-markdown: ^10.1.0
  remark-gfm: ^4.0.1
```

Keep the entries alphabetized with nearby catalog keys.

- [ ] **Step 2: Add package dependencies**

Edit `packages/react/package.json` dependencies:

```json
"dependencies": {
  "@ark-ui/react": "catalog:",
  "@deweyou-design/react-hooks": "workspace:*",
  "@deweyou-design/react-icons": "workspace:*",
  "@deweyou-design/styles": "workspace:*",
  "classnames": "catalog:",
  "react-markdown": "catalog:",
  "remark-gfm": "catalog:"
}
```

- [ ] **Step 3: Refresh lockfile**

Run:

```bash
pnpm install
```

Expected: `pnpm-lock.yaml` records `react-markdown` and `remark-gfm` under `packages/react` dependencies and installation exits 0.

- [ ] **Step 4: Commit dependency setup**

Run:

```bash
git add pnpm-workspace.yaml packages/react/package.json pnpm-lock.yaml
git commit -m "build(react): add markdown render dependencies"
```

Expected: commit succeeds.

## Task 2: Write MarkdownRender Unit Tests First

**Files:**

- Create: `packages/react/src/markdown-render/index.test.tsx`

- [ ] **Step 1: Create failing colocated test file**

Create `packages/react/src/markdown-render/index.test.tsx`:

````tsx
import { createElement, type AnchorHTMLAttributes, type ComponentPropsWithoutRef } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vite-plus/test';

import { MarkdownRender, type MarkdownRenderComponents, type MarkdownRenderProps } from './index';

const renderMarkdown = (props: MarkdownRenderProps) => {
  return renderToStaticMarkup(createElement(MarkdownRender, props));
};

describe('MarkdownRender', () => {
  it('renders CommonMark and GFM nodes with stable data attributes', () => {
    const markup = renderMarkdown({
      value: [
        '# Title',
        '',
        'Paragraph with **strong**, *emphasis*, ~~deleted~~, `inline`, and [link](https://example.com).',
        '',
        '> Quote',
        '',
        '- [x] done',
        '- [ ] open',
        '',
        '1. first',
        '2. second',
        '',
        '| Name | Value |',
        '| --- | --- |',
        '| alpha | beta |',
        '',
        '---',
      ].join('\n'),
    });

    expect(markup).toContain('data-markdown-root="true"');
    expect(markup).toContain('data-markdown-size="md"');
    expect(markup).toContain('data-markdown-node="h1"');
    expect(markup).toContain('data-markdown-node="p"');
    expect(markup).toContain('data-markdown-node="a"');
    expect(markup).toContain('rel="noreferrer"');
    expect(markup).toContain('target="_blank"');
    expect(markup).toContain('data-markdown-node="blockquote"');
    expect(markup).toContain('data-markdown-node="ul"');
    expect(markup).toContain('data-markdown-node="ol"');
    expect(markup).toContain('data-markdown-node="li"');
    expect(markup).toContain('data-markdown-task-marker="true"');
    expect(markup).toContain('data-checked="true"');
    expect(markup).toContain('data-checked="false"');
    expect(markup).toContain('data-markdown-node="table"');
    expect(markup).toContain('data-markdown-node="hr"');
  });

  it('preserves size, className, style, images, and code fence language', () => {
    const markup = renderMarkdown({
      className: 'consumer-markdown',
      size: 'sm',
      style: { maxWidth: 640 },
      value: [
        '![Alt text](/image.png)',
        '',
        '```mermaid meta value',
        'graph TD',
        '  A --> B',
        '```',
      ].join('\n'),
    });

    expect(markup).toContain('class="');
    expect(markup).toContain('consumer-markdown');
    expect(markup).toContain('data-markdown-size="sm"');
    expect(markup).toContain('max-width:640px');
    expect(markup).toContain('data-markdown-node="img"');
    expect(markup).toContain('alt="Alt text"');
    expect(markup).toContain('data-markdown-node="pre"');
    expect(markup).toContain('data-language="mermaid"');
    expect(markup).toContain('graph TD');
  });

  it('allows consumers to override nodes while keeping MarkdownRender data attributes', () => {
    const components: MarkdownRenderComponents = {
      a: ({ children, ...props }: AnchorHTMLAttributes<HTMLAnchorElement>) =>
        createElement('a', { ...props, 'data-custom-link': 'true' }, children),
      pre: ({ children, ...props }: ComponentPropsWithoutRef<'pre'>) =>
        createElement('pre', { ...props, 'data-custom-code-block': 'true' }, children),
    };

    const markup = renderMarkdown({
      components,
      value: ['[Docs](/docs)', '', '```ts', 'const value = 1;', '```'].join('\n'),
    });

    expect(markup).toContain('data-custom-link="true"');
    expect(markup).toContain('data-custom-code-block="true"');
    expect(markup).toContain('data-markdown-node="a"');
    expect(markup).toContain('data-markdown-node="pre"');
  });

  it('does not render raw HTML as live HTML', () => {
    const markup = renderMarkdown({
      value: '<script>alert("x")</script><span data-dangerous="true">HTML</span>',
    });

    expect(markup).not.toContain('<script>');
    expect(markup).not.toContain('data-dangerous="true"');
    expect(markup).toContain('&lt;script&gt;');
  });
});
````

- [ ] **Step 2: Run the new test to verify it fails**

Run:

```bash
vp test packages/react/src/markdown-render/index.test.tsx
```

Expected: FAIL because `packages/react/src/markdown-render/index.tsx` does not exist.

## Task 3: Implement MarkdownRender Source and Styles

**Files:**

- Create: `packages/react/src/markdown-render/index.tsx`
- Create: `packages/react/src/markdown-render/index.module.less`

- [ ] **Step 1: Create component implementation**

Create `packages/react/src/markdown-render/index.tsx`:

```tsx
import {
  createElement,
  type CSSProperties,
  type ComponentPropsWithoutRef,
  type ReactNode,
} from 'react';
import classNames from 'classnames';
import ReactMarkdown, { type Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';

import { Separator } from '../separator/index.tsx';
import { Text } from '../text/index.tsx';

import styles from './index.module.less';

export const markdownRenderSizeOptions = ['sm', 'md', 'lg'] as const;

export type MarkdownRenderSize = (typeof markdownRenderSizeOptions)[number];
export type MarkdownRenderComponents = Components;

export type MarkdownRenderProps = {
  value: string;
  size?: MarkdownRenderSize;
  components?: MarkdownRenderComponents;
  className?: string;
  style?: CSSProperties;
};

const extractLanguage = (className?: string) => {
  const match = /(?:^|\s)language-([^\s]+)/.exec(className ?? '');

  return match?.[1];
};

const withMarkdownNode = <T extends object>(
  props: T,
  node: string,
): T & { 'data-markdown-node': string } => ({
  ...props,
  'data-markdown-node': node,
});

const MarkdownParagraph = ({ children, ...props }: ComponentPropsWithoutRef<'p'>) => (
  <Text
    {...withMarkdownNode(props, 'p')}
    className={classNames(styles.paragraph, props.className)}
    variant="body"
  >
    {children}
  </Text>
);

const MarkdownHeading1 = ({ children, ...props }: ComponentPropsWithoutRef<'h1'>) => (
  <Text
    {...withMarkdownNode(props, 'h1')}
    className={classNames(styles.heading, props.className)}
    variant="h1"
  >
    {children}
  </Text>
);

const MarkdownHeading2 = ({ children, ...props }: ComponentPropsWithoutRef<'h2'>) => (
  <Text
    {...withMarkdownNode(props, 'h2')}
    className={classNames(styles.heading, props.className)}
    variant="h2"
  >
    {children}
  </Text>
);

const MarkdownHeading3 = ({ children, ...props }: ComponentPropsWithoutRef<'h3'>) => (
  <Text
    {...withMarkdownNode(props, 'h3')}
    className={classNames(styles.heading, props.className)}
    variant="h3"
  >
    {children}
  </Text>
);

const MarkdownHeading4 = ({ children, ...props }: ComponentPropsWithoutRef<'h4'>) => (
  <Text
    {...withMarkdownNode(props, 'h4')}
    className={classNames(styles.heading, props.className)}
    variant="h4"
  >
    {children}
  </Text>
);

const MarkdownHeading5 = ({ children, ...props }: ComponentPropsWithoutRef<'h5'>) => (
  <Text
    {...withMarkdownNode(props, 'h5')}
    className={classNames(styles.heading, props.className)}
    variant="h5"
  >
    {children}
  </Text>
);

const MarkdownHeading6 = ({ children, ...props }: ComponentPropsWithoutRef<'h6'>) => (
  <h6
    {...withMarkdownNode(props, 'h6')}
    className={classNames(styles.heading, styles.heading6, props.className)}
  >
    {children}
  </h6>
);

const MarkdownLink = ({ children, href, target, rel, ...props }: ComponentPropsWithoutRef<'a'>) => {
  const isExternal = typeof href === 'string' && /^https?:\/\//.test(href);
  const resolvedTarget = target ?? (isExternal ? '_blank' : undefined);
  const resolvedRel = rel ?? (isExternal ? 'noreferrer' : undefined);

  return (
    <a
      {...withMarkdownNode(props, 'a')}
      className={classNames(styles.link, props.className)}
      href={href}
      rel={resolvedRel}
      target={resolvedTarget}
    >
      {children}
    </a>
  );
};

const MarkdownImage = ({ alt, ...props }: ComponentPropsWithoutRef<'img'>) => (
  <img
    {...withMarkdownNode(props, 'img')}
    alt={alt ?? ''}
    className={classNames(styles.image, props.className)}
  />
);

const MarkdownBlockquote = ({ children, ...props }: ComponentPropsWithoutRef<'blockquote'>) => (
  <blockquote
    {...withMarkdownNode(props, 'blockquote')}
    className={classNames(styles.blockquote, props.className)}
  >
    {children}
  </blockquote>
);

const MarkdownUl = ({ children, ...props }: ComponentPropsWithoutRef<'ul'>) => (
  <ul
    {...withMarkdownNode(props, 'ul')}
    className={classNames(styles.list, styles.unorderedList, props.className)}
  >
    {children}
  </ul>
);

const MarkdownOl = ({ children, ...props }: ComponentPropsWithoutRef<'ol'>) => (
  <ol
    {...withMarkdownNode(props, 'ol')}
    className={classNames(styles.list, styles.orderedList, props.className)}
  >
    {children}
  </ol>
);

const MarkdownListItem = ({ children, className, ...props }: ComponentPropsWithoutRef<'li'>) => (
  <li {...withMarkdownNode(props, 'li')} className={classNames(styles.listItem, className)}>
    {children}
  </li>
);

const MarkdownTaskMarker = ({ checked, ...props }: ComponentPropsWithoutRef<'input'>) => (
  <span
    {...withMarkdownNode(props, 'task-marker')}
    aria-checked={checked ? 'true' : 'false'}
    aria-readonly="true"
    className={classNames(styles.taskMarker, props.className)}
    data-checked={checked ? 'true' : 'false'}
    data-markdown-task-marker="true"
    role="checkbox"
  >
    <span aria-hidden="true" className={styles.taskMarkerIndicator} />
  </span>
);

const MarkdownCode = ({ children, className, ...props }: ComponentPropsWithoutRef<'code'>) => {
  const language = extractLanguage(className);
  const isBlockCode = language !== undefined;

  return (
    <code
      {...withMarkdownNode(props, 'code')}
      className={classNames(isBlockCode ? styles.code : styles.inlineCode, className)}
      data-language={language}
    >
      {children}
    </code>
  );
};

const MarkdownPre = ({ children, ...props }: ComponentPropsWithoutRef<'pre'>) => {
  const child = Array.isArray(children) ? children[0] : children;
  const childProps =
    typeof child === 'object' && child !== null && 'props' in child
      ? (child.props as { className?: string })
      : undefined;
  const language = extractLanguage(childProps?.className);

  return (
    <pre
      {...withMarkdownNode(props, 'pre')}
      className={classNames(styles.pre, props.className)}
      data-language={language}
    >
      {children}
    </pre>
  );
};

const MarkdownTable = ({ children, ...props }: ComponentPropsWithoutRef<'table'>) => (
  <div className={styles.tableScroller} data-markdown-node="table-wrapper">
    <table
      {...withMarkdownNode(props, 'table')}
      className={classNames(styles.table, props.className)}
    >
      {children}
    </table>
  </div>
);

const MarkdownHr = (props: ComponentPropsWithoutRef<'hr'>) => (
  <Separator
    {...props}
    className={classNames(styles.separator, props.className)}
    data-markdown-node="hr"
  />
);

const markdownNodeNames: Partial<Record<keyof Components, string>> = {
  a: 'a',
  blockquote: 'blockquote',
  code: 'code',
  h1: 'h1',
  h2: 'h2',
  h3: 'h3',
  h4: 'h4',
  h5: 'h5',
  h6: 'h6',
  hr: 'hr',
  img: 'img',
  input: 'task-marker',
  li: 'li',
  ol: 'ol',
  p: 'p',
  pre: 'pre',
  table: 'table',
  ul: 'ul',
};

const defaultComponents: MarkdownRenderComponents = {
  a: MarkdownLink,
  blockquote: MarkdownBlockquote,
  code: MarkdownCode,
  h1: MarkdownHeading1,
  h2: MarkdownHeading2,
  h3: MarkdownHeading3,
  h4: MarkdownHeading4,
  h5: MarkdownHeading5,
  h6: MarkdownHeading6,
  hr: MarkdownHr,
  img: MarkdownImage,
  input: MarkdownTaskMarker,
  li: MarkdownListItem,
  ol: MarkdownOl,
  p: MarkdownParagraph,
  pre: MarkdownPre,
  table: MarkdownTable,
  ul: MarkdownUl,
};

const mergeMarkdownComponents = (
  components?: MarkdownRenderComponents,
): MarkdownRenderComponents => {
  if (components === undefined) {
    return defaultComponents;
  }

  const merged: MarkdownRenderComponents = { ...defaultComponents };

  for (const [name, Component] of Object.entries(components) as [
    keyof Components,
    Components[keyof Components],
  ][]) {
    if (Component === undefined) {
      continue;
    }

    const markdownNodeName = markdownNodeNames[name] ?? String(name);

    merged[name] = ((props: Record<string, unknown>) =>
      createElement(Component as (props: Record<string, unknown>) => ReactNode, {
        ...props,
        'data-markdown-node': markdownNodeName,
      })) as never;
  }

  return merged;
};

export const MarkdownRender = ({
  className,
  components,
  size = 'md',
  style,
  value,
}: MarkdownRenderProps) => (
  <div
    className={classNames(
      styles.root,
      styles[`size${size[0].toUpperCase()}${size.slice(1)}`],
      className,
    )}
    data-markdown-root="true"
    data-markdown-size={size}
    style={style}
  >
    <ReactMarkdown components={mergeMarkdownComponents(components)} remarkPlugins={[remarkGfm]}>
      {value}
    </ReactMarkdown>
  </div>
);

MarkdownRender.displayName = 'MarkdownRender';
```

- [ ] **Step 2: Create token-driven styles**

Create `packages/react/src/markdown-render/index.module.less`:

```less
@import '@deweyou-design/styles/less/bridge';

.root {
  --markdown-block-gap: 0.85rem;
  --markdown-heading-gap: 1.35rem;
  --markdown-inline-code-background: color-mix(in srgb, var(--ui-color-text) 8%, transparent);
  --markdown-muted-border: var(--ui-color-border);

  color: var(--ui-color-text);
  font-family: var(--ui-font-body);
  overflow-wrap: anywhere;
}

.sizeSm {
  --markdown-block-gap: 0.58rem;
  --markdown-heading-gap: 1rem;
}

.sizeMd {
  --markdown-block-gap: 0.85rem;
  --markdown-heading-gap: 1.35rem;
}

.sizeLg {
  --markdown-block-gap: 1.05rem;
  --markdown-heading-gap: 1.65rem;
}

.root > :first-child,
.root :where([data-markdown-node]):first-child {
  margin-block-start: 0;
}

.root > :last-child,
.root :where([data-markdown-node]):last-child {
  margin-block-end: 0;
}

.paragraph {
  margin-block: var(--markdown-block-gap);
}

.heading {
  margin-block-start: var(--markdown-heading-gap);
}

.heading6 {
  margin-block: var(--markdown-heading-gap) 0.35rem;
  color: var(--ui-color-text);
  font-family: var(--ui-font-display);
  font-size: var(--ui-text-size-body);
  font-weight: var(--ui-font-weight-strong);
  line-height: var(--ui-text-line-height-body);
}

.link {
  color: var(--ui-color-brand-bg);
  text-decoration-line: underline;
  text-decoration-thickness: from-font;
  text-underline-offset: 0.16em;
}

.link:hover {
  color: var(--ui-color-brand-bg-hover);
}

.link:focus-visible {
  .focus-ring-offset();
}

.image {
  border-radius: var(--ui-radius-rect);
  display: block;
  height: auto;
  margin-block: var(--markdown-block-gap);
  max-inline-size: 100%;
}

.blockquote {
  border-inline-start: 3px solid var(--ui-color-border-strong);
  color: var(--ui-color-text-muted);
  margin-block: var(--markdown-block-gap);
  margin-inline: 0;
  padding-block: 0.1rem;
  padding-inline-start: 1rem;
}

.list {
  margin-block: var(--markdown-block-gap);
  padding-inline-start: 1.45rem;
}

.list .list {
  margin-block: 0.35rem;
}

.listItem {
  margin-block: 0.25rem;
}

.listItem::marker {
  color: var(--ui-color-text-muted);
}

.taskMarker {
  align-items: center;
  block-size: 1rem;
  border: 1px solid var(--ui-color-border-strong);
  border-radius: var(--ui-radius-rect);
  display: inline-flex;
  inline-size: 1rem;
  justify-content: center;
  margin-inline-end: 0.45rem;
  vertical-align: -0.16em;
}

.taskMarker[data-checked='true'] {
  background: var(--ui-color-brand-bg);
  border-color: var(--ui-color-brand-bg);
}

.taskMarkerIndicator {
  block-size: 0.42rem;
  border-block-end: 0.12rem solid var(--ui-color-text-on-brand);
  border-inline-end: 0.12rem solid var(--ui-color-text-on-brand);
  display: none;
  inline-size: 0.24rem;
  transform: rotate(45deg) translate(-0.02rem, -0.03rem);
}

.taskMarker[data-checked='true'] .taskMarkerIndicator {
  display: block;
}

.pre {
  background: color-mix(in srgb, var(--ui-color-text) 6%, transparent);
  border: 1px solid var(--ui-color-border);
  border-radius: var(--ui-radius-rect);
  margin-block: var(--markdown-block-gap);
  max-inline-size: 100%;
  overflow: auto;
  padding: 0.85rem 1rem;
}

.code,
.inlineCode {
  font-family: var(
    --ui-font-code,
    ui-monospace,
    SFMono-Regular,
    Menlo,
    Monaco,
    Consolas,
    monospace
  );
}

.inlineCode {
  background: var(--markdown-inline-code-background);
  border-radius: var(--ui-radius-rect);
  font-size: 0.92em;
  padding: 0.08em 0.32em;
}

.code {
  background: transparent;
  font-size: 0.88rem;
  line-height: 1.65;
  white-space: pre;
}

.tableScroller {
  margin-block: var(--markdown-block-gap);
  max-inline-size: 100%;
  overflow-x: auto;
}

.table {
  border-collapse: collapse;
  inline-size: 100%;
  min-inline-size: 32rem;
}

.table :where(th, td) {
  border: 1px solid var(--ui-color-border);
  padding: 0.55rem 0.7rem;
  text-align: start;
  vertical-align: top;
}

.table :where(th) {
  background: color-mix(in srgb, var(--ui-color-text) 5%, transparent);
  font-weight: var(--ui-font-weight-strong);
}

.separator {
  margin-block: calc(var(--markdown-block-gap) * 1.4);
}
```

- [ ] **Step 3: Run the colocated test**

Run:

```bash
vp test packages/react/src/markdown-render/index.test.tsx
```

Expected: PASS. If TypeScript or runtime output differs for task list markers, inspect the rendered markup and adjust `MarkdownListItem` to transform disabled task inputs into a read-only marker while preserving list text.

- [ ] **Step 4: Commit component implementation**

Run:

```bash
git add packages/react/src/markdown-render/index.tsx packages/react/src/markdown-render/index.module.less packages/react/src/markdown-render/index.test.tsx
git commit -m "feat(react): add markdown render component"
```

Expected: commit succeeds.

## Task 4: Add Public Exports and Contracts

**Files:**

- Modify: `packages/react/src/index.ts`
- Modify: `packages/react/package.json`
- Modify: `packages/react/tests/package-entrypoint.test.ts`
- Modify: `packages/react/tests/subpath-entrypoint.test.ts`

- [ ] **Step 1: Add root export**

Append this export to `packages/react/src/index.ts`:

```ts
export {
  MarkdownRender,
  markdownRenderSizeOptions,
  type MarkdownRenderComponents,
  type MarkdownRenderProps,
  type MarkdownRenderSize,
} from './markdown-render/index.tsx';
```

- [ ] **Step 2: Add package subpath export**

Add this entry to `packages/react/package.json` exports:

```json
"./markdown-render": {
  "types": "./dist/markdown-render/index.d.ts",
  "import": "./dist/markdown-render/index.js",
  "default": "./dist/markdown-render/index.js"
}
```

- [ ] **Step 3: Update root entrypoint contract**

In `packages/react/tests/package-entrypoint.test.ts`, add a props sample:

```ts
const exampleMarkdownRenderProps: import('../src').MarkdownRenderProps = {
  components: {
    a: ({ children, ...props }) => createElement('a', props, children),
  },
  size: 'md',
  value: '# Title',
};

void exampleMarkdownRenderProps;
```

Add these names to the sorted public exports assertion:

```ts
'MarkdownRender',
'markdownRenderSizeOptions',
```

Extend the render smoke test:

```ts
const markdownMarkup = renderToStaticMarkup(
  createElement(components.MarkdownRender, { value: '# Public markdown' }),
);

expect(markdownMarkup).toContain('data-markdown-root="true"');
expect(markdownMarkup).toContain('Public markdown');
```

- [ ] **Step 4: Update subpath entrypoint contract**

In `packages/react/tests/subpath-entrypoint.test.ts`, add:

```ts
import * as markdownRenderEntry from '../src/markdown-render/index.tsx';
```

Add `./markdown-render` to the package export assertion:

```ts
'./markdown-render': {
  default: './dist/markdown-render/index.js',
  import: './dist/markdown-render/index.js',
  types: './dist/markdown-render/index.d.ts',
},
```

Add root/subpath identity assertions:

```ts
expect(markdownRenderEntry.MarkdownRender).toBe(rootEntry.MarkdownRender);
```

Add public API assertion:

```ts
expect(Object.keys(markdownRenderEntry).sort()).toEqual([
  'MarkdownRender',
  'markdownRenderSizeOptions',
]);
```

- [ ] **Step 5: Run export contract tests**

Run:

```bash
vp test packages/react/tests/package-entrypoint.test.ts packages/react/tests/subpath-entrypoint.test.ts
```

Expected: PASS.

- [ ] **Step 6: Commit public exports**

Run:

```bash
git add packages/react/src/index.ts packages/react/package.json packages/react/tests/package-entrypoint.test.ts packages/react/tests/subpath-entrypoint.test.ts
git commit -m "feat(react): expose markdown render exports"
```

Expected: commit succeeds.

## Task 5: Update Public Docs and Style Contracts

**Files:**

- Modify: `docs/design/components.md`
- Modify: `packages/react/README.md`
- Modify: `packages/react/tests/component-style-contract.test.ts`

- [ ] **Step 1: Update component docs**

In `docs/design/components.md`, add `MarkdownRender` to the import matrix:

```md
| `MarkdownRender` | `@deweyou-design/react` | `@deweyou-design/react/markdown-render` |
```

Add a compact component note:

````md
### MarkdownRender

```tsx
<MarkdownRender value={content} size="md" />
<MarkdownRender value={content} components={{ a: CustomLink, pre: CodeBlock }} />
```

`MarkdownRender` renders CommonMark plus GFM Markdown strings through a safe runtime Markdown path. Use `size` for density, `components` for node replacement, and `className` with `data-markdown-node` selectors for lightweight style overrides. MDX and executable content use a separate rendering boundary.
````

Add `MarkdownRender` to Component Notes as a content rendering primitive.

- [ ] **Step 2: Update package README**

In `packages/react/README.md`, add `MarkdownRender` to core coverage and add:

````md
## MarkdownRender

```tsx
import { MarkdownRender } from '@deweyou-design/react/markdown-render';

<MarkdownRender value={content} size="md" />;
```

`MarkdownRender` supports CommonMark and GFM content with token-aligned defaults. Use `components` to replace nodes such as links and code blocks, and use `className` plus `data-markdown-node` selectors for light visual overrides.
````

- [ ] **Step 3: Extend style contract**

In `packages/react/tests/component-style-contract.test.ts`, add:

```ts
const markdownRenderStylesPath = resolve(reactSourceRoot, 'markdown-render/index.module.less');
```

Add a test:

```ts
test('markdown render styles consume semantic typography and surface tokens', () => {
  const stylesheet = readFileSync(markdownRenderStylesPath, 'utf8');

  expect(stylesheet).toContain('@import');
  expect(stylesheet).toContain('.focus-ring-offset()');
  expect(stylesheet).toContain('--ui-color-text');
  expect(stylesheet).toContain('--ui-color-border');
  expect(stylesheet).toContain('--ui-font-body');
  expect(stylesheet).toContain('--ui-text-size-body');
  expect(stylesheet).toContain('var(--ui-radius-rect)');
  expect(stylesheet).not.toContain('--ui-color-palette-');
});
```

- [ ] **Step 4: Run docs and style contracts**

Run:

```bash
vp test packages/react/tests/component-docs-contract.test.ts packages/react/tests/component-style-contract.test.ts
```

Expected: PASS.

- [ ] **Step 5: Commit docs and style contract**

Run:

```bash
git add docs/design/components.md packages/react/README.md packages/react/tests/component-style-contract.test.ts
git commit -m "docs(react): document markdown render component"
```

Expected: commit succeeds.

## Task 6: Final Verification

**Files:**

- No new source files. Verification only.

- [ ] **Step 1: Run focused React package tests**

Run:

```bash
vp test packages/react/src/markdown-render/index.test.tsx packages/react/tests/package-entrypoint.test.ts packages/react/tests/subpath-entrypoint.test.ts packages/react/tests/component-docs-contract.test.ts packages/react/tests/component-style-contract.test.ts
```

Expected: PASS.

- [ ] **Step 2: Run full check**

Run:

```bash
vp check
```

Expected: PASS.

- [ ] **Step 3: Run full test suite**

Run:

```bash
vp test
```

Expected: PASS.

- [ ] **Step 4: Run full package build**

Run:

```bash
vp run build -r
```

Expected: PASS and `packages/react/dist/markdown-render/index.js` plus `.d.ts` are generated.

- [ ] **Step 5: Inspect final git state**

Run:

```bash
git status --short --branch
```

Expected: clean working tree on the current branch.
