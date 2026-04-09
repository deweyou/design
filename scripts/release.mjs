#!/usr/bin/env node
/**
 * release.mjs
 *
 * npm 发包入口脚本。
 * 用法：node scripts/release.mjs <beta|stable> [--dry-run]
 *
 * 退出码：
 *   0  发布成功（或无包需要发布）
 *   1  参数或分支校验失败
 *   2  npm 鉴权失败
 *   3  构建失败
 *   4  发布失败
 */

import { execSync, spawnSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const REPO_ROOT = resolve(import.meta.dirname, '..');

// ── 工具 ──────────────────────────────────────────────────────────────────────

const run = (cmd, opts = {}) => execSync(cmd, { encoding: 'utf8', cwd: REPO_ROOT, ...opts }).trim();

const exit = (code, msg) => {
  console.error(`\n✖  ${msg}`);
  process.exit(code);
};

// ── 参数解析 ──────────────────────────────────────────────────────────────────

const [, , channelArg, ...flags] = process.argv;
const dryRun = flags.includes('--dry-run');

if (!['beta', 'stable'].includes(channelArg)) {
  console.error('用法：node scripts/release.mjs <beta|stable> [--dry-run]');
  console.error('');
  console.error('  beta    从当前分支发布 prerelease 包（dist-tag: beta）');
  console.error('  stable  从 main 分支发布正式包（dist-tag: latest）');
  process.exit(1);
}

// ── 分支校验 ──────────────────────────────────────────────────────────────────

const currentBranch =
  run('git branch --show-current', { ignoreError: true }) ||
  run('git rev-parse --abbrev-ref HEAD', { ignoreError: true }) ||
  '';

if (channelArg === 'beta' && currentBranch === 'main') {
  exit(1, 'beta 包不能从 main 分支发布。\n   请切换到 feature 分支后再运行。');
}

if (channelArg === 'stable' && currentBranch !== 'main') {
  exit(1, `正式版只能从 main 分支发布。\n   当前分支：${currentBranch}`);
}

console.log(`✔  分支校验通过（分支：${currentBranch}，通道：${channelArg}）`);

// ── npm 鉴权校验 ──────────────────────────────────────────────────────────────

if (!dryRun) {
  const whoami = spawnSync('npm', ['whoami'], { encoding: 'utf8', cwd: REPO_ROOT });
  if (whoami.status !== 0) {
    exit(2, 'npm 鉴权失败。\n   本地请运行 npm login，CI 请确认 NODE_AUTH_TOKEN 已配置。');
  }
  console.log(`✔  npm 鉴权通过（用户：${whoami.stdout.trim()}）`);
} else {
  console.log('ℹ  dry-run 模式：跳过 npm 鉴权校验');
}

// ── 检测变更 & bump 版本 ──────────────────────────────────────────────────────

const PUBLISHABLE_PACKAGES = [
  {
    shortName: 'react',
    npmName: '@deweyou-design/react',
    dir: resolve(REPO_ROOT, 'packages/react'),
  },
  {
    shortName: 'react-hooks',
    npmName: '@deweyou-design/react-hooks',
    dir: resolve(REPO_ROOT, 'packages/react-hooks'),
  },
  {
    shortName: 'react-icons',
    npmName: '@deweyou-design/react-icons',
    dir: resolve(REPO_ROOT, 'packages/react-icons'),
  },
  {
    shortName: 'styles',
    npmName: '@deweyou-design/styles',
    dir: resolve(REPO_ROOT, 'packages/styles'),
  },
  {
    shortName: 'utils',
    npmName: '@deweyou-design/utils',
    dir: resolve(REPO_ROOT, 'packages/utils'),
  },
];

const getLastTag = (shortName) => {
  const out = run(`git tag --list "${shortName}@*" --sort=-v:refname`, { ignoreError: true });
  const tags = out.split('\n').filter(Boolean);
  return tags.length > 0 ? tags[0] : null;
};

const hasChanges = (pkgDir, lastTag) => {
  if (!lastTag) return true;
  return run(`git log ${lastTag}..HEAD --oneline -- ${pkgDir}`, { ignoreError: true }).length > 0;
};

const getCurrentVersion = (pkgDir) =>
  JSON.parse(readFileSync(resolve(pkgDir, 'package.json'), 'utf8')).version;

const getRegistryVersion = (npmName) => {
  try {
    return run(`npm view ${npmName} version`);
  } catch {
    return null;
  }
};

const semverGt = (a, b) => {
  const parse = (v) => {
    const [main, pre] = v.split('-');
    return { parts: main.split('.').map(Number), pre: pre ?? null };
  };
  const va = parse(a);
  const vb = parse(b);
  for (let i = 0; i < 3; i++) {
    if ((va.parts[i] ?? 0) > (vb.parts[i] ?? 0)) return true;
    if ((va.parts[i] ?? 0) < (vb.parts[i] ?? 0)) return false;
  }
  if (!va.pre && vb.pre) return true;
  if (va.pre && !vb.pre) return false;
  if (va.pre && vb.pre) return va.pre > vb.pre;
  return false;
};

// changelogen 找不到可 bump 的 commit 时，手动做 patch bump 作为兜底。
const fallbackBump = (version, channel) => {
  const [main, pre] = version.split(/-(.+)/);
  const [major, minor, patch] = main.split('.').map(Number);
  if (channel === 'beta') {
    if (pre?.startsWith('beta.')) {
      return `${main}-beta.${Number(pre.slice(5)) + 1}`;
    }
    return `${major}.${minor}.${patch + 1}-beta.0`;
  }
  // stable: 如果当前是 prerelease 则去掉后缀，否则 patch+1
  return pre ? main : `${major}.${minor}.${patch + 1}`;
};

const bumpPackage = (pkgDir, channel, lastTag) => {
  const prevVersion = getCurrentVersion(pkgDir);
  const changelogPath = resolve(pkgDir, 'CHANGELOG.md');
  const changelogen = resolve(REPO_ROOT, 'node_modules/.bin/changelogen');
  const fromFlag = lastTag ? `--from ${lastTag}` : '';
  const prereleaseFlag = channel === 'beta' ? '--prerelease beta' : '';
  const dryFlag = dryRun ? '--dry' : '';
  const cmd = [
    changelogen,
    `--dir ${pkgDir}`,
    `--output ${changelogPath}`,
    fromFlag,
    prereleaseFlag,
    '--bump',
    '--no-commit',
    '--no-tag',
    dryFlag,
  ]
    .filter(Boolean)
    .join(' ');
  run(cmd);

  let newVersion = getCurrentVersion(pkgDir);
  if (newVersion === prevVersion) {
    // changelogen 未找到可 bump 的 commit，回退到 patch bump
    newVersion = fallbackBump(prevVersion, channel);
    const pkgPath = resolve(pkgDir, 'package.json');
    const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'));
    pkg.version = newVersion;
    writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n');
  }
  return newVersion;
};

console.log(`\n🔍 扫描变更包...\n`);

const toRelease = [];

for (const pkg of PUBLISHABLE_PACKAGES) {
  const lastTag = getLastTag(pkg.shortName);
  if (!hasChanges(pkg.dir, lastTag)) {
    console.log(`  ⏭  ${pkg.npmName}: 无变更，跳过`);
    continue;
  }

  console.log(`  📦 ${pkg.npmName}: 检测到变更（上次 tag: ${lastTag ?? '首次发布'}）`);

  const newVersion = bumpPackage(pkg.dir, channelArg, lastTag);
  console.log(`  ✔  ${pkg.npmName}: ${newVersion}${dryRun ? ' (dry-run)' : ''}`);

  if (!dryRun) {
    const registryVersion = getRegistryVersion(pkg.npmName);
    if (registryVersion && !semverGt(newVersion, registryVersion)) {
      exit(1, `${pkg.npmName}: 版本倒退 — 待发布 ${newVersion} ≤ registry ${registryVersion}`);
    }
  }

  toRelease.push({ ...pkg, version: newVersion });
}

if (toRelease.length === 0) {
  console.log('\n✅ 无包需要发布。');
  process.exit(0);
}

console.log('\n📋 待发布包：');
for (const pkg of toRelease) {
  console.log(`   ${pkg.npmName}@${pkg.version}`);
}

if (dryRun) {
  const distTag = channelArg === 'beta' ? 'beta' : 'latest';
  console.log(`\nℹ  dry-run 完成。实际发布时将使用 dist-tag: ${distTag}`);
  process.exit(0);
}

// ── Git commit + tag + push ───────────────────────────────────────────────────

console.log('\n📝 提交版本变更...');
run('git add -A');
run('git commit --no-verify -m "chore: release packages"');

console.log('🏷️  打包级 tag...');
for (const pkg of toRelease) {
  const tag = `${pkg.shortName}@${pkg.version}`;
  run(`git tag ${tag}`);
  console.log(`  🏷  ${tag}`);
}

console.log('🚀 推送...');
run('git push --follow-tags');

// ── 全量构建 ──────────────────────────────────────────────────────────────────

console.log('\n🔨 构建所有包...');
const build = spawnSync('pnpm', ['exec', 'vp', 'run', 'build', '-r'], {
  stdio: 'inherit',
  cwd: REPO_ROOT,
  shell: true,
});
if (build.status !== 0) {
  exit(3, '构建失败。');
}
console.log('✔  构建完成');

// ── 发布各包 ──────────────────────────────────────────────────────────────────

const distTag = channelArg === 'beta' ? 'beta' : 'latest';
console.log(`\n📤 发布包（dist-tag: ${distTag})...`);

const failed = [];

for (const pkg of toRelease) {
  const distDir = resolve(pkg.dir, 'dist');
  const result = spawnSync('npm', ['publish', distDir, '--tag', distTag, '--access', 'public'], {
    stdio: 'inherit',
    cwd: REPO_ROOT,
    encoding: 'utf8',
  });

  if (result.status === 0) {
    console.log(`  ✔  ${pkg.npmName}@${pkg.version}  (tag: ${distTag})`);
  } else {
    const stderr = result.stderr ?? '';
    if (
      stderr.includes('already published') ||
      stderr.includes('cannot publish over') ||
      stderr.includes('409')
    ) {
      console.log(`  ⏭  ${pkg.npmName}@${pkg.version} 已发布，跳过`);
    } else {
      console.error(`  ✖  ${pkg.npmName}@${pkg.version} 发布失败`);
      failed.push(`${pkg.npmName}@${pkg.version}`);
    }
  }
}

if (failed.length > 0) {
  exit(4, `部分包发布失败：${failed.join(', ')}`);
}

console.log('\n✅ 已发布包：');
for (const pkg of toRelease) {
  console.log(`  ${pkg.npmName}@${pkg.version}  (tag: ${distTag})`);
}
