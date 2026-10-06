'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  ShieldAlert,
  Flame,
  Users,
  Coins,
  Search,
  PlusCircle,
  Terminal,
  Trash2,
  AlertCircle,
  CheckCircle2,
  Radio,
  Cpu,
  Layers,
} from 'lucide-react';
import { Incident, SystemLog } from '@/lib/auth';

export default function DashboardPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const searchQuery = searchParams.get('q') || '';
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [logs, setLogs] = useState<SystemLog[]>([]);
  const [operatorCount, setOperatorCount] = useState(3);
  const [credits, setCredits] = useState(250);
  const [loading, setLoading] = useState(true);
  const [sqlError, setSqlError] = useState<string | null>(null);

  // New incident form states
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Network Anomaly');
  const [severity, setSeverity] = useState<'Low' | 'Medium' | 'High' | 'Critical'>('Medium');
  const [description, setDescription] = useState('');
  const [formMsg, setFormMsg] = useState<string | null>(null);

  // Fetch incidents & system logs
  useEffect(() => {
    async function loadData() {
      setLoading(true);
      setSqlError(null);
      try {
        const incidentsUrl = searchQuery
          ? `/api/incidents?q=${encodeURIComponent(searchQuery)}`
          : '/api/incidents';

        const incRes = await fetch(incidentsUrl);
        const incData = await incRes.json();

        if (incRes.ok && incData.success) {
          setIncidents(incData.incidents || []);
        } else if (incData.error) {
          setSqlError(incData.error);
        }

        const logRes = await fetch('/api/system-logs');
        const logData = await logRes.json();
        if (logData.success) {
          setLogs(logData.system_logs.slice(0, 5));
        }

        // Fetch user data for credits
        const usersRes = await fetch('/api/user/lookup');
        const usersData = await usersRes.json();
        if (usersData.success && usersData.users) {
          setOperatorCount(usersData.users.length);
        }
      } catch (err: any) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [searchQuery]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const q = formData.get('q') as string;
    if (q) {
      router.push(`/dashboard?q=${encodeURIComponent(q)}`);
    } else {
      router.push('/dashboard');
    }
  };

  const handleCreateIncident = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormMsg(null);
    try {
      const res = await fetch('/api/incidents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, category, severity, description }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setFormMsg('Incident telemetry packet broadcast successfully.');
        setTitle('');
        setDescription('');
        const updatedRes = await fetch('/api/incidents');
        const updatedData = await updatedRes.json();
        if (updatedData.success) setIncidents(updatedData.incidents);
      } else {
        setFormMsg('Broadcast rejected: ' + data.error);
      }
    } catch (err: any) {
      setFormMsg('Network protocol fault: ' + err.message);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm(`[AUTHORIZED PURGE] Permanently erase telemetry incident #${id}?`)) return;
    try {
      const res = await fetch(`/api/incidents/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setIncidents((prev) => prev.filter((item) => item.id !== id));
      }
    } catch (err) {
      alert('Delete routine failed');
    }
  };

  const getSeverityBadge = (sev: string) => {
    switch (sev) {
      case 'Critical':
        return 'bg-rose-500/15 text-rose-400 border-rose-500/50 shadow-[0_0_10px_rgba(255,0,60,0.2)]';
      case 'High':
        return 'bg-amber-500/15 text-amber-400 border-amber-500/50 shadow-[0_0_10px_rgba(255,184,0,0.2)]';
      case 'Medium':
        return 'bg-cyan-500/15 text-cyan-400 border-cyan-500/50 shadow-[0_0_10px_rgba(0,242,254,0.2)]';
      default:
        return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/50';
    }
  };

  return (
    <div className="space-y-7">
      {/* Tactical HUD Command Header */}
      <div className="bg-[#070b13] border border-[#152033] p-5 sm:p-6 tactical-cut relative shadow-2xl">
        <span className="absolute top-2 left-2 text-[10px] font-mono text-cyan-400/60">+</span>
        <span className="absolute bottom-2 right-2 text-[10px] font-mono text-cyan-400/60">+</span>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-[#030508] border border-cyan-500/40 p-1 flex items-center justify-center tactical-cut-sm shrink-0 shadow-[0_0_15px_rgba(0,242,254,0.25)]">
              <img src="/cybernex-logo.png" alt="CyberNex" className="w-full h-full object-cover" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-xl sm:text-2xl font-bold uppercase tracking-wider text-white">
                  CYBERNEX COMMAND GRID
                </h1>
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 border border-emerald-500/40 bg-emerald-500/10 text-emerald-400 tracking-wider">
                  DEFENSIVE ACTIVE
                </span>
              </div>
              <p className="text-xs font-mono text-slate-400 mt-1">
                SECURE TODAY. EMPOWER TOMORROW. — TELEMETRY STREAM #127.0.0.1 [SECTOR 07]
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 font-mono text-xs">
            <div className="px-3 py-1.5 border border-[#152033] bg-[#030508] text-slate-400">
              <span className="text-slate-500">CLEARANCE: </span>
              <span className="text-cyan-400 font-bold">OPERATOR VALIDATED</span>
            </div>
            <div className="px-3 py-1.5 border border-rose-500/30 bg-rose-950/20 text-rose-400">
              <span className="text-rose-500">STATUS: </span>
              <span className="font-bold">ELEVATED DEFCON 3</span>
            </div>
          </div>
        </div>
      </div>

      {/* Top 4 Tactical Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="bg-[#070b13] border border-[#152033] hover:border-rose-500/40 p-5 tactical-cut-sm transition-all group">
          <div className="flex items-center justify-between font-mono text-[11px] text-slate-400 uppercase tracking-wider mb-2">
            <span>ACTIVE INCIDENTS</span>
            <span className="px-1.5 py-0.5 border border-rose-500/40 bg-rose-500/10 text-rose-400 text-[10px] font-bold">
              LIVE FEED
            </span>
          </div>
          <div className="text-3xl font-extrabold font-mono text-white tracking-tight group-hover:text-rose-400 transition-colors">
            {incidents.length}
          </div>
          <p className="text-xs font-mono text-slate-500 mt-1">Real-time unmitigated threats</p>
        </div>

        {/* Metric 2 */}
        <div className="bg-[#070b13] border border-[#152033] hover:border-amber-500/40 p-5 tactical-cut-sm transition-all group">
          <div className="flex items-center justify-between font-mono text-[11px] text-slate-400 uppercase tracking-wider mb-2">
            <span>ALERT POSTURE</span>
            <span className="px-1.5 py-0.5 border border-amber-500/40 bg-amber-500/10 text-amber-400 text-[10px] font-bold">
              ELEVATED
            </span>
          </div>
          <div className="text-3xl font-extrabold font-mono text-amber-400 tracking-tight">
            DEFCON 3
          </div>
          <p className="text-xs font-mono text-slate-500 mt-1">Perimeter scan anomaly nominal</p>
        </div>

        {/* Metric 3 */}
        <div className="bg-[#070b13] border border-[#152033] hover:border-cyan-500/40 p-5 tactical-cut-sm transition-all group">
          <div className="flex items-center justify-between font-mono text-[11px] text-slate-400 uppercase tracking-wider mb-2">
            <span>PERSONNEL ROSTER</span>
            <span className="px-1.5 py-0.5 border border-cyan-500/40 bg-cyan-500/10 text-cyan-400 text-[10px] font-bold">
              OPERATIONAL
            </span>
          </div>
          <div className="text-3xl font-extrabold font-mono text-white tracking-tight group-hover:text-cyan-400 transition-colors">
            {operatorCount}
          </div>
          <p className="text-xs font-mono text-slate-500 mt-1">Authorized dossiers on grid</p>
        </div>

        {/* Metric 4 */}
        <div className="bg-[#070b13] border border-[#152033] hover:border-cyan-500/40 p-5 tactical-cut-sm transition-all group">
          <div className="flex items-center justify-between font-mono text-[11px] text-slate-400 uppercase tracking-wider mb-2">
            <span>SECOPS CREDITS</span>
            <span className="px-1.5 py-0.5 border border-cyan-500/40 bg-cyan-500/10 text-cyan-400 text-[10px] font-bold">
              LEDGER
            </span>
          </div>
          <div className="text-3xl font-extrabold font-mono text-cyan-400 tracking-tight">
            {credits} <span className="text-xs text-slate-400 font-normal">PTS</span>
          </div>
          <p className="text-xs font-mono text-slate-500 mt-1">Computational budget balance</p>
        </div>
      </div>

      {/* Threat Search & IOC Telemetry Lookup */}
      <div className="bg-[#070b13] border border-[#152033] p-6 tactical-cut">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold uppercase tracking-wider text-white flex items-center gap-2">
              <Search className="w-4 h-4 text-cyan-400" />
              <span>THREAT INTELLIGENCE & IOC TELEMETRY LOOKUP</span>
            </h2>
            <p className="text-xs font-mono text-slate-400 mt-0.5">
              QUERY DEFENSIVE DATABASE EVENTS, CVE CODES, OR NETWORK INTRUSIONS
            </p>
          </div>

          <form onSubmit={handleSearch} className="flex gap-2 w-full md:w-auto md:min-w-[460px]">
            <input
              type="text"
              name="q"
              defaultValue={searchQuery}
              placeholder="Query keyword (e.g. DNS, SSH, Bastion)..."
              className="flex-1 bg-[#030508] border border-[#1e293b] px-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-400 font-mono tactical-cut-sm"
            />
            <button
              type="submit"
              className="tactical-btn tactical-btn-cyan text-xs py-2 px-4 cursor-pointer"
            >
              QUERY
            </button>
            {searchQuery && (
              <button
                type="button"
                onClick={() => router.push('/dashboard')}
                className="tactical-btn tactical-btn-neutral text-xs py-2 px-3 cursor-pointer"
              >
                RESET
              </button>
            )}
          </form>
        </div>

        {/* Quick Pentest Injection Presets for Students */}
        <div className="mt-4 pt-3 border-t border-[#152033] flex flex-wrap items-center gap-2 text-[10px] font-mono text-slate-500">
          <span className="text-slate-400 font-bold uppercase">QUICK EXPLOIT PAYLOADS:</span>
          <button
            type="button"
            onClick={() => router.push("/dashboard?q=' UNION SELECT 1,username,password,email,5,6,7,8 FROM users--")}
            className="px-2 py-0.5 border border-cyan-500/30 text-cyan-400 bg-cyan-950/20 hover:bg-cyan-500/20 transition-colors cursor-pointer"
          >
            CN-INJ-01: UNION SQLi Users Dump
          </button>
          <button
            type="button"
            onClick={() => router.push("/dashboard?q=<script>alert('REFLECTED_XSS')</script>")}
            className="px-2 py-0.5 border border-rose-500/30 text-rose-400 bg-rose-950/20 hover:bg-rose-500/20 transition-colors cursor-pointer"
          >
            CN-XSS-01: Reflected Script Injection
          </button>
        </div>

        {/* Vulnerability CN-XSS-01: Reflected Cross-Site Scripting in Search Query */}
        {searchQuery && (
          <div className="mt-4 p-3 bg-cyan-950/30 border border-cyan-500/40 text-xs font-mono flex items-center justify-between text-cyan-200">
            <div>
              <span>FILTERED TELEMETRY MATCHING: </span>
              {/* Deliberate Unescaped Query Display */}
              <span
                className="font-bold text-white underline decoration-cyan-400"
                dangerouslySetInnerHTML={{ __html: searchQuery }}
              />
            </div>
            <span className="text-cyan-400 font-bold">[{incidents.length} RECORDS LOCATED]</span>
          </div>
        )}

        {/* Vulnerability CN-SEC-02: Verbose Database Query Error Output */}
        {sqlError && (
          <div className="mt-4 p-4 bg-rose-950/40 border border-rose-500/60 text-rose-300 text-xs font-mono break-all">
            <div className="font-bold uppercase tracking-wider mb-1 text-rose-400">
              DATABASE SYNTAX / EXCEPTION DUMP:
            </div>
            <code>{sqlError}</code>
          </div>
        )}
      </div>

      {/* Main Split: Incidents Table (2 Cols) & Form/Logs (1 Col) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Incidents Table */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase tracking-wider text-white flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-cyan-400" />
              <span>ACTIVE INCIDENT TELEMETRY QUEUE</span>
            </h3>
            <span className="text-[11px] font-mono text-slate-500">
              {incidents.length} TOTAL INVENTORY
            </span>
          </div>

          <div className="border border-[#152033] bg-[#070b13] tactical-cut overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-[#030508] text-slate-400 text-[10px] uppercase tracking-wider border-b border-[#152033]">
                  <tr>
                    <th className="px-4 py-3">REF_ID</th>
                    <th className="px-4 py-3">TELEMETRY_PAYLOAD</th>
                    <th className="px-4 py-3">SEVERITY</th>
                    <th className="px-4 py-3">OPERATOR</th>
                    <th className="px-4 py-3 text-right">ACTION</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#152033]">
                  {incidents.map((item) => (
                    <tr key={item.id} className="hover:bg-[#0b101c] transition-colors">
                      <td className="px-4 py-3 text-slate-500 font-bold">#00{item.id}</td>
                      <td className="px-4 py-3 max-w-sm">
                        {/* Vulnerability CN-XSS-02: Stored Cross-Site Scripting */}
                        <div
                          className="font-bold text-white text-xs mb-1"
                          dangerouslySetInnerHTML={{ __html: item.title }}
                        />
                        <div
                          className="text-[11px] text-slate-400 leading-relaxed font-sans"
                          dangerouslySetInnerHTML={{ __html: item.description }}
                        />
                        <div className="text-[10px] text-slate-500 mt-1 uppercase">
                          SECTOR: {item.category} // STATUS: {item.status}
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span
                          className={`inline-block px-2 py-0.5 text-[10px] font-bold uppercase border tactical-cut-sm ${getSeverityBadge(
                            item.severity
                          )}`}
                        >
                          {item.severity}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-300">
                        @{item.author_username}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {/* Vulnerability CN-AC-02: Missing Authorization Check */}
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="p-1.5 border border-rose-500/30 bg-rose-500/10 text-rose-400 hover:bg-rose-500 hover:text-white transition-colors tactical-cut-sm cursor-pointer"
                          title="Purge Incident Telemetry Record"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {incidents.length === 0 && !loading && (
                    <tr>
                      <td colSpan={5} className="text-center py-10 font-mono text-slate-500">
                        NO TELEMETRY INCIDENTS CORRESPONDING TO QUERY.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right 1 Col: Dispatch Threat Report Form & Terminal Audit Logs */}
        <div className="space-y-6">
          {/* Dispatch Incident Form */}
          <div className="bg-[#070b13] border border-[#152033] p-5 tactical-cut">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2 mb-4">
              <PlusCircle className="w-4 h-4 text-cyan-400" />
              <span>DISPATCH THREAT TELEMETRY</span>
            </h4>

            {formMsg && (
              <div className="mb-4 p-3 bg-cyan-950/40 border border-cyan-500/40 text-[11px] font-mono text-cyan-300">
                {formMsg}
              </div>
            )}

            <form onSubmit={handleCreateIncident} className="space-y-4">
              <div>
                <label className="block text-[11px] font-mono uppercase text-slate-300 mb-1" htmlFor="inc-title">
                  Incident Header Title
                </label>
                <input
                  id="inc-title"
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Unusual Outbound DNS Tunneling"
                  className="w-full bg-[#030508] border border-[#1e293b] px-3 py-2 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-400 font-mono tactical-cut-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-mono uppercase text-slate-300 mb-1" htmlFor="inc-category">
                    Domain / Vector
                  </label>
                  <select
                    id="inc-category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-[#030508] border border-[#1e293b] px-2 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-400 font-mono"
                  >
                    <option value="Network Anomaly">Network Anomaly</option>
                    <option value="Endpoint Drift">Endpoint Drift</option>
                    <option value="Auth Tampering">Auth Tampering</option>
                    <option value="Exfiltration Probe">Exfiltration Probe</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-mono uppercase text-slate-300 mb-1" htmlFor="inc-severity">
                    Severity Tier
                  </label>
                  <select
                    id="inc-severity"
                    value={severity}
                    onChange={(e) => setSeverity(e.target.value as any)}
                    className="w-full bg-[#030508] border border-[#1e293b] px-2 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-400 font-mono"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Critical">Critical</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase text-slate-300 mb-1" htmlFor="inc-desc">
                  Technical Telemetry Synopsis
                </label>
                <textarea
                  id="inc-desc"
                  required
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Provide technical indicators, host nodes, hashes..."
                  className="w-full bg-[#030508] border border-[#1e293b] px-3 py-2 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-400 font-mono tactical-cut-sm"
                />
              </div>

              <button
                type="submit"
                className="w-full tactical-btn tactical-btn-cyan text-xs py-2.5 cursor-pointer shadow-[0_0_15px_rgba(0,242,254,0.25)]"
              >
                BROADCAST INCIDENT REPORT
              </button>
            </form>
          </div>

          {/* Terminal Audit Log Stream */}
          <div className="bg-[#030508] border border-[#152033] tactical-cut overflow-hidden font-mono text-xs shadow-xl">
            <div className="bg-[#070b13] px-3.5 py-2.5 border-b border-[#152033] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_#00f2fe] animate-pulse" />
                <span className="text-slate-300 text-[11px] font-bold uppercase tracking-wider">
                  SYS_AUDIT_STREAM.LOG
                </span>
              </div>
              <Terminal className="w-3.5 h-3.5 text-slate-500" />
            </div>

            <div className="p-4 space-y-2.5 max-h-56 overflow-y-auto">
              {logs.map((log) => (
                <div key={log.id} className="flex items-start gap-2 text-[11px] leading-tight">
                  <span className="text-slate-500 shrink-0">[{log.timestamp.slice(11, 19)}]</span>
                  <span
                    className={`font-bold shrink-0 ${
                      log.level === 'CRITICAL'
                        ? 'text-rose-400'
                        : log.level === 'WARN'
                        ? 'text-amber-400'
                        : 'text-cyan-400'
                    }`}
                  >
                    [{log.level}]
                  </span>
                  <span className="text-slate-300 break-all">{log.event}</span>
                </div>
              ))}
            </div>

            <div className="p-2.5 border-t border-[#152033] text-center bg-[#050811]">
              <a
                href="/api/system-logs"
                target="_blank"
                className="text-[11px] text-cyan-400 hover:text-cyan-300 uppercase tracking-wider font-bold transition-colors"
              >
                VIEW RAW AUDIT TELEMETRY API &rarr;
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
