# 任务：ScrollArea 滚动区域组件

**输入**：来自 `knowledge/specs/20260410-arkui-scrollarea-https/` 的设计文档  
**前置条件**：plan.md ✅、spec.md ✅、research.md ✅、data-model.md ✅  
**语言要求**：任务名称、描述、目标、测试说明、检查点与收尾说明必须使用简体中文；
代码标识符、命令、文件路径、协议字段和第三方 API 名称可保留原文。

**测试**：组件逻辑与用户可见行为必须有自动化测试覆盖（宪章原则 IV）。

## 格式：`[ID] [P?] [Story?] 描述`

- **[P]**：可并行执行（文件不同、无依赖）
- **[Story]**：该任务所属的用户故事（US1 / US2 / US3）
- 描述中必须包含准确文件路径

---

## Phase 1：准备

**目的**：建立源码单元目录结构，确认依赖可用

- [ ] T001 在 `packages/react/src/scroll-area/` 下创建 `index.tsx`、`index.module.less`、`index.test.tsx` 三个空文件
- [ ] T002 [P] 确认 `@ark-ui/react` 已在 `packages/react/package.json` 中声明依赖（如缺失则添加）
- [ ] T003 [P] 在 `apps/website/src/pages/` 下创建 `scroll-area.tsx` 空预览文件

---

## Phase 2：基础阶段（阻塞所有用户故事）

**目的**：定义组件骨架、类型与 CSS 自定义属性；建立 package 导出；搭建 website 预览壳

**⚠️ 关键**：在本阶段完成前，任何用户故事都不能开始

- [ ] T004 在 `packages/react/src/scroll-area/index.tsx` 中定义 `ScrollAreaColor` 类型与 `ScrollAreaProps` 类型（与 data-model.md 对齐）
- [ ] T005 [P] 在 `packages/react/src/scroll-area/index.module.less` 中声明组件 CSS 自定义属性骨架（`--scroll-area-thumb-color`、`--scroll-area-thumb-radius`、`--scroll-area-transition`）及 `.root`、`.viewport`、`.content`、`.scrollbar`、`.thumb`、`.corner` 空选择器
- [ ] T006 在 `packages/react/src/index.ts` 中添加 `ScrollArea`、`ScrollAreaColor`、`ScrollAreaProps` 的导出占位（组件实现后填充）
- [ ] T007 [P] 在 `apps/website/src/pages/scroll-area.tsx` 中搭建预览页壳（标题、占位区块），并在 `apps/website/src/main.tsx` 中引入该预览页

**检查点**：`vp check` 通过，预览站可启动并显示 scroll-area 占位页

---

## Phase 3：用户故事 1 — 垂直滚动区域（优先级：P1）🎯 MVP

**目标**：交付叠层垂直滚动条，内容溢出时显示、不溢出时隐藏，hover 加深，样式完全符合设计规范

**独立测试**：渲染高度受限容器内的超长文本，验证右侧滚动条出现且样式正确；内容缩短后滚动条消失

### 用户故事 1 的测试 ⚠️

- [ ] T008 [P] [US1] 在 `packages/react/src/scroll-area/index.test.tsx` 中编写：渲染基本结构快照测试，验证 `data-color` attribute 正确写入根元素
- [ ] T009 [P] [US1] 在 `packages/react/src/scroll-area/index.test.tsx` 中编写：`color` 默认值为 `'primary'`；传入 `color="neutral"` 时根元素 `data-color="neutral"`

### 用户故事 1 的实现

- [ ] T010 [US1] 在 `packages/react/src/scroll-area/index.tsx` 中实现 `ScrollArea` 组件：
  - 使用 `ScrollArea.Root / Viewport / Content / Scrollbar(vertical) / Thumb / Corner` 组装结构
  - 将 `color`（默认 `'primary'`）、`horizontal`（默认 `false`）、`className`、`style` 作为 props 处理
  - 根元素写入 `data-color` attribute
