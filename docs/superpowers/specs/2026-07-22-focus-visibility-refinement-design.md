# Focus Visibility Refinement Design

> Date: 2026-07-22
> Status: Approved through user-confirmed visual alignment

## Goal

Keep keyboard focus visible without surrounding large containers and floating surfaces with a bright green frame.

## Decisions

- Keep emerald as the semantic focus color for compact controls.
- Use `emerald-800` for the light theme and `emerald-700` for the dark theme.
- Apply the shared deep-emerald border/inset treatment to compact local controls such as menu items, buttons, fields, select triggers, and tabs.
- Apply a neutral border/inset treatment to Website navigation and utility controls, icon or canvas tiles, clickable cards, and masonry items.
- Do not apply a brand-colored frame to an entire menu, select list, dialog panel, navigation overlay, popover surface, editor canvas, scroll area, or tab panel.
- Preserve existing focus management, keyboard navigation, ARIA semantics, caret behavior, highlighted items, and trigger open states.

## Accessibility Boundary

Removing a container frame must not remove the user's keyboard path. A component remains acceptable only when the currently operated control, highlighted item, text caret, or focused descendant provides a visible local signal.

The selected deep emerald steps remain distinguishable from adjacent surfaces: the light-theme token has approximately 4.46:1 contrast against white, and the dark-theme token has approximately 3.53:1 contrast against the dark surface.

## Acceptance Criteria

- Opening Menu, ContextMenu, Select, Dialog, NavOverlay, or Popover does not draw a green frame around the entire surface.
- Editor, ScrollArea, and Tabs content do not draw a full-container focus frame.
- Menu items, Select triggers, Tabs triggers, buttons, and form fields retain deep-emerald local focus feedback.
- Website navigation and utility controls, icon cells, clickable cards, and the three masonry families use neutral local focus feedback.
- Light and dark theme outputs publish the approved deep emerald focus tokens.
- Component style contracts and live Website verification cover the change.

_Last updated: 2026-07-22 | Reason: record the approved compact-control and neutral large-target focus boundary_
