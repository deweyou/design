import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { expect, test } from 'vite-plus/test';

const root = resolve(import.meta.dirname, '../../..');

const read = (relativePath: string) => readFileSync(resolve(root, relativePath), 'utf8');

test('repository guidance documents the shared authoring conventions', () => {
  const rootAgents = read('CLAUDE.md');
  const componentAgents = read('packages/components/CLAUDE.md');
  const hookAgents = read('packages/hooks/CLAUDE.md');
  const utilAgents = read('packages/utils/CLAUDE.md');
  const storybookAgents = read('apps/storybook/CLAUDE.md');
  const websiteAgents = read('apps/website/CLAUDE.md');

  expect(rootAgents).toContain('函数默认使用**箭头函数**风格');
  expect(rootAgents).toContain('React 组件必须使用 **TSX 文件**编写');
  expect(rootAgents).toContain('小写名称并使用连字符分隔');
  expect(rootAgents).toContain('colocate 单测');
  expect(rootAgents).not.toContain(
    'This project is using Vite+, the unified toolchain built on top of Vite',
  );

  expect(componentAgents).toContain('index.test.ts');
  expect(componentAgents).toContain('默认使用箭头函数');
  expect(componentAgents).not.toContain('Applies to');
  expect(hookAgents).toContain('src/<hook-name>/');
  expect(hookAgents).toContain('默认使用箭头函数');
  expect(hookAgents).not.toContain('Only reusable React hooks belong here.');
  expect(utilAgents).toContain('小写加连字符命名');
  expect(utilAgents).toContain('`packages/utils/tests` 下的顶层测试');
  expect(storybookAgents).toContain('仅用于内部评审和状态验证');
  expect(storybookAgents).toContain('Interaction');
  expect(storybookAgents).toContain('play');
  expect(websiteAgents).toContain('公开文档和精选 demo 的承载面');
});

test('repository automation records the lint and example-code constraints', () => {
  const lintConfig = read('vite.config.ts');
  const websiteEntryPath = resolve(root, 'apps/website/src/main.tsx');

  expect(lintConfig).toContain("'func-style': 'error'");
  expect(lintConfig).toContain("'unicorn/filename-case'");
  expect(existsSync(websiteEntryPath)).toBe(true);
  expect(readFileSync(websiteEntryPath, 'utf8')).not.toContain('React.createElement');
});

test('governed unit tests are colocated and legacy top-level unit tests are removed', () => {
  expect(existsSync(resolve(root, 'packages/components/src/button/index.test.ts'))).toBe(true);
  expect(existsSync(resolve(root, 'packages/hooks/src/use-theme-mode/index.test.ts'))).toBe(true);
  expect(existsSync(resolve(root, 'packages/components/tests/index.test.ts'))).toBe(false);
  expect(existsSync(resolve(root, 'packages/hooks/tests/index.test.ts'))).toBe(false);
});
