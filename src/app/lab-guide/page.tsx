'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  BookOpen,
  Compass,
  Terminal,
  ShieldAlert,
  ChevronDown,
  ChevronRight,
  KeyRound,
  FileCode,
  Bug,
  RotateCcw,
  CheckCircle,
  Radio,
  Cpu,
  Layers,
  Flame,
} from 'lucide-react';

interface LabObjective {
  id: string;
  category: string;
  name: string;
  targetEndpoint: string;
  tools: string[];
  objective: string;
  hint: string;
  remediationSnippet: string;
}

const OBJECTIVES: LabObjective[] = [
  {
    id: 'CN-AUTH-01',
    category: 'Authentication',
    name: 'Authentication Bypass via SQL Injection',
    targetEndpoint: '/api/auth/login or /login',
    tools: ['Burp Suite', 'Browser Form', 'curl'],
    objective: 'Bypass operator authentication gate and log in as the Administrator without knowing the password.',
    hint: 'Look at how the login API constructs the SQL query. What happens when a single quote or comment characters (-- or /*) are introduced into the username field?',
    remediationSnippet: `// Remediate with parameterized queries:\nconst user = db.prepare('SELECT * FROM users WHERE username = ? AND password = ?').get(username, password);`,
  },
  {
    id: 'CN-AUTH-02',
    category: 'Authentication',
    name: 'Operator Username Enumeration',
    targetEndpoint: '/api/auth/login',
    tools: ['Burp Intruder', 'ffuf', 'curl'],
    objective: 'Determine valid operator usernames by analyzing differential application response messages.',
    hint: 'Submit a login request with a definitely fake username versus a known username like "admin" or "alice". Compare the exact error string returned in the JSON/UI.',
    remediationSnippet: `// Remediate by returning generic error messages:\nreturn NextResponse.json({ error: "Invalid username or password." }, { status: 401 });`,
  },
  {
    id: 'CN-INJ-01',
    category: 'Injection',
    name: 'Threat Search SQL Injection (UNION Exploitation)',
    targetEndpoint: '/dashboard?q=... or /api/incidents?q=...',
    tools: ['sqlmap', 'Burp Repeater', 'Browser URL'],
    objective: 'Extract database credentials, API secret keys, and user password hashes from the users table using UNION SELECT.',
    hint: 'The incident search endpoint accepts a raw "q" query parameter. Test whether you can order by columns (e.g. ORDER BY 1, 2, ...) and craft a UNION SELECT matching column counts.',
    remediationSnippet: `// Remediate with parameterized search query:\nconst sql = 'SELECT * FROM incidents WHERE title LIKE ? OR description LIKE ?';\nconst rows = db.prepare(sql).all(\`%\${q}%\`, \`%\${q}%\`);`,
  },
  {
    id: 'CN-XSS-01',
    category: 'Cross-Site Scripting',
    name: 'Reflected XSS via Query Filter',
    targetEndpoint: '/dashboard?q=...',
    tools: ['Browser URL', 'DevTools Console'],
    objective: 'Execute arbitrary JavaScript in the context of the user session by injecting an unescaped payload into the search parameter.',
    hint: 'Inspect how the search term is echoed back in the telemetry search result header. Is it encoded, or rendered as raw HTML?',
    remediationSnippet: `// Remediate by encoding text instead of using dangerouslySetInnerHTML:\n<span>{searchQuery}</span>`,
  },
  {
    id: 'CN-XSS-02',
    category: 'Cross-Site Scripting',
    name: 'Stored XSS via Incident Broadcast',
    targetEndpoint: '/dashboard (New Incident Form)',
    tools: ['Browser Form', 'Burp Repeater'],
    objective: 'Persist a malicious script payload inside an incident headline or description that triggers when any user views the active queue.',
    hint: 'Submit a new threat report containing a benign image error handler or script tag. Refresh the page or view the queue in another session.',
    remediationSnippet: `// Remediate by sanitizing HTML input or escaping when rendering:\nimport DOMPurify from 'isomorphic-dompurify';\nconst cleanHtml = DOMPurify.sanitize(item.description);`,
  },
  {
    id: 'CN-XSS-03',
    category: 'Cross-Site Scripting',
    name: 'DOM-based XSS via URL Fragment / Parameter',
    targetEndpoint: '/dashboard#msg=... or /dashboard?badge=...',
    tools: ['Browser DevTools', 'URL Bar'],
    objective: 'Trigger client-side JavaScript execution via unsafe DOM sink handling without sending the payload to the server backend.',
    hint: 'Examine DomXssSink.tsx or inspect client scripts listening to window.location.hash or search parameters. Test appending #msg=<img src=x onerror=alert(1)>.',
    remediationSnippet: `// Remediate by setting textContent instead of innerHTML:\nelement.textContent = rawMsg;`,
  },
  {
    id: 'CN-AC-01',
    category: 'Access Control',
    name: 'Insecure Direct Object Reference (IDOR)',
    targetEndpoint: '/profile?id=... and /api/user/lookup?id=...',
    tools: ['Burp Suite', 'Browser URL'],
    objective: 'Access and modify private dossier records, contact details, and secret keys belonging to another operator.',
    hint: 'Log in as operator "bob" (ID #3). Notice the "id" parameter in the URL or profile lookup API. What happens when you request id=1 or id=2?',
    remediationSnippet: `// Remediate by enforcing session ownership check:\nif (sessionUser.id !== requestedId && sessionUser.role !== 'admin') {\n  return NextResponse.json({ error: 'Forbidden' }, { status: 403 });\n}`,
  },
  {
    id: 'CN-AC-02',
    category: 'Access Control',
    name: 'Privilege Escalation via Mass Assignment',
    targetEndpoint: '/api/user/update',
    tools: ['Burp Repeater', 'DevTools Network Tab'],
    objective: 'Escalate a standard operator account to full Administrator (CISO) clearance tier.',
    hint: 'Intercept the POST request sent when updating profile details. Notice the parameters accepted by the endpoint (such as "role"). Can you modify role="admin"?',
    remediationSnippet: `// Remediate by whitelist-filtering allowable user-updatable fields:\nconst allowedUpdates = { email, phone, bio, full_name };\n// Never allow client to set role directly!`,
  },
  {
    id: 'CN-FILE-01',
    category: 'File Handling',
    name: 'Unrestricted File Upload (Executable Storage)',
    targetEndpoint: '/api/upload',
    tools: ['Burp Suite', 'Browser Form'],
    objective: 'Upload an arbitrary HTML or SVG file containing executable script payloads to public storage.',
    hint: 'Review what file extensions are permitted by the upload form. Does the backend restrict uploaded file types or validate MIME content?',
    remediationSnippet: `// Remediate with extension allowlists & content-type checking:\nconst ALLOWED = ['.jpg', '.png', '.pdf'];\nif (!ALLOWED.includes(path.extname(filename).toLowerCase())) throw new Error('Invalid file type');`,
  },
  {
    id: 'CN-FILE-02',
    category: 'File Handling',
    name: 'Path Traversal (Arbitrary File Retrieval)',
    targetEndpoint: '/api/download?file=...',
    tools: ['curl', 'Burp Repeater', 'Browser URL'],
    objective: 'Traverse out of the uploads directory to read sensitive configuration files (e.g. database/cybernex_backup.sql).',
    hint: 'The download endpoint takes a "file" parameter. What happens when relative directory traversal sequences (../../) are appended?',
    remediationSnippet: `// Remediate by sanitizing base filename and enforcing path containment:\nconst safeName = path.basename(filename);\nconst target = path.resolve(UPLOAD_DIR, safeName);\nif (!target.startsWith(UPLOAD_DIR)) throw new Error('Access denied');`,
  },
  {
    id: 'CN-CSRF-01',
    category: 'Session & State',
    name: 'Cross-Site Request Forgery (Profile Mutation)',
    targetEndpoint: '/api/user/update',
    tools: ['Burp CSRF PoC Generator', 'HTML PoC file'],
    objective: 'Force an authenticated operator into executing unintended state-changing profile or clearance modifications.',
    hint: 'Check whether the update endpoint validates any CSRF tokens or checks Origin / Referer headers, and verify cookie SameSite attributes.',
    remediationSnippet: `// Remediate by verifying CSRF tokens and SameSite cookies:\nresponse.cookies.set('token', val, { sameSite: 'lax', httpOnly: true, secure: true });`,
  },
  {
    id: 'CN-MISC-01',
    category: 'Business Logic',
    name: 'Computational Credit Negative Balance Exploitation',
    targetEndpoint: '/api/transfer-credits',
    tools: ['Burp Repeater', 'DevTools Network Tab'],
    objective: 'Artificially inflate your SecOps computational credit quota by transferring a negative integer amount.',
    hint: 'Inspect how the credit transfer route verifies the amount integer. Does it ensure amount > 0?',
    remediationSnippet: `// Remediate with validation check:\nif (amount <= 0) return NextResponse.json({ error: 'Transfer amount must be positive' }, { status: 400 });`,
  },
];

