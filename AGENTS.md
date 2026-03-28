<!--VITE PLUS START-->

# 使用 Vite+ 统一 Web 工具链

本项目使用 Vite+，它是在 Vite、Rolldown、Vitest、tsdown、Oxlint、Oxfmt 和 Vite Task 之上整合出的统一工具链。Vite+ 用一个全局 CLI `vp` 统一处理运行时管理、依赖管理和前端工具工作流。Vite+ 不等同于 Vite，但会通过 `vp dev` 和 `vp build` 调用对应能力。

## Vite+ 工作流

`vp` 是覆盖完整开发生命周期的全局命令。可通过 `vp help` 查看命令列表，通过 `vp <command> --help` 查看某个命令的详细说明。

### 启动类

- create - 从模板创建新项目
- migrate - 将现有项目迁移到 Vite+
- config - 配置 hooks 和 agent 集成
- staged - 对暂存文件运行 lint
- install (`i`) - 安装依赖
- env - 管理 Node.js 版本

### 开发类

- dev - 启动开发服务器
- check - 运行格式化、lint 和 TypeScript 类型检查
- lint - 运行 lint
- fmt - 运行格式化
- test - 运行测试

### 执行类

- run - 运行 monorepo 任务
- exec - 执行本地 `node_modules/.bin` 中的命令
- dlx - 不安装依赖而直接执行某个包的二进制命令
- cache - 管理任务缓存

### 构建类

- build - 生成生产构建
- pack - 构建库产物
- preview - 预览生产构建

### 依赖管理

Vite+ 会根据 `package.json` 中的 `packageManager` 字段或对应 lockfile 自动识别并封装底层包管理器，例如 pnpm、npm 或 Yarn。

- add - 添加依赖
- remove (`rm`, `un`, `uninstall`) - 移除依赖
- update (`up`) - 升级依赖到最新版本
- dedupe - 执行依赖去重
- outdated - 检查过期依赖
- list (`ls`) - 列出已安装依赖
- why (`explain`) - 说明某个依赖为何被安装
- info (`view`, `show`) - 查看注册表中的包信息
- link (`ln`) / unlink - 管理本地 link
- pm - 将命令透传给底层包管理器

### 维护类

- upgrade - 升级 `vp` 自身

这些命令都映射到对应工具。例如 `vp dev --port 3000` 的行为与 Vite 开发服务器一致，`vp test` 会通过内置 Vitest 运行测试。可以用 `vp --version` 查看各工具版本，这对查阅文档、定位特性和排查问题很有帮助。

## 常见陷阱

- **不要直接使用包管理器：** 不要直接使用 pnpm、npm 或 Yarn，Vite+ 已封装所有依赖管理操作。
- **始终使用 Vite+ 对应命令：** 不要尝试执行 `vp vitest` 或 `vp oxlint`。这些命令不存在，应使用 `vp test` 和 `vp lint`。
- **脚本优先级：** Vite+ 内建命令优先于 `package.json` scripts。若 `scripts` 里定义了同名 `test`，请改用 `vp run test`。
- **不要直接安装 Vitest、Oxlint、Oxfmt 或 tsdown：** 这些工具都已由 Vite+ 封装，不能通过单独安装最新版来升级。
- **一性命令同样使用 Vite+ 包装：** 一次性执行二进制命令时，应使用 `vp dlx`，而不是 `npx` 或包管理器私有的 `dlx`。
- **JavaScript 模块从 `vite-plus` 导入：** 不要从 `vite` 或 `vitest` 导入模块，应使用项目依赖中的 `vite-plus`，例如 `import { defineConfig } from 'vite-plus';` 或 `import { expect, test, vi } from 'vite-plus/test';`。
- **类型感知 lint 已内建：** 不需要额外安装 `oxlint-tsgolint`，`vp lint --type-aware` 可以直接使用。

## Agent 评审清单

- [ ] 拉取远端更新后、开始工作前运行 `vp install`
- [ ] 提交变更前运行 `vp check` 和 `vp test`
<!--VITE PLUS END-->

## 组件开发范式：基于 Ark UI 的行为基础层（20260327-ark-ui-integration）

本组件库使用 Ark UI（`@ark-ui/react`）作为交互型组件的行为基础层。

