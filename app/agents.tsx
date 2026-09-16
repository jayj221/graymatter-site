"use client";

import { useEffect, useRef, useState } from "react";
import { APPS } from "./workday";
import Gray from "./gray";
import { WinDots, WinRail } from "./win";
import {
  ArrowUpRight, BadgeCheck, Bell, Check, ChevronRight, Clock3, FileText, Gauge,
  GitBranch, Mail, Menu, Play, Repeat, ShieldCheck, Sparkles, ThumbsUp, X,
} from "lucide-react";

/* ---------------- shared: run a step sequence while the block is on screen ---------------- */
function useSteps(count: number, ms: number) {
  const ref = useRef<HTMLDivElement>(null);
  const [step, setStep] = useState(0);
  const [live, setLive] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) { setStep(count); return; }
    const io = new IntersectionObserver(([e]) => setLive(e.isIntersecting), { threshold: .25 });
    io.observe(el);
    return () => io.disconnect();
  }, [count]);
  useEffect(() => {
    if (!live) return;
    const t = setInterval(() => setStep(s => (s + 1) % (count + 3)), ms);
    return () => clearInterval(t);
  }, [live, count, ms]);
  return [ref, Math.min(step, count)] as const;
}

const app = (name: string) => APPS.find(a => a.name === name)?.icon;

/* ---------------- 01 · the builder: a flow assembles itself ---------------- */
const FLOW = [
  { k: "trigger", tag: "WHEN", title: "A client sends the quarter's statements", sub: "Outlook · attachment lands in the Mehta folder", icon: <Mail size={15} />, logo: "Outlook" },
  { k: "read", tag: "READ", title: "Pull the model portfolio and the signed risk profile", sub: "Google Drive · SharePoint · 3 files, permissions checked", icon: <FileText size={15} />, logo: "Google Drive" },
  { k: "think", tag: "COMPARE", title: "Find every gap against the house model", sub: "22 holdings compared, each difference explained", icon: <GitBranch size={15} />, logo: "Excel" },
  { k: "draft", tag: "DRAFT", title: "Write the quarterly review in your format", sub: "Word · your template, with sources beside each statement", icon: <Sparkles size={15} />, logo: "Word" },
  { k: "check", tag: "CHECK", title: "Hold for the relationship manager", sub: "Nothing is sent until a person approves", icon: <ShieldCheck size={15} />, logo: "Teams" },
];

