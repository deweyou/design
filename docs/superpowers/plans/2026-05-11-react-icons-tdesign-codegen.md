# React Icons TDesign Codegen Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild `@deweyou-design/react-icons` so named `XxxIcon` exports are generated from a Deweyou-curated registry backed by `tdesign-icons-svg`, with design-system `size` and `color` props, tree-shaking verification, Storybook review coverage, and website documentation.

**Architecture:** `packages/react-icons/src/icon-registry/icons.json` is the only supported icon list, with `src/icon-registry/index.ts` providing typed exports for tests and documentation surfaces. `scripts/generate-icons.mjs` reads only registry-declared `tdesign` or `local` SVG sources and writes committed generated React components under `src/icons/generated/`, while `src/icons/index.ts` re-exports named icons for the public package surface. `icon-wrapper` owns the shared SVG props contract and accessibility defaults.

**Tech Stack:** TypeScript 5, React 19, `vite-plus`, `vite`, `tdesign-icons-svg@0.4.2`, Storybook 10, Less/CSS Modules for website styles.

---

## File Structure

- Create `packages/react-icons/src/icon-registry/icons.json`: Deweyou-owned curated icon list.
- Create `packages/react-icons/src/icon-registry/index.ts`: registry types and typed list export.
- Create `packages/react-icons/src/icon-registry/assets/.gitkeep`: local SVG asset directory marker.
- Modify `packages/react-icons/src/icon-wrapper/index.tsx`: generic SVG wrapper with `IconProps`, `IconSize`, `IconColor`, `createIcon`.
- Modify `packages/react-icons/src/icon-wrapper/index.test.tsx`: prop, size, color, and accessibility tests.
- Create `packages/react-icons/scripts/generate-icons.mjs`: generator that reads registry entries and writes generated components.
- Create `packages/react-icons/src/icons/generated/index.tsx`: generated icon components, committed to source.
- Modify `packages/react-icons/src/icons/index.ts`: re-export generated components.
- Modify `packages/react-icons/src/icons/index.test.ts`: registry/public-surface contract tests.
- Modify `packages/react-icons/src/index.ts`: export `IconProps`, `IconSize`, `IconColor`, and generated icons.
- Create `packages/react-icons/src/icons/tree-shaking.test.ts`: one-icon consumer bundle contract.
- Modify `packages/react-icons/package.json`: replace Tabler dependency with build-time `tdesign-icons-svg`, add `generate-icons` script, add `vite` for the tree-shaking test if needed.
- Modify `packages/react-icons/vite.config.ts`: keep ESM entry behavior compatible with generated icons.
- Modify `packages/react-icons/README.md`: TDesign attribution, curated-list rules, direct import guidance.
- Modify `packages/react-icons/CLAUDE.md`: replace Tabler-specific constraints with TDesign codegen constraints.
- Modify `docs/design/system.md`: replace old Tabler-specific icon guidance.
- Modify `apps/storybook/src/stories/Icon.stories.tsx`: new source model, size/color/a11y review stories.
- Modify `apps/website/src/pages/icons.tsx`: TDesign attribution, curated-list explanation, size/color examples.
- Modify `apps/website/src/pages/icons.test.tsx`: website copy and catalog behavior tests.
- Modify `pnpm-lock.yaml`: dependency lock update from `vp install` or filtered install.

---

### Task 1: Install TDesign SVG Source And Verify Package Shape

**Files:**
- Modify: `packages/react-icons/package.json`
- Modify: `pnpm-lock.yaml`

- [ ] **Step 1: Add the source package as a build-time dependency**

Run:

```bash
pnpm --filter @deweyou-design/react-icons add -D tdesign-icons-svg@0.4.2 vite@catalog:
```

Expected:

```text
packages/react-icons/package.json updates devDependencies.
pnpm-lock.yaml records tdesign-icons-svg@0.4.2.
```

- [ ] **Step 2: Remove the old Tabler runtime dependency**

Edit `packages/react-icons/package.json` so the dependency sections contain this shape:

```json
{
  "dependencies": {},
  "devDependencies": {
    "@testing-library/react": "catalog:",
    "@types/react": "catalog:",
    "@types/react-dom": "catalog:",
    "react-dom": "catalog:",
    "tdesign-icons-svg": "0.4.2",
    "typescript": "catalog:",
    "vite": "catalog:",
    "vite-plus": "catalog:"
  },
  "peerDependencies": {
    "react": "catalog:"
  }
}
```

If `package.json` tooling removes the empty `dependencies` object, leave it absent. The required outcome is that `@tabler/icons-react` is gone and `tdesign-icons-svg` is not in runtime `dependencies`.

- [ ] **Step 3: Probe the package filesystem layout**

Run:

```bash
node -e "const { createRequire } = require('node:module'); const { dirname, join } = require('node:path'); const req = createRequire(process.cwd() + '/packages/react-icons/package.json'); const pkg = req.resolve('tdesign-icons-svg/package.json'); console.log(pkg); console.log(join(dirname(pkg), 'src', 'search.svg'));"
```

Expected:

```text
.../node_modules/tdesign-icons-svg/package.json
.../node_modules/tdesign-icons-svg/src/search.svg
```

- [ ] **Step 4: Commit dependency wiring**

Run:

```bash
git add packages/react-icons/package.json pnpm-lock.yaml
git commit -m "build(react-icons): add tdesign svg source"
```

---

### Task 2: Add The Curated Icon Registry

**Files:**
- Create: `packages/react-icons/src/icon-registry/icons.json`
- Create: `packages/react-icons/src/icon-registry/index.ts`
- Create: `packages/react-icons/src/icon-registry/assets/.gitkeep`
- Modify: `packages/react-icons/src/icons/index.test.ts`

- [ ] **Step 1: Write the failing registry/public-surface test**

Replace `packages/react-icons/src/icons/index.test.ts` with:

