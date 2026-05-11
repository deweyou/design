import { createHash } from 'node:crypto';
import { mkdirSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { readFile, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { dirname, relative, resolve, sep } from 'node:path';

const normalizePath = (path: string) => path.split(sep).join('/');

const sourceFontDir = resolve(import.meta.dirname, '../assets/fonts');
const require = createRequire(import.meta.url);

export const fontSubsetVirtualCssId = 'virtual:deweyou-font-subset.css';

export const sourceHanSerifCnManifest = {
  family: 'Source Han Serif CN Web',
  weights: {
    400: resolve(sourceFontDir, 'SourceHanSerifCN-Regular.otf'),
    500: resolve(sourceFontDir, 'SourceHanSerifCN-Medium.otf'),
    600: resolve(sourceFontDir, 'SourceHanSerifCN-SemiBold.otf'),
    700: resolve(sourceFontDir, 'SourceHanSerifCN-Bold.otf'),
  },
} as const;

export type FontSubsetWeight = keyof typeof sourceHanSerifCnManifest.weights;

export type FontSubsetOptions = {
  family?: typeof sourceHanSerifCnManifest.family;
  weights?: FontSubsetWeight[];
  charset?: string | string[];
  scan?: {
    include: string | string[];
    exclude?: string | string[];
  };
  safelist?: {
    builtin?: boolean;
    chars?: string;
    files?: string | string[];
  };
  blocklist?: {
    chars?: string;
    files?: string | string[];
  };
  output?: {
    fontDir?: string;
    format?: 'woff2';
  };
};

export type FontSubsetInput = {
  charset: string;
  watchFiles: string[];
};

export type FontSubsetAsset = {
  fileName: string;
  weight: FontSubsetWeight;
};

export type FontSubsetResult = {
  assets: FontSubsetAsset[];
  charset: string;
  css: string;
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
  const weights = options.weights ?? [400, 500, 600, 700];
  const fontDir = options.output?.fontDir ?? 'assets/fonts';
  const assets: FontSubsetAsset[] = [];

  if (input.charset.length === 0) {
    throw new Error('Font subset charset is empty.');
  }

  for (const weight of weights) {
    const sourcePath = sourceHanSerifCnManifest.weights[weight];

    if (!sourcePath) {
      throw new Error(`Unsupported Source Han Serif CN weight: ${weight}`);
    }

    const hash = createHash('sha256')
      .update(readFileSync(sourcePath))
      .update(String(weight))
      .update(input.charset)
      .digest('hex')
      .slice(0, 8);
    const fileName = `${fontDir}/source-han-serif-cn-${weight}.subset.${hash}.woff2`;
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
      family: options.family ?? sourceHanSerifCnManifest.family,
    }),
    watchFiles: input.watchFiles,
  };
};
