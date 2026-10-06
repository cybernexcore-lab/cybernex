'use client';

import { useState } from 'react';
import Link from 'next/link';
import { KeyRound, ArrowRight, CheckCircle2, AlertTriangle, ArrowLeft, ShieldCheck, Terminal, Cpu } from 'lucide-react';

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
        // CN-MISC-02: Leaked reset token
        if (data._debug_token) {
          setDebugTokenLeak(data._debug_token);
        }
        setStep(2);
      } else {
        setError(data.error || 'Operator record not indexed in defensive directory');
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
        setSuccess('Cryptographic passkey rotated successfully. Operator clearance reinstated.');
        setStep(4);
      } else {
        setError(data.error || 'Passkey rotation rejected');
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-220px)] px-4">
      <div className="w-full max-w-lg bg-[#070b13] border border-[#152033] tactical-cut p-8 sm:p-9 shadow-2xl relative">
        {/* Tactical Header */}
        <div className="flex items-center justify-between pb-5 mb-6 border-b border-[#152033]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#030508] border border-amber-500/40 flex items-center justify-center tactical-cut-sm shadow-[0_0_15px_rgba(255,184,0,0.2)]">
              <KeyRound className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h1 className="text-lg font-bold uppercase tracking-wider text-white">
                PASSKEY RECOVERY PROTOCOL
              </h1>
              <p className="text-[11px] font-mono text-slate-400 mt-0.5">
                DEFENSIVE IDENTITY CHALLENGE & TOKEN ROTATION
              </p>
            </div>
          </div>
          <span className="font-mono text-[10px] px-2 py-0.5 border border-amber-500/40 bg-amber-500/10 text-amber-300 font-bold uppercase">
            STEP 0{step} // 03
          </span>
        </div>

        {error && (
          <div className="mb-5 p-3.5 bg-rose-950/40 border border-rose-500/50 text-rose-300 text-xs font-mono flex items-center gap-2.5">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            <span className="break-all">{error}</span>
          </div>
        )}

        {/* Leaked Token Comment / Notice */}
        {debugTokenLeak && step === 2 && (
          <div className="mb-5 p-3 bg-amber-950/30 border border-amber-500/40 text-amber-300 text-xs font-mono flex flex-col gap-1">
            <span className="text-[10px] text-amber-400/70 uppercase tracking-wider">
              [CN-AUTH-03] DEBUG LOG LEAK DETECTED:
            </span>
            <span className="font-bold underline text-amber-200">{debugTokenLeak}</span>
          </div>
        )}

        {/* Step 1: Username */}
        {step === 1 && (
          <form onSubmit={handleFindUser} className="space-y-5">
            <div>
              <label className="flex items-center justify-between text-xs font-mono uppercase text-slate-300 mb-2" htmlFor="forgot-user">
                <span>Target Operator Identifier</span>
                <span className="text-[10px] text-slate-500">HANDLE / ALIAS</span>
              </label>
              <div className="relative">
                <input
                  id="forgot-user"
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. admin or alice"
                  className="w-full bg-[#030508] border border-[#1e293b] px-4 py-3 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-400 font-mono transition-colors tactical-cut-sm"
                />
                <Terminal className="w-4 h-4 text-slate-500 absolute right-3.5 top-3.5 pointer-events-none" />
              </div>
            </div>

            <button
              type="submit"
              className="w-full tactical-btn tactical-btn-cyan text-xs py-3 flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_15px_rgba(0,242,254,0.25)]"
            >
              <span>LOCATE OPERATOR DOSSIER</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* Step 2: Security Question */}
        {step === 2 && (
          <form onSubmit={handleVerifyAnswer} className="space-y-5">
            <div>
              <label className="text-xs font-mono uppercase text-slate-400 block mb-1.5">
                REGISTERED SECURITY CHALLENGE
              </label>
              <div className="p-3 bg-[#030508] border border-cyan-500/30 text-xs font-mono text-cyan-300">
                {securityQuestion}
              </div>
            </div>

            <div>
              <label className="text-xs font-mono uppercase text-slate-300 block mb-1.5" htmlFor="forgot-answer">
                CRYPTOGRAPHIC VERIFICATION ANSWER
              </label>
              <input
                id="forgot-answer"
                type="text"
                required
                value={securityAnswer}
                onChange={(e) => setSecurityAnswer(e.target.value)}
                placeholder="Submit response string..."
                className="w-full bg-[#030508] border border-[#1e293b] px-4 py-3 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-400 font-mono transition-colors tactical-cut-sm"
              />
            </div>

            <button
              type="submit"
              className="w-full tactical-btn tactical-btn-cyan text-xs py-3 flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_15px_rgba(0,242,254,0.25)]"
            >
              <span>VALIDATE IDENTITY RESPONSE</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* Step 3: Token & New Password */}
        {step === 3 && (
          <form onSubmit={handleResetPass} className="space-y-5">
            <div>
              <label className="text-xs font-mono uppercase text-slate-300 block mb-1.5" htmlFor="token-input">
                RECOVERY AUTHORIZATION TOKEN
              </label>
              <input
                id="token-input"
                type="text"
                required
                value={resetToken}
                onChange={(e) => setResetToken(e.target.value)}
                placeholder="e.g. ADM-RESET-7721"
                className="w-full bg-[#030508] border border-[#1e293b] px-4 py-3 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-400 font-mono transition-colors tactical-cut-sm"
              />
            </div>

            <div>
              <label className="text-xs font-mono uppercase text-slate-300 block mb-1.5" htmlFor="new-pass-input">
                PROVISION NEW CIPHER PASSKEY
              </label>
              <input
                id="new-pass-input"
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••••••••••"
                className="w-full bg-[#030508] border border-[#1e293b] px-4 py-3 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-400 font-mono transition-colors tactical-cut-sm"
              />
            </div>

            <button
              type="submit"
              className="w-full tactical-btn tactical-btn-cyan text-xs py-3 flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_15px_rgba(0,242,254,0.25)]"
            >
              <span>COMMIT ROTATED PASSKEY</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* Step 4: Finished */}
        {step === 4 && (
          <div className="text-center space-y-5 py-4">
            <div className="w-14 h-14 bg-emerald-500/10 border border-emerald-500/40 rounded-full flex items-center justify-center mx-auto shadow-[0_0_20px_rgba(0,255,136,0.3)]">
              <CheckCircle2 className="w-8 h-8 text-emerald-400" />
            </div>
            <p className="text-sm font-mono text-emerald-300 font-semibold">{success}</p>
            <Link
              href="/login"
              className="inline-flex tactical-btn tactical-btn-cyan text-xs py-2.5 px-6"
            >
              RETURN TO AUTHENTICATION GATE &rarr;
            </Link>
          </div>
        )}

        <div className="mt-8 pt-5 border-t border-[#152033] flex items-center justify-between text-xs font-mono text-slate-500">
          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 text-slate-400 hover:text-cyan-400 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>BACK TO GATE</span>
          </Link>
          <span>PROTOCOL // 0x4B</span>
        </div>
      </div>
    </div>
  );
}