```ts
import { expect, it } from 'vite-plus/test';

import { iconRegistry } from '../icon-registry';
import * as icons from './index';
import * as publicSurface from '../index';

const expectedIconNames = iconRegistry.map(({ exportName }) => exportName).sort();

it('exports exactly the curated registry icon set', () => {
  expect(Object.keys(icons).sort()).toEqual(expectedIconNames);
});

it('keeps the root public surface to types plus curated icons', () => {
  expect(Object.keys(publicSurface).sort()).toEqual(expectedIconNames);
});

it('keeps registry export names unique and named as icons', () => {
  const names = iconRegistry.map(({ exportName }) => exportName);

  expect(new Set(names).size).toBe(names.length);
  expect(names.every((name) => /^[A-Z][A-Za-z0-9]*Icon$/.test(name))).toBe(true);
});

it('keeps registry source declarations explicit', () => {
  for (const entry of iconRegistry) {
    if (entry.source === 'tdesign') {
      expect(entry.sourceKey).toMatch(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
      expect('sourcePath' in entry).toBe(false);
    } else {
      expect(entry.sourcePath).toMatch(/^\.\/assets\/[a-z0-9-]+\.svg$/);
      expect('sourceKey' in entry).toBe(false);
    }
  }
});
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```bash
vp test packages/react-icons/src/icons/index.test.ts
```

Expected:

```text
FAIL: Cannot find module '../icon-registry'
```

- [ ] **Step 3: Create the registry data file**

Create `packages/react-icons/src/icon-registry/icons.json`:

```json
[
  {
    "exportName": "AlertCircleIcon",
    "source": "tdesign",
    "sourceKey": "error-circle",
    "category": "status",
    "keywords": ["alert", "error", "circle"]
  },
  {
    "exportName": "AlertTriangleIcon",
    "source": "tdesign",
    "sourceKey": "error-triangle",
    "category": "status",
    "keywords": ["alert", "warning", "triangle"]
  },
  {
    "exportName": "ArrowLeftIcon",
    "source": "tdesign",
    "sourceKey": "arrow-left",
    "category": "navigation",
    "keywords": ["back", "previous"]
  },
  {
    "exportName": "ArrowRightIcon",
    "source": "tdesign",
    "sourceKey": "arrow-right",
    "category": "navigation",
    "keywords": ["next", "forward"]
  },
  {
    "exportName": "BellIcon",
    "source": "tdesign",
    "sourceKey": "notification",
    "category": "feedback",
    "keywords": ["bell", "notice"]
  },
  {
    "exportName": "CheckIcon",
    "source": "tdesign",
    "sourceKey": "check",
    "category": "status",
    "keywords": ["done", "selected"]
  },
  {
    "exportName": "ChevronDownIcon",
    "source": "tdesign",
    "sourceKey": "chevron-down",
    "category": "navigation",
    "keywords": ["expand", "down"]
  },
  {
    "exportName": "ChevronLeftIcon",
    "source": "tdesign",
    "sourceKey": "chevron-left",
    "category": "navigation",
    "keywords": ["previous", "left"]
  },
  {
    "exportName": "ChevronRightIcon",
    "source": "tdesign",
    "sourceKey": "chevron-right",
    "category": "navigation",
    "keywords": ["next", "right"]
  },
  {
    "exportName": "ChevronUpIcon",
    "source": "tdesign",
    "sourceKey": "chevron-up",
    "category": "navigation",
    "keywords": ["collapse", "up"]
  },
  {
    "exportName": "CopyIcon",
    "source": "tdesign",
    "sourceKey": "copy",
    "category": "action",
    "keywords": ["duplicate", "clipboard"]
  },
  {
    "exportName": "DownloadIcon",
    "source": "tdesign",
    "sourceKey": "download",
    "category": "action",
    "keywords": ["save", "export"]
  },
  {
    "exportName": "EditIcon",
    "source": "tdesign",
    "sourceKey": "edit",
    "category": "action",
    "keywords": ["compose", "pencil"]
  },
  {
    "exportName": "ExternalLinkIcon",
    "source": "tdesign",
    "sourceKey": "jump",
    "category": "action",
    "keywords": ["external", "open"]
  },
  {
    "exportName": "EyeIcon",
    "source": "tdesign",
    "sourceKey": "browse",
    "category": "action",
    "keywords": ["view", "visible"]
  },
  {
    "exportName": "EyeOffIcon",
    "source": "tdesign",
    "sourceKey": "browse-off",
    "category": "action",
    "keywords": ["hide", "invisible"]
  },
  {
    "exportName": "FilterIcon",
    "source": "tdesign",
    "sourceKey": "filter",
    "category": "action",
    "keywords": ["refine", "funnel"]
  },
  {
    "exportName": "HomeIcon",
    "source": "tdesign",
    "sourceKey": "home",
    "category": "navigation",
    "keywords": ["house", "start"]
  },
  {
    "exportName": "InfoIcon",
    "source": "tdesign",
    "sourceKey": "info-circle",
    "category": "feedback",
    "keywords": ["information", "help"]
  },
  {
    "exportName": "Loader2Icon",
    "source": "tdesign",
    "sourceKey": "loading",
    "category": "feedback",
    "keywords": ["loading", "spinner"]
  },
  {
    "exportName": "Menu2Icon",
    "source": "tdesign",
    "sourceKey": "menu",
    "category": "navigation",
    "keywords": ["navigation", "hamburger"]
  },
  {
    "exportName": "MinusIcon",
    "source": "tdesign",
    "sourceKey": "minus",
    "category": "action",
    "keywords": ["remove", "collapse"]
  },
  {
    "exportName": "PlusIcon",
    "source": "tdesign",
    "sourceKey": "plus",
    "category": "action",
    "keywords": ["add", "create"]
  },
  {
    "exportName": "RefreshIcon",
    "source": "tdesign",
    "sourceKey": "refresh",
    "category": "action",
    "keywords": ["reload", "sync"]
  },
  {
    "exportName": "SearchIcon",
    "source": "tdesign",
    "sourceKey": "search",
    "category": "action",
    "keywords": ["find", "lookup"]
  },
  {
    "exportName": "SettingsIcon",
    "source": "tdesign",
    "sourceKey": "setting",
    "category": "action",
    "keywords": ["settings", "preferences"]
  },
  {
    "exportName": "TrashIcon",
    "source": "tdesign",
    "sourceKey": "delete",
    "category": "action",
    "keywords": ["trash", "remove"]
  },
  {
    "exportName": "UploadIcon",
    "source": "tdesign",
    "sourceKey": "upload",
    "category": "action",
    "keywords": ["import", "send"]
  },
  {
    "exportName": "UserIcon",
    "source": "tdesign",
    "sourceKey": "user",
    "category": "content",
    "keywords": ["person", "account"]
  },
  {
    "exportName": "XIcon",
    "source": "tdesign",
    "sourceKey": "close",
    "category": "action",
    "keywords": ["close", "dismiss"]
  }
]
```

- [ ] **Step 4: Create the typed registry export**

Create `packages/react-icons/src/icon-registry/index.ts`:

```ts
import iconRegistryJson from './icons.json';

