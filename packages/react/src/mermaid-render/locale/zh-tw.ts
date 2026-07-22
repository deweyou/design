import type { MermaidRenderLocaleText } from './types.ts';

const localeText = {
  collapseMindmapBranch: (label) => `收合 ${label} 心智圖分支`,
  expandMindmapBranch: (label) => `展開 ${label} 心智圖分支`,
  mindmapDiagram: 'Mermaid 心智圖',
  renderingDiagram: '正在繪製圖表…',
  resetZoom: '重設縮放',
  unableToRenderDiagram: '無法繪製圖表',
  zoomControls: 'Mermaid 縮放控制',
  zoomIn: '放大',
  zoomOut: '縮小',
} satisfies MermaidRenderLocaleText;

export default localeText;
