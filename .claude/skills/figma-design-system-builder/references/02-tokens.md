# Phase 2: Tokens

Build the variables before any component. Use four collections:

| Collection | Modes | Contents | Scopes |
|---|---|---|---|
| **Primitives** | one | Raw colour ramps: `gray/0…1000`, `blue/…`, `red/…`, `green/…`, `purple/…`, plus white and black with alpha steps | Hidden from pickers (`scopes = []`) |
| **Color** | Dark, Light | Meaning-based names that point at primitives: `color/background/{default, app, canvas, elevated, control, control-hover, selected, hover, subtle, accent, accent-hover, accent-subtle, danger-subtle, inverse, field, image, scrim…}`, `color/text/{primary, secondary, tertiary, muted, accent, danger, success, inverse, on-inverse…}`, `color/icon/{default, primary, tertiary, accent, danger, success}`, `color/border/{default, subtle, strong, control, focus, danger, field}` | Fills: `FRAME_FILL`, `SHAPE_FILL`. Text: `TEXT_FILL`. Borders: `STROKE_COLOR` |
| **Dimensions** | one | `space/0…48`, `radius/{xs, sm, md, lg, full}`, `size/{icon-sm, icon, control-h, nav-w, inspector-w…}`, `stroke/{hairline, default}` | `GAP`, `WIDTH_HEIGHT`, `CORNER_RADIUS`, `STROKE_FLOAT` |
| **Typography** | one | `font/family/{sans, mono}`, `font/weight/{medium, semibold, bold}` (as strings), `font/size/{10…68}`, `font/line-height/*`, `font/letter-spacing/*` | Matching `FONT_*` scopes |

## Rules

- Give every variable a WEB code syntax: `v.setVariableCodeSyntax('WEB', 'var(--fk-color-text-primary)')`.
- Semantic Color values **always point at primitives**, never raw hex (`figma.variables.createVariableAlias(primitive)`).
- Fill Light-mode values from the real light frames found in phase 1.
- Create **text styles** (`Heading/XL, L, M`, `Body/Default, Strong, Large`, `Label/Default, Large, Small`, `Caption/Default, Strong`, `Code/Default`, plus marketing or auth styles if the source has them). Link each style's fields to the Typography variables with `style.setBoundVariable('fontSize', v)` and so on.
- `Label/*` is Semi Bold. Most UI body text is Medium. Headings are Semi Bold.

## Foundations page

Show swatches for every semantic colour in both modes. Put two copies side by side and set `explicitVariableModes` on one. Add a type ramp of all text styles and spacing and radius specimens. Use auto-layout with titled sections.

## Binding helpers

```js
const V = id => figma.variables.getVariableByIdAsync(id);
const paint = async id => figma.variables.setBoundVariableForPaint({ type: 'SOLID', color: { r: 0, g: 0, b: 0 } }, 'color', await V(id));
node.fills = [await paint(COLOR_BG_DEFAULT)];
node.setBoundVariable('itemSpacing', await V(SPACE_8));
for (const k of ['topLeftRadius', 'topRightRadius', 'bottomLeftRadius', 'bottomRightRadius']) node.setBoundVariable(k, await V(RADIUS_MD));
await text.setTextStyleIdAsync(LABEL_DEFAULT_STYLE_ID);
```