export type IconCategory = 'action' | 'feedback' | 'navigation' | 'status' | 'content';

export type TDesignIconRegistryEntry = {
  readonly exportName: `${string}Icon`;
  readonly source: 'tdesign';
  readonly sourceKey: string;
  readonly category: IconCategory;
  readonly keywords: readonly string[];
};

export type LocalIconRegistryEntry = {
  readonly exportName: `${string}Icon`;
  readonly source: 'local';
  readonly sourcePath: `./assets/${string}.svg`;
  readonly category: IconCategory;
  readonly keywords: readonly string[];
};

export type IconRegistryEntry = TDesignIconRegistryEntry | LocalIconRegistryEntry;

export const iconRegistry = iconRegistryJson as readonly IconRegistryEntry[];

export type IconExportName = (typeof iconRegistry)[number]['exportName'];
```

- [ ] **Step 5: Create the local asset directory marker**

Create `packages/react-icons/src/icon-registry/assets/.gitkeep` as an empty file.

- [ ] **Step 6: Run test and observe current surface mismatch**

Run:

```bash
vp test packages/react-icons/src/icons/index.test.ts
```

Expected:

```text
FAIL until generated icons replace the current Tabler-backed icons or until registry source mapping is wired.
```

- [ ] **Step 7: Commit registry**

Run:

```bash
git add packages/react-icons/src/icon-registry packages/react-icons/src/icons/index.test.ts
git commit -m "feat(react-icons): add curated icon registry"
```

---

### Task 3: Replace The Icon Wrapper Contract

**Files:**
- Modify: `packages/react-icons/src/icon-wrapper/index.tsx`
- Modify: `packages/react-icons/src/icon-wrapper/index.test.tsx`
- Modify: `packages/react-icons/src/index.ts`

- [ ] **Step 1: Write the failing wrapper tests**

Replace `packages/react-icons/src/icon-wrapper/index.test.tsx` with:

```tsx
// @vitest-environment jsdom
import { fireEvent, render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vite-plus/test';

import { createIcon } from './index';

const TestIcon = createIcon('TestIcon', {
  viewBox: '0 0 24 24',
  body: <path d="M4 12h16" />,
});

describe('createIcon', () => {
  it('renders without aria-label as decorative', () => {
    const { container } = render(<TestIcon />);
    const svg = container.querySelector('svg');

    expect(svg).toBeTruthy();
    expect(svg?.getAttribute('aria-hidden')).toBe('true');
    expect(svg?.getAttribute('role')).toBeNull();
  });

  it('renders with aria-label as a named image', () => {
    const { container } = render(<TestIcon aria-label="Search" />);
    const svg = container.querySelector('svg');

    expect(svg?.getAttribute('aria-hidden')).toBeNull();
    expect(svg?.getAttribute('aria-label')).toBe('Search');
    expect(svg?.getAttribute('role')).toBe('img');
  });

  it('allows explicit aria-hidden and role overrides', () => {
    const { container } = render(<TestIcon aria-hidden={false} role="presentation" />);
    const svg = container.querySelector('svg');

    expect(svg?.getAttribute('aria-hidden')).toBe('false');
    expect(svg?.getAttribute('role')).toBe('presentation');
  });

  it('maps named sizes and preserves custom size values', () => {
    const { container, rerender } = render(<TestIcon size="sm" />);
    const svg = container.querySelector('svg');

    expect(svg?.getAttribute('width')).toBe('16');
    expect(svg?.getAttribute('height')).toBe('16');

    rerender(<TestIcon size={28} />);
    expect(svg?.getAttribute('width')).toBe('28');
    expect(svg?.getAttribute('height')).toBe('28');

    rerender(<TestIcon size="2rem" />);
    expect(svg?.getAttribute('width')).toBe('2rem');
    expect(svg?.getAttribute('height')).toBe('2rem');
  });

  it('maps semantic colors and defaults to currentColor', () => {
    const { container, rerender } = render(<TestIcon />);
    const svg = container.querySelector('svg');

    expect(svg?.getAttribute('color')).toBe('currentColor');

    rerender(<TestIcon color="primary" />);
    expect(svg?.getAttribute('color')).toBe('var(--ui-color-brand-text)');

    rerender(<TestIcon color="danger" />);
    expect(svg?.getAttribute('color')).toBe('var(--ui-color-danger-text)');
  });

  it('passes through id, className, data attributes, style, and events', () => {
    const handleClick = vi.fn();
    const { container } = render(
      <TestIcon
        className="sample"
        data-testid="icon"
        id="sample-icon"
        style={{ marginInlineStart: 4 }}
        onClick={handleClick}
      />,
    );

    const svg = container.querySelector('svg')!;
    expect(svg.id).toBe('sample-icon');
    expect(svg.classList.contains('sample')).toBe(true);
    expect(svg.getAttribute('data-testid')).toBe('icon');
    expect(svg.style.marginInlineStart).toBe('4px');

    fireEvent.click(svg);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```bash
vp test packages/react-icons/src/icon-wrapper/index.test.tsx
```

Expected:

```text
FAIL: createIcon is not exported.
```

- [ ] **Step 3: Implement wrapper**

Replace `packages/react-icons/src/icon-wrapper/index.tsx` with:

```tsx
import type { ReactElement, SVGProps } from 'react';

export type IconSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type IconColor = 'inherit' | 'neutral' | 'primary' | 'danger';

export type IconProps = Omit<
  SVGProps<SVGSVGElement>,
  'children' | 'dangerouslySetInnerHTML' | 'color'
> & {
  color?: IconColor;
  size?: IconSize | number | string;
};

export type IconDefinition = {
  body: ReactElement | readonly ReactElement[];
  viewBox: string;
};

const iconSizeMap = {
  xs: 12,
  sm: 16,
  md: 20,
  lg: 24,
  xl: 32,
} as const satisfies Record<IconSize, number>;

const iconColorMap = {
  inherit: 'currentColor',
  neutral: 'var(--ui-color-text)',
  primary: 'var(--ui-color-brand-text)',
  danger: 'var(--ui-color-danger-text)',
} as const satisfies Record<IconColor, string>;

const resolveSize = (size: IconProps['size']) => {
  if (size === undefined) {
    return iconSizeMap.md;
  }

  if (typeof size === 'string' && size in iconSizeMap) {
    return iconSizeMap[size as IconSize];
  }

  return size;
};

const resolveColor = (color: IconProps['color']) => {
  return iconColorMap[color ?? 'inherit'];
};

export const createIcon = (
  displayName: string,
  definition: IconDefinition,
): ((props: IconProps) => ReactElement) => {
  const Icon = ({
    'aria-hidden': ariaHidden,
    'aria-label': ariaLabel,
    color,
    role,
    size,
    ...svgProps
  }: IconProps): ReactElement => {
    const resolvedSize = resolveSize(size);
    const resolvedAriaHidden = ariaHidden ?? (ariaLabel ? undefined : true);
    const resolvedRole = role ?? (ariaLabel ? 'img' : undefined);

    return (
      <svg
        aria-hidden={resolvedAriaHidden}
        aria-label={ariaLabel}
        color={resolveColor(color)}
        fill="none"
        height={resolvedSize}
        role={resolvedRole}
        viewBox={definition.viewBox}
        width={resolvedSize}
        xmlns="http://www.w3.org/2000/svg"
        {...svgProps}
      >
        {definition.body}
      </svg>
    );
  };

  Icon.displayName = displayName;

  return Icon;
};
```

- [ ] **Step 4: Run wrapper test to verify it passes**

Run:

```bash
vp test packages/react-icons/src/icon-wrapper/index.test.tsx
```

Expected:

```text
PASS packages/react-icons/src/icon-wrapper/index.test.tsx
```

- [ ] **Step 5: Export the expanded icon prop types from the package root**

Replace `packages/react-icons/src/index.ts` with:

```ts
export type { IconColor, IconProps, IconSize } from './icon-wrapper';
export * from './icons';
```

- [ ] **Step 6: Commit wrapper**

Run:

```bash
git add packages/react-icons/src/icon-wrapper packages/react-icons/src/index.ts
git commit -m "feat(react-icons): define svg icon wrapper contract"
```

---

### Task 4: Build The SVG Generator

**Files:**
- Create: `packages/react-icons/scripts/generate-icons.mjs`
- Modify: `packages/react-icons/package.json`
- Create: `packages/react-icons/src/icons/generated/index.tsx`
- Modify: `packages/react-icons/src/icons/index.ts`

- [ ] **Step 1: Add generator script entry**

Modify `packages/react-icons/package.json` scripts:

```json
{
  "scripts": {
    "build": "node ./scripts/clean-dist.mjs && pnpm run generate-icons && vp pack && node ../infra/scripts/write-published-manifest.mjs .",
    "dev": "vp pack --watch",
    "generate-icons": "node ./scripts/generate-icons.mjs",
    "test": "vp test"
  }
}
```

- [ ] **Step 2: Write generator**

Create `packages/react-icons/scripts/generate-icons.mjs`:

```js
import { createRequire } from 'node:module';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { mkdir, readFile, writeFile } from 'node:fs/promises';

const packageRoot = resolve(fileURLToPath(new URL('..', import.meta.url)));
const srcRoot = resolve(packageRoot, 'src');
const registryJsonPath = resolve(srcRoot, 'icon-registry/icons.json');
const outputPath = resolve(srcRoot, 'icons/generated/index.tsx');
const requireFromPackage = createRequire(resolve(packageRoot, 'package.json'));

const tdesignPackageJsonPath = requireFromPackage.resolve('tdesign-icons-svg/package.json');
const tdesignSvgRoot = resolve(dirname(tdesignPackageJsonPath), 'src');

const iconRegistry = JSON.parse(await readFile(registryJsonPath, 'utf8'));

const toJsxAttributeName = (name) => {
  if (name === 'class') {
    return 'className';
  }

  if (name.startsWith('aria-') || name.startsWith('data-')) {
    return name;
  }

  return name.replace(/-([a-z])/g, (_, char) => char.toUpperCase());
};

const normalizeSvgBody = (svg, sourceLabel) => {
  const viewBoxMatch = svg.match(/\sviewBox="([^"]+)"/);
  const bodyMatch = svg.match(/<svg\b[^>]*>([\s\S]*?)<\/svg>/);

  if (!viewBoxMatch || !bodyMatch) {
    throw new Error(`Unable to read SVG viewBox or body from ${sourceLabel}.`);
  }

  const body = bodyMatch[1]
    .trim()
    .replace(/\s(?:width|height)="[^"]*"/g, '')
    .replace(/\s(?:fill|stroke)="(?!none|currentColor)[^"]*"/g, (match) => {
      return match.includes('fill=') ? ' fill="currentColor"' : ' stroke="currentColor"';
    })
    .replace(/\s([a-zA-Z_:][-a-zA-Z0-9_:.]*)=/g, (match, attributeName) => {
      return ` ${toJsxAttributeName(attributeName)}=`;
    });

  return {
    body,
    viewBox: viewBoxMatch[1],
  };
};

const assertRegistry = (entries) => {
  const seenExports = new Set();

  for (const entry of entries) {
    if (!/^[A-Z][A-Za-z0-9]*Icon$/.test(entry.exportName)) {
      throw new Error(`Invalid icon export name: ${entry.exportName}`);
    }

    if (seenExports.has(entry.exportName)) {
      throw new Error(`Duplicate icon export name: ${entry.exportName}`);
    }

    seenExports.add(entry.exportName);

    if (entry.source === 'tdesign' && !entry.sourceKey) {
      throw new Error(`Missing sourceKey for ${entry.exportName}.`);
    }

    if (entry.source === 'local' && !entry.sourcePath) {
      throw new Error(`Missing sourcePath for ${entry.exportName}.`);
    }

    if (entry.source !== 'tdesign' && entry.source !== 'local') {
      throw new Error(`Unsupported icon source for ${entry.exportName}: ${entry.source}`);
    }
  }
};

const readSvgForEntry = async (entry) => {
  if (entry.source === 'tdesign') {
    const svgPath = resolve(tdesignSvgRoot, `${entry.sourceKey}.svg`);
    return {
      sourceLabel: `tdesign:${entry.sourceKey}`,
      svg: await readFile(svgPath, 'utf8'),
    };
  }

  const svgPath = resolve(srcRoot, 'icon-registry', entry.sourcePath);
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

assertRegistry(iconRegistry);

const components = await Promise.all(iconRegistry.map(renderComponent));
const output = `// This file is generated by scripts/generate-icons.mjs.
// Edit src/icon-registry/index.ts or src/icon-registry/assets/*.svg, then run pnpm run generate-icons.
import { createIcon } from '../../icon-wrapper';

${components.join('\n')}`;

await mkdir(dirname(outputPath), { recursive: true });
await writeFile(outputPath, output);
```

- [ ] **Step 3: Replace the icon index with generated re-exports**

Replace `packages/react-icons/src/icons/index.ts` with:

```ts
export * from './generated';
```

- [ ] **Step 4: Run generator and inspect output**

Run:

```bash
pnpm --dir packages/react-icons run generate-icons
sed -n '1,80p' packages/react-icons/src/icons/generated/index.tsx
```

Expected:

```text
Generated file imports createIcon.
Generated file exports AlertCircleIcon and SearchIcon.
Generated file does not import @tabler/icons-react.
```

- [ ] **Step 5: Run icon tests**

Run:

```bash
vp test packages/react-icons/src/icons/index.test.ts packages/react-icons/src/icon-wrapper/index.test.tsx
```

Expected:

```text
PASS packages/react-icons/src/icons/index.test.ts
PASS packages/react-icons/src/icon-wrapper/index.test.tsx
```

- [ ] **Step 6: Commit generator and generated icons**

Run:

```bash
git add packages/react-icons/package.json packages/react-icons/scripts/generate-icons.mjs packages/react-icons/src/icons packages/react-icons/src/icon-wrapper
git commit -m "feat(react-icons): generate icons from curated tdesign registry"
```

---

### Task 5: Add Tree-Shaking Contract Coverage

**Files:**
- Create: `packages/react-icons/src/icons/tree-shaking.test.ts`
- Modify: `packages/react-icons/vite.config.ts`
- Modify: `packages/react-icons/package.json`

- [ ] **Step 1: Write the failing tree-shaking test**

Create `packages/react-icons/src/icons/tree-shaking.test.ts`:

```ts
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';

import { build } from 'vite';
import { expect, test } from 'vite-plus/test';

const fixtureDir = resolve(import.meta.dirname, '../../.tmp/tree-shaking');

test('one-icon consumer bundle drops unrelated generated icon exports', async () => {
  await rm(fixtureDir, { force: true, recursive: true });
  await mkdir(fixtureDir, { recursive: true });

  const entryPath = join(fixtureDir, 'entry.tsx');
  const outDir = join(fixtureDir, 'dist');

  await writeFile(
    entryPath,
    [
      "import { SearchIcon } from '../../index';",
      'export const render = () => SearchIcon({ "aria-label": "Search" });',
    ].join('\n'),
  );

  await build({
    build: {
      emptyOutDir: true,
      lib: {
        entry: entryPath,
        formats: ['es'],
      },
      minify: false,
      outDir,
      rollupOptions: {
        external: ['react', 'react/jsx-runtime'],
      },
    },
    logLevel: 'silent',
  });

  const bundle = await readFile(join(outDir, 'tree-shaking.mjs'), 'utf8');

  expect(bundle).toContain('SearchIcon');
  expect(bundle).not.toContain('ChevronDownIcon');
  expect(bundle).not.toContain('AlertTriangleIcon');
});
```

- [ ] **Step 2: Run test and verify current behavior**

Run:

```bash
vp test packages/react-icons/src/icons/tree-shaking.test.ts
```

Expected:

```text
PASS when generated exports are side-effect-free.
FAIL if the root icon module eagerly keeps unrelated generated icon exports.
```

- [ ] **Step 3: If the test fails, split generated output per icon**

If Step 2 fails because all generated icons remain in the bundle, update `scripts/generate-icons.mjs` so it writes:

```text
packages/react-icons/src/icons/generated/search-icon.tsx
packages/react-icons/src/icons/generated/chevron-down-icon.tsx
packages/react-icons/src/icons/generated/index.ts
```

Use this filename helper:

```js
const toKebab = (value) => {
  return value
    .replace(/Icon$/, '')
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .toLowerCase();
};
```

Use this per-icon module output:

```js
const renderIconModule = async (entry) => {
  const { sourceLabel, svg } = await readSvgForEntry(entry);
  const { body, viewBox } = normalizeSvgBody(svg, sourceLabel);

  return `// This file is generated by scripts/generate-icons.mjs.
import { createIcon } from '../../icon-wrapper';

export const ${entry.exportName} = /* @__PURE__ */ createIcon('${entry.exportName}', {
  viewBox: '${viewBox}',
  body: (
    <>
      ${body}
    </>
  ),
});
`;
};
```

Use this generated index output:

```js
const indexOutput = `// This file is generated by scripts/generate-icons.mjs.
${iconRegistry
  .map((entry) => `export { ${entry.exportName} } from './${toKebab(entry.exportName)}';`)
  .join('\n')}
`;
```

- [ ] **Step 4: Rerun tree-shaking test**

Run:

```bash
vp test packages/react-icons/src/icons/tree-shaking.test.ts
```

Expected:

```text
PASS packages/react-icons/src/icons/tree-shaking.test.ts
```

- [ ] **Step 5: Commit build contract**

Run:

```bash
git add packages/react-icons/src/icons/tree-shaking.test.ts packages/react-icons/scripts/generate-icons.mjs packages/react-icons/src/icons/generated packages/react-icons/package.json packages/react-icons/vite.config.ts
git commit -m "test(react-icons): verify generated icon tree shaking"
```

---

### Task 6: Update Package Documentation And Governance

**Files:**
- Modify: `packages/react-icons/README.md`
- Modify: `packages/react-icons/CLAUDE.md`
- Modify: `docs/design/system.md`

- [ ] **Step 1: Update README**

Replace `packages/react-icons/README.md` with:

```md
# @deweyou-design/react-icons

Curated React icon components for Deweyou Design. The package generates named `XxxIcon` components from a Deweyou-maintained registry. Default SVG glyphs are sourced from `tdesign-icons-svg`, and local SVG assets can supplement that source when Deweyou needs an icon that upstream does not provide.

The package does not mirror the full `tdesign-icons-svg` collection. Only registry-declared icons are generated, reviewed, tested, and supported.

## Installation

```bash
npm install @deweyou-design/react-icons
```

## Usage

Prefer direct named imports for application code:

```tsx
import { CheckIcon, ChevronDownIcon, SearchIcon } from '@deweyou-design/react-icons';

<SearchIcon />
<ChevronDownIcon size="sm" />
<CheckIcon aria-label="Selected" color="primary" />
```

Namespace imports are reserved for catalog surfaces that intentionally render every supported icon.

## Props

| Prop | Type | Description |
| --- | --- | --- |
| `size` | `'xs' \| 'sm' \| 'md' \| 'lg' \| 'xl' \| number \| string` | Icon size. Defaults to `md`. |
| `color` | `'inherit' \| 'neutral' \| 'primary' \| 'danger'` | Design-system icon color. Defaults to `inherit`. |
| `aria-label` | `string` | Accessible name. When set, renders with `role="img"`; when omitted, renders as decorative. |
| `id` | `string` | Forwarded to the SVG root. |
| `className` | `string` | Styling hook. |
| `style` | `CSSProperties` | Inline style override. |
| `onClick` | `MouseEventHandler<SVGSVGElement>` | Forwarded SVG event handler. Prefer buttons for interactive semantics. |

All standard SVG props except `children`, `dangerouslySetInnerHTML`, and raw `color` pass through to the SVG root.

## Size

Named sizes align to the Deweyou component scale:

- `xs`: dense inline affordances
- `sm`: compact controls and metadata
- `md`: default component icon size
- `lg`: prominent controls
- `xl`: larger visual moments

Numeric and CSS length values remain available for precise composition needs.

## Color

`color="inherit"` uses `currentColor`. Semantic colors map to Deweyou theme tokens:

- `neutral`: `var(--ui-color-text)`
- `primary`: `var(--ui-color-brand-text)`
- `danger`: `var(--ui-color-danger-text)`

Prefer surrounding text color or these semantic values over hard-coded colors.

## Accessibility

- Icons without `aria-label` render with `aria-hidden="true"`.
- Icons with `aria-label` render with `role="img"`.
- Interactive controls should own interaction semantics. Use `IconButton`, `Button.Icon`, or a native button instead of making an icon SVG behave like a button.

## Adding Icons

Add icons by editing `src/icon-registry/index.ts`, then run:

```bash
pnpm --dir packages/react-icons run generate-icons
```

Use `source: 'tdesign'` with a `sourceKey` for upstream glyphs. Use `source: 'local'` with a checked-in SVG under `src/icon-registry/assets/` when an icon is not available upstream.

## Source Attribution

Default icon glyphs are provided by `tdesign-icons-svg` under the MIT license. Deweyou Design owns the curated registry, public names, generated React components, props contract, accessibility behavior, and release policy.

## License

MIT
```

- [ ] **Step 2: Update package instructions**

Replace the constraint list in `packages/react-icons/CLAUDE.md` with:

```md
## 约束

- 公开 package surface 仅限图标相关类型，以及命名的 `XxxIcon` 导出；不要恢复通用 `Icon` registry 或子路径生成体系。
- `tdesign-icons-svg` 是默认 SVG 资产来源，但只能通过 Deweyou 自己维护的 curated registry 读取，不要从上游 bulk generate。
- 上游 SVG 来源、registry、生成器和本地 SVG 资产必须保持在 `packages/react-icons` 内部。
- `aria-label` 是默认无障碍开关；不要增加单独的 `decorative` 或 `label` prop。
- `size` 和 `color` 必须对齐设计系统语义，保留常见 SVG props 透传。
- 图标默认颜色应通过 `currentColor` 继承外层 UI。
- 生成文件必须由 `scripts/generate-icons.mjs` 产生，不要手写修改 generated 文件。
- 单测应与源码单元同目录放置为 `index.test.ts` 或 `index.test.tsx`；tree-shaking contract 可作为 `tree-shaking.test.ts` 放在 `src/icons/`。
```

- [ ] **Step 3: Update design-system guidance**

In `docs/design/system.md`, replace the old Tabler-specific icon guidance with:

```md
所有生产组件中的图标都从 `@deweyou-design/react-icons` 导入。组件内部不要维护私有 SVG 图标，也不要直接依赖上游 icon 包。

- `@deweyou-design/react-icons` 由 Deweyou curated registry 驱动，默认 SVG 来源为 `tdesign-icons-svg`。
- 应用代码优先使用命名导入，例如 `import { SearchIcon } from '@deweyou-design/react-icons'`，不要为了普通使用场景引入整个 icon namespace。
- 图标支持 `xs` / `sm` / `md` / `lg` / `xl` 尺寸语义，默认 `md`。
- 图标支持 `inherit` / `neutral` / `primary` / `danger` 颜色语义，默认 `inherit`。
- icon-only action 必须使用 `IconButton`、`Button.Icon` 或带清晰 accessible name 的交互控件承载语义。
```

- [ ] **Step 4: Commit docs**

Run:

```bash
git add packages/react-icons/README.md packages/react-icons/CLAUDE.md docs/design/system.md
git commit -m "docs(react-icons): document tdesign codegen usage"
```

---

### Task 7: Update Storybook Icon Review Surface

**Files:**
- Modify: `apps/storybook/src/stories/Icon.stories.tsx`

- [ ] **Step 1: Replace the icon story**

Replace `apps/storybook/src/stories/Icon.stories.tsx` with:

```tsx
import type { Meta, StoryObj } from '@storybook/react';

import {
  AlertCircleIcon,
  CheckIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  type IconColor,
  type IconSize,
  InfoIcon,
  Menu2Icon,
  SearchIcon,
  XIcon,
} from '@deweyou-design/react-icons';

const galleryItems = [
  { name: 'alert-circle', Component: AlertCircleIcon },
  { name: 'check', Component: CheckIcon },
  { name: 'chevron-left', Component: ChevronLeftIcon },
  { name: 'chevron-right', Component: ChevronRightIcon },
  { name: 'x', Component: XIcon },
  { name: 'info', Component: InfoIcon },
  { name: 'menu-2', Component: Menu2Icon },
  { name: 'search', Component: SearchIcon },
] as const;

const storyStyles = {
  grid: {
    display: 'grid',
    gap: '12px',
    gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
    width: 'min(840px, 100%)',
  },
  card: {
    alignItems: 'center',
    background: 'color-mix(in srgb, var(--ui-color-surface) 92%, white)',
    border: '1px solid var(--ui-color-border)',
    borderRadius: '4px',
    color: 'var(--ui-color-text)',
    display: 'grid',
    gap: '10px',
    justifyItems: 'center',
    padding: '16px',
  },
  meta: {
    color: 'var(--ui-color-text-muted)',
    fontFamily: 'var(--ui-font-mono)',
    fontSize: '0.8rem',
  },
} as const;

const meta = {
  title: 'Components/Icon',
  component: SearchIcon,
  tags: ['autodocs'],
  args: {
    size: 'md',
  },
  argTypes: {
    size: {
      description: 'Design-system icon size. Also accepts number and CSS length values.',
      control: { type: 'select' },
      options: ['xs', 'sm', 'md', 'lg', 'xl'],
      table: {
        type: { summary: "'xs' | 'sm' | 'md' | 'lg' | 'xl' | number | string" },
        defaultValue: { summary: "'md'" },
      },
    },
    color: {
      description: 'Design-system icon color.',
      control: { type: 'select' },
      options: ['inherit', 'neutral', 'primary', 'danger'],
      table: {
        type: { summary: "'inherit' | 'neutral' | 'primary' | 'danger'" },
        defaultValue: { summary: "'inherit'" },
      },
    },
    'aria-label': {
      description:
        'Accessible label. When provided the icon renders with `role="img"` and `aria-label`. When omitted the icon is decorative (`aria-hidden="true"`).',
      control: { type: 'text' },
      table: {
        type: { summary: 'string | undefined' },
        defaultValue: { summary: 'undefined' },
      },
    },
  },
  parameters: {
    docs: {
      description: {
        component:
          'Named Deweyou icon components generated from a curated registry backed by tdesign-icons-svg. Import named exports directly from `@deweyou-design/react-icons`; namespace imports are only for catalog surfaces.',
      },
    },
  },
} satisfies Meta<typeof SearchIcon>;

export default meta;

type Story = StoryObj<typeof meta>;

const CatalogGallery = () => {
  return (
    <div style={storyStyles.grid}>
      {galleryItems.map(({ Component, name }) => (
        <article key={name} style={storyStyles.card}>
          <Component size="lg" />
          <strong>{name}</strong>
          <code style={storyStyles.meta}>{name}</code>
        </article>
      ))}
    </div>
  );
};

const SizingGallery = () => {
  const sizes = ['xs', 'sm', 'md', 'lg', 'xl'] as const satisfies readonly IconSize[];
  return (
    <div style={{ ...storyStyles.grid, gridTemplateColumns: 'repeat(5, minmax(110px, 1fr))' }}>
      {sizes.map((size) => (
        <article key={size} style={storyStyles.card}>
          <SearchIcon size={size} />
          <strong>{size}</strong>
        </article>
      ))}
    </div>
  );
};

const ColorGallery = () => {
  const colors = ['inherit', 'neutral', 'primary', 'danger'] as const satisfies readonly IconColor[];
  return (
    <div style={{ ...storyStyles.grid, gridTemplateColumns: 'repeat(4, minmax(130px, 1fr))' }}>
      {colors.map((color) => (
        <article key={color} style={storyStyles.card}>
          <AlertCircleIcon color={color} size="lg" />
          <strong>{color}</strong>
        </article>
      ))}
    </div>
  );
};

const AccessibilityGallery = () => {
  return (
    <div style={storyStyles.grid}>
      <article style={storyStyles.card}>
        <Menu2Icon size="lg" />
        <strong>Decorative</strong>
        <span style={storyStyles.meta}>aria-hidden=true</span>
      </article>
      <article style={storyStyles.card}>
        <InfoIcon aria-label="Information" size="lg" />
        <strong>Labeled</strong>
        <span style={storyStyles.meta}>role=img</span>
      </article>
    </div>
  );
};

export const Catalog: Story = {
  render: () => <CatalogGallery />,
};

export const Sizes: Story = {
  render: () => <SizingGallery />,
};

export const Colors: Story = {
  render: () => <ColorGallery />,
};

export const Accessibility: Story = {
  render: () => <AccessibilityGallery />,
};

import { expect, within } from 'storybook/test';

export const Interaction: Story = {
  name: 'Interaction',
  render: () => (
    <>
      <CatalogGallery />
      <SizingGallery />
      <ColorGallery />
      <AccessibilityGallery />
    </>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByText('search')).toBeInTheDocument();
    await expect(canvas.getByText('xs')).toBeInTheDocument();
    await expect(canvas.getByText('primary')).toBeInTheDocument();
    await expect(canvas.getByRole('img', { name: 'Information' })).toBeInTheDocument();
  },
};
```

- [ ] **Step 2: Run Storybook lint/type checks via repo check**

Run:

```bash
vp check
```

Expected:

```text
PASS check, or only unrelated pre-existing failures.
```

- [ ] **Step 3: Commit Storybook update**

Run:

```bash
git add apps/storybook/src/stories/Icon.stories.tsx
git commit -m "docs(storybook): update icon review surface"
```

---

### Task 8: Update Website Icon Page

**Files:**
- Modify: `apps/website/src/pages/icons.tsx`
- Modify: `apps/website/src/pages/icons.test.tsx`

- [ ] **Step 1: Update website icon tests**

Replace `apps/website/src/pages/icons.test.tsx` with:

```tsx
// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vite-plus/test';

import { IconsPage } from './icons';

describe('IconsPage', () => {
  it('documents the TDesign source and Deweyou curated list', () => {
    render(<IconsPage />);

    expect(screen.getByText(/tdesign-icons-svg/i)).toBeTruthy();
    expect(screen.getByText(/Deweyou curated/i)).toBeTruthy();
  });

  it('renders named size and color examples', () => {
    render(<IconsPage />);

    expect(screen.getByText('size="sm"')).toBeTruthy();
    expect(screen.getByText('color="primary"')).toBeTruthy();
  });
});
```

- [ ] **Step 2: Update website page**

In `apps/website/src/pages/icons.tsx`, keep the catalog import but update types and copy:

```tsx
import { useState } from 'react';

import { Input, Text, toast } from '@deweyou-design/react';
import * as Icons from '@deweyou-design/react-icons';
import type { IconProps } from '@deweyou-design/react-icons';

import styles from './icons.module.less';

type IconEntry = {
  name: string;
  Icon: React.ComponentType<IconProps>;
};

const ALL_ICONS: IconEntry[] = (
  Object.entries(Icons) as Array<[string, React.ComponentType<IconProps>]>
)
  .filter(([key]) => key.endsWith('Icon'))
  .map(([exportName, Icon]) => ({
    name: exportName
      .replace(/Icon$/, '')
      .replace(/([A-Z])/g, (match, letter, index) =>
        index === 0 ? letter.toLowerCase() : `-${letter.toLowerCase()}`,
      ),
    Icon,
  }));
```

Replace the subtitle block with:

```tsx
<Text className={styles.subtitle} variant="caption">
  @deweyou-design/react-icons · default glyphs from tdesign-icons-svg · Deweyou curated list
</Text>
<Text className={styles.subtitle} variant="caption">
  Application code should use direct named imports. This catalog uses a namespace import because it intentionally renders every supported icon.
</Text>
<Text className={styles.subtitle} variant="caption">
  Examples: &lt;SearchIcon size="sm" /&gt; · &lt;SearchIcon color="primary" /&gt;
</Text>
```

Keep catalog rendering and update icon usage:

```tsx
<Icon aria-hidden size="md" />
```

- [ ] **Step 3: Run website tests**

Run:

```bash
vp test apps/website/src/pages/icons.test.tsx
```

Expected:

```text
PASS apps/website/src/pages/icons.test.tsx
```

- [ ] **Step 4: Commit website update**

Run:

```bash
git add apps/website/src/pages/icons.tsx apps/website/src/pages/icons.test.tsx
git commit -m "docs(website): update icon catalog guidance"
```

---

### Task 9: Validate Package Boundaries And Build Output

**Files:**
- Modify if needed: `packages/react/tests/workspace-boundaries.test.ts`
- Modify if needed: `packages/react-icons/package.json`
- Modify if needed: `packages/react-icons/vite.config.ts`

- [ ] **Step 1: Run focused react-icons tests**

Run:

```bash
vp test packages/react-icons/src
```

Expected:

```text
PASS all react-icons tests, including wrapper, public surface, and tree-shaking.
```

- [ ] **Step 2: Run workspace boundary tests**

Run:

```bash
vp test packages/react/tests/workspace-boundaries.test.ts
```

Expected:

```text
PASS, or FAIL only where the test still expects @tabler/icons-react.
```

If the test expects Tabler, update the expectation from:

```ts
expect(iconsPackage.dependencies).toMatchObject({
  '@tabler/icons-react': '^3',
});
```

to:

```ts
expect(iconsPackage.dependencies ?? {}).not.toHaveProperty('@tabler/icons-react');
expect(iconsPackage.dependencies ?? {}).not.toHaveProperty('tdesign-icons-svg');
expect(iconsPackage.devDependencies ?? {}).toMatchObject({
  'tdesign-icons-svg': '0.4.2',
});
```

- [ ] **Step 3: Build react-icons**

Run:

```bash
vp run react-icons#build
```

Expected:

```text
PASS build.
dist/package.json has no runtime tdesign-icons-svg dependency.
```

- [ ] **Step 4: Inspect published manifest**

Run:

```bash
node -e "const fs = require('node:fs'); const pkg = JSON.parse(fs.readFileSync('packages/react-icons/dist/package.json', 'utf8')); console.log(JSON.stringify({ dependencies: pkg.dependencies, devDependencies: pkg.devDependencies, sideEffects: pkg.sideEffects, exports: pkg.exports }, null, 2));"
```

Expected:

```json
{
  "sideEffects": false,
  "exports": {
    ".": "./index.mjs",
    "./package.json": "./package.json"
  }
}
```

`dependencies` must not contain `tdesign-icons-svg` or `@tabler/icons-react`.

- [ ] **Step 5: Commit boundary/build adjustments**

Run:

```bash
git add packages/react/tests/workspace-boundaries.test.ts packages/react-icons/package.json packages/react-icons/vite.config.ts packages/react-icons/dist
git commit -m "build(react-icons): preserve published icon boundaries"
```

If `packages/react-icons/dist` is ignored and not tracked, commit only source and config files.

---

### Task 10: Full Verification

**Files:**
- No planned edits.

- [ ] **Step 1: Run repository check**

Run:

```bash
vp check
```

Expected:

```text
PASS
```

- [ ] **Step 2: Run repository tests**

Run:

```bash
vp test
```

Expected:

```text
PASS
```

- [ ] **Step 3: Run Storybook interaction tests**

Run:

```bash
vp run storybook#build
npx serve apps/storybook/storybook-static -p 6106 --no-clipboard
vp run storybook#test
```

Expected:

```text
Storybook build succeeds.
Storybook test runner passes Icon Interaction and existing interaction stories.
```

Stop the `serve` process after the test run.

- [ ] **Step 4: Run website build**

Run:

```bash
vp run website#build
```

Expected:

```text
PASS website build.
```

- [ ] **Step 5: Run full recursive build**

Run:

```bash
vp run build -r
```

Expected:

```text
PASS recursive build.
```

- [ ] **Step 6: Final status check**

Run:

```bash
git status --short
```

Expected:

```text
No uncommitted files except intentionally generated artifacts already reviewed.
```
