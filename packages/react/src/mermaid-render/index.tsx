import {
  type CSSProperties,
  type KeyboardEvent,
  type PointerEvent,
  type ReactNode,
  type WheelEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import classNames from 'classnames';
import { RefreshIcon, ZoomInIcon, ZoomOutIcon } from '@deweyou-design/react-icons';

import { CodeBlock } from '../code-block/index.tsx';

import styles from './index.module.less';

export type MermaidDiagramType =
  | 'architecture'
  | 'block'
  | 'class'
  | 'er'
  | 'flowchart'
  | 'gantt'
  | 'gitgraph'
  | 'journey'
  | 'kanban'
  | 'mindmap'
  | 'packet'
  | 'pie'
  | 'quadrant'
  | 'radar'
  | 'requirement'
  | 'sankey'
  | 'sequence'
  | 'state'
  | 'timeline'
  | 'treemap'
  | 'unknown'
  | 'xy';

export type MermaidRenderProps = {
  value: string;
  className?: string;
  style?: CSSProperties;
};

export type MindmapRenderProps = MermaidRenderProps;

type MindmapNode = {
  id: string;
  label: string;
  children: MindmapNode[];
};

type PositionedMindmapNode = Omit<MindmapNode, 'children'> & {
  branchIndex: number;
  children: PositionedMindmapNode[];
  depth: number;
  height: number;
  hasChildren: boolean;
  isCollapsed: boolean;
  subtreeHeight: number;
  width: number;
  x: number;
  y: number;
};

type PositionedMindmapEdge = {
  id: string;
  branchIndex: number;
  source: PositionedMindmapNode;
  target: PositionedMindmapNode;
};

const beautifulMermaidTypes = new Set<MermaidDiagramType>([
  'class',
  'er',
  'flowchart',
  'sequence',
  'state',
  'xy',
]);

const branchColorVariableNames = [
  '--mindmap-branch-1',
  '--mindmap-branch-2',
  '--mindmap-branch-3',
  '--mindmap-branch-4',
  '--mindmap-branch-5',
];
const expandedMindmapNodeIds = new Set<string>();
const minZoom = 0.5;
const maxZoom = 2;
const zoomStep = 0.1;

const clampZoom = (value: number) => Math.min(maxZoom, Math.max(minZoom, value));

const formatZoom = (zoom: number) => `${Math.round(zoom * 100)}%`;

const createZoomStyle = (zoom: number) =>
  ({
    '--mermaid-zoom': String(Number(zoom.toFixed(2))),
  }) as CSSProperties;

const createZoomViewportStyle = (
  zoom: number,
  dimensions?: {
    height: number;
    width: number;
  },
) => {
  if (!dimensions) {
    return undefined;
  }

  return {
    '--mermaid-zoom-height': `${Math.ceil(dimensions.height * zoom)}px`,
    '--mermaid-zoom-width': `${Math.ceil(dimensions.width * zoom)}px`,
  } as CSSProperties;
};

const createScrollAreaStyle = (dimensions?: { height: number; width: number }) => {
  if (!dimensions) {
    return undefined;
  }

  return {
    '--mermaid-scroll-height': `${Math.ceil(dimensions.height)}px`,
  } as CSSProperties;
};

export const detectMermaidDiagramType = (value: string): MermaidDiagramType => {
  const header =
    value
      .split('\n')
      .map((line) => line.trim())
      .find((line) => line !== '' && !line.startsWith('%%')) ?? '';
  const keyword = header.split(/\s+/)[0]?.toLowerCase() ?? '';

  if (keyword === 'graph' || keyword === 'flowchart') {
    return 'flowchart';
  }

  if (keyword.startsWith('sequencediagram')) {
    return 'sequence';
  }

  if (keyword.startsWith('statediagram') || keyword === 'state') {
    return 'state';
  }

  if (keyword.startsWith('classdiagram')) {
    return 'class';
  }

  if (keyword.startsWith('erdiagram')) {
    return 'er';
  }

  if (keyword.startsWith('xychart')) {
    return 'xy';
  }

  if (keyword.startsWith('gitgraph')) {
    return 'gitgraph';
  }

  if (keyword.startsWith('quadrantchart')) {
    return 'quadrant';
  }

  if (keyword.startsWith('requirementdiagram')) {
    return 'requirement';
  }

  if (keyword.startsWith('sankey')) {
    return 'sankey';
  }

  if (keyword.startsWith('architecture')) {
    return 'architecture';
  }

  if (keyword.startsWith('block')) {
    return 'block';
  }

  if (keyword.startsWith('packet')) {
    return 'packet';
  }

  if (keyword.startsWith('radar')) {
    return 'radar';
  }

  if (keyword.startsWith('treemap')) {
    return 'treemap';
  }

  if (
    keyword === 'gantt' ||
    keyword === 'journey' ||
    keyword === 'kanban' ||
    keyword === 'mindmap' ||
    keyword === 'pie' ||
    keyword === 'timeline'
  ) {
    return keyword;
  }

  return 'unknown';
};

const createBranchStyle = (branchIndex: number) =>
  ({
    '--mindmap-branch-color': `var(${
      branchColorVariableNames[branchIndex % branchColorVariableNames.length]
    })`,
  }) as CSSProperties;

const normalizeMindmapLabel = (rawLabel: string) => {
  const withoutIcon = rawLabel.replace(/::icon\([^)]*\)/g, '').trim();
  const withoutRoot = withoutIcon.replace(/^root\s*/i, '').trim();
  const withBreaks = withoutRoot.replace(/<br\s*\/?>/gi, '\n').trim();
  const wrappers = [
    /^\(\((.*)\)\)$/,
    /^\[(.*)\]$/,
    /^\((.*)\)$/,
    /^\{\{(.*)\}\}$/,
    /^\)\)(.*)\(\($/,
    /^>(.*)\]$/,
  ];

  for (const wrapper of wrappers) {
    const match = wrapper.exec(withBreaks);

    if (match?.[1]) {
      return match[1].trim();
    }
  }

  return withBreaks;
};

