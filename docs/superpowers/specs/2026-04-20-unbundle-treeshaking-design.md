# 构建优化设计：preserveModules + Tree-shaking

**日期**：2026-04-20  
**状态**：已批准

---

## 背景与目标

当前 `@deweyou-design/react` 使用 Vite lib mode 多入口打包，共享代码被提取到 `chunks/[hash].js`，且缺少 `sideEffects` 声明。作为对外发布的 npm 包，消费者的 bundler（特别是 Webpack）无法可靠地 tree-shake 未使用的组件，导致 bundle 体积偏大。

**目标**：

- 切换为 `preserveModules` 模式，让每个源文件对应一个输出文件
- 补全 `sideEffects` 声明，使所有主流 bundler 均可正确摇树
- 更新 storybook、website 引用，清理 hard-coded 路径
- 更新 README.md 的使用说明

---

## 架构变更

### packages/react — 核心变更

**vite.config.ts** 调整：

```ts
// 移除：lib.entry 中手动列举各组件入口
// 移除：output.chunkFileNames
// 改为单 entry + preserveModules：
build: {
  lib: {
    entry: './src/index.ts',
    formats: ['es'],
  },
  rollupOptions: {
    external: [ /* 保持现有 external 列表不变 */ ],
    output: {
      preserveModules: true,
      preserveModulesRoot: 'src',
      entryFileNames: '[name].js',
    }
  }
}
```

**package.json** 新增：

```json
"sideEffects": ["**/*.css"]
```

exports 结构保持不变（各 subpath 指向 `dist/<component>/index.js`）。

### 其他包 sideEffects 补全

| 包            | 新增声明                                   |
| ------------- | ------------------------------------------ |
| `react-hooks` | `"sideEffects": false`                     |
| `utils`       | `"sideEffects": false`                     |
| `styles`      | `"sideEffects": ["**/*.css", "**/*.less"]` |
| `react-icons` | 已有，不变                                 |

---

## dist 输出结构

```
packages/react/dist/
├── index.js              ← barrel，re-export 所有组件
├── index.d.ts
├── button/
│   ├── index.js
│   ├── index.d.ts
│   ├── button.js
│   ├── button.d.ts
│   └── button.css        ← 仅该组件的样式
├── menu/
│   ├── index.js
│   ├── menu.js
│   └── menu.css
├── ...（其余组件同结构）
└── style.css             ← 全量合并 CSS，供需要整体引入的场景
```

---

## CSS 处理

- `preserveModules` 模式下，各组件的 CSS import 提取为同目录独立文件，JS 中保留 `import './button.css'` 语句
- 这是 CSS 的 side effect，因此 `sideEffects` 声明为 `["**/*.css"]` 而非 `false`
- 全量 `style.css` 保留，对应 `"./style.css"` export
- `@deweyou-design/styles` 的 `.less` 文件不受影响

---

## 类型声明

`tsc -p tsconfig.build.json` 保持现有流程，`declaration: true` + `declarationDir: dist`。  
preserveModules 与 TypeScript 的逐文件 `.d.ts` 输出天然对齐，无需额外改动。

确认 `tsconfig.build.json` 包含：

```json
{
  "compilerOptions": {
    "declaration": true,
    "declarationDir": "./dist",
    "emitDeclarationOnly": true
  }
}
```

---

## storybook / website

- 两者通过 workspace 引用，开发走 source，不受影响
- 检查是否有 hard-coded `dist/chunks/...` 路径，有则清理
- 验证 Vite dev server 能正确解析 preserveModules 产物中的 CSS side effect import

---

## README.md 更新

需更新以下内容：

1. 推荐导入方式及 tree-shaking 说明：
   - Barrel import（`import { Button } from '@deweyou-design/react'`）：现代 bundler 自动 tree-shake
   - Per-component import（`import Button from '@deweyou-design/react/button'`）：最精确，推荐生产环境使用
2. CSS side effect 说明：消费者的 bundler 需支持 CSS side effect import（Vite / webpack 5 默认支持）
3. 如构建命令有变化，同步更新

---

## 不在此次范围内

- react-icons 的 preserveModules 改造（当前单文件 + sideEffects:false 已足够）
- CJS 双格式输出（当前 ESM-only 策略保持不变）
- CSS-in-JS 或运行时样式注入方案
