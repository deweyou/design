export const hostInstalledReactPackages = ['react', 'react-dom'] as const;

export type HostInstalledReactPackage = (typeof hostInstalledReactPackages)[number];

export type ManifestDependencyRole =
  | 'peer-runtime'
  | 'runtime'
  | 'development'
  | 'internal-package';

export type VersionMap = Record<string, string>;

export type PackageManifest = {
  bin?: Record<string, string> | string;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  exports?: Record<string, unknown> | string;
  files?: string[];
  main?: string;
  module?: string;
  name: string;
  optionalDependencies?: Record<string, string>;
  peerDependencies?: Record<string, string>;
  publishConfig?: Record<string, unknown>;
  scripts?: Record<string, string>;
  type?: string;
  types?: string;
  version: string;
  [key: string]: unknown;
};

const manifestDependencyFields = [
  'dependencies',
  'peerDependencies',
  'optionalDependencies',
] as const;

export const isCatalogSpecifier = (specifier: string) => {
  return specifier === 'catalog:' || specifier.startsWith('catalog:');
};

export const isWorkspaceSpecifier = (specifier: string) => {
  return specifier.startsWith('workspace:');
};

export const isHostInstalledReactPackage = (dependencyName: string) => {
  return hostInstalledReactPackages.includes(dependencyName as HostInstalledReactPackage);
};

export const classifyManifestDependencyRole = ({
  dependencyName,
  internalPackageNames = [],
  manifestField,
}: {
  dependencyName: string;
  internalPackageNames?: string[];
  manifestField: 'dependencies' | 'devDependencies' | 'optionalDependencies' | 'peerDependencies';
}): ManifestDependencyRole => {
  if (manifestField === 'devDependencies') {
    return 'development';
  }

  if (isHostInstalledReactPackage(dependencyName) || manifestField === 'peerDependencies') {
    return 'peer-runtime';
  }

  if (internalPackageNames.includes(dependencyName)) {
    return 'internal-package';
  }

  return 'runtime';
};

export const resolveCatalogSpecifier = ({
  specifier,
  resolvedVersion,
}: {
  specifier: string;
  resolvedVersion: string;
}) => {
  if (!isCatalogSpecifier(specifier)) {
    return specifier;
  }

  return resolvedVersion;
};

export const resolveWorkspaceSpecifier = ({
  specifier,
  resolvedVersion,
}: {
  specifier: string;
  resolvedVersion: string;
}) => {
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

export const normalizePublishedSpecifier = ({
  dependencyName,
  internalPackageNames = [],
  resolvedCatalogVersion,
  resolvedWorkspaceVersion,
  specifier,
}: {
  dependencyName: string;
  internalPackageNames?: string[];
  resolvedCatalogVersion?: string;
  resolvedWorkspaceVersion?: string;
  specifier: string;
}) => {
  if (isCatalogSpecifier(specifier)) {
    if (!resolvedCatalogVersion) {
      throw new Error(`Missing catalog version for ${dependencyName}`);
    }

    return resolveCatalogSpecifier({
      specifier,
      resolvedVersion: resolvedCatalogVersion,
    });
  }

  if (isWorkspaceSpecifier(specifier) || internalPackageNames.includes(dependencyName)) {
    if (!resolvedWorkspaceVersion) {
      throw new Error(`Missing workspace version for ${dependencyName}`);
    }

    return resolveWorkspaceSpecifier({
      specifier,
      resolvedVersion: resolvedWorkspaceVersion,
    });
  }

  return specifier;
};

export const rewritePublishedManifestPath = (value: string) => {
  if (value === './dist') {
    return '.';
  }

  if (value.startsWith('./dist/')) {
    return `./${value.slice('./dist/'.length)}`;
  }

  return value;
};

export const rewritePublishedManifestValue = (value: unknown): unknown => {
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

export const createPublishedPackageManifest = ({
  catalogVersions,
  internalPackageNames = [],
  manifest,
  workspaceVersions,
}: {
  catalogVersions: VersionMap;
  internalPackageNames?: string[];
  manifest: PackageManifest;
  workspaceVersions: VersionMap;
}) => {
  const publishedManifest = {
    ...manifest,
  } satisfies PackageManifest;

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
    dependencies: {} as Record<string, string>,
    optionalDependencies: {} as Record<string, string>,
    peerDependencies: {} as Record<string, string>,
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

  for (const [field, entries] of Object.entries(normalizedDependencies) as Array<
    [keyof typeof normalizedDependencies, Record<string, string>]
  >) {
    if (Object.keys(entries).length > 0) {
      publishedManifest[field] = entries;
    } else {
      delete publishedManifest[field];
    }
  }

  for (const field of ['bin', 'exports', 'main', 'module', 'types'] as const) {
    if (publishedManifest[field] !== undefined) {
      (publishedManifest as Record<string, unknown>)[field] = rewritePublishedManifestValue(
        publishedManifest[field],
      );
    }
  }

  return publishedManifest;
};
