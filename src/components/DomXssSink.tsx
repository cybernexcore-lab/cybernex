'use client';

import { useEffect, useState } from 'react';

/**
 * Deliberate Vulnerability CN-XSS-03: DOM-based Cross-Site Scripting (DOM XSS)
 * Insecure client-side sink: reads unfiltered URL hash or query and renders into innerHTML!
 * Example attack: http://localhost:3000/dashboard#msg=<img src=x onerror=alert('DOM_XSS')>
 */
export default function DomXssSink() {
  const [htmlContent, setHtmlContent] = useState<string | null>(null);

  useEffect(() => {
    function checkPayload() {
      // Source 1: window.location.hash (#msg=...)
      if (typeof window !== 'undefined' && window.location.hash) {
        const hash = window.location.hash;
        if (hash.startsWith('#msg=')) {
          const raw = decodeURIComponent(hash.substring(5));
          setHtmlContent(raw);
          return;
        }
      }

      // Source 2: search params (?badge=...)
      if (typeof window !== 'undefined') {
        const params = new URLSearchParams(window.location.search);
        if (params.has('badge')) {
          setHtmlContent(params.get('badge'));
        }
      }
    }

    checkPayload();
    window.addEventListener('hashchange', checkPayload);
    return () => window.removeEventListener('hashchange', checkPayload);
  }, []);

  if (!htmlContent) return null;

  return (
    <div
      id="live-telemetry-notice"
      className="bg-[#05111d] border-y border-cyan-500/60 text-cyan-300 px-6 py-2.5 text-xs font-mono shadow-[0_0_15px_rgba(0,242,254,0.2)] flex items-center justify-between"
      dangerouslySetInnerHTML={{ __html: htmlContent }}
    />
  );
}
