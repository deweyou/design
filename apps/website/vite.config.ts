import { createHash } from 'node:crypto';
import { createRequire } from 'node:module';
import { extname, posix } from 'node:path';
import { fileURLToPath } from 'node:url';

import { defineConfig } from 'vite-plus';
import type { Plugin, ViteDevServer } from 'vite';

const componentsEntry = fileURLToPath(
  new URL('../../packages/react/src/index.ts', import.meta.url),
);
const editorEntry = fileURLToPath(new URL('../../packages/editor/src/index.ts', import.meta.url));
const websiteSourceDir = fileURLToPath(new URL('./src', import.meta.url));
const componentsSourceDir = fileURLToPath(new URL('../../packages/react/src', import.meta.url));
const hooksEntry = fileURLToPath(
  new URL('../../packages/react-hooks/src/index.ts', import.meta.url),
);
const iconsEntry = fileURLToPath(
  new URL('../../packages/react-icons/src/index.ts', import.meta.url),
);
const stylesEntry = fileURLToPath(new URL('../../packages/styles/src/index.ts', import.meta.url));
const stylesCssDir = fileURLToPath(new URL('../../packages/styles/src/css', import.meta.url));
const stylesFontDir = fileURLToPath(
  new URL('../../packages/styles/src/assets/fonts', import.meta.url),
);
const stylesLessBridge = fileURLToPath(
  new URL('../../packages/styles/src/less/bridge.less', import.meta.url),
);
const require = createRequire(import.meta.url);
const subsetFont = require('subset-font') as (
  buffer: Buffer,
  text: string,
  options: { targetFormat: 'woff2' },
) => Promise<Buffer>;

const websiteFontsVirtualId = 'virtual:deweyou-website-fonts.css';
const resolvedWebsiteFontsVirtualId = `\0${websiteFontsVirtualId}`;
const websiteFontsDevPrefix = '/@deweyou-website-fonts';
const websiteFontFallbackCorpus = `
Deweyou Design Component Library Design Manual Overview Components Icons Storybook GitHub Browse Search Copy Copied Import Typography Principles Color Semantics neutral primary danger serif identity line shadow spacing light dark theme
abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789
.,:;!?'"()[]{}<>/@#$%^&*-_+=|\\~\`
`;

type WebsiteFontSource = {
  family: 'Source Han Sans SC Web' | 'Source Han Serif CN Web';
  fileName: string;
  outputFileName: string;
  placeholder: string;
  weight: 400 | 500 | 600 | 700;
};

const websiteFontSources: WebsiteFontSource[] = [
  {
    family: 'Source Han Sans SC Web',
    fileName: 'SourceHanSansSC-Regular.otf',
    outputFileName: 'source-han-sans-sc-web-400.woff2',
    placeholder: 'data:font/woff2;base64,__DEWEYOU_WEBSITE_SANS_FONT_400__',
    weight: 400,
  },
  {
    family: 'Source Han Sans SC Web',
    fileName: 'SourceHanSansSC-Medium.otf',
    outputFileName: 'source-han-sans-sc-web-500.woff2',
    placeholder: 'data:font/woff2;base64,__DEWEYOU_WEBSITE_SANS_FONT_500__',
    weight: 500,
  },
  {
    family: 'Source Han Sans SC Web',
    fileName: 'SourceHanSansSC-Medium.otf',
    outputFileName: 'source-han-sans-sc-web-600.woff2',
    placeholder: 'data:font/woff2;base64,__DEWEYOU_WEBSITE_SANS_FONT_600__',
    weight: 600,
  },
  {
    family: 'Source Han Sans SC Web',
    fileName: 'SourceHanSansSC-Bold.otf',
    outputFileName: 'source-han-sans-sc-web-700.woff2',
    placeholder: 'data:font/woff2;base64,__DEWEYOU_WEBSITE_SANS_FONT_700__',
    weight: 700,
  },
  {
    family: 'Source Han Serif CN Web',
    fileName: 'SourceHanSerifCN-Regular.otf',
    outputFileName: 'source-han-serif-cn-web-400.woff2',
    placeholder: 'data:font/woff2;base64,__DEWEYOU_WEBSITE_SERIF_FONT_400__',
    weight: 400,
  },
  {
    family: 'Source Han Serif CN Web',
    fileName: 'SourceHanSerifCN-Medium.otf',
    outputFileName: 'source-han-serif-cn-web-500.woff2',
    placeholder: 'data:font/woff2;base64,__DEWEYOU_WEBSITE_SERIF_FONT_500__',
    weight: 500,
  },
  {
    family: 'Source Han Serif CN Web',
    fileName: 'SourceHanSerifCN-SemiBold.otf',
    outputFileName: 'source-han-serif-cn-web-600.woff2',
    placeholder: 'data:font/woff2;base64,__DEWEYOU_WEBSITE_SERIF_FONT_600__',
    weight: 600,
  },
  {
    family: 'Source Han Serif CN Web',
    fileName: 'SourceHanSerifCN-Bold.otf',
    outputFileName: 'source-han-serif-cn-web-700.woff2',
    placeholder: 'data:font/woff2;base64,__DEWEYOU_WEBSITE_SERIF_FONT_700__',
    weight: 700,
  },
];

