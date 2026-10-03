// Two-step helper for destructive edits to a main component (e.g. replacing icon vectors).
// STEP 1 (MODE='record'): returns a string of "nodeId|v:VariableID" / "nodeId|h:r,g,b" stroke-colour overrides on
//   instances of the given components. Save the returned string in your notes.
// STEP 2 (MODE='restore'): paste the string into RECORDED and run after the edit.
const MODE = 'record';                  // 'record' | 'restore'
const PAGE_ID = 'PAGE_ID';
const COMPONENT_IDS = ['COMPONENT_ID']; // main components (variants) being edited
const RECORDED = '';
const page = await figma.getNodeByIdAsync(PAGE_ID); await figma.setCurrentPageAsync(page);
if (MODE === 'record') {
  const ids = new Set(COMPONENT_IDS); const out = [];
  for (const i of page.findAllWithCriteria({ types: ['INSTANCE'] })) {
    let mc; try { mc = i.mainComponent; } catch (e) { continue; } if (!mc || !ids.has(mc.id)) continue;
    for (const v of i.findAll(n => 'strokes' in n && n.strokes.length)) {
      const p = v.strokes[0]; const b = p.boundVariables?.color?.id;
      out.push(i.id + '|' + (b ? 'v:' + b : 'h:' + [p.color.r, p.color.g, p.color.b].map(x => Math.round(x * 255)).join(',')));
    }
  }
  return [...new Set(out)].join(' ');
}
// restore: ids can be nested ("I12:3;45:6"), so parse with a regex instead of splitting on ';'
const re = /((?:I)?\d+:\d+(?:;\d+:\d+)*)\|(v:VariableID:\d+:\d+|h:\d+,\d+,\d+)/g;
let m, n = 0;
while ((m = re.exec(RECORDED))) {
  const inst = await figma.getNodeByIdAsync(m[1]); if (!inst) continue;
  let paint;
  if (m[2].startsWith('v:')) paint = figma.variables.setBoundVariableForPaint({ type: 'SOLID', color: { r: 0, g: 0, b: 0 } }, 'color', await figma.variables.getVariableByIdAsync(m[2].slice(2)));
  else { const [r, g, b] = m[2].slice(2).split(',').map(x => +x / 255); paint = { type: 'SOLID', color: { r, g, b } }; }
  for (const v of inst.findAll(x => 'strokes' in x && x.strokes.length)) v.strokes = [paint];
  n++;
}
return { restored: n };
