import { createHash } from 'node:crypto';
import { mkdirSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { readFile, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { dirname, relative, resolve, sep } from 'node:path';

const normalizePath = (path: string) => path.split(sep).join('/');

const sourceFontDir = resolve(import.meta.dirname, '../assets/fonts');
const require = createRequire(import.meta.url);

export const fontSubsetVirtualCssId = 'virtual:deweyou-font-subset.css';
export const fullFontsLoaderVirtualId = 'virtual:deweyou-full-fonts-loader.js';

export const sourceHanSerifCnManifest = {
  source: 'source-han-serif-cn',
  family: 'Source Han Serif CN Web',
  fileNamePrefix: 'source-han-serif-cn',
  displayName: 'Source Han Serif CN',
  version: '2.003R',
  weights: {
    400: resolve(sourceFontDir, 'SourceHanSerifCN-Regular.otf'),
    500: resolve(sourceFontDir, 'SourceHanSerifCN-Medium.otf'),
    600: resolve(sourceFontDir, 'SourceHanSerifCN-SemiBold.otf'),
    700: resolve(sourceFontDir, 'SourceHanSerifCN-Bold.otf'),
  },
} as const;

export const sourceHanSansScManifest = {
  source: 'source-han-sans-sc',
  family: 'Source Han Sans SC Web',
  fileNamePrefix: 'source-han-sans-sc',
  displayName: 'Source Han Sans SC',
  version: '2.005R',
  weights: {
    250: resolve(sourceFontDir, 'SourceHanSansSC-ExtraLight.otf'),
    300: resolve(sourceFontDir, 'SourceHanSansSC-Light.otf'),
    350: resolve(sourceFontDir, 'SourceHanSansSC-Normal.otf'),
    400: resolve(sourceFontDir, 'SourceHanSansSC-Regular.otf'),
    500: resolve(sourceFontDir, 'SourceHanSansSC-Medium.otf'),
    600: resolve(sourceFontDir, 'SourceHanSansSC-Medium.otf'),
    700: resolve(sourceFontDir, 'SourceHanSansSC-Bold.otf'),
    900: resolve(sourceFontDir, 'SourceHanSansSC-Heavy.otf'),
  },
} as const;

export const sourceHanFontManifests = {
  [sourceHanSerifCnManifest.source]: sourceHanSerifCnManifest,
  [sourceHanSansScManifest.source]: sourceHanSansScManifest,
} as const;

export type FontSubsetSourceName = keyof typeof sourceHanFontManifests;
export type FontSubsetWeight =
  | keyof typeof sourceHanSerifCnManifest.weights
  | keyof typeof sourceHanSansScManifest.weights;

export type FontSubsetOptions = {
  /**
   * Font source used to generate the subset.
   *
   * Most apps should leave this unset and use the default content serif source.
   * Use `source-han-sans-sc` only when the subset is for control/UI text.
   */
  source?: FontSubsetSourceName;
  /**
   * CSS font-family name emitted in the generated `@font-face` rules.
   *
   * Leave unset unless you need to bind the subset to a custom family name.
   * Passing `Source Han Sans SC Web` or `Source Han Serif CN Web` also lets the
   * generator infer the matching built-in source.
   */
  family?: string;
  /**
   * Font weights to emit.
   *
   * Defaults to the design-system standard `[400, 500, 600, 700]`. Source Han
   * Sans SC does not ship a dedicated 600 static file, so 600 maps to Medium.
   */
  weights?: FontSubsetWeight[];
  /**
   * Explicit text files whose characters must be included in the subset.
   *
   * Use this for route labels, CMS-provided fixed text, or any copy that cannot
   * be found by source scanning.
   */
  charset?: string | string[];
  /**
   * Source files to scan for literal characters.
   *
   * `include` and `exclude` are project-root-relative glob patterns. Common
   * excludes such as `node_modules`, `.git`, `dist`, `build`, and `coverage`
   * are always applied automatically.
   */
  scan?: {
    /** Project-root-relative files to scan, for example TypeScript and MDX files under `src`. */
    include: string | string[];
    /** Additional project-root-relative files to skip, for example test files. */
    exclude?: string | string[];
  };
  /**
   * Characters that should always be included after scanning.
   *
   * Keep `builtin` enabled unless the app has a very controlled character set;
   * the built-in list includes ASCII letters, numbers, common punctuation, and
   * Chinese punctuation needed by ordinary UI text.
   */
  safelist?: {
    /** Whether to include the built-in Latin, numeric, punctuation, and whitespace set. */
    builtin?: boolean;
    /** Literal characters to force into the subset. */
    chars?: string;
    /** Text files whose characters should be forced into the subset. */
    files?: string | string[];
  };
  /**
   * Characters to remove from the final subset after scanning and safelisting.
   *
   * This is mainly useful for excluding fixture-only test text or unusually
   * large copied content that should fall back to system fonts.
   */
  blocklist?: {
    /** Literal characters to remove from the subset. */
    chars?: string;
    /** Text files whose characters should be removed from the subset. */
    files?: string | string[];
  };
  /**
   * Output options for emitted subset font assets.
   */
  output?: {
    /** Directory inside the final bundle where generated font assets are emitted. */
    fontDir?: string;
    /** Font output format. Currently only `woff2` is supported. */
    format?: 'woff2';
  };
  /**
   * Optional full-font fallback loading strategy.
   *
   * `false` or unset keeps the app subset-only. `'idle'` generates a virtual
   * loader that registers the full vendored font files after the page is idle.
   * `true` is accepted as a shorthand for `'idle'`.
   */
  fullFonts?: false | true | 'idle';
  /**
   * Inject virtual font imports into Vite HTML automatically.
   *
   * Leave this off for libraries, SSR, or multi-entry apps that need explicit
   * control. Set to `true` in simple Vite SPAs to avoid writing the virtual CSS
   * import by hand.
   */
  inject?: boolean;
};

export type FontSubsetInput = {
  charset: string;
  watchFiles: string[];
};

export type FontSubsetAsset = {
  fileName: string;
  weight: FontSubsetWeight;
};

export type FullFontAsset = {
  family: string;
  fileName: string;
  placeholder: string;
  sourcePath: string;
  weight: FontSubsetWeight;
};

export type FontSubsetResult = {
  assets: FontSubsetAsset[];
  charset: string;
  css: string;
  fullFontAssets: FullFontAsset[];
  fullFontLoader: string;
  watchFiles: string[];
};

export type FontSubsetBackendInput = {
  charset: string;
  sourcePath: string;
  targetPath: string;
  weight: FontSubsetWeight;
};

export type CreateFontSubsetOptions = FontSubsetOptions & {
  outputDir: string;
  root: string;
  subsetFont?: (input: FontSubsetBackendInput) => Promise<void>;
};

const builtinSafelist = [
  'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  'abcdefghijklmnopqrstuvwxyz',
  '0123456789',
  '.,:;!?\'"()[]{}<>/\\|+-_*=&@#$%^`~',
  '，。！？；：（）【】《》、·“”‘’￥',
  ' \n\t',
].join('');

const arrayify = <T>(value: T | T[] | undefined): T[] => {
  if (value === undefined) {
    return [];
  }

  return Array.isArray(value) ? value : [value];
};

const escapeRegExp = (value: string) => value.replace(/[|\\{}()[\]^$+?.*]/g, '\\$&');

const expandBraceSegment = (segment: string) => {
  const match = /^(.*)\{([^}]+)\}(.*)$/.exec(segment);

  if (!match) {
    return [segment];
  }

  const [, prefix, body, suffix] = match;
  return body.split(',').map((item) => `${prefix}${item}${suffix}`);
};

const globSegmentToRegExp = (segment: string) => {
  return expandBraceSegment(segment)
    .map((expanded) => {
      return escapeRegExp(expanded).replaceAll('\\*', '[^/]*');
    })
    .join('|');
};

const globToRegExp = (pattern: string) => {
  const segments = normalizePath(pattern).split('/');
  let source = '^';

  for (const [index, segment] of segments.entries()) {
    const isLast = index === segments.length - 1;

    if (segment === '**') {
      source += isLast ? '(?:/.*)?' : '(?:.*/)?';
      continue;
    }

    if (index > 0 && segments[index - 1] !== '**') {
      source += '/';
    }

    source += `(?:${globSegmentToRegExp(segment)})`;
  }

  source += '$';
  return new RegExp(source);
};

const matchesAny = (path: string, patterns: string[]) => {
  return patterns.some((pattern) => globToRegExp(pattern).test(path));
};

const collectFiles = (dir: string): string[] => {
  if (!statSync(dir).isDirectory()) {
    return [dir];
  }

  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const child = resolve(dir, entry.name);
    return entry.isDirectory() ? collectFiles(child) : [child];
  });
};

