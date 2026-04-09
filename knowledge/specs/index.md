# Feature Specs 索引

所有 harness-dev 迭代记录，按时间倒序排列。每个条目链接到对应的 spec 目录；完成迭代后应补充 archive.md。

---

## 2026-04

| 分支                                                                          | 类型     | 说明                                                                                                        |
| ----------------------------------------------------------------------------- | -------- | ----------------------------------------------------------------------------------------------------------- |
| [20260409-component-testing-standards](20260409-component-testing-standards/) | feature  | 制定组件测试规范（Vitest UT + Storybook e2e），补齐 5 个存量组件覆盖缺口，CI 接入 80% 覆盖率门禁与 e2e 步骤 |
| [20260408-storybook-e2e](20260408-storybook-e2e/)                             | feature  | 基于 `@storybook/test-runner` 为现有组件补充 Storybook Interaction e2e 测试覆盖                             |
| [20260408-restructure-packages](20260408-restructure-packages/)               | refactor | packages 重命名为 `@deweyou-design/*` scope；infra 分离构建层；dist/package.json 版本解析                   |
| [20260408-npm-publish-workflow](20260408-npm-publish-workflow/)               | feature  | 探索并建立 npm 发包工作流：开发分支发 beta/prerelease 包，合入主分支后发正式包                              |

## 2026-03（下半月）

| 分支                                                                    | 类型     | 说明                                                                                                                |
| ----------------------------------------------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------- |
| [20260331-tabs-component](20260331-tabs-component/)                     | feature  | 基于 Ark UI 实现 Tabs 组件：线条 / bg 两种 active 样式，切换动画，超长滑动 + 渐变，嵌套 Menu 下拉                   |
| [20260330-storybook-docs-upgrade](20260330-storybook-docs-upgrade/)     | chore    | 升级 Storybook 版本；重组 stories（color / components 分类）；补齐所有 API 文档说明                                 |
| [20260329-menu-component](20260329-menu-component/)                     | feature  | 基于 Ark UI 实现 Menu 组件：分组、分割线、多级子菜单、单选/多选、contextMenu                                        |
| [20260329-distill-design-style](20260329-distill-design-style/)         | docs     | 从现有组件中提炼设计风格指南，沉淀为 `knowledge/design-style.md`；完成 AGENTS.md → CLAUDE.md 迁移                   |
| [20260327-ark-ui-integration](20260327-ark-ui-integration/)             | refactor | 引入 `@ark-ui/react` 作为组件行为基础层；基于 Ark UI 重构 Popover；建立后续交互型组件开发范式                       |
| [20260326-optimize-package-outputs](20260326-optimize-package-outputs/) | build    | 包构建与发布产物治理：preserveModules + CSS split，精简构建配置，peerDep 对齐，workspace 版本号解析                 |
| [20260324-define-color-palette](20260324-define-color-palette/)         | feature  | 在 `@deweyou-design/styles` 建立统一颜色 token 体系（26 色 × 11 色阶 + 纯黑白）                                     |
| [20260324-add-popover-component](20260324-add-popover-component/)       | feature  | 实现 Popover 组件（定位、触发模式、受控/非受控）                                                                    |
| [20260323-refine-button-padding](20260323-refine-button-padding/)       | fix      | 优化 Button 间距平衡：区分图标按钮与文字按钮的 padding 策略，解决视觉上下大、左右小问题                             |
| [20260323-button-props-loading](20260323-button-props-loading/)         | feature  | 补齐 Button 公开属性（onClick、color danger、htmlType、href/target、ref）；新增 loading 状态                        |
| [20260323-button-hover-motion](20260323-button-hover-motion/)           | fix      | 整理按钮 hover 反馈：link 保留下划线动画，outlined 改为默认低色度 border + hover 平滑过渡，移除 animated prop       |
| [20260323-add-text-component](20260323-add-text-component/)             | feature  | 实现 Text 排版组件：variant（plain/span/h1-h5/caption/body）、斜体/字重/下划线/删除线、lineClamp                    |
| [20260322-define-songti-typography](20260322-define-songti-typography/) | feature  | 定义组件库宋体字体系统：字族栈、字重、配套英文数字字体                                                              |
| [20260320-button-variants](20260320-button-variants/)                   | feature  | 重构 Button 组件：variant（outlined/filled/ghost/link）、color（neutral/primary/danger）、size（5档）、shape（3档） |

## 2026-03（上半月）

| 分支                                                                | 类型    | 说明                                                                                                          |
| ------------------------------------------------------------------- | ------- | ------------------------------------------------------------------------------------------------------------- |
| [20260317-upgrade-storybook](20260317-upgrade-storybook/)           | chore   | 升级 Storybook 至最新稳定版                                                                                   |
| [20260317-repo-conventions](20260317-repo-conventions/)             | chore   | 建立仓库规范：箭头函数、TSX-first、kebab-case、单测 colocate、src/<unit>/ 结构                                |
| [20260317-icon-package](20260317-icon-package/)                     | feature | 新增 `@deweyou-design/react-icons` 包，基于 Iconify 实现图标集                                                |
| [20260316-ui-monorepo-foundation](20260316-ui-monorepo-foundation/) | feature | 初建 monorepo 架构（utils/hooks/styles/components + website/storybook），确立 CSS Modules + TS token 主题系统 |

---

## 归档说明

- **archive.md**：完成实现后由 `/harness-dev` archive 步骤生成，记录关键决策、踩坑和可复用模式。
- **知识沉淀**：可泛化的规范/模式在 archive 步骤中按需 promote 至 `knowledge/<topic>.md`，并在 `CLAUDE.md` 中添加指针。
