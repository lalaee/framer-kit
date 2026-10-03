// Paste at the top of a use_figma call that composes screens or inspector panels from the library.
// Fill in IDS from your ledger (node and variable IDs in YOUR file), then call the helpers.
// Every helper builds from library instances and tokens. Nothing is hard-coded except layout gaps.
const IDS = {
  page: 'PAGE_ID',
  styles: { label: 'S:…', body: 'S:…', strong: 'S:…', caption: 'S:…' },                 // Label/Default, Body/Default, Body/Strong, Caption/Default
  color: { primary: 'VariableID:…', secondary: 'VariableID:…', tertiary: 'VariableID:…', bg: 'VariableID:…',
           image: 'VariableID:…', control: 'VariableID:…', hover: 'VariableID:…', border: 'VariableID:…',
           subtle: 'VariableID:…', ctrlBorder: 'VariableID:…', iconTertiary: 'VariableID:…', focus: 'VariableID:…' },
  comp: {
    panelHeader: '…', inspectorRail: '…', divider: '…', propertyRow: '…', slider: '…', select: '…', tabGroup: '…',
    tabSelected: '…', tabDefault: '…', toggleOn: '…', toggleOff: '…', toggleRow: '…', colorField: '…', swatchPicker: '…',
    optionSelected: '…', optionDefault: '…', btnPrimary: '…', btnSecondary: '…', btnGhost: '…', iconBtnGhostSmall: '…',
  },
  icon: { undo: '…', image: '…', video: '…' /* any Icon/<name> Size=16 variant id; other sizes are found as siblings */ },
};
const page = await figma.getNodeByIdAsync(IDS.page); await figma.setCurrentPageAsync(page);
await figma.loadFontAsync({ family: 'Inter', style: 'Semi Bold' }); await figma.loadFontAsync({ family: 'Inter', style: 'Medium' });
const G = id => figma.getNodeByIdAsync(id);
const paint = async id => figma.variables.setBoundVariableForPaint({ type: 'SOLID', color: { r: 0, g: 0, b: 0 } }, 'color', await figma.variables.getVariableByIdAsync(id));
const C = IDS.color, ST = IDS.styles, K = IDS.comp;
const txt = async (chars, style, col) => { const t = figma.createText(); await t.setTextStyleIdAsync(style); t.characters = chars; t.fills = [await paint(col)]; return t; };
const pk = (inst, prefix) => Object.keys(inst.componentProperties).find(k => k === prefix || k.startsWith(prefix + '#'));
const setP = (inst, obj) => { const o = {}; for (const [k, v] of Object.entries(obj)) { const key = pk(inst, k); if (key) o[key] = v; } inst.setProperties(o); };
const fill = n => { n.layoutSizingHorizontal = 'FILL'; };
const vstack = (name, gap) => { const f = figma.createFrame(); f.name = name; f.layoutMode = 'VERTICAL'; f.itemSpacing = gap; f.fills = []; f.primaryAxisSizingMode = 'AUTO'; return f; };
const hstack = (name, gap) => { const f = figma.createFrame(); f.name = name; f.layoutMode = 'HORIZONTAL'; f.itemSpacing = gap; f.fills = []; f.counterAxisAlignItems = 'CENTER'; f.primaryAxisSizingMode = 'FIXED'; f.counterAxisSizingMode = 'AUTO'; return f; };
const iconVar = async (name, size) => { const base = await G(IDS.icon[name]); return base.parent.children.find(c => c.name === 'Size=' + size) || base; };

