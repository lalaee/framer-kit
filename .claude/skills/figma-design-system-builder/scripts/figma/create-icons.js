// Paste into a use_figma call. Creates Icon/<name> component sets (Size=10/12/16/20) from normalized Iconly SVGs.
// CONFIG ------------------------------------------------------------------
const ICONS_PAGE_ID = 'PAGE_ID';            // the Icons page
const LIBRARY_FRAME_ID = 'FRAME_ID';        // "Icon Library" auto-layout frame (wrap) on that page
const ICON_COLOR_VAR = 'VariableID:x:y';    // color/icon/default
const ICONS = { /* name: '<svg ...16x16...>' from iconly/icons.json, about 40 per call */ };
const SIZES = [[10, 0.75], [12, 0.75], [16, 4 / 3], [20, 1.5]]; // [size, strokeWeight]; below 16px = 0.75
// -------------------------------------------------------------------------
const page = await figma.getNodeByIdAsync(ICONS_PAGE_ID); await figma.setCurrentPageAsync(page);
const lib = await figma.getNodeByIdAsync(LIBRARY_FRAME_ID);
const iconVar = await figma.variables.getVariableByIdAsync(ICON_COLOR_VAR);
const stroke = () => figma.variables.setBoundVariableForPaint({ type: 'SOLID', color: { r: .6, g: .6, b: .6 } }, 'color', iconVar);
const created = {};
for (const [name, svg] of Object.entries(ICONS)) {
  const frame = figma.createNodeFromSvg(svg);
  const variants = [];
  for (const [s, w] of SIZES) {
    const c = figma.createComponent(); c.name = 'Size=' + s; c.resize(16, 16); c.fills = []; c.clipsContent = false;
    const tmp = frame.clone(); for (const ch of [...tmp.children]) c.appendChild(ch); tmp.remove();
    if (s !== 16) c.rescale(s / 16);
    for (const v of c.findAll(n => 'strokes' in n)) {
      if (v.strokes.length) { v.strokes = [stroke()]; v.strokeWeight = w; }
      if (v.fills && v.fills.length && v.type !== 'FRAME') v.fills = [stroke()];
      v.constraints = { horizontal: 'SCALE', vertical: 'SCALE' };
    }
    page.appendChild(c); variants.push(c);
  }
  frame.remove();
  const set = figma.combineAsVariants(variants, lib);
  set.name = 'Icon/' + name; set.layoutMode = 'HORIZONTAL'; set.itemSpacing = 8; set.counterAxisAlignItems = 'CENTER';
  set.paddingLeft = set.paddingRight = set.paddingTop = set.paddingBottom = 8;
  set.primaryAxisSizingMode = 'AUTO'; set.counterAxisSizingMode = 'AUTO';
  set.description = `Iconly Light. Sizes 10/12 use a 0.75 stroke, 16 uses 1.33, 20 uses 1.5.`;
  created[name] = { set: set.id, ...Object.fromEntries(set.children.map(v => [v.name, v.id])) };
}
return created;
