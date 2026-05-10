import type { Meta, StoryObj } from '@storybook/react';
import { expect, within } from 'storybook/test';

import { MarkdownRender, markdownRenderSizeOptions } from '@deweyou-design/react/markdown-render';

const comprehensiveMarkdown = [
  '# Building a Markdown Renderer',
  '',
  'A production markdown surface needs to feel comfortable in long-form articles, compact LLM messages, release notes, and copied issue comments. It should support [external links](https://example.com/docs), **strong emphasis**, *emphasis*, ***combined emphasis***, ~~deleted text~~, and `inline code` without changing the surrounding rhythm.',
  '',
  'Inline punctuation should remain readable around `code()`, **bold text**, _emphasis_, and ~~strike-through notes~~ even when they appear in the same sentence.',
  '',
  '---',
  '',
  '## Heading Scale',
  '',
  'The page title above is the H1. The following headings show the remaining default scale.',
  '',
  '### H3 Section Heading',
  '',
  'H3 is used for major subsections inside an article or a longer assistant answer.',
  '',
  '#### H4 Detail Heading',
  '',
  'H4 is useful for grouped details under a section.',
  '',
  '##### H5 Compact Heading',
  '',
  'H5 is reserved for compact nested labels or dense documentation blocks.',
  '',
  '## Rendering Goals',
  '',
  '> The renderer should make common Markdown readable by default, while keeping extension points open for code blocks, custom links, and future rich preview surfaces.',
  '>',
  '> - Quotes can contain unordered lists.',
  '>   - Nested quote list items should keep their indentation.',
  '> - Quotes can also contain ordered lists:',
  '>   1. Capture the user intent.',
  '>   2. Preserve semantic structure.',
  '>',
  '> ```tsx',
  '> const QuotedExample = () => <MarkdownRender value={quotedMarkdown} />;',
  '> ```',
  '',
  'The component keeps Markdown parsing separate from MDX execution. Consumers can still replace specific nodes through `components`, but the default path stays safe for untrusted text.',
  '',
  '### Checklist With Sub Todos',
  '',
  '- [x] Publish package',
  '- [x] Preserve paragraph semantics',
  '- [ ] Verify dense message layouts',
  '  - [x] Cover short assistant replies',
  '  - [ ] Cover long generated plans',
  '    - [ ] Keep third-level sub todos aligned',
  '- [ ] Add optional diagram renderer later',
  '',
  '### Nested Mixed Lists',
  '',
  '- Token-aligned typography',
  '- Stable `data-markdown-node` selectors',
  '  - Nested unordered item',
  '  - Another nested item',
  '    - Third-level unordered detail',
  '- A parent item followed by ordered steps',
  '  1. First nested ordered step',
  '  2. Second nested ordered step',
  '     1. Deep ordered detail',
  '     2. Another deep ordered detail',
  '',
  '1. Parse Markdown',
  '2. Merge default node components',
  '   - Keep local overrides predictable',
  '   - Keep default tags semantic',
  '3. Render safe React output',
  '',
  '### Long List',
  '',
  '1. Headings',
  '2. Paragraphs',
  '3. Links',
  '4. Inline marks',
  '5. Blockquotes',
  '6. Ordered lists',
  '7. Unordered lists',
  '8. Task lists',
  '9. Tables',
  '10. Horizontal rules',
  '11. Code fences',
  '12. Images',
  '13. Long cells',
  '14. Empty lines',
  '15. Dense issue comments',
  '',
  '### Code',
  '',
  '```ts',
  'type MarkdownSurface = {',
  '  id: string;',
  '  kind: "article" | "message" | "preview";',
  '  density: "sm" | "md" | "lg";',
  '  author?: { name: string; role: "writer" | "assistant" | "reviewer" };',
  '};',
  '',
  'const renderMessage = (value: string) => {',
  '  return <MarkdownRender value={value} size="sm" />;',
  '};',
  '',
  'const surfaces: MarkdownSurface[] = [',
  '  { id: "blog-introduction", kind: "article", density: "lg", author: { name: "Design", role: "writer" } },',
  '  { id: "assistant-response", kind: "message", density: "sm", author: { name: "LLM", role: "assistant" } },',
  '  { id: "editor-preview", kind: "preview", density: "md", author: { name: "Reviewer", role: "reviewer" } },',
  '];',
  '',
  'const rendered = surfaces.map((surface) => {',
  '  const label = `${surface.kind}:${surface.id}:${surface.density}:${surface.author?.name ?? "unknown"}`;',
  '  return {',
  '    ...surface,',
  '    label,',
  '    preview: renderMessage(`This deliberately long line checks horizontal overflow in the code block: ${label} -> ${"x".repeat(160)}`),',
  '  };',
  '});',
  '',
  'console.log(rendered);',
  '```',
  '',
  '```json',
  '{',
  '  "component": "MarkdownRender",',
  '  "features": ["gfm", "code", "tables", "images"],',
  '  "safeByDefault": true',
  '}',
  '```',
  '',
  '```',
  'fenced code without a language still renders as a block',
  '',
  'It can include blank lines and indentation:',
  '  markdown-render --size md',
  '```',
  '',
  '### Wide Data Table',
  '',
  '| Area | Status | Owner | Surface | Priority | Last checked | Notes | Very long detail | Expected overflow behavior | Follow-up |',
  '| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |',
  '| Markdown | Ready | Design system | Blog article | High | 2026-05-10 | CommonMark plus GFM syntax | Long cells should wrap or scroll without breaking the page layout or hiding adjacent content. | Table should create horizontal overflow when the viewport is narrow. | Keep semantic tags. |',
  '| GFM task list | Read-only marker | React package | LLM message | High | 2026-05-10 | Nested task markers are rendered as static indicators | A task item can contain follow-up text, inline `code`, and emphasis without losing its marker. | Header should stay visible while scrolling table rows. | Align with checkbox style. |',
  '| Future blocks | Custom renderer | Consumers | Rich preview | Medium | 2026-05-10 | Replace selected nodes through `components` | Custom renderers should stay opt-in so normal Markdown remains simple. | Consumers can override max height with CSS variables. | Keep MDX separate. |',
  '| Tables | Stress case | Storybook | QA surface | High | 2026-05-10 | Wide columns and several rows | This row exists to make the table wider than a short card and expose overflow behavior in preview surfaces. | Horizontal scrollbar should appear instead of squeezing all columns. | Add sticky table head. |',
  '| Images | Visual media | Docs | Article body | Low | 2026-05-10 | Remote placeholder image | Image alt text and intrinsic media sizing should remain visible in constrained containers. | Media should not overflow the root. | Keep max width. |',
  '| Code | Highlighting | Runtime | Developer docs | High | 2026-05-10 | Language and plain fences | Highlighted code and unlabelled code blocks should both render as block content. | Long code should scroll horizontally and vertically. | Keep language tag compact. |',
  '| Lists | Nesting | Content authors | Release notes | Medium | 2026-05-10 | Mixed ordered, unordered, and task lists | Deep nesting should not collapse marker spacing or make text unreadable. | Lists should render naturally without their own scrollbar. | Reduce todo indent. |',
  '',
  '![Decorative placeholder](https://placehold.co/960x320?text=Markdown+Render)',
  '',
  '---',
  '',
  'The same renderer can power a blog preview, a chat message, or a future editor preview layer without giving each surface a separate Markdown implementation.',
].join('\n');

