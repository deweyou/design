# 实施计划：实现 Popover 组件

**分支**： `20260324-add-popover-component` | **日期**： 2026-03-24 | **规格**： [specs/20260324-add-popover-component/spec.md](specs/20260324-add-popover-component/spec.md)  
**输入**：来自 `/specs/20260324-add-popover-component/spec.md` 的功能规格  
**语言要求**：本文件及同级 `/specs/` 文档正文必须使用简体中文；代码标识符、命令、文件路径、协议字段和第三方 API 名称可保留原文。

## 摘要

在 `@deweyou-ui/components` 中新增一个基础 `Popover` 组件，提供 click 为默认触发的非模态浮层能力，支持多触发方式、受控与非受控状态、边界回退、箭头、动画、挂载容器控制，以及与现有 Button 风格一致的受治理视觉契约。实现将基于 `@floating-ui/react` 处理锚定定位、回退、portal 与交互原语，同时复用 `@deweyou-ui/styles` 中已有的 surface、border、radius、shadow 与 focus token。交付范围同时包括 package 公开 API、组件单测、根入口测试、`apps/website` 公开 demo 与 `apps/storybook` 内部评审 story。

## 技术上下文

**Language/Version**： TypeScript 5.x、React 19.x 兼容 API、Node.js 24.14.0 baseline  
**Primary Dependencies**： `@deweyou-ui/components`、`@deweyou-ui/styles`、`@deweyou-ui/icons`、`classnames`、React、React DOM、新增 `@floating-ui/react`  
**Storage**： 仅包含文件型源码、样式、story/demo 与生成产物  
**Testing**： `vp check`、`vp test`、`vp run storybook#build`、`vp run website#build`，以及 story/demo 人工冒烟评审  
**Target Platform**： Node.js 开发环境与现代 evergreen 桌面浏览器  
**Project Type**： monorepo UI library，包含 package、公开 website demo 和内部 Storybook 评审 app  
**Performance Goals**： 常规交互下 Popover 打开、关闭与位置更新应保持即时感知；边界回退和滚动跟随不应产生肉眼可见的脱锚或明显闪烁  
**Constraints**： 必须使用 Vite+ 工作流；可复用逻辑必须落在 `packages/components`；必须保留非模态焦点行为；必须复用现有主题 token；必须同时更新 `apps/website` 与 `apps/storybook` 评审面；不得引入只在 app 内可见的私有组件行为  
**Scale/Scope**： 一个新增组件目录、一个 package 根入口调整、若干组件测试、一个 website demo 区块、一个 Storybook story 文件，以及相关文档与契约产物

## 宪章检查

_门禁：必须在 Phase 0 research 前通过。Phase 1 设计后需重新检查。_

- 目标 package 边界明确，可复用行为没有被塞进 `website` 或其他 app。
  - 通过：Popover 的交互、定位、视觉和公开 API 都归属 `packages/components`；`apps/website` 与 `apps/storybook` 只消费它做预览。
- 已说明每个受影响 package 的公开 API 变化，包括 props、slots、events、variants 与 semver 影响。
  - 通过：受影响公开面是 `@deweyou-ui/components` 根入口新增 `Popover` 与 `PopoverProps`，并引入 placements、triggers、`mode`、`visible` / `defaultVisible` / `onVisibleChange`、`boundaryPadding`、`popupPortalContainer` 等新增 props，属于新增能力的 minor 级公开面扩展。
- 已说明无障碍要求，包括键盘交互、焦点管理、语义结构与状态行为。
  - 通过：规格已固定为非模态、无焦点陷阱；要求键盘可进入和离开内容区、关闭后返回触发元素，并覆盖 `disabled`、外部点击关闭和读屏语义。
- 已识别 token 与主题系统影响，包括新增或修改的设计 token。
  - 通过：计划默认复用 `@deweyou-ui/styles` 中的 `--ui-color-surface`、`--ui-color-border`、`--ui-shadow-soft`、`--ui-radius-md`、`--ui-color-focus-ring` 与现有 mixin；研究结论是不新增 token，除非实现阶段证明现有 token 无法覆盖箭头或状态需求。
- 已规划必要验证：`vp check`、相关 `vp test` 或 `vp run ...` 命令，以及 `website` 的预览或 demo 更新。
  - 通过：验证包含 `vp check`、`vp test`、`vp run storybook#build`、`vp run website#build`，并要求更新 `apps/website` demo 与 `apps/storybook` review story。
- 已确认本功能相关的 `spec`、`plan`、`tasks` 及其他 `/specs/` 文档均以简体中文撰写。
  - 通过：当前 feature 下的 `spec.md`、`plan.md`、后续 `research.md`、`data-model.md`、`quickstart.md` 与 contracts 文档都以简体中文撰写。

**设计后复查**：通过。research 已把定位引擎、portal、动画、非模态焦点与 token 复用策略收敛到 `packages/components` 可复用实现；data-model、contract 和 quickstart 也都保留了 website/demo 与 Storybook 评审要求，没有把组件行为外溢到 app。

## 项目结构

### 文档（本功能）

```text
specs/20260324-add-popover-component/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── popover-public-contract.md
└── tasks.md
```

### 源代码（仓库根目录）

```text
apps/
├── storybook/
│   └── src/stories/
│       └── Popover.stories.tsx
└── website/
    └── src/
        ├── main.tsx
        └── style.css

packages/
├── components/
│   ├── src/
│   │   ├── index.ts
│   │   └── popover/
│   │       ├── index.tsx
│   │       ├── index.module.less
│   │       └── index.test.ts
│   ├── tests/
│   │   └── package-entrypoint.test.ts
│   └── README.md
├── icons/
├── styles/
└── hooks/

package.json
README.md
```

**结构决策**：保持 monorepo 现有边界。`packages/components/src/popover/` 承担全部可复用逻辑与样式；`packages/components/src/index.ts` 暴露根入口；`packages/components/tests/package-entrypoint.test.ts` 保障根公开面不回退。`apps/website/src/main.tsx` 增加面向消费者的公开 demo，`apps/storybook/src/stories/Popover.stories.tsx` 提供内部状态矩阵与边界评审。若需要箭头图形，优先使用 CSS 与现有 token，而不是新增独立 icon 资产或新 package。

## 复杂度追踪

本次变更没有需要额外说明的宪章违反项。
