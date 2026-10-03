# Phase 1: Extract

Goal: a written inventory of every value and repeated pattern in the source frames, measured from nodes.

## Steps

1. **List the frames.** Run `get_metadata` on each source page. Note each top-level frame's ID, name and size, and which theme it is in if there are light/dark pairs.
2. **Screenshot each frame** (`get_screenshot`, about 1400px max) so you know what you're looking at.
3. **Read node properties** with a read-only `use_figma` script per frame. Collect:
   - Solid fills and strokes. Count each unique colour and note where it's used (background, text, icon, border).
   - Text: font family, style (weight), size, line height, letter spacing, and how often each combination appears.
   - Auto-layout: padding, item spacing, sizing modes.
   - Corner radii, stroke weights, effects (shadows, blurs).
   - Icon sizes, and their **inset** inside nav items and buttons (padding around the icon).
4. **Cluster** the values into scales: neutral greys, accents, status colours, spacing steps, radius steps and type ramp. Merge near-duplicates (ΔE < 2, or ±1px) and record the mapping.
5. **Name the patterns** that repeat at least twice: buttons, icon buttons, inputs, selects, tabs, nav items, section headers, rows, cards, top bars, sidebars, tables, empty states, badges, avatars, toggles, checkboxes and so on. For each one note its variants and states, its parts, and the frame and node ID where it appears.
6. **Find the theme pairs.** A real light/dark pair of the same screen is the ground truth for Light-mode values. Never invert dark values to get light ones.

## Read script skeleton

```js
const f = await figma.getNodeByIdAsync('FRAME_ID');
const colors = {}, texts = {}, layouts = [];
const hex = c => '#' + [c.r, c.g, c.b].map(v => Math.round(v * 255).toString(16).padStart(2, '0')).join('');
f.findAll(() => true).forEach(n => {
  for (const key of ['fills', 'strokes']) if (Array.isArray(n[key])) n[key].forEach(p => {
    if (p.type === 'SOLID' && p.visible !== false) { const k = hex(p.color) + '@' + (p.opacity ?? 1).toFixed(2); (colors[k] ??= []).push(n.type + ':' + key); }
  });
  if (n.type === 'TEXT' && typeof n.fontSize === 'number') {
    const k = `${n.fontName.family}/${n.fontName.style}/${n.fontSize}/${JSON.stringify(n.lineHeight)}`; texts[k] = (texts[k] || 0) + 1;
  }
  if (n.layoutMode && n.layoutMode !== 'NONE') layouts.push([n.name, n.paddingLeft, n.paddingTop, n.itemSpacing, n.cornerRadius]);
});
return { colors: Object.fromEntries(Object.entries(colors).map(([k, v]) => [k, v.length])), texts, layouts: layouts.slice(0, 80) };
```

## Lessons

- Rendered Figma desktop UIs are bolder than they look in a screenshot. Labels and most UI text are **Semi Bold**, not Medium or Regular. Check the real style names.
- Nav icons are usually smaller (12px) than the body icon size (16px). Navs also have an **inset**: the selected or hover pill doesn't touch the sidebar edges. Every sidebar gets the same inset.
- Keep a short written inventory in your notes. It is the spec for phases 2 to 4.
