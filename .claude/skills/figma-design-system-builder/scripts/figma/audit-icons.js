// Paste into a use_figma call, once per page. Lists small vectors that are NOT part of an Icon/<name> instance,
// i.e. icons that didn't come from the Iconly library. Expected result: count 0 (logos excepted).
const PAGE_ID = 'PAGE_ID';
const LIBRARY_FRAME_ID = 'FRAME_ID';
const page = await figma.getNodeByIdAsync(PAGE_ID); await figma.setCurrentPageAsync(page);
const lib = await figma.getNodeByIdAsync(LIBRARY_FRAME_ID);
const iconIds = new Set();
for (const c of lib.children) { if (c.type === 'COMPONENT_SET') c.children.forEach(v => iconIds.add(v.id)); else iconIds.add(c.id); }
const stray = [];
for (const n of page.findAllWithCriteria({ types: ['VECTOR', 'BOOLEAN_OPERATION', 'STAR', 'POLYGON', 'LINE'] })) {
  if (n.width > 24 || n.height > 24) continue;
  let a = n.parent, ok = false;
  while (a && a.type !== 'PAGE') {
    if (a.type === 'INSTANCE') { try { if (iconIds.has(a.mainComponent?.id)) { ok = true; break; } } catch (e) {} }
    if (a.type === 'COMPONENT' && iconIds.has(a.id)) { ok = true; break; }
    a = a.parent;
  }
  if (!ok) { const path = []; let b = n; for (let i = 0; i < 4 && b && b.type !== 'PAGE'; i++) { path.unshift(b.name); b = b.parent; } stray.push(n.id + ' ' + path.join(' / ')); }
}
return { count: stray.length, stray: stray.slice(0, 50) };
