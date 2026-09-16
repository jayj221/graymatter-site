"use client";

import { useState, type ReactNode } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Check, FileText, Lock, Scale, Search, Sheet, ShieldCheck, Sparkles, TrendingUp } from "lucide-react";
import { WinDots, WinRail } from "./win";

type Note = { title: string; detail: string; source: string; tag: string };
type Mark = (n: number, children: ReactNode) => ReactNode;

// A highlighted span inside a document; clicking it opens the matching note, and the reverse.
function useMarks() {
  const [active, setActive] = useState(0);
  const mark: Mark = (n, children) => (
    // a span, not a button, so long highlights can wrap across lines like real marked-up text
    <span role="button" tabIndex={0} className={"hl" + (active === n ? " on" : "")} onClick={() => setActive(n)}
      onKeyDown={e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setActive(n); } }}
      aria-pressed={active === n} aria-label={"Show note " + (n + 1)}>
      {children}<sup>{n + 1}</sup>
    </span>
  );
  return { active, setActive, mark };
}

function LegalNotice({ mark }: { mark: Mark }) {
  return (
    <article className="doc-paper legal">
      <header className="lh">
        <strong>SHARMA &amp; ASSOCIATES</strong>
        <span>Advocates &amp; Legal Consultants</span>
        <span>Chamber No. 214, District Court Complex, Saket, New Delhi 110017</span>
      </header>
      <div className="lh-row"><span>Ref. No.: SA/NI/2026/118</span><span>Date: 14.09.2026</span></div>
      <p className="mode">BY REGISTERED POST A.D. / SPEED POST / EMAIL</p>
      <p className="to">To,<br />M/s Kavya Traders,<br />through its Proprietor, Mr. Rohan Mehta,<br />Plot 42, Sector 18, Noida, Uttar Pradesh 201301</p>
      <p className="subject"><b>Subject:</b> Legal notice under Section 138 read with Section 142 of the Negotiable Instruments Act, 1881, for dishonour of Cheque No. 004521</p>
      <p>Sir,</p>
      <p>Under instructions from and on behalf of my client, M/s Northline Supplies Pvt. Ltd., I hereby serve upon you the following legal notice:</p>
      <ol>
        <li>That you purchased goods from my client against Invoice Nos. NS/2231 to NS/2236 and, towards discharge of the said liability, issued Cheque No. 004521 dated 02.08.2026 for {mark(0, <>₹4,85,000/- (Rupees Four Lakh Eighty-Five Thousand only)</>)}, drawn on HDFC Bank, Sector 18 branch, Noida.</li>
        <li>That the said cheque, presented through my client&apos;s account at New Delhi, was returned unpaid vide Return Memo dated {mark(1, <>22.08.2026, and this notice is issued within thirty days</>)} of receipt of information of dishonour.</li>
        <li>I, therefore, hereby call upon you to pay the said sum of ₹4,85,000/- {mark(2, <>within fifteen (15) days of receipt of this notice</>)}, failing which my client shall be constrained to initiate proceedings under Section 138 of the Act {mark(3, <>before the court of competent jurisdiction at New Delhi</>)}, at your risk as to costs and consequences.</li>
      </ol>
      <p>A copy of this notice has been retained in my office for record and further action.</p>
      <p className="sign">Yours faithfully,<br /><b>(Adv. Neha Kapoor)</b><br />Advocate for the Client</p>
    </article>
  );
}

function PortfolioReview({ mark }: { mark: Mark }) {
  return (
    <article className="doc-paper wealth">
      <header className="wh">
        <div><span className="kicker">QUARTERLY CLIENT REVIEW · Q2 FY27</span><h4>Mehta Family Trust</h4></div>
        <div className="meta">Review date 15 Sep 2026<br />Relationship manager: A. Iyer</div>
      </header>
      <p className="lead">Equity allocation compared with the house model portfolio (v6)</p>
      <table className="alloc">
        <thead><tr><th>Market cap</th><th>Client today</th><th>House model</th><th>Gap</th></tr></thead>
        <tbody>
          <tr><td>Large cap</td><td>58%</td><td>50%</td><td className="up">+8%</td></tr>
          <tr><td>Mid cap</td><td>27%</td><td>20%</td><td className="up">+7%</td></tr>
          <tr><td>Small cap</td><td>{mark(0, <>15%</>)}</td><td>30%</td><td className="down">−15%</td></tr>
        </tbody>
      </table>
      <div className="facts">
        <div><span>Schemes held</span><b>{mark(1, <>22 funds</>)}</b><small>Model basket: 14</small></div>
        <div><span>1-yr alpha potential vs Nifty 50</span><b>{mark(2, <>0.9%</>)}</b><small>Model allocation: 2.16%</small></div>
      </div>
      <p className="rec"><b>Recommendation.</b> Move ₹1.2 Cr from overlapping large and mid-cap schemes into the model&apos;s small-cap funds {mark(3, <>in three tranches over six months</>)}, consolidating to the 14-fund basket.</p>
      <p className="fine">Target NAVs are estimates as on date and actual performance may differ.</p>
    </article>
  );
}