export default function LabGuidePage() {
  const [openHints, setOpenHints] = useState<Record<string, boolean>>({});
  const [openRemediation, setOpenRemediation] = useState<Record<string, boolean>>({});
  const [filterCategory, setFilterCategory] = useState<string>('All');

  const toggleHint = (id: string) => {
    setOpenHints((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleRemediation = (id: string) => {
    setOpenRemediation((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const categories = ['All', ...Array.from(new Set(OBJECTIVES.map((o) => o.category)))];

  const filtered = filterCategory === 'All'
    ? OBJECTIVES
    : OBJECTIVES.filter((o) => o.category === filterCategory);

  return (
    <div className="space-y-8 pb-12">
      {/* Tactical Hero Header */}
      <div className="bg-[#070b13] border border-[#152033] p-6 sm:p-8 tactical-cut relative shadow-2xl">
        <span className="absolute top-2 left-2 text-[10px] font-mono text-cyan-400/60">+</span>
        <span className="absolute bottom-2 right-2 text-[10px] font-mono text-cyan-400/60">+</span>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-3xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 tactical-cut-sm bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-bold">
              <Radio className="w-3.5 h-3.5 animate-pulse" />
              <span>DEFENSIVE & OFFENSIVE SYLLABUS BRIEFING</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold uppercase tracking-wider text-white">
              CYBERNEX PENTESTING SYLLABUS
            </h1>
            <p className="text-xs font-mono text-cyan-400 font-bold tracking-widest uppercase">
              SECURE TODAY. EMPOWER TOMORROW. — MISSION MATRIX
            </p>
            <p className="text-xs text-slate-300 leading-relaxed font-sans">
              Welcome to the CyberNex penetration-testing operations academy. This environment intentionally embeds real-world OWASP Top 10 vulnerabilities within an authentic SecOps architecture. Execute discovery, exploitation, and code-level remediation across all indexed challenges.
            </p>
          </div>

          <div className="w-20 h-20 bg-[#030508] border border-cyan-500/40 p-1 flex items-center justify-center tactical-cut shrink-0 shadow-[0_0_20px_rgba(0,242,254,0.25)]">
            <img src="/cybernex-logo.png" alt="CyberNex" className="w-full h-full object-cover" />
          </div>
        </div>

        {/* Quick Synthetic Personnel Table */}
        <div className="mt-6 pt-5 border-t border-[#152033] grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs font-mono">
          <div className="p-3 bg-[#030508] border border-[#152033] tactical-cut-sm">
            <span className="text-slate-500 text-[10px] uppercase block">TIER 1 ADMINISTRATOR</span>
            <span className="text-rose-400 font-bold">admin</span> / <span className="text-slate-300">AdminPassword2026!</span>
          </div>
          <div className="p-3 bg-[#030508] border border-[#152033] tactical-cut-sm">
            <span className="text-slate-500 text-[10px] uppercase block">TIER 2 SENIOR ANALYST</span>
            <span className="text-cyan-400 font-bold">alice</span> / <span className="text-slate-300">alice_hunter2</span>
          </div>
          <div className="p-3 bg-[#030508] border border-[#152033] tactical-cut-sm">
            <span className="text-slate-500 text-[10px] uppercase block">TIER 3 OPERATOR</span>
            <span className="text-slate-300 font-bold">bob</span> / <span className="text-slate-300">bobpassword123</span>
          </div>
          <div className="p-3 bg-[#030508] border border-amber-500/30 text-amber-300 tactical-cut-sm flex flex-col justify-center">
            <span className="text-amber-500/70 text-[10px] uppercase block">DATABASE STATE RESTORE</span>
            <span className="font-bold">npm run reset-db</span>
          </div>
        </div>
      </div>

      {/* Recommended 16-Step Pentesting Workflow */}
      <div className="bg-[#070b13] border border-[#152033] p-6 tactical-cut shadow-xl">
        <h2 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2 mb-4">
          <Compass className="w-4 h-4 text-cyan-400" />
          <span>STANDARDIZED 16-STAGE SECURITY AUDITING CYCLE</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 text-xs font-mono">
          {[
            '01. Reconnaissance (robots.txt, headers)',
            '02. Route & Directory Discovery',
            '03. Operator Gate Analysis',
            '04. Authentication & Enumeration',
            '05. Session Token Hijacking & Tampering',
            '06. SQL Injection Discovery (UNION)',
            '07. Reflected & Stored XSS Sinks',
            '08. DOM-based XSS Execution',
            '09. IDOR Object References',
            '10. Privilege Elevation (Mass Assign)',
            '11. CSRF Attack Reproduction',
            '12. Unrestricted File Ingestion',
            '13. Path & Directory Traversal (../)',
            '14. Business Logic Flaw Analysis',
            '15. Source Code Patch Formulation',
            '16. Retesting & Patch Verification',
          ].map((step, idx) => (
            <div
              key={idx}
              className="p-2.5 bg-[#030508] border border-[#152033] text-slate-300 flex items-center gap-2 tactical-cut-sm"
            >
              <CheckCircle className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span className="text-[11px] truncate">{step}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Category Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 font-mono text-xs">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setFilterCategory(cat)}
            className={`px-3.5 py-2 uppercase tracking-wider tactical-cut-sm border transition-all cursor-pointer whitespace-nowrap ${
              filterCategory === cat
                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400 shadow-[0_0_15px_rgba(0,242,254,0.3)] font-bold'
                : 'bg-[#070b13] border-[#152033] text-slate-400 hover:text-white hover:border-slate-500'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Objectives Matrix */}
      <div className="space-y-4">
        {filtered.map((item) => {
          const isHintOpen = !!openHints[item.id];
          const isRemOpen = !!openRemediation[item.id];

          return (
            <div
              key={item.id}
              className="bg-[#070b13] border border-[#152033] tactical-cut p-5 sm:p-6 hover:border-cyan-500/40 transition-all shadow-xl"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3.5 border-b border-[#152033]">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs px-2.5 py-1 tactical-cut-sm bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 font-bold">
                    {item.id}
                  </span>
                  <h3 className="font-bold text-sm text-white uppercase tracking-wider">{item.name}</h3>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-mono text-slate-400 bg-[#030508] px-2.5 py-1 tactical-cut-sm border border-[#152033]">
                    ENDPOINT: {item.targetEndpoint}
                  </span>
                </div>
              </div>

              {/* Objective Description */}
              <div className="mt-3.5 text-xs text-slate-300 leading-relaxed font-sans">
                <strong className="text-white font-mono uppercase text-[11px] mr-1.5">[MISSION OBJECTIVE]:</strong>
                {item.objective}
              </div>

              {/* Tools recommendation */}
              <div className="mt-3 flex items-center gap-2 text-xs">
                <span className="text-slate-500 font-mono text-[10px] uppercase">AUDIT TOOLING:</span>
                <div className="flex gap-1.5 flex-wrap">
                  {item.tools.map((t, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 tactical-cut-sm bg-[#030508] border border-[#1e293b] text-slate-300 font-mono text-[10px]"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>

              {/* Progressive Hints & Remediation Accordions */}
              <div className="mt-4 pt-3.5 border-t border-[#152033] flex flex-wrap gap-4 font-mono text-xs">
                <button
                  onClick={() => toggleHint(item.id)}
                  className="inline-flex items-center gap-1.5 text-amber-400 hover:text-amber-300 transition-colors cursor-pointer uppercase font-bold"
                >
                  {isHintOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                  <span>{isHintOpen ? 'COLLAPSE INTEL CLUE' : 'DECRYPT INTEL CLUE'}</span>
                </button>

                <button
                  onClick={() => toggleRemediation(item.id)}
                  className="inline-flex items-center gap-1.5 text-emerald-400 hover:text-emerald-300 transition-colors cursor-pointer uppercase font-bold"
                >
                  {isRemOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                  <span>{isRemOpen ? 'HIDE REMEDIATION PATCH' : 'VIEW CODE REMEDIATION DIFF'}</span>
                </button>
              </div>

              {/* Hint Reveal Box */}
              {isHintOpen && (
                <div className="mt-3.5 p-3.5 bg-amber-950/20 border border-amber-500/40 text-amber-200 text-xs font-mono leading-relaxed tactical-cut-sm">
                  <span className="text-amber-400 font-bold block mb-1 uppercase tracking-wider text-[11px]">
                    [TACTICAL INVESTIGATION CLUE]:
                  </span>
                  {item.hint}
                </div>
              )}

              {/* Remediation Patch Code Box */}
              {isRemOpen && (
                <div className="mt-3.5 p-4 bg-[#030508] border border-emerald-500/40 text-xs font-mono overflow-x-auto tactical-cut-sm shadow-xl">
                  <span className="text-emerald-400 font-bold block mb-2 uppercase tracking-wider text-[11px]">
                    // SUGGESTED DEFENSIVE SOURCE PATCH
                  </span>
                  <pre className="text-slate-300 text-[11px] leading-relaxed">
                    {item.remediationSnippet}
                  </pre>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
