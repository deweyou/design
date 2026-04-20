# Focus Ring: outline → box-shadow Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将全库焦点环从 `outline` 改为 `box-shadow`，获得更柔和的视觉效果，同时保持 `:focus-visible` 语义和无障碍标准不变。

**Architecture:** 在 `bridge.less` 中新增 `.focus-ring()` mixin，封装新的 `box-shadow` 实现，然后逐一替换各组件中散落的 `outline` inline 写法。Input/Textarea 的焦点通过 `border-color` 变化体现，额外叠加 `box-shadow`。

**Tech Stack:** Less CSS Modules、`@deweyou-design/styles/less/bridge`

---

## Files

- Modify: `packages/styles/src/less/bridge.less`
- Modify: `packages/react/src/button/index.module.less`
- Modify: `packages/react/src/checkbox/index.module.less`
- Modify: `packages/react/src/radio-group/index.module.less`
- Modify: `packages/react/src/switch/index.module.less`
- Modify: `packages/react/src/select/index.module.less`
- Modify: `packages/react/src/tabs/index.module.less`
- Modify: `packages/react/src/pagination/index.module.less`
- Modify: `packages/react/src/menu/index.module.less`
- Modify: `packages/react/src/breadcrumb/index.module.less`
- Modify: `packages/react/src/toast/index.module.less`
- Modify: `packages/react/src/input/index.module.less`
- Modify: `packages/react/src/textarea/index.module.less`

---

### Task 1: 在 bridge.less 中添加 `.focus-ring()` mixin

**Files:**

- Modify: `packages/styles/src/less/bridge.less`

- [ ] **Step 1: 在文件末尾追加 mixin**

```less
// 焦点环 mixin — 使用 box-shadow 避免 outline 视觉突兀感
// 注意：不使用 outline: none 完全关闭，而是保留 UA 默认 outline 作为高对比模式 fallback
.focus-ring() {
  box-shadow: 0 0 0 2px var(--ui-color-focus-ring);
  outline: none;
}

// 带 offset 的焦点环（用于需要视觉间距的场景，如 button、checkbox）
.focus-ring-offset() {
  box-shadow:
    0 0 0 2px var(--ui-color-surface),
    0 0 0 4px var(--ui-color-focus-ring);
  outline: none;
}
```

- [ ] **Step 2: 运行类型检查**

```bash
vp check
```

Expected: 无错误。

- [ ] **Step 3: Commit**

```bash
git add packages/styles/src/less/bridge.less
git commit -m "feat(styles): add focus-ring mixin to less bridge"
```

---

### Task 2: 更新 button

**Files:**

- Modify: `packages/react/src/button/index.module.less`

- [ ] **Step 1: 在文件顶部添加 bridge import（如未引入）**

检查文件顶部是否有 `@import '@deweyou-design/styles/less/bridge';`，若无则添加。

- [ ] **Step 2: 搜索并替换 `:focus-visible` 块**

找到形如以下的块：

```less
&:focus-visible {
  outline: 2px solid var(--ui-color-focus-ring);
  outline-offset: 2px;
}
```

替换为：

```less
&:focus-visible {
  .focus-ring-offset();
}
```

- [ ] **Step 3: 运行测试**

```bash
vp test packages/react -- --testPathPattern=button
```

Expected: 全部 PASS。

- [ ] **Step 4: Commit**

```bash
git add packages/react/src/button/index.module.less
git commit -m "refactor(button): use focus-ring-offset mixin for focus style"
```

---

### Task 3: 更新 checkbox

**Files:**

- Modify: `packages/react/src/checkbox/index.module.less`

- [ ] **Step 1: 添加 bridge import（如未引入）**

在文件顶部添加：`@import '@deweyou-design/styles/less/bridge';`

- [ ] **Step 2: 替换 focus-visible 块**

找到：

```less
.root:has(:focus-visible) .control {
  outline: 2px solid var(--ui-color-focus-ring);
  outline-offset: 2px;
}
```

替换为：

```less
.root:has(:focus-visible) .control {
  .focus-ring-offset();
}
```

- [ ] **Step 3: 运行测试**

```bash
vp test packages/react -- --testPathPattern=checkbox
```

Expected: 全部 PASS。

- [ ] **Step 4: Commit**

```bash
git add packages/react/src/checkbox/index.module.less
git commit -m "refactor(checkbox): use focus-ring-offset mixin"
```

---

### Task 4: 批量更新 radio-group、switch、select、tabs、pagination、menu、breadcrumb

**Files:**