const readTextFile = (root: string, filePath: string) => {
  return readFileSync(resolve(root, filePath), 'utf8');
};

const addCharacters = (characters: Set<string>, value: string) => {
  for (const character of value) {
    characters.add(character);
  }
};

const normalizeCharacters = (characters: Set<string>) => {
  return [...characters].sort((a, b) => a.codePointAt(0)! - b.codePointAt(0)!).join('');
};

const getDefaultExcludes = (outputDir?: string) => {
  return [
    'node_modules/**',
    '.git/**',
    'dist/**',
    'build/**',
    'coverage/**',
    ...(outputDir ? [normalizePath(outputDir).replace(/\/$/, '') + '/**'] : []),
  ];
};

export const defineFontSubsetOptions = (options: FontSubsetOptions) => options;

const getManifestFromFamily = (family: string | undefined) => {
  return Object.values(sourceHanFontManifests).find((manifest) => manifest.family === family);
};

const resolveFontManifest = (options: Pick<FontSubsetOptions, 'family' | 'source'>) => {
  return (
    (options.source ? sourceHanFontManifests[options.source] : undefined) ??
    getManifestFromFamily(options.family) ??
    sourceHanSerifCnManifest
  );
};

const getStandardWeights = (manifest: ReturnType<typeof resolveFontManifest>) => {
  return [400, 500, 600, 700].filter((weight) => weight in manifest.weights) as FontSubsetWeight[];
};