type WebsiteFontAsset = WebsiteFontSource & {
  bytes: Buffer;
};

const collectWebsiteFontText = async () => {
  const { readdir, readFile } = await import('node:fs/promises');
  const sourceExtensions = new Set(['.css', '.json', '.less', '.ts', '.tsx']);
  const texts: string[] = [websiteFontFallbackCorpus];

  const visit = async (directory: string) => {
    const entries = await readdir(directory, { withFileTypes: true });

    for (const entry of entries) {
      const entryPath = `${directory}/${entry.name}`;

      if (entry.isDirectory()) {
        await visit(entryPath);
        continue;
      }

      if (entry.isFile() && sourceExtensions.has(extname(entry.name))) {
        texts.push(await readFile(entryPath, 'utf8'));
      }
    }
  };

  await visit(websiteSourceDir);

  return Array.from(new Set(texts.join('\n'))).join('');
};

const createWebsiteFontCss = (
  assets: readonly WebsiteFontSource[],
  resolveUrl: (asset: WebsiteFontSource) => string,
) =>
  assets
    .map(
      (asset) => `@font-face {
  font-family: '${asset.family}';
  src: url('${resolveUrl(asset)}') format('woff2');
  font-style: normal;
  font-weight: ${asset.weight};
  font-display: swap;
}`,
    )
    .join('\n\n');

const toCssAssetUrl = (cssFileName: string, assetFileName: string) => {
  const relativeUrl = posix.relative(
    posix.dirname(cssFileName),
    assetFileName.split('/').map(encodeURIComponent).join('/'),
  );

  return relativeUrl.startsWith('.') ? relativeUrl : `./${relativeUrl}`;
};

