"use client";

// Shared footer, in the shape Glean uses, minus the office address.
const XMark = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M18.9 2h3.4l-7.4 8.5L23.6 22h-6.8l-5.3-7-6.1 7H2l7.9-9.1L1.7 2h7l4.8 6.4zm-1.2 18h1.9L7.4 4H5.4z" fill="currentColor" /></svg>
);
const LinkedInMark = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4.98 3.5A2.5 2.5 0 1 1 0 3.5a2.5 2.5 0 0 1 4.98 0M.22 8.4h4.52V24H.22zM8.3 8.4h4.33v2.13h.06c.6-1.14 2.08-2.34 4.28-2.34 4.58 0 5.43 3.01 5.43 6.93V24h-4.52v-7.86c0-1.87-.03-4.28-2.6-4.28-2.6 0-3 2.04-3 4.15V24H8.3z" fill="currentColor" /></svg>
);

export default function Footer() {
  return (
    <footer className="wrap site-footer">
      <div className="ft-top">
        <div className="ft-brand">
          <a className="brand" href="/"><img src="/graymatter-mark.svg" alt="" />GrayMatter<span>AI</span></a>
          <p>Private intelligence for firms that run on documents.</p>
        </div>

        <nav className="ft-links" aria-label="Footer">
          <span>Product</span>
          <a href="/">Assistant</a>
          <a href="/agents">Agents</a>
          <a href="/#architecture">Platform</a>
          <a href="/#pricing">Packages</a>
        </nav>

        <nav className="ft-links" aria-label="Company">
          <span>Company</span>
          <a href="/#pilot">Our approach</a>
          <a href="/#industries">Who it&apos;s for</a>
          <a href="/#contact">Talk to us</a>
          <a href="/#contact-privacy">Inquiry privacy</a>
        </nav>
      </div>

      <div className="ft-bottom">
        <span>© {new Date().getFullYear()} GrayMatter AI</span>
        <span className="ft-social">
          <a href="https://www.linkedin.com/" target="_blank" rel="noreferrer" aria-label="GrayMatter on LinkedIn"><LinkedInMark /></a>
          <a href="https://x.com/" target="_blank" rel="noreferrer" aria-label="GrayMatter on X"><XMark /></a>
        </span>
        <a href="/brain-attribution.txt" target="_blank" rel="noreferrer">3D credits</a>
      </div>
    </footer>
  );
}