const createMindmapNode = (id: string, label: string): MindmapNode => ({
  children: [],
  id,
  label,
});

const parseMindmap = (value: string): MindmapNode => {
  const lines = value.split('\n');
  const nodeLines = lines
    .map((line, index) => ({
      content: line.trim(),
      indent: line.match(/^\s*/)?.[0].replace(/\t/g, '  ').length ?? 0,
      index,
    }))
    .filter(({ content }) => content !== '' && content !== 'mindmap' && !content.startsWith('%%'));

  if (nodeLines.length === 0) {
    return createMindmapNode('mindmap-root', 'Mindmap');
  }

  const firstLine = nodeLines[0];
  const root = createMindmapNode('mindmap-root', normalizeMindmapLabel(firstLine.content));
  const stack = [{ indent: firstLine.indent, node: root }];

  nodeLines.slice(1).forEach(({ content, indent, index }) => {
    const node = createMindmapNode(`mindmap-node-${index}`, normalizeMindmapLabel(content));

    while (stack.length > 1 && indent <= stack[stack.length - 1].indent) {
      stack.pop();
    }

    const parent = stack[stack.length - 1].node;

    parent.children.push(node);
    stack.push({ indent, node });
  });

  return root;
};

const estimateMindmapNodeSize = (node: MindmapNode, depth: number) => {
  const lines = node.label.split('\n');
  const longestLine = Math.max(...lines.map((line) => line.length), 1);
  const width = Math.min(
    depth === 0 ? 160 : 190,
    Math.max(depth === 0 ? 86 : 64, longestLine * 7 + 26),
  );
  const height = Math.max(28, lines.length * 16 + 12);

  return { height, width };
};

const measureMindmap = (
  node: MindmapNode,
  collapsedNodeIds: ReadonlySet<string>,
  depth = 0,
): PositionedMindmapNode => {
  const { height, width } = estimateMindmapNodeSize(node, depth);
  const hasChildren = node.children.length > 0;
  const isCollapsed = hasChildren && collapsedNodeIds.has(node.id);
  const children = isCollapsed
    ? []
    : node.children.map((child) => measureMindmap(child, collapsedNodeIds, depth + 1));
  const childrenHeight =
    children.length === 0
      ? 0
      : children.reduce((total, child) => total + child.subtreeHeight, 0) +
        Math.max(0, children.length - 1) * 18;
  const subtreeHeight = Math.max(height, childrenHeight);

  return {
    ...node,
    branchIndex: 0,
    children,
    depth,
    height,
    hasChildren,
    isCollapsed,
    subtreeHeight,
    width,
    x: 0,
    y: 0,
  };
};

