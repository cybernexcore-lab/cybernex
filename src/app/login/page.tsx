'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Shield, ArrowRight, AlertTriangle, Terminal, KeyRound, Radio, Cpu, Lock } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [queryError, setQueryError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const redirectUrl = searchParams.get('redirect') || searchParams.get('next') || '/dashboard';
  const feedbackMsg = searchParams.get('msg');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setQueryError(null);
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username,
          password,
          redirect: redirectUrl,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        // CN-MISC-01: Open Redirect vulnerability
        if (data.redirect && (data.redirect.startsWith('http://') || data.redirect.startsWith('https://'))) {
          window.location.href = data.redirect;
        } else {
          router.push(data.redirect || '/dashboard');
          router.refresh();
        }
      } else {
        // CN-AUTH-02: Username enumeration (different error messages)
        setError(data.error || 'Authentication rejected by security matrix');
        if (data.query) {
          // CN-SEC-02: Database query leak
          setQueryError(`SQL Concatenation: ${data.query}`);
        }
      }
    } catch (err: any) {
      setError('Telemetry link failure: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const setPresetUser = (user: string, pass: string) => {
    setUsername(user);
    setPassword(pass);
  };

  return (
    <div className="max-w-6xl mx-auto py-4">
      {/* Top Banner Tagline */}
      <div className="flex items-center justify-between pb-6 mb-8 border-b border-[#152033]">
        <div className="flex items-center gap-3">
          <div className="w-2.5 h-2.5 bg-red-500 shadow-[0_0_10px_#ff003c] animate-pulse" />
          <span className="font-mono text-xs uppercase tracking-widest text-slate-400">
            SEC//OPS OPERATOR ACCESS GATEWAY — SECTOR 07
          </span>
        </div>
        <div className="hidden sm:flex items-center gap-2 font-mono text-[11px] text-slate-500">
          <span>PORT: 3000</span>
          <span>|</span>
          <span className="text-cyan-400">ENCRYPTION: HARDENED</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Side: Military-Grade Tactical Mission Telemetry */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-6 bg-[#070b13] border border-[#152033] tactical-cut-tl-br relative shadow-2xl">
            {/* Corner Crosshairs */}
            <span className="absolute top-2 left-2 text-[10px] font-mono text-cyan-400/60">+</span>
            <span className="absolute bottom-2 right-2 text-[10px] font-mono text-cyan-400/60">+</span>

            <div className="flex items-center gap-2 text-cyan-400 text-xs font-mono font-bold tracking-wider uppercase mb-3">
              <Radio className="w-3.5 h-3.5 animate-pulse" />
              <span>TERMINAL TELEMETRY FEED</span>
            </div>

            <h2 className="text-2xl font-bold uppercase tracking-wider text-white mb-2">
              CyberNex Grid
            </h2>
            <p className="text-xs text-slate-400 leading-relaxed font-sans mb-4">
              Defensive command and penetration-testing training grounds. Authenticate clearance tokens to access live incident matrices, threat lookup consoles, and cryptographic ledger assets.
            </p>

            <div className="space-y-2 font-mono text-[11px] bg-[#030508] p-3.5 border border-[#152033] text-slate-400">
              <div className="flex justify-between border-b border-[#152033]/60 pb-1.5">
                <span className="text-slate-500">NODE STATUS:</span>
                <span className="text-emerald-400 font-bold">ONLINE [SYNCED]</span>
              </div>
              <div className="flex justify-between border-b border-[#152033]/60 pb-1.5">
                <span className="text-slate-500">CLEARANCE GATE:</span>
                <span className="text-cyan-400">TIER-1 TO TIER-3</span>
              </div>
              <div className="flex justify-between border-b border-[#152033]/60 pb-1.5">
                <span className="text-slate-500">AUTH PROTOCOL:</span>
                <span className="text-amber-400">SESSION TOKEN / RAW SQL</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">LAB TARGET:</span>
                <span className="text-white">LOCALHOST SEC-OPS</span>
              </div>
            </div>
          </div>

          {/* Quick-Fill Seed Operator Cartridges */}
          <div className="p-5 bg-[#070b13] border border-[#152033] tactical-cut relative">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                <Cpu className="w-3.5 h-3.5 text-cyan-400" />
                <span>RAPID CARTRIDGE LOADER</span>
              </span>
              <span className="text-[10px] font-mono text-slate-500">SYNTHETIC PROFILES</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setPresetUser('admin', 'AdminPassword2026!')}
                className="px-3 py-2 bg-[#0a0f1d] hover:bg-rose-950/40 border border-rose-500/30 hover:border-rose-400 text-left transition-all cursor-pointer tactical-cut-sm group"
              >
                <div className="text-[10px] font-mono text-rose-400 font-bold">#01 ADMIN</div>
                <div className="text-xs text-white font-semibold">Vance (CISO)</div>
                <div className="text-[9px] font-mono text-slate-500 mt-1">Tier 1 Clearance</div>
              </button>

              <button
                type="button"
                onClick={() => setPresetUser('alice', 'alice_hunter2')}
                className="px-3 py-2 bg-[#0a0f1d] hover:bg-cyan-950/40 border border-cyan-500/30 hover:border-cyan-400 text-left transition-all cursor-pointer tactical-cut-sm group"
              >
                <div className="text-[10px] font-mono text-cyan-400 font-bold">#02 ALICE</div>
                <div className="text-xs text-white font-semibold">Chen (SOC)</div>
                <div className="text-[9px] font-mono text-slate-500 mt-1">Tier 2 Analyst</div>
              </button>

              <button
                type="button"
                onClick={() => setPresetUser('bob', 'bobpassword123')}
                className="px-3 py-2 bg-[#0a0f1d] hover:bg-slate-800/60 border border-slate-700 hover:border-slate-400 text-left transition-all cursor-pointer tactical-cut-sm group"
              >
                <div className="text-[10px] font-mono text-slate-400 font-bold">#03 BOB</div>
                <div className="text-xs text-white font-semibold">Miller (Ops)</div>
                <div className="text-[9px] font-mono text-slate-500 mt-1">Tier 3 Operator</div>
              </button>
            </div>

            {/* Quick SQL Bypass Hint button */}
            <div className="mt-3 pt-3 border-t border-[#152033] flex items-center justify-between">
              <span className="text-[10px] font-mono text-slate-500">CN-AUTH-01 EXPLOIT:</span>
              <button
                type="button"
                onClick={() => setPresetUser("admin' --", "anything")}
                className="text-[10px] font-mono px-2 py-0.5 border border-cyan-500/40 text-cyan-400 hover:bg-cyan-500/10 transition-colors"
                title="Bypass password verification using SQL injection"
              >
                Inject Payload: admin&apos; --
              </button>
            </div>
          </div>
        </div>

        {/* Right Side: The Operator Gate Authentication Form */}
        <div className="lg:col-span-7">
          <div className="bg-[#070b13] border border-[#152033] p-7 sm:p-9 shadow-2xl relative tactical-cut">
            {/* Ambient Corner Accent */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 blur-2xl pointer-events-none" />

            {/* Gate Header */}
            <div className="flex items-center justify-between pb-5 mb-6 border-b border-[#152033]">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-[#030508] border border-cyan-500/40 flex items-center justify-center tactical-cut-sm shadow-[0_0_15px_rgba(0,242,254,0.2)]">
                  <img src="/cybernex-logo.png" alt="CyberNex" className="w-10 h-10 object-cover" />
                </div>
                <div>
                  <h1 className="text-xl font-bold uppercase tracking-wider text-white flex items-center gap-2">
                    <span>OPERATOR CREDENTIAL GATE</span>
                  </h1>
                  <p className="text-[11px] font-mono text-slate-400 mt-0.5">
                    AUTHENTICATE CIPHER TO ACCESS TELEMETRY STREAM
                  </p>
                </div>
              </div>
              <div className="hidden sm:block text-right">
                <span className="inline-block px-2 py-0.5 border border-cyan-500/40 bg-cyan-500/10 text-cyan-300 text-[10px] font-mono font-bold uppercase">
                  GATE // 01
                </span>
              </div>
            </div>

            {/* Reflected Feedback Message (CN-XSS-01 / Notice) */}
            {feedbackMsg && (
              <div
                className="mb-5 p-3.5 bg-cyan-950/40 border border-cyan-500/50 text-cyan-200 text-xs font-mono flex items-center gap-2"
                dangerouslySetInnerHTML={{ __html: feedbackMsg }}
              />
            )}

            {/* Error Telemetry Banner */}
            {error && (
              <div className="mb-5 p-4 bg-rose-950/40 border border-rose-500/50 text-rose-300 text-xs font-mono flex items-start gap-3">
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <div className="break-all">
                  <p className="font-semibold uppercase tracking-wider">{error}</p>
                  {queryError && (
                    <p className="mt-1.5 text-[11px] text-rose-400/90 font-mono bg-[#030508] p-2 border border-rose-900/60">
                      {queryError}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Authentication Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="flex items-center justify-between text-xs font-mono uppercase text-slate-300 mb-2" htmlFor="username">
                  <span>Operator Identity Handle</span>
                  <span className="text-[10px] text-slate-500">ID // USERNAME</span>
                </label>
                <div className="relative">
                  <input
                    id="username"
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter operator handle..."
                    className="w-full bg-[#030508] border border-[#1e293b] px-4 py-3 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-400 font-mono transition-colors tactical-cut-sm"
                  />
                  <Terminal className="w-4 h-4 text-slate-500 absolute right-3.5 top-3.5 pointer-events-none" />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-mono uppercase text-slate-300" htmlFor="password">
                    Cryptographic Passkey
                  </label>
                  <Link
                    href="/forgot-password"
                    className="text-xs font-mono text-cyan-400 hover:text-cyan-300 uppercase tracking-wider underline decoration-cyan-500/40 transition-colors"
                  >
                    Passkey Recovery &gt;
                  </Link>
                </div>
                <div className="relative">
                  <input
                    id="password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••••••"
                    className="w-full bg-[#030508] border border-[#1e293b] px-4 py-3 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-400 font-mono transition-colors tactical-cut-sm"
                  />
                  <KeyRound className="w-4 h-4 text-slate-500 absolute right-3.5 top-3.5 pointer-events-none" />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full tactical-btn tactical-btn-cyan text-sm py-3.5 flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_20px_rgba(0,242,254,0.25)]"
                >
                  <Lock className="w-4 h-4" />
                  <span>{loading ? 'AUTHENTICATING TOKEN...' : 'VERIFY OPERATOR CLEARANCE'}</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </button>
              </div>
            </form>

            <div className="mt-8 pt-5 border-t border-[#152033] flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] font-mono text-slate-500">
              <span>CYBERNEX LAB ENVIRONMENT</span>
              <span className="text-slate-400">UNAUTHORIZED ATTEMPTS TELEMETERED</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