function ModelReview({ mark }: { mark: Mark }) {
  const rows: [string, string, string, ReactNode][] = [
    ["Land & Stamp Duty", "60", "100", "80"],
    ["Capital Subsidy", "2,000", "2,800", mark(0, <>6,458</>)],
    ["PLI / Turnover Subsidy", "1,500", "3,000", "2,250"],
    ["SGST Reimbursement", "3,000", "5,000", "4,000"],
    ["Power & Electricity", "500", "1,000", "750"],
    ["Employment Incentive", "500", "1,000", "750"],
  ];
  return (
    <article className="doc-paper sheet">
      <div className="sheet-bar"><Sheet size={14} /> ACC_Incentive_Financial_Model_Mar2026.xlsx <span>₹ Cr</span></div>
      <div className="grid-wrap">
        <table className="xl">
          <thead><tr><th className="rn" /><th>A</th><th>B</th><th>C</th><th>D</th></tr></thead>
          <tbody>
            <tr className="hdr"><td className="rn">4</td><td>Incentive head</td><td>Low</td><td>High</td><td>Base</td></tr>
            {rows.map(([h, l, hi, b], i) => <tr key={h}><td className="rn">{i + 5}</td><td>{h}</td><td>{l}</td><td>{hi}</td><td>{b}</td></tr>)}
            <tr className="tot"><td className="rn">15</td><td>TOTAL PACKAGE</td><td>8,760</td><td>14,900</td><td>15,888</td></tr>
          </tbody>
        </table>
      </div>
      <div className="xrefs">
        <div><span>Dashboard · 15-yr fiscal return</span><b>{mark(1, <>8,590</>)}</b><span>State ROI · base fiscal return</span><b>11,040</b></div>
        <div><span>Assumptions · direct jobs (total)</span><b>{mark(2, <>8,900</>)}</b><span>Direct jobs, detail line</span><b>2,226</b></div>
        <div><span>Sensitivity · total incentive at ₹80 / ₹92 / ₹105 per USD</span><b>{mark(3, <>15,888 · 15,888 · 15,888</>)}</b></div>
      </div>
      <div className="tabs-row"><span>Dashboard</span><span>Assumptions</span><span className="on">Incentive Framework</span><span>Phased Disbursement</span><span>State ROI</span><span>Sensitivity</span></div>
    </article>
  );
}

