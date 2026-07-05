# @deweyou-design/editor

Editor capabilities for Deweyou Design.

```tsx
import {
  Editor,
  headingPlugin,
  historyPlugin,
  keyboardShortcutPlugin,
  listPlugin,
  markdownEditorAdapter,
  markdownShortcutPlugin,
  textFormatPlugin,
  toolbarPlugin,
} from '@deweyou-design/editor';

<Editor
  adapter={markdownEditorAdapter()}
  plugins={[
    historyPlugin(),
    textFormatPlugin(),
    headingPlugin(),
    listPlugin(),
    toolbarPlugin(),
    markdownShortcutPlugin(),
    keyboardShortcutPlugin(),
  ]}
  placeholder="Write a comment..."
/>;
```

`Editor` does not expose a `format` prop. Content protocols are owned by adapters,
so Markdown is an official adapter rather than the component's default world view.
Feature plugins contribute nodes, commands, actions, shortcuts, and setup independently; presets
such as `richTextPlugin()` remain available for compatibility.
