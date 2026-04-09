import {
  cpSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  renameSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { resolve } from 'node:path';

import { writePublishedManifest } from '../../infra/scripts/write-published-manifest.mjs';

const packageRoot = resolve(import.meta.dirname, '..');
const packageJsonPath = resolve(packageRoot, 'package.json');
const distDir = resolve(packageRoot, 'dist');
const iconsDir = resolve(distDir, 'icons');
const chunksDir = resolve(distDir, 'chunks');
const distSourceDir = resolve(distDir, 'src');
const exportsDir = resolve(packageRoot, 'src/exports');

const iconNames = readdirSync(exportsDir)
  .filter((file) => file.endsWith('.ts'))
  .map((file) => file.replace(/\.ts$/, ''))
  .sort((left, right) => left.localeCompare(right));

rmSync(iconsDir, { force: true, recursive: true });
rmSync(distSourceDir, { force: true, recursive: true });
mkdirSync(iconsDir, { recursive: true });
mkdirSync(chunksDir, { recursive: true });
cpSync(resolve(packageRoot, 'src'), distSourceDir, { recursive: true });

const rootMjsFiles = readdirSync(distDir).filter((file) => file.endsWith('.mjs'));
const existingChunkFiles = readdirSync(chunksDir).filter((file) => file.endsWith('.mjs'));
const chunkFiles = rootMjsFiles.filter((file) => file !== 'index.mjs');

for (const file of chunkFiles) {
  renameSync(resolve(distDir, file), resolve(chunksDir, file));
}

const organizedChunkFiles = chunkFiles.length > 0 ? chunkFiles : existingChunkFiles;

const indexPath = resolve(distDir, 'index.mjs');
const indexSource = readFileSync(indexPath, 'utf8').replaceAll('import("./', 'import("./chunks/');
writeFileSync(indexPath, indexSource);

const escapeRegExp = (value) => {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

const toPascalCase = (value) => {
  const parts = value.split(/[^a-zA-Z0-9]+/).filter(Boolean);
  const pascal = parts.map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join('');

  if (!/^[A-Za-z]/.test(pascal)) {
    return `Icon${pascal}`;
  }

  return pascal;
};

const toCamelCase = (value) => {
  const pascal = toPascalCase(value);

  return pascal.charAt(0).toLowerCase() + pascal.slice(1);
};

const sharedSource = `import { jsx } from 'react/jsx-runtime';

const iconSizeMap = {
  'extra-small': 12,
  small: 14,
  medium: 16,
  large: 20,
  'extra-large': 24,
};

const joinClassName = (...parts) => {
  return parts.filter(Boolean).join(' ');
};

const resolveIconSize = (size) => {
  if (size === undefined) {
    return '1em';
  }

  if (typeof size === 'number') {
    return size;
  }

  return iconSizeMap[size];
};

const resolveIconViewBox = (viewBox) => {
  const parts = viewBox.trim().split(/\\s+/).map(Number);

  if (parts.length !== 4 || parts.some((value) => Number.isNaN(value))) {
    return viewBox;
  }

  const [x, y, width, height] = parts;

  if (width === height) {
    return viewBox;
  }

  const squareSize = Math.max(width, height);
  const nextX = x - (squareSize - width) / 2;
  const nextY = y - (squareSize - height) / 2;

  return \`\${nextX} \${nextY} \${squareSize} \${squareSize}\`;
};

const createIconWrapperStyle = (resolvedSize, style) => {
  return {
    alignItems: 'center',
    display: 'inline-flex',
    flex: 'none',
    height: resolvedSize,
    justifyContent: 'center',
    lineHeight: 0,
    verticalAlign: 'middle',
    width: resolvedSize,
    ...style,
  };
};

export const renderIcon = ({ className, definition, label, name, size, style }) => {
  const resolvedSize = resolveIconSize(size);
  const resolvedViewBox = resolveIconViewBox(definition.viewBox);

  return jsx('span', {
    'aria-hidden': label ? undefined : true,
    'aria-label': label,
    className: joinClassName('dy-icon', className),
    'data-icon-name': name,
    role: label ? 'img' : undefined,
    style: createIconWrapperStyle(resolvedSize, style),
    children: jsx('svg', {
      'aria-hidden': true,
      dangerouslySetInnerHTML: { __html: definition.body },
      fill: 'none',
      focusable: 'false',
      style: {
        display: 'block',
        height: '100%',
        width: '100%',
      },
      viewBox: resolvedViewBox,
    }),
  });
};
`;

writeFileSync(resolve(iconsDir, 'shared.mjs'), sharedSource);

for (const iconName of iconNames) {
  const chunkFile = organizedChunkFiles.find((file) =>
    new RegExp(`^${escapeRegExp(iconName)}-[^.]+\\.mjs$`).test(file),
  );

  if (!chunkFile) {
    throw new Error(`Missing built chunk for icon "${iconName}".`);
  }

  const componentName = `${toPascalCase(iconName)}Icon`;
  const definitionName = `${toCamelCase(iconName)}IconDefinition`;
  const wrapperSource = `import { renderIcon } from './shared.mjs';
import { ${definitionName} } from '../chunks/${chunkFile}';

const ${componentName} = (props) => {
  return renderIcon({ ...props, definition: ${definitionName}, name: ${JSON.stringify(iconName)} });
};

${componentName}.displayName = ${JSON.stringify(componentName)};

export { ${componentName}, ${definitionName} };
`;
  writeFileSync(resolve(iconsDir, `${iconName}.mjs`), wrapperSource);
}

const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'));

packageJson.exports = {
  '.': {
    types: './src/index.ts',
    import: './dist/index.mjs',
    default: './dist/index.mjs',
  },
  './package.json': './package.json',
  ...Object.fromEntries(
    iconNames.map((iconName) => [
      `./${iconName}`,
      {
        types: `./src/exports/${iconName}.ts`,
        import: `./dist/icons/${iconName}.mjs`,
        default: `./dist/icons/${iconName}.mjs`,
      },
    ]),
  ),
};

writeFileSync(packageJsonPath, `${JSON.stringify(packageJson, null, 2)}\n`);
writePublishedManifest(packageRoot);

console.log(`Organized ${iconNames.length} icon entry files into dist/icons.`);