type SourceFile = { name: string; app: string; size: string; quote: string; where: string[]; access: string };
const firms: { id: string; label: string; icon: ReactNode; audience: string; does: string; chips: string[]; prompt: string; draft: string; Doc: (p: { mark: Mark }) => ReactNode; notes: Note[]; files: SourceFile[] }[] = [
  {
    id: "wealth", label: "Wealth advisory", icon: <TrendingUp size={15} />, audience: "wealth managers and family offices",
    does: "Compares each client's holdings with your house model portfolio, explains every gap using your own research, and drafts the review within the client's signed risk profile.",
    chips: ["Read the 29-page model portfolio", "Compared 22 holdings", "Stayed within the risk profile"],
    prompt: "Prepare the Mehta Family Trust's quarterly review against our current model portfolio.",
    draft: "Quarterly review, drafted",
    files: [
      { name: "House model portfolio v6.pdf", app: "Google Drive", size: "4 MB", quote: "Small cap moves from 15% to 30% of the equity allocation, held as one 14-fund basket.", where: ["Page 9", "Market-cap allocation"], access: "Advisory team" },
      { name: "Risk profile, Mehta Family Trust.pdf", app: "SharePoint", size: "1 MB", quote: "Small cap exposure is capped at 35%, with rebalancing in tranches over two quarters.", where: ["Page 4", "Signed March 2026"], access: "Client-restricted · RM and compliance" },
      { name: "Mehta holdings, Q2 FY27.xlsx", app: "Google Drive", size: "820 KB", quote: "22 schemes across 6 fund houses; equity 58% large, 27% mid, 15% small.", where: ["Sheet: Holdings", "Rows 4 to 26"], access: "Client-restricted · RM only" },
    ],
    Doc: PortfolioReview,
    notes: [
      { tag: "Gap", title: "Small cap is half the model weight", detail: "The house model moved small cap from 15% to 30% after small caps trailed Nifty 50 by 4.71% a year over five years. This client is still at 15%.", source: "House model portfolio v6.pdf · Page 9 · Market-cap allocation" },
      { tag: "Consolidate", title: "22 schemes against a 14-fund basket", detail: "The model is built to be held as one 14-fund basket. Your internal audit of 136 portfolios found 90% underperformed it.", source: "House model portfolio v6.pdf · Page 10 · Number of schemes" },
      { tag: "Estimate", title: "Alpha potential recomputed", detail: "Using the model's weighted target-NAV method: 0.9% on today's mix versus 2.16% on the model allocation. Estimates, not guarantees.", source: "House model portfolio v6.pdf · Page 9 · Portfolio data" },
      { tag: "Suitability", title: "Phasing matches the signed risk profile", detail: "The client's profile caps small cap at 35% and asks for rebalancing in tranches, so the move is split over six months.", source: "Risk profile, Mehta Family Trust.pdf · Page 4 · Signed March 2026" },
    ],
  },
  {
    id: "audit", label: "Audit", icon: <Sheet size={15} />, audience: "audit and advisory teams",
    does: "Reads every sheet of a client's financial model, traces each figure back to its cell, and drafts review points your team can check before the file reaches the partner.",
    chips: ["Traced 8 sheets", "4 exceptions with cell references", "Sign-off stays with the partner"],
    prompt: "Review the ACC incentive model and list anything that doesn't tie out before we sign off.",
    draft: "Review points, drafted",
    files: [
      { name: "ACC incentive model, March 2026.xlsx", app: "SharePoint", size: "6 MB", quote: "Base case total incentive ₹15,888 Cr against a high estimate of ₹14,900 Cr.", where: ["Incentive Framework", "D6 and D15"], access: "Engagement team · not shared with the client" },
      { name: "State ROI working.xlsx", app: "SharePoint", size: "2 MB", quote: "Fiscal return to the state taken at ₹11,040 Cr for the base case.", where: ["State ROI", "Section 2"], access: "Engagement team" },
      { name: "Engagement checklist.docx", app: "Google Drive", size: "310 KB", quote: "Every figure in the review memo is traced to its source cell before partner sign-off.", where: ["Page 2", "Review standards"], access: "Firm-wide, audit practice" },
    ],
    Doc: ModelReview,
    notes: [
      { tag: "Exception", title: "Base case is above the high case", detail: "Base total ₹15,888 Cr exceeds the ₹14,900 Cr high estimate. The driver is capital subsidy: ₹6,458 Cr in base against ₹2,800 Cr in high.", source: "Incentive Framework · D6 and D15" },
      { tag: "Mismatch", title: "Fiscal return doesn't reconcile", detail: "The dashboard shows ₹8,590 Cr while State ROI uses ₹11,040 Cr for the base case. The net state position changes depending on which is used.", source: "Dashboard · Row 10 vs State ROI · Section 2" },
      { tag: "Clarify", title: "Two different job counts", detail: "Assumptions lists 8,900 direct jobs and, one row below, 2,226 direct jobs. The dashboard uses 2,226 direct and 8,904 total.", source: "Assumptions · Section B · Rows 17 to 18" },
      { tag: "Link check", title: "FX rate changes nothing", detail: "Total incentive stays at ₹15,888 Cr from ₹80 to ₹105 per USD, which suggests the FX input isn't linked to any rupee line.", source: "Sensitivity Analysis · Data table 1" },
    ],
  },
  {
    id: "legal", label: "Legal", icon: <Scale size={15} />, audience: "law firms and in-house legal teams",
    does: "Drafts the notice in your firm's own format from the matter file, checks every amount, date and statutory period, and flags what a senior should confirm before it goes out.",
    chips: ["Pulled from 4 files in the matter", "Checked 2 statutory deadlines", "1 point flagged for review"],
    prompt: "Draft a Section 138 notice for the Kavya Traders cheque, using our standard format and the matter file.",
    draft: "Legal notice, drafted",
    files: [
      { name: "Firm template, S.138 notice v4.docx", app: "SharePoint", size: "180 KB", quote: "Demand payment within 15 days of receipt of this notice, as required under Section 138(c).", where: ["Para 4", "Approved format"], access: "Firm-wide precedent" },
      { name: "Bank return memo.pdf", app: "Google Drive", size: "240 KB", quote: "Cheque returned unpaid, reason: funds insufficient. Memo dated 22.08.2026.", where: ["Page 1", "Return reason"], access: "Privileged · matter team only" },
      { name: "Client ledger.xlsx", app: "Tally", size: "1 MB", quote: "Invoices NS/2231 to NS/2236 outstanding, total ₹4,85,000.", where: ["Kavya Traders", "Row 88"], access: "Privileged · matter team only" },
    ],
    Doc: LegalNotice,
    notes: [
      { tag: "Verified", title: "Amount matches ledger and cheque", detail: "₹4,85,000 matches the cheque image and the client ledger, where invoices NS/2231 to NS/2236 total ₹4,85,000.", source: "Client ledger.xlsx · Kavya Traders · Row 88" },
      { tag: "Within time", title: "Inside the 30-day window", detail: "The return memo is dated 22.08.2026 and was received on 25.08.2026. A notice dated 14.09.2026 falls on day 20 of the 30 days allowed under Section 138(b).", source: "Bank return memo.pdf · Page 1" },
      { tag: "Template", title: "15-day payment period", detail: "The 15 days from receipt required by Section 138(c), worded exactly as in your approved notice template.", source: "Firm template, S.138 notice v4.docx · Para 4" },
      { tag: "Review", title: "Confirm jurisdiction before dispatch", detail: "The cheque was presented through the client's account in New Delhi, so Section 142(2) points to New Delhi. Confirm the branch address in the matter note before sending.", source: "Matter note.docx · Page 2 · Presentation" },
    ],
  },
];

