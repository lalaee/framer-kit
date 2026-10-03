# Phase 6: Build apps from the library

**Design natively from what the screen is for. Never reskin.** Copying a codebase's or screenshot's layout and changing its colours is a failure, even when it looks fine.

## 1. Work out what the screen is for

From the repo, brief or screenshots, write a short spec before touching Figma:

- **Job:** what the user is trying to get done on this screen, in one sentence.
- **Objects and data:** what's listed or edited (projects, folders, clips, zooms…), with realistic sample data. Take it from fixtures in the repo if there are any.
- **Areas and tasks:** for an editor or inspector, list every area with its sections and controls, using the app's real labels, option sets, ranges and units, plus the hint copy.
- **States:** empty or first run, populated, selected, menu or context open, loading, error, destructive confirm.
- **Words:** keep the product's own copy. It encodes the intent.

Where to look in a repo: route/view components, the model and types (they define the controls), data fixtures, i18n strings, and any `system.md`/design notes. Grep for `label=`, `title=`, `aria-label=` and `Hint`.

## 2. Map every need to the library

Make a table of need → component (+ variant/props). Anything without a match goes on a **missing list**.

## 3. Grow the library first

For each item on the missing list, design a component on the Components page, built the same way as phase 4 (tokens, variants, properties, description). Examples that came out of real app work:

| Need | Component added |
|---|---|
| Vertical, labelled area switcher | `Rail Item` (Default/Hover/Selected) and `Inspector Rail` |
| Label + any control | `Property Row` (Label TEXT + Control INSTANCE_SWAP) |
| On/off setting | `Toggle Row` |
| Area title + explanation | `Panel Header` |
| Colour input | `Color Field`, `Swatch Picker` |
| Preset with explanation | `Option Card` (radio) |
| Numeric with fill | `Slider` with Position variants (instance sublayers can't be resized) |
| Media without a real image | No-preview thumbnail: `color/background/image` fill, subtle border, centred tertiary Iconly icon |

## 4. Compose the screens

- Use the Templates for the shell, or build it with auto-layout from instances.
- Screens contain **only instances and layout frames.** Plain text is fine only for one-off content such as section labels and hints, and it still uses text styles and colour tokens.
- **Navigation rails are vertical, with labels under the icons** (`Inspector Rail`), on the panel's outer edge. Never use a horizontal row of unlabelled icons.
- **Design a panel for every area**, not just the selected one. Lay them out as a row of `Panel — <Area>` frames, each with its rail item selected.
- Build several states per screen: populated, selection or menu open, and first run or empty.
- All thumbnails use the no-preview thumbnail unless real imagery is provided.
- Paste `scripts/figma/screen-helpers.js` at the top of the build call and compose with `dock()`, `section()`, `slider()`, `select()`, `tabs()`, `segmented()`, `toggleRow()`, `valueRow()`, `hint()`, `button()` and `noPreview()`.

## 5. Check

Screenshot each screen. Check for wrapped labels (Property Row labels are 64px, so keep them short, like "Blur" not "Motion blur"), overflowing button rows, rails that don't stretch the full height, and icon size and stroke. Fix, then screenshot again.
