import type { AllHTMLAttributes, CSSProperties, ReactNode } from 'react';

import type { EditorLocaleText } from '../editor/locale/types.ts';

export type EditorRuntime = {
  kind: string;
  handle: unknown;
};

export type EditorPluginContext = {
  runtime: EditorRuntime;
  registry?: EditorPluginRegistry;
};

export type EditorPluginSlot = 'before-content' | 'after-content';

export type EditorFeatureContribution = {
  id: string;
  preset?: boolean;
};

export type EditorCommandContext = {
  runtime: EditorRuntime;
  registry: EditorPluginRegistry;
};

export type EditorCommand<TPayload = unknown> = {
  id: string;
  run: (context: EditorCommandContext, payload?: TPayload) => void | Promise<void>;
  canRun?: (context: EditorCommandContext, payload?: TPayload) => boolean;
};

export type EditorActionStateContext = {
  runtime: EditorRuntime;
  registry: EditorPluginRegistry;
};

export type EditorAction = {
  id: string;
  command: string;
  label: string;
  displayLabel?: string;
  icon?: unknown;
  payload?: unknown;
  group?: string;
  isActive?: (context: EditorActionStateContext) => boolean;
  isVisible?: (context: EditorActionStateContext) => boolean;
  isDisabled?: (context: EditorActionStateContext) => boolean;
};

export type EditorMarkdownShortcutContribution = {
  feature: string;
  transformers: unknown[];
};

export type EditorKeyboardShortcutContribution = {
  id: string;
  key: string;
  command: string;
  payload?: unknown;
};

export type EditorPasteContribution = {
  feature: string;
  handle: (context: EditorCommandContext, event: ClipboardEvent) => boolean;
};

export type EditorPlugin = {
  name: string;
  slot: EditorPluginSlot;
  feature?: EditorFeatureContribution;
  requires?: string[];
  nodes?: unknown[];
  commands?: EditorCommand[];
  toolbarActions?: EditorAction[];
  floatingToolbarActions?: EditorAction[];
  blockToolbarActions?: EditorAction[];
  markdownShortcuts?: EditorMarkdownShortcutContribution[];
  keyboardShortcuts?: EditorKeyboardShortcutContribution[];
  pasteHandlers?: EditorPasteContribution[];
  setup: (context: EditorPluginContext) => ReactNode;
};

export type EditorPluginInput = {
  name: string;
  slot?: EditorPluginSlot;
  feature?: EditorFeatureContribution;
  requires?: string[];
  nodes?: unknown[];
  commands?: EditorCommand[];
  toolbarActions?: EditorAction[];
  floatingToolbarActions?: EditorAction[];
  blockToolbarActions?: EditorAction[];
  markdownShortcuts?: EditorMarkdownShortcutContribution[];
  keyboardShortcuts?: EditorKeyboardShortcutContribution[];
  pasteHandlers?: EditorPasteContribution[];
  setup?: (context: EditorPluginContext) => ReactNode;
};

export type EditorPluginRegistry = {
  plugins: EditorPlugin[];
  features: Map<string, EditorFeatureContribution>;
  nodes: unknown[];
  commands: Map<string, EditorCommand>;
  toolbarActions: EditorAction[];
  floatingToolbarActions: EditorAction[];
  blockToolbarActions: EditorAction[];
  markdownShortcuts: EditorMarkdownShortcutContribution[];
  keyboardShortcuts: EditorKeyboardShortcutContribution[];
  pasteHandlers: EditorPasteContribution[];
};

export type EditorAdapterInitialStateDetails<TValue> = {
  value: TValue | undefined;
  defaultValue: TValue | undefined;
  registry?: EditorPluginRegistry;
};

export type EditorAdapterReadDetails = {
  runtime: EditorRuntime;
  registry?: EditorPluginRegistry;
};

export type EditorAdapterApplyValueDetails<TValue> = {
  runtime: EditorRuntime;
  value: TValue;
  registry?: EditorPluginRegistry;
};

export type EditorAdapter<TValue = unknown> = {
  name: string;
  createInitialState: (details: EditorAdapterInitialStateDetails<TValue>) => unknown;
  readValue: (details: EditorAdapterReadDetails) => TValue;
  applyValue?: (details: EditorAdapterApplyValueDetails<TValue>) => void;
};

export type EditorChangeDetails<TValue = unknown> = {
  value: TValue;
};

export type EditorProps<TValue = unknown> = {
  value?: TValue;
  defaultValue?: TValue;
  adapter: EditorAdapter<TValue>;
  plugins?: EditorPlugin[];
  placeholder?: string;
  localeText?: Partial<EditorLocaleText>;
  autoCapitalize?: AllHTMLAttributes<HTMLDivElement>['autoCapitalize'];
  autoCorrect?: AllHTMLAttributes<HTMLDivElement>['autoCorrect'];
  spellCheck?: AllHTMLAttributes<HTMLDivElement>['spellCheck'];
  disabled?: boolean;
  readOnly?: boolean;
  className?: string;
  style?: CSSProperties;
  onChange?: (details: EditorChangeDetails<TValue>) => void;
};

