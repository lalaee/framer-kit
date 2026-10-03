# Phase 4: Components

Build from small to large. Each component is a **component set with variants**, every value is bound to a token, and each one is screenshot-checked against its source.

## Order

1. **Small:** Button (Style × Size × State), Icon Button, Avatar, Badge (tones), Meta Label, Toggle, Checkbox, Divider (and Divider/Labeled), Tab, Input (Type × Content × State), Textarea, Select (State), Slider (Position 0–100 step 10 + Value text)
2. **Combinations:** Tab Group, Form Field, Nav Item (Level × State), Nav Section Header, Workspace Switcher, Menu Item, Menu, Property Row (Label + Control swap), Toggle Row, Color Field, Swatch Picker, Option Card, Rail Item, Panel Header
3. **Large:** Top Bar, Sidebar Footer, Settings Row, Session Row, Plan Card, Plans Table, Project/Video Card, Stat, Empty State, Dropzone, Table Header Cell, Table Cell, Floating Toolbar, Breakpoint Bar, Chat Bar, Inspector Rail, Track Header, Timeline Item, Playhead

## Recipe for each component

```js
const c = figma.createComponent(); c.name = 'State=Default';
c.layoutMode = 'HORIZONTAL'; c.counterAxisAlignItems = 'CENTER';
// bind fills, strokes, padding, gap and radii to variables (see 02-tokens.md)
// add children: text with a text style, icon instance (Icon/<name> Size=12|16)
// make variant copies, then:
const set = figma.combineAsVariants([a, b, c], componentsPage);
set.name = 'Button';
set.addComponentProperty('Label', 'TEXT', 'Button');            // returns key "Label#12:0"
set.addComponentProperty('Leading icon', 'BOOLEAN', false);
set.addComponentProperty('Icon', 'INSTANCE_SWAP', ICON_VARIANT_ID); // a COMPONENT (variant) id, never a set id
for (const v of set.children) {
  v.findOne(n => n.name === 'label').componentPropertyReferences = { characters: labelKey };
  const ic = v.findOne(n => n.name === 'icon');
  ic.componentPropertyReferences = { visible: boolKey, mainComponent: swapKey };
}
set.description = 'When to use it and how';
```

## Layout of the Components page

Each set sits under a `title` text (Heading/L). The set itself is an auto-layout frame with a 16px padding, 8px gap and a dashed purple border. Rows are about 80px apart. Instead of a set, a "preview" frame can show a single complex component.

## Checks

- **Text weight:** labels on buttons, tabs and nav use `Label/Default` (Semi Bold). Body text uses `Body/Default` (Medium).
- **The Inverse/white button is just as heavy as Primary** (same label style).
- **Nav items:** 12px icon with the inset described in 01-extract.
- Sizing: after any `resize()` on an auto-layout node, set `primaryAxisSizingMode='AUTO'` again where the node should hug.
- Every variant copied with `clone()` must have its property references wired again.
- Screenshot the set, then a test instance in a frame, then compare with the source frame.

## Rebuild check (Examples page)

Rebuild 2 or 3 of the source frames from instances only. If they don't match closely, fix the components, not the examples.