- [ ] T011 [US1] 在 `packages/react/src/scroll-area/index.module.less` 中实现核心样式：
  - `.root`：`position: relative; overflow: hidden`
  - `.viewport`：`width: 100%; height: 100%; overflow: scroll; scrollbar-width: none`；`::-webkit-scrollbar { display: none }`
  - `.scrollbar[data-orientation='vertical']`：`position: absolute; top: 0; right: 0; bottom: 0; width: 6px`；默认 `opacity: 0`；`transition: opacity var(--scroll-area-transition)`
  - `.scrollbar[data-orientation='vertical'][data-overflow-y]`：`opacity: 1`
  - `.thumb`：`border-radius: 999px; background: var(--scroll-area-thumb-color); transition: background var(--scroll-area-transition)`
  - `.thumb[data-hover]`：`background: color-mix(in srgb, var(--scroll-area-thumb-color) 80%, black 20%)`
  - `color` 档位：`.root[data-color='primary']`、`.root[data-color='neutral']` 写入 `--scroll-area-thumb-color`
- [ ] T012 [US1] 在 `apps/website/src/pages/scroll-area.tsx` 中补充垂直滚动预览：高度受限容器 + 超长文本，展示溢出态与不溢出态
- [ ] T013 [US1] 在 `packages/react/src/index.ts` 中完成 `ScrollArea`、`ScrollAreaColor`、`ScrollAreaProps` 的正式导出

**检查点**：`vp test packages/react` 通过；`vp run website#dev` 可见垂直滚动条出现/消失与 hover 加深效果

---

## Phase 4：用户故事 2 — 水平滚动区域（优先级：P2）

**目标**：`horizontal` prop 为 `true` 时，底部出现水平滚动条；双向溢出时 Corner 填充右下角

**独立测试**：渲染宽度受限容器内的超宽内容并传入 `horizontal`，验证底部滚动条和 Corner 出现

### 用户故事 2 的测试 ⚠️

- [ ] T014 [P] [US2] 在 `packages/react/src/scroll-area/index.test.tsx` 中编写：`horizontal=false` 时不渲染水平 Scrollbar 和 Corner
- [ ] T015 [P] [US2] 在 `packages/react/src/scroll-area/index.test.tsx` 中编写：`horizontal=true` 时渲染水平 Scrollbar 和 Corner

### 用户故事 2 的实现

- [ ] T016 [US2] 在 `packages/react/src/scroll-area/index.tsx` 中：`horizontal` 为 `true` 时条件渲染 `Scrollbar(orientation="horizontal")` 和 `Corner`
- [ ] T017 [US2] 在 `packages/react/src/scroll-area/index.module.less` 中补充：
  - `.scrollbar[data-orientation='horizontal']`：`position: absolute; left: 0; right: 0; bottom: 0; height: 6px`；默认 `opacity: 0`；`[data-overflow-x]` 时 `opacity: 1`
  - `.corner`：`position: absolute; right: 0; bottom: 0; width: 6px; height: 6px; background: var(--ui-color-canvas)`
- [ ] T018 [US2] 在 `apps/website/src/pages/scroll-area.tsx` 中补充：水平滚动预览（宽内容）+ 双向同时滚动预览（含 Corner）

**检查点**：`vp test packages/react` 通过；预览站可见水平滚动条和 Corner

---

## Phase 5：用户故事 3 — 程序式滚动控制（优先级：P3）

**目标**：通过 `ref` 暴露 `scrollToEdge` 方法，消费方可编程控制滚动位置

**独立测试**：在预览页中添加"滚动到顶部"/"滚动到底部"按钮，验证点击后内容正确定位

### 用户故事 3 的测试 ⚠️

- [ ] T019 [US3] 在 `packages/react/src/scroll-area/index.test.tsx` 中编写：通过 `ref` 获取 `scrollToEdge` 方法，调用 `scrollToEdge({ edge: 'top' })` 时 viewport 的 `scrollTop` 被设为 0

