"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowUp, Check, FileText, Mail, MessageSquare, Presentation, Search, Send, Sparkles, Users } from "lucide-react";
import { WinDots, WinRail } from "./win";

// The product film: five steps of one working day, each with a frame of the product.
// It plays on its own once it scrolls into view, and any step can be clicked.
const STEPS = [
  { id: "ask", n: "01", title: "Ask", line: "Ask in your own words", blurb: "One question across every system your firm already uses, answered with your own approved material." },
  { id: "answer", n: "02", title: "Answer", line: "An answer you can check", blurb: "Every statement carries the file, page and paragraph it came from, so a reviewer can go straight to the source." },
  { id: "mail", n: "03", title: "Draft", line: "Your replies, written for you", blurb: "GrayMatter reads the thread, pulls the facts from your documents and leaves a reply ready to send." },
  { id: "team", n: "04", title: "Together", line: "Your team in the same thread", blurb: "Bring colleagues into a conversation with GrayMatter. Everyone sees the same context, the same sources, the same decision." },
  { id: "make", n: "05", title: "Deliver", line: "Any format the work needs", blurb: "Turn the answer into the deck, memo or spreadsheet your firm actually sends, in your own house format." },
];
const DWELL = 7000;

const SOURCES = ["Google Drive", "Outlook", "SharePoint", "Tally", "WhatsApp", "Slack", "Dropbox", "Zoho"];
const PROMPTS = [
  "Summarise what changed in the Mehta family trust this quarter",
  "Which clients are outside their signed risk profile?",
  "Draft the reply to Northline about the board pack",
];

