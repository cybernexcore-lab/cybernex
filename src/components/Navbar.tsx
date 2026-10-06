'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { ShieldAlert, BookOpen, User as UserIcon, LayoutDashboard, LogOut } from 'lucide-react';
import { User } from '@/lib/auth';

interface NavbarProps {
  user: User | null;
}

export default function Navbar({ user }: NavbarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
    router.refresh();
  };

  const getRoleBadgeClass = (role?: string) => {
    switch (role) {
      case 'admin':
        return 'bg-rose-500/15 text-rose-400 border-rose-500/40';
      case 'analyst':
        return 'bg-blue-500/15 text-blue-400 border-blue-500/40';
      default:
        return 'bg-slate-700/40 text-slate-300 border-slate-600';
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-[#0f1422]/90 backdrop-blur-md border-b border-slate-800 px-6 py-3.5 flex items-center justify-between">
      {/* Brand */}
      <div className="flex items-center gap-3">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-lg overflow-hidden border border-cyan-500/40 bg-slate-950 flex items-center justify-center shadow-[0_0_15px_rgba(0,242,254,0.3)] group-hover:border-cyan-400 transition-all">
            <img src="/cybernex-logo.png" alt="CyberNex Logo" className="w-full h-full object-cover scale-110" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-cyan-400 bg-clip-text text-transparent">
              CyberNex
            </span>
            <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
              SecOps
            </span>
          </div>
        </Link>
      </div>

      {/* Navigation Links */}
      <nav className="flex items-center gap-3 sm:gap-5">
        {user ? (
          <>
            <Link
              href="/dashboard"
              className={`flex items-center gap-1.5 text-xs sm:text-sm font-medium px-3 py-1.5 rounded-md transition-all ${
                pathname === '/dashboard'
                  ? 'text-cyan-400 bg-cyan-500/10 border border-cyan-500/20'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Dashboard</span>
            </Link>

            <Link
              href="/profile"
              className={`flex items-center gap-1.5 text-xs sm:text-sm font-medium px-3 py-1.5 rounded-md transition-all ${
                pathname === '/profile'
                  ? 'text-cyan-400 bg-cyan-500/10 border border-cyan-500/20'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <UserIcon className="w-4 h-4" />
              <span>Account & Profile</span>
            </Link>
          </>
        ) : (
          <Link
            href="/login"
            className={`flex items-center gap-1.5 text-xs sm:text-sm font-medium px-3 py-1.5 rounded-md transition-all ${
              pathname === '/login'
                ? 'text-cyan-400 bg-cyan-500/10 border border-cyan-500/20'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            Operator Login
          </Link>
        )}

        <Link
          href="/lab-guide"
          className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold px-3 py-1.5 rounded-md text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 hover:bg-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.15)] transition-all"
        >
          <BookOpen className="w-4 h-4" />
          <span>Lab Guide & Objectives</span>
        </Link>

        {user && (
          <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
            <div className="hidden sm:flex items-center gap-2 bg-slate-900 border border-slate-800 px-2.5 py-1 rounded-full text-xs">
              <span className="font-mono text-slate-200">@{user.username}</span>
              <span className={`text-[10px] font-mono uppercase px-1.5 py-0.2 rounded border ${getRoleBadgeClass(user.role)}`}>
                {user.role}
              </span>
            </div>

            <button
              onClick={handleLogout}
              className="p-1.5 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-md transition-all cursor-pointer"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}
      </nav>
    </header>
  );
}
