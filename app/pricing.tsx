"use client";

import { useState } from "react";
import { ArrowUpRight, Check, Sparkles, ChevronDown } from "lucide-react";

const plans = [
  { name: "Pilot", tag: "START HERE", period: "One workflow · eight weeks",
    note: "A measured test on one document your team repeats, with success criteria agreed before we start.",
    features: ["One document workflow", "Success criteria agreed upfront", "Baseline and final evaluation", "Your sources, your reviewers"],
    cta: "Explore the pilot",
    best: ["Proof before commitment, measured on your own documents", "Low risk: one workflow and a fixed eight-week scope", "A clear decision: before and after, with the same reviewers"] },
  { name: "Pro", tag: "MOST CHOSEN", period: "Your firm's shared memory",
    note: "One private memory across your teams, with cited first drafts in your own house formats.",
    features: ["Firm knowledge and cited drafts", "Your templates and formats", "Review and approval workflow", "Email, drive and chat connectors", "Named support"],
    cta: "Talk about Pro",
    best: ["One private memory your whole team can ask", "First drafts that follow your house formats", "Every statement linked to the file it came from"] },
  { name: "Max", tag: "",  period: "Every team, every office",
    note: "GrayMatter across practice areas and offices, with the controls and connectors your IT team asks for.",
    features: ["Every team and workflow in scope", "Connectors built for your systems", "Multi-office rollout with central controls", "Deployment and security review with IT", "Priority support and quarterly reviews"],
    cta: "Talk about Max",
    best: ["Roll out across practice areas, teams and offices", "Connect the systems your firm already runs on", "Deployment and security reviewed with your IT team"] },
];

export default function Pricing() {
  const [open, setOpen] = useState(0);
  return (
    <section id="pricing" className="section wrap">
      <div className="split-heading">
        <div><p className="eyebrow">HOW FIRMS START</p><h2>Prove the value.<br /><em>Then grow into it.</em></h2></div>
        <p className="section-intro">Begin with a pilot on one document. Grow into the firm when the work proves itself. We scope and quote every engagement after a short conversation.</p>
      </div>
      <div className="pricing-grid">
        {plans.map((p, i) => {
          const on = open === i;
          return (
            <article key={p.name} className={on ? "featured" : ""} onClick={() => setOpen(i)}>
              <div className="plan-top"><span>{p.tag || "\u00a0"}</span></div>
              <h3>{p.name}</h3>
              <span className="plan-period">{p.period}</span>
              <p>{p.note}</p>
              <ul>{p.features.map(f => <li key={f}><Check size={15} />{f}</li>)}</ul>
              <button type="button" className="plan-more" aria-expanded={on} aria-controls={"best-" + i} onClick={e => { e.stopPropagation(); setOpen(on ? -1 : i); }}>
                Why teams choose {p.name} <ChevronDown size={15} />
              </button>
              <div id={"best-" + i} className="plan-best" data-open={on}>
                <div><ul>{p.best.map(b => <li key={b}><Sparkles size={14} />{b}</li>)}</ul></div>
              </div>
              <a className={"button " + (on ? "" : "outline")} href="#contact" onClick={e => e.stopPropagation()}>{p.cta}<ArrowUpRight size={16} /></a>
            </article>
          );
        })}
      </div>
      <p className="pricing-note">Every engagement is scoped to your documents, systems and team, so we agree the plan and the fee together after a short call.</p>
    </section>
  );
}