// A panel + vertical labelled rail ("dock"). Call finish(dock) after adding content.
async function dock(area, title, desc, x, y, panelWidth = 260) {
  const d = figma.createFrame(); d.name = 'Panel — ' + area; d.layoutMode = 'HORIZONTAL'; d.itemSpacing = 0;
  d.fills = [await paint(C.bg)]; d.strokes = [await paint(C.border)]; d.strokeWeight = 1; d.strokeAlign = 'OUTSIDE'; d.clipsContent = true;
  page.appendChild(d); d.x = x; d.y = y;
  const p = vstack('panel', 16); p.paddingLeft = p.paddingRight = 10; p.paddingTop = 14; p.paddingBottom = 20; d.appendChild(p);
  p.resize(panelWidth, 100); p.primaryAxisSizingMode = 'AUTO'; p.counterAxisSizingMode = 'FIXED'; p.fills = [await paint(C.bg)];
  const h = (await G(K.panelHeader)).createInstance(); p.appendChild(h); fill(h); setP(h, { Title: title, Description: desc });
  const r = (await G(K.inspectorRail)).createInstance(); d.appendChild(r);
  for (const it of r.children) it.setProperties({ State: it.name === area ? 'Selected' : 'Default' });
  d.primaryAxisSizingMode = 'AUTO'; d.counterAxisSizingMode = 'AUTO';
  return p; // content goes into the panel
}
async function finish(d, minHeight = 811) { const p = d.children[0], r = d.children[1]; d.counterAxisSizingMode = 'FIXED'; d.resize(d.width, Math.max(minHeight, p.height)); r.layoutSizingVertical = 'FILL'; p.layoutSizingVertical = 'FILL'; }
async function divider(p) { const i = (await G(K.divider)).createInstance(); p.appendChild(i); fill(i); }
async function section(p, title, opt = {}) { // opt: { divider:false, reset:true, toggle:true|false }
  if (opt.divider !== false) await divider(p);
  const s = vstack('section · ' + title, 8); p.appendChild(s); fill(s);
  const hr = hstack('header', 8); s.appendChild(hr); fill(hr); hr.counterAxisSizingMode = 'FIXED'; hr.resize(hr.width, 20);
  const t = await txt(title, ST.label, C.primary); t.name = 'title'; hr.appendChild(t); t.layoutSizingHorizontal = 'FILL';
  if (opt.reset) { const b = (await G(K.iconBtnGhostSmall)).createInstance(); b.name = 'reset'; hr.appendChild(b); setP(b, { Icon: (await iconVar('undo', 12)).id }); }
  if (opt.toggle !== undefined) { const tg = (await G(opt.toggle ? K.toggleOn : K.toggleOff)).createInstance(); tg.name = 'toggle'; hr.appendChild(tg); }
  return s;
}
async function prop(s, label, ctrlId, cfg) { const r = (await G(K.propertyRow)).createInstance(); s.appendChild(r); fill(r); setP(r, { Label: label, Control: ctrlId }); if (cfg) await cfg(r.children[1]); return r; }
const slider = (s, label, value, position) => prop(s, label, K.slider, c => { c.setProperties({ Position: String(position) }); setP(c, { Value: value }); }); // position 0..100 step 10
const select = (s, label, value, icon) => prop(s, label, K.select, async c => { const o = { Label: value }; if (icon) { o['Leading icon'] = true; o.Icon = (await iconVar(icon, 16)).id; } setP(c, o); });
const color = (s, label, hex, rgb, opacity = '100%') => prop(s, label, K.colorField, c => { setP(c, { Value: hex, Opacity: opacity }); c.findOne(n => n.name === 'swatch').fills = [{ type: 'SOLID', color: rgb }]; });
const tabs = (s, label, list, sel) => prop(s, label, K.tabGroup, c => { c.children.forEach((t, i) => { if (i < list.length) { t.visible = true; setP(t, { Label: list[i], State: i === sel ? 'Selected' : 'Default' }); } else t.visible = false; }); }); // up to 3 options
async function segmented(s, list, sel) { // full-width, 4+ options
  const seg = figma.createFrame(); seg.name = 'segmented'; seg.layoutMode = 'HORIZONTAL'; seg.fills = []; s.appendChild(seg); fill(seg); seg.counterAxisSizingMode = 'AUTO';
  for (let i = 0; i < list.length; i++) { const t = (await G(i === sel ? K.tabSelected : K.tabDefault)).createInstance(); seg.appendChild(t); setP(t, { Label: list[i] }); t.layoutSizingHorizontal = 'FILL'; t.paddingLeft = t.paddingRight = 4; t.primaryAxisAlignItems = 'CENTER'; }
  return seg;
}
async function toggleRow(s, label, on) { const r = (await G(K.toggleRow)).createInstance(); s.appendChild(r); fill(r); setP(r, { Label: label }); r.findOne(n => n.name === 'toggle').setProperties({ Checked: on ? 'True' : 'False' }); return r; }
async function hint(s, text) { const t = await txt(text, ST.body, C.tertiary); t.name = 'hint'; s.appendChild(t); fill(t); t.textAutoResize = 'HEIGHT'; return t; }
async function button(s, label, style = 'Secondary', icon) { const id = { Primary: K.btnPrimary, Secondary: K.btnSecondary, Ghost: K.btnGhost }[style]; const b = (await G(id)).createInstance(); s.appendChild(b); const o = { Label: label }; if (icon) { o['Leading icon'] = true; o.Icon = (await iconVar(icon, 12)).id; } setP(b, o); return b; }
async function valueRow(s, label, value, btn, btnStyle) { const r = hstack('value row · ' + label, 10); s.appendChild(r); fill(r); r.counterAxisSizingMode = 'FIXED'; r.resize(r.width, 30);
  const l = await txt(label, ST.body, C.secondary); r.appendChild(l); l.resize(64, l.height); l.textAutoResize = 'HEIGHT';
  const v = await txt(value, ST.body, C.primary); r.appendChild(v); v.layoutSizingHorizontal = 'FILL'; v.textTruncation = 'ENDING';
  if (btn) await button(r, btn, btnStyle); return r; }
async function noPreview(parent, w, h, iconName = 'image') { // the standard thumbnail when no real image exists
  const f = figma.createFrame(); f.name = 'thumbnail · no preview'; f.resize(w, h); f.cornerRadius = 6; f.fills = [await paint(C.image)];
  f.strokes = [await paint(C.subtle)]; f.strokeWeight = 1; f.strokeAlign = 'INSIDE';
  f.layoutMode = 'HORIZONTAL'; f.primaryAxisAlignItems = 'CENTER'; f.counterAxisAlignItems = 'CENTER'; f.primaryAxisSizingMode = 'FIXED'; f.counterAxisSizingMode = 'FIXED';
  parent.appendChild(f); const i = (await iconVar(iconName, h < 40 ? 12 : 16)).createInstance(); f.appendChild(i);
  for (const v of i.findAll(n => 'strokes' in n && n.strokes.length)) v.strokes = [await paint(C.iconTertiary)];
  return f;
}
// Example:
// const p = await dock('Scene', 'Scene', 'Everything around your recording.', 0, 1000);
// const s = await section(p, 'Background', { divider: false, toggle: true });
// await segmented(s, ['Image', 'Video', 'Colour', 'Gradient'], 0);
// await slider(s, 'Blur', '2 px', 30);
// await finish(p.parent);
