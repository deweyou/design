# 包重命名契约

本文件是本次重构的公开 API 契约，记录每个包的重命名映射、exports 等价性承诺，以及包职责分层规则。

## 包名映射

| 旧包名                   | 新包名                        | 目录变更                                  | 发布           |
| ------------------------ | ----------------------------- | ----------------------------------------- | -------------- |
| `@deweyou-ui/components` | `@deweyou-design/react`       | `packages/components` → `packages/react`  | ✅             |
| `@deweyou-ui/hooks`      | `@deweyou-design/react-hooks` | `packages/hooks` → `packages/react-hooks` | ✅             |
| `@deweyou-ui/icons`      | `@deweyou-design/react-icons` | `packages/icons` → `packages/react-icons` | ✅             |
| `@deweyou-ui/styles`     | `@deweyou-design/styles`      | `packages/styles`（不变）                 | ✅             |
| `@deweyou-ui/utils`      | `@deweyou-ui/infra`           | `packages/utils` → `packages/infra`       | ❌（不发布）   |
| （新）                   | `@deweyou-design/utils`       | 新建 `packages/utils`                     | ✅（初始空包） |

## exports 等价性承诺

所有面向消费方的包，重构后 `exports` 路径语义与重构前完全等价。

### `@deweyou-design/react`（原 `@deweyou-ui/components`）

```json
{
  ".": { "types", "import", "default" },
  "./button": { "types", "import", "default" },
  "./popover": { "types", "import", "default" },
  "./text": { "types", "import", "default" },
  "./menu": { "types", "import", "default" },
  "./tabs": { "types", "import", "default" },
  "./package.json": "./package.json",
  "./style.css": "./dist/style.css"
}
```

### `@deweyou-design/react-hooks`（原 `@deweyou-ui/hooks`）

```json
{
  ".": "./dist/index.mjs",
  "./package.json": "./package.json"
}
```

### `@deweyou-design/react-icons`（原 `@deweyou-ui/icons`）

按图标名称的 subpath exports 全部保留（数百条），格式不变。

### `@deweyou-design/styles`（原 `@deweyou-ui/styles`）

CSS 文件 exports（`theme.css` 等）全部保留，格式不变。

### `@deweyou-design/utils`（新）

```json
{
  ".": "./dist/index.mjs",
  "./package.json": "./package.json"
}
```

初始 `src/index.ts` 无导出内容（空占位），后续 runtime 工具在此扩展。

## 发布产物版本解析契约

每个面向消费方的包构建后，`dist/package.json` 必须满足：

- 不含 `workspace:*` 或 `workspace:^` 等 workspace specifier
- 不含 `catalog:` specifier
- 内部包依赖（如 `@deweyou-design/react-hooks`）解析为 `^{version}`
- 第三方依赖（如 `react`、`classnames`）解析为 catalog 中对应的具体 semver

这由 `packages/infra/scripts/write-published-manifest.mjs` 在每个包的 `build` script 末尾执行，动态扫描 `packages/*` 完成解析。

**验证命令**：

```bash
vp run build -r
# 然后逐包检查
grep -r "workspace:\|catalog:" packages/react/dist/package.json packages/react-hooks/dist/package.json packages/react-icons/dist/package.json packages/styles/dist/package.json
# 结果应为空
```

## 包职责分层规则

本规则自本次重构起生效，写入 `docs/architecture/package-layers.md` 作为治理基准。

| 层              | 包名                          | 用途                                                        | 发布 |
| --------------- | ----------------------------- | ----------------------------------------------------------- | ---- |
| **infra**       | `@deweyou-ui/infra`           | monorepo build-time 工具：manifest 处理、发布脚本、构建辅助 | ❌   |
| **utils**       | `@deweyou-design/utils`       | 面向消费方的 runtime 工具函数：框架无关的纯函数             | ✅   |
| **react-hooks** | `@deweyou-design/react-hooks` | React 专属 hooks                                            | ✅   |
| **react**       | `@deweyou-design/react`       | React UI 组件库                                             | ✅   |
| **react-icons** | `@deweyou-design/react-icons` | React 图标组件                                              | ✅   |
| **styles**      | `@deweyou-design/styles`      | 设计 token、CSS 变量                                        | ✅   |

**判断准则**：

- 新的工具函数代码，若仅在 build 脚本中调用 → 放入 `infra`
- 新的工具函数代码，若需要打进消费方 bundle → 放入 `utils`
- 任何包不得将 `infra` 列为 `dependencies`（只允许 build script 用相对路径引用）
