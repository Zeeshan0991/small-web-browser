'use client';
import { useEffect, useRef } from 'react';

// LAYER 3 of containment. Even if the sanitizer had a bug, the page is shown
// inside a sandboxed iframe with its own Content-Security-Policy.
const CSP = "default-src 'none'; style-src 'unsafe-inline'";

const FRAME_STYLE = `
  body { font: 17px/1.65 Georgia, serif; max-width: 42rem; margin: 0 auto;
         padding: 1.5rem 1.25rem 4rem; color: #1a1a1a; background: #fff; }
  h1, h2, h3, h4 { line-height: 1.25; }
  a { color: #0b57d0; cursor: pointer; text-decoration: underline; }
  pre { background: #f4f4f4; padding: .75rem; overflow-x: auto; }
  blockquote { margin-left: 0; padding-left: 1rem; border-left: 3px solid #ccc; color: #444; }
`;

// Only the page BODY is untrusted. Everything around it is ours.
function buildDocument(bodyHtml: string): string {
  return `<!doctype html><html><head><meta charset="utf-8">
<meta http-equiv="Content-Security-Policy" content="${CSP}">
<style>${FRAME_STYLE}</style></head><body>${bodyHtml}</body></html>`;
}

interface Props {
  title: string;
  author: string;
  html: string;
  scrollY: number; // where to put the reader back
  onScroll: (y: number) => void;
  onNavigate: (address: string) => void;
}

export default function PageView({ title, author, html, scrollY, onScroll, onNavigate }: Props) {
  const frame = useRef<HTMLIFrameElement>(null);

  // Handlers read the latest callbacks from here, so they never go stale.
  const latest = useRef({ onScroll, onNavigate });

  useEffect(() => {
    latest.current = { onScroll, onNavigate };
  }, [onScroll, onNavigate]);

  function handleLoad() {
    const win = frame.current?.contentWindow;
    const doc = frame.current?.contentDocument;
    if (!win || !doc) return;

    // RESTORE ON RETURN: put the reader back where they were.
    win.scrollTo(0, scrollY);
    latest.current.onScroll(scrollY);

    // Keep the browser informed of the scroll position.
    win.addEventListener('scroll', () => latest.current.onScroll(win.scrollY), { passive: true });

    // LINKS: never let the iframe navigate itself. Stop the click, and ask OUR
    // browser to go to the address the sanitizer attached to the link.
    doc.addEventListener('click', (event) => {
      const link = (event.target as Element).closest('a');
      if (!link) return;
      event.preventDefault();
      const address = link.getAttribute('data-address');
      if (address) latest.current.onNavigate(address);
    });
  }

  return (
    <div className="pageview">
      <div className="pagehead">
        {/* React escapes these, so a hostile title is just text */}
        <strong>{title}</strong> <span>by {author}</span>
      </div>
      <iframe
        ref={frame}
        title={title}
        // Scripts are NOT allowed, forms are NOT allowed, top navigation is NOT allowed.
        // allow-same-origin only lets OUR code read scroll and catch clicks.
        sandbox="allow-same-origin"
        referrerPolicy="no-referrer"
        srcDoc={buildDocument(html)}
        onLoad={handleLoad}
      />
    </div>
  );
}
