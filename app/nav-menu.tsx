"use client";

import { useEffect, useRef, useState } from "react";
import {
  ArrowRight, BookMarked, ChevronDown, FileSearch, Gauge, GitBranch, Layers, Lock, MessageSquareText,
  PenLine, Plug, Presentation, ShieldCheck, Sparkles, Users, Workflow,
} from "lucide-react";
import { APPS } from "./workday";

// the real marks of four systems a firm already runs, feeding the overview card
const FEEDS = ["Slack", "Google Drive", "Gmail", "SharePoint"].map(n => APPS.find(a => a.name === n)!);

// The product menu, in the shape Glean uses: the platform on the left, then the two halves of the
// product with every capability named, so a visitor can see the whole surface without scrolling.
const ASSISTANT = [
  { icon: <FileSearch size={15} />, name: "Firm search", note: "Find the knowledge, not the folder" },
  { icon: <MessageSquareText size={15} />, name: "Cited answers", note: "Every statement back to its file and page" },
  { icon: <PenLine size={15} />, name: "First drafts", note: "Your templates, your house format" },
  { icon: <Users size={15} />, name: "Work together", note: "A colleague and GrayMatter in one thread" },
  { icon: <Presentation size={15} />, name: "Decks and memos", note: "The format the work is actually sent in" },
  { icon: <Sparkles size={15} />, name: "Drafted for you", note: "Replies and summaries waiting each morning" },
];
const AGENTS = [
  { icon: <Workflow size={15} />, name: "Agent builder", note: "Describe the job, change it in words" },
  { icon: <GitBranch size={15} />, name: "Triggers", note: "On a file, an email, or a schedule" },
  { icon: <ShieldCheck size={15} />, name: "Approvals", note: "Nothing sends until a person signs" },
  { icon: <Gauge size={15} />, name: "Observability", note: "Runs, completions, hours returned" },
  { icon: <BookMarked size={15} />, name: "Agent library", note: "Ready agents per practice" },
];
const PLATFORM = [
  { icon: <Plug size={14} />, name: "Connectors", href: "/#connected" },
  { icon: <Lock size={14} />, name: "Permissions and audit", href: "/#security" },
  { icon: <Layers size={14} />, name: "Runs on your machines", href: "/#security" },
];

export default function NavMenu({ current }: { current?: "assistant" | "agents" }) {
  const [open, setOpen] = useState(false);
  // clicking the trigger pins the panel: it then stays put until a click away or Escape,
  // rather than closing the moment the pointer wanders off it
  const [pinned, setPinned] = useState(false);
  const wrap = useRef<HTMLDivElement>(null);
  // Closing on mouseleave alone loses the menu the moment the pointer cuts a corner
  // on its way to an item. Hold it briefly and cancel if the pointer comes back.
  const closeTimer = useRef<number | undefined>(undefined);
  const cancelClose = () => { clearTimeout(closeTimer.current); closeTimer.current = undefined; };
  const shut = () => { cancelClose(); setPinned(false); setOpen(false); };

  useEffect(() => () => clearTimeout(closeTimer.current), []);

  useEffect(() => {
    if (!open) return;
    const away = (e: MouseEvent) => { if (!wrap.current?.contains(e.target as Node)) shut(); };
    const esc = (e: KeyboardEvent) => { if (e.key === "Escape") shut(); };
    addEventListener("pointerdown", away); addEventListener("keydown", esc);
    return () => { removeEventListener("pointerdown", away); removeEventListener("keydown", esc); };
  }, [open]);

  return (
    <div className={"nm" + (open ? " open" : "")} ref={wrap}
      onMouseEnter={() => { cancelClose(); setOpen(true); }}
      onMouseLeave={() => {
        if (pinned) return;
        cancelClose();
        closeTimer.current = window.setTimeout(() => setOpen(false), 220);
      }}>
      <button type="button" className="nm-trigger" aria-expanded={open}
        onClick={() => { if (pinned) shut(); else { setPinned(true); setOpen(true); } }}>
        Product <ChevronDown size={14} />
      </button>

      <div className="nm-panel" role="menu" aria-hidden={!open}
        onClick={e => { if ((e.target as HTMLElement).closest("a")) shut(); }}>
        <div className="nm-platform">
          <a href="/#platform" className="nm-hero">
            <span className="nm-hero-art" aria-hidden="true">
              <span className="nm-feeds">{FEEDS.map(a => <i key={a.name}>{a.icon}</i>)}</span>
              <span className="nm-beam" />
              <span className="nm-core"><img src="/graymatter-mark.svg" alt="" /></span>
            </span>
            <b>Platform overview</b>
            <small>How GrayMatter works, end to end.</small>
          </a>
          <p className="nm-label">BUILT FOR DOCUMENT-LED FIRMS</p>
          <ul className="nm-plat-list">
            {PLATFORM.map((p, i) => (
              <li key={p.name} style={{ "--i": i + 6 } as React.CSSProperties}>
                <a href={p.href}><span className="nm-ico sm">{p.icon}</span>{p.name}</a>
              </li>
            ))}
          </ul>
          <a className="nm-cta" href="/#contact">
            <span><b>See it on your own files</b><small>An eight-week pilot on one recurring document.</small></span>
            <ArrowRight size={15} />
          </a>
        </div>

        <div className="nm-cols">
          <section className="ast">
            <a className={"nm-head" + (current === "assistant" ? " on" : "")} href="/">
              <span className="nm-badge"><MessageSquareText size={16} /></span>
              <span><b>GrayMatter Assistant</b><small>Answers and drafts from your own files</small></span>
            </a>
            <ul>{ASSISTANT.map((i, n) => (
              <li key={i.name} style={{ "--i": n } as React.CSSProperties}>
                <a href="/#product"><span className="nm-ico">{i.icon}</span><span><b>{i.name}</b><small>{i.note}</small></span></a>
              </li>
            ))}</ul>
          </section>

          <section className="agt">
            <a className={"nm-head" + (current === "agents" ? " on" : "")} href="/agents">
              <span className="nm-badge agents"><Workflow size={16} /></span>
              <span><b>GrayMatter Agents</b><small>Work that finishes itself, with approvals</small></span>
            </a>
            <ul>{AGENTS.map((i, n) => (
              <li key={i.name} style={{ "--i": n } as React.CSSProperties}>
                <a href="/agents#build"><span className="nm-ico">{i.icon}</span><span><b>{i.name}</b><small>{i.note}</small></span></a>
              </li>
            ))}</ul>
          </section>
        </div>
      </div>
    </div>
  );
}
