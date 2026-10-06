'use client';

import { useState } from 'react';
import { RotateCcw } from 'lucide-react';

export default function ResetDbButton() {
  const [loading, setLoading] = useState(false);

  const handleReset = async () => {
    if (!confirm('[WARN] Execute emergency restoration of CyberNex database to clean synthetic seed state?')) {
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/reset-db', { method: 'POST' });
      const data = await res.json();
      alert(data.message || 'System telemetry reset successfully!');
      window.location.reload();
    } catch (err: any) {
      alert('Reset sequence failure: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleReset}
      disabled={loading}
      className="inline-flex items-center gap-1.5 px-3 py-1 text-[11px] font-mono uppercase tracking-wider tactical-cut-sm border border-amber-500/40 text-amber-300 bg-amber-500/10 hover:bg-amber-400 hover:text-black transition-all cursor-pointer shadow-[0_0_12px_rgba(255,184,0,0.15)]"
      title="Restores synthetic test accounts and incidents"
    >
      <RotateCcw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
      <span>{loading ? 'RESETTING...' : 'RESET TELEMETRY DB'}</span>
    </button>
  );
}