const positionMindmap = (node: PositionedMindmapNode, x: number, y: number, branchIndex = 0) => {
  node.x = x;
  node.y = y + node.subtreeHeight / 2 - node.height / 2;
  node.branchIndex = branchIndex;

  let childY =
    y +
    (node.subtreeHeight -
      node.children.reduce((total, child) => total + child.subtreeHeight, 0) -
      Math.max(0, node.children.length - 1) * 18) /
      2;

  node.children.forEach((child, index) => {
    positionMindmap(
      child,
      x + node.width + (node.depth === 0 ? 72 : 58),
      childY,
      node.depth === 0 ? index : branchIndex,
    );
    childY += child.subtreeHeight + 18;
  });
};

const flattenMindmapNodes = (node: PositionedMindmapNode): PositionedMindmapNode[] => [
  node,
  ...node.children.flatMap(flattenMindmapNodes),
];

const flattenMindmapEdges = (node: PositionedMindmapNode): PositionedMindmapEdge[] =>
  node.children.flatMap((child) => [
    {
      branchIndex: child.branchIndex,
      id: `${node.id}-${child.id}`,
      source: node,
      target: child,
    },
    ...flattenMindmapEdges(child),
  ]);

const buildMindmapLayout = (value: string, collapsedNodeIds: ReadonlySet<string>) => {
  const root = measureMindmap(parseMindmap(value), collapsedNodeIds);

  positionMindmap(root, 28, 28);

  const nodes = flattenMindmapNodes(root);
  const edges = flattenMindmapEdges(root);
  const width = Math.max(...nodes.map((node) => node.x + node.width)) + 32;
  const height = Math.max(...nodes.map((node) => node.y + node.height)) + 28;

  return { edges, height, nodes, width };
};

const renderNodeText = (label: string, nodeHeight: number) => {
  const lines = label.split('\n');
  const firstLineY = nodeHeight / 2 - ((lines.length - 1) * 16) / 2 + 4;

  return lines.map((line, index) => (
    <tspan key={`${line}-${index}`} x="0" y={firstLineY + index * 16}>
      {line}
    </tspan>
  ));
};

