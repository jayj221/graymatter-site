"use client";

import { useEffect, useRef, useState } from "react";

// A nerve that grows out of the brain stem as the brain bursts, sweeps into the left margin,
// runs down the page lighting each section you reach, and ends by plugging into the GrayMatter
// logo in the footer. Drawn as a bundle of fine strands with a soft glow.
// Rendering is kept cheap for Safari: no SVG masks or blur filters on the page-tall graphic
// (WebKit re-rasterises those every frame); the reveal is plain stroke dashes, and attributes
// are only written when their value changes.
const SECTIONS = ["#platform", ".security-band", "#industries", "#pilot", "#connected", "#pricing", ".faq-section", "#contact"];

type Pt = { x: number; y: number };
type Layout = { h: number; start: number; end: number; d: string; branches: string[]; nodes: Pt[]; tip: Pt; sweep: number; lineY: number; landY: number; joint: Pt; fallback: { end: Pt; top: Pt } };

// Rough resting position of the brain-stem opening, only used until brain-scene.tsx publishes the live one (window.__gmStem)
const STEM_UV = { u: .647, v: 1.02 }, STEM_TOP_UV = { u: .638, v: .9 }, SIZE = 3.3, BRAIN_X = 1.25, CAM_Z = 5.3;
// the bundle's strands: a fixed lane beside the centre line plus a gentle twist (amplitude, wavelength, phase), width, opacity.
// Lanes keep the bundle an even width all the way down; big twists made it bulge and pinch.
const STRANDS = [
  { base: -1.8, amp: .5, wave: 90, ph: 0, w: .8, o: .42 }, { base: -.7, amp: .6, wave: 130, ph: 2.1, w: .6, o: .36 },
  { base: .4, amp: .5, wave: 70, ph: 4.2, w: .7, o: .45 }, { base: 1.5, amp: .6, wave: 170, ph: 1.2, w: .5, o: .32 }, { base: 2.5, amp: .4, wave: 110, ph: 5.3, w: .45, o: .26 },
];

