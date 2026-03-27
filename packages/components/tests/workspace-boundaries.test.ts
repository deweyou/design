import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { expect, test } from 'vite-plus/test';

const root = resolve(import.meta.dirname, '../../..');

test('cross-package boundary coverage stays in top-level tests', () => {
  const componentPackage = JSON.parse(
    readFileSync(resolve(root, 'packages/components/package.json'), 'utf8'),
  ) as {
    dependencies: Record<string, string>;
    peerDependencies?: Record<string, string>;
    publishConfig?: { directory?: string };
  };
  const hooksPackage = JSON.parse(
    readFileSync(resolve(root, 'packages/hooks/package.json'), 'utf8'),
  ) as {
    dependencies: Record<string, string>;
    peerDependencies?: Record<string, string>;
    publishConfig?: { directory?: string };
  };
  const iconsPackage = JSON.parse(
    readFileSync(resolve(root, 'packages/icons/package.json'), 'utf8'),
  ) as {
    dependencies?: Record<string, string>;
    peerDependencies?: Record<string, string>;
    publishConfig?: { directory?: string };
  };
  const stylesPackage = JSON.parse(
    readFileSync(resolve(root, 'packages/styles/package.json'), 'utf8'),
  ) as {
    dependencies?: Record<string, string>;
    publishConfig?: { directory?: string };
  };
  const utilsPackage = JSON.parse(
    readFileSync(resolve(root, 'packages/utils/package.json'), 'utf8'),
  ) as {
    publishConfig?: { directory?: string };
  };

  expect(componentPackage.dependencies).toMatchObject({
    '@deweyou-ui/hooks': 'workspace:*',
    '@deweyou-ui/styles': 'workspace:*',
  });
  expect(componentPackage.peerDependencies).toMatchObject({
    react: 'catalog:',
    'react-dom': 'catalog:',
  });
  expect(componentPackage.dependencies ?? {}).not.toHaveProperty('@deweyou-ui/icons');
  expect(componentPackage.dependencies ?? {}).not.toHaveProperty('@storybook/react');
  expect(hooksPackage.dependencies).toMatchObject({
    '@deweyou-ui/utils': 'workspace:*',
  });
  expect(hooksPackage.peerDependencies).toMatchObject({
    react: 'catalog:',
  });
  expect(iconsPackage.dependencies).toMatchObject({
    'tdesign-icons-svg': 'catalog:',
  });
  expect(iconsPackage.peerDependencies).toMatchObject({
    react: 'catalog:',
  });
  expect(iconsPackage.dependencies ?? {}).not.toHaveProperty('@deweyou-ui/components');
  expect(stylesPackage.dependencies ?? {}).not.toHaveProperty('@deweyou-ui/components');
  expect(componentPackage.publishConfig?.directory).toBe('dist');
  expect(hooksPackage.publishConfig?.directory).toBe('dist');
  expect(iconsPackage.publishConfig?.directory).toBe('dist');
  expect(stylesPackage.publishConfig?.directory).toBe('dist');
  expect(utilsPackage.publishConfig?.directory).toBe('dist');
});

test('components package keeps root compatibility while exposing documented subpath entries', () => {
  const componentPackage = JSON.parse(
    readFileSync(resolve(root, 'packages/components/package.json'), 'utf8'),
  ) as {
    exports: Record<string, { default?: string; import?: string; types?: string } | string>;
    files: string[];
    types: string;
  };
  const componentEntry = readFileSync(resolve(root, 'packages/components/src/index.ts'), 'utf8');

  expect(componentEntry).toContain('Button');
  expect(componentEntry).toContain('IconButton');
  expect(componentEntry).toContain('Text');
  expect(componentEntry).toContain("from './button/index.tsx'");
  expect(componentEntry).toContain("from './text/index.tsx'");
  expect(componentPackage.files).toEqual(['dist']);
  expect(componentPackage.types).toBe('./dist/index.d.ts');
  expect(componentPackage.exports).toMatchObject({
    '.': {
      default: './dist/index.js',
      import: './dist/index.js',
      types: './dist/index.d.ts',
    },
    './button': {
      default: './dist/button/index.js',
      import: './dist/button/index.js',
      types: './dist/button/index.d.ts',
    },
    './popover': {
      default: './dist/popover/index.js',
      import: './dist/popover/index.js',
      types: './dist/popover/index.d.ts',
    },
    './text': {
      default: './dist/text/index.js',
      import: './dist/text/index.js',
      types: './dist/text/index.d.ts',
    },
    './style.css': './dist/style.css',
  });
  expect(componentPackage.exports).not.toHaveProperty('./icon-button');
});

test('hooks and utils follow the default pack path while icons and styles stay documented exceptions', () => {
  const hooksVite = readFileSync(resolve(root, 'packages/hooks/vite.config.ts'), 'utf8');
  const utilsVite = readFileSync(resolve(root, 'packages/utils/vite.config.ts'), 'utf8');
  const stylesVite = readFileSync(resolve(root, 'packages/styles/vite.config.ts'), 'utf8');
  const iconsVite = readFileSync(resolve(root, 'packages/icons/vite.config.ts'), 'utf8');

  expect(hooksVite).toContain('default Vite+ pack contract');
  expect(utilsVite).toContain('default Vite+ pack path');
  expect(stylesVite).toContain('asset copy stage');
  expect(iconsVite).toContain('explicit exception');
});