function Sources({ firm }: { firm: (typeof firms)[number] }) {
  return (
    <div className="gm-app app-win">
      <WinRail />
      <div className="aw-main">
      <div className="aw-bar">
        <WinDots />
        <b>GrayMatter</b><small>· {firm.label} workspace</small>
        <span className="aw-new">New chat</span>
      </div>
      <div className="gm-body">
      <div className="gm-q"><span>You</span><p>{firm.prompt}</p></div>
      <p className="gm-found"><Sparkles size={13} /> Found {firm.files.length} files across your connected systems</p>
      {firm.files.map(f => (
        <article className="gm-file" key={f.name}>
          <header>
            <FileText size={15} />
            <b>{f.name}</b>
            <span className="gm-actions"><button type="button">View citations</button><button type="button" className="chat">Chat</button></span>
          </header>
          <p className="gm-meta">{f.size} · {f.app}</p>
          <blockquote>&ldquo;{f.quote}&rdquo;</blockquote>
          <p className="gm-where">{f.where.map(w => <span key={w}>{w}</span>)}<span className="gm-access"><Lock size={11} /> {f.access}</span></p>
        </article>
      ))}
      <p className="gm-guard"><ShieldCheck size={13} /> Everything above stayed inside the firm. No file, excerpt or figure was sent to ChatGPT, Claude or any outside model.</p>
      <div className="gm-bar">
        <span>Ask anything about these files…</span>
        <span className="gm-bar-right"><button type="button" className="gm-search"><Search size={13} /> Search</button></span>
      </div>
      </div>
      </div>
    </div>
  );
}

function FirmPanel({ firm }: { firm: (typeof firms)[number] }) {
  const { active, setActive, mark } = useMarks();
  const Doc = firm.Doc;
  return (
    <>
      <div className="does">
        <p><span>For {firm.audience}.</span> {firm.does}</p>
        <ul>{firm.chips.map(c => <li key={c}><Check size={13} />{c}</li>)}</ul>
      </div>
      <Sources firm={firm} />
      <div className="draft-layout">
        <div className="doc-col">
          <div className="paper-meta dark"><FileText size={15} /> {firm.draft.toUpperCase()} <span>TAP A HIGHLIGHT</span></div>
          <Doc mark={mark} />
        </div>
        <aside className="notes">
          <span className="eyebrow">WHAT GRAYMATTER CHECKED</span>
          {firm.notes.map((n, i) => (
            <button type="button" key={n.title} className={"note" + (active === i ? " on" : "")} onClick={() => setActive(i)} aria-pressed={active === i}>
              <span className="num">{i + 1}</span>
              <div>
                <span className={"tag t-" + n.tag.toLowerCase().replace(/\s/g, "")}>{n.tag}</span>
                <strong>{n.title}</strong>
                <p>{n.detail}</p>
                <small>{n.source}</small>
              </div>
            </button>
          ))}
        </aside>
      </div>
    </>
  );
}

export default function Demo() {
  return (
    <div className="demo">
      <div className="demo-heading">
        <div><span className="eyebrow">FROM QUESTION TO FIRST DRAFT</span><h3>See it on the documents<br />your firm works with.</h3></div>
        <span className="demo-badge">INTERACTIVE EXAMPLE</span>
      </div>
      <Tabs defaultValue="wealth">
        <TabsList className="demo-tabs">{firms.map(f => <TabsTrigger value={f.id} key={f.id}>{f.icon}{f.label}</TabsTrigger>)}</TabsList>
        {firms.map(f => <TabsContent value={f.id} key={f.id}><FirmPanel firm={f} /></TabsContent>)}
      </Tabs>
      <p className="demo-disclaimer">Illustrative examples with fictional parties, modelled on the structure of real documents. This is a guided example, not a live AI response.</p>
    </div>
  );
}
