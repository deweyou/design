# 研究报告：Storybook Docs 升级与重组

**分支**：`20260330-storybook-docs-upgrade` | **日期**：2026-03-30

## 决策汇总

### 决策 1：Storybook 升级目标版本

- **决策**：升级至当时最新的稳定版本，保持同一主版本（10.x），除非存在同一主线下的 breaking change；如有更高主版本可用且 release notes 明确标注稳定，可跳版本。
- **依据**：当前版本 10.2.19；pnpm-workspace.yaml 使用 `catalog:` 统一管理所有 `@storybook/*` 包，版本只需在一处更新即可全局生效，降低遗漏风险。
- **执行方式**：升级时运行 `npm view storybook version` 或查阅 Storybook GitHub Releases 页面确认最新稳定版，然后统一更新 `pnpm-workspace.yaml` 中的 catalog 条目。`apps/storybook/package.json` 中所有 `@storybook/*` 均已使用 `catalog:` 指向，不需要逐文件修改。
- **备选方案**：逐文件 pin 版本 — 不可取，会绕过 catalog 统一管理；锁定 10.2.19 不升级 — 不符合用户需求。

---

### 决策 2：`argTypes` 文档化策略

- **决策**：在每个 story 的 `meta` 中添加完整 `argTypes`，对每个公开 prop 提供英文 `description`、`type`/`control` 定义，以及 `table.defaultValue`。保留现有 gallery 展示组件，`argTypes` 与 gallery 并存，不替换。
- **依据**：
  - 当前 stories 均使用 CSF 3（`satisfies Meta<typeof Xxx>`），`argTypes` 直接在 `meta` 对象中声明即可，无需改变 story 导出结构。
  - `@storybook/addon-docs` 已安装并配置 `tags: ['autodocs']`（仅 Menu 有此 tag；其余 stories 需按需添加）。
  - Storybook autodocs 会自动从 TypeScript 类型推断 prop table，但 `description` 字段需手动填写。
  - 保留 gallery 是因为这些 stories 同时承担内部状态评审职责（见 CLAUDE.md 约束）。
- **argTypes 结构模板**：
  ```typescript
  argTypes: {
    variant: {
      description: 'Visual style of the button.',
      control: { type: 'select' },
      options: ['filled', 'outlined', 'ghost', 'link'],
      table: { defaultValue: { summary: 'filled' } },
    },
    // ...
  }
  ```
- **备选方案**：仅依赖 TypeScript 类型自动推断 — 无法提供 `description` 文本，不满足 FR-004。

---

### 决策 3：story 分类重组方案

- **决策**：将所有 `title` 前缀统一改为 `Components/` 或 `Foundations/`，完全移除 `Internal review/` 前缀。
- **当前 → 目标映射**：

  | 文件                   | 当前 title                   | 目标 title                    |
  | ---------------------- | ---------------------------- | ----------------------------- |
  | Button.stories.tsx     | `Internal review/Button`     | `Components/Button`           |
  | Typography.stories.tsx | `Internal review/Typography` | `Components/Typography`       |
  | Popover.stories.tsx    | `Internal review/Popover`    | `Components/Popover`          |
  | Icon.stories.tsx       | `Internal review/Icon`       | `Components/Icon`             |
  | Menu.stories.tsx       | `Components/Menu`            | `Components/Menu`（已正确）   |
  | Color.stories.tsx      | `Foundations/Color`          | `Foundations/Color`（已正确） |

- **依据**：Menu 和 Color 已经在正确分类下，仅需修改 4 个 story 文件的 `title` 字段。
- **备选方案**：新增 `Design Tokens/` 分类 — 对当前体量（仅 1 个 story）过度设计；保留 `Internal review/` 但新增并行分类 — 会产生重复，且不满足 FR-003。

---

### 决策 4：`IconButton` 文档化方式

- **决策**：在 Button.stories.tsx 中新增一个独立的 `iconButtonMeta`（子 meta 对象）或新增独立 story 段，为 `Button.Icon`（即 `IconButton`）单独声明 `argTypes`。
- **依据**：`IconButton` 的 props 与 `Button` 不同（`icon` 必填、不支持 `link` variant、无 `children`），共用同一 `argTypes` 会产生误导。Storybook 支持在单文件中通过 `subcomponents` 字段或多个 `Meta` export 实现。
- **实现策略**：在 Button.stories.tsx 文件底部新增以下结构：
  ```typescript
  export const IconButtonMeta = {
    component: Button.Icon,
    argTypes: {
      /* IconButton-specific argTypes */
    },
  };
  ```
  或使用 Storybook `subcomponents` 字段在同一 meta 中声明。

---

### 决策 5：`docs.defaultName` 与多语言清理

- **决策**：将 `main.ts` 中 `docs.defaultName` 从中文字符串改为 `'Overview'`（标准英文值）；将所有 story 文件中的中文描述文本（component description、inline 注释、story names）统一改为英文。
- **依据**：用户明确要求英文，FR-005 要求零中文字符串出现在用户可见的 story 文本中。
- **注意**：`pnpm-workspace.yaml`、`vite.config.ts`、`.storybook/preview.ts` 中的 `toolbar.items` 均为代码/配置，适用 CLAUDE.md 例外规则，可保留中性英文或直接用英文。

---

### 决策 6：`tags: ['autodocs']` 策略

- **决策**：为所有 component stories 添加 `tags: ['autodocs']`（Color story 无组件实例，不适用）。
- **依据**：当前只有 Menu.stories.tsx 有此 tag。添加后，Storybook Docs 面板会为每个 story 自动生成 Props 表格，结合 `argTypes` 实现完整 API 文档体验。

---

## 技术约束确认

- **无新 token**：本功能仅修改 `apps/storybook`，不引入新设计 token，不影响 `@deweyou-ui/styles`。
- **无组件 API 变更**：不修改任何 `packages/` 下的源码，公开 API 不变。
- **无 website 影响**：`apps/website` 不在本功能范围内。
- **vite-plus 别名兼容**：`main.ts` 中的 `viteFinal` alias 配置不需变更，仅依赖 storybook 版本升级。
- **宪章语言要求**：spec.md 以英文撰写，与宪章原则 V「/specs/ 文档正文使用简体中文」存在偏差。此偏差由用户明确要求（「使用英文的」）授权，已在 plan.md 复杂度追踪中记录。
