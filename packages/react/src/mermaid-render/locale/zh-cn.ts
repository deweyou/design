import type { MermaidRenderLocaleText } from './types.ts';

const localeText = {
  collapseMindmapBranch: (label) => `折叠 ${label} 思维导图分支`,
  expandMindmapBranch: (label) => `展开 ${label} 思维导图分支`,
  mindmapDiagram: 'Mermaid 思维导图',
  renderingDiagram: '正在渲染图表…',
  resetZoom: '重置缩放',
  unableToRenderDiagram: '无法渲染图表',
  zoomControls: 'Mermaid 缩放控件',
  zoomIn: '放大',
  zoomOut: '缩小',
} satisfies MermaidRenderLocaleText;

export default localeText;
