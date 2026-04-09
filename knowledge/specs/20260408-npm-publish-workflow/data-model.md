# 数据模型：npm 发包工作流

**功能**：`20260408-npm-publish-workflow`
**日期**：2026-04-08

---

## 发布通道（Channel）

```
Channel
├── id: "beta" | "stable"
├── distTag: "beta" | "latest"
├── versionFormat: "X.Y.Z-beta.N" | "X.Y.Z"
├── allowedBranch: "!main" | "main"
└── releaseItFlags: "--preRelease=beta" | ""
```

**状态规则**：

- `stable` 仅允许在 `main` 分支触发
- `beta` 仅允许在非 `main` 分支触发
- 违反时发布脚本以非零退出码中止

---

## 版本增量（Bump）

```
Bump
├── type: "patch" | "minor" | "major"
├── inferredFrom: ConventionalCommit[]   ← 仅包含影响该包目录的 commits
├── scope: packages/<name>/              ← changelogen --dir 指定包目录
└── rules:
    ├── fix → patch
    ├── feat → minor
    └── feat + BREAKING CHANGE footer → major
```

**推断来源**：自上次该包的包级 tag（如 `react@1.1.0`）以来，影响 `packages/<name>/` 目录的 commits。

**prerelease 序号**：beta 通道在 Bump 之外追加 `-beta.N`，N 从 `1` 开始，若同一基础版本已有 beta tag 则自动 +1。

---

## 发布单元（PublishablePackage）

```
PublishablePackage
├── name: "@deweyou-design/react" | "@deweyou-design/react-hooks"
│        | "@deweyou-design/react-icons" | "@deweyou-design/styles"
│        | "@deweyou-design/utils"
├── srcDir: "packages/<name>/"
├── distDir: "packages/<name>/dist/"
└── buildScript: "vp run build -r"  ← 统一通过根任务图触发
```

**排除**：`@deweyou-ui/infra`（`private: true`，不发布）

---

## 发布产物（ReleaseArtifact）

```
ReleaseArtifact（每个 PublishablePackage 对应一个）
├── distPackageJson: dist/package.json   ← write-published-manifest.mjs 生成
│   ├── version: "<resolved semver>"     ← 必须与源 package.json 一致
│   ├── dependencies: { workspace:* → "^<version>" }
│   └── （已移除 devDependencies、scripts、files）
└── distFiles: dist/**/*
```

**版本写入顺序**：

```
① release-it bump → 更新 packages/*/package.json version
② vp run build -r → write-published-manifest.mjs 读取版本写入 dist/package.json
③ npm publish from dist/
```

---

## Changelog 条目（ChangelogEntry）

```
ChangelogEntry
├── version: semver
├── date: ISO 8601
├── sections:
│   ├── "Features": feat commits（影响该包目录的）
│   ├── "Bug Fixes": fix commits（影响该包目录的）
│   ├── "Performance": perf commits（如有）
│   └── "BREAKING CHANGES": breaking change footers
└── location: packages/<name>/CHANGELOG.md（各包独立）
```

---

## 发布状态机

```
IDLE
  │
  ▼ 触发 release.sh [beta|stable]
PREFLIGHT
  ├── 分支校验
  └── npm whoami 校验
  │
  ▼ 通过
VERSIONING
  ├── 推断 bump type
  ├── 更新所有 packages/*/package.json
  └── 更新 CHANGELOG.md
  │
  ▼
BUILDING
  └── vp run build -r
  │
  ▼
PUBLISHING
  └── npm publish 每个 dist/（带 --tag beta 或 latest）
  │
  ▼
TAGGING
  └── git commit + git tag vX.Y.Z[-beta.N] + git push
  │
  ▼
DONE

（任意阶段失败 → FAILED，输出阶段名和错误信息）
```
