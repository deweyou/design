import { readdir, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const packageRoot = resolve(fileURLToPath(new URL('..', import.meta.url)));
const registryJsonPath = resolve(packageRoot, 'src/icon-registry/icons.json');
const requireFromPackage = createRequire(resolve(packageRoot, 'package.json'));
const tdesignPackageJsonPath = requireFromPackage.resolve('tdesign-icons-svg/package.json');
const tdesignSvgRoot = resolve(dirname(tdesignPackageJsonPath), 'src');

const publicEntryOverrides = new Map(
  Object.entries({
    browse: {
      exportName: 'EyeIcon',
      category: 'action',
      keywords: ['view', 'visible'],
    },
    'browse-off': {
      exportName: 'EyeOffIcon',
      category: 'action',
      keywords: ['hide', 'invisible'],
    },
    close: {
      exportName: 'XIcon',
      category: 'action',
      keywords: ['close', 'dismiss'],
    },
    delete: {
      exportName: 'TrashIcon',
      category: 'action',
      keywords: ['trash', 'remove'],
    },
    'error-circle': {
      exportName: 'AlertCircleIcon',
      category: 'status',
      keywords: ['alert', 'error', 'circle'],
    },
    'error-triangle': {
      exportName: 'AlertTriangleIcon',
      category: 'status',
      keywords: ['alert', 'warning', 'triangle'],
    },
    'info-circle': {
      exportName: 'InfoIcon',
      category: 'feedback',
      keywords: ['information', 'help'],
    },
    jump: {
      exportName: 'ExternalLinkIcon',
      category: 'action',
      keywords: ['external', 'open'],
    },
    loading: {
      exportName: 'LoadingIcon',
      category: 'feedback',
      keywords: ['loading', 'spinner'],
    },
    menu: {
      exportName: 'MenuIcon',
      category: 'navigation',
      keywords: ['navigation', 'hamburger'],
    },
    notification: {
      exportName: 'BellIcon',
      category: 'feedback',
      keywords: ['bell', 'notice'],
    },
    setting: {
      exportName: 'SettingsIcon',
      category: 'action',
      keywords: ['settings', 'preferences'],
    },
  }),
);

const toPascal = (value) => {
  return value
    .split('-')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join('');
};

const toExportName = (sourceKey) => {
  return publicEntryOverrides.get(sourceKey)?.exportName ?? `${toPascal(sourceKey)}Icon`;
};

const toKeywords = (sourceKey) => {
  return Array.from(new Set(sourceKey.split('-').filter(Boolean)));
};

const syncRegistry = async () => {
  const sourceKeys = (await readdir(tdesignSvgRoot))
    .filter((filename) => filename.endsWith('.svg'))
    .map((filename) => filename.slice(0, -'.svg'.length))
    .sort((first, second) => first.localeCompare(second));

  const entries = sourceKeys.map((sourceKey) => ({
    exportName: toExportName(sourceKey),
    source: 'tdesign',
    sourceKey,
    category: publicEntryOverrides.get(sourceKey)?.category ?? 'content',
    keywords: publicEntryOverrides.get(sourceKey)?.keywords ?? toKeywords(sourceKey),
  }));

  const exportNames = new Set();
  for (const entry of entries) {
    if (exportNames.has(entry.exportName)) {
      throw new Error(`Duplicate generated icon export name: ${entry.exportName}`);
    }

    exportNames.add(entry.exportName);
  }

  await writeFile(registryJsonPath, `${JSON.stringify(entries, null, 2)}\n`);
};

await syncRegistry();