- Modify: `packages/react/src/radio-group/index.module.less`
- Modify: `packages/react/src/switch/index.module.less`
- Modify: `packages/react/src/select/index.module.less`
- Modify: `packages/react/src/tabs/index.module.less`
- Modify: `packages/react/src/pagination/index.module.less`
- Modify: `packages/react/src/menu/index.module.less`
- Modify: `packages/react/src/breadcrumb/index.module.less`

对每个文件重复以下步骤：

- [ ] **Step 1: 为每个组件添加 bridge import（如未引入）**

在文件顶部添加：`@import '@deweyou-design/styles/less/bridge';`

- [ ] **Step 2: 替换 focus-visible 块**

搜索每个文件中形如以下的块：

```less
&:focus-visible {
  outline: 2px solid var(--ui-color-focus-ring);
  outline-offset: 2px;
}
```

或

```less
:focus-visible {
  outline: 2px solid var(--ui-color-focus-ring);
  outline-offset: 2px;
}
```

替换为：

```less
&:focus-visible {
  .focus-ring-offset();
}
```

- [ ] **Step 3: 运行测试（批量）**

```bash
vp test packages/react -- --testPathPattern="radio-group|switch|select|tabs|pagination|menu|breadcrumb"
```

Expected: 全部 PASS。

- [ ] **Step 4: Commit**

```bash
git add packages/react/src/radio-group/index.module.less \
        packages/react/src/switch/index.module.less \
        packages/react/src/select/index.module.less \
        packages/react/src/tabs/index.module.less \
        packages/react/src/pagination/index.module.less \
        packages/react/src/menu/index.module.less \
        packages/react/src/breadcrumb/index.module.less
git commit -m "refactor(react): use focus-ring-offset mixin across form and nav components"
```

---

### Task 5: 更新 toast（close button）

**Files:**

- Modify: `packages/react/src/toast/index.module.less`

- [ ] **Step 1: 找到 `.close:focus-visible` 块**

当前代码（位于 `.close` 嵌套块内）：

```less
&:focus-visible {
  opacity: 1;
  outline: 2px solid var(--ui-color-focus-ring);
  outline-offset: 2px;
}
```

- [ ] **Step 2: 替换**

```less
&:focus-visible {
  opacity: 1;
  .focus-ring-offset();
}
```

（bridge import 已在文件顶部，无需重复添加）

- [ ] **Step 3: 运行测试**

```bash
vp test packages/react -- --testPathPattern=toast
```

Expected: 全部 PASS。

- [ ] **Step 4: Commit**

```bash
git add packages/react/src/toast/index.module.less
git commit -m "refactor(toast): use focus-ring-offset mixin for close button"
```

---

### Task 6: 更新 input 和 textarea（叠加 box-shadow）

Input/Textarea 当前用 `border-color` 变化表示焦点，这个行为保留。额外叠加 `box-shadow` 让焦点更明显。

**Files:**

- Modify: `packages/react/src/input/index.module.less`
- Modify: `packages/react/src/textarea/index.module.less`

- [ ] **Step 1: 在 input/index.module.less 顶部添加 bridge import**

在文件顶部添加：`@import '@deweyou-design/styles/less/bridge';`

- [ ] **Step 2: 找到 `.field:focus-visible` 块**

当前：

```less
&:focus-visible {
  border-color: var(--ui-color-focus-ring);
}
```

替换为：

```less
&:focus-visible {
  border-color: var(--ui-color-focus-ring);
  .focus-ring();
}
```

（input 使用 `.focus-ring()` 而非 `.focus-ring-offset()`，因为边框本身已提供视觉间距）

- [ ] **Step 3: 对 textarea/index.module.less 做相同处理**

找到 `textarea:focus-visible` 的块（模式同 input），添加 bridge import 并添加 `.focus-ring()`。

- [ ] **Step 4: 运行测试**

```bash
vp test packages/react -- --testPathPattern="input|textarea"
```

Expected: 全部 PASS。

- [ ] **Step 5: 更新设计文档中焦点规范一节**

在 `docs/superpowers/specs/2026-04-20-design-style-design.md` 的第 4 节焦点规范中，将 "当前实现" 注释和代码更新为：

```less
// ✓ 正确（box-shadow 实现，兼容 border-radius）
.root:focus-visible {
  box-shadow:
    0 0 0 2px var(--ui-color-surface),
    0 0 0 4px var(--ui-color-focus-ring);
  outline: none;
}
```

并移除"待 spec 落地后更新"的注释。

- [ ] **Step 6: Commit**

```bash
git add packages/react/src/input/index.module.less \
        packages/react/src/textarea/index.module.less \
        docs/superpowers/specs/2026-04-20-design-style-design.md
git commit -m "refactor(input): add box-shadow focus ring alongside border-color"
```
