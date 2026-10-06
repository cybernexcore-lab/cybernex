import type { Metadata } from 'next';
import './globals.css';
import Navbar from '@/components/Navbar';
import DomXssSink from '@/components/DomXssSink';
import ResetDbButton from '@/components/ResetDbButton';
import { getCurrentUser } from '@/lib/auth';

export const metadata: Metadata = {
  title: 'CYBERNEX // SEC-OPS DEFENSIVE GRID',
  description: 'CyberNex Tactical Cyber-Warfare & Penetration Testing Laboratory',
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getCurrentUser();

  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Chakra+Petch:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased font-sans flex flex-col min-h-screen bg-[#030508] text-slate-100 relative selection:bg-[#ff003c] selection:text-white">
        {/* Ambient CRT Scanline Overlay */}
        <div className="fixed inset-0 pointer-events-none z-50 scanlines-overlay opacity-30" />

        {/* Tactical HUD Header Topline */}
        <div className="bg-[#050811] border-b border-[#152033] px-4 py-1.5 text-[11px] font-mono text-slate-500 flex items-center justify-between z-40 select-none">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 text-cyan-400 font-bold tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping inline-block" />
              GRID://ONLINE
            </span>
            <span className="text-slate-700 hidden sm:inline">|</span>
            <span className="hidden sm:inline text-slate-400">NODE 0x7F-ALPHA [34.0522° N, 118.2437° W]</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-amber-400/90 font-medium hidden md:inline">THREAT LEVEL: DEFCON 3</span>
            <span className="text-slate-700 hidden md:inline">|</span>
            <span className="text-slate-400">
              CLEARANCE: <span className="text-white font-bold">{user ? user.role.toUpperCase() : 'ANONYMOUS'}</span>
            </span>
          </div>
        </div>

        {/* Tactical Navigation Bar */}
        <Navbar user={user} />

        {/* Insecure DOM XSS Telemetry Banner Hook */}
        <DomXssSink />

        {/* Main Content Area */}
        <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
          {children}
        </main>

        {/* Brutalist Tactical Footer */}
        <footer className="border-t border-[#152033] bg-[#050811] px-6 py-5 text-xs text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-2.5 h-2.5 bg-cyan-400 shadow-[0_0_10px_#00f2fe] animate-pulse" />
            <span className="font-mono text-slate-300 font-semibold tracking-wider">
              CYBERNEX TACTICAL SEC-OPS LAB // v2.6.0
            </span>
          </div>

          <div className="flex items-center gap-4">
            <ResetDbButton />
            <span className="text-slate-700 hidden md:inline">|</span>
            <span className="font-mono text-slate-500 text-[11px]">
              CONFIDENTIAL EDUCATIONAL ENVIRONMENT
            </span>
          </div>
        </footer>
      </body>
    </html>
  );
}
