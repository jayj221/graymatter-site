"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { Bell, CalendarClock, Check, Clock3, Mail, PenLine, Sparkles, Star } from "lucide-react";

import { LOGOS } from "./logos";

export const APPS: { name: string; icon: ReactNode }[] = [
  "Gmail", "Outlook", "Microsoft Teams", "Slack", "Word", "Excel", "PowerPoint", "OneDrive",
  "SharePoint", "Google Drive", "Google Calendar", "Zoom", "WhatsApp", "Zoho", "Tally",
  "Notion", "Dropbox", "Salesforce",
].map(name => ({ name, icon: LOGOS[name] }));

/* ---------------- macOS-style dock: icons grow with closeness to the cursor ---------------- */
function Dock() {
  const dock = useRef<HTMLUListElement>(null);
  const refs = useRef<(HTMLLIElement | null)[]>([]);
  const [hovered, setHovered] = useState(-1);

  // One animation loop eases every icon toward its target size, like the real Dock.
  // Targets come from where icons sit at rest, so growing icons never shift the maths under the cursor.
  useEffect(() => {
    const ul = dock.current!;
    const n = APPS.length, current = new Array(n).fill(1), target = new Array(n).fill(1);
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0, last = performance.now(), running = false;
    const tick = (now: number) => {
      const dt = Math.min((now - last) / 1000, .05); last = now;
      const k = reduce ? 1 : 1 - Math.exp(-dt * 12);
      let moving = false;
      for (let i = 0; i < n; i++) {
        current[i] += (target[i] - current[i]) * k;
        if (Math.abs(target[i] - current[i]) > .001) moving = true; else current[i] = target[i];
        refs.current[i]?.style.setProperty("--s", current[i].toFixed(4));
      }
      if (moving) raf = requestAnimationFrame(tick); else running = false;
    };
    const kick = () => { if (!running) { running = true; last = performance.now(); raf = requestAnimationFrame(tick); } };
    const onMove = (e: MouseEvent) => {
      const cs = getComputedStyle(ul);
      const base = parseFloat(cs.getPropertyValue("--base")) || 50, gap = parseFloat(cs.columnGap) || 8;
      const rect = ul.parentElement!.getBoundingClientRect();
      const x = e.clientX - (rect.left + rect.width / 2);                      // cursor relative to the dock's centre
      const start = -(n * base + (n - 1) * gap) / 2 + base / 2;               // centre of icon 0 at rest
      const reach = base * 4;
      for (let i = 0; i < n; i++) {
        const dist = Math.abs(x - (start + i * (base + gap)));
        target[i] = 1 + .7 * Math.exp(-(dist * dist) / (2 * (reach / 2) ** 2)); // smooth bell curve, no hard edge
      }
      kick();
    };
    const onLeave = () => { target.fill(1); kick(); };
    ul.addEventListener("mousemove", onMove);
    ul.addEventListener("mouseleave", onLeave);
    return () => { cancelAnimationFrame(raf); ul.removeEventListener("mousemove", onMove); ul.removeEventListener("mouseleave", onLeave); };
  }, []);

  return (
    <div className="dock-wrap">
      <ul className="dock" ref={dock} onMouseLeave={() => setHovered(-1)}>
        {APPS.map((a, i) => (
          <li key={a.name} ref={el => { refs.current[i] = el; }}
            onMouseEnter={() => setHovered(i)} tabIndex={0} onFocus={() => setHovered(i)} onBlur={() => setHovered(-1)} aria-label={a.name}>
            <span className={"dock-tip" + (hovered === i ? " on" : "")}>{a.name}</span>
            {a.icon}
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ---------------- inbox triage loop ---------------- */
const MAIL_META = [
  { who: "RN", colour: "#1a73e8", time: "9:04 AM" },
  { who: "SD", colour: "#c5221f", time: "8:41 AM" },
  { who: "PM", colour: "#188038", time: "8:12 AM" },
  { who: "VN", colour: "#8430ce", time: "7:58 AM" },
];
const MAILS = [
  { from: "Rakesh Nair, CFO · Northline", subject: "Board pack figures needed by Thursday", tag: "Priority", action: "Draft ready: figures attached from Q2 model" },
  { from: "SEBI circular digest", subject: "Amendments to investment adviser rules", tag: "Action", action: "Summarised · 3 clients affected" },
  { from: "Priya (Client) · Mehta Trust", subject: "Can we move the review to next week?", tag: "Priority", action: "Reply scheduled · 9:00 tomorrow" },
  { from: "Vendor newsletter", subject: "Our September product update", tag: "Later", action: "Filed to Read later" },
];

function useTicker(n: number, ms: number) {
  const [i, setI] = useState(0);
  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) { setI(n - 1); return; }
    const t = setInterval(() => setI(v => (v + 1) % (n + 4)), ms); // hold the finished state before replaying
    return () => clearInterval(t);
  }, [n, ms]);
  return i;
}

function Inbox() {
  const step = useTicker(MAILS.length, 1500);
  return (
    <div className="wd-card gmail">
      <div className="app-chrome"><span className="ac-dots"><i /><i /><i /></span><span className="ac-url">mail.google.com</span></div>
      <div className="gmail-top">
        <span className="gm-burger" aria-hidden="true"><i /><i /><i /></span>
        <svg viewBox="0 0 64 48" className="gmail-logo" aria-hidden="true"><path d="M4 12v28h9V22l19 14 19-14v18h9V12l-7-5-21 15L11 7z" fill="#EA4335" /><path d="M4 12v28h9V22z" fill="#4285F4" /><path d="M51 22v18h9V12z" fill="#34A853" /><path d="M60 12l-7-5-2 2v13l9-7z" fill="#FBBC04" /></svg>
        <div className="gmail-search">Search mail</div>
        <span className="gmail-avatar">PS</span>
      </div>
      <div className="gmail-tabs"><span className="on">Primary</span><span>Promotions</span><span>Updates</span></div>
      <ul className="gmail-list">
        {MAILS.map((m, i) => (
          <li key={m.subject} className={step >= i ? "in" : ""} style={{ transitionDelay: `${i * 40}ms` }}>
            <span className="gl-star" aria-hidden="true"><Star size={13} /></span>
            <span className="gl-av" style={{ background: MAIL_META[i].colour }}>{MAIL_META[i].who}</span>
            <div className="gl-body">
              <div className="gl-row">
                <b>{m.from}</b>
                <span className={"mtag " + m.tag.toLowerCase()}>{m.tag}</span>
                <span className="gl-time">{MAIL_META[i].time}</span>
              </div>
              <p><b>{m.subject}</b></p>
              <small className={step >= i + 1 ? "done" : ""}>
                {m.action.startsWith("Draft") ? <PenLine size={12} /> : m.action.startsWith("Reply") ? <Clock3 size={12} /> : <Check size={12} />}
                {m.action}
              </small>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ---------------- calendar loop: events land, a clash is moved, a reminder fires ---------------- */
const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri"];
const EVENTS: { d: number; s: number; h: number; t: string; c: string; clash?: boolean }[] = [
  { d: 0, s: 1, h: 2, t: "Partner review", c: "ev-indigo" },
  { d: 1, s: 3, h: 1, t: "Internal review", c: "ev-green" },
  { d: 1, s: 3, h: 1, t: "Client call · Mehta", c: "ev-coral", clash: true },
  { d: 2, s: 0, h: 2, t: "Audit fieldwork", c: "ev-green" },
  { d: 3, s: 2, h: 2, t: "Board meeting", c: "ev-coral" },
  { d: 4, s: 1, h: 1, t: "Team sync", c: "ev-indigo" },
];

const HOURS = ["9 AM", "10 AM", "11 AM", "12 PM", "1 PM"];
const DATES = [15, 16, 17, 18, 19];

function Calendar() {
  const step = useTicker(EVENTS.length + 2, 1300);
  const moved = step >= EVENTS.length;
  const reminder = step >= EVENTS.length + 1;
  return (
    <div className="wd-card gcal">
      <div className="app-chrome"><span className="ac-dots"><i /><i /><i /></span><span className="ac-url">calendar.google.com</span></div>
      <div className="gcal-top">
        <svg viewBox="0 0 48 48" className="gcal-logo" aria-hidden="true"><rect x="6" y="8" width="36" height="34" rx="5" fill="#fff" stroke="#4285F4" strokeWidth="3" /><rect x="6" y="8" width="36" height="8" fill="#4285F4" /><text x="24" y="36" textAnchor="middle" fontFamily="Arial" fontWeight="700" fontSize="15" fill="#1967D2">31</text></svg>
        <b>September 2026</b>
        <span className="gcal-view">Week</span>
        <span className="gcal-sync">Synced with GrayMatter</span>
      </div>
      <div className="cal">
        <div className="cal-gutter">{HOURS.map(h => <span key={h}>{h}</span>)}</div>
        {DAYS.map((d, di) => (
          <div key={d} className="cal-day">
            <span className="cal-label">{d}<b className={di === 3 ? "today" : ""}>{DATES[di]}</b></span>
            <div className="cal-col">
              {HOURS.map((h, hi) => <i key={h} className="cal-line" style={{ top: `${hi * 20}%` }} />)}
              {EVENTS.map((e, i) => {
                const clash = !!e.clash;
                const s2 = clash && moved ? 1 : e.s;
                return e.d === di ? (
                  <div key={e.t} className={`ev ${e.c} ${step >= i ? "in" : ""} ${clash && moved ? "moved" : ""}`} style={{ top: `${s2 * 20 + 1}%`, height: `${e.h * 20 - 3}%` }}>
                    {e.t}{clash && <em>{moved ? "Moved to 10:00" : "Clashes with review"}</em>}
                  </div>
                ) : null;
              })}
            </div>
          </div>
        ))}
      </div>
      <div className={"toast" + (reminder ? " on" : "")}><Bell size={15} /><div><b>Board meeting in 30 minutes</b><span>Agenda and last minutes attached</span></div></div>
    </div>
  );
}

/* ---------------- team report built on the metrics the firm chooses ---------------- */
const TEAM = [
  { n: "Ananya Rao", r: "Associate", v: [96, 92, 88], a: "Consistently early on client packs" },
  { n: "Karan Mehta", r: "Senior analyst", v: [91, 84, 93], a: "Fastest review turnaround this quarter" },
  { n: "Sneha Pillai", r: "Associate", v: [82, 90, 79], a: "Strong client responsiveness" },
  { n: "Vikram Shah", r: "Analyst", v: [74, 71, 80], a: "Deadlines slipped in August; workload spiked" },
];
const METRICS = ["Deliverables on time", "Review turnaround", "Client replies < 24h"];

function TeamReport() {
  const ranked = [...TEAM].map(p => ({ ...p, score: Math.round(p.v.reduce((a, b) => a + b, 0) / p.v.length) })).sort((a, b) => b.score - a.score);
  return (
    <div className="wd-card report">
      <div className="wd-head"><Sparkles size={16} /> Appraisal summary · Q2 FY27 <span>Draft for manager review</span></div>
      <div className="ask">&ldquo;Generate a Q2 performance summary for the advisory team, ranked on our three metrics.&rdquo;</div>
      <div className="metric-row">{METRICS.map(m => <span key={m}>{m}</span>)}</div>
      <ol className="rank">
        {ranked.map((p, i) => (
          <li key={p.n}>
            <span className="pos">{i + 1}</span>
            <div className="who"><b>{p.n}</b><small>{p.r} · {p.a}</small></div>
            <div className="bars">{p.v.map((v, j) => <i key={j} title={`${METRICS[j]}: ${v}`}><b style={{ width: `${v}%` }} /></i>)}</div>
            <span className="score">{p.score}</span>
          </li>
        ))}
      </ol>
      <p className="fine">Built from activity in the tools your firm connects, on metrics you define. Employees are told what is measured and can see their own record. A manager reviews every summary before it is used.</p>
    </div>
  );
}

export default function Workday() {
  return (
    <section id="connected" className="section wrap workday">
      <div className="split-heading">
        <div><p className="eyebrow">CONNECTED TO HOW YOUR FIRM WORKS</p><h2>One brain across<br /><em>every tool you use.</em></h2></div>
        <p className="section-intro">GrayMatter connects to your email, chat, documents and calendars, so the knowledge in them works for you instead of piling up.</p>
      </div>
      <Dock />
      <p className="dock-note">Gmail, Outlook, Microsoft Teams, Slack, Microsoft 365, Google Workspace, Zoom, WhatsApp Business, Zoho, Tally, Notion, Dropbox and Salesforce.<span className="hover-hint"> Hover to explore.</span></p>

      <div className="wd-grid">
        <div className="wd-copy">
          <p className="eyebrow">YOUR INBOX, HANDLED</p>
          <h3>The emails that matter,<br />first.</h3>
          <ul className="wd-points">
            <li><Star size={16} /><div><b>Prioritised</b><span>Clients, deadlines and regulators rise to the top. Newsletters wait.</span></div></li>
            <li><PenLine size={16} /><div><b>Drafted in your voice</b><span>Replies written from your files and past emails, ready for you to send.</span></div></li>
            <li><Clock3 size={16} /><div><b>Scheduled</b><span>Send later, follow up automatically, never let a thread go cold.</span></div></li>
          </ul>
        </div>
        <Inbox />
      </div>

      <div className="wd-grid flip">
        <Calendar />
        <div className="wd-copy">
          <p className="eyebrow">YOUR CALENDAR, KEPT HONEST</p>
          <h3>Nothing important<br />slips past.</h3>
          <ul className="wd-points">
            <li><CalendarClock size={16} /><div><b>Always up to date</b><span>Meetings from email and chat land on the calendar by themselves.</span></div></li>
            <li><Check size={16} /><div><b>Clashes resolved</b><span>Double bookings are caught and a better slot is suggested.</span></div></li>
            <li><Bell size={16} /><div><b>Reminded with context</b><span>Before each meeting, the agenda, last minutes and open actions.</span></div></li>
          </ul>
        </div>
      </div>

      <div className="wd-grid">
        <div className="wd-copy">
          <p className="eyebrow">TEAM INSIGHTS</p>
          <h3>Appraisals built on<br />the work itself.</h3>
          <ul className="wd-points">
            <li><Sparkles size={16} /><div><b>See where work flows and stalls</b><span>Deliverables completed, review turnaround and client response times across the team.</span></div></li>
            <li><Check size={16} /><div><b>Your metrics, your weighting</b><span>Choose what counts for your firm. Rankings follow those metrics only.</span></div></li>
            <li><PenLine size={16} /><div><b>One request at appraisal time</b><span>Ask for a summary per person, with the evidence behind every point.</span></div></li>
          </ul>
        </div>
        <TeamReport />
      </div>
    </section>
  );
}