export type EditorHandle<TValue = unknown> = {
  blur: () => void;
  focus: () => void;
  getValue: () => TValue;
  insertContent: (content: TValue) => void;
  runCommand: <TPayload = unknown>(
    command: string,
    payload?: TPayload,
  ) => void | Promise<void> | undefined;
  setValue: (value: TValue) => void;
};

export type EditorPluginCompatibilityErrorDetails = {
  adapter: string;
  plugin: string;
  reason: string;
};

export class EditorPluginCompatibilityError extends Error {
  recoverable = true;

  constructor({ adapter, plugin, reason }: EditorPluginCompatibilityErrorDetails) {
    super(`Editor adapter "${adapter}" is not compatible with plugin "${plugin}": ${reason}`);
    this.name = 'EditorPluginCompatibilityError';
  }
}

export const createEditorPlugin = ({
  blockToolbarActions = [],
  commands = [],
  feature,
  floatingToolbarActions = [],
  keyboardShortcuts = [],
  markdownShortcuts = [],
  name,
  nodes = [],
  pasteHandlers = [],
  requires = [],
  setup,
  slot = 'after-content',
  toolbarActions = [],
}: EditorPluginInput): EditorPlugin => ({
  blockToolbarActions,
  commands,
  feature,
  floatingToolbarActions,
  keyboardShortcuts,
  markdownShortcuts,
  name,
  nodes,
  pasteHandlers,
  requires,
  slot,
  setup: setup ?? (() => null),
  toolbarActions,
});

const collectActions = (
  actions: EditorAction[],
  actionIds: Set<string>,
  commands: Map<string, EditorCommand>,
) => {
  for (const action of actions) {
    if (actionIds.has(action.id)) {
      throw new Error(`Editor action ids must be unique: ${action.id}`);
    }

    if (!commands.has(action.command)) {
      throw new Error(`Editor action "${action.id}" references unknown command: ${action.command}`);
    }

    actionIds.add(action.id);
  }

  return actions;
};

export const composeEditorPlugins = (plugins: EditorPlugin[]): EditorPluginRegistry => {
  const names = new Set<string>();
  const features = new Map<string, EditorFeatureContribution>();
  const nodes: unknown[] = [];
  const commands = new Map<string, EditorCommand>();
  const toolbarActions: EditorAction[] = [];
  const floatingToolbarActions: EditorAction[] = [];
  const blockToolbarActions: EditorAction[] = [];
  const markdownShortcuts: EditorMarkdownShortcutContribution[] = [];
  const keyboardShortcuts: EditorKeyboardShortcutContribution[] = [];
  const pasteHandlers: EditorPasteContribution[] = [];

  for (const plugin of plugins) {
    if (names.has(plugin.name)) {
      throw new Error(`Editor plugin names must be unique: ${plugin.name}`);
    }

    names.add(plugin.name);

    if (plugin.feature) {
      if (!plugin.feature.preset && features.has(plugin.feature.id)) {
        throw new Error(`Editor feature ids must be unique: ${plugin.feature.id}`);
      }

      features.set(plugin.feature.id, plugin.feature);
    }

    for (const command of plugin.commands ?? []) {
      if (commands.has(command.id)) {
        throw new Error(`Editor command ids must be unique: ${command.id}`);
      }

      commands.set(command.id, command);
    }

    nodes.push(...(plugin.nodes ?? []));
    markdownShortcuts.push(...(plugin.markdownShortcuts ?? []));
    keyboardShortcuts.push(...(plugin.keyboardShortcuts ?? []));
    pasteHandlers.push(...(plugin.pasteHandlers ?? []));
  }

  const toolbarActionIds = new Set<string>();
  const floatingToolbarActionIds = new Set<string>();
  const blockToolbarActionIds = new Set<string>();

  for (const plugin of plugins) {
    for (const requiredFeature of plugin.requires ?? []) {
      if (!features.has(requiredFeature)) {
        throw new Error(
          `Editor plugin "${plugin.name}" requires missing feature: ${requiredFeature}`,
        );
      }
    }

    toolbarActions.push(...collectActions(plugin.toolbarActions ?? [], toolbarActionIds, commands));
    floatingToolbarActions.push(
      ...collectActions(plugin.floatingToolbarActions ?? [], floatingToolbarActionIds, commands),
    );
    blockToolbarActions.push(
      ...collectActions(plugin.blockToolbarActions ?? [], blockToolbarActionIds, commands),
    );

    for (const shortcut of plugin.keyboardShortcuts ?? []) {
      if (!commands.has(shortcut.command)) {
        throw new Error(
          `Editor keyboard shortcut "${shortcut.id}" references unknown command: ${shortcut.command}`,
        );
      }
    }
  }

  return {
    blockToolbarActions,
    commands,
    features,
    floatingToolbarActions,
    keyboardShortcuts,
    markdownShortcuts,
    nodes,
    pasteHandlers,
    plugins,
    toolbarActions,
  };
};

export const createEditorPluginCompatibilityError = (
  details: EditorPluginCompatibilityErrorDetails,
) => new EditorPluginCompatibilityError(details);

export const isEditorPluginCompatibilityError = (
  value: unknown,
): value is EditorPluginCompatibilityError => value instanceof EditorPluginCompatibilityError;
