"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { Bell, CalendarClock, Check, Clock3, Mail, PenLine, Sparkles, Star } from "lucide-react";

/* ---------------- app tiles: simplified marks in each brand's colours ---------------- */
const tile = (bg: string, children: ReactNode) => (
  <svg viewBox="0 0 64 64" aria-hidden="true"><rect x="2" y="2" width="60" height="60" rx="14" fill={bg} />{children}</svg>
);
const letter = (bg: string, fg: string, ch: string, size = 30) =>
  tile(bg, <text x="32" y="43" textAnchor="middle" fontFamily="Arial, Helvetica, sans-serif" fontWeight="700" fontSize={size} fill={fg}>{ch}</text>);

const APPS: { name: string; icon: ReactNode }[] = [
  { name: "Gmail", icon: tile("#fff", <><path d="M14 22v22h7V30l11 8 11-8v14h7V22l-4-3-14 10-14-10z" fill="#EA4335" /><path d="M14 22v22h7V30z" fill="#4285F4" /><path d="M43 30v14h7V22z" fill="#34A853" /><path d="M50 22l-4-3-3 2v9l7-5z" fill="#FBBC04" /></>) },
  { name: "Outlook", icon: tile("#0A64D0", <><rect x="30" y="18" width="22" height="28" rx="3" fill="#50A5F5" /><rect x="12" y="20" width="26" height="24" rx="4" fill="#0F4FA8" /><ellipse cx="25" cy="32" rx="6.5" ry="8" fill="none" stroke="#fff" strokeWidth="3.5" /></>) },
  { name: "Microsoft Teams", icon: tile("#4B53BC", <><circle cx="45" cy="21" r="5" fill="#9EA3F2" /><rect x="38" y="28" width="16" height="18" rx="6" fill="#7B83EB" /><rect x="11" y="18" width="28" height="28" rx="4" fill="#3D43A8" /><path d="M18 25h14v4h-5v12h-4V29h-5z" fill="#fff" /></>) },
  { name: "Slack", icon: tile("#fff", <><rect x="27" y="11" width="7" height="20" rx="3.5" fill="#36C5F0" /><rect x="11" y="27" width="20" height="7" rx="3.5" fill="#2EB67D" /><rect x="30" y="33" width="7" height="20" rx="3.5" fill="#ECB22E" /><rect x="33" y="30" width="20" height="7" rx="3.5" fill="#E01E5A" /></>) },
  { name: "Word", icon: letter("#185ABD", "#fff", "W") },
  { name: "Excel", icon: letter("#107C41", "#fff", "X") },
  { name: "PowerPoint", icon: letter("#C43E1C", "#fff", "P") },
  { name: "OneDrive", icon: tile("#fff", <path d="M20 44h28a8 8 0 0 0 1-16 12 12 0 0 0-23-3 9 9 0 0 0-6 19z" fill="#0F78D4" />) },
  { name: "SharePoint", icon: tile("#036C70", <><circle cx="38" cy="26" r="12" fill="#1A9BA1" /><circle cx="42" cy="40" r="9" fill="#37C6D0" /><rect x="12" y="20" width="24" height="24" rx="4" fill="#03787C" /><text x="24" y="39" textAnchor="middle" fontFamily="Arial" fontWeight="700" fontSize="17" fill="#fff">S</text></>) },
  { name: "Google Drive", icon: tile("#fff", <><path d="M24 12h16l14 24H38z" fill="#FBBC04" /><path d="M24 12L10 36l8 14 14-24z" fill="#34A853" /><path d="M18 50h28l8-14H26z" fill="#4285F4" /></>) },
  { name: "Google Calendar", icon: tile("#fff", <><rect x="14" y="14" width="36" height="36" rx="5" fill="#fff" stroke="#4285F4" strokeWidth="4" /><rect x="14" y="14" width="36" height="9" fill="#4285F4" /><text x="32" y="44" textAnchor="middle" fontFamily="Arial" fontWeight="700" fontSize="16" fill="#1967D2">31</text></>) },
  { name: "Zoom", icon: tile("#0B5CFF", <><rect x="13" y="22" width="26" height="20" rx="5" fill="#fff" /><path d="M41 29l10-6v18l-10-6z" fill="#fff" /></>) },
  { name: "WhatsApp", icon: tile("#25D366", <path d="M32 13a19 19 0 0 0-16 29l-3 9 9-3a19 19 0 1 0 10-35zm9 26c-1 2-4 3-6 2-4-1-9-5-11-9-2-3-2-6 0-8l2-1 3 5-2 2c1 3 3 5 6 6l2-2 5 3z" fill="#fff" />) },
  { name: "Zoho", icon: tile("#fff", <><rect x="10" y="22" width="10" height="20" rx="2" fill="#E42527" /><rect x="22" y="22" width="10" height="20" rx="2" fill="#089949" /><rect x="34" y="22" width="10" height="20" rx="2" fill="#226DB4" /><rect x="46" y="22" width="8" height="20" rx="2" fill="#F9B21D" /></>) },
  { name: "Tally", icon: letter("#1F3C88", "#FFD400", "Tally", 15) },
  { name: "Notion", icon: letter("#fff", "#111", "N", 32) },
  { name: "Dropbox", icon: tile("#0061FF", <path d="M22 16l10 6-10 6-10-6zm20 0l10 6-10 6-10-6zM12 34l10-6 10 6-10 6zm20 0l10-6 10 6-10 6zm-10 8l10-6 10 6-10 6z" fill="#fff" />) },
  { name: "Salesforce", icon: tile("#00A1E0", <path d="M19 42a9 9 0 0 1-1-18 10 10 0 0 1 17-5 9 9 0 0 1 12 5 9 9 0 0 1-2 18z" fill="#fff" />) },
];

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
    <div className="wd-card inbox">
      <div className="wd-head"><Mail size={16} /> Inbox · triaged by GrayMatter <span>Today</span></div>
      <ul>
        {MAILS.map((m, i) => (
          <li key={m.subject} className={step >= i ? "in" : ""} style={{ transitionDelay: `${i * 40}ms` }}>
            <div className="row1"><b>{m.from}</b><span className={"mtag " + m.tag.toLowerCase()}>{m.tag === "Priority" && <Star size={11} />}{m.tag}</span></div>
            <p>{m.subject}</p>
            <small className={step >= i + 1 ? "done" : ""}>{m.action.startsWith("Draft") ? <PenLine size={12} /> : m.action.startsWith("Reply") ? <Clock3 size={12} /> : <Check size={12} />}{m.action}</small>
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

function Calendar() {
  const step = useTicker(EVENTS.length + 2, 1300);
  const moved = step >= EVENTS.length;
  const reminder = step >= EVENTS.length + 1;
  return (
    <div className="wd-card calendar">
      <div className="wd-head"><CalendarClock size={16} /> Week of 15 September <span>Synced</span></div>
      <div className="cal">
        {DAYS.map((d, di) => (
          <div key={d} className="cal-day">
            <span className="cal-label">{d}</span>
            <div className="cal-col">
              {EVENTS.map((e, i) => {
                const clash = !!e.clash;
                const s = clash && moved ? 1 : e.s;
                return e.d === di ? (
                  <div key={e.t} className={`ev ${e.c} ${step >= i ? "in" : ""} ${clash && moved ? "moved" : ""}`} style={{ top: `${s * 20 + 2}%`, height: `${e.h * 20 - 4}%` }}>
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
