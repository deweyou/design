import type { MermaidRenderLocaleText } from './types.ts';

const localeText = {
  collapseMindmapBranch: (label) => `${label} のマインドマップ分岐を折りたたむ`,
  expandMindmapBranch: (label) => `${label} のマインドマップ分岐を展開`,
  mindmapDiagram: 'Mermaid マインドマップ',
  renderingDiagram: '図をレンダリングしています…',
  resetZoom: 'ズームをリセット',
  unableToRenderDiagram: '図をレンダリングできません',
  zoomControls: 'Mermaid ズームコントロール',
  zoomIn: '拡大',
  zoomOut: '縮小',
} satisfies MermaidRenderLocaleText;

export default localeText;
