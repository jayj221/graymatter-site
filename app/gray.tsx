"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowUp, X } from "lucide-react";

// Gray: the assistant in the corner of the site. It answers from a written script, so the
// header says "guided" rather than pretending to be live. Anything it can't answer goes to the form.
type Msg = { from: "gray" | "you"; text: string; cta?: boolean };

const OPENING = "Hi, I'm Gray. I can explain what GrayMatter does, how a pilot runs, or how your documents stay private. What would you like to know?";
const ANSWERS: { q: string; a: string; cta?: boolean }[] = [
  { q: "What does GrayMatter do?",
    a: "It turns the documents your firm already has into answers and first drafts. Ask a question in your own words, and you get an answer with the file, page and paragraph it came from, plus a draft in your own house format." },
  { q: "How does a pilot work?",
    a: "We pick one document your team repeats, agree what success looks like, and run for eight weeks. You get a baseline before and a measured result after, reviewed by the same people who review the work today.", cta: true },
  { q: "Is our client data private?",
    a: "Your material stays inside your firm's permissions: people see only what they could already open. Nothing is used to train outside models, and we agree deployment and controls with your IT team before anything is connected." },
  { q: "What does it connect to?",
    a: "Email, drives, chat and the systems your firm runs on: Google Workspace, Microsoft 365, SharePoint, Slack, WhatsApp Business, Tally, Zoho, Dropbox and more. We scope the connectors that matter for your workflow." },
  { q: "What does it cost?",
    a: "Every engagement is scoped to your documents, systems and team, so we agree the plan and the fee together after a short call. There are three packages: Pilot, Pro and Max.", cta: true },
  { q: "Talk to a person",
    a: "Happy to. Tell us the document that eats your week and we'll reply within one business day.", cta: true },
];
const FALLBACK = "I only answer from what's written on this page, so I don't want to guess at that one. Leave your question with your details and a person from the team will come back to you within a business day.";

export default function Gray() {
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>([{ from: "gray", text: OPENING }]);
  const [text, setText] = useState("");
  const [thinking, setThinking] = useState(false);
  const feed = useRef<HTMLDivElement>(null);
  const panel = useRef<HTMLDivElement>(null);

  useEffect(() => { feed.current?.scrollTo({ top: feed.current.scrollHeight, behavior: "smooth" }); }, [msgs, thinking, open]);
  useEffect(() => {
    if (!open) return;
    const esc = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    addEventListener("keydown", esc);
    panel.current?.querySelector<HTMLButtonElement>(".gray-chip")?.focus();
    return () => removeEventListener("keydown", esc);
  }, [open]);

  const reply = (question: string, answer: string, cta?: boolean) => {
    setMsgs(m => [...m, { from: "you", text: question }]);
    setThinking(true);
    setTimeout(() => { setThinking(false); setMsgs(m => [...m, { from: "gray", text: answer, cta }]); }, 650);
  };
  const ask = (e: React.FormEvent) => {
    e.preventDefault();
    const q = text.trim();
    if (!q) return;
    setText("");
    const hit = ANSWERS.find(a => a.q.toLowerCase().split(" ").filter(w => w.length > 4).some(w => q.toLowerCase().includes(w)));
    reply(q, hit ? hit.a : FALLBACK, hit ? hit.cta : true);
  };

  return (
    <>
      <button type="button" className={"gray-fab" + (open ? " is-open" : "")} onClick={() => setOpen(o => !o)} aria-expanded={open} aria-controls="gray-panel">
        {open ? <X size={18} /> : <><img src="/graymatter-mark.svg" alt="" /><span>Ask Gray</span></>}
      </button>

      <div id="gray-panel" className={"gray-panel" + (open ? " open" : "")} ref={panel} role="dialog" aria-label="Gray, the GrayMatter assistant" aria-hidden={!open}>
        <header className="gray-head">
          <img src="/graymatter-mark.svg" alt="" />
          <div><b>Gray</b><small>Your AI assistant · guided answers</small></div>
          <button type="button" onClick={() => setOpen(false)} aria-label="Close Gray"><X size={16} /></button>
        </header>

        <div className="gray-feed" ref={feed}>
          {msgs.map((m, i) => (
            <div key={i} className={"gray-msg " + m.from}>
              <p>{m.text}</p>
              {m.cta && <a className="gray-cta" href="#contact" onClick={() => setOpen(false)}>Tell us about your document</a>}
            </div>
          ))}
          {thinking && <div className="gray-msg gray typing"><span /><span /><span /></div>}
          <div className="gray-chips">
            {ANSWERS.map(a => (
              <button type="button" key={a.q} className="gray-chip" onClick={() => reply(a.q, a.a, a.cta)}>{a.q}</button>
            ))}
          </div>
        </div>

        <form className="gray-ask" onSubmit={ask}>
          <input value={text} onChange={e => setText(e.target.value)} placeholder="Ask Gray a question" aria-label="Ask Gray a question" maxLength={300} />
          <button type="submit" aria-label="Send"><ArrowUp size={15} /></button>
        </form>
        <p className="gray-note">Gray answers from this page. It never sees your firm&apos;s files.</p>
      </div>
    </>
  );
}
