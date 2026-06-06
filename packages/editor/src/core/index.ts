import type { CSSProperties, ReactNode } from 'react';

export type EditorRuntime = {
  kind: string;
  handle: unknown;
};

export type EditorPluginContext = {
  runtime: EditorRuntime;
};

export type EditorPluginSlot = 'before-content' | 'after-content';

export type EditorPlugin = {
  name: string;
  slot: EditorPluginSlot;
  setup: (context: EditorPluginContext) => ReactNode;
};

export type EditorPluginInput = {
  name: string;
  slot?: EditorPluginSlot;
  setup: (context: EditorPluginContext) => ReactNode;
};

export type EditorAdapterInitialStateDetails<TValue> = {
  value: TValue | undefined;
  defaultValue: TValue | undefined;
};

export type EditorAdapterReadDetails = {
  runtime: EditorRuntime;
};

export type EditorAdapterApplyValueDetails<TValue> = {
  runtime: EditorRuntime;
  value: TValue;
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
  disabled?: boolean;
  readOnly?: boolean;
  className?: string;
  style?: CSSProperties;
  onChange?: (details: EditorChangeDetails<TValue>) => void;
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
  name,
  setup,
  slot = 'after-content',
}: EditorPluginInput): EditorPlugin => ({
  name,
  slot,
  setup,
});

export const composeEditorPlugins = (plugins: EditorPlugin[]): EditorPlugin[] => {
  const names = new Set<string>();

  for (const plugin of plugins) {
    if (names.has(plugin.name)) {
      throw new Error(`Editor plugin names must be unique: ${plugin.name}`);
    }

    names.add(plugin.name);
  }

  return plugins;
};

export const createEditorPluginCompatibilityError = (
  details: EditorPluginCompatibilityErrorDetails,
) => new EditorPluginCompatibilityError(details);

export const isEditorPluginCompatibilityError = (
  value: unknown,
): value is EditorPluginCompatibilityError => value instanceof EditorPluginCompatibilityError;