const createFullFontAssets = (manifest: ReturnType<typeof resolveFontManifest>) => {
  return getStandardWeights(manifest).map((weight) => ({
    family: manifest.family,
    fileName: `assets/fonts/${manifest.fileNamePrefix}-full-${weight}-v${manifest.version}.otf`,
    placeholder: `__DEWEYOU_FULL_FONT_${manifest.fileNamePrefix.replaceAll('-', '_')}_${weight}__`,
    sourcePath: manifest.weights[weight as keyof typeof manifest.weights],
    weight,
  }));
};

export const createFullFontLoader = (assets: FullFontAsset[]) => {
  const descriptors = JSON.stringify(
    assets.map(({ family, placeholder, weight }) => ({
      family,
      url: placeholder,
      weight: String(weight),
    })),
  );

  return [
    `const fullFonts = ${descriptors};`,
    '',
    'const loadFullFonts = async () => {',
    "  if (typeof FontFace === 'undefined' || !document.fonts) {",
    '    return;',
    '  }',
    '',
    '  await Promise.all(',
    '    fullFonts.map(async (font) => {',
    '      const face = new FontFace(',
    '        font.family,',
    '        `url("${font.url}") format("opentype")`,',
    "        { display: 'swap', style: 'normal', weight: font.weight },",
    '      );',
    '',
    '      await face.load();',
    '      document.fonts.add(face);',
    '    }),',
    '  );',
    '};',
    '',
    'const scheduleFullFonts = () => {',
    "  if (typeof requestIdleCallback === 'function') {",
    '    requestIdleCallback(() => void loadFullFonts(), { timeout: 3000 });',
    '    return;',
    '  }',
    '',
    '  setTimeout(() => void loadFullFonts(), 1200);',
    '};',
    '',
    "if (document.readyState === 'loading') {",
    "  document.addEventListener('DOMContentLoaded', scheduleFullFonts, { once: true });",
    '} else {',
    '  scheduleFullFonts();',
    '}',
    '',
    'export { loadFullFonts };',
  ].join('\n');
};

