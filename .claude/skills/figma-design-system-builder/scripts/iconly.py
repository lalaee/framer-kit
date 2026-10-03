#!/usr/bin/env python3
"""Iconly helper: search, contact sheet, fetch and normalize SVGs for Figma.

Key: export ICONLY_API_KEY=...   (never commit it)
Usage:
  iconly.py search <name> [<name> ...]   -> iconly/candidates.json  (name -> [[id, iconName], ...])
  iconly.py sheet                        -> iconly/sheet.html       (candidates side by side)
  iconly.py build                        -> iconly/icons.json       (reads iconly/map.json {name: id})
Optional env: ICONLY_STYLE_ID (default 4 = Light), ICONLY_TYPE_ID (default 1), ICONLY_OUT (default ./iconly)
"""
import json, os, re, sys, time, urllib.request
import xml.etree.ElementTree as ET

URL = "https://mcp.iconly.pro/mcp"
OUT = os.environ.get("ICONLY_OUT", "iconly")
STYLE = int(os.environ.get("ICONLY_STYLE_ID", "4"))
TYPE = int(os.environ.get("ICONLY_TYPE_ID", "1"))
COLOR = "#999999"
_session = None


def _post(payload, session=None):
    key = os.environ.get("ICONLY_API_KEY")
    if not key:
        sys.exit("ICONLY_API_KEY is not set")
    headers = {"Authorization": f"Bearer {key}", "Content-Type": "application/json",
               "Accept": "application/json, text/event-stream",
               "User-Agent": "figma-design-system-builder/1.0"}
    if session:
        headers["mcp-session-id"] = session
    req = urllib.request.Request(URL, data=json.dumps(payload).encode(), headers=headers, method="POST")
    with urllib.request.urlopen(req, timeout=60) as r:
        body = r.read().decode()
        sid = r.headers.get("mcp-session-id")
    msgs = [json.loads(l[6:]) for l in body.splitlines() if l.startswith("data: ")]
    if not msgs and body.strip():
        msgs = [json.loads(body)]
    return (msgs[-1] if msgs else None), sid


def _init():
    global _session
    if _session:
        return _session
    _, sid = _post({"jsonrpc": "2.0", "id": 1, "method": "initialize", "params": {
        "protocolVersion": "2025-03-26", "capabilities": {},
        "clientInfo": {"name": "figma-design-system-builder", "version": "1.0"}}})
    _session = sid
    _post({"jsonrpc": "2.0", "method": "notifications/initialized"}, sid)
    return sid


def call(tool, args, retries=6):
    for attempt in range(retries):
        try:
            msg, _ = _post({"jsonrpc": "2.0", "id": 2, "method": "tools/call",
                            "params": {"name": tool, "arguments": args}}, _init())
            res = msg["result"]
            text = res["content"][0]["text"]
            if res.get("isError"):
                raise RuntimeError(text)
            return json.loads(text)
        except Exception as e:  # rate limits and transient errors
            wait = 10 * (attempt + 1)
            print(f"  {tool} retry in {wait}s: {str(e)[:80]}", file=sys.stderr)
            time.sleep(wait)
    raise RuntimeError(f"{tool} failed after {retries} attempts")


def search(names):
    os.makedirs(OUT, exist_ok=True)
    path = f"{OUT}/candidates.json"
    cands = json.load(open(path)) if os.path.exists(path) else {}
    for q in names:
        d = call("search_icons", {"q": q.replace("-", " "), "page_size": 10, "style_id": STYLE, "type_id": TYPE})
        cands[q] = [[i["id"], i["name"]] for i in d.get("icons", [])]
        print(q, "=>", cands[q])
        json.dump(cands, open(path, "w"), indent=1)
        time.sleep(1)


def fetch(icon_id):
    os.makedirs(f"{OUT}/svgs", exist_ok=True)
    p = f"{OUT}/svgs/{icon_id}.svg"
    if not os.path.exists(p):
        d = call("fetch_icon_svg", {"id": icon_id})
        open(p, "w").write(d["content"])
        time.sleep(2)
    return open(p).read()


def normalize(svg, size=16):
    """24-grid line icon -> stroke-width 2, single colour, Figma-friendly."""
    ET.register_namespace("", "http://www.w3.org/2000/svg")
    root = ET.fromstring(svg)
    ns = "{http://www.w3.org/2000/svg}"
    for el in root.iter():
        a = el.attrib
        for k in ("stroke-miterlimit", "clip-rule", "fill-rule", "class", "style", "id"):
            a.pop(k, None)
        tag = el.tag.replace(ns, "")
        if tag == "g" and a.get("stroke") == "none":
            del a["stroke"]  # groups that hide the stroke of line icons
        if a.get("stroke") not in (None, "none"):
            a["stroke"] = COLOR
            a["stroke-width"] = "2"
        if a.get("fill") not in (None, "none"):
            a["fill"] = COLOR
    vb = root.get("viewBox", "0 0 24 24")
    root.attrib.clear()
    root.attrib.update({"width": str(size), "height": str(size), "viewBox": vb, "fill": "none"})
    s = ET.tostring(root, encoding="unicode")
    s = re.sub(r"\s+", " ", s)
    return re.sub(r">\s+<", "><", s)


def sheet():
    cands = json.load(open(f"{OUT}/candidates.json"))
    rows = []
    for name, items in cands.items():
        cells = "".join(f'<div class=c>{normalize(fetch(i), 32)}<small>{i}<br>{n}</small></div>' for i, n in items)
        rows.append(f"<h3>{name}</h3><div class=r>{cells}</div>")
    html = ("<style>body{background:#111;color:#aaa;font:12px Inter,sans-serif}.r{display:flex;gap:12px;flex-wrap:wrap}"
            ".c{width:90px;text-align:center}small{display:block;margin-top:4px}</style>" + "".join(rows))
    open(f"{OUT}/sheet.html", "w").write(html)
    print(f"wrote {OUT}/sheet.html")


def build():
    m = json.load(open(f"{OUT}/map.json"))
    out = {name: normalize(fetch(i)) for name, i in m.items()}
    json.dump(out, open(f"{OUT}/icons.json", "w"))
    print(f"wrote {OUT}/icons.json ({len(out)} icons, {sum(map(len, out.values()))} chars)")


if __name__ == "__main__":
    cmd, *rest = sys.argv[1:] or ["help"]
    {"search": lambda: search(rest), "sheet": sheet, "build": build}.get(cmd, lambda: print(__doc__))()
