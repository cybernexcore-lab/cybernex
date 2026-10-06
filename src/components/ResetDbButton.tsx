'use client';

import { useState } from 'react';
import { RotateCcw } from 'lucide-react';

export default function ResetDbButton() {
  const [loading, setLoading] = useState(false);

  const handleReset = async () => {
    if (!confirm('Reset the CyberNex training database back to default seed data?')) {
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/reset-db', { method: 'POST' });
      const data = await res.json();
      alert(data.message || 'Database reset successfully!');
      window.location.reload();
    } catch (err: any) {
      alert('Error resetting database: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleReset}
      disabled={loading}
      className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-mono font-medium rounded border border-amber-500/40 text-amber-400 bg-amber-500/10 hover:bg-amber-500/20 transition-all cursor-pointer"
      title="Restores test accounts and incidents"
    >
      <RotateCcw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
      <span>{loading ? 'Resetting...' : 'Reset Lab DB'}</span>
    </button>
  );
}
