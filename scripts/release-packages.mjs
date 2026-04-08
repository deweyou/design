#!/usr/bin/env node
/**
 * release-packages.mjs
 *
 * 检测各包变更、调用 changelogen 完成版本 bump + changelog 生成、收集待发布包列表。
 * 用法：node scripts/release-packages.mjs <channel> [--dry-run]
 *   channel: "beta" | "stable"
 */

import { execSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

// ── 可发布包列表 ──────────────────────────────────────────────────────────────

const REPO_ROOT = resolve(import.meta.dirname, '..');

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

// ── 工具函数 ──────────────────────────────────────────────────────────────────

const run = (cmd, opts = {}) => {
  try {
    return execSync(cmd, { encoding: 'utf8', cwd: REPO_ROOT, ...opts }).trim();
  } catch (err) {
    if (opts.ignoreError) return '';
    throw err;
  }
};

/**
 * 获取某个包的最新发布 tag。
 * 使用 --sort=-v:refname 按版本号降序排列，取第一个。
 * @param {string} shortName
 * @returns {string|null}
 */
const getLastTag = (shortName) => {
  const output = run(`git tag --list "${shortName}@*" --sort=-v:refname`, { ignoreError: true });
  const tags = output.split('\n').filter(Boolean);
  return tags.length > 0 ? tags[0] : null;
};

/**
 * 判断自上次 tag 以来该包目录是否有变更 commit。
 * 首次发布（lastTag 为 null）视为有变更。
 * @param {string} pkgDir
 * @param {string|null} lastTag
 * @returns {boolean}
 */
const hasChanges = (pkgDir, lastTag) => {
  if (!lastTag) return true;
  const range = `${lastTag}..HEAD`;
  const output = run(`git log ${range} --oneline -- ${pkgDir}`, { ignoreError: true });
  return output.length > 0;
};

/**
 * 获取包当前版本号（从 package.json 读取）。
 * @param {string} pkgDir
 * @returns {string}
 */
const getCurrentVersion = (pkgDir) => {
  const pkg = JSON.parse(readFileSync(resolve(pkgDir, 'package.json'), 'utf8'));
  return pkg.version;
};

/**
 * 检查 npm registry 上已有的最新版本，用于防倒退校验。
 * 首次发布（包不存在）返回 null。
 * @param {string} npmName
 * @returns {string|null}
 */
const getRegistryVersion = (npmName) => {
  try {
    return run(`npm view ${npmName} version`, { ignoreError: false });
  } catch {
    return null; // 包不存在（首次发布）
  }
};

/**
 * 比较两个 semver 版本，返回 true 表示 a > b。
 * 简单实现：依赖 Node.js 内置无法直接比较 semver，使用数组逐段比较。
 * @param {string} a
 * @param {string} b
 * @returns {boolean}
 */
const semverGt = (a, b) => {
  const parseVersion = (v) => {
    const [main, pre] = v.split('-');
    const parts = main.split('.').map(Number);
    return { parts, pre: pre ?? null };
  };

  const va = parseVersion(a);
  const vb = parseVersion(b);

  for (let i = 0; i < 3; i++) {
    if ((va.parts[i] ?? 0) > (vb.parts[i] ?? 0)) return true;
    if ((va.parts[i] ?? 0) < (vb.parts[i] ?? 0)) return false;
  }

  // 主版本号相同时：无 prerelease > 有 prerelease（1.0.0 > 1.0.0-beta.1）
  if (!va.pre && vb.pre) return true;
  if (va.pre && !vb.pre) return false;

  // 两者均有 prerelease：按字符串比较序号
  if (va.pre && vb.pre) return va.pre > vb.pre;

  return false; // 完全相等
};

/**
 * 调用 changelogen 对指定包进行版本 bump 和 changelog 生成。
 * @param {string} pkgDir
 * @param {string} channel - "beta" | "stable"
 * @param {string|null} lastTag
 * @param {boolean} dryRun
 * @returns {string} 新版本号
 */
const bumpPackage = (pkgDir, channel, lastTag, dryRun) => {
  const changelogPath = resolve(pkgDir, 'CHANGELOG.md');
  const fromFlag = lastTag ? `--from ${lastTag}` : '';
  const prereleaseFlag = channel === 'beta' ? '--prerelease beta' : '';

  const cmd = [
    'changelogen',
    `--dir ${pkgDir}`,
    `--output ${changelogPath}`,
    fromFlag,
    prereleaseFlag,
    '--bump',
    '--no-commit',
    '--no-tag',
    dryRun ? '--dry' : '',
  ]
    .filter(Boolean)
    .join(' ');

  run(`./node_modules/.bin/${cmd}`);
  return getCurrentVersion(pkgDir);
};

// ── 主流程 ────────────────────────────────────────────────────────────────────

/**
 * 遍历所有可发布包，检测变更，bump 版本，返回待发布包列表。
 * @param {string} channel - "beta" | "stable"
 * @param {boolean} dryRun
 * @returns {{ shortName: string, npmName: string, dir: string, version: string }[]}
 */
const releasePackages = (channel, dryRun) => {
  const toRelease = [];

  for (const pkg of PUBLISHABLE_PACKAGES) {
    const lastTag = getLastTag(pkg.shortName);
    const changed = hasChanges(pkg.dir, lastTag);

    if (!changed) {
      console.log(`  ⏭  ${pkg.npmName}: 无变更，跳过`);
      continue;
    }

    console.log(`  📦 ${pkg.npmName}: 检测到变更（上次 tag: ${lastTag ?? '首次发布'}）`);

    // 版本防倒退检查
    const registryVersion = getRegistryVersion(pkg.npmName);
    if (registryVersion) {
      const currentVersion = getCurrentVersion(pkg.dir);
      if (!dryRun && !semverGt(currentVersion, registryVersion)) {
        // changelogen 还没 bump，先检查当前版本，实际比较在 bump 后进行
        // 此处记录 registryVersion 供 bump 后校验
        console.log(`     registry 版本: ${registryVersion}`);
      }
    }

    const newVersion = bumpPackage(pkg.dir, channel, lastTag, dryRun);
    console.log(`  ✔  ${pkg.npmName}: ${newVersion}${dryRun ? ' (dry-run)' : ''}`);

    // bump 后执行防倒退校验
    if (!dryRun && registryVersion && !semverGt(newVersion, registryVersion)) {
      console.error(
        `  ✖  ${pkg.npmName}: 版本倒退错误 — 待发布 ${newVersion} ≤ registry ${registryVersion}`,
      );
      process.exit(1);
    }

    toRelease.push({ ...pkg, version: newVersion });
  }

  return toRelease;
};

// ── CLI 入口 ──────────────────────────────────────────────────────────────────

const [, , channelArg, ...flags] = process.argv;
const dryRun = flags.includes('--dry-run');

if (!['beta', 'stable'].includes(channelArg)) {
  console.error('用法：node scripts/release-packages.mjs <beta|stable> [--dry-run]');
  process.exit(1);
}

console.log(`\n🔍 扫描变更包（通道：${channelArg}${dryRun ? '，dry-run' : ''}）\n`);

const packages = releasePackages(channelArg, dryRun);

if (packages.length === 0) {
  console.log('\n✅ 无包需要发布。\n');
} else {
  console.log('\n📋 待发布包：');
  for (const pkg of packages) {
    console.log(`   ${pkg.npmName}@${pkg.version}`);
  }
  console.log();
}

// 输出 JSON 供 release.sh 解析
process.stdout.write(`\nRELEASE_PACKAGES=${JSON.stringify(packages)}\n`);
