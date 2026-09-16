"use client";

import { useEffect, useRef, useState } from "react";
import { FileText, Monitor, ShieldCheck, ShieldOff } from "lucide-react";
import { MODELS } from "./models";

// Two ways the same client file can be handled, side by side and playing on a loop:
// uploaded to a public chatbot, where it leaves the building and copies scatter; or handled by
// GrayMatter on the firm's own machines, where it never crosses the perimeter.
export default function Leak() {
  const host = useRef<HTMLDivElement>(null);
  const [on, setOn] = useState(false);
  useEffect(() => {
    const el = host.current;
    if (!el) return;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const io = new IntersectionObserver(([e]) => setOn(e.isIntersecting), { threshold: .25 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div className={"lk" + (on ? " on" : "")} ref={host}>
      <article className="lk-card risk">
        <header>
          <span className="lk-mark"><ShieldOff size={15} /></span>
          <div><b>Uploaded to a public chatbot</b><span className="lk-pill">Leaves your firm</span></div>
        </header>

        <div className="lk-stage" aria-hidden="true">
          <span className="lk-edge"><i /><em>YOUR FIRM ENDS HERE</em><i /></span>
          <div className="lk-models">
            {MODELS.map(({ name, Mark }) => <span key={name} className="lk-model" title={name}><Mark /><small>{name}</small></span>)}
          </div>
          <i className="lk-copy c1" /><i className="lk-copy c2" /><i className="lk-copy c3" />
          <div className="lk-file"><FileText size={13} /> Client file</div>
          <div className="lk-desk"><Monitor size={18} /><span>Someone&apos;s laptop</span></div>
        </div>

        <ul>
          <li>The file now sits on servers you do not control</li>
          <li>Copies spread further than the person who uploaded it</li>
          <li>Your partners have no record that it ever happened</li>
        </ul>
      </article>

      <article className="lk-card safe">
        <header>
          <span className="lk-mark"><ShieldCheck size={15} /></span>
          <div><b>Kept on your own machines</b><span className="lk-pill">Stays inside</span></div>
        </header>

        <div className="lk-stage" aria-hidden="true">
          <span className="lk-edge hold"><i /><em>YOUR FIRM ENDS HERE</em><i /></span>
          <div className="lk-box"><img src="/graymatter-mark.svg" alt="" className="lk-box-logo" /><b>GrayMatter</b><small>on your server</small></div>
          <div className="lk-file two"><FileText size={13} /> Client file</div>
          <div className="lk-answer">Answer, with sources</div>
          <div className="lk-desk"><Monitor size={18} /><span>The same laptop</span></div>
        </div>

        <ul>
          <li>The file never leaves the building</li>
          <li>Nothing is sent to an outside model, or used to train one</li>
          <li>Every question and answer is logged for your partners</li>
        </ul>
      </article>
    </div>
  );
}
