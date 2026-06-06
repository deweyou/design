# @deweyou-design/editor

Editor capabilities for Deweyou Design.

```tsx
import {
  Editor,
  markdownEditorAdapter,
  markdownShortcutPlugin,
  richTextPlugin,
} from '@deweyou-design/editor';

<Editor
  adapter={markdownEditorAdapter()}
  plugins={[richTextPlugin(), markdownShortcutPlugin()]}
  placeholder="Write a comment..."
/>;
```

`Editor` does not expose a `format` prop. Content protocols are owned by adapters,
so Markdown is an official adapter rather than the component's default world view.
