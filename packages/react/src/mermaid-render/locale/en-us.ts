import type { MermaidRenderLocaleText } from './types.ts';

const localeText = {
  collapseMindmapBranch: (label) => `Collapse ${label} mindmap branch`,
  expandMindmapBranch: (label) => `Expand ${label} mindmap branch`,
  mindmapDiagram: 'Mermaid mindmap diagram',
  renderingDiagram: 'Rendering diagram...',
  resetZoom: 'Reset zoom',
  unableToRenderDiagram: 'Unable to render diagram',
  zoomControls: 'Mermaid zoom controls',
  zoomIn: 'Zoom in',
  zoomOut: 'Zoom out',
} satisfies MermaidRenderLocaleText;

export default localeText;