function Builder() {
  const [ref, step] = useSteps(FLOW.length, 1400);
  return (
    <div className="ag-builder" ref={ref}>
      <div className="app-win ag-win">
        <WinRail />
        <div className="aw-main">
          <div className="aw-bar">
            <WinDots />
            <b>Agent builder</b><small>· Quarterly client review</small>
            <span className="aw-new">Test run</span>
          </div>
          <div className="ag-canvas">
            {FLOW.map((f, i) => (
              <div key={f.k} className={"ag-node" + (i < step ? " in" : "") + (i === step - 1 ? " now" : "")}>
                <span className="ag-line" aria-hidden="true" />
                <span className="ag-ico">{f.icon}</span>
                <div className="ag-body">
                  <span className="ag-tag">{f.tag}</span>
                  <b>{f.title}</b>
                  <small>{f.sub}</small>
                </div>
                <span className="ag-logo" aria-hidden="true">{app(f.logo)}</span>
              </div>
            ))}
            <p className="ag-foot"><Check size={13} /> Built by describing it. No code, no integration project.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------------- 02 · a run, as it happens ---------------- */
const RUN = [
  { t: "09:04:11", m: "Triggered by new attachment: Mehta statements Q2.pdf", c: "trigger" },
  { t: "09:04:12", m: "Opened 3 files you already had access to", c: "" },
  { t: "09:04:19", m: "Compared 22 holdings against house model v6", c: "" },
  { t: "09:04:26", m: "Found 4 gaps. Largest: small cap 15% against 30%", c: "flag" },
  { t: "09:04:33", m: "Drafted the review in your template, 6 citations attached", c: "" },
  { t: "09:04:34", m: "Sent to A. Iyer for approval. Nothing leaves until she signs", c: "hold" },
];

function Run() {
  const [ref, step] = useSteps(RUN.length, 900);
  return (
    <div className="ag-run" ref={ref}>
      <div className="ag-run-head">
        <span className="ag-live"><i />RUNNING</span>
        <b>Quarterly client review · Mehta Family Trust</b>
        <span className="ag-run-time"><Clock3 size={13} /> 23s</span>
      </div>
      <ol className="ag-log">
        {RUN.map((r, i) => (
          <li key={r.t} className={(i < step ? "in " : "") + r.c}>
            <span className="ag-t">{r.t}</span>
            <span className="ag-m">{r.m}</span>
          </li>
        ))}
      </ol>
      <div className={"ag-approve" + (step >= RUN.length ? " on" : "")}>
        <span className="ag-av">AI</span>
        <div><b>Waiting for A. Iyer</b><small>Quarterly review, 4 pages, 6 citations</small></div>
        <span className="ag-btns"><button type="button" className="ghost">Ask for changes</button><button type="button">Approve and send</button></span>
      </div>
    </div>
  );
}

/* ---------------- 03 · what a firm watches ---------------- */
const BARS = [72, 88, 61, 94, 80, 97, 86];
function Watch() {
  const [ref, step] = useSteps(1, 2600);
  return (
    <div className="ag-watch" ref={ref}>
      <div className="ag-stats">
        <div><b>1,248</b><span>runs this quarter</span></div>
        <div><b>98.6%</b><span>completed without a retry</span></div>
        <div className="hot"><b>310</b><span>reviewer hours saved</span></div>
      </div>
      <div className={"ag-chart" + (step ? " on" : "")}>
        {BARS.map((h, i) => <i key={i} style={{ ["--h" as string]: h + "%", transitionDelay: `${i * 70}ms` } as React.CSSProperties} />)}
      </div>
      <ul className="ag-watch-list">
        <li><ThumbsUp size={14} /> Reviewers marked 94% of drafts as usable first time</li>
        <li><Bell size={14} /> Two agents paused automatically when a source changed</li>
        <li><BadgeCheck size={14} /> Every run kept its own record: who asked, what it read, what it sent</li>
      </ul>
    </div>
  );
}

/* ---------------- 04 · the library ---------------- */
const LIBRARY = [
  { team: "Audit", name: "Working paper reviewer", runs: "Runs on every model upload", does: "Traces each figure to its cell, lists exceptions for the partner.", logo: "Excel" },
  { team: "Legal", name: "Notice drafter", runs: "Runs when a matter file is updated", does: "Drafts in your approved format, checks statutory dates, flags what a senior must confirm.", logo: "Word" },
  { team: "Wealth", name: "Quarterly review", runs: "Runs on the client's statement", does: "Compares holdings with the house model and drafts the review inside the signed risk profile.", logo: "Outlook" },
  { team: "Operations", name: "Inbox triage", runs: "Runs every morning", does: "Sorts what needs a partner, drafts the rest, files the noise.", logo: "Gmail" },
];

export default function Agents() {
  const [menu, setMenu] = useState(false);
  return (
    <main className="agents-page">
      <a className="skip" href="#build">Skip to content</a>
      <header className="header wrap">
        <a href="/" className="brand"><img src="/graymatter-mark.svg" alt="" />GrayMatter<span>AI</span></a>
        <nav className={menu ? "mobile-open" : ""} onClick={() => setMenu(false)}>
          <a href="/">Assistant</a>
          <a href="/agents" aria-current="page" className="on">Agents</a>
          <a href="/#industries">Who it&apos;s for</a>
          <a href="/#pricing">Packages</a>
        </nav>
        <button className="menu-button" aria-label={menu ? "Close navigation" : "Open navigation"} aria-expanded={menu} onClick={() => setMenu(!menu)}>{menu ? <X /> : <Menu />}</button>
        <a className="button small" href="/#contact">Let&apos;s talk <ArrowUpRight size={16} /></a>
      </header>

      <section className="ag-hero wrap">
        <div>
          <p className="eyebrow"><span /> GRAYMATTER AGENTS</p>
          <h1>The assistant answers.<br /><em>Agents finish the work.</em></h1>
          <p className="hero-description">Describe a job your team repeats every week. GrayMatter builds an agent that watches for it, reads the right files, drafts the output in your format and waits for a person to approve.</p>
          <div className="actions">
            <a className="button" href="/#contact">Put an agent to work <ArrowUpRight size={18} /></a>
            <a className="text-link" href="#build">See how one is built <ChevronRight size={16} /></a>
          </div>
          <ul className="ag-hero-points">
            <li><Repeat size={15} /> Runs on a trigger, a schedule or a request</li>
            <li><ShieldCheck size={15} /> Works only inside the permissions people already have</li>
            <li><Play size={15} /> Nothing is sent until someone approves it</li>
          </ul>
        </div>
        <Run />
      </section>

      <section className="customers ag-tools">
        <div className="wrap">
          <p className="eyebrow">AGENTS WORK IN THE TOOLS YOUR FIRM ALREADY RUNS</p>
          <ul className="ag-logos">{APPS.map(a => <li key={a.name} title={a.name}>{a.icon}</li>)}</ul>
        </div>
      </section>

      <section id="build" className="section wrap">
        <div className="split-heading">
          <div><p className="eyebrow">01 · BUILD</p><h2>Describe the job.<br /><em>Watch it take shape.</em></h2></div>
          <p className="section-intro">An agent is a few plain steps: when to start, what to read, what to produce and who signs it off. You change any step in words, not code.</p>
        </div>
        <Builder />
      </section>

      <section className="section wrap ag-control">
        <div className="split-heading">
          <div><p className="eyebrow">02 · CONTROL</p><h2>Scale without<br /><em>losing the reins.</em></h2></div>
          <p className="section-intro">Every agent carries the same rules your people do: what it may open, what it may send, and who has to approve before anything leaves the firm.</p>
        </div>
        <div className="ag-grid">
          <article><span className="ag-chip">PERMISSIONS</span><b>It can only see what the person could open</b><p>An agent run by an associate reads exactly what that associate reads. Nothing wider, ever.</p></article>
          <article><span className="ag-chip hot">APPROVALS</span><b>A person signs before it sends</b><p>Drafts wait in the approver&apos;s queue with the sources attached. One click sends, one click asks for changes.</p></article>
          <article><span className="ag-chip">AUDIT</span><b>Every run leaves a record</b><p>What triggered it, which files it opened, what it produced and who approved it, ready for a partner or a regulator.</p></article>
          <article><span className="ag-chip">LIMITS</span><b>It stops when it should</b><p>If a source changes, a figure does not reconcile or a rule is unclear, the agent pauses and asks rather than guessing.</p></article>
        </div>
      </section>

      <section className="section wrap">
        <div className="split-heading">
          <div><p className="eyebrow">03 · WATCH</p><h2>See what your<br /><em>agents are doing.</em></h2></div>
          <p className="section-intro">Adoption, completion, hours returned to reviewers, and the runs that needed a human. The numbers your partners will ask for in month two.</p>
        </div>
        <Watch />
      </section>

      <section className="section wrap ag-library-wrap">
        <div className="split-heading">
          <div><p className="eyebrow">04 · LIBRARY</p><h2>Start from an agent<br /><em>your practice already needs.</em></h2></div>
          <p className="section-intro">Each one is shaped around your own templates and sources during the pilot, then shared with the team that asked for it.</p>
        </div>
        <div className="ag-library">
          {LIBRARY.map(l => (
            <article key={l.name}>
              <header><span className="ag-lib-logo">{app(l.logo)}</span><span className="ag-team">{l.team}</span></header>
              <b>{l.name}</b>
              <p>{l.does}</p>
              <span className="ag-runs"><Gauge size={13} /> {l.runs}</span>
            </article>
          ))}
        </div>
        <div className="ag-cta">
          <div><b>Bring us the job your team repeats every week.</b><span>We build the first agent with you during the pilot, on your own documents.</span></div>
          <a className="button" href="/#contact">Start with one workflow <ArrowUpRight size={18} /></a>
        </div>
      </section>

      <footer className="wrap">
        <div className="footer-top">
          <a className="brand" href="/"><img src="/graymatter-mark.svg" alt="" />GrayMatter<span>AI</span></a>
          <p>Your knowledge. Put to work.</p>
          <a href="/">Back to the assistant ↑</a>
        </div>
        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} GrayMatter AI</span>
          <span>Private intelligence for document-led firms.</span>
          <a href="/#contact-privacy">Inquiry privacy</a>
        </div>
      </footer>
      <Gray />
      
    </main>
  );
}
