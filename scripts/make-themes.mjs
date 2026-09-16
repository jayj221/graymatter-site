// Build colour variants of the site for review: node scripts/make-themes.mjs
// Each variant is a full recolour of app/globals.css, written to public/themes/<id>.css with
// every selector scoped to html[data-theme="<id>"]. Relative lightness is preserved, so whatever
// was readable in the base design stays readable; document and app mockups keep their own colours.
import fs from "node:fs";
import path from "node:path";

const SRC = "app/globals.css";
const OUT = "public/themes";

// mock documents and app windows are left exactly as they are: they imitate real software
// the pilot band is already a light panel: flipping it on a light variant would make it a dark slab
const LIGHT_KEEP = new Set(["pilot", "timeline", "targets", "target-label"]);
// GrayMatter's own app window is ours: its greys stay as designed, but its accents follow the palette
const ACCENT_ONLY = new Set(["app-win", "aw-rail", "aw-main", "aw-bar", "aw-dots", "aw-new", "aw-logo", "pf", "pf-ask", "pf-answer", "pf-greet", "pf-msg", "pf-bubble", "pf-cites", "pf-head", "pf-tag", "pf-meta", "pf-kicker", "pf-note", "ask-bar", "ask-chips", "caret", "mail-card", "mail-side", "mail-compose", "mc-bar", "mc-send", "mc-row", "mc-body", "team-thread", "tm", "tm-you", "tm-ai", "tm-src", "team-foot", "make-ask", "make-out", "make-list", "deck", "slide", "gm-app", "gm-body", "gm-q", "gm-found", "gm-file", "gm-actions", "gm-meta", "gm-where", "gm-access", "gm-guard", "gm-bar", "gm-bar-right", "gm-search"]);
const KEEP = new Set(["draft-paper", "citation", "doc-paper", "doc-col", "sheet", "sheet-bar", "xl", "xrefs", "alloc", "hl", "legal", "wealth", "tabs-row", "mtag", "dock", "dock-tip", "dock-wrap", "inbox", "cal", "cal-col", "cal-day", "cal-label", "cal-gutter", "cal-line", "ev", "ev-coral", "ev-green", "ev-indigo", "toast", "gmail", "gmail-top", "gmail-tabs", "gmail-list", "gmail-search", "gmail-avatar", "gmail-logo", "gcal", "gcal-top", "gcal-logo", "gcal-view", "gcal-sync", "app-chrome", "ac-dots", "ac-url", "gl-star", "gl-av", "gl-body", "gl-row", "gl-time", "gm-burger", "gm-search"]);

// hue in degrees, sat 0..1 for the page's greys; accent is the brand colour of that variant
const THEMES = [
  { id: "graphite", name: "Graphite + Coral (current)", mode: "dark", hue: 236, tint: .10, accent: "#ff6a4d", note: "Today's palette" },
  { id: "ink", name: "Ink + Amber", mode: "dark", hue: 30, tint: .08, accent: "#f5a524", note: "Warm near-black, amber accent" },
  { id: "forest", name: "Deep Green + Lime", mode: "dark", hue: 160, tint: .16, accent: "#8ee06b", note: "Green-black, fresh accent" },
  { id: "midnight", name: "Midnight Blue + Sky", mode: "dark", hue: 220, tint: .24, accent: "#5aa9ff", note: "Classic enterprise blue" },
  { id: "plum", name: "Plum + Pink", mode: "dark", hue: 290, tint: .18, accent: "#ff7ab8", note: "Purple-black, pink accent" },
  { id: "bone", name: "Bone + Coral", mode: "light", hue: 34, tint: .10, accent: "#ff6a4d", note: "Warm white, our coral" },
  { id: "paper", name: "Cool Paper + Indigo", mode: "light", hue: 232, tint: .07, accent: "#5b53e8", note: "Glean-like: light grey, indigo" },
  { id: "sand", name: "Sand + Teal", mode: "light", hue: 42, tint: .13, accent: "#1f8f83", note: "Beige page, deep teal accent" },
  { id: "mist", name: "Mist + Violet", mode: "light", hue: 250, tint: .09, accent: "#6d4aff", note: "Pale lilac grey, violet accent" },
  { id: "teal", name: "Light Grey + Teal", mode: "light", hue: 205, tint: .035, accent: "#12857a", second: "#ff6a4d", note: "Teal interface, the brain and its nerve keep our coral" },
];

