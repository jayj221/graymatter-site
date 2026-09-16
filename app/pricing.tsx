"use client";

import { useState } from "react";
import { ArrowUpRight, Check, Sparkles, ChevronDown } from "lucide-react";

const plans = [
  { name: "Pilot", price: "₹75k–1.25L", period: "one time · 8 weeks", note: "One workflow. A measurable test.", cta: "Explore the pilot",
    features: ["One document workflow", "Success criteria agreed upfront", "Baseline and final evaluation"],
    best: ["Proof before commitment, measured on your own documents", "Low risk: one workflow and a fixed eight-week scope", "A clear decision: before and after, with the same reviewers"] },
  { name: "Core", price: "₹1.5L", period: "per month · 25–50 people", note: "A shared memory for your firm.", cta: "Discuss Core",
    features: ["Firm knowledge and cited drafts", "Your templates and formats", "Review and approval workflow"],
    best: ["One private memory your whole team can ask", "First drafts that follow your house formats", "Every statement linked to the file it came from"] },
  { name: "Growth", price: "₹2.5–4L", period: "per month", note: "More teams. More connected work.", cta: "Discuss Growth",
    features: ["Additional teams and workflows", "Broader knowledge sources", "Scope tailored to your operations"],
    best: ["Roll out across practice areas and teams", "Connect email, drives and matter or client systems", "Workflows shaped around how each team works"] },
  { name: "Enterprise", price: "Let’s talk", period: "custom scope", note: "Built around your organization.", cta: "Discuss Enterprise",
    features: ["Multi-office requirements", "Custom connector assessment", "Deployment and controls review"],
    best: ["Multi-office rollout with central controls", "Connectors built for your existing systems", "Deployment and security reviewed with your IT team"] },
];

export default function Pricing() {
  const [open, setOpen] = useState(0);
  return (
    <section id="pricing" className="section wrap">
      <div className="split-heading">
        <div><p className="eyebrow">A CLEAR STARTING POINT</p><h2>Prove the value.<br /><em>Then grow into it.</em></h2></div>
        <p className="section-intro">Start with a paid pilot. Agree on scope, deployment and success criteria before making a wider commitment.</p>
      </div>
      <div className="pricing-grid">
        {plans.map((p, i) => {
          const on = open === i;
          return (
            <article key={p.name} className={on ? "featured" : ""} onClick={() => setOpen(i)}>
              <div className="plan-top"><span>{p.name}</span></div>
              <h3>{p.price}</h3>
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
      <p className="pricing-note">Indicative pricing, excluding GST. One-time setup: ₹2–8 lakh, depending on connectors and document types. Final scope and fees are agreed in your proposal.</p>
    </section>
  );
}
