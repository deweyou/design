# @deweyou-design/react-hooks

Reusable React hooks shared by Deweyou Design components and app surfaces.

## Installation

```bash
npm install @deweyou-design/react-hooks
```

## Hooks

### `useThemeMode`

Manages light / dark theme mode state with a toggle helper.

```ts
import { useThemeMode, type ThemeMode } from '@deweyou-design/react-hooks';

const { mode, setMode, toggleMode } = useThemeMode();
// mode: ThemeMode  ('light' | 'dark')
// setMode(mode: ThemeMode): void
// toggleMode(): void
```

## Dependency Rules

- May depend on: React and `@deweyou-design/utils`.
- Must not depend on: `@deweyou-design/react`, `apps/website`, or `apps/storybook`.

## License

MIT
