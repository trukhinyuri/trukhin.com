// Shiki writes colours as inline style attributes, which the CSP (style-src 'self') blocks.
// This transformer turns every declaration into a class whose name encodes the value, e.g.
// "--shiki-light:#24292E" → "sl-24292e". tools/shiki-css.mjs reads the classes from dist and writes
// dist/shiki.css, so the stylesheet is derived from the build and is deterministic.
const PREFIX = {
  '--shiki-light': 'sl',
  '--shiki-dark': 'sd',
  '--shiki-light-bg': 'slb',
  '--shiki-dark-bg': 'sdb',
  '--shiki-light-font-style': 'slfs',
  '--shiki-dark-font-style': 'sdfs',
  '--shiki-light-font-weight': 'slfw',
  '--shiki-dark-font-weight': 'sdfw',
  '--shiki-light-text-decoration': 'sltd',
  '--shiki-dark-text-decoration': 'sdtd',
};
/** Layout declarations Shiki adds (wrap: false); the stylesheet sets them instead. */
const LAYOUT = new Set(['overflow-x', 'white-space', 'word-wrap', 'overflow-wrap']);
export const CLASS_TO_PROP = Object.fromEntries(Object.entries(PREFIX).map(([k, v]) => [v, k]));

const encode = (value) => {
  const v = value.trim().toLowerCase();
  if (/^#[0-9a-f]{3,8}$/.test(v)) return v.slice(1);
  if (/^[a-z-]+$/.test(v)) return v;
  throw new Error(`shiki style value not supported: ${value}`);
};

export function styleToClass() {
  const walk = (node) => {
    if (node.type === 'element') {
      const style = node.properties?.style;
      if (typeof style === 'string' && style.trim()) {
        const cls = [];
        for (const decl of style.split(';').map((d) => d.trim()).filter(Boolean)) {
          const i = decl.indexOf(':');
          const prop = decl.slice(0, i).trim();
          if (LAYOUT.has(prop)) continue; // layout lives in prose.css
          const p = PREFIX[prop];
          if (!p) throw new Error(`shiki style property not supported: ${prop}`);
          cls.push(`${p}-${encode(decl.slice(i + 1))}`);
        }
        const prev = node.properties.className ?? node.properties.class ?? [];
        const list = Array.isArray(prev) ? prev : String(prev).split(/\s+/).filter(Boolean);
        node.properties.className = [...list, ...cls];
        delete node.properties.class;
        delete node.properties.style;
      }
      if (node.tagName === 'pre') {
        node.properties.tabindex = '0';
        node.properties['aria-label'] = 'Code block';
      }
    }
    for (const c of node.children ?? []) walk(c);
  };
  return { name: 'trukhin:style-to-class', root: walk };
}
