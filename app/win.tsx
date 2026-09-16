"use client";

import { FolderClosed, History, MessagesSquare, Search } from "lucide-react";

// The window furniture shared by every GrayMatter screen on the site: the side rail with its
// real tools, and the traffic-light buttons every desktop window carries.
export function WinRail() {
  return (
    <aside className="aw-rail" aria-hidden="true">
      <img src="/graymatter-mark-ink.svg" alt="" className="aw-logo" />
      <span className="aw-tool on" title="Ask"><MessagesSquare size={15} /></span>
      <span className="aw-tool" title="Search"><Search size={15} /></span>
      <span className="aw-tool" title="Files"><FolderClosed size={15} /></span>
      <span className="aw-tool" title="History"><History size={15} /></span>
    </aside>
  );
}

export function WinDots() {
  return <span className="aw-dots" aria-hidden="true"><span /><span /><span /></span>;
}