### 用户故事 3 的实现

- [ ] T020 [US3] 在 `packages/react/src/scroll-area/index.tsx` 中：
  - 定义 `ScrollAreaRef` 类型（含 `scrollToEdge` 方法签名）
  - 使用 `forwardRef` 将 ref 暴露给消费方；内部使用 `useScrollArea()` hook 或直接操作 viewport ref 实现 `scrollToEdge`
- [ ] T021 [US3] 在 `packages/react/src/index.ts` 中导出 `ScrollAreaRef` 类型
- [ ] T022 [US3] 在 `apps/website/src/pages/scroll-area.tsx` 中补充程序式控制预览：添加"滚动到顶部"和"滚动到底部"按钮

**检查点**：`vp test packages/react` 通过；预览站按钮可触发滚动

---

## Phase 6：打磨与横切关注点

**目的**：确认设计规范数值、无障碍、命名规范、全量验证

- [ ] T023 [P] 对照宪章原则 VII 逐项核查设计数值：`transition: 140ms ease` ✓、thumb `opacity: 0.56`（disabled 态，若有）✓、hover `color-mix` 混色比例 6-20% 范围内 ✓、Corner `--ui-color-canvas` ✓
- [ ] T024 [P] 确认文件命名 kebab-case（`scroll-area/`）✓、组件使用 `.tsx` ✓、所有函数为箭头函数风格 ✓（原则 VI）
- [ ] T025 [P] 在 `apps/website/src/pages/scroll-area.tsx` 中补充 `color` 两档对比预览（primary / neutral，neutral 在深浅色主题下各截图验证）
- [ ] T026 运行 `vp check` 确认类型检查 + lint + 格式化全部通过
- [ ] T027 运行 `vp test packages/react` 确认所有单测通过
- [ ] T028 运行 `vp run website#dev` 进行最终人工评审：所有预览状态（垂直/水平/双向/color 两档/溢出与不溢出）均可评审

---

## 依赖与执行顺序

### 阶段依赖

- **Phase 1（准备）**：无依赖，立即开始
- **Phase 2（基础）**：依赖 Phase 1，阻塞所有用户故事
- **Phase 3（US1）**：依赖 Phase 2，MVP 核心交付
- **Phase 4（US2）**：依赖 Phase 2，可与 Phase 3 并行（若资源允许）
- **Phase 5（US3）**：依赖 Phase 3（需要基本组件已实现）
- **Phase 6（打磨）**：依赖所有用户故事完成

### 用户故事依赖

- **US1（P1）**：Phase 2 完成后立即开始，不依赖其他故事
- **US2（P2）**：Phase 2 完成后即可开始，与 US1 独立，可并行
- **US3（P3）**：依赖 US1 完成（需要 `ScrollArea` 组件骨架）

### 并行机会

- T002、T003 与 T001 可并行（Phase 1 内）
- T005、T007 与 T004 可并行（Phase 2 内）
- T008、T009 可并行（Phase 3 测试）
- T014、T015 可并行（Phase 4 测试）
- Phase 4 整体可与 Phase 3 并行推进
- T023、T024、T025 可并行（Phase 6 打磨）

---

## 并行示例：Phase 3（US1）

```bash
# 同时启动 US1 测试：
Task T008: 快照测试 + data-color attribute 验证
Task T009: color 默认值与 neutral 传参测试

# 测试通过后，同时推进实现：
Task T010: index.tsx 组件实现
Task T011: index.module.less 样式实现
```

---

## 实施策略

**MVP 范围**：Phase 1 + Phase 2 + Phase 3（仅 US1）即可交付可用的垂直滚动区域

**增量顺序**：

1. Phase 1-2：目录与骨架（15 分钟）
2. Phase 3：垂直滚动 MVP（含测试）
3. Phase 4：水平滚动扩展
4. Phase 5：程序式控制（可按需跳过）
5. Phase 6：数值核查与全量验证
