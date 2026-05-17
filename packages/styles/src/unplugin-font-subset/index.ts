import { mkdirSync, readFileSync } from 'node:fs';
import { basename, resolve } from 'node:path';

import { createUnplugin } from 'unplugin';

import {
  createFontSubset,
  fontSubsetVirtualCssId,
  fullFontsLoaderVirtualId,
  type CreateFontSubsetOptions,
  type FontSubsetBackendInput,
  type FontSubsetOptions,
  type FontSubsetResult,
} from '../font-subset';

const resolvedVirtualCssId = `\0${fontSubsetVirtualCssId}`;
const resolvedFullFontsLoaderVirtualId = `\0${fullFontsLoaderVirtualId}`;
const fullFontsDevPrefix = '/@deweyou-full-fonts';

type FontSubsetPluginOptions = FontSubsetOptions & {
  /**
   * Temporary directory used while generating subset font files.
   *
   * The plugin later emits those files into the bundler output using
   * `output.fontDir`. Most apps should leave this unset.
   */
  outputDir?: string;
  /**
   * Project root used to resolve `charset`, `scan`, `safelist.files`, and
   * `blocklist.files`.
   *
   * Vite users should leave this unset so the plugin uses Vite's resolved root.
   */
  root?: string;
  /**
   * Test hook for replacing the binary subset backend.
   *
   * Product apps should not pass this. It exists so repository tests can avoid
   * running the real font-subsetting binary in every adapter assertion.
   */
  subsetFont?: (input: FontSubsetBackendInput) => Promise<void>;
};

type PluginState = {
  buildFullFontReferences: Map<string, string>;
  result?: FontSubsetResult;
  root: string;
};

type DevServer = {
  middlewares: {
    use: (
      handler: (
        request: { url?: string },
        response: {
          end: (data?: Buffer | string) => void;
          setHeader: (name: string, value: string) => void;
          statusCode: number;
        },
        next: () => void,
      ) => void,
    ) => void;
  };
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

const replaceFullFontPlaceholders = (
  code: string,
  result: FontSubsetResult,
  getUrl: (asset: FontSubsetResult['fullFontAssets'][number]) => string,
) => {
  return result.fullFontAssets.reduce(
    (currentCode, asset) => currentCode.replaceAll(asset.placeholder, getUrl(asset)),
    code,
  );
};

export const fontSubset = createUnplugin<FontSubsetPluginOptions | undefined>((options = {}) => {
  const state: PluginState = {
    buildFullFontReferences: new Map(),
    root: options.root ?? process.cwd(),
  };
  const fullFonts = options.fullFonts === true ? 'idle' : options.fullFonts;

  return {
    name: 'deweyou-font-subset',
    enforce: 'pre',
    configResolved(config: { root: string }) {
      state.root = options.root ?? config.root;
      state.result = undefined;
      state.buildFullFontReferences.clear();
    },
    resolveId(id) {
      if (id === fontSubsetVirtualCssId) {
        return resolvedVirtualCssId;
      }

      if (id === fullFontsLoaderVirtualId && fullFonts === 'idle') {
        return resolvedFullFontsLoaderVirtualId;
      }

      return undefined;
    },
    async load(id) {
      if (id === resolvedVirtualCssId) {
        const result = await getResult(options, state);
        return result.css;
      }

      if (id === resolvedFullFontsLoaderVirtualId && fullFonts === 'idle') {
        const result = await getResult(options, state);
        return replaceFullFontPlaceholders(
          result.fullFontLoader,
          result,
          (asset) => `${fullFontsDevPrefix}/${basename(asset.fileName)}`,
        );
      }

      return undefined;
    },
    configureServer(server: DevServer) {
      server.middlewares.use((request, response, next) => {
        const path = request.url?.split('?')[0];

        if (!path?.startsWith(`${fullFontsDevPrefix}/`)) {
          next();
          return;
        }

        getResult(options, state)
          .then((result) => {
            const asset = result.fullFontAssets.find(
              (candidate) => basename(candidate.fileName) === basename(path),
            );

            if (!asset) {
              response.statusCode = 404;
              response.end('Font asset not found.');
              return;
            }

            response.setHeader('Content-Type', 'font/otf');
            response.setHeader('Cache-Control', 'no-cache');
            response.end(readFileSync(asset.sourcePath));
          })
          .catch(next);
      });
    },
    transformIndexHtml(html: string) {
      if (!options.inject) {
        return html;
      }

      const imports = [
        `import '${fontSubsetVirtualCssId}';`,
        ...(fullFonts === 'idle' ? [`import '${fullFontsLoaderVirtualId}';`] : []),
      ].join('\n');
      const script = `<script type="module">\n${imports}\n</script>`;

      return html.includes('</head>')
        ? html.replace('</head>', `${script}\n</head>`)
        : script + html;
    },
    async generateBundle(this: {
      addWatchFile: (file: string) => void;
      emitFile: (asset: { fileName: string; source: Buffer; type: 'asset' }) => string | void;
      getFileName?: (referenceId: string) => string;
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

      for (const asset of result.fullFontAssets) {
        const referenceId = this.emitFile({
          fileName: asset.fileName,
          source: readFileSync(asset.sourcePath),
          type: 'asset',
        });

        if (referenceId) {
          state.buildFullFontReferences.set(asset.placeholder, referenceId);
        } else {
          state.buildFullFontReferences.set(asset.placeholder, asset.fileName);
        }
      }
    },
    renderChunk(this: { getFileName?: (referenceId: string) => string }, code: string) {
      if (state.buildFullFontReferences.size === 0) {
        return undefined;
      }

      const getFileName = this.getFileName?.bind(this) as
        | ((referenceId: string) => string)
        | undefined;

      return Array.from(state.buildFullFontReferences.entries()).reduce(
        (currentCode, [placeholder, referenceId]) =>
          currentCode.replaceAll(placeholder, getFileName ? getFileName(referenceId) : referenceId),
        code,
      );
    },
  };
});

export type { FontSubsetPluginOptions };
