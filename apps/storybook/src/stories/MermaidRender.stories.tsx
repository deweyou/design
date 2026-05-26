import type { CSSProperties } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { expect, waitFor, within } from 'storybook/test';

import { MermaidRender } from '@deweyou-design/react/mermaid-render';

type MermaidSample = {
  name: string;
  renderer: 'beautiful' | 'mindmap' | 'native';
  value: string;
};

const samples: MermaidSample[] = [
  {
    name: 'Flowchart',
    renderer: 'beautiful',
    value: [
      'flowchart TD',
      '  A[Request] --> B{Validated?}',
      '  B -->|Yes| C[Render with beautiful-mermaid]',
      '  B -->|No| D[Show fallback]',
    ].join('\n'),
  },
  {
    name: 'Sequence',
    renderer: 'beautiful',
    value: [
      'sequenceDiagram',
      '  participant User',
      '  participant MarkdownRender',
      '  participant MermaidRender',
      '  User->>MarkdownRender: fenced code block',
      '  MarkdownRender->>MermaidRender: language=mermaid',
      '  MermaidRender-->>User: SVG diagram',
    ].join('\n'),
  },
  {
    name: 'State',
    renderer: 'beautiful',
    value: [
      'stateDiagram-v2',
      '  [*] --> Loading',
      '  Loading --> Beautiful',
      '  Loading --> Native',
      '  Beautiful --> [*]',
      '  Native --> [*]',
    ].join('\n'),
  },
  {
    name: 'Class',
    renderer: 'beautiful',
    value: [
      'classDiagram',
      '  class MermaidRender {',
      '    +value string',
      '    +render()',
      '  }',
      '  class MindmapRender {',
      '    +layoutTree()',
      '  }',
      '  MermaidRender --> MindmapRender',
    ].join('\n'),
  },
  {
    name: 'ER',
    renderer: 'beautiful',
    value: [
      'erDiagram',
      '  MARKDOWN ||--o{ DIAGRAM : contains',
      '  DIAGRAM ||--|| RENDERER : selects',
      '  RENDERER {',
      '    string type',
      '    string status',
      '  }',
    ].join('\n'),
  },
  {
    name: 'XY Chart',
    renderer: 'beautiful',
    value: [
      'xychart-beta',
      '  title "Renderer coverage"',
      '  x-axis ["Flow", "Mindmap", "Fallback"]',
      '  y-axis "Examples" 0 --> 8',
      '  bar [6, 1, 7]',
    ].join('\n'),
  },
  {
    name: 'Mindmap',
    renderer: 'mindmap',
    value: [
      'mindmap',
      '  root((MermaidRender))',
      '    Beautiful',
      '      Flowchart',
      '      Sequence',
      '      Class',
      '    Mindmap',
      '      Deweyou SVG',
      '      Token aligned',
      '    Fallback',
      '      Native Mermaid',
      '      Error boundary',
    ].join('\n'),
  },
  {
    name: 'Gantt',
    renderer: 'native',
    value: [
      'gantt',
      '  title Diagram delivery',
      '  dateFormat YYYY-MM-DD',
      '  section React',
      '  Renderer :done, 2026-05-20, 2d',
      '  Storybook :active, 2026-05-22, 2d',
    ].join('\n'),
  },
  {
    name: 'Pie',
    renderer: 'native',
    value: [
      'pie title Rendering routes',
      '  "Beautiful" : 6',
      '  "Mindmap" : 1',
      '  "Native" : 8',
    ].join('\n'),
  },
  {
    name: 'Timeline',
    renderer: 'native',
    value: [
      'timeline',
      '  title MermaidRender rollout',
      '  Design : choose routing',
      '  Build : component : storybook',
      '  Verify : tests : screenshots',
    ].join('\n'),
  },
  {
    name: 'GitGraph',
    renderer: 'native',
    value: [
      'gitGraph',
      '  commit id: "spec"',
      '  branch storybook',
      '  checkout storybook',
      '  commit id: "gallery"',
    ].join('\n'),
  },
  {
    name: 'Journey',
    renderer: 'native',
    value: [
      'journey',
      '  title Diagram authoring',
      '  section Markdown',
      '    Write fence: 5: User',
      '    Preview render: 4: User',
    ].join('\n'),
  },
  {
    name: 'Quadrant',
    renderer: 'native',
    value: [
      'quadrantChart',
      '  title Renderer choices',
      '  x-axis Low effort --> High effort',
      '  y-axis Low control --> High control',
      '  Native Mermaid: [0.25, 0.35]',
      '  Mindmap SVG: [0.65, 0.85]',
    ].join('\n'),
  },
  {
    name: 'Requirement',
    renderer: 'native',
    value: [
      'requirementDiagram',
      '  requirement diagram_rendering {',
      '    id: 1',
      '    text: "Diagram blocks render read-only"',
      '    risk: Low',
      '    verifymethod: Test',
      '  }',
    ].join('\n'),
  },
  {
    name: 'Sankey',
    renderer: 'native',
    value: ['sankey-beta', 'Markdown,Beautiful,6', 'Markdown,Mindmap,1', 'Markdown,Native,8'].join(
      '\n',
    ),
  },
  {
    name: 'Block',
    renderer: 'native',
    value: [
      'block-beta',
      '  columns 3',
      '  markdown["Markdown"] mermaid["MermaidRender"] svg["SVG"]',
    ].join('\n'),
  },
  {
    name: 'Packet',
    renderer: 'native',
    value: ['packet-beta', '  0-15: "Diagram Type"', '  16-31: "Renderer"'].join('\n'),
  },
  {
    name: 'Kanban',
    renderer: 'native',
    value: [
      'kanban',
      '  Todo',
      '    [Design]',
      '  Doing',
      '    [MermaidRender]',
      '  Done',
      '    [MarkdownRender extension point]',
    ].join('\n'),
  },
  {
    name: 'Architecture',
    renderer: 'native',
    value: [
      'architecture-beta',
      '  group markdown(cloud)[Markdown]',
      '  service render(server)[MermaidRender] in markdown',
      '  service svg(database)[SVG Output] in markdown',
      '  render:R -- L:svg',
    ].join('\n'),
  },
  {
    name: 'Radar',
    renderer: 'native',
    value: [
      'radar-beta',
      '  axis compatibility, aesthetics, control',
      '  curve route{4, 5, 4}',
    ].join('\n'),
  },
  {
    name: 'Treemap',
    renderer: 'native',
    value: [
      'treemap-beta',
      '  "MermaidRender"',
      '    "Beautiful": 6',
      '    "Mindmap": 1',
      '    "Native": 8',
    ].join('\n'),
  },
];

