"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Lock, ShieldOff, Users } from "lucide-react";
import Leak from "./leak";

// The quiet problem: people already paste client material into public chatbots.
// The figures count up, and the crowd fills in, once the section is on screen.
const ADMITTED = 52;      // people who use AI at work and would not admit it for their most important tasks
const GRID = 100;

function useSeen<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) { setSeen(true); return; }
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setSeen(true); io.disconnect(); } }, { threshold: .3 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return [ref, seen] as const;
}

function Counter({ to, seen }: { to: number; seen: boolean }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!seen) return;
    let raf = 0;
    const t0 = performance.now(), dur = 1100;
    const tick = (now: number) => {
      const p = Math.min(1, (now - t0) / dur), e = 1 - Math.pow(1 - p, 3);
      setN(Math.round(to * e));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [seen, to]);
  return <>{n}</>;
}

export default function Shadow() {
  const [ref, seen] = useSeen<HTMLElement>();
  const [ansRef, seenAns] = useSeen<HTMLDivElement>();
  return (
    <section className="shadow section" ref={ref}>
      <div className="wrap shadow-grid">
        <div>
          <p className="eyebrow">THE PART NOBODY PUTS IN WRITING</p>
          <h2>Your team already<br /><em>uses AI. Just not yours.</em></h2>
          <p className="section-intro">Client files, draft reports and working papers are already being pasted into public chatbots, from personal accounts, on personal laptops, with nobody logging any of it.</p>
          <ul className="shadow-points">
            <li><Users size={17} /><div><b>It is already happening</b><span>Most people who use AI at work bring their own tools, and more than half would not admit using it on their most important work.</span></div></li>
            <li><ShieldOff size={17} /><div><b>Nobody can see it</b><span>Personal accounts leave no audit trail, so a firm cannot tell which client documents have left the building.</span></div></li>
          </ul>
          <p className="shadow-src">Figures from the Microsoft and LinkedIn Work Trend Index, 2024. The honest number is almost certainly higher.</p>
        </div>

        <figure className="shadow-fig">
          <div className="sf-head">
            <b><Counter to={ADMITTED} seen={seen} />%</b>
            <span>would not admit to using AI on their most important work</span>
          </div>
          <div className={"sf-grid" + (seen ? " on" : "")} aria-hidden="true">
            {Array.from({ length: GRID }, (_, i) => (
              <i key={i} className={i < ADMITTED ? "lit" : ""} style={{ transitionDelay: `${(i % 10) * 18 + Math.floor(i / 10) * 45}ms` }} />
            ))}
          </div>
          <figcaption>100 people in a firm. The lit ones are the ones who answered honestly.</figcaption>
        </figure>
      </div>

      <div className="wrap shadow-answer" ref={ansRef}>
        <div className="sa-copy">
          <span className="sa-badge"><Lock size={14} /> WHAT GRAYMATTER CHANGES</span>
          <h3>Keep the work. <em>Lose the leak.</em></h3>
          <p>Your people go on doing the same things: the research note, the client deck, the first draft, the summary before a meeting. The difference is where the documents go.</p>

        </div>
        <ul className={"sa-list" + (seenAns ? " on" : "")}>
          {[
            ["The work stays inside your firm", "GrayMatter runs against your own files, under your own permissions. People see only what they could already open."],
            ["Client material is never used to train a model", "Nothing your firm puts in becomes training data for anyone, and no one outside your firm can query your knowledge."],
            ["You can see who asked what", "Every question and every draft leaves a record your partners can review, which a personal chatbot account will never give you."],
          ].map(([title, body], i) => (
            <li key={title} style={{ transitionDelay: `${i * 130}ms` }}>
              <i className="sa-tick"><Check size={15} /></i>
              <div><b>{title}</b><span>{body}</span></div>
            </li>
          ))}
        </ul>
        <Leak />
      </div>
    </section>
  );
}
