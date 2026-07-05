import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ComponentType,
  type CSSProperties,
} from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import {
  $getSelection,
  $isRangeSelection,
  COMMAND_PRIORITY_LOW,
  SELECTION_CHANGE_COMMAND,
} from 'lexical';
import classNames from 'classnames';

import { type EditorAction, type EditorPluginRegistry } from '../../core/index.js';
import { createLexicalRuntime } from '../../runtime/lexical.js';
import styles from '../toolbar/index.module.less';

export type EditorActionToolbarProps = {
  actions: EditorAction[];
  actionIds?: string[];
  ariaLabel: string;
  className?: string;
  labels?: Partial<Record<string, string>>;
  normalizeActionId?: (action: string) => string;
  registry: EditorPluginRegistry;
  surface: 'block' | 'floating' | 'toolbar';
  visibleWhenTextSelection?: boolean;
};

type EditorActionToolbarState = {
  activeActions: Set<string>;
  disabledActions: Set<string>;
  floatingPosition?: FloatingToolbarPosition;
  hasTextSelection: boolean;
  visibleActions: Set<string>;
};

type FloatingToolbarPosition = {
  left: number;
  placement: 'above' | 'below';
  top: number;
};

type ActionPayloadPosition = {
  bottom?: number;
  left: number;
  selection?: {
    bottom: number;
    left: number;
    top: number;
  };
  top: number;
};

type ActionPayloadWithPosition = Record<string, unknown> & {
  position?: ActionPayloadPosition;
};

const emptyToolbarState = (): EditorActionToolbarState => ({
  activeActions: new Set(),
  disabledActions: new Set(),
  hasTextSelection: false,
  visibleActions: new Set(),
});

const viewportPadding = 8;

const getActionIcon = (action: EditorAction) =>
  action.icon as ComponentType<{ size?: 'sm' }> | undefined;

const getFloatingToolbarPosition = (
  hasTextSelection: boolean,
): FloatingToolbarPosition | undefined => {
  if (!hasTextSelection || typeof window === 'undefined') {
    return undefined;
  }

  const selection = window.getSelection();

  if (!selection || selection.rangeCount === 0) {
    return undefined;
  }

  const selectedRange = selection.getRangeAt(0);

  if (typeof selectedRange.getBoundingClientRect !== 'function') {
    return undefined;
  }

  const selectionRect = selectedRange.getBoundingClientRect();

  if (selectionRect.width === 0 && selectionRect.height === 0) {
    return undefined;
  }

  const placement = selectionRect.top > 48 ? 'above' : 'below';
  const top =
    placement === 'above'
      ? selectionRect.top - viewportPadding
      : selectionRect.bottom + viewportPadding;
  const left = selectionRect.left + selectionRect.width / 2;

  return {
    left: Math.min(Math.max(left, viewportPadding), window.innerWidth - viewportPadding),
    placement,
    top: Math.max(top, viewportPadding),
  };
};

const getSelectionPosition = () => {
  if (typeof window === 'undefined') {
    return undefined;
  }

  const selection = window.getSelection();

  if (!selection || selection.rangeCount === 0) {
    return undefined;
  }

  const selectedRange = selection.getRangeAt(0);

  if (typeof selectedRange.getBoundingClientRect !== 'function') {
    return undefined;
  }

  const rect = selectedRange.getBoundingClientRect();

  if (rect.width === 0 && rect.height === 0) {
    return undefined;
  }

  return {
    bottom: rect.bottom,
    left: rect.left + rect.width / 2,
    top: rect.top,
  };
};

const getFloatingToolbarStyle = (
  surface: EditorActionToolbarProps['surface'],
  floatingPosition: FloatingToolbarPosition | undefined,
): CSSProperties | undefined => {
  if (surface !== 'floating' || !floatingPosition) {
    return undefined;
  }

  return {
    '--editor-floating-toolbar-left': `${floatingPosition.left}px`,
    '--editor-floating-toolbar-top': `${floatingPosition.top}px`,
  } as CSSProperties;
};

const isActionPayloadWithPosition = (payload: unknown): payload is ActionPayloadWithPosition =>
  typeof payload === 'object' && payload !== null && !Array.isArray(payload);

const getActionPosition = (trigger: HTMLElement) => {
  const root = trigger.closest<HTMLElement>('[data-editor-root]');
  const floatingToolbar =
    trigger.closest<HTMLElement>('[data-editor-toolbar-surface="floating"]') ??
    root?.querySelector<HTMLElement>('[data-editor-toolbar-surface="floating"]');
  const rect = (floatingToolbar ?? trigger).getBoundingClientRect();

  return {
    bottom: rect.bottom,
    left: rect.left + rect.width / 2,
    selection: getSelectionPosition(),
    top: rect.top,
  };
};

