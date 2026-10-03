# Phase 3: Icons (Iconly only)

**Every icon in the library and in every screen comes from Iconly.** That means no hand-drawn vectors, no Lucide or Material icons, and no icons copied from the source file. If the source uses an icon you don't have, find the closest Iconly match, add it to the library, then use it.

## Setup

- Iconly MCP endpoint: `https://mcp.iconly.pro/mcp` (JSON-RPC over HTTP).
- Key: read from the `ICONLY_API_KEY` environment variable. **Never commit or paste the key** into files, commits or Figma.
- Style: **Light** (`style_id: 4`), type regular (`type_id: 1`). Line icons on a 24 grid with a 1.5 stroke, which we normalize to 2.
- The API rate-limits, so fetch one at a time with backoff. `scripts/iconly.py` does this.

## Workflow

1. **List the icons you need.** Combine the phase 1 inventory with what phase 6 screens will need. Give each a kebab name (`search`, `chevron-down`, `folder-plus`, `webcam`…).
2. **Search for candidates:** `python scripts/iconly.py search search chevron-down folder ...`. This writes `iconly/candidates.json` with up to 10 candidates per name.
3. **Choose visually:** `python scripts/iconly.py sheet` renders a contact sheet (`iconly/sheet.html`). Screenshot it with Playwright if you need to see it. Write your picks to `iconly/map.json` as `{ "name": iconId }`.
4. **Fetch and normalize:** `python scripts/iconly.py build`. This fetches each SVG, sets `stroke-width="2"` on the 24 viewBox, sets every stroke and fill to `#999999`, strips extra attributes and rebuilds `stroke="none"` groups. The result is `iconly/icons.json`, with `{name: svgString}` at 16×16.
5. **Create the components in Figma:** paste `scripts/figma/create-icons.js` into a `use_figma` call, putting `icons.json` content into `ICONS` (about 40 per call to stay under 50k characters). Each icon becomes an `Icon/<name>` component set with **Size=10 / 12 / 16 / 20**:

| Size | Stroke | Use |
|---|---|---|
| 10 | **0.75** | Badges, chevrons inside dense controls |
| 12 | **0.75** | Nav items, small buttons, icon buttons, toolbars |
| 16 | 1.33 (2 on 24 scaled) | Default UI icon, inputs, cards, rail items |
| 20 | 1.5 | Empty states, large affordances |

   **Rule: icons below 16px use a 0.75 stroke.**

6. **Bind colour:** every vector stroke points at `color/icon/default`. Instances override it with other `color/icon/*` tokens, never raw hex.
7. **Replacing existing icons:** if components were built before Iconly, replace the *children* of the existing icon components so the IDs and instances survive. Use `scripts/figma/reapply-overrides.js` to keep instance colour overrides. Then run `scripts/figma/swap-icon-sizes.js` on every page.
8. **Audit:** `scripts/figma/audit-icons.js` on each library and app page should report 0 stray vectors (logos excepted).

## Matching size and weight to the source

Compare the Iconly 16px variant with the original icon in a nav item and a button using side-by-side screenshots. If Iconly looks heavier or lighter, change the stroke scale for that size **for all icons**, not per icon. The optical weight must be the same across the set.
