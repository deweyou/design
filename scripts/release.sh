#!/usr/bin/env bash
# release.sh
#
# npm 发包入口脚本。
# 用法：scripts/release.sh <beta|stable> [--dry-run]
#
# 退出码：
#   0  发布成功
#   1  参数或分支校验失败
#   2  npm 鉴权失败
#   3  构建失败
#   4  发布失败

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_ROOT"

# ── 参数解析 ──────────────────────────────────────────────────────────────────

CHANNEL="${1:-}"
DRY_RUN=false

for arg in "${@:2}"; do
  if [[ "$arg" == "--dry-run" ]]; then
    DRY_RUN=true
  fi
done

if [[ "$CHANNEL" != "beta" && "$CHANNEL" != "stable" ]]; then
  echo "用法：scripts/release.sh <beta|stable> [--dry-run]" >&2
  echo "" >&2
  echo "  beta    从当前分支发布 prerelease 包（dist-tag: beta）" >&2
  echo "  stable  从 main 分支发布正式包（dist-tag: latest）" >&2
  exit 1
fi

# ── 分支校验 ──────────────────────────────────────────────────────────────────

CURRENT_BRANCH="$(git branch --show-current)"

if [[ "$CHANNEL" == "beta" && "$CURRENT_BRANCH" == "main" ]]; then
  echo "✖  错误：beta 包不能从 main 分支发布。" >&2
  echo "   请切换到 feature 分支后再运行：scripts/release.sh beta" >&2
  exit 1
fi

if [[ "$CHANNEL" == "stable" && "$CURRENT_BRANCH" != "main" ]]; then
  echo "✖  错误：正式版只能从 main 分支发布。" >&2
  echo "   当前分支：$CURRENT_BRANCH" >&2
  echo "   请切换到 main 分支后再运行：scripts/release.sh stable" >&2
  exit 1
fi

echo "✔  分支校验通过（分支：$CURRENT_BRANCH，通道：$CHANNEL）"

# ── npm 鉴权校验 ──────────────────────────────────────────────────────────────

if [[ "$DRY_RUN" == "false" ]]; then
  if ! npm whoami &>/dev/null; then
    echo "✖  错误：npm 鉴权失败。" >&2
    echo "   本地请运行 npm login，CI 请确认 NODE_AUTH_TOKEN 已配置。" >&2
    exit 2
  fi
  echo "✔  npm 鉴权通过（用户：$(npm whoami)）"
else
  echo "ℹ  dry-run 模式：跳过 npm 鉴权校验"
fi

# ── 调用 release-packages.mjs 检测变更并 bump 版本 ────────────────────────────

echo ""
DRY_RUN_FLAG=""
if [[ "$DRY_RUN" == "true" ]]; then
  DRY_RUN_FLAG="--dry-run"
fi

SCRIPT_OUTPUT="$(node scripts/release-packages.mjs "$CHANNEL" $DRY_RUN_FLAG)"
echo "$SCRIPT_OUTPUT"

# 从输出中提取 RELEASE_PACKAGES JSON
PACKAGES_JSON="$(echo "$SCRIPT_OUTPUT" | grep '^RELEASE_PACKAGES=' | sed 's/^RELEASE_PACKAGES=//')"

if [[ -z "$PACKAGES_JSON" || "$PACKAGES_JSON" == "[]" ]]; then
  echo "✅ 无包需要发布，退出。"
  exit 0
fi

# ── Git commit + tag + push（非 dry-run）─────────────────────────────────────

if [[ "$DRY_RUN" == "false" ]]; then
  echo ""
  echo "📝 提交版本变更..."

  git add -A
  git commit --no-verify -m "chore: release packages"

  echo "🏷️  打包级 tag..."
  # 从 JSON 中提取 shortName@version 并打 tag
  node -e "
    const packages = JSON.parse(process.argv[1]);
    const { execSync } = require('child_process');
    for (const pkg of packages) {
      const tag = \`\${pkg.shortName}@\${pkg.version}\`;
      execSync(\`git tag \${tag}\`, { stdio: 'inherit' });
      console.log('  🏷  ' + tag);
    }
  " "$PACKAGES_JSON"

  echo "🚀 推送..."
  git push --follow-tags
fi

# ── 全量构建 ──────────────────────────────────────────────────────────────────

if [[ "$DRY_RUN" == "false" ]]; then
  echo ""
  echo "🔨 构建所有包..."
  if ! vp run build -r; then
    echo "✖  构建失败。" >&2
    exit 3
  fi
  echo "✔  构建完成"
fi

# ── 发布各包 ──────────────────────────────────────────────────────────────────

DIST_TAG="latest"
if [[ "$CHANNEL" == "beta" ]]; then
  DIST_TAG="beta"
fi

PUBLISHED=()
FAILED=()

if [[ "$DRY_RUN" == "false" ]]; then
  echo ""
  echo "📤 发布包（dist-tag: $DIST_TAG）..."

  # 解析 JSON，遍历每个包的 dist/ 目录发布
  node -e "
    const packages = JSON.parse(process.argv[1]);
    const { execSync } = require('child_process');
    const path = require('path');
    const distTag = process.argv[2];

    let failed = false;
    const published = [];
    const failedPkgs = [];

    for (const pkg of packages) {
      const distDir = path.resolve(pkg.dir, 'dist');
      try {
        // 检查「版本已存在」错误（重试场景），静默跳过
        try {
          execSync(\`npm publish \${distDir} --tag \${distTag} --access public\`, {
            stdio: 'inherit',
            cwd: distDir,
          });
          published.push(\`\${pkg.npmName}@\${pkg.version}\`);
          console.log('  ✔  ' + pkg.npmName + '@' + pkg.version + '  (tag: ' + distTag + ')');
        } catch (publishErr) {
          const msg = publishErr.stderr?.toString() ?? publishErr.message ?? '';
          if (msg.includes('already published') || msg.includes('cannot publish over') || msg.includes('409')) {
            console.log('  ⏭  ' + pkg.npmName + '@' + pkg.version + ' 已发布，跳过');
          } else {
            throw publishErr;
          }
        }
      } catch (err) {
        console.error('  ✖  ' + pkg.npmName + '@' + pkg.version + ' 发布失败：' + err.message);
        failedPkgs.push(pkg.npmName + '@' + pkg.version);
        failed = true;
      }
    }

    if (failed) {
      console.error('\n✖  部分包发布失败：' + failedPkgs.join(', '));
      process.exit(4);
    }

    console.log('\n✅ 已发布包：');
    for (const p of published) {
      console.log('  ' + p + '  (tag: ' + distTag + ')');
    }
  " "$PACKAGES_JSON" "$DIST_TAG"
else
  echo ""
  echo "ℹ  dry-run 模式：跳过实际发布"
  echo ""
  echo "📋 将发布（通道：$DIST_TAG）："
  node -e "
    const packages = JSON.parse(process.argv[1]);
    const distTag = process.argv[2];
    for (const pkg of packages) {
      console.log('  ' + pkg.npmName + '@' + pkg.version + '  (tag: ' + distTag + ')');
    }
  " "$PACKAGES_JSON" "$DIST_TAG"
fi
