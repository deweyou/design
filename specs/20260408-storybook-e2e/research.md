# 调研报告：Storybook E2E 测试覆盖

**功能分支**：`20260408-storybook-e2e`
**日期**：2026-04-08

## 版本兼容性

**决策**：使用 `@storybook/test-runner@0.24.3`。

**理由**：该版本 peer dependency 声明支持 `storybook@^10.0.0`，与项目当前
`storybook@10.3.3` 完全兼容，无需升级 Storybook。

**已考察替代方案**：

- Playwright 直接测试（不通过 Storybook）：需要启动完整 dev server，配置更复杂，
  且无法利用现有 Story 作为测试载体。
- Vitest Browser Mode：尚不支持 Storybook story 格式，需要重写测试。

---

## 测试执行方式

**决策**：使用 `play` 函数 + `@storybook/test-runner` 的标准模式。

**理由**：`@storybook/test-runner` 会扫描所有 Story 并执行其 `play` 函数。
`play` 函数使用 `@storybook/test` 提供的 `userEvent` 和 `expect`，
与 Storybook 深度集成，是官方推荐路径。不需要额外测试文件格式。

**实现方式**：

- 为需要交互验证的 Story 增加 `play` 函数
- 纯渲染类 Story（如 Typography/Color）无需 `play` 函数，test-runner 会自动
  验证其无报错渲染（smoke test）
- 推荐在现有 Story 文件中，为关键交互场景添加专用 Story + play 函数，
  而非污染现有展示用 Story

**已考察替代方案**：

- 独立 `*.test.ts` 文件调用 test-runner API：配置更复杂，与 Story 解耦后
  维护成本更高。

---

## 测试运行入口（CI 集成）

**决策**：分两步：先构建 Storybook 静态产物，再用 `test-storybook --url`
指向本地静态服务器运行测试。

**理由**：避免 CI 中启动 dev server 的不稳定性；静态构建产物可缓存。
本地开发时可直接指向已运行的 dev server（`vp run storybook#dev`）。

**具体命令**：

```bash
# 本地开发（Storybook 已在 6106 端口运行）
test-storybook --url http://localhost:6106

# CI（构建后用 serve 启动）
vp run storybook#build && test-storybook --url http://localhost:6106 --ci
```

**已考察替代方案**：

- `start-server-and-test`：需额外依赖，且 vp 工具链中未使用。

---

## Playwright 浏览器依赖

**决策**：在 `apps/storybook/package.json` 中增加 `postinstall` 脚本
安装 Playwright Chromium，或在 CI workflow 中独立安装。

**理由**：`@storybook/test-runner` 依赖 Playwright，需要浏览器二进制文件。
仅安装 Chromium 即可满足需求，避免安装全套浏览器。

**命令**：`playwright install chromium --with-deps`

---

## 现有 Story 分析

| 组件       | Story 文件               | 已有 Story 数 | 交互测试策略                           |
| ---------- | ------------------------ | ------------- | -------------------------------------- |
| Button     | `Button.stories.tsx`     | 10 个         | 新增 `Interaction` Story，含 play 函数 |
| Popover    | `Popover.stories.tsx`    | 2 个          | 新增 `Interaction` Story，含 play 函数 |
| Menu       | `Menu.stories.tsx`       | 10 个         | 新增 `Interaction` Story，含 play 函数 |
| Tabs       | `Tabs.stories.tsx`       | 11 个         | 新增 `Interaction` Story，含 play 函数 |
| Typography | `Typography.stories.tsx` | 4 个          | 仅 smoke test（无需 play 函数）        |
| Color      | `Color.stories.tsx`      | 已有          | 仅 smoke test（无需 play 函数）        |
| Icon       | `Icon.stories.tsx`       | 已有          | 仅 smoke test（无需 play 函数）        |

---

## 目录与文件决策

**决策**：

- `@storybook/test-runner` 安装到 `apps/storybook` devDependencies
- 测试配置文件：`apps/storybook/.storybook/test-runner.ts`（可选，用于全局
  setup/teardown）
- 交互 Story 文件与现有文件共存，使用相同命名约定（`*.stories.tsx`）
- `package.json` 新增 `"test": "test-storybook --url http://localhost:6106 --ci"`
  脚本，通过 `vp run storybook#test` 调用

**文件命名约定**（符合宪章原则 VI）：kebab-case，`.tsx` 扩展名。
