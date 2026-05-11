import { access, mkdir, readFile, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const packageRoot = resolve(fileURLToPath(new URL('..', import.meta.url)));
const srcRoot = resolve(packageRoot, 'src');
const registryJsonPath = resolve(srcRoot, 'icon-registry/icons.json');
const localAssetRoot = resolve(srcRoot, 'icon-registry/assets');
const outputPath = resolve(srcRoot, 'icons/generated/index.tsx');
const requireFromPackage = createRequire(resolve(packageRoot, 'package.json'));

const tdesignPackageJsonPath = requireFromPackage.resolve('tdesign-icons-svg/package.json');
const tdesignSvgRoot = resolve(dirname(tdesignPackageJsonPath), 'src');

const exportNamePattern = /^[A-Z][A-Za-z0-9]*Icon$/;
const localSourcePathPattern = /^\.\/assets\/[a-z0-9-]+\.svg$/;
const tdesignSourceKeyPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const colorAttributePattern = /\s(fill|stroke)="(?!none|transparent|currentColor)[^"]*"/g;
const ignoredSvgAttributePattern = /\s(?:width|height|xmlns|class)="[^"]*"/g;
const unusedIdAttributePattern = /\sid=(?:"[^"]*"|'[^']*')/g;
const unresolvedClipPathPattern = /\sclip-path="url\(#[-A-Za-z0-9_:.]+\)"/g;

const readJson = async (path) => JSON.parse(await readFile(path, 'utf8'));

const isRecord = (value) => typeof value === 'object' && value !== null && !Array.isArray(value);

const toJsxAttributeName = (name) => {
  if (name === 'class') {
    return 'className';
  }

  if (name.startsWith('aria-') || name.startsWith('data-')) {
    return name;
  }

  return name.replace(/-([a-z])/g, (_, char) => char.toUpperCase());
};

export const normalizeSvgBody = (svg, sourceLabel) => {
  const viewBoxMatch = svg.match(/\s(?:viewBox|view-box)="([^"]+)"/);
  const bodyMatch = svg.match(/<svg\b[^>]*>([\s\S]*?)<\/svg>/);

  if (!viewBoxMatch || !bodyMatch) {
    throw new Error(`Unable to read SVG viewBox or body from ${sourceLabel}.`);
  }

  const rawBody = bodyMatch[1].trim();
  const hasClipPathDefinition = /<clipPath\b/.test(rawBody);
  const bodySource = hasClipPathDefinition
    ? rawBody
    : rawBody.replace(unresolvedClipPathPattern, '');

  if (bodySource.includes('url(#')) {
    throw new Error(`Fragment-referenced SVG ids are not supported yet for ${sourceLabel}.`);
  }

  const body = bodySource
    .replace(ignoredSvgAttributePattern, '')
    .replace(unusedIdAttributePattern, '')
    .replace(colorAttributePattern, (_, attributeName) => ` ${attributeName}="currentColor"`)
    .replace(/\s([a-zA-Z_:][-a-zA-Z0-9_:.]*)=/g, (_, attributeName) => {
      return ` ${toJsxAttributeName(attributeName)}=`;
    });

  if (!body) {
    throw new Error(`SVG body is empty for ${sourceLabel}.`);
  }

  return {
    body,
    viewBox: viewBoxMatch[1],
  };
};

const assertRegistry = (entries) => {
  if (!Array.isArray(entries)) {
    throw new Error('Icon registry must be an array.');
  }

  const seenExports = new Set();

  for (const [index, entry] of entries.entries()) {
    if (!isRecord(entry)) {
      throw new Error(`Icon registry entry ${index} must be an object.`);
    }

    if (!exportNamePattern.test(entry.exportName)) {
      throw new Error(`Invalid icon export name at entry ${index}: ${entry.exportName}`);
    }

    if (seenExports.has(entry.exportName)) {
      throw new Error(`Duplicate icon export name: ${entry.exportName}`);
    }

    seenExports.add(entry.exportName);

    if (entry.source === 'tdesign') {
      if (!tdesignSourceKeyPattern.test(entry.sourceKey)) {
        throw new Error(`Missing or invalid tdesign sourceKey for ${entry.exportName}.`);
      }

      if ('sourcePath' in entry) {
        throw new Error(`TDesign icon ${entry.exportName} must not declare sourcePath.`);
      }

      continue;
    }

    if (entry.source === 'local') {
      if (!localSourcePathPattern.test(entry.sourcePath)) {
        throw new Error(`Missing or invalid local sourcePath for ${entry.exportName}.`);
      }

      if ('sourceKey' in entry) {
        throw new Error(`Local icon ${entry.exportName} must not declare sourceKey.`);
      }

      continue;
    }

    throw new Error(`Unsupported icon source for ${entry.exportName}: ${entry.source}`);
  }
};

const readSvgForEntry = async (entry) => {
  if (entry.source === 'tdesign') {
    const svgPath = resolve(tdesignSvgRoot, `${entry.sourceKey}.svg`);
    await access(svgPath);

    return {
      sourceLabel: `tdesign:${entry.sourceKey}`,
      svg: await readFile(svgPath, 'utf8'),
    };
  }

  const svgPath = resolve(localAssetRoot, entry.sourcePath.slice('./assets/'.length));
  await access(svgPath);

  return {
    sourceLabel: `local:${entry.sourcePath}`,
    svg: await readFile(svgPath, 'utf8'),
  };
};

const renderComponent = async (entry) => {
  const { sourceLabel, svg } = await readSvgForEntry(entry);
  const { body, viewBox } = normalizeSvgBody(svg, sourceLabel);

  return `export const ${entry.exportName} = /* @__PURE__ */ createIcon('${entry.exportName}', {
  viewBox: '${viewBox}',
  body: (
    <>
      ${body}
    </>
  ),
});
`;
};

const generateIcons = async () => {
  const iconRegistry = await readJson(registryJsonPath);
  assertRegistry(iconRegistry);

  const components = await Promise.all(iconRegistry.map(renderComponent));
  const output = `// This file is generated by scripts/generate-icons.mjs.
// Do not edit directly. Update src/icon-registry/icons.json or src/icon-registry/assets/*.svg, then run pnpm run generate-icons.
import { createIcon } from '../../icon-wrapper';

${components.join('\n')}`;

  await mkdir(dirname(outputPath), { recursive: true });
  await writeFile(outputPath, output);
};

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  await generateIcons();
}
