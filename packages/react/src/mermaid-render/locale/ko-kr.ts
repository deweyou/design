import type { MermaidRenderLocaleText } from './types.ts';

const localeText = {
  collapseMindmapBranch: (label) => `${label} 마인드맵 분기 접기`,
  expandMindmapBranch: (label) => `${label} 마인드맵 분기 펼치기`,
  mindmapDiagram: 'Mermaid 마인드맵 다이어그램',
  renderingDiagram: '다이어그램 렌더링 중…',
  resetZoom: '확대/축소 초기화',
  unableToRenderDiagram: '다이어그램을 렌더링할 수 없습니다',
  zoomControls: 'Mermaid 확대/축소 컨트롤',
  zoomIn: '확대',
  zoomOut: '축소',
} satisfies MermaidRenderLocaleText;

export default localeText;
