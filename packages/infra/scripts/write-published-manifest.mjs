import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const workspaceRoot = resolve(import.meta.dirname, '../../..');
const hostInstalledReactPackages = ['react', 'react-dom'];
const manifestDependencyFields = ['dependencies', 'peerDependencies', 'optionalDependencies'];

const readJson = (filePath) => {
  return JSON.parse(readFileSync(filePath, 'utf8'));
};

const isCatalogSpecifier = (specifier) => {
  return specifier === 'catalog:' || specifier.startsWith('catalog:');
};

const isWorkspaceSpecifier = (specifier) => {
  return specifier.startsWith('workspace:');
};

const rewritePublishedManifestPath = (value) => {
  if (value === './dist') {
    return '.';
  }

  if (value.startsWith('./dist/')) {
    return `./${value.slice('./dist/'.length)}`;
  }

  return value;
};

const rewritePublishedManifestValue = (value) => {
  if (typeof value === 'string') {
    return rewritePublishedManifestPath(value);
  }

  if (Array.isArray(value)) {
    return value.map((entry) => rewritePublishedManifestValue(entry));
  }

  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([key, entryValue]) => [
        key,
        rewritePublishedManifestValue(entryValue),
      ]),
    );
  }

  return value;
};

const resolveCatalogSpecifier = ({ resolvedVersion, specifier }) => {
  if (!isCatalogSpecifier(specifier)) {
    return specifier;
  }

  return resolvedVersion;
};

const resolveWorkspaceSpecifier = ({ resolvedVersion, specifier }) => {
  if (!isWorkspaceSpecifier(specifier)) {
    return specifier;
  }

  const workspaceValue = specifier.slice('workspace:'.length);

  if (workspaceValue === '*' || workspaceValue === '') {
    return `^${resolvedVersion}`;
  }

  if (workspaceValue === '^' || workspaceValue === '~') {
    return `${workspaceValue}${resolvedVersion}`;
  }

  return workspaceValue;
};

const normalizePublishedSpecifier = ({
  dependencyName,
  internalPackageNames,
  resolvedCatalogVersion,
  resolvedWorkspaceVersion,
  specifier,
}) => {
  if (isCatalogSpecifier(specifier)) {
    if (!resolvedCatalogVersion) {
      throw new Error(`Missing catalog version for ${dependencyName}`);
    }

    return resolveCatalogSpecifier({
      resolvedVersion: resolvedCatalogVersion,
      specifier,
    });
  }

  if (isWorkspaceSpecifier(specifier) || internalPackageNames.includes(dependencyName)) {
    if (!resolvedWorkspaceVersion) {
      throw new Error(`Missing workspace version for ${dependencyName}`);
    }

    return resolveWorkspaceSpecifier({
      resolvedVersion: resolvedWorkspaceVersion,
      specifier,
    });
  }

  return specifier;
};

const classifyManifestDependencyRole = ({
  dependencyName,
  internalPackageNames,
  manifestField,
}) => {
  if (hostInstalledReactPackages.includes(dependencyName) || manifestField === 'peerDependencies') {
    return 'peer-runtime';
  }

  if (internalPackageNames.includes(dependencyName)) {
    return 'internal-package';
  }

  return manifestField === 'optionalDependencies' ? 'optional-runtime' : 'runtime';
};

