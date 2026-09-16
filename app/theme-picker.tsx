"use client";

import { useEffect, useState } from "react";
import { Palette, X } from "lucide-react";

// A review tool, not part of the site: switches between the colour variants in public/themes
// so a palette can be chosen by looking at the real pages. Remove this component before launch.
type Theme = { id: string; name: string; mode: "dark" | "light"; accent: string; note: string };

export default function ThemePicker() {
  const [themes, setThemes] = useState<Theme[]>([]);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState("graphite");

  useEffect(() => { fetch("/themes/themes.json").then(r => r.json()).then(setThemes).catch(() => {}); }, []);

  useEffect(() => {
    const saved = localStorage.getItem("gm-theme");
    if (saved) apply(saved);
  }, []);

  const apply = (id: string) => {
    setActive(id);
    localStorage.setItem("gm-theme", id);
    document.documentElement.dataset.theme = id;
    const linkId = "gm-theme-css";
    let link = document.getElementById(linkId) as HTMLLinkElement | null;
    if (!link) { link = document.createElement("link"); link.id = linkId; link.rel = "stylesheet"; document.head.appendChild(link); }
    link.href = `/themes/${id}.css`;
  };

  return (
    <div className={"tp" + (open ? " open" : "")}>
      <button type="button" className="tp-fab" onClick={() => setOpen(o => !o)} aria-expanded={open}>
        {open ? <X size={16} /> : <Palette size={16} />} {open ? "Close" : "Colours"}
      </button>
      {open && (
        <div className="tp-panel">
          <p>Pick a palette. Everything recolours live; document and app mockups keep their own colours.</p>
          <ul>
            {themes.map(t => (
              <li key={t.id}>
                <button type="button" onClick={() => apply(t.id)} data-on={active === t.id}>
                  <span className="tp-sw" style={{ background: t.mode === "dark" ? "#14151d" : "#f3f2ef" }}>
                    <i style={{ background: t.accent }} />
                  </span>
                  <span className="tp-txt"><b>{t.name}</b><small>{t.note}</small></span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
