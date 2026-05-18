# Website Markdown Render Page Design

## Goal

Add a public website page that lets visitors experience the visual style of `MarkdownRender`, while simplifying the top navigation by grouping related asset/reference pages.

## Navigation

- Keep `Overview`, `AI`, and `Storybook` as primary top-level destinations.
- Group `Components`, `Fonts`, `Icons`, and `Markdown` under one desktop dropdown tab named `Explore`.
- Mark `Explore` active when the current route is `/components`, `/fonts`, `/icons`, or `/markdown-render`.
- Keep mobile navigation simple by presenting all destinations as flat links in the fullscreen navigation overlay.

## Markdown Render Page

- Add `/markdown-render`.
- Desktop layout uses two panes:
  - left pane: Markdown editor
  - right pane: live `MarkdownRender` preview
- The default Markdown sample should exercise headings, body text, lists, task lists, blockquote, table, code, inline code, and links.
- Editing updates the preview immediately through React state.

## Mobile Layout

- Mobile is preview-first because the page is primarily a style showcase.
- The rendered Markdown view is the default mobile surface.
- A fixed edit icon button appears at the lower-right corner with safe-area spacing.
- Tapping edit switches to a full editor surface; the button then switches to a preview icon.
- The editor and preview share the same state, so switching modes preserves edits.

## Testing

- Update navbar tests for the `Explore` dropdown, active states, and React Router navigation.
- Add page tests for default Markdown rendering, live editing, and mobile mode toggling.
- Run targeted website tests plus the relevant website check/build command.
