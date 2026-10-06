'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Lock, Shield, ArrowRight, AlertTriangle, Info } from 'lucide-react';

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
        // Open Redirect vulnerability: blindly navigates to data.redirect
        if (data.redirect.startsWith('http://') || data.redirect.startsWith('https://')) {
          window.location.href = data.redirect;
        } else {
          router.push(data.redirect || '/dashboard');
          router.refresh();
        }
      } else {
        setError(data.error || 'Authentication rejected');
        if (data.query) {
          setQueryError(`Query: ${data.query}`);
        }
      }
    } catch (err: any) {
      setError('Network communication failed: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-160px)] px-4">
      <div className="w-full max-w-md bg-[#111625] border border-slate-800 rounded-2xl p-8 shadow-2xl relative overflow-hidden">
        {/* Glow Accent */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-20 h-20 mx-auto rounded-2xl overflow-hidden border border-cyan-500/40 bg-slate-950 flex items-center justify-center shadow-[0_0_25px_rgba(0,242,254,0.35)] mb-3 p-1">
            <img src="/cybernex-logo.png" alt="CyberNex" className="w-full h-full object-cover rounded-xl" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center justify-center gap-1.5">
            <span>Cyber</span><span className="text-cyan-400">Nex</span>
            <span className="text-xs font-mono uppercase px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 ml-1">Gate</span>
          </h1>
          <p className="text-[11px] font-mono tracking-wider uppercase text-cyan-400/90 mt-1 font-semibold">
            Secure Today. Empower Tomorrow.
          </p>
          <p className="text-xs text-slate-400 mt-2">
            Authenticate operator credentials to enter defensive telemetry grid
          </p>
        </div>

        {/* Reflected Feedback Message */}
        {feedbackMsg && (
          <div
            className="mb-5 p-3 rounded-lg bg-cyan-950/60 border border-cyan-500/40 text-cyan-200 text-xs font-mono flex items-center gap-2"
            dangerouslySetInnerHTML={{ __html: feedbackMsg }}
          />
        )}

        {/* Error Banners */}
        {error && (
          <div className="mb-5 p-3.5 rounded-lg bg-rose-950/40 border border-rose-500/40 text-rose-300 text-xs font-mono flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <div className="break-all">
              <p>{error}</p>
              {queryError && (
                <p className="mt-1 text-[11px] text-rose-400/80 font-mono">{queryError}</p>
              )}
            </div>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5" htmlFor="username">
              Operator Handle / ID
            </label>
            <input
              id="username"
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g. admin or alice"
              className="w-full bg-[#0b1120] border border-slate-700/80 rounded-lg px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 font-mono transition-all"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-medium text-slate-300" htmlFor="password">
                Access Passkey
              </label>
              <Link
                href="/forgot-password"
                className="text-xs text-cyan-400 hover:text-cyan-300 transition-colors"
              >
                Forgot Passkey?
              </Link>
            </div>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full bg-[#0b1120] border border-slate-700/80 rounded-lg px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 font-mono transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-2.5 px-4 bg-gradient-to-r from-cyan-400 to-blue-600 hover:from-cyan-300 hover:to-blue-500 text-slate-950 font-semibold text-sm rounded-lg flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(0,242,254,0.25)] hover:shadow-[0_0_25px_rgba(0,242,254,0.4)] transition-all cursor-pointer disabled:opacity-50"
          >
            <span>{loading ? 'Authenticating...' : 'Authenticate Operator'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Footer info */}
        <div className="mt-8 pt-5 border-t border-slate-800 text-center text-xs text-slate-500">
          <p>Confidential educational lab environment.</p>
          <p className="mt-1 font-mono text-slate-400">
            Available seed accounts: <span className="text-cyan-400">admin, alice, bob</span>
          </p>
        </div>
      </div>
    </div>
  );
}
