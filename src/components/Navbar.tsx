'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, User as UserIcon, BookOpen, LogOut, Terminal, Volume2, VolumeX, ShieldCheck } from 'lucide-react';
import { User } from '@/lib/auth';

interface NavbarProps {
  user: User | null;
}

export default function Navbar({ user }: NavbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [sfxEnabled, setSfxEnabled] = useState(false);

  // Subtle tactical audio feedback using Web Audio API
  const playTacticalClick = () => {
    if (!sfxEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(800, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(300, audioCtx.currentTime + 0.05);
      gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.05);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.05);
    } catch {}
  };

  const handleLogout = async () => {
    playTacticalClick();
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
    router.refresh();
  };

  const getRoleBadge = (role?: string) => {
    switch (role) {
      case 'admin':
        return {
          label: 'TIER-1 CISO',
          color: 'text-rose-400 border-rose-500/40 bg-rose-500/10',
          dot: 'bg-rose-500 shadow-[0_0_8px_#ff003c]',
        };
      case 'analyst':
        return {
          label: 'TIER-2 ANALYST',
          color: 'text-cyan-400 border-cyan-500/40 bg-cyan-500/10',
          dot: 'bg-cyan-400 shadow-[0_0_8px_#00f2fe]',
        };
      default:
        return {
          label: 'TIER-3 OPERATOR',
          color: 'text-slate-300 border-slate-600 bg-slate-800/40',
          dot: 'bg-slate-400',
        };
    }
  };

  const roleInfo = getRoleBadge(user?.role);

  return (
    <header className="sticky top-0 z-40 bg-[#070b13]/95 backdrop-blur-md border-b border-[#152033] px-4 sm:px-8 py-3 transition-colors">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Tactical Brand */}
        <Link
          href="/"
          onClick={playTacticalClick}
          className="flex items-center gap-3 group select-none"
        >
          <div className="relative w-10 h-10 bg-[#030508] border border-[#243452] p-0.5 group-hover:border-cyan-400 transition-colors flex items-center justify-center tactical-cut-sm shadow-[0_0_15px_rgba(0,242,254,0.15)]">
            <img
              src="/cybernex-logo.png"
              alt="CyberNex Tactical"
              className="w-full h-full object-cover scale-105"
            />
            {/* Tactical Corner Crosshairs */}
            <span className="absolute -top-1 -left-1 text-[9px] font-mono text-cyan-400 opacity-60">+</span>
            <span className="absolute -bottom-1 -right-1 text-[9px] font-mono text-cyan-400 opacity-60">+</span>
          </div>

          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-xl tracking-wider uppercase text-white group-hover:text-cyan-400 transition-colors glitch-hover">
                CYBERNEX
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 border border-cyan-500/40 bg-cyan-500/10 text-cyan-300 tracking-wider">
                SEC//OPS
              </span>
            </div>
            <span className="text-[10px] font-mono text-slate-500 tracking-widest uppercase">
              DEFENSIVE GRID TELEMETRY
            </span>
          </div>
        </Link>

        {/* Navigation Actions */}
        <nav className="flex items-center gap-2 sm:gap-3">
          {user ? (
            <>
              <Link
                href="/dashboard"
                onClick={playTacticalClick}
                className={`flex items-center gap-2 text-xs font-mono uppercase px-3.5 py-2 tracking-wider transition-all tactical-cut-sm border ${
                  pathname === '/dashboard'
                    ? 'bg-cyan-500/15 border-cyan-400 text-cyan-300 shadow-[0_0_15px_rgba(0,242,254,0.25)]'
                    : 'bg-[#0b1120] border-[#152033] text-slate-400 hover:text-white hover:border-slate-500'
                }`}
              >
                <LayoutDashboard className="w-3.5 h-3.5 text-cyan-400" />
                <span className="hidden md:inline">Command Dashboard</span>
                <span className="md:hidden">Dashboard</span>
              </Link>

              <Link
                href="/profile"
                onClick={playTacticalClick}
                className={`flex items-center gap-2 text-xs font-mono uppercase px-3.5 py-2 tracking-wider transition-all tactical-cut-sm border ${
                  pathname === '/profile'
                    ? 'bg-cyan-500/15 border-cyan-400 text-cyan-300 shadow-[0_0_15px_rgba(0,242,254,0.25)]'
                    : 'bg-[#0b1120] border-[#152033] text-slate-400 hover:text-white hover:border-slate-500'
                }`}
              >
                <UserIcon className="w-3.5 h-3.5 text-cyan-400" />
                <span className="hidden md:inline">Agent Dossier</span>
                <span className="md:hidden">Profile</span>
              </Link>
            </>
          ) : (
            <Link
              href="/login"
              onClick={playTacticalClick}
              className={`flex items-center gap-2 text-xs font-mono uppercase px-3.5 py-2 tracking-wider transition-all tactical-cut-sm border ${
                pathname === '/login'
                  ? 'bg-cyan-500/15 border-cyan-400 text-cyan-300 shadow-[0_0_15px_rgba(0,242,254,0.25)]'
                  : 'bg-[#0b1120] border-[#152033] text-slate-400 hover:text-white hover:border-slate-500'
              }`}
            >
              <Terminal className="w-3.5 h-3.5 text-cyan-400" />
              <span>Operator Gate</span>
            </Link>
          )}

          <Link
            href="/lab-guide"
            onClick={playTacticalClick}
            className={`flex items-center gap-2 text-xs font-mono uppercase px-3.5 py-2 tracking-wider transition-all tactical-cut-sm border font-bold ${
              pathname === '/lab-guide'
                ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300 shadow-[0_0_20px_rgba(0,255,136,0.3)]'
                : 'bg-emerald-950/30 border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/20'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Tactical Lab Syllabus</span>
            <span className="sm:hidden">Syllabus</span>
          </Link>

          {/* Audio FX Toggle */}
          <button
            onClick={() => {
              setSfxEnabled(!sfxEnabled);
              if (!sfxEnabled) {
                setTimeout(playTacticalClick, 50);
              }
            }}
            className={`p-2 border tactical-cut-sm transition-colors cursor-pointer ${
              sfxEnabled
                ? 'border-cyan-500/50 bg-cyan-500/10 text-cyan-400'
                : 'border-[#152033] bg-[#0b1120] text-slate-600 hover:text-slate-400'
            }`}
            title={sfxEnabled ? 'Tactical SFX: ENABLED' : 'Tactical SFX: MUTED'}
          >
            {sfxEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
          </button>

          {/* User Status Ribbon & Logout */}
          {user && (
            <div className="flex items-center gap-2 pl-2 border-l border-[#152033]">
              <div className="hidden lg:flex items-center gap-2 px-2.5 py-1 border tactical-cut-sm bg-[#050811] text-[11px] font-mono">
                <span className={`w-2 h-2 rounded-full ${roleInfo.dot}`} />
                <span className="text-white font-bold uppercase">{user.username}</span>
                <span className={`px-1.5 py-0.5 border text-[10px] uppercase font-bold ${roleInfo.color}`}>
                  {roleInfo.label}
                </span>
              </div>

              <button
                onClick={handleLogout}
                className="p-2 border border-rose-500/30 bg-rose-500/10 text-rose-400 hover:bg-rose-500 hover:text-white transition-all tactical-cut-sm cursor-pointer shadow-[0_0_10px_rgba(255,0,60,0.15)]"
                title="Disconnect Session"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}