export default function Nerve() {
  const [layout, setLayout] = useState<Layout | null>(null);
  const pulse = useRef<SVGGElement>(null);
  const nodeRefs = useRef<(SVGGElement | null)[]>([]);
  const pathRef = useRef<SVGPathElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const mainLit = useRef<SVGGElement>(null);
  // the root: the short live piece from the stem opening to the fixed path, redrawn as the brain moves
  const rootGuide = useRef<SVGPathElement>(null);
  const rootLit = useRef<SVGGElement>(null);
  const rootFade = useRef<(SVGLinearGradientElement | null)[]>([]);
  const sparks = useRef<(SVGGElement | null)[]>([]);

  useEffect(() => {
    const measure = () => {
      const wrap = document.querySelector<HTMLElement>(".header.wrap");
      const hero = document.querySelector<HTMLElement>(".hero");
      const logo = document.querySelector<HTMLElement>("footer .brand img");
      if (innerWidth < 900 || !wrap || !hero || !logo) { setLayout(null); return; }
      const gutter = wrap.getBoundingClientRect().left;
      if (gutter < 36) { setLayout(null); return; }
      const abs = (el: Element) => { const r = el.getBoundingClientRect(); return { x: r.left, y: r.top + scrollY, w: r.width, h: r.height }; };

      // where the brain stem sits on the page (the brain scrolls with the hero, so this is fixed in page space)
      const ppu = innerHeight / (2 * CAM_Z * Math.tan(20 * Math.PI / 180));
      const uvToPage = (uv: { u: number; v: number }) => ({ x: innerWidth / 2 + (BRAIN_X + (uv.u - .5) * SIZE) * ppu, y: innerHeight / 2 + (uv.v - .5) * SIZE * ppu });
      const fallback = { end: uvToPage(STEM_UV), top: uvToPage(STEM_TOP_UV) };
      const live = (window as unknown as { __gmStem?: { ready: boolean; end: Pt; top: Pt } }).__gmStem;
      const stemEnd = live?.ready ? { ...live.end } : fallback.end;
      const x = Math.round(gutter / 2);
      const heroBox = abs(hero);
      const labels = document.querySelector(".hero-bottom"), stripEl = document.querySelector(".industry-strip");
      const heroBottom = heroBox.y + heroBox.h;
      const strip = stripEl ? abs(stripEl) : { x: 0, y: heroBottom, w: 0, h: 0 };
      const stripMid = strip.y + strip.h / 2, stripBottom = strip.y + strip.h;
      // Where the sweep runs so it never crosses text. Normally under the hero's bottom labels, above the industry strip.
      // On tall screens where the whole stem tube hangs below the strip, it runs under the strip instead.
      const below = stemEnd.y > stripBottom - 4;
      const eyebrow = document.querySelector("#platform .eyebrow");
      const sweep = !below
        ? (labels ? (abs(labels).y + abs(labels).h + strip.y) / 2 : strip.y - 14)
        : Math.min(Math.max(stripBottom + 36, stemEnd.y + 18), eyebrow ? abs(eyebrow).y - 26 : Infinity);
      const lineY = below ? sweep + 30 : stripMid;          // where the drawn line begins (hidden behind the strip when above it)
      const landY = below ? sweep + 100 : stripBottom + 70; // where the signal hands over to the line
      // the fixed path starts at this joint under the brain; the live root joins the stem opening to it
      const joint = { x: stemEnd.x - 150, y: sweep };
      const lane = sweep + 90;                           // where the nerve settles into the margin
      const L = abs(logo);
      const tip = { x: L.x - 8, y: L.y + L.h / 2 };

      const wave = (y: number) => x + Math.sin((y - lane) / 210) * 5;
      const pts: string[] = [];
      for (let y = lane; y <= tip.y - 120; y += 40) pts.push(`${wave(y).toFixed(1)},${y}`);
      const lastY = Math.floor((tip.y - 120 - lane) / 40) * 40 + lane;
      const d = [
        // from the joint, sweeping left under the hero labels into the margin
        `M${joint.x.toFixed(1)},${sweep.toFixed(1)}`,
        `L${(x + 60).toFixed(1)},${(sweep + 2).toFixed(1)}`,
        `C${(x + 18).toFixed(1)},${(sweep + 3).toFixed(1)} ${x},${(sweep + 30).toFixed(1)} ${x},${lane}`,
        "L" + pts.join(" L"),
        // bend into the logo
        `C${wave(lastY).toFixed(1)},${(tip.y - 30).toFixed(1)} ${(tip.x - 40).toFixed(1)},${tip.y.toFixed(1)} ${tip.x.toFixed(1)},${tip.y.toFixed(1)}`,
      ].join(" ");

      const nodes = SECTIONS.map(s => document.querySelector(s)).filter(Boolean)
        .map(el => abs(el!).y + 118).filter(y => y > lane + 40 && y < tip.y - 160)
        .map(y => ({ x: wave(y) + 22, y: y - 18 }));
      const branches = nodes.map(n => {
        const sx = wave(n.y + 18);
        return `M${sx.toFixed(1)},${n.y + 18} C${(sx + 10).toFixed(1)},${n.y + 16} ${(n.x - 8).toFixed(1)},${n.y + 4} ${n.x.toFixed(1)},${n.y}`;
      });
      setLayout({ h: document.documentElement.scrollHeight, joint, fallback, start: sweep, end: tip.y, d, branches, nodes, tip, sweep, lineY, landY });
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(document.body);
    addEventListener("resize", measure);
    addEventListener("gm-stem-ready", measure);   // re-place the joint once the brain reports where its stem really is
    return () => { ro.disconnect(); removeEventListener("resize", measure); removeEventListener("gm-stem-ready", measure); delete document.documentElement.dataset.nerveEnd; };
  }, []);

  useEffect(() => {
    if (!layout) return;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const path = pathRef.current!;
    const total = path.getTotalLength();
    // sample the path once: length along it, its point, and a "reading depth" that grows with down AND sideways travel
    const samples: { len: number; x: number; y: number; depth: number }[] = [];
    let depth = layout.start, prev = path.getPointAtLength(0);
    for (let l = 0; l <= total; l += 4) {
      const pt = path.getPointAtLength(l);
      depth += Math.max(0, pt.y - prev.y) + (pt.y < layout.sweep + 40 ? Math.abs(pt.x - prev.x) * .18 : 0);
      samples.push({ len: l, x: pt.x, y: pt.y, depth }); prev = pt;
    }
    const maxDepth = samples[samples.length - 1].depth;

    // a nerve is a bundle: several fine translucent strands that twist around one centre line,
    // fanning out where they reach the logo, with glowing beads along them
    const svgNS = "http://www.w3.org/2000/svg";
    const lit = mainLit.current!;
    lit.querySelectorAll(".gen").forEach(el => el.remove());
    // strands are rebuilt each time the lit range changes, from points kept every 10px of centre line
    // (dashing long polylines is inaccurate in WebKit, so strands never use stroke-dasharray)
    const strandMaps: { el: SVGPathElement; xs: Float32Array; ys: Float32Array }[] = [];
    {
      const pts: { x: number; y: number; nx: number; ny: number; l: number }[] = [];
      for (let l = 0; l <= total; l += 10) {
        const a = path.getPointAtLength(Math.max(0, l - 2)), b = path.getPointAtLength(Math.min(total, l + 2)), c = path.getPointAtLength(l);
        const dx = b.x - a.x, dy = b.y - a.y, m = Math.hypot(dx, dy) || 1;
        pts.push({ x: c.x, y: c.y, nx: -dy / m, ny: dx / m, l });
      }
      let seed = 11;
      const rnd = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
      const fan = (l: number) => 1 + 3 * Math.exp(-(total - l) / 120);   // the root does the fanning at the stem
      const core = lit.querySelector(".nerve-core");
      STRANDS.forEach(st => {
        const el = document.createElementNS(svgNS, "path");
        const xs = new Float32Array(pts.length), ys = new Float32Array(pts.length);
        pts.forEach((p, i) => { const off = (st.base + st.amp * Math.sin(p.l / st.wave + st.ph)) * fan(p.l); xs[i] = p.x + p.nx * off; ys[i] = p.y + p.ny * off; });
        strandMaps.push({ el, xs, ys });
        el.setAttribute("class", "fibre gen"); el.setAttribute("stroke-width", String(st.w)); el.setAttribute("stroke-opacity", String(st.o));
        lit.insertBefore(el, core);
      });
      for (let k = 0; k < Math.floor(total / 140); k++) {
        const p = pts[Math.floor(rnd() * pts.length)], off = (rnd() - .5) * 4 * fan(p.l), r = .8 + rnd() * 1.4;
        const g = document.createElementNS(svgNS, "g");
        g.setAttribute("class", "bead gen"); g.setAttribute("data-l", String(p.l)); g.setAttribute("display", "none");
        g.setAttribute("style", `animation-delay:${(rnd() * 4).toFixed(2)}s`);
        g.setAttribute("transform", `translate(${(p.x + p.nx * off).toFixed(1)} ${(p.y + p.ny * off).toFixed(1)})`);
        g.innerHTML = `<circle r="${(r * 5).toFixed(1)}" fill="url(#nerve-glow)"/><circle r="${r.toFixed(1)}" fill="#ffd9c9"/>`;
        lit.appendChild(g);
      }
    }
    // every stroke in the lit bundle, with its own length, so one reveal range maps onto each of them
    const mainStrokes = Array.from(lit.querySelectorAll<SVGPathElement>("path:not(.gen)"));
    const strandD = (xs: Float32Array, ys: Float32Array, from: number, to: number) => {
      if (to - from < .5) return "M0,0";
      const n = xs.length - 1, pt = (l: number) => {
        const k = Math.max(0, Math.min(n, l / 10)), i = Math.floor(k), j = Math.min(n, i + 1), t = k - i;
        return `${(xs[i] + (xs[j] - xs[i]) * t).toFixed(1)},${(ys[i] + (ys[j] - ys[i]) * t).toFixed(1)}`;
      };
      let d = "M" + pt(from);
      for (let i = Math.floor(from / 10) + 1; i * 10 < to && i <= n; i++) d += `L${xs[i].toFixed(1)},${ys[i].toFixed(1)}`;
      return d + "L" + pt(to);
    };
    const beads = Array.from(lit.querySelectorAll<SVGGElement>(".bead")).map(el => ({ el, l: Number(el.dataset.l) }));
    const rootStrokes = Array.from(rootLit.current!.querySelectorAll<SVGPathElement>("path"));
    // write an attribute only when it changes, so a still page does no repainting
    const last = new WeakMap<Element, Record<string, string>>();
    const set = (el: Element | null | undefined, name: string, value: string) => {
      if (!el) return;
      const seen = last.get(el) ?? {};
      if (seen[name] === value) return;
      seen[name] = value; last.set(el, seen);
      if (name === "opacity-style") (el as SVGElement).style.opacity = value; else el.setAttribute(name, value);
    };
    const dash = (from: number, to: number, len: number) => to - from < .5 ? "0 100000" : `0 ${from.toFixed(1)} ${(to - from).toFixed(1)} ${Math.ceil(len * 2 + 10)}`;
    // the path to just under the industry strip is never drawn as a line: a signal runs it as you scroll, then the line grows from there
    const lineIdx = Math.max(0, samples.findIndex(sm => sm.y >= layout.lineY && sm.x < samples[0].x - 200));
    // the line is anchored behind the strip (hidden by it), and the signal lands a little below it, so the line reads as one piece
    const lineDepth = samples[lineIdx].depth, lineLen = samples[lineIdx].len, COMET = 110, SIG_FROM = 20, SIG_TO = 280;
    const signalIdx = Math.max(lineIdx, samples.findIndex((sm, k) => k > lineIdx && sm.y >= layout.landY));
    const signalDepth = samples[signalIdx].depth, signalLen = samples[signalIdx].len;
    const atLen = (l: number) => samples[Math.max(0, Math.min(samples.length - 1, Math.round(l / 4)))];
    const { joint } = layout;
    const f = (n: number) => n.toFixed(1);
    // redraw the root from wherever the stem opening is right now to the joint; returns its length
    const drawRoot = () => {
      const live = (window as unknown as { __gmStem?: { ready: boolean; end: Pt; top: Pt } }).__gmStem;
      const { end, top } = live?.ready ? live : layout.fallback;
      const len = Math.hypot(end.x - top.x, end.y - top.y) || 1, dir = { x: (end.x - top.x) / len, y: (end.y - top.y) / len };
      // leave from the opening; if the industry strip covers it on a short screen, from the lowest visible point of the tube
      const t = end.y > layout.sweep - 6 ? Math.max(0, (layout.sweep - 6 - top.y) / (end.y - top.y)) : 1;
      const p0 = { x: top.x + (end.x - top.x) * t, y: top.y + (end.y - top.y) * t };
      const k = Math.max(8, Math.min(46, (layout.sweep - p0.y) * .9));
      const p1 = { x: p0.x + dir.x * k, y: p0.y + dir.y * k };
      const p2 = { x: joint.x + Math.max(30, Math.min(90, (p0.x - joint.x) * .5)), y: joint.y };
      const d = `M${f(p0.x)},${f(p0.y)} C${f(p1.x)},${f(p1.y)} ${f(p2.x)},${f(p2.y)} ${f(joint.x)},${f(joint.y)}`;
      set(rootGuide.current, "d", d);
      // aura and core share the centre line; strands start bunched inside the tube and meet the fixed bundle's strands at the joint
      const n0 = { x: -dir.y, y: dir.x };
      rootStrokes.forEach(el => {
        const i = Number(el.dataset.strand ?? -1);
        if (i < 0) { set(el, "d", d); return; }
        const st = STRANDS[i], sj = st.base + st.amp * Math.sin(st.ph), s0 = sj * 1.8;
        set(el, "d", `M${f(p0.x + n0.x * s0)},${f(p0.y + n0.y * s0)} C${f(p1.x + n0.x * s0)},${f(p1.y + n0.y * s0)} ${f(p2.x)},${f(p2.y - sj)} ${f(joint.x)},${f(joint.y - sj)}`);
      });
      // the strands fade in over the first few pixels, as if they come out of the glass
      rootFade.current.forEach(g => { set(g, "x1", f(p0.x)); set(g, "y1", f(p0.y)); set(g, "x2", f(p0.x + dir.x * 22)); set(g, "y2", f(p0.y + dir.y * 22)); });
      return rootGuide.current?.getTotalLength() ?? 0;
    };
    const at = (d: number) => { let k = 0; while (k < samples.length - 1 && samples[k + 1].depth <= d) k++; return samples[k]; };
    let raf = 0, sig = 0, cur = signalDepth, tail = lineDepth, prevT = performance.now(), time = 0;
    const tick = (now: number) => {
      const dt = Math.min((now - prevT) / 1000, .2); prevT = now; time += dt;
      const max = document.documentElement.scrollHeight - innerHeight;
      const endRamp = Math.max(0, Math.min(1, (scrollY - (max - innerHeight)) / innerHeight));
      // the signal is scrubbed by scroll: the first ~260px carry it from the brain stem to the margin, and back up in reverse
      const sigTarget = Math.max(0, Math.min(1, (scrollY - SIG_FROM) / (SIG_TO - SIG_FROM)));
      sig += (sigTarget - sig) * (reduced ? 1 : 1 - Math.exp(-dt * 12));
      if (Math.abs(sigTarget - sig) < .002) sig = sigTarget;
      // the tip starts exactly where the signal landed and moves with every pixel of scroll, easing onto the reading line over the first two screens
      const lead = Math.max(0, signalDepth - (SIG_TO + innerHeight * .55)) * Math.max(0, 1 - (scrollY - SIG_TO) / (innerHeight * 2.2));
      const reach = scrollY + innerHeight * (.55 + .43 * endRamp) + endRamp * (maxDepth - layout.end) + lead;
      const target = sig < 1 ? signalDepth : Math.max(signalDepth, Math.min(maxDepth, reach));
      cur += (target - cur) * (reduced ? 1 : 1 - Math.exp(-dt * 12));
      if (Math.abs(target - cur) < 1.5) cur = target; // easing never lands exactly; snap so the end is reached
      // the tail follows the reader: nerve scrolled past the top of the view retracts, so only the live part stays
      const tailTarget = Math.max(lineDepth, Math.min(cur, scrollY + innerHeight * .12));
      tail += (tailTarget - tail) * (reduced ? 1 : 1 - Math.exp(-dt * 12));
      let head: Pt, from: number, to: number, rootShown = 0;
      if (sig < 1) {
        // one signal over root + fixed path, measured in length so it never jumps where they meet
        const rootLen = drawRoot(), g = sig * (rootLen + signalLen);
        const rFrom = Math.max(0, g - COMET), rTo = Math.min(g, rootLen);
        rootShown = Math.max(0, rTo - rFrom);
        set(rootLit.current, "display", rootShown > .5 ? "inline" : "none");
        rootStrokes.forEach(el => { const s = el.getTotalLength() / (rootLen || 1); set(el, "stroke-dasharray", dash(rFrom * s, rTo * s, rootLen * s)); });
        to = Math.max(0, g - rootLen); from = Math.min(lineLen, Math.max(0, g - rootLen - COMET));
        head = g <= rootLen ? rootGuide.current!.getPointAtLength(g) : atLen(to);
      } else {
        rootStrokes.forEach(el => set(el, "stroke-dasharray", "0 100000"));
        set(rootLit.current, "display", "none");
        const h = at(cur); head = h; to = h.len; from = at(tail).len;
      }
      const shown = sig > 0 && rootShown + to - from > 1;
      const fq = Math.round(from), tq = Math.round(to);
      mainStrokes.forEach(el => set(el, "stroke-dasharray", dash(fq, tq, total)));
      strandMaps.forEach(({ el, xs, ys }) => set(el, "d", strandD(xs, ys, fq, tq)));
      beads.forEach(({ el, l }) => set(el, "display", tq - fq > .5 && l >= fq && l <= tq ? "inline" : "none"));
      set(svgRef.current, "opacity-style", shown ? "1" : "0");
      // a few sparks run down the lit stretch, the signal travelling through it
      const span = tq - fq;
      sparks.current.forEach((el, k) => {
        if (!shown || sig < 1 || span < 60 || reduced) { set(el, "opacity", "0"); return; }
        const pos = fq + (((time * 150 + k * 260) % 780) / 780) * span;
        const sp = atLen(pos);
        set(el, "transform", `translate(${sp.x.toFixed(1)} ${sp.y.toFixed(1)})`); set(el, "opacity", ".85");
      });
      const tailY = sig < 1 ? 1e9 : at(tail).y, clipTop = Math.min(tailY, head.y);
      set(lit.ownerSVGElement?.querySelector("#nerve-lit rect"), "y", String(Math.round(clipTop)));
      set(lit.ownerSVGElement?.querySelector("#nerve-lit rect"), "height", String(sig < 1 ? 0 : Math.max(0, Math.round(head.y - clipTop + 2))));
      set(pulse.current, "transform", `translate(${head.x.toFixed(1)} ${head.y.toFixed(1)})`);
      set(pulse.current, "opacity", shown && to < total - 4 ? "1" : "0");
      const readY = sig < 1 ? -1 : head.y;
      const active = layout.nodes.reduce((a, n, i) => (n.y <= readY + 1 ? i : a), -1);
      nodeRefs.current.forEach((n, i) => set(n, "data-state", i > active ? "ahead" : layout.nodes[i].y < tailY ? "gone" : i === active ? "active" : "passed"));
      const done = sig >= 1 && cur >= maxDepth - 20;
      if (done !== (document.documentElement.dataset.nerveEnd === "1")) { if (done) document.documentElement.dataset.nerveEnd = "1"; else delete document.documentElement.dataset.nerveEnd; }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [layout]);

  if (!layout) return null;
  return (
    <svg ref={svgRef} className="nerve" style={{ opacity: 0 }} width="100%" height={layout.h} aria-hidden="true">
      <defs>
        <clipPath id="nerve-lit"><rect x="0" y={layout.start} width="100%" height="0" /></clipPath>
        <radialGradient id="nerve-glow"><stop offset="0" stopColor="#ff9a7c" stopOpacity=".7" /><stop offset=".35" stopColor="#ff6a4d" stopOpacity=".22" /><stop offset="1" stopColor="#ff6a4d" stopOpacity="0" /></radialGradient>
        {/* the root's strokes fade in where they leave the glass stem (coordinates set every frame) */}
        {[["fibre", "#e9e2de"], ["aura", "#ff6a4d"], ["core", "#ffb39f"]].map(([name, color], i) => (
          <linearGradient key={name} ref={el => { rootFade.current[i] = el; }} id={`nerve-root-${name}`} gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={color} stopOpacity="0" /><stop offset="1" stopColor={color} />
          </linearGradient>
        ))}
      </defs>
      <path ref={pathRef} d={layout.d} fill="none" stroke="none" />
      <path ref={rootGuide} d={`M${layout.joint.x},${layout.joint.y}`} fill="none" stroke="none" />
      {/* the lit nerve: soft glow strokes, generated strands and beads, a warm core */}
      <g ref={mainLit} className="nerve-lit">
        <path d={layout.d} className="nerve-aura wide" />
        <path d={layout.d} className="nerve-aura" />
        <path d={layout.d} className="nerve-core" />
      </g>
      <g ref={rootLit} className="nerve-root">
        <path className="nerve-aura wide" data-strand="-1" />
        <path className="nerve-aura" data-strand="-1" />
        {STRANDS.map((st, i) => <path key={i} className="fibre" data-strand={i} strokeWidth={st.w} strokeOpacity={st.o} />)}
        <path className="nerve-core" data-strand="-1" />
      </g>
      <g clipPath="url(#nerve-lit)">
        {layout.branches.map((d, i) => <g key={i}><path d={d} className="nerve-aura thin" /><path d={d} className="fibre" strokeWidth=".7" strokeOpacity=".5" /><path d={d} className="nerve-core thin" /></g>)}
      </g>
      {layout.nodes.map((n, i) => (
        <g key={n.y} ref={el => { nodeRefs.current[i] = el; }} className="nerve-node" data-state="ahead" transform={`translate(${n.x.toFixed(1)} ${n.y})`}>
          <circle r="18" fill="url(#nerve-glow)" className="halo" />{[0, 40, 95, 150, 205, 260, 315].map(a => <line key={a} x1="0" y1="0" x2={(Math.cos(a * Math.PI / 180) * (a % 2 ? 9 : 6)).toFixed(1)} y2={(Math.sin(a * Math.PI / 180) * (a % 2 ? 9 : 6)).toFixed(1)} className="spike" />)}
          <circle r="2.6" className="bulb" /><circle r="1" className="bulb-shine" />
        </g>
      ))}
      {[0, 1, 2].map(k => (
        <g key={k} ref={el => { sparks.current[k] = el; }} className="nerve-spark" opacity="0">
          <circle r="7" fill="url(#nerve-glow)" /><circle r="1.1" fill="#fff3ee" />
        </g>
      ))}
      <g ref={pulse} className="nerve-pulse" opacity="0">
        <circle r="22" fill="url(#nerve-glow)" />
        <circle r="1.8" fill="#fff3ee" />
      </g>
    </svg>
  );
}