const readCatalogVersions = () => {
  const workspaceConfig = readFileSync(resolve(workspaceRoot, 'pnpm-workspace.yaml'), 'utf8');
  const lines = workspaceConfig.split('\n');
  const catalogVersions = {};
  let inCatalogBlock = false;

  for (const line of lines) {
    if (!inCatalogBlock) {
      if (line.trim() === 'catalog:') {
        inCatalogBlock = true;
      }

      continue;
    }

    if (!line.startsWith('  ')) {
      break;
    }

    const match = line.match(/^\s{2}(['"]?)(.+?)\1:\s+(.+)\s*$/);

    if (!match) {
      continue;
    }

    const [, , packageName, version] = match;
    catalogVersions[packageName] = version.trim();
  }

  return catalogVersions;
};

const readWorkspaceVersions = () => {
  const packagesRoot = resolve(workspaceRoot, 'packages');
  const workspaceVersions = {};

  for (const packageDirectory of readdirSync(packagesRoot)) {
    const packageDirPath = resolve(packagesRoot, packageDirectory);
    if (!statSync(packageDirPath).isDirectory()) continue;
    const packageJsonPath = resolve(packageDirPath, 'package.json');
    if (!existsSync(packageJsonPath)) continue;
    const packageJson = readJson(packageJsonPath);

    workspaceVersions[packageJson.name] = packageJson.version;
  }

  return workspaceVersions;
};

export const createPublishedPackageManifest = ({
  catalogVersions,
  internalPackageNames,
  manifest,
  workspaceVersions,
}) => {
  const publishedManifest = {
    ...manifest,
  };

  delete publishedManifest.devDependencies;
  delete publishedManifest.files;
  delete publishedManifest.scripts;

  if (publishedManifest.publishConfig && typeof publishedManifest.publishConfig === 'object') {
    const { directory, ...remainingPublishConfig } = publishedManifest.publishConfig;

    void directory;

    if (Object.keys(remainingPublishConfig).length > 0) {
      publishedManifest.publishConfig = remainingPublishConfig;
    } else {
      delete publishedManifest.publishConfig;
    }
  }

  const normalizedDependencies = {
    dependencies: {},
    optionalDependencies: {},
    peerDependencies: {},
  };

  for (const manifestField of manifestDependencyFields) {
    const dependencyEntries = Object.entries(manifest[manifestField] ?? {});

    for (const [dependencyName, specifier] of dependencyEntries) {
      const dependencyRole = classifyManifestDependencyRole({
        dependencyName,
        internalPackageNames,
        manifestField,
      });
      const normalizedSpecifier = normalizePublishedSpecifier({
        dependencyName,
        internalPackageNames,
        resolvedCatalogVersion: catalogVersions[dependencyName],
        resolvedWorkspaceVersion: workspaceVersions[dependencyName],
        specifier,
      });

      if (dependencyRole === 'peer-runtime') {
        normalizedDependencies.peerDependencies[dependencyName] = normalizedSpecifier;
        continue;
      }

      if (manifestField === 'optionalDependencies') {
        normalizedDependencies.optionalDependencies[dependencyName] = normalizedSpecifier;
        continue;
      }

      normalizedDependencies.dependencies[dependencyName] = normalizedSpecifier;
    }
  }

  for (const [field, entries] of Object.entries(normalizedDependencies)) {
    if (Object.keys(entries).length > 0) {
      publishedManifest[field] = entries;
    } else {
      delete publishedManifest[field];
    }
  }

  for (const field of ['bin', 'exports', 'main', 'module', 'types']) {
    if (publishedManifest[field] !== undefined) {
      publishedManifest[field] = rewritePublishedManifestValue(publishedManifest[field]);
    }
  }

  return publishedManifest;
};

export const writePublishedManifest = (packageDir = '.') => {
  const packageRoot = resolve(process.cwd(), packageDir);
  const distDir = resolve(packageRoot, 'dist');
  const manifest = readJson(resolve(packageRoot, 'package.json'));
  const catalogVersions = readCatalogVersions();
  const workspaceVersions = readWorkspaceVersions();
  const publishedManifest = createPublishedPackageManifest({
    catalogVersions,
    internalPackageNames: Object.keys(workspaceVersions),
    manifest,
    workspaceVersions,
  });

  mkdirSync(distDir, { recursive: true });
  writeFileSync(
    resolve(distDir, 'package.json'),
    `${JSON.stringify(publishedManifest, null, 2)}\n`,
  );

  return publishedManifest;
};

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  writePublishedManifest(process.argv[2] ?? '.');
}
