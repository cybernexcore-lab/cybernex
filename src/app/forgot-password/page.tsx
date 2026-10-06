'use client';

import { useState } from 'react';
import Link from 'next/link';
import { KeyRound, ArrowRight, CheckCircle2, AlertTriangle, ArrowLeft } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [username, setUsername] = useState('');
  const [securityQuestion, setSecurityQuestion] = useState('');
  const [securityAnswer, setSecurityAnswer] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [debugTokenLeak, setDebugTokenLeak] = useState<string | null>(null);

  const handleFindUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'find_user', username }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSecurityQuestion(data.user.security_question);
        // Vulnerability CN-MISC-02: Leaked reset token
        if (data._debug_token) {
          setDebugTokenLeak(data._debug_token);
        }
        setStep(2);
      } else {
        setError(data.error || 'Operator not found');
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleVerifyAnswer = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'verify_answer', username, answer: securityAnswer }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setResetToken(data.token);
        setStep(3);
      } else {
        setError(data.error || 'Security verification failed');
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleResetPass = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'reset_pass',
          username,
          token: resetToken,
          new_password: newPassword,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSuccess('Passkey successfully reset! You can now log in.');
        setStep(4);
      } else {
        setError(data.error || 'Reset failed');
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-160px)] px-4">
      <div className="w-full max-w-md bg-[#111625] border border-slate-800 rounded-2xl p-8 shadow-2xl relative">
        <div className="text-center mb-6">
          <div className="w-12 h-12 mx-auto rounded-xl bg-gradient-to-br from-amber-400 to-rose-600 flex items-center justify-center shadow-[0_0_20px_rgba(245,158,11,0.25)] mb-4">
            <KeyRound className="w-6 h-6 text-slate-950" />
          </div>
          <h1 className="text-xl font-bold text-white">Passkey Recovery Gate</h1>
          <p className="text-xs text-slate-400 mt-1">
            Defensive identity challenge and clearance reset
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-rose-950/40 border border-rose-500/40 text-rose-300 text-xs font-mono flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Leaked Token Comment / Notice */}
        {debugTokenLeak && step === 2 && (
          <div className="mb-4 p-2.5 rounded bg-amber-950/40 border border-amber-500/30 text-amber-300 text-[11px] font-mono">
            {/* Vulnerability CN-MISC-02: Debug Token Leak */}
            <span className="text-slate-400">DEBUG_TOKEN_EXPOSED: </span>
            <span className="font-bold underline">{debugTokenLeak}</span>
          </div>
        )}

        {/* Step 1: Username */}
        {step === 1 && (
          <form onSubmit={handleFindUser} className="space-y-4">
            <div>
              <label className="block text-xs text-slate-300 mb-1" htmlFor="forgot-user">
                Operator Handle / ID
              </label>
              <input
                id="forgot-user"
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. admin or alice"
                className="w-full bg-[#0b1120] border border-slate-700 rounded-lg px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-400 font-mono"
              />
            </div>
            <button
              type="submit"
              className="w-full py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold text-xs rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Locate Identity Dossier</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* Step 2: Security Question */}
        {step === 2 && (
          <form onSubmit={handleVerifyAnswer} className="space-y-4">
            <div>
              <label className="block text-xs text-slate-300 mb-1">Assigned Security Challenge</label>
              <div className="p-2.5 bg-[#0b1120] border border-slate-800 rounded-lg text-xs font-mono text-cyan-300">
                {securityQuestion}
              </div>
            </div>

            <div>
              <label className="block text-xs text-slate-300 mb-1" htmlFor="forgot-answer">
                Your Answer
              </label>
              <input
                id="forgot-answer"
                type="text"
                required
                value={securityAnswer}
                onChange={(e) => setSecurityAnswer(e.target.value)}
                placeholder="Enter answer..."
                className="w-full bg-[#0b1120] border border-slate-700 rounded-lg px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-400 font-mono"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold text-xs rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Verify Security Answer</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* Step 3: Token & New Password */}
        {step === 3 && (
          <form onSubmit={handleResetPass} className="space-y-4">
            <div>
              <label className="block text-xs text-slate-300 mb-1" htmlFor="token-input">
                Authorization Reset Token
              </label>
              <input
                id="token-input"
                type="text"
                required
                value={resetToken}
                onChange={(e) => setResetToken(e.target.value)}
                placeholder="e.g. ADM-RESET-7721"
                className="w-full bg-[#0b1120] border border-slate-700 rounded-lg px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-400 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs text-slate-300 mb-1" htmlFor="new-pass-input">
                New Passkey
              </label>
              <input
                id="new-pass-input"
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-[#0b1120] border border-slate-700 rounded-lg px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-400 font-mono"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-xs rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Commit New Passkey</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* Step 4: Finished */}
        {step === 4 && (
          <div className="text-center space-y-4 py-4">
            <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
            <p className="text-sm font-semibold text-white">{success}</p>
            <Link
              href="/login"
              className="inline-block py-2.5 px-6 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold text-xs rounded-lg transition-colors"
            >
              Return to Login Gate &rarr;
            </Link>
          </div>
        )}

        <div className="mt-6 pt-4 border-t border-slate-800 text-center">
          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-cyan-400 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Authentication</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
