"use client";

// Shared footer, in the shape Glean uses, minus the office address.

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
        <a href="/brain-attribution.txt" target="_blank" rel="noreferrer">3D credits</a>
      </div>
    </footer>
  );
}
