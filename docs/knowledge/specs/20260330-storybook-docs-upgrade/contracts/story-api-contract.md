# Story API 契约：Storybook 文档标准

**分支**：`20260330-storybook-docs-upgrade` | **日期**：2026-03-30

本文档定义每个 story 文件的最低文档标准，作为实现时的验收契约。

---

## 契约一：story 分类路径

每个 story 文件的 `meta.title` 必须符合以下路径规则：

| story 文件               | 必须使用的 title          |
| ------------------------ | ------------------------- |
| `Button.stories.tsx`     | `'Components/Button'`     |
| `Typography.stories.tsx` | `'Components/Typography'` |
| `Popover.stories.tsx`    | `'Components/Popover'`    |
| `Icon.stories.tsx`       | `'Components/Icon'`       |
| `Menu.stories.tsx`       | `'Components/Menu'`       |
| `Color.stories.tsx`      | `'Foundations/Color'`     |

**违反条件**：`title` 中出现 `Internal review`，或不在 `Components/` 与 `Foundations/` 两个顶层分类下。

---

## 契约二：argTypes 覆盖率

每个 component story 的 `meta.argTypes` 必须覆盖所有公开 prop，符合以下规则：

```
对每个公开 prop P：
  ✓ argTypes[P].description 存在且为英文字符串
  ✓ argTypes[P].table.type.summary 存在，与 TypeScript 类型一致
  ✓ argTypes[P].table.defaultValue.summary 存在（无默认值的 prop 可标注 '—'）
  ✓ 有有限选项的 prop 使用 control: { type: 'select' } 并提供 options 数组
  ✓ boolean prop 使用 control: { type: 'boolean' }
  ✓ text/string prop 使用 control: { type: 'text' }
  ✓ ReactNode / function / complex object prop 使用 control: false
```

**例外**：Color.stories.tsx（非组件 story）不需要 argTypes。

---

## 契约三：语言标准

story 文件中以下位置的字符串必须全部为英文：

| 位置                                                  | 示例                                    |
| ----------------------------------------------------- | --------------------------------------- |
| `meta.title`                                          | `'Components/Button'`                   |
| `meta.parameters.docs.description.component`          | `'Button is the primary...'`            |
| `argTypes[P].description`                             | `'Visual style variant of the button.'` |
| `argTypes[P].table.type.summary`                      | `'filled \| outlined \| ghost \| link'` |
| `argTypes[P].table.defaultValue.summary`              | `'filled'`                              |
| 具名 story export 的名称                              | `export const Variants = ...`           |
| story 内部 gallery 组件的 label（面向读者的文字标注） | `'Filled'`、`'Primary'`                 |

**允许保留英文外其他格式**：代码标识符、变量名、CSS 类名、命令字符串。

---

## 契约四：tags 与 autodocs

每个 component story 的 `meta.tags` 必须包含 `'autodocs'`：

```typescript
tags: ['autodocs'],
```

**例外**：Color.stories.tsx 不需要此 tag（无关联组件）。

---

## 契约五：Storybook 版本一致性

升级后，以下所有包在 `pnpm-workspace.yaml` 的 `catalog:` 节中必须指向同一版本号：

```
@storybook/addon-docs
@storybook/react
@storybook/react-vite
storybook
```

`apps/storybook/package.json` 中上述依赖的版本值必须均为 `catalog:`，不得出现硬编码版本号。

---

## 契约六：`docs.defaultName` 语言

`apps/storybook/.storybook/main.ts` 中的 `docs.defaultName` 值必须为英文字符串，不得包含中文字符。推荐值：`'Overview'`。

---

## 验收流程

实现完成后，按以下顺序验证：

1. 运行 `vp run storybook#dev` 启动 Storybook
2. 打开每个 story 的 Docs 页面，确认 Props 表格完整
3. 确认侧边栏仅显示 `Components/` 和 `Foundations/` 两个顶层分类
4. 确认所有用户可见文本为英文
5. 运行 `vp check` 无错误
6. 在 Light / Dark 模式下各预览一遍，确认主题切换正常