const meta = {
  title: 'Components/MarkdownRender',
  component: MarkdownRender,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
  argTypes: {
    size: {
      control: { type: 'select' },
      options: markdownRenderSizeOptions,
      table: { defaultValue: { summary: 'md' } },
    },
  },
} satisfies Meta<typeof MarkdownRender>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    value: comprehensiveMarkdown,
    size: 'md',
  },
};

export const Sizes: Story = {
  args: {
    value: comprehensiveMarkdown,
  },
  render: () => (
    <div style={{ display: 'grid', gap: '24px', maxWidth: '720px' }}>
      {markdownRenderSizeOptions.map((size) => (
        <MarkdownRender key={size} value={comprehensiveMarkdown} size={size} />
      ))}
    </div>
  ),
};

export const Interaction: Story = {
  args: {
    value: comprehensiveMarkdown,
  },
  render: () => (
    <div data-testid="markdown-story">
      <MarkdownRender value={comprehensiveMarkdown} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(
      canvas.getByRole('heading', { name: 'Building a Markdown Renderer' }),
    ).toBeInTheDocument();
    await expect(canvas.getByRole('heading', { name: 'Heading Scale' })).toBeInTheDocument();
    await expect(canvas.getByRole('heading', { name: 'H3 Section Heading' })).toBeInTheDocument();
    await expect(canvas.getByRole('heading', { name: 'H4 Detail Heading' })).toBeInTheDocument();
    await expect(canvas.getByRole('heading', { name: 'H5 Compact Heading' })).toBeInTheDocument();
    await expect(canvas.getByText(/production markdown surface/)).toBeVisible();
    await expect(canvas.getByRole('link', { name: 'external links' })).toHaveAttribute(
      'target',
      '_blank',
    );

    const story = canvas.getByTestId('markdown-story');
    const root = story.querySelector('[data-markdown-root="true"]');
    await expect(root).toBeInTheDocument();
    await expect(root).toHaveAttribute('data-markdown-size', 'md');

    const paragraph = story.querySelector('[data-markdown-node="p"]');
    await expect(paragraph?.tagName.toLowerCase()).toBe('p');

    const checkedTask = story.querySelector(
      '[data-markdown-task-marker="true"][data-checked="true"]',
    );
    await expect(checkedTask).toBeInTheDocument();

    const uncheckedTask = story.querySelector(
      '[data-markdown-task-marker="true"][data-checked="false"]',
    );
    await expect(uncheckedTask).toBeInTheDocument();

    await expect(story.querySelector('[data-markdown-node="hr"]')).toBeInTheDocument();
    await expect(story.querySelector('[data-markdown-node="blockquote"]')).toBeInTheDocument();
    await expect(canvas.getByText('Keep third-level sub todos aligned')).toBeVisible();
    await expect(canvas.getByText('Deep ordered detail')).toBeVisible();
    await expect(canvas.getByText('Wide Data Table')).toBeVisible();
    await expect(canvas.getByText(/Long cells should wrap or scroll/)).toBeVisible();
    await expect(story.querySelector('[data-markdown-node="pre"]')).toBeInTheDocument();
    await expect(
      story.querySelector('[data-markdown-code-language-label="true"]'),
    ).toBeInTheDocument();
    await expect(story.querySelector('.hljs-keyword')).toBeInTheDocument();
    await expect(
      story.querySelector('[data-testid="markdown-code-scroll-area"]'),
    ).toBeInTheDocument();
    const tableWrapper = story.querySelector<HTMLElement>('[data-markdown-node="table-wrapper"]');
    await expect(tableWrapper).toBeInTheDocument();
    const tableScrollArea = story.querySelector<HTMLElement>(
      '[data-testid="markdown-table-scroll-area"]',
    );
    await expect(tableScrollArea).toBeInTheDocument();
    const tableViewport = tableScrollArea?.querySelector<HTMLElement>('[data-part="viewport"]');
    await expect(tableViewport).toBeInTheDocument();
    await expect(story.querySelector('[data-markdown-node="table"]')).toBeInTheDocument();
    await expect(tableViewport?.scrollWidth ?? 0).toBeGreaterThan(tableViewport?.clientWidth ?? 0);
    await expect(story.querySelector('[data-markdown-node="img"]')).toBeInTheDocument();
  },
};
