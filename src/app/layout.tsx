import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/Navbar';
import DomXssSink from '@/components/DomXssSink';
import ResetDbButton from '@/components/ResetDbButton';
import { getCurrentUser } from '@/lib/auth';

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
});

const jetbrainsMono = JetBrains_Mono({
  variable: '--font-jetbrains',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'CyberNex SecOps Portal | Enterprise Defensive Grid',
  description: 'CyberNex SecOps Enterprise Threat Operations & Intelligence Portal',
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getCurrentUser();

  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} ${jetbrainsMono.variable} antialiased font-sans flex flex-col min-h-screen bg-[#0a0d14] text-slate-100`}>
        {/* Navigation Bar */}
        <Navbar user={user} />

        {/* Insecure DOM XSS Telemetry Banner Hook */}
        <DomXssSink />

        {/* Main Content Area */}
        <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {children}
        </main>

        {/* Global Footer */}
        <footer className="border-t border-slate-800 bg-[#0f1422] px-6 py-4 text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.8)] animate-pulse" />
            <span className="font-mono text-slate-400">
              CYBERNEX SEC-OPS TELEMETRY GRID v2.4.1 [LOCAL LAB]
            </span>
          </div>

          <div className="flex items-center gap-4">
            <ResetDbButton />
            <span className="text-slate-600 hidden md:inline">|</span>
            <span className="text-slate-400">Educational Pentesting Environment</span>
          </div>
        </footer>
      </body>
    </html>
  );
}
