---
name: figma-design-system-builder
description: Read the frames of an existing Figma design, extract a full token system and a local component library into the same Figma file, then design new app screens natively from that library. Use when someone shares a Figma file or frames and asks to "build a component library", "make a design system from these frames", "extract tokens/components", or to "design/build <screen or app> using the library", including designing screens from a code repo's intent. Uses the Figma MCP (use_figma, get_screenshot, get_metadata) and the Iconly MCP for every icon.
---

# Figma design system builder

Turn existing frames into a token system and component library in **the same Figma file**, then design product screens from that library. The output is Figma nodes, not code, unless the user explicitly asks for code.

Load Figma's base skills first: `figma-use` (required before any `use_figma` call). `figma-generate-library` and `figma-generate-design` help too. This skill sits on top of them and adds the extraction workflow, the house rules and the scripts.

## The pipeline (strict order, each phase has a gate)

| # | Phase | Output | Gate before moving on |
|---|-------|--------|------------------------|
| 1 | **Extract**: read every frame | Inventory of values and repeated patterns | Every repeated pattern has a name and the values were measured from nodes |
| 2 | **Tokens** | Primitives, semantic Color (Dark/Light), Dimensions, Typography and text styles | No component exists yet. Every value maps to a variable |
| 3 | **Icons**: Iconly only | `Icon/<name>` sets with Size=10/12/16/20 | Visually matches the source icons' size and weight |
| 4 | **Components**: small to large | Variant sets with properties, all bound to variables | Each one is screenshot-checked against its source frame |
| 5 | **Templates** | Page shells with an empty content slot | Rebuilding a source frame from the templates matches it |
| 6 | **Apps**: designed from intent | Screens composed only from instances | Anything missing was added to the library first |

Read the reference for a phase before starting it:
- Phase 1: `references/01-extract.md`
- Phase 2: `references/02-tokens.md`
- Phase 3: `references/03-icons-iconly.md`
- Phase 4: `references/04-components.md`
- Phase 5: `references/05-templates.md`
- Phase 6: `references/06-build-apps.md`
- Always: `references/house-rules.md` and `references/gotchas.md`

## File layout to create

```
Page 1 / source pages  ← untouched originals
Foundations            ← token swatches, type ramp, spacing/radius specimens
Icons                  ← "Icon Library" frame of Icon/<name> sets
Components             ← one titled section per component set
Templates              ← page shells
Examples               ← source frames rebuilt from the library (proof)
<App> — <Screen>       ← one page per product screen family
```

## Non-negotiables

1. **Measure, don't guess.** Take values from node properties (`get_metadata`, `use_figma` reads), never from screenshots alone.
2. **Tokens before components, components before screens.** Never hard-code a colour, gap, radius or font on a component or screen.
3. **Every icon comes from Iconly** (`scripts/iconly.py`). It is sized and weighted to the source and stored as an `Icon/<name>` set. No hand-drawn icons and no other icon sets.
4. **Never reskin.** For an app screen, first work out what the screen is for (data, tasks, states, wording) from the code or brief, then design it fresh with the library.
5. **If a screen needs something the library lacks, add it to the library first**, then use the instance.
6. **Verify every build step** with `get_screenshot`, then fix before continuing. Check text weight, insets, icon size and stroke, and overflow.
7. **Work the Figma MCP safely**: one page switch per call, never run calls in parallel, return created node IDs from each call, and keep an ID ledger in your notes.

## Scripts

| Script | Use |
|---|---|
| `scripts/iconly.py` | Search, fetch and normalize Iconly SVGs (needs `ICONLY_API_KEY`) |
| `scripts/figma/create-icons.js` | Turn normalized SVGs into `Icon/<name>` component sets with size variants |
| `scripts/figma/icon-size-variants.js` | Add Size=10/12/16/20 variants to existing single icon components |
| `scripts/figma/swap-icon-sizes.js` | Point every icon instance on a page at its nearest size variant |
| `scripts/figma/audit-icons.js` | Find vectors that are not instances from the icon library |
| `scripts/figma/screen-helpers.js` | Helpers for composing screens: dock, section, property row, slider, tabs, toggle row and more |
| `scripts/figma/reapply-overrides.js` | Record and restore instance colour overrides around destructive main-component edits |

The `.js` files are pasted into `use_figma` calls. They are templates, so edit the IDs and config at the top of each one. `swap-icon-sizes`, `icon-size-variants`, `reapply-overrides`, `audit-icons` and `screen-helpers` were used as-is on the reference build. `create-icons` was written later from the same pattern, so screenshot its first output.

## Reference build

Figma file `AUsFLH0mRB4L5PxJY2zO2d` (Desktop-app-design) was built with this skill. It has the source frames on Page 1 and Page 2, then Foundations, Icons, Components, Templates and Examples pages, plus "Recordly — Projects" and "Recordly — Editor", which were designed from the Recorder-2 repo. Use it as the example of what each phase produces.

## Reporting back

After each phase, tell the user what was created: pages, counts, component names and node IDs where useful. Include a screenshot of the key result and anything you were unsure about. Ask only when a choice really belongs to the user, such as brand naming or a missing source pattern.