/* ---------- colour helpers ---------- */
const hex = (r, g, b, a = "") => "#" + [r, g, b].map(v => Math.max(0, Math.min(255, Math.round(v * 255))).toString(16).padStart(2, "0")).join("") + a;
function parse(h) {
  let t = h.slice(1);
  if (t.length === 3 || t.length === 4) t = [...t].map(c => c + c).join("");
  const a = t.length === 8 ? t.slice(6, 8) : "";
  return [parseInt(t.slice(0, 2), 16) / 255, parseInt(t.slice(2, 4), 16) / 255, parseInt(t.slice(4, 6), 16) / 255, a];
}
function toHsl(r, g, b) {
  const mx = Math.max(r, g, b), mn = Math.min(r, g, b), l = (mx + mn) / 2;
  if (mx === mn) return [0, 0, l];
  const d = mx - mn, s = l > .5 ? d / (2 - mx - mn) : d / (mx + mn);
  const h = mx === r ? ((g - b) / d + (g < b ? 6 : 0)) : mx === g ? (b - r) / d + 2 : (r - g) / d + 4;
  return [h * 60, s, l];
}
function toRgb(h, s, l) {
  h = ((h % 360) + 360) % 360 / 360;
  if (!s) return [l, l, l];
  const q = l < .5 ? l * (1 + s) : l + s - l * s, p = 2 * l - q;
  const f = t => { t = (t + 1) % 1; return t < 1 / 6 ? p + (q - p) * 6 * t : t < .5 ? q : t < 2 / 3 ? p + (q - p) * (2 / 3 - t) * 6 : p; };
  return [f(h + 1 / 3), f(h), f(h - 1 / 3)];
}
const isAccent = (hue, sat) => sat > .45 && (hue < 42 || hue > 335);

function accentHsl(theme, useSecond) {
  const [h, s, l] = toHsl(...parse(useSecond && theme.second ? theme.second : theme.accent).slice(0, 3));
  return theme.mode === "light" ? [h, Math.max(s, .5), Math.min(l, .4)] : [h, s, l];
}
const relLum = ([r, g, b]) => { const f = v => (v <= .03928 ? v / 12.92 : Math.pow((v + .055) / 1.055, 2.4)); return .2126 * f(r) + .7152 * f(g) + .0722 * f(b); };
const ratio = (a, b) => (Math.max(a, b) + .05) / (Math.min(a, b) + .05);
export function onAccent(theme) {   // whichever of ink or white reads better on the button colour this variant actually paints
  const [r, g, b] = parse(recolour("#ff6a4d", theme, false));
  const L = relLum([r, g, b]);
  return ratio(L, relLum([.08, .09, .11])) >= ratio(L, 1) ? "#15161c" : "#ffffff";
}
// the accent as *text*: walk its lightness until it clears 4.5:1 against that variant's page
function pageLum(theme) { return relLum(toRgb(theme.hue, .06, theme.mode === "light" ? .94 : .07)); }
function accentText(theme) {
  const [h, s0] = accentHsl(theme), s = Math.max(s0, .55), page = pageLum(theme);
  let L = theme.mode === "light" ? .42 : .6;
  for (let i = 0; i < 40; i++) {
    if (ratio(relLum(toRgb(h, s, L)), page) >= 5.9) break;
    L += theme.mode === "light" ? -.015 : .015;
  }
  return [h, s, L];
}
function recolour(value, theme, isText, noFlip, useSecond) {
  const [r, g, b, a] = parse(value);
  const [h, s, l] = toHsl(r, g, b);
  const acc = useSecond && theme.second ? accentHsl(theme, true) : isText ? accentText(theme) : accentHsl(theme);
  // a saturated colour that is not our coral is carrying meaning (a metric, an event type, a file
  // kind), so it stays as it is; as text on a light page it is darkened enough to read
  if (s > .45 && !isAccent(h, s)) {
    if (!isText || theme.mode === "dark") return value;
    const [nr, ng, nb] = toRgb(h, Math.max(s, .5), .29);
    return hex(nr, ng, nb, a);
  }
  if (isAccent(h, s)) {                                   // brand coral and its shades follow the variant's accent
    if (isText) { const [nr, ng, nb] = toRgb(acc[0], acc[1], acc[2]); return hex(nr, ng, nb, a); }
    const rel = l / .65;
    const L = theme.mode === "light" ? Math.min(acc[2] * rel, .62) : Math.min(acc[2] * rel, .9);
    const [nr, ng, nb] = toRgb(acc[0], Math.min(1, acc[1] * (s / .75)), L);
    return hex(nr, ng, nb, a);
  }
  let L = l;
  if (theme.mode === "light" && !noFlip) {                           // flip the page, keep the ordering of the ramp
    L = 1 - l;
    if (L > .93) L = .93 + (L - .93) * .5;
    if (L < .08) L = .08 + (.08 - L) * .5;
    if (a && l > .9) return hex(.08, .08, .11, a);        // white veils become soft dark ones
  }
  // a pale grey that ends up as text on a light page would be too faint: bring it down
  if (isText && !a && theme.mode === "light" && L > .34) L = .29;   // a pale grey would be too faint as text on a light page
  const [nr, ng, nb] = toRgb(theme.hue, Math.min(.4, theme.tint * (1 - Math.abs(L - .5))), L);
  return hex(nr, ng, nb, a);
}

