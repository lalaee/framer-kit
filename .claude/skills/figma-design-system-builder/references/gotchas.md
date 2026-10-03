# Figma Plugin API gotchas (learned the hard way)

## Calls
- `use_figma` calls are **atomic**: an error rolls back the whole call. Keep calls focused, about one component family or two screens each.
- Make **one page switch per call** (`await figma.setCurrentPageAsync(page)`). Never run calls in parallel.
- **Return the created IDs** from every call and keep a ledger. Don't search by name later.
- `combineAsVariants` fails if the nodes aren't on the current page. Switch to the parent's page first, because clones land on the current page.
- The MCP connection can drop. Reload the tools and continue from the ledger, since completed calls persisted.
- Inter's style names are `"Semi Bold"` and `"Extra Bold"` (with spaces). Run `loadFontAsync` before setting text.

## Layout
- `resize()` on an auto-layout frame sets both axes to FIXED. Set `primaryAxisSizingMode='AUTO'` and/or `counterAxisSizingMode='AUTO'` again afterwards where it should hug.
- Set `layoutSizingHorizontal='FILL'` only **after** the node is appended to an auto-layout parent.
- To make a child fill the height of a horizontal parent, set the parent's height to FIXED, then `child.layoutSizingVertical='FILL'`. Use `layoutAlign='STRETCH'` on a child whose height hugs.

## Components and instances
- Copies made with `clone()` **lose `componentPropertyReferences`**. Wire them again on every variant.
- INSTANCE_SWAP values and `preferredValues` must be **COMPONENT (variant) IDs**, never COMPONENT_SET IDs.
- `componentProperties` keys have suffixes (`Label#12:44`). Look them up by prefix.
- Sublayers of an instance **can't be resized or moved** (e.g. a slider fill or knob). Model the state as variants (Slider `Position=0…100`).
- After `setProperties({Control: id})` on a Property Row, read the swapped node again via `row.children[1]` before configuring it.
- Replacing the children of a main component drops instance overrides on those children. Record the overrides first, then reapply them (`reapply-overrides.js`). Parse override IDs with a regex, because nested IDs contain `;`.
- When swapping nested instances in a loop, **collect the IDs first, then swap**, because swapping makes descendant IDs stale.
- Reading `mainComponent` on a TEXT node throws, so check `type==='INSTANCE'` first.

## Not supported in this MCP
- `figma.loadAllPagesAsync`, `setPluginData`, `createImageAsync`. Use other approaches; for images, use no-preview thumbnails or `upload_assets`.