export const createFontSubsetInput = async (
  options: FontSubsetOptions & { root: string },
): Promise<FontSubsetInput> => {
  const characters = new Set<string>();
  const watchFiles = new Set<string>();

  if (options.safelist?.builtin !== false) {
    addCharacters(characters, builtinSafelist);
  }

  for (const file of arrayify(options.charset)) {
    addCharacters(characters, readTextFile(options.root, file));
    watchFiles.add(resolve(options.root, file));
  }

  if (options.scan) {
    const include = arrayify(options.scan.include);
    const exclude = [
      ...getDefaultExcludes(options.output?.fontDir),
      ...arrayify(options.scan.exclude),
    ];
    const files = collectFiles(options.root)
      .map((file) => normalizePath(relative(options.root, file)))
      .filter((file) => matchesAny(file, include) && !matchesAny(file, exclude));

    for (const file of files) {
      addCharacters(characters, readTextFile(options.root, file));
      watchFiles.add(resolve(options.root, file));
    }
  }

  addCharacters(characters, options.safelist?.chars ?? '');

  for (const file of arrayify(options.safelist?.files)) {
    addCharacters(characters, readTextFile(options.root, file));
    watchFiles.add(resolve(options.root, file));
  }

  const blocklistCharacters = new Set<string>();
  addCharacters(blocklistCharacters, options.blocklist?.chars ?? '');

  for (const file of arrayify(options.blocklist?.files)) {
    addCharacters(blocklistCharacters, readTextFile(options.root, file));
    watchFiles.add(resolve(options.root, file));
  }

  for (const character of blocklistCharacters) {
    characters.delete(character);
  }

  return {
    charset: normalizeCharacters(characters),
    watchFiles: [...watchFiles].sort(),
  };
};

export const createFontFaceCss = ({
  assets,
  family = sourceHanSerifCnManifest.family,
}: {
  assets: FontSubsetAsset[];
  family?: string;
}) => {
  return assets
    .map((asset) => {
      return [
        '@font-face {',
        `  font-family: '${family}';`,
        `  src: url('./${asset.fileName}') format('woff2');`,
        '  font-style: normal;',
        `  font-weight: ${asset.weight};`,
        '  font-display: swap;',
        '}',
      ].join('\n');
    })
    .join('\n\n');
};

const createDefaultSubsetFont = async ({
  charset,
  sourcePath,
  targetPath,
}: FontSubsetBackendInput) => {
  const subsetFont = require('subset-font') as (
    originalFont: Buffer,
    text: string,
    options: { targetFormat: 'woff2' },
  ) => Promise<Buffer>;
  const source = await readFile(sourcePath);
  const subset = await subsetFont(source, charset, {
    targetFormat: 'woff2',
  });

  await writeFile(targetPath, subset);
};

export const createFontSubset = async ({
  outputDir,
  root,
  subsetFont = createDefaultSubsetFont,
  ...options
}: CreateFontSubsetOptions): Promise<FontSubsetResult> => {
  const input = await createFontSubsetInput({ ...options, root });
  const manifest = resolveFontManifest(options);
  const weights = options.weights ?? [400, 500, 600, 700];
  const fontDir = options.output?.fontDir ?? 'assets/fonts';
  const assets: FontSubsetAsset[] = [];
  const fullFontAssets = options.fullFonts ? createFullFontAssets(manifest) : [];

  if (input.charset.length === 0) {
    throw new Error('Font subset charset is empty.');
  }

  for (const weight of weights) {
    const sourcePath = manifest.weights[weight as keyof typeof manifest.weights];

    if (!sourcePath) {
      throw new Error(`Unsupported ${manifest.displayName} weight: ${weight}`);
    }

    const hash = createHash('sha256')
      .update(readFileSync(sourcePath))
      .update(String(weight))
      .update(input.charset)
      .digest('hex')
      .slice(0, 8);
    const fileName = `${fontDir}/${manifest.fileNamePrefix}-${weight}.subset.${hash}.woff2`;
    const targetPath = resolve(outputDir, fileName);

    mkdirSync(dirname(targetPath), { recursive: true });
    await subsetFont({
      charset: input.charset,
      sourcePath,
      targetPath,
      weight,
    });

    assets.push({
      fileName,
      weight,
    });
  }

  return {
    assets,
    charset: input.charset,
    css: createFontFaceCss({
      assets,
      family: options.family ?? manifest.family,
    }),
    fullFontAssets,
    fullFontLoader: options.fullFonts
      ? createFullFontLoader(fullFontAssets)
      : 'export const loadFullFonts = async () => {};',
    watchFiles: input.watchFiles,
  };
};