/* ---------- rewrite the stylesheet ---------- */
const css = fs.readFileSync(SRC, "utf8");
const COLOUR = /#[0-9a-fA-F]{8}\b|#[0-9a-fA-F]{6}\b|#[0-9a-fA-F]{3,4}\b/g;
const blocks = /([^{}]+)\{([^{}]*)\}/g;

function build(theme) {
  let out = `/* ${theme.name} */\n`;
  let m;
  blocks.lastIndex = 0;
  while ((m = blocks.exec(css))) {
    const rawSel = m[1], body = m[2];
    const sel = rawSel.trim().split("\n").pop().trim();
    if (!sel || sel.startsWith("@") || !COLOUR.test(body)) { COLOUR.lastIndex = 0; continue; }
    COLOUR.lastIndex = 0;
    // every class in the selector counts: ".wd-card.gmail" is the Gmail window, not site chrome
    const classes = (sel.split(",")[0].trim().match(/\.[a-zA-Z0-9_-]+/g) || []).map(c => c.slice(1));
    // Mock software keeps its own colours. The rule is re-emitted unchanged under the theme's own
    // scope, so a recoloured base rule (.wd-card) can never outweigh it (.wd-card.gmail).
    if (classes.some(c => KEEP.has(c))) {
      const decls = body.split(";").filter(d => /#[0-9a-fA-F]{3,8}/.test(d)).join(";");
      if (decls.trim()) {
        const scopedKeep = sel.split(",").map(part => `html[data-theme="${theme.id}"] ${part.trim()}`).join(",");
        out += `${scopedKeep}{${decls}}\n`;
      }
      continue;
    }
    // the pilot band is already a light panel: keep its lightness, but put it in this palette's own grey
    const noFlip = theme.mode === "light" && classes.some(c => LIGHT_KEEP.has(c));
    const second = classes.some(c => c.startsWith("nerve")) || sel.includes("data-nerve-end");   // the nerve keeps our coral
    const accentOnly = classes.some(c => ACCENT_ONLY.has(c));
    const scoped = sel.split(",").map(part => {
      const p = part.trim();
      if (p.startsWith("html") || p.startsWith(":root")) return `html[data-theme="${theme.id}"]`;
      if (p.startsWith("body")) return `html[data-theme="${theme.id}"] body${p.slice(4)}`;
      return `html[data-theme="${theme.id}"] ${p}`;
    }).join(",");
    // map each declaration knowing whether its colour is ink or a surface
    const recoloured = body.split(";").map(decl => {
      const prop = decl.split(":")[0].trim().toLowerCase();
      const isText = prop === "color" || prop === "-webkit-text-fill-color" || prop === "fill" || prop === "stroke" || prop === "caret-color";
      return decl.replace(COLOUR, v => {
        if (accentOnly) { const [r, g, b] = parse(v), [h, sa] = toHsl(r, g, b); if (!isAccent(h, sa)) return v; }
        return recolour(v, theme, isText, noFlip, second);
      });
    }).join(";");
    // keep only the declarations that carry colour, so the variant never changes layout
    const decls = recoloured.split(";").filter(d => /#[0-9a-fA-F]{3,8}/.test(d)).join(";");
    if (decls.trim()) out += `${scoped}{${decls}}\n`;
  }
  return out;
}

fs.mkdirSync(OUT, { recursive: true });
const ON_ACCENT = [".button", ".button:hover", ".skip", ".gray-fab", ".gray-ask button", ".ask-bar button", ".mc-send", ".gm-actions .chat", ".tm-ai>span", ".gmail-avatar", ".note .num", ".notes .num", ".success-icon"];
for (const t of THEMES) {
  const fg = onAccent(t);
  const at = accentText(t), chipBg = toRgb(at[0], Math.min(.5, at[1]), t.mode === "light" ? .93 : .16);
  const extra = `html[data-theme="${t.id}"]{--brain-accent:${t.second || t.accent}}\n`
    + ON_ACCENT.map(sel => `html[data-theme="${t.id}"] ${sel}{color:${fg}}`).join("\n")
    + `\nhtml[data-theme="${t.id}"] .button.outline{color:inherit;background:transparent}`
    // the mark is drawn for dark backgrounds: on a light page, swap in the ink version
    + (t.mode === "light" ? `\nhtml[data-theme="${t.id}"] .brand img,html[data-theme="${t.id}"] .prompt img{content:url(/graymatter-mark-ink.svg)}\nhtml[data-theme="${t.id}"] .gray-fab img{content:url(/graymatter-mark-ink.svg);filter:none}\nhtml[data-theme="${t.id}"] .cust-row img[src$="nomo.svg"]{content:url(/customers/nomo-ink.svg)}` : "")
    // label chips and the numbered markers: paired so the text always clears its own chip
    + `\nhtml[data-theme="${t.id}"] .tag,html[data-theme="${t.id}"] .note .tag[class]{background:${hex(...chipBg)};color:${hex(...toRgb(at[0], at[1], at[2]))}}`
    + `\nhtml[data-theme="${t.id}"] .note .num{background:${hex(...toRgb(t.hue, .08, t.mode === "light" ? .86 : .26))};color:${hex(...toRgb(t.hue, .1, t.mode === "light" ? .22 : .9))}}`
    + `\nhtml[data-theme="${t.id}"] .note.on .num{background:${recolour("#ff6a4d", t, false)};color:${fg}}`
    + `\nhtml[data-theme="${t.id}"] .t-review,html[data-theme="${t.id}"] .t-template,html[data-theme="${t.id}"] .t-verified,html[data-theme="${t.id}"] .t-gap,html[data-theme="${t.id}"] .t-exception,html[data-theme="${t.id}"] .t-mismatch,html[data-theme="${t.id}"] .t-suitability,html[data-theme="${t.id}"] .t-withintime{background:${hex(...chipBg)}!important;color:${hex(...toRgb(at[0], at[1], at[2]))}!important}`;
  fs.writeFileSync(path.join(OUT, t.id + ".css"), build(t) + extra + "\n");
}
fs.writeFileSync(path.join(OUT, "themes.json"), JSON.stringify(THEMES.map(({ id, name, mode, accent, note }) => ({ id, name, mode, accent, note })), null, 2));
console.log("wrote", THEMES.length, "variants to", OUT);
