import { mkdirSync, readdirSync, readFileSync, renameSync, rmSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const packageRoot = resolve(import.meta.dirname, '..');
const packageJsonPath = resolve(packageRoot, 'package.json');
const distDir = resolve(packageRoot, 'dist');
const iconsDir = resolve(distDir, 'icons');
const chunksDir = resolve(distDir, 'chunks');
const exportsDir = resolve(packageRoot, 'src/exports');

const iconNames = readdirSync(exportsDir)
  .filter((file) => file.endsWith('.ts'))
  .map((file) => file.replace(/\.ts$/, ''))
  .sort((left, right) => left.localeCompare(right));

rmSync(iconsDir, { force: true, recursive: true });
mkdirSync(iconsDir, { recursive: true });
mkdirSync(chunksDir, { recursive: true });

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
  if (typeof size === 'number') {
    return size;
  }

  return iconSizeMap[size ?? 'medium'];
};

export const renderIcon = ({ className, definition, label, name, size, style }) => {
  const resolvedSize = resolveIconSize(size);

  return jsx('svg', {
    'aria-hidden': label ? undefined : true,
    'aria-label': label,
    className: joinClassName('dy-icon', className),
    'data-icon-name': name,
    fill: 'none',
    focusable: 'false',
    role: label ? 'img' : undefined,
    style: {
      flex: 'none',
      height: resolvedSize,
      width: resolvedSize,
      ...style,
    },
    viewBox: definition.viewBox,
    dangerouslySetInnerHTML: { __html: definition.body },
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

console.log(`Organized ${iconNames.length} icon entry files into dist/icons.`);