function Typing({ active }: { active: boolean }) {
  const [text, setText] = useState("");
  const [line, setLine] = useState(0);
  useEffect(() => {
    if (!active) return;
    const full = PROMPTS[line % PROMPTS.length];
    let i = 0, hold = 0, raf = 0, last = performance.now(), acc = 0;
    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      acc += now - last; last = now;
      if (i < full.length) { if (acc > 32) { acc = 0; i++; setText(full.slice(0, i)); } return; }
      hold += 16;
      if (hold > 2200) { cancelAnimationFrame(raf); setLine(l => l + 1); }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [active, line]);
  return <span>{text}<i className="caret" /></span>;
}

function FrameAsk({ active }: { active: boolean }) {
  return (
    <div className="pf pf-ask">
      <p className="pf-greet">Good morning, Priya. <span>What are we working on?</span></p>
      <div className="ask-bar">
        <Search size={17} />
        <p><Typing active={active} /></p>
        <button type="button" aria-label="Ask GrayMatter"><ArrowUp size={15} /></button>
      </div>
      <div className="ask-chips">{SOURCES.map(s => <span key={s}>{s}</span>)}</div>
      <p className="pf-note">Answers stay inside your firm&apos;s permissions. People see only what they could already open.</p>
    </div>
  );
}

function FrameAnswer() {
  return (
    <div className="pf pf-answer">
      <div className="pf-msg me"><i>PS</i><div className="pf-bubble">What changed in the Mehta family trust this quarter?</div></div>
      <div className="pf-msg ai"><i><Sparkles size={13} /></i><div className="pf-bubble">
      <p>The trust moved <b>15% of equity into small caps</b> in Q2, against a house model weight of 30%.<sup>1</sup> The gap was raised at the March review and left open pending the client&apos;s revised risk profile.<sup>2</sup></p>
      <div className="pf-cites">
        <div><span>1</span><div><b>House model portfolio v6.pdf</b><small>Page 9 · Market-cap allocation</small></div></div>
        <div><span>2</span><div><b>Mehta review notes · March</b><small>Page 2 · Actions carried forward</small></div></div>
      </div>
      <p className="pf-meta">4 sources · 8 citations · answered from your firm&apos;s files</p>
      </div></div>
    </div>
  );
}

function FrameMail({ active }: { active: boolean }) {
  const [open, setOpen] = useState(false);
  useEffect(() => { setOpen(false); if (!active) return; const t = setTimeout(() => setOpen(true), 1500); return () => clearTimeout(t); }, [active]);
  return (
    <div className="pf pf-mail">
      <p className="pf-kicker">A few things drafted for you</p>
      <div className="mail-card">
        <div className="mail-side"><MessageSquare size={14} /> Slack message draft<i /><i /><i /></div>
        <div><b>Update for #audit-team</b><small>Priya asked about the Northline timeline yesterday. Drafted a note from your latest working papers.</small></div>
      </div>
      <div className={"mail-card on" + (open ? " lifted" : "")}>
        <div className="mail-side"><Mail size={14} /> Email draft<i /><i /><i /></div>
        <div><b>Reply to Rakesh about the board pack</b><small>Rakesh asked for Thursday&apos;s figures. Drafted a response from the Q2 model.</small></div>
      </div>
      <div className={"mail-compose" + (open ? " open" : "")}>
        <div className="mc-bar"><span>New message</span><button type="button" className="mc-send"><Send size={13} /> Send email</button></div>
        <div className="mc-row"><span>To:</span> rakesh@northline.in</div>
        <div className="mc-row"><span>Subject:</span> Re: Board pack figures</div>
        <div className="mc-body">
          <p>Hi Rakesh,</p>
          <p>Thursday&apos;s figures are attached, taken from the Q2 model we signed off on 12 September.</p>
          <ul><li>Revenue ₹4.18 Cr, 6% ahead of plan</li><li>Collections at 71 days, down from 78</li></ul>
        </div>
      </div>
    </div>
  );
}

function FrameTeam() {
  return (
    <div className="pf pf-team">
      <div className="team-thread">
        <div className="tm tm-you"><span>MK</span><p>@Arjun can you check the audit timeline before I send this?</p></div>
        <div className="tm"><span>AR</span><p>@GrayMatter pull the agreed dates from the engagement letter and this morning&apos;s call notes.</p></div>
        <div className="tm tm-ai">
          <span><Sparkles size={13} /></span>
          <div>
            <p>Fieldwork runs 6 to 17 October, with the draft report on 24 October. The call moved the partner review to 21 October, so the client deadline still holds.</p>
            <div className="tm-src"><FileText size={12} /> Engagement letter · clause 4 &nbsp;·&nbsp; <FileText size={12} /> Call notes · 16 Sep</div>
          </div>
        </div>
      </div>
      <div className="team-foot"><Users size={14} /> Three people and GrayMatter in one thread, working from the same sources.</div>
    </div>
  );
}

function FrameMake() {
  return (
    <div className="pf pf-make">
      <div className="make-ask"><Sparkles size={14} /> &ldquo;Build the client review deck from this quarter&apos;s numbers.&rdquo;</div>
      <div className="make-out">
        <div className="deck">
          <div className="slide"><b>Mehta Family Trust</b><small>Quarterly review · Q2 FY27</small><i /><i className="short" /></div>
          <div className="slide s2"><b>Allocation vs model</b><span className="bars"><i style={{ height: "60%" }} /><i style={{ height: "80%" }} /><i style={{ height: "35%" }} /><i style={{ height: "52%" }} /></span></div>
          <div className="slide s3"><b>Actions</b><i /><i /><i className="short" /></div>
        </div>
        <ul className="make-list">
          <li><Presentation size={14} /> 12-slide review deck</li>
          <li><FileText size={14} /> Two-page covering memo</li>
          <li><Check size={14} /> Every figure traced to its source</li>
        </ul>
      </div>
    </div>
  );
}

export default function Product() {
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);
  const host = useRef<HTMLDivElement>(null);

  // play only while the section is on screen, and never fight a person who picked a step
  useEffect(() => {
    const el = host.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setPlaying(e.isIntersecting), { threshold: .25 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  useEffect(() => {
    if (!playing || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = setTimeout(() => setStep(s => (s + 1) % STEPS.length), DWELL);
    return () => clearTimeout(t);
  }, [playing, step]);

  const frames = [<FrameAsk key="a" active={step === 0} />, <FrameAnswer key="b" />, <FrameMail key="c" active={step === 2} />, <FrameTeam key="d" />, <FrameMake key="e" />];
  return (
    <section id="product" className="section wrap product" ref={host}>
      <div className="split-heading">
        <div><p className="eyebrow">HOW GRAYMATTER WORKS</p><h2>One day of work,<br /><em>start to finish.</em></h2></div>
        <p className="section-intro">Ask, check, draft, agree and deliver. The same knowledge carries through every step, with the sources attached.</p>
      </div>
      <div className="product-grid">
        <ol className="product-steps">
          {STEPS.map((s, i) => (
            <li key={s.id} data-state={i === step ? "on" : i < step ? "done" : "next"}>
              <button type="button" onClick={() => { setStep(i); }} aria-current={i === step}>
                <span className="ps-n">{s.n}</span>
                <span className="ps-body">
                  <b>{s.line}</b>
                  <small><span>{s.blurb}</span></small>
                </span>
              </button>
              <i className="ps-bar" style={{ animationDuration: DWELL + "ms", animationPlayState: i === step && playing ? "running" : "paused" }} />
            </li>
          ))}
        </ol>
        <div className="product-stage" key={step}>
        <div className="app-win">
          <WinRail />
          <div className="aw-main">
            <div className="aw-bar">
              <WinDots />
              <b>GrayMatter</b><small>· Sharma &amp; Co workspace</small>
              <span className="aw-new">New chat</span>
            </div>
            {frames[step]}
          </div>
        </div>
      </div>
      </div>
    </section>
  );
}