const websiteFontSubsetPlugin = (): Plugin => {
  const watchedFontSourceFiles = websiteFontSources.map(
    (asset) => `${stylesFontDir}/${asset.fileName}`,
  );
  let fontAssetsPromise: Promise<WebsiteFontAsset[]> | undefined;
  let devServer: ViteDevServer | undefined;
  const buildReferenceIds = new Map<string, string>();

  const getFontAssets = async () => {
    fontAssetsPromise ??= (async () => {
      const { readFile } = await import('node:fs/promises');
      const corpus = await collectWebsiteFontText();
      const corpusHash = createHash('sha256').update(corpus).digest('hex').slice(0, 12);

      return Promise.all(
        websiteFontSources.map(async (asset) => {
          const source = await readFile(`${stylesFontDir}/${asset.fileName}`);
          const subset = await subsetFont(source, corpus, { targetFormat: 'woff2' });
          const sourceHash = createHash('sha256').update(source).digest('hex').slice(0, 12);
          const outputFileName = asset.outputFileName.replace(
            '.woff2',
            `-${corpusHash}-${sourceHash}.woff2`,
          );

          return {
            ...asset,
            bytes: subset,
            outputFileName,
          };
        }),
      );
    })();

    return fontAssetsPromise;
  };

  return {
    name: 'deweyou-website-font-subsets',

    resolveId(id) {
      if (id === websiteFontsVirtualId) {
        return resolvedWebsiteFontsVirtualId;
      }

      return null;
    },

    async load(id) {
      if (id !== resolvedWebsiteFontsVirtualId) {
        return null;
      }

      watchedFontSourceFiles.forEach((sourceFile) => this.addWatchFile(sourceFile));

      const assets = await getFontAssets();

      if (devServer) {
        return createWebsiteFontCss(
          assets,
          (asset) => `${websiteFontsDevPrefix}/${asset.outputFileName}`,
        );
      }

      for (const asset of assets) {
        const referenceId = this.emitFile({
          type: 'asset',
          name: asset.outputFileName,
          source: asset.bytes,
        });
        buildReferenceIds.set(asset.placeholder, referenceId);
      }

      return createWebsiteFontCss(assets, (asset) => asset.placeholder);
    },

    configureServer(server) {
      devServer = server;

      server.middlewares.use(async (request, response, next) => {
        const pathname = request.url?.split('?')[0] ?? '';

        if (!pathname.startsWith(`${websiteFontsDevPrefix}/`)) {
          next();
          return;
        }

        try {
          const requestedFileName = pathname.slice(`${websiteFontsDevPrefix}/`.length);
          const assets = await getFontAssets();
          const asset = assets.find(({ outputFileName }) => outputFileName === requestedFileName);

          if (!asset) {
            next();
            return;
          }

          response.setHeader('Content-Type', 'font/woff2');
          response.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
          response.end(asset.bytes);
        } catch (error) {
          next(error);
        }
      });
    },

    handleHotUpdate({ file, server }) {
      if (!file.startsWith(websiteSourceDir) && !file.startsWith(stylesFontDir)) {
        return;
      }

      fontAssetsPromise = undefined;

      const fontCssModule = server.moduleGraph.getModuleById(resolvedWebsiteFontsVirtualId);

      if (fontCssModule) {
        server.moduleGraph.invalidateModule(fontCssModule);
      }

      server.ws.send({
        type: 'full-reload',
        path: '*',
      });

      return [];
    },

    generateBundle(_, bundle) {
      for (const output of Object.values(bundle)) {
        if (output.type !== 'asset' || !output.fileName.endsWith('.css')) {
          continue;
        }

        const source =
          typeof output.source === 'string' ? output.source : Buffer.from(output.source).toString();

        output.source = Array.from(buildReferenceIds.entries()).reduce(
          (currentSource, [placeholder, referenceId]) =>
            currentSource.replaceAll(
              placeholder,
              toCssAssetUrl(output.fileName, this.getFileName(referenceId)),
            ),
          source,
        );
      }
    },
  };
};

export default defineConfig({
  plugins: [websiteFontSubsetPlugin()],
  css: {
    preprocessorOptions: {
      less: {
        additionalData: `@import "${stylesLessBridge}";\n`,
      },
    },
  },
  test: {
    setupFiles: ['src/test-setup.ts'],
  },
  resolve: {
    alias: [
      {
        find: /^@deweyou-design\/editor$/,
        replacement: editorEntry,
      },
      {
        find: /^@deweyou-design\/react\/(.+)$/,
        replacement: `${componentsSourceDir}/$1/index.tsx`,
      },
      {
        find: /^@deweyou-design\/react$/,
        replacement: componentsEntry,
      },
      {
        find: '@deweyou-design/react-icons',
        replacement: iconsEntry,
      },
      {
        find: /^@deweyou-design\/react-hooks$/,
        replacement: hooksEntry,
      },
      {
        find: /^@deweyou-design\/styles\/theme\.css$/,
        replacement: `${stylesCssDir}/theme.css`,
      },
      {
        find: /^@deweyou-design\/styles\/theme-with-fonts\.css$/,
        replacement: `${stylesCssDir}/theme-with-fonts.css`,
      },
      {
        find: /^@deweyou-design\/styles\/theme-light\.css$/,
        replacement: `${stylesCssDir}/theme-light.css`,
      },
      {
        find: /^@deweyou-design\/styles\/theme-dark\.css$/,
        replacement: `${stylesCssDir}/theme-dark.css`,
      },
      {
        find: /^@deweyou-design\/styles\/reset\.css$/,
        replacement: `${stylesCssDir}/reset.css`,
      },
      {
        find: /^@deweyou-design\/styles\/base\.css$/,
        replacement: `${stylesCssDir}/base.css`,
      },
      {
        find: /^@deweyou-design\/styles$/,
        replacement: stylesEntry,
      },
      {
        find: /^@deweyou-ui\/styles\/theme\.css$/,
        replacement: `${stylesCssDir}/theme.css`,
      },
      {
        find: /^@deweyou-ui\/styles$/,
        replacement: stylesEntry,
      },
    ],
  },
});