export const EditorActionToolbar = ({
  actionIds = [],
  actions,
  ariaLabel,
  className,
  labels = {},
  normalizeActionId = (action) => action,
  registry,
  surface,
  visibleWhenTextSelection = false,
}: EditorActionToolbarProps) => {
  const [editor] = useLexicalComposerContext();
  const [isEditable, setIsEditable] = useState(() => editor.isEditable());
  const [toolbarState, setToolbarState] = useState<EditorActionToolbarState>(emptyToolbarState);
  const runtime = useMemo(() => createLexicalRuntime(editor), [editor]);

  const availableActions = useMemo(() => {
    const actionById = new Map(actions.map((action) => [action.id, action]));

    if (actionIds.length === 0) {
      return actions;
    }

    return actionIds
      .map((action) => actionById.get(normalizeActionId(action)))
      .filter((action): action is EditorAction => Boolean(action));
  }, [actionIds, actions, normalizeActionId]);

  const updateActionState = useCallback(() => {
    const context = { registry, runtime };
    const activeActions = new Set<string>();
    const disabledActions = new Set<string>();
    const visibleActions = new Set<string>();
    const selection = $getSelection();
    const hasTextSelection = $isRangeSelection(selection) && !selection.isCollapsed();
    const floatingPosition =
      surface === 'floating' ? getFloatingToolbarPosition(hasTextSelection) : undefined;

    for (const action of availableActions) {
      const command = registry.commands.get(action.command);

      if (action.isVisible?.(context) === false) {
        continue;
      }

      visibleActions.add(action.id);

      if (action.isActive?.(context)) {
        activeActions.add(action.id);
      }

      if (
        !command ||
        action.isDisabled?.(context) ||
        command.canRun?.(context, action.payload) === false
      ) {
        disabledActions.add(action.id);
      }
    }

    setToolbarState({
      activeActions,
      disabledActions,
      floatingPosition,
      hasTextSelection,
      visibleActions,
    });
  }, [availableActions, registry, runtime, surface]);

  useEffect(() => {
    return editor.registerEditableListener(setIsEditable);
  }, [editor]);

  useEffect(() => {
    editor.getEditorState().read(updateActionState);

    return editor.registerUpdateListener(({ editorState }) => {
      editorState.read(updateActionState);
    });
  }, [editor, updateActionState]);

  useEffect(() => {
    return editor.registerCommand(
      SELECTION_CHANGE_COMMAND,
      () => {
        editor.getEditorState().read(updateActionState);
        return false;
      },
      COMMAND_PRIORITY_LOW,
    );
  }, [editor, updateActionState]);

  const getActionPayload = (action: EditorAction, trigger: HTMLElement) => {
    if (!isActionPayloadWithPosition(action.payload)) {
      return action.payload;
    }

    return {
      ...action.payload,
      position: action.payload.position ?? getActionPosition(trigger),
    };
  };

  const dispatchAction = (action: EditorAction, trigger: HTMLElement) => {
    const command = registry.commands.get(action.command);

    void command?.run({ registry, runtime }, getActionPayload(action, trigger));
  };

  const visibleActions = availableActions.filter((action) =>
    toolbarState.visibleActions.has(action.id),
  );

  if (visibleActions.length === 0 || (visibleWhenTextSelection && !toolbarState.hasTextSelection)) {
    return null;
  }

  return (
    <div
      aria-label={ariaLabel}
      className={classNames(styles.toolbar, className)}
      data-editor-toolbar={surface === 'toolbar' ? 'true' : undefined}
      data-editor-floating-placement={toolbarState.floatingPosition?.placement}
      data-editor-toolbar-surface={surface}
      role="toolbar"
      style={getFloatingToolbarStyle(surface, toolbarState.floatingPosition)}
    >
      {visibleActions.map((action) => {
        const Icon = getActionIcon(action);
        const labelOverride = labels[action.id] ?? labels[action.command];
        const label = labelOverride ?? action.label;
        const visualLabel = labelOverride ?? action.displayLabel ?? label;
        const isActive = toolbarState.activeActions.has(action.id);
        const isDisabled = !isEditable || toolbarState.disabledActions.has(action.id);

        return (
          <button
            aria-label={label}
            aria-pressed={action.isActive ? isActive : undefined}
            className={styles.button}
            data-active={isActive ? 'true' : undefined}
            data-editor-action-kind={Icon ? 'icon' : 'text'}
            disabled={isDisabled}
            key={action.id}
            onPointerDown={(event) => event.preventDefault()}
            onMouseDown={(event) => event.preventDefault()}
            onClick={(event) => dispatchAction(action, event.currentTarget)}
            title={label}
            type="button"
          >
            {Icon ? <Icon size="sm" /> : <span className={styles.textGlyph}>{visualLabel}</span>}
          </button>
        );
      })}
    </div>
  );
};
