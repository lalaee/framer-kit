// Paste into a use_figma call, once per page. Points every icon instance at the size variant closest to its
// current width (10/12/16/20), so small icons pick up the 0.75 stroke.
const PAGE_ID = 'PAGE_ID';
const LIBRARY_FRAME_ID = 'FRAME_ID';
const page = await figma.getNodeByIdAsync(PAGE_ID); await figma.setCurrentPageAsync(page);
const lib = await figma.getNodeByIdAsync(LIBRARY_FRAME_ID);
const sets = new Set(lib.children.filter(c => c.type === 'COMPONENT_SET').map(c => c.id));
const SZ = [10, 12, 16, 20]; const near = w => SZ.reduce((a, b) => Math.abs(b - w) < Math.abs(a - w) ? b : a);
const todo = []; // collect first: swapping makes nested ids stale
for (const i of page.findAllWithCriteria({ types: ['INSTANCE'] })) {
  let mc; try { mc = i.mainComponent; } catch (e) { continue; }
  if (!mc || !mc.parent || !sets.has(mc.parent.id)) continue;
  const cur = parseInt(mc.name.split('=')[1]); const t = near(Math.round(i.width));
  if (t !== cur || Math.round(i.width) !== t) todo.push([i.id, t]);
}
let done = 0, fail = 0;
for (const [id, t] of todo) {
  const i = await figma.getNodeByIdAsync(id); if (!i) { fail++; continue; }
  try {
    const mc = i.mainComponent; const target = mc.parent.children.find(c => c.name === 'Size=' + t);
    if (target !== mc) i.swapComponent(target);
    if (Math.round(i.width) !== t) i.resize(t, t);
    done++;
  } catch (e) { fail++; }
}
return { found: todo.length, done, fail };
