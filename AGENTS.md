# ui 开发指南

## 知识库

- [Ark UI 组件范式](docs/architecture/ark-ui.md) — 交互型组件的行为基础层选型与实现约定
- [包层级规则](docs/architecture/package-layers.md) — 已发布包 vs 构建基础设施的划分与依赖规则
- [测试架构](docs/architecture/testing.md) — 单测、contract test、样式测试与 Storybook e2e 的职责边界

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

## 组件开发固定交付流程

- 新增或实质修改组件时，默认必须同时补齐 colocated 单测、Storybook `Interaction` e2e、必要的 package/export/docs contract test。
- 新增公开组件时，默认必须同步更新 `README.md`、`docs/design/components.md`、`packages/react/package.json` exports 和 `packages/react/src/index.ts`。
- 若改动包含新设计决策、组件边界或后续演进方向，默认沉淀到 `docs/superpowers/specs/` 和 `docs/superpowers/plans/`。
- 收尾默认运行 `vp check`、`vp test`、相关 Storybook e2e；新增或修改 Storybook story 时运行 `vp run storybook#test`，必要时再运行 `vp run build -r`。

## Harness Development

AI 辅助开发的上下文与知识库：

- **知识库根目录**: [docs/](docs/) — 后续仓库知识库建设统一沉淀在 `docs/` 下
- **宪章**（项目原则）: [docs/constitution.md](docs/constitution.md)
- **设计系统**: [docs/design/system.md](docs/design/system.md)
- **测试标准**: [docs/testing-standards.md](docs/testing-standards.md)
- **Feature specs 索引**: [docs/specs/index.md](docs/specs/index.md)

> Scripts 和 templates 由 harness-dev 管理于 `docs/.scripts/` — 请勿手动编辑。
> 主题知识文件（如 `docs/design/system.md`）由 archive 步骤在发现可泛化模式时添加。
