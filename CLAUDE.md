# ui 开发指南

## 知识库

- [Ark UI 组件范式](docs/architecture/ark-ui.md) — 交互型组件的行为基础层选型与实现约定
- [包层级规则](docs/architecture/package-layers.md) — 已发布包 vs 构建基础设施的划分与依赖规则

## 技术栈

- TypeScript 5.x、React 19.x、Node.js 24.14.0
- vite-plus（构建、测试、lint、格式化）
- React、Less、CSS Modules、Storybook
- `@ark-ui/react`（交互型组件行为层）、`@deweyou-design/styles`（设计 token）

## 项目结构

```text
packages/
├── react/        # @deweyou-design/react — React 组件库
├── react-hooks/  # @deweyou-design/react-hooks — 共享 React hooks
├── react-icons/  # @deweyou-design/react-icons — React 图标组件
├── styles/       # @deweyou-design/styles — 设计 token
├── utils/        # @deweyou-design/utils — 运行时工具
└── infra/        # @deweyou-ui/infra — 构建基础设施（不发布）
apps/
├── website/      # 组件预览站
└── storybook/    # 组件故事
```

## 命令

```bash
vp check            # 类型检查 + lint + 格式化
vp test             # 运行测试
vp run build -r     # 全量构建
vp run website#dev  # 启动预览站
vp install          # 安装依赖
```

---

## 仓库约定

- 函数默认使用**箭头函数**风格。仅当框架边界、提升需求或外部 API 约束使函数声明更安全时，才允许例外，并需在变更中说明原因。
- React 组件必须使用 **TSX 文件**编写。除非有明确的工具限制并已文档化，否则不要引入 `React.createElement` 风格的组件写法。
- 受治理区域中新建或重命名的文件和目录必须使用**小写名称并使用连字符分隔**（kebab-case）。
- 在 `packages/react`、`packages/react-hooks` 和 `packages/infra` 中，每个受治理源码单元都应位于自己的 `src/<unit-name>/` 目录下。
- 每个受治理源码单元都应将本地入口文件和单测保留为同目录下的 `index` 与 `index.test`（**colocate 单测**）。
- `packages/` 下的新包默认不得保留包级专用构建配置；应优先复用 Vite+ 统一约定。
- commit message 格式：`<type>(<scope>): <summary>`（scope 有意义时），或 `<type>: <summary>`。
- 推荐 commit type：`feat`、`fix`、`refactor`、`docs`、`test`、`build`、`chore`。
- commit subject 使用祈使语气、小写，聚焦单一逻辑变更。格式通过 `.vite-hooks/commit-msg` 强制校验。

## 最近变更

- **20260408-restructure-packages**：packages 重命名为 `@deweyou-design/*` scope；infra 分离构建层；写入 dist/package.json 版本解析
- **20260329-distill-design-style**：引入「设计风格」章节；完成 AGENTS.md → CLAUDE.md 全面迁移；清理 Codex 遗留文件
- **20260327-ark-ui-integration**：引入 `@ark-ui/react` 作为组件行为基础层；迁移 popover 组件；建立后续交互型组件开发范式
- **20260317-repo-conventions**：仓库治理规则（箭头函数、TSX-first、kebab-case、单测 colocate）
- **20260316-ui-monorepo-foundation**：monorepo 边界、显式样式导入、受控主题 token、Storybook/website 职责分离

<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->

## Harness Development

AI 辅助开发的上下文与知识库：

- **宪章**（项目原则）: [knowledge/constitution.md](knowledge/constitution.md)
- **设计风格**: [knowledge/design-style.md](knowledge/design-style.md)
- **Feature specs**: [knowledge/specs/](knowledge/specs/)

> Scripts 和 templates 由 harness-dev 管理于 `knowledge/.scripts/` — 请勿手动编辑。
> 主题知识文件（如 `knowledge/design-style.md`）由 archive 步骤在发现可泛化模式时添加。