export const MindmapRender = ({ className, style, value }: MindmapRenderProps) => {
  const [collapsedNodeIds, setCollapsedNodeIds] = useState(() => new Set<string>());
  const canvasLayout = useMemo(() => buildMindmapLayout(value, expandedMindmapNodeIds), [value]);
  const layout = useMemo(
    () => buildMindmapLayout(value, collapsedNodeIds),
    [collapsedNodeIds, value],
  );
  const toggleNode = useCallback((nodeId: string) => {
    setCollapsedNodeIds((currentNodeIds) => {
      const nextNodeIds = new Set(currentNodeIds);

      if (nextNodeIds.has(nodeId)) {
        nextNodeIds.delete(nodeId);
      } else {
        nextNodeIds.add(nodeId);
      }

      return nextNodeIds;
    });
  }, []);

  useEffect(() => {
    setCollapsedNodeIds(new Set());
  }, [value]);

  return (
    <MermaidFrame className={className} renderer="mindmap" style={style}>
      <svg
        aria-label="Mermaid mindmap diagram"
        className={styles.mindmapSvg}
        data-mindmap-root="true"
        height={canvasLayout.height}
        role="img"
        viewBox={`0 0 ${canvasLayout.width} ${canvasLayout.height}`}
        width={canvasLayout.width}
      >
        <g data-mindmap-edges="true">
          {layout.edges.map((edge) => {
            const sourceX = edge.source.x + edge.source.width;
            const sourceY = edge.source.y + edge.source.height / 2;
            const targetX = edge.target.x;
            const targetY = edge.target.y + edge.target.height / 2;
            const curve = Math.max(28, (targetX - sourceX) * 0.54);

            return (
              <path
                key={edge.id}
                className={styles.mindmapEdge}
                d={`M ${sourceX} ${sourceY} C ${sourceX + curve} ${sourceY}, ${targetX - curve} ${targetY}, ${targetX} ${targetY}`}
                data-mindmap-edge="true"
                style={createBranchStyle(edge.branchIndex)}
              />
            );
          })}
        </g>
        <g data-mindmap-nodes="true">
          {layout.nodes.map((node) => {
            const isRoot = node.depth === 0;
            const isLeaf = !node.hasChildren;
            const toggleLabel = node.isCollapsed
              ? `Expand ${node.label} mindmap branch`
              : `Collapse ${node.label} mindmap branch`;
            const handleToggleKeyDown = (event: KeyboardEvent<SVGGElement>) => {
              if (event.key !== 'Enter' && event.key !== ' ') {
                return;
              }

              event.preventDefault();
              event.stopPropagation();
              toggleNode(node.id);
            };

            return (
              <g
                key={node.id}
                data-mindmap-node="true"
                data-mindmap-node-depth={node.depth}
                style={createBranchStyle(node.branchIndex)}
                transform={`translate(${node.x} ${node.y})`}
              >
                <rect
                  className={classNames(
                    styles.mindmapNodeBox,
                    isRoot && styles.mindmapRootBox,
                    isLeaf && !isRoot && styles.mindmapLeafBox,
                  )}
                  height={node.height}
                  rx={isRoot ? 5 : 4}
                  width={node.width}
                />
                <text
                  className={classNames(styles.mindmapNodeText, isRoot && styles.mindmapRootText)}
                  dominantBaseline="middle"
                  textAnchor="middle"
                  transform={`translate(${node.width / 2} 0)`}
                >
                  {renderNodeText(node.label, node.height)}
                </text>
                {node.hasChildren && (
                  <g
                    aria-label={toggleLabel}
                    className={styles.mindmapNodeToggle}
                    data-mindmap-node-collapsed={node.isCollapsed ? 'true' : undefined}
                    data-mindmap-node-toggle="true"
                    role="button"
                    tabIndex={0}
                    transform={`translate(${node.width + 10} ${node.height / 2})`}
                    onClick={(event) => {
                      event.stopPropagation();
                      toggleNode(node.id);
                    }}
                    onKeyDown={handleToggleKeyDown}
                    onPointerDown={(event) => {
                      event.stopPropagation();
                    }}
                  >
                    <circle className={styles.mindmapNodeToggleCircle} r="7" />
                    <path className={styles.mindmapNodeToggleMark} d="M -3 0 H 3" />
                    {node.isCollapsed && (
                      <path className={styles.mindmapNodeToggleMark} d="M 0 -3 V 3" />
                    )}
                  </g>
                )}
              </g>
            );
          })}
        </g>
      </svg>
    </MermaidFrame>
  );
};

