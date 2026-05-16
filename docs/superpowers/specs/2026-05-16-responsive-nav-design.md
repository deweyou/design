# Responsive Nav Design

## Problem

The website header currently uses a horizontal nav shape for desktop and small screens. On narrow widths the links wrap into multiple rows, which makes spacing unpredictable and makes the header feel like a broken tab strip instead of an intentional mobile navigation pattern.

The pattern is not website-specific. Product surfaces often need the same behavior: show direct horizontal navigation when there is room, then collapse the same destinations into an icon-triggered list on small screens.

## Decision

Add `Nav.Responsive` to `@deweyou-design/react`.

This keeps the existing `Nav.Root` and `Nav.Link` primitives small, while giving consumers a data-driven responsive entry point for common app navigation. It also avoids naming the component `ResponsiveTabs`, because the behavior is navigation between routes or sections, not tab-panel ownership.

## API Sketch

```tsx
type NavResponsiveItem = {
  value: string;
  label: ReactNode;
  href?: string;
  icon?: ReactNode;
  active?: boolean;
  disabled?: boolean;
  external?: boolean;
  target?: HTMLAnchorElement['target'];
  rel?: string;
  onSelect?: (details: NavResponsiveSelectDetails) => void;
};

type NavResponsiveSelectDetails = {
  value: string;
  item: NavResponsiveItem;
  event: MouseEvent | KeyboardEvent;
};

type NavResponsiveProps = {
  items: readonly NavResponsiveItem[];
  value?: string;
  'aria-label'?: string;
  collapseLabel?: string;
  breakpoint?: 'sm' | 'md' | 'lg';
  size?: NavSize;
  className?: string;
  listClassName?: string;
  menuClassName?: string;
  onSelect?: (details: NavResponsiveSelectDetails) => void;
};
```

Default behavior:

- `value` marks the active item when `active` is not provided per item.
- Desktop renders the items through `Nav.Root` and `Nav.Link`.
- Mobile renders an `IconButton` trigger and a `Menu` list with the same items.
- `collapseLabel` defaults to a neutral accessible label such as `Open navigation`.
- `external` applies the usual external-link defaults when the consumer does not provide `target` or `rel`.

## Behavior

`Nav.Responsive` should remain navigation-oriented. It does not own routed state, panels, or page content. Consumers pass `href` for normal navigation and may pass `onSelect` for custom behavior.

On desktop, items are visible inline and preserve the current `Nav` appearance. On mobile, only the trigger is visible; selecting an item from the menu invokes item-level `onSelect` first, then root `onSelect`, and normal anchor behavior remains available for `href` items.

Disabled items are visible but not interactive. Active items receive `aria-current="page"` for link rendering and a selected indicator in the mobile menu.

## Accessibility

The desktop branch is still a `nav` landmark with a consumer-provided `aria-label`.

The mobile branch uses the existing `Menu` component for focus management, keyboard navigation, dismissal, and positioning. The trigger must be an `IconButton` with an accessible label. Menu items preserve active state visually and semantically where the underlying primitive supports it.

## Website Migration

Update `apps/website/src/components/navbar.tsx` to use `Nav.Responsive` for the page destinations:

- Overview
- Components
- Icons
- Storybook

Keep GitHub and theme toggle outside the nav in the right action cluster. This matches the intended information architecture: page destinations belong in nav, global actions belong in actions.

The current path should continue to determine the active page item. Storybook remains an external destination.

## Tests

Package-level tests:

- `Nav.Responsive` renders all items inline by default.
- `value` and per-item `active` produce active state.
- external items receive safe link defaults.
- mobile branch exposes an icon button trigger and menu items.
- disabled items do not call selection callbacks.

Website tests:

- navbar passes the expected destinations to `Nav.Responsive`.
- GitHub remains outside the nav as an icon button action.
- small-screen header no longer relies on wrapping nav rows.

Verification:

- `vp test` for touched package and website tests.
- `vp check`.
- Browser visual checks for desktop and mobile header widths.

## Out Of Scope

- Changing `Tabs` behavior or naming.
- Replacing `NavOverlay`.
- Redesigning the full documentation navigation system.
- Moving GitHub or theme actions into the responsive menu.

## Self Review

This keeps the new abstraction in the component library because the behavior is reusable, but avoids overloading the existing low-level `Nav.Root` API. The main implementation risk is CSS breakpoint ownership; the component should own its collapse breakpoint through stable classes and design tokens, while allowing local layout wrappers to control spacing around it.
