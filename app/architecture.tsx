"use client";

import { useEffect, useRef, useState } from "react";
import { APPS } from "./workday";
import { MODELS } from "./models";
import { Boxes, FileStack, KeyRound, MessageSquareText, ScrollText, Server, ShieldCheck, Workflow } from "lucide-react";

// How the whole thing is put together, top to bottom: what your people use, the models underneath,
// the firm's own knowledge, the controls around it, and the systems it all reads from.
const CONTEXT = [
  { icon: <FileStack size={13} />, name: "Approved documents" },
  { icon: <ScrollText size={13} />, name: "House templates" },
  { icon: <Boxes size={13} />, name: "Matters and clients" },
  { icon: <KeyRound size={13} />, name: "Who may see what" },
];

export default function Architecture() {
  const ref = useRef<HTMLElement>(null);
  const [on, setOn] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) { setOn(true); return; }
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setOn(true); io.disconnect(); } }, { threshold: .2 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <section id="architecture" className="section wrap arch" ref={ref}>
      <div className="split-heading">
        <div><p className="eyebrow">HOW IT IS PUT TOGETHER</p><h2>One platform.<br /><em>Four honest layers.</em></h2></div>
        <p className="section-intro">Nothing here is magic. Your people ask; a model reasons; the answer is grounded in your own files; and every layer is bounded by the permissions your firm already has.</p>
      </div>

      <div className={"arch-stack" + (on ? " on" : "")}>
        <div className="arch-top">
          <a className="arch-card" href="#product">
            <span className="arch-badge"><MessageSquareText size={17} /></span>
            <div><b>GrayMatter Assistant</b><small>Answers, drafts and decks from your own files</small></div>
          </a>
          <a className="arch-card agents" href="/agents">
            <span className="arch-badge"><Workflow size={17} /></span>
            <div><b>GrayMatter Agents</b><small>Work that runs on a trigger and waits for approval</small></div>
          </a>
        </div>

        <span className="arch-join" aria-hidden="true"><i /><i /><i /></span>

        <div className="arch-layer models">
          <div className="arch-layer-head">
            <b>The model layer</b>
            <small>Choose where the thinking happens</small>
          </div>
          <div className="arch-layer-body">
            <span className="arch-note"><Server size={13} /> Open models on your own servers</span>
            <span className="arch-note">or an enterprise contract where nothing trains</span>
            <span className="arch-models" aria-hidden="true">{MODELS.map(({ name, Mark }) => <i key={name} title={name}><Mark /></i>)}</span>
          </div>
        </div>

        <div className="arch-layer context">
          <div className="arch-layer-head">
            <b>Your firm&apos;s knowledge</b>
            <small>What the answers are actually made of</small>
          </div>
          <div className="arch-layer-body">
            <ul className="arch-chips">{CONTEXT.map(c => <li key={c.name}>{c.icon}{c.name}</li>)}</ul>
            <span className="arch-venn" aria-hidden="true">
              <i className="one">What you<br />can open</i>
              <i className="two">The firm&apos;s<br />memory</i>
            </span>
          </div>
        </div>

        <div className="arch-layer protect">
          <div className="arch-layer-head">
            <b>The line around it</b>
            <small>The part a partner will ask about</small>
          </div>
          <div className="arch-layer-body">
            <span className="arch-note ok"><ShieldCheck size={13} /> Permissions enforced on every answer</span>
            <span className="arch-note ok">Approvals before anything is sent</span>
            <span className="arch-note ok">A record of every question and draft</span>
          </div>
        </div>

        <span className="arch-join down" aria-hidden="true"><i /></span>

        <div className="arch-sources">
          <p className="arch-sources-label">READ FROM THE SYSTEMS YOU ALREADY RUN</p>
          <ul>{APPS.map(a => <li key={a.name} title={a.name}>{a.icon}</li>)}</ul>
        </div>
      </div>
    </section>
  );
}