const MermaidFrame = ({
  children,
  className,
  renderer,
  style,
}: {
  children: ReactNode;
  className?: string;
  renderer: 'beautiful' | 'mindmap' | 'native';
  style?: CSSProperties;
}) => {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const zoomMeasureRef = useRef<HTMLDivElement>(null);
  const gestureStartZoomRef = useRef(1);
  const dragStateRef = useRef<{
    pointerId: number;
    scrollLeft: number;
    scrollTop: number;
    startX: number;
    startY: number;
  } | null>(null);
  const [contentDimensions, setContentDimensions] = useState<{ height: number; width: number }>();
  const [isDragging, setIsDragging] = useState(false);
  const [zoom, setZoom] = useState(1);
  const canZoomOut = zoom > minZoom;
  const canZoomIn = zoom < maxZoom;
  const applyZoomDelta = (deltaY: number) => {
    setZoom((currentZoom) => clampZoom(currentZoom + (deltaY < 0 ? zoomStep : -zoomStep)));
  };

  const handleWheel = (event: WheelEvent<HTMLDivElement>) => {
    if (!event.ctrlKey && !event.metaKey) {
      return;
    }

    event.preventDefault();
    applyZoomDelta(event.deltaY);
  };

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (!event.isPrimary || event.button !== 0) {
      return;
    }

    const scroller = event.currentTarget;

    dragStateRef.current = {
      pointerId: event.pointerId,
      scrollLeft: scroller.scrollLeft,
      scrollTop: scroller.scrollTop,
      startX: event.clientX,
      startY: event.clientY,
    };
    scroller.setPointerCapture(event.pointerId);
    setIsDragging(true);
    event.preventDefault();
  };

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const dragState = dragStateRef.current;

    if (!dragState || dragState.pointerId !== event.pointerId) {
      return;
    }

    event.currentTarget.scrollLeft = dragState.scrollLeft - (event.clientX - dragState.startX);
    event.currentTarget.scrollTop = dragState.scrollTop - (event.clientY - dragState.startY);
    event.preventDefault();
  };

  const stopDragging = (event: PointerEvent<HTMLDivElement>) => {
    const dragState = dragStateRef.current;

    if (!dragState || dragState.pointerId !== event.pointerId) {
      return;
    }

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }

    dragStateRef.current = null;
    setIsDragging(false);
  };

  useEffect(() => {
    const zoomMeasure = zoomMeasureRef.current;

    if (!zoomMeasure) {
      return undefined;
    }

    const updateDimensions = () => {
      const nextDimensions = {
        height: zoomMeasure.scrollHeight,
        width: zoomMeasure.scrollWidth,
      };

      setContentDimensions((currentDimensions) => {
        if (
          currentDimensions?.height === nextDimensions.height &&
          currentDimensions.width === nextDimensions.width
        ) {
          return currentDimensions;
        }

        return nextDimensions;
      });
    };

    updateDimensions();

    if (typeof ResizeObserver === 'undefined') {
      return undefined;
    }

    const resizeObserver = new ResizeObserver((entries) => {
      const contentRect = entries[0]?.contentRect;

      if (!contentRect) {
        updateDimensions();
        return;
      }

      setContentDimensions((currentDimensions) => {
        const nextDimensions = {
          height: contentRect.height,
          width: contentRect.width,
        };

        if (
          currentDimensions?.height === nextDimensions.height &&
          currentDimensions.width === nextDimensions.width
        ) {
          return currentDimensions;
        }

        return nextDimensions;
      });
    });

    resizeObserver.observe(zoomMeasure);

    return () => {
      resizeObserver.disconnect();
    };
  }, [children]);

  useEffect(() => {
    const scroller = scrollerRef.current;

    if (!scroller) {
      return undefined;
    }

    const handleGestureStart = (event: Event) => {
      event.preventDefault();
      gestureStartZoomRef.current = zoom;
    };
    const handleGestureChange = (event: Event) => {
      const gestureEvent = event as Event & { scale?: number };

      if (typeof gestureEvent.scale !== 'number') {
        return;
      }

      event.preventDefault();
      setZoom(clampZoom(gestureStartZoomRef.current * gestureEvent.scale));
    };

    scroller.addEventListener('gesturestart', handleGestureStart);
    scroller.addEventListener('gesturechange', handleGestureChange);

    return () => {
      scroller.removeEventListener('gesturestart', handleGestureStart);
      scroller.removeEventListener('gesturechange', handleGestureChange);
    };
  }, [zoom]);

  return (
    <div
      className={classNames(styles.root, className)}
      data-mermaid-renderer={renderer}
      data-testid="mermaid-render"
      data-zoom-dragging={isDragging ? 'true' : undefined}
      style={style}
    >
      <div className={styles.toolbar} aria-label="Mermaid zoom controls" role="toolbar">
        <button
          aria-label="Zoom out"
          className={styles.toolbarButton}
          disabled={!canZoomOut}
          type="button"
          onClick={() => setZoom((currentZoom) => clampZoom(currentZoom - zoomStep))}
        >
          <ZoomOutIcon aria-hidden size="xs" />
        </button>
        <span className={styles.zoomValue}>{formatZoom(zoom)}</span>
        <button
          aria-label="Zoom in"
          className={styles.toolbarButton}
          disabled={!canZoomIn}
          type="button"
          onClick={() => setZoom((currentZoom) => clampZoom(currentZoom + zoomStep))}
        >
          <ZoomInIcon aria-hidden size="xs" />
        </button>
        <button
          aria-label="Reset zoom"
          className={styles.toolbarButton}
          disabled={zoom === 1}
          type="button"
          onClick={() => setZoom(1)}
        >
          <RefreshIcon aria-hidden size="xs" />
        </button>
      </div>
      <div
        ref={scrollerRef}
        className={styles.scroller}
        data-mermaid-scroll-area="true"
        data-mermaid-scroll-measured={contentDimensions ? 'true' : undefined}
        onPointerCancel={stopDragging}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={stopDragging}
        onWheel={handleWheel}
        style={createScrollAreaStyle(contentDimensions)}
      >
        <div className={styles.surface}>
          <div
            className={styles.zoomViewport}
            data-mermaid-zoom-measured={contentDimensions ? 'true' : undefined}
            style={createZoomViewportStyle(zoom, contentDimensions)}
          >
            <div
              className={styles.zoomContent}
              data-mermaid-zoom-content="true"
              style={createZoomStyle(zoom)}
            >
              <div ref={zoomMeasureRef} className={styles.zoomMeasure}>
                {children}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const NativeMermaidRender = ({ className, style, value }: MermaidRenderProps) => {
  const hostRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string>();
  const [svg, setSvg] = useState('');

  useEffect(() => {
    let isMounted = true;

    const renderDiagram = async () => {
      try {
        setError(undefined);
        const mermaid = (await import('mermaid')).default;

        mermaid.initialize({
          securityLevel: 'strict',
          startOnLoad: false,
          theme: 'default',
        });

        const renderId = `deweyou-mermaid-${Math.random().toString(36).slice(2)}`;
        const rendered = await mermaid.render(renderId, value);

        if (isMounted) {
          setSvg(rendered.svg);
        }
      } catch (renderError) {
        if (isMounted) {
          setError(renderError instanceof Error ? renderError.message : 'Unable to render diagram');
        }
      }
    };

    void renderDiagram();

    return () => {
      isMounted = false;
    };
  }, [value]);

  useEffect(() => {
    if (hostRef.current) {
      hostRef.current.innerHTML = svg;
    }
  }, [svg]);

  return (
    <MermaidFrame className={className} renderer="native" style={style}>
      {error ? (
        <CodeBlock className={styles.error} language="mermaid">
          {`${error}\n\n${value}`}
        </CodeBlock>
      ) : (
        <>
          {svg === '' && <p className={styles.status}>Rendering diagram...</p>}
          <div ref={hostRef} className={styles.svgHost} />
        </>
      )}
    </MermaidFrame>
  );
};

const BeautifulMermaidRender = ({ className, style, value }: MermaidRenderProps) => {
  const [svg, setSvg] = useState('');
  const [shouldUseNative, setShouldUseNative] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const renderDiagram = async () => {
      try {
        const { renderMermaidSVG } = await import('beautiful-mermaid');
        const renderedSvg = renderMermaidSVG(value, {
          accent: 'var(--mermaid-accent)',
          bg: 'var(--mermaid-bg)',
          border: 'var(--mermaid-border)',
          fg: 'var(--mermaid-fg)',
          line: 'var(--mermaid-line)',
          muted: 'var(--mermaid-muted)',
          surface: 'var(--mermaid-surface)',
          transparent: true,
        });

        if (isMounted) {
          setSvg(renderedSvg);
        }
      } catch {
        if (isMounted) {
          setShouldUseNative(true);
        }
      }
    };

    void renderDiagram();

    return () => {
      isMounted = false;
    };
  }, [value]);

  if (shouldUseNative) {
    return <NativeMermaidRender className={className} style={style} value={value} />;
  }

  return (
    <MermaidFrame className={className} renderer="beautiful" style={style}>
      {svg === '' ? (
        <p className={styles.status}>Rendering diagram...</p>
      ) : (
        <div className={styles.svgHost} dangerouslySetInnerHTML={{ __html: svg }} />
      )}
    </MermaidFrame>
  );
};

export const MermaidRender = ({ className, style, value }: MermaidRenderProps) => {
  const diagramType = detectMermaidDiagramType(value);

  if (diagramType === 'mindmap') {
    return <MindmapRender className={className} style={style} value={value} />;
  }

  if (beautifulMermaidTypes.has(diagramType)) {
    return <BeautifulMermaidRender className={className} style={style} value={value} />;
  }

  return <NativeMermaidRender className={className} style={style} value={value} />;
};

MermaidRender.displayName = 'MermaidRender';
MindmapRender.displayName = 'MindmapRender';
