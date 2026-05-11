import { mkdirSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { createUnplugin } from 'unplugin';

import {
  createFontSubset,
  fontSubsetVirtualCssId,
  type CreateFontSubsetOptions,
  type FontSubsetBackendInput,
  type FontSubsetOptions,
  type FontSubsetResult,
} from '../font-subset';

const resolvedVirtualCssId = `\0${fontSubsetVirtualCssId}`;

type FontSubsetPluginOptions = FontSubsetOptions & {
  outputDir?: string;
  root?: string;
  subsetFont?: (input: FontSubsetBackendInput) => Promise<void>;
};

type PluginState = {
  result?: FontSubsetResult;
  root: string;
};

const createSubsetOptions = (
  options: FontSubsetPluginOptions,
  state: PluginState,
): CreateFontSubsetOptions => {
  const outputDir = options.outputDir ?? resolve(state.root, '.deweyou-font-subset');

  mkdirSync(outputDir, { recursive: true });

  return {
    ...options,
    outputDir,
    root: state.root,
  };
};

const getResult = async (options: FontSubsetPluginOptions, state: PluginState) => {
  state.result ??= await createFontSubset(createSubsetOptions(options, state));
  return state.result;
};

export const fontSubset = createUnplugin<FontSubsetPluginOptions | undefined>((options = {}) => {
  const state: PluginState = {
    root: options.root ?? process.cwd(),
  };

  return {
    name: 'deweyou-font-subset',
    enforce: 'pre',
    configResolved(config: { root: string }) {
      state.root = options.root ?? config.root;
      state.result = undefined;
    },
    resolveId(id) {
      if (id === fontSubsetVirtualCssId) {
        return resolvedVirtualCssId;
      }

      return undefined;
    },
    async load(id) {
      if (id !== resolvedVirtualCssId) {
        return undefined;
      }

      const result = await getResult(options, state);
      return result.css;
    },
    async generateBundle(this: {
      addWatchFile: (file: string) => void;
      emitFile: (asset: { fileName: string; source: Buffer; type: 'asset' }) => void;
    }) {
      const result = await getResult(options, state);

      for (const file of result.watchFiles) {
        this.addWatchFile(file);
      }

      for (const asset of result.assets) {
        this.emitFile({
          fileName: asset.fileName,
          source: readFileSync(
            resolve(
              options.outputDir ?? resolve(state.root, '.deweyou-font-subset'),
              asset.fileName,
            ),
          ),
          type: 'asset',
        });
      }
    },
  };
});

export type { FontSubsetPluginOptions };
