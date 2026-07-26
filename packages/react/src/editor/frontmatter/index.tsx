import { useEffect, useState, useSyncExternalStore, type ReactElement } from 'react';
import type { MultilineElementTransformer } from '@lexical/markdown';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import {
  $applyNodeReplacement,
  $getNodeByKey,
  DecoratorNode,
  type EditorConfig,
  type LexicalEditor,
  type LexicalNode,
  type NodeKey,
  type SerializedLexicalNode,
  type Spread,
} from 'lexical';

import {
  Frontmatter,
  type FrontmatterChangeDetails,
  type FrontmatterPropertyOptionsMap,
  type FrontmatterPropertyTypeChangeDetails,
  type FrontmatterPropertyTypes,
  type FrontmatterProps,
} from '../../frontmatter/index.js';
import {
  deleteFrontmatterPath,
  parseFrontmatterSource,
  renameFrontmatterKey,
  serializeFrontmatterBlock,
  updateFrontmatterSource,
} from '../../frontmatter/parser.js';

export type FrontmatterEditorOptions = {
  editable?: boolean;
  label?: FrontmatterProps['label'];
  localeText?: FrontmatterProps['localeText'];
  onFrontmatterChange?: (details: FrontmatterChangeDetails) => void;
  propertyOptions?: FrontmatterPropertyOptionsMap;
  propertyTypes?: FrontmatterPropertyTypes;
  onPropertyTypeChange?: (details: FrontmatterPropertyTypeChangeDetails) => void;
  renderValue?: FrontmatterProps['renderValue'];
};

export type SerializedFrontmatterNode = Spread<
  {
    source: string;
  },
  SerializedLexicalNode
>;

type FrontmatterEditorStore = {
  getSnapshot: () => FrontmatterEditorOptions;
  listeners: Set<() => void>;
  options: FrontmatterEditorOptions;
  subscribe: (listener: () => void) => () => void;
};

const defaultFrontmatterEditorOptions: FrontmatterEditorOptions = {};
const editorStores = new WeakMap<LexicalEditor, FrontmatterEditorStore>();

const getEditorStore = (editor: LexicalEditor) => {
  const existingStore = editorStores.get(editor);

  if (existingStore) {
    return existingStore;
  }

  const store: FrontmatterEditorStore = {
    getSnapshot: () => store.options,
    listeners: new Set(),
    options: defaultFrontmatterEditorOptions,
    subscribe: (listener) => {
      store.listeners.add(listener);

      return () => store.listeners.delete(listener);
    },
  };

  editorStores.set(editor, store);
  return store;
};

const setEditorOptions = (editor: LexicalEditor, options: FrontmatterEditorOptions) => {
  const store = getEditorStore(editor);
  store.options = options;
  store.listeners.forEach((listener) => listener());

  return () => {
    if (store.options !== options) {
      return;
    }

    store.options = defaultFrontmatterEditorOptions;
    store.listeners.forEach((listener) => listener());
  };
};

const useFrontmatterEditorOptions = (editor: LexicalEditor) => {
  const store = getEditorStore(editor);

  return useSyncExternalStore(store.subscribe, store.getSnapshot, store.getSnapshot);
};

type FrontmatterNodeViewProps = {
  nodeKey: NodeKey;
  source: string;
};

const FrontmatterNodeView = ({ nodeKey, source }: FrontmatterNodeViewProps) => {
  const [editor] = useLexicalComposerContext();
  const options = useFrontmatterEditorOptions(editor);
  const [isEditorEditable, setIsEditorEditable] = useState(editor.isEditable());
  const parsed = parseFrontmatterSource(source);
  const editable = isEditorEditable && options.editable !== false;

  useEffect(() => editor.registerEditableListener(setIsEditorEditable), [editor]);

  const setSource = (nextSource: string) => {
    editor.update(() => {
      const node = $getNodeByKey(nodeKey);

      if ($isFrontmatterNode(node)) {
        node.setSource(nextSource);
      }
    });
  };
  const handleChange = (details: FrontmatterChangeDetails) => {
    const updated =
      details.action === 'delete'
        ? deleteFrontmatterPath(source, details.path)
        : details.action === 'rename' && details.previousKey
          ? renameFrontmatterKey(source, details.previousKey, details.key)
          : updateFrontmatterSource(source, details.path, details.value);

    if (!updated.error) {
      setSource(updated.source);
      options.onFrontmatterChange?.(details);
    }
  };

  return (
    <Frontmatter
      editable={editable}
      error={parsed.error}
      label={options.label}
      localeText={options.localeText}
      onChange={handleChange}
      onPropertyTypeChange={options.onPropertyTypeChange}
      onSourceChange={setSource}
      propertyOptions={options.propertyOptions}
      propertyTypes={options.propertyTypes}
      renderValue={options.renderValue}
      showSourceToggle
      source={source}
      value={parsed.value}
    />
  );
};

export class FrontmatterNode extends DecoratorNode<ReactElement> {
  __source: string;

  static getType() {
    return 'frontmatter';
  }

  static clone(node: FrontmatterNode) {
    return new FrontmatterNode(node.__source, node.__key);
  }

  static importJSON(serializedNode: SerializedFrontmatterNode) {
    return $createFrontmatterNode(serializedNode.source);
  }

  constructor(source = '', key?: NodeKey) {
    super(key);
    this.__source = source;
  }

  createDOM(_config: EditorConfig) {
    const element = document.createElement('div');
    element.dataset.editorFrontmatterNode = 'true';

    return element;
  }

  updateDOM() {
    return false;
  }

  decorate() {
    return <FrontmatterNodeView nodeKey={this.__key} source={this.getSource()} />;
  }

  exportJSON(): SerializedFrontmatterNode {
    return {
      ...super.exportJSON(),
      source: this.getSource(),
      type: 'frontmatter',
      version: 1,
    };
  }

  getTextContent() {
    return serializeFrontmatterBlock(this.getSource());
  }

  getSource() {
    return this.getLatest().__source;
  }

  setSource(source: string) {
    const writable = this.getWritable();
    writable.__source = source;

    return writable;
  }

  isInline() {
    return false;
  }
}

export const $createFrontmatterNode = (source = '') =>
  $applyNodeReplacement(new FrontmatterNode(source));

export const $isFrontmatterNode = (node: LexicalNode | null | undefined): node is FrontmatterNode =>
  node instanceof FrontmatterNode;

export const FRONTMATTER_TRANSFORMER: MultilineElementTransformer = {
  dependencies: [FrontmatterNode],
  export: (node) => ($isFrontmatterNode(node) ? node.getTextContent() : null),
  handleImportAfterStartMatch: ({ lines, rootNode, startLineIndex }) => {
    if (startLineIndex !== 0 || rootNode.getChildrenSize() !== 0) {
      return null;
    }

    for (let lineIndex = startLineIndex + 1; lineIndex < lines.length; lineIndex += 1) {
      if (/^---[\t ]*$/.test(lines[lineIndex])) {
        rootNode.append(
          $createFrontmatterNode(lines.slice(startLineIndex + 1, lineIndex).join('\n')),
        );

        return [true, lineIndex];
      }
    }

    return null;
  },
  regExpEnd: /^---[\t ]*$/,
  regExpStart: /^---[\t ]*$/,
  replace: () => false,
  type: 'multiline-element',
};

export const FrontmatterEditorRegistration = ({
  options,
}: {
  options: FrontmatterEditorOptions;
}) => {
  const [editor] = useLexicalComposerContext();

  useEffect(() => setEditorOptions(editor, options), [editor, options]);

  return null;
};
