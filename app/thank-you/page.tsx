"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, Check, CalendarDays, FileSearch, MessageSquareText } from "lucide-react";

type Summary = { reference: string; name: string; company: string; size: string; workflow: string };

// Details come from sessionStorage, set by the form on this device; only the reference is ever in the URL.
export default function ThankYou() {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [reference, setReference] = useState("");

  useEffect(() => {
    const ref = new URLSearchParams(location.search).get("ref") || "";
    setReference(ref);
    try {
      const saved = JSON.parse(sessionStorage.getItem("gm-inquiry") || "null") as Summary | null;
      if (saved && saved.reference === ref) setSummary(saved);
    } catch { /* storage blocked: show the page without the recap */ }
  }, []);

  const first = summary?.name.split(" ")[0];
  return (
    <main className="thanks">
      <header className="header wrap"><a href="/" className="brand"><img src="/graymatter-mark.svg" alt="" />GrayMatter<span>AI</span></a></header>
      <section className="wrap thanks-grid">
        <div>
          <div className="success-icon"><Check size={28} /></div>
          <p className="eyebrow">INQUIRY RECEIVED</p>
          <h1>Thank you{first ? `, ${first}` : ""}.<br /><em>We&apos;ve got it from here.</em></h1>
          <p className="thanks-lead">Your inquiry is saved. A member of the GrayMatter team will reply within one business day to set up a short scoping call.</p>
          {reference && <p className="thanks-ref">Your reference <code>{reference}</code></p>}
          <a className="button outline" href="/"><ArrowLeft size={16} /> Back to the website</a>
        </div>
        <div className="thanks-card">
          {summary && (
            <div className="recap">
              <span className="eyebrow">WHAT YOU SENT</span>
              <dl>
                <div><dt>Firm</dt><dd>{summary.company}</dd></div>
                <div><dt>Team size</dt><dd>{summary.size} people</dd></div>
                <div className="wide"><dt>Document to start with</dt><dd>{summary.workflow}</dd></div>
              </dl>
            </div>
          )}
          <span className="eyebrow">WHAT HAPPENS NEXT</span>
          <ol className="next">
            <li><MessageSquareText size={20} /><div><b>We reply within one business day</b><span>From a real person, to the email you gave us.</span></div></li>
            <li><CalendarDays size={20} /><div><b>A 30-minute scoping call</b><span>We look at one recurring document and who reviews it.</span></div></li>
            <li><FileSearch size={20} /><div><b>A pilot proposal</b><span>Sources, reviewers and a clear pass or fail test, before any commitment.</span></div></li>
          </ol>
          <p className="fine">Please don&apos;t send confidential client documents by email. We&apos;ll agree a secure way to share material during scoping.</p>
        </div>
      </section>
    </main>
  );
}