const galleryStyle: CSSProperties = {
  display: 'grid',
  gap: 24,
  gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
};

const sampleStyle: CSSProperties = {
  display: 'grid',
  gap: 10,
  minWidth: 0,
};

const titleStyle: CSSProperties = {
  color: 'var(--ui-color-text-muted)',
  fontFamily: 'var(--ui-font-sans)',
  fontSize: 12,
  fontWeight: 600,
  margin: 0,
};

const meta = {
  title: 'Components/MermaidRender',
  component: MermaidRender,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'MermaidRender renders read-only Mermaid diagrams with beautiful-mermaid first, a Deweyou SVG mindmap renderer, and native Mermaid fallback.',
      },
    },
    layout: 'padded',
  },
} satisfies Meta<typeof MermaidRender>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    value: samples[0].value,
  },
};

export const Interaction: Story = {
  args: {
    value: samples[0].value,
  },
  render: () => (
    <div data-testid="mermaid-gallery" style={galleryStyle}>
      {samples.map((sample) => (
        <section key={sample.name} data-expected-renderer={sample.renderer} style={sampleStyle}>
          <h3 style={titleStyle}>{sample.name}</h3>
          <MermaidRender value={sample.value} />
        </section>
      ))}
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const gallery = await canvas.findByTestId('mermaid-gallery');

    await waitFor(() => {
      const renderedCount = gallery.querySelectorAll('[data-testid="mermaid-render"]').length;

      if (renderedCount !== samples.length) {
        throw new Error(`Expected ${samples.length} diagrams, received ${renderedCount}`);
      }
    });
    await expect(gallery.querySelectorAll('[data-testid="mermaid-render"]').length).toBe(
      samples.length,
    );

    for (const sample of samples) {
      const section = gallery.querySelector<HTMLElement>(
        `[data-expected-renderer="${sample.renderer}"]`,
      );

      await expect(section).not.toBeNull();
    }
  },
};
