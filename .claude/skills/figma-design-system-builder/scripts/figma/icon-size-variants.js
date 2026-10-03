// Paste into a use_figma call. Converts single 16px icon COMPONENTS inside the library frame into
// Icon/<name> sets with Size=10/12/16/20. The original component becomes Size=16, so existing instances survive.
const ICONS_PAGE_ID = 'PAGE_ID';
const LIBRARY_FRAME_ID = 'FRAME_ID';
const SKIP = ['Icon/logo-framer', 'Icon/dot'];         // non-icon glyphs
const SIZES = [[10, 0.75], [12, 0.75], [16, 4 / 3], [20, 1.5]];
const BATCH = 40;                                       // per call; run again until remaining = 0
const page = await figma.getNodeByIdAsync(ICONS_PAGE_ID); await figma.setCurrentPageAsync(page);
const lib = await figma.getNodeByIdAsync(LIBRARY_FRAME_ID);
const todo = lib.children.filter(c => c.type === 'COMPONENT' && !SKIP.includes(c.name)).slice(0, BATCH);
const out = {};
for (const base of todo) {
  const name = base.name.replace(/^Icon\//, ''); const idx = lib.children.indexOf(base);
  for (const v of base.findAll(n => 'constraints' in n)) v.constraints = { horizontal: 'SCALE', vertical: 'SCALE' };
  const variants = [];
  for (const [s, w] of SIZES) {
    const c = s === 16 ? base : base.clone();
    if (c !== base) { lib.appendChild(c); c.rescale(s / 16); }
    c.name = 'Size=' + s;
    for (const v of c.findAll(n => 'strokes' in n && n.strokes.length)) v.strokeWeight = w;
    variants.push(c);
  }
  const set = figma.combineAsVariants(variants, lib, idx); set.name = 'Icon/' + name;
  set.layoutMode = 'HORIZONTAL'; set.itemSpacing = 8; set.counterAxisAlignItems = 'CENTER';
  set.paddingLeft = set.paddingRight = set.paddingTop = set.paddingBottom = 8;
  set.primaryAxisSizingMode = 'AUTO'; set.counterAxisSizingMode = 'AUTO';
  out[name] = set.id;
}
return { converted: Object.keys(out).length, remaining: lib.children.filter(c => c.type === 'COMPONENT' && !SKIP.includes(c.name)).length, out };
