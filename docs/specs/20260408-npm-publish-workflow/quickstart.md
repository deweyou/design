# 快速上手：npm 发包工作流

**功能**：`20260408-npm-publish-workflow`

---

## 发布 beta 包（开发分支）

```bash
# 1. 确保在非 main 分支
git branch  # 确认不是 main

# 2. 确保 npm 已登录
npm whoami

# 3. 触发 beta 发布
scripts/release.sh beta
```

发布完成后可验证：

```bash
npm view @deweyou-design/react dist-tags
# 应看到 beta: 1.0.0-beta.1
```

---

## 发布正式版（main 分支）

```bash
# 1. 确保在 main 分支，且本地已同步最新
git checkout main && git pull

# 2. 触发正式发布
scripts/release.sh stable
```

---

## 预演模式（不实际发包）

```bash
scripts/release.sh beta --dry-run
scripts/release.sh stable --dry-run
```

---

## 通过 GitHub Actions 发布

1. 进入仓库 → Actions → Release 工作流
2. 点击 "Run workflow"
3. 选择 `channel`（beta/stable）
4. 点击确认

---

## 查看发布结果

```bash
# 查看 latest
npm view @deweyou-design/react version

# 查看 beta
npm view @deweyou-design/react dist-tags.beta
```

---

## 本地环境需求

- Node.js 24.14.0+
- pnpm 10.32.1+
- npm 已登录（`npm login` 或 `NODE_AUTH_TOKEN` 环境变量已设置）
- 在仓库根目录执行 `vp install` 安装依赖