test('workspace publish flow writes dist package manifests instead of mutating source manifests during release builds', () => {
  const componentsPackage = readFileSync(resolve(root, 'packages/components/package.json'), 'utf8');
  const hooksPackage = readFileSync(resolve(root, 'packages/hooks/package.json'), 'utf8');
  const utilsPackage = readFileSync(resolve(root, 'packages/utils/package.json'), 'utf8');
  const stylesScript = readFileSync(
    resolve(root, 'packages/styles/scripts/copy-assets.mjs'),
    'utf8',
  );
  const iconsScript = readFileSync(
    resolve(root, 'packages/icons/scripts/organize-dist.mjs'),
    'utf8',
  );

  expect(componentsPackage).toContain('write-published-manifest.mjs');
  expect(hooksPackage).toContain('write-published-manifest.mjs');
  expect(utilsPackage).toContain('write-published-manifest.mjs');
  expect(stylesScript).toContain('writePublishedManifest');
  expect(stylesScript).not.toContain('writeFileSync');
  expect(iconsScript).toContain('writePublishedManifest');
  expect(iconsScript).toContain("resolve(distDir, 'src')");
});

test('storybook typography review matrix covers Text variants, palette highlights, and lineClamp', () => {
  const storybookEntry = readFileSync(
    resolve(root, 'apps/storybook/src/stories/Typography.stories.tsx'),
    'utf8',
  );

  expect(storybookEntry).toContain('Text component contract');
  expect(storybookEntry).toContain('lineClamp');
  expect(storybookEntry).toContain('strikethrough');
  expect(storybookEntry).toContain('Palette highlights');
  expect(storybookEntry).toContain('background');
  expect(storybookEntry).toContain("variant: 'h1'");
  expect(storybookEntry).toContain('export const ReadingSurface');
});

test('website typography guidance documents Text variants, palette highlights, and long-copy boundaries', () => {
  const websiteEntry = readFileSync(resolve(root, 'apps/website/src/main.tsx'), 'utf8');

  expect(websiteEntry).toContain('Text component');
  expect(websiteEntry).toContain('lineClamp');
  expect(websiteEntry).toContain('原生 `h1`-`h5`');
  expect(websiteEntry).toContain('strikethrough');
  expect(websiteEntry).toContain('Palette-backed highlight');
  expect(websiteEntry).toContain('26 色族');
  expect(websiteEntry).toContain('支持常见文本层级');
});

test('button and text keep consuming shared color sources instead of package-private tokens', () => {
  const buttonStyles = readFileSync(
    resolve(root, 'packages/components/src/button/index.module.less'),
    'utf8',
  );
  const textSource = readFileSync(resolve(root, 'packages/components/src/text/index.tsx'), 'utf8');
  const storybookColor = readFileSync(
    resolve(root, 'apps/storybook/src/stories/Color.stories.tsx'),
    'utf8',
  );
  const websiteEntry = readFileSync(resolve(root, 'apps/website/src/main.tsx'), 'utf8');

  expect(textSource).toContain("from '@deweyou-ui/styles'");
  expect(textSource).toContain('colorFamilyNames');
  expect(buttonStyles).toContain('--ui-color-brand-bg');
  expect(buttonStyles).toContain('--ui-color-danger-bg');
  expect(buttonStyles).toContain('--ui-color-link');
  expect(buttonStyles).not.toContain('--ui-color-palette-');
  expect(storybookColor).toContain('Shared color foundation');
  expect(storybookColor).toContain('Use Storybook theme switching');
  expect(websiteEntry).toContain('Color foundation');
  expect(websiteEntry).toContain('非必要不得新增特化 token');
});

test('storybook button review matrix covers native prop passthrough and loading states', () => {
  const storybookEntry = readFileSync(
    resolve(root, 'apps/storybook/src/stories/Button.stories.tsx'),
    'utf8',
  );

  expect(storybookEntry).toContain("['neutral', 'primary', 'danger']");
  expect(storybookEntry).toContain('export const PublicProps');
  expect(storybookEntry).toContain('export const LoadingStates');
  expect(storybookEntry).toContain('htmlType');
  expect(storybookEntry).toContain('loading');
  expect(storybookEntry).toContain('focusTargetRef.current?.focus()');
  expect(storybookEntry).not.toContain('export const TypographyContract');
});

test('website button guidance documents danger, loading, and ref boundaries', () => {
  const websiteEntry = readFileSync(resolve(root, 'apps/website/src/main.tsx'), 'utf8');

  expect(websiteEntry).toContain('Public prop passthrough');
  expect(websiteEntry).toContain('Loading guidance');
  expect(websiteEntry).toContain('htmlType');
  expect(websiteEntry).toContain('loading');
  expect(websiteEntry).toContain('focusTargetRef.current?.focus()');
  expect(websiteEntry).toContain("['neutral', 'primary', 'danger']");
});