**应当使用 Ark UI 的场景**：浮层类（Popover、Tooltip、Menu、Dialog 等）、选择器类（Select、Combobox 等）、表单增强类（Checkbox、Switch 等）。

**不需要使用 Ark UI 的场景**：纯展示组件（Text、Icon）、纯样式封装（Button）、Ark UI 无对应覆盖的业务逻辑。

**实现约定**：使用 Ark UI 原语提供行为；样式通过 CSS Modules（Less）+ token；公开 API 与 Ark UI 解耦；非 click 触发通过受控模式桥接。

**开发前置**：安装 Ark UI MCP Server：`claude mcp add ark-ui -- npx -y @ark-ui/mcp`

**参考实现**：`packages/components/src/popover/index.tsx`

## 当前技术栈

- TypeScript 5.x、兼容 React 19.x 的 API、Node.js 24.14.0 基线、vite-plus、React、React DOM、Storybook 10.2.19、`tdesign-icons-svg`，以及现有 `@deweyou-ui/styles` tokens（20260317-icon-package）
- 仅包含文件源码、package 元数据和生成产物（20260317-icon-package）

- TypeScript 5.x、兼容 React 19.x 的 API、Node.js 24.14.0 基线、vite-plus、Storybook 10.2 目标线、React、React DOM、TypeScript（20260317-upgrade-storybook）
- 仅包含文件源码、配置和生成的预览产物（20260317-upgrade-storybook）

- TypeScript 5.x、兼容 React 19.x 的 package API、Node.js 24.14.0 基线、`vite-plus`、React、Less、Storybook、CSS Modules、monorepo package workspaces（20260317-repo-conventions）
- 仅包含文件源码树和生成的 package 产物；没有持久化运行时存储（20260317-repo-conventions）

- TypeScript 5.x、兼容 React 19.x 的 package API、Node.js 24.14.0 工具基线、vite-plus、React、Less、Storybook、TypeScript、CSS Modules（20260316-ui-monorepo-foundation）
- 仅包含文件源码和生成的样式产物（20260316-ui-monorepo-foundation）

## 最近变更

- 20260316-ui-monorepo-foundation：新增 app/package 的 monorepo 边界、显式样式导入、受控主题 token，以及 Storybook/website 的职责分离
- 20260317-repo-conventions：新增仓库治理规则，覆盖箭头函数优先、TSX-first React 编写方式、kebab-case 命名和受治理 package 中的单测 colocate

## 仓库约定

- 函数默认使用箭头函数风格。仅当框架边界、提升需求或外部 API 约束使函数声明更安全时，才允许例外，并需在变更中说明原因。
- React 组件必须使用 TSX 文件编写。除非有明确的工具限制并已文档化，否则不要在 package 或 demo app 中引入 `React.createElement` 风格的组件写法。
- 受治理区域中新建或重命名的文件和目录必须使用小写名称并使用连字符分隔。
- 在 `packages/components`、`packages/hooks` 和 `packages/utils` 中，每个受治理源码单元都应位于自己的 `src/<unit-name>/` 目录下。
- 每个受治理源码单元都应将本地入口文件和单测保留为同目录下的 `index` 与 `index.test`。
- 调整源码位置时必须保留 package 根入口，以保证消费者继续从文档化的 package surface 导入。
- `packages/` 下的新包或改造中的包默认不得保留包级专用构建配置；应优先复用 Vite+ 的统一约定。只有在公开入口、产物结构、资产复制或发布契约无法被默认约定满足时，才允许保留，并且必须在变更中说明原因。
- 当受治理单元已具备 colocated 单测后，package 顶层 `tests/` 目录只保留跨领域或 workspace 边界覆盖。
- commit message 在 scope 有意义时必须使用 `<type>(<scope>): <summary>`，否则使用 `<type>: <summary>`。
- 推荐的 commit type 包括 `feat`、`fix`、`refactor`、`docs`、`test`、`build` 和 `chore`。
- commit subject 应使用祈使语气、小写书写，并聚焦于单一逻辑变更。
- 仓库通过 `.vite-hooks/commit-msg` 强制校验该格式。
- `specs/` 下生成的文档必须使用简体中文，只有代码标识符、命令、路径、协议字段和第三方 API 名称可以保留原文。
