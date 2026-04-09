# 归档：组件测试用例规范

**分支**：`20260409-component-testing-standards`  
**完成时间**：2026-04-09  
**类型**：feature

---

## 交付摘要

为 `@deweyou-design/react` 组件库制定了完整的测试规范，涵盖 Vitest 单测与 Storybook e2e 两条测试线路，并将规范拆解为可操作的必覆盖项清单（按纯展示组件 / 交互型组件分类）。同步补齐了全部 5 个存量组件的覆盖缺口（`Text`、`Tabs`、`Menu`），将 Vitest 覆盖率门禁提升至 80%（全部四项指标），并在 CI 中同时接入覆盖率检查和 Storybook interaction test 步骤。

---

## 关键决策

| 决策                      | 选择                                            | 理由                                                                                                                                     | 备选方案                                            |
| ------------------------- | ----------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------- |
| 覆盖率门禁值              | 80%（四项全部）                                 | 兼顾严格执行与 jsdom 环境的固有局限（SSR 路径、ResizeObserver 依赖分支在 jsdom 下不可触达），100% 会导致大量需要 mock 内部实现的脆弱测试 | 70%（太宽松）、100%（不可达分支强制 mock 适得其反） |
| 覆盖率收集器              | `@vitest/coverage-v8`，固定版本 `^4.1.0`        | 必须与 `@voidzero-dev/vite-plus-test` 内部捆绑的 vitest 版本一致，版本不一致时会触发 `fetchCache` 运行时报错                             | `istanbul`（不依赖 vite-plus 内部，但精度较低）     |
| 覆盖率运行目录            | 在 `packages/react` 内执行 `vp test --coverage` | 从 workspace root 运行会聚合所有子包（icons、styles 等），拉低到约 51%，无法反映组件实现质量                                             | 根目录运行（数值失真）                              |
| CI Storybook e2e 接入方式 | build → serve → test-runner                     | 与本地 `storybook#test` 保持一致，避免引入新的浏览器 CI 层                                                                               | 直接用 Playwright（需单独搭建）                     |
| 测试规范文档位置          | `knowledge/testing-standards.md`                | 作为组件开发者的持久参考文档，独立于宪章，不会让 constitution.md 过于臃肿                                                                | 内嵌到 constitution.md（会让宪章文档变得过长）      |

---

## 踩坑记录

- **问题**：首次安装 `@vitest/coverage-v8@^3.0.0`，`vp test --coverage` 报错 `V8CoverageProvider.getUntestedFiles: Cannot read properties of undefined (reading 'fetchCache')`，错误信息无明显线索。  
  **解决方案**：检查 vite-plus-test 内部 vitest 版本（`4.1.x`），将 `@vitest/coverage-v8` 改为 `^4.1.0` 对齐。

- **问题**：`TabIndicator` className 测试中，`querySelector('[data-part="indicator"]')` 返回了 Tabs 内部 indicator（`variant='line'` 的内置节点），而不是自定义的 `TabIndicator`，导致断言通过但验证目标错误。  
  **解决方案**：将 host Tabs 改为 `variant='bg'`（无内置 indicator），消除歧义。

- **问题**：Text 组件的 CSS token 断言误判——`--ui-text-color-` 是在 `index.tsx` 中以内联样式 `var(--ui-text-color-${color})` 使用，而非写在 Less 文件里，断言 Less 文件包含该变量始终失败。  
  **解决方案**：改为断言 Less 文件中的桥接 token `--text-color-current` 和 `--text-background-current`。

- **问题**：第一轮覆盖率结果 `packages/react` 分支覆盖 78.23%，低于 80% 门禁。  
  **解决方案**：第二轮定向补测 menu icon 分支（`MenuSeparator className`、`MenuTriggerItem icon+selected`、`MenuRadioItem icon`、`MenuCheckboxItem icon+no-value`）、menu disabled 分支、Tabs `onFocusChange`、popover `childRef` 合并分支，最终达 80.75%。

- **问题**：`Popover` 的 `popupPortalContainer`（RefObject 分支）和 blur-timeout 逻辑（含异步 focus 事件）在 jsdom 中无法触发，始终处于未覆盖状态。  
  **解决方案**：确认为 jsdom 固有局限，接受为已知缺口，80% 门禁已将此类场景纳入容忍区间。

---

## 可复用模式

- **分支覆盖缺口分析工作流**：在包目录内运行 `vp test --coverage`，从报告中读取未覆盖行号，对应查找源码中的条件分支，针对性补写测试。通常两轮可以从 ~70% 推进到 >80%。

- **jsdom 不可达分支类别**：SSR 守卫（`typeof document !== 'undefined'`）、依赖 ResizeObserver 的布局计算、异步 blur/focus timeout 链、复杂 ref callback 链，这些在 jsdom 下系统性不可触达。应提前文档化为已知缺口，而不是写脆弱的 workaround。

- **捆绑式测试框架的版本对齐规则**：使用内置测试框架（如 vite-plus）时，务必检查其捆绑的 vitest 版本，并将 `@vitest/coverage-v8` 固定到相同的 major.minor，版本不一致会产生不明显的运行时崩溃。

---

## 宪章反馈

- [ ] 建议在 constitution.md 第 IV 条（测试与预览门禁）或新增测试节中，补充说明 jsdom 不可达分支的类别，明确后续贡献者应接受这些缺口而非强行绕过。

---

## 后续待办

- 在 Storybook `Tabs` 的 `Interaction` story 中补充 `onFocusChange` 键盘触发的 e2e 断言，使键盘导航路径在真实浏览器中也有覆盖。
- Popover blur-timeout 和 childRef 路径可考虑通过 Storybook e2e 而非 jsdom 测试覆盖。
