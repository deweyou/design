# 实施计划：定义组件库宋体字体系统

**分支**：`20260322-define-songti-typography` | **日期**：2026-03-22 | **规格**：[specs/20260322-define-songti-typography/spec.md](specs/20260322-define-songti-typography/spec.md)  
**输入**：来自 `/specs/20260322-define-songti-typography/spec.md` 的功能规格  
**语言要求**：本文件及同级 `/specs/` 文档正文必须使用简体中文；代码标识符、命令、文件路径、协议字段和第三方 API 名称可保留原文。

## 摘要

本次实现将把 Deweyou UI 的默认字体系统从当前无衬线方向切换为以思源宋体系为核心的宋体方向，并通过 `packages/styles` 统一管理默认字体、平台回退和字重层级。`--ui-font-body` 与 `--ui-font-display` 会继续保留现有角色名，但默认值统一指向思源宋体系，英文与数字也跟随同一体系内置字形；`--ui-font-mono` 保持现有等宽例外角色。默认开源字体未就绪或不可用时，`macOS` 回退到 `Songti SC`、`STSong`，`Windows` 回退到 `SimSun`、`NSimSun`，确保首屏先显示系统宋体而不是出现空白文本。实现范围以 `packages/styles` 为主，同时补充 `apps/storybook` 与 `apps/website` 的混排、层级和回退预览，以及相应测试和发布说明。

## 技术上下文

**语言/版本**：TypeScript 5.x、React 19.x 兼容 API、Node.js 24.14.0 baseline  
**主要依赖**：vite-plus、React、React DOM、Storybook 10.2.19、现有 `@deweyou-ui/styles` 主题输出、`packages/styles/scripts/copy-assets.mjs` 构建链路  
**存储**：仅包含文件型源码、字体资产、规格文档、package 元数据与生成产物  
**测试**：`vp check`、`vp test`、`packages/styles/tests/index.test.ts`、`packages/styles/tests/theme-outputs.test.ts`、必要的新增 styles 测试、`vp run storybook#build`、`vp run website#build`  
**目标平台**：Node.js 开发环境、现代 evergreen 浏览器，以及以 `macOS` / `Windows` 为主的组件消费环境  
**项目类型**：带可复用 packages、内部 Storybook 评审 app 和公开 website 指导面的 monorepo UI library  
**性能目标**：首屏文本必须先以系统宋体回退显示，不出现等待默认开源字体造成的空白文本；字体系统更新不应引入新的运行时交互延迟；Storybook 与 website 预览应保持即时加载与主题切换  
**约束**：必须使用 Vite+ 工作流；可复用字体能力必须先落在 `packages/styles`；Typography 继续属于内部 theme 契约，不扩到 `publicThemeTokens`；默认开源字体必须收敛到思源宋体系；英文与数字默认跟随该体系内置字形；平台回退必须锁定为 `macOS -> Songti SC, STSong`、`Windows -> SimSun, NSimSun`；`mono` 继续作为等宽例外角色；必须同步更新 Storybook 与 website 预览，并记录默认视觉契约变化  
**规模/范围**：一个共享 styles package 的默认字体系统重构、一组字体资产与主题输出调整、一套 Storybook 评审样例更新、一套 website 指导内容更新、相关测试与文档同步

## 宪章检查

_门禁：必须在 Phase 0 research 前通过。Phase 1 设计后需重新检查。_

- 目标 package 边界必须明确，可复用行为必须落在 package 中，而不是只存在于 `website`。
  - 通过：默认字体、回退栈、字重层级和基础样式统一落在 `packages/styles`；`apps/storybook` 与 `apps/website` 只负责消费和评审。
- 必须列出每个受影响 package 的公开 API 变化，包括 props、slots、events、variants 以及 semver 影响。
  - 通过：`@deweyou-ui/styles` 不新增导出路径或公开 token，但 `theme.css`、`theme-light.css`、`theme-dark.css`、`base.css` 的默认字体栈会从现有无衬线方向切换到宋体方向，属于默认视觉契约更新，需要发布说明；`@deweyou-ui/components` 不新增 props、slots、events 或 variants，只会被动获得新的默认字体效果；`apps/storybook` 与 `apps/website` 仅为内部 app 更新，无对外 semver 影响。
- 必须说明无障碍预期，包括键盘交互、焦点管理、语义结构与状态行为。
  - 通过：本计划保持现有语义结构与交互不变，但要求字体调整不得削弱焦点可见性、层级辨识、小尺寸可读性和例外等宽文本的可理解性；Storybook 与 website 将补充标题、正文、控件、数据展示和等宽例外的评审样例。
- 必须识别 token 和主题系统影响，包括新增或修改的设计 token。
  - 通过：本计划复用现有 `--ui-font-body`、`--ui-font-display`、`--ui-font-mono` 角色，不扩 `publicThemeTokens`；修改集中在 `packages/styles/src/primitives/index.ts`、`packages/styles/src/themes/index.ts`、`packages/styles/src/css/base.css` 及其相关产物与测试。
- 必须规划必要验证：`vp check`、相关 `vp test` 或 `vp run ...` 命令，以及 `website` 中的预览或 demo 更新。
  - 通过：计划已包含 `vp check`、`vp test`、`vp run storybook#build`、`vp run website#build`，并要求更新 `apps/storybook/src/stories/Button.stories.tsx` 与 `apps/website/src/main.tsx` 附近的字体评审内容。
- 必须确认本功能相关的 `spec`、`plan`、`tasks` 及其他 `/specs/` 文档均以简体中文撰写。
  - 通过：本计划与同级 research、data-model、contract、quickstart 均使用简体中文撰写。

**Phase 1 后复查**：通过。设计产物继续保持 package-first 边界，明确记录 `@deweyou-ui/styles` 的视觉契约更新、字体角色与平台回退、无障碍预期和 `vp` 验证门禁，未出现需额外豁免的宪章违反项。

## 项目结构

### 文档（本功能）

```text
specs/20260322-define-songti-typography/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── typography-theme-contract.md
└── tasks.md
```

### 源代码（仓库根目录）

```text
apps/
├── storybook/
│   ├── .storybook/
│   │   └── preview.ts
│   └── src/stories/
│       └── Button.stories.tsx
└── website/
    └── src/
        ├── main.tsx
        └── style.css

packages/
└── styles/
    ├── src/
    │   ├── css/
    │   │   ├── base.css
    │   │   ├── theme.css
    │   │   ├── theme-light.css
    │   │   └── theme-dark.css
    │   ├── primitives/
    │   │   └── index.ts
    │   ├── semantics/
    │   │   └── index.ts
    │   ├── themes/
    │   │   └── index.ts
    │   └── index.ts
    ├── scripts/
    │   └── copy-assets.mjs
    ├── tests/
    │   ├── consumer-import.test.ts
    │   ├── index.test.ts
    │   └── theme-outputs.test.ts
    └── README.md

package.json
pnpm-workspace.yaml
```

**结构决策**：本次功能的可复用实现集中在 `packages/styles/`，包括默认字体族、主题输出、基础样式、字体资产复制与测试；`apps/storybook/src/stories/Button.stories.tsx` 负责内部评审矩阵，验证字体层级、混排和小尺寸表现；`apps/website/src/main.tsx` 与相关样式负责公开指导和精选示例。`packages/components` 本期不新增公开 API，只继续消费 `@deweyou-ui/styles` 提供的现有字体角色。

## 复杂度追踪

本次变更没有需要额外说明的宪章违反项。
