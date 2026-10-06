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
        setFormMsg('Incident broadcast successfully.');
        setTitle('');
        setDescription('');
        // Refresh incidents
        const updatedRes = await fetch('/api/incidents');
        const updatedData = await updatedRes.json();
        if (updatedData.success) setIncidents(updatedData.incidents);
      } else {
        setFormMsg('Error: ' + data.error);
      }
    } catch (err: any) {
      setFormMsg('Network error: ' + err.message);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm(`Purge telemetry incident #${id}?`)) return;
    try {
      const res = await fetch(`/api/incidents/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setIncidents((prev) => prev.filter((item) => item.id !== id));
      }
    } catch (err) {
      alert('Delete failed');
    }
  };

  const getSeverityBadge = (sev: string) => {
    switch (sev) {
      case 'Critical':
        return 'bg-rose-500/15 text-rose-400 border-rose-500/40';
      case 'High':
        return 'bg-amber-500/15 text-amber-400 border-amber-500/40';
      case 'Medium':
        return 'bg-blue-500/15 text-blue-400 border-blue-500/40';
      default:
        return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/40';
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#111625] border border-slate-800 rounded-xl p-5 hover:border-cyan-500/30 transition-all">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">
            <span>Active Threats</span>
            <span className="px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-400 border border-rose-500/30 text-[10px]">
              LIVE
            </span>
          </div>
          <div className="text-2xl font-bold font-mono text-white">{incidents.length}</div>
          <p className="text-xs text-slate-400 mt-1">Monitored events in current queue</p>
        </div>

        <div className="bg-[#111625] border border-slate-800 rounded-xl p-5 hover:border-amber-500/30 transition-all">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">
            <span>Threat Condition</span>
            <span className="px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30 text-[10px]">
              ELEVATED
            </span>
          </div>
          <div className="text-2xl font-bold font-mono text-amber-400">DEFCON 3</div>
          <p className="text-xs text-slate-400 mt-1">Perimeter anomaly rate nominal</p>
        </div>

        <div className="bg-[#111625] border border-slate-800 rounded-xl p-5 hover:border-blue-500/30 transition-all">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">
            <span>Active Operators</span>
            <span className="px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-400 border border-blue-500/30 text-[10px]">
              ONLINE
            </span>
          </div>
          <div className="text-2xl font-bold font-mono text-white">{operatorCount}</div>
          <p className="text-xs text-slate-400 mt-1">Authorized personnel registered</p>
        </div>

        <div className="bg-[#111625] border border-slate-800 rounded-xl p-5 hover:border-cyan-500/30 transition-all">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">
            <span>SecOps Credits</span>
            <span className="px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 text-[10px]">
              QUOTA
            </span>
          </div>
          <div className="text-2xl font-bold font-mono text-cyan-400">{credits} PTS</div>
          <p className="text-xs text-slate-400 mt-1">Computational budget allocation</p>
        </div>
      </div>

      {/* Threat Search Bar */}
      <div className="bg-[#111625] border border-slate-800 rounded-xl p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Search className="w-5 h-5 text-cyan-400" />
              Threat Intelligence & IOC Lookup
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Query historical telemetry events, indicators of compromise, or network nodes
            </p>
          </div>

          <form onSubmit={handleSearch} className="flex gap-2 w-full md:w-auto md:min-w-[420px]">
            <input
              type="text"
              name="q"
              defaultValue={searchQuery}
              placeholder="Search keyword (e.g. DNS, SSH, Bastion)..."
              className="flex-1 bg-[#0b1120] border border-slate-700 rounded-lg px-3.5 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-400 font-mono"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold text-xs rounded-lg transition-colors cursor-pointer"
            >
              Search
            </button>
            {searchQuery && (
              <button
                type="button"
                onClick={() => router.push('/dashboard')}
                className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded-lg transition-colors cursor-pointer"
              >
                Clear
              </button>
            )}
          </form>
        </div>

        {/* Vulnerability CN-XSS-01: Reflected Cross-Site Scripting in Search Query */}
        {searchQuery && (
          <div className="mt-4 p-3 rounded-lg bg-cyan-950/40 border border-cyan-500/30 text-xs font-mono flex items-center justify-between text-cyan-200">
            <div>
              <span>Filtered telemetry records matching: </span>
              {/* Unescaped search query rendered directly */}
              <span
                className="font-bold text-white"
                dangerouslySetInnerHTML={{ __html: searchQuery }}
              />
            </div>
            <span className="text-cyan-400 text-[11px]">Found {incidents.length} entries</span>
          </div>
        )}

        {/* Vulnerability CN-SEC-02: Verbose SQL Database Error Output */}
        {sqlError && (
          <div className="mt-4 p-3.5 rounded-lg bg-rose-950/40 border border-rose-500/40 text-rose-300 text-xs font-mono break-all">
            {sqlError}
          </div>
        )}
      </div>

      {/* Main Split: Incidents Table (2 Cols) & Form/Logs (1 Col) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Incidents Table */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-cyan-400" />
              Active Incident Queue
            </h3>
            <span className="text-xs font-mono text-slate-500">
              {incidents.length} items logged
            </span>
          </div>

          <div className="border border-slate-800 rounded-xl overflow-hidden bg-[#111625]">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-[#0b1120] text-slate-400 text-[11px] font-mono uppercase tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="px-4 py-3">ID</th>
                    <th className="px-4 py-3">Details</th>
                    <th className="px-4 py-3">Severity</th>
                    <th className="px-4 py-3">Author</th>
                    <th className="px-4 py-3">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {incidents.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="px-4 py-3 font-mono text-xs text-slate-500">#{item.id}</td>
                      <td className="px-4 py-3">
                        {/* Vulnerability CN-XSS-02: Stored Cross-Site Scripting in Title & Description */}
                        <div
                          className="font-semibold text-slate-100 text-sm"
                          dangerouslySetInnerHTML={{ __html: item.title }}
                        />
                        <div
                          className="text-xs text-slate-400 mt-1 leading-relaxed"
                          dangerouslySetInnerHTML={{ __html: item.description }}
                        />
                        <div className="text-[11px] font-mono text-slate-500 mt-1">
                          Category: {item.category} | Status: {item.status}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold uppercase border ${getSeverityBadge(
                            item.severity
                          )}`}
                        >
                          {item.severity}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-slate-400">
                        @{item.author_username}
                      </td>
                      <td className="px-4 py-3">
                        {/* Vulnerability CN-AC-02: Missing Authorization Check */}
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="p-1.5 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded transition-colors cursor-pointer"
                          title="Purge Incident"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {incidents.length === 0 && !loading && (
                    <tr>
                      <td colSpan={5} className="text-center py-8 text-xs text-slate-500">
                        No telemetry incidents match criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right 1 Col: New Incident Form & Terminal System Logs */}
        <div className="space-y-6">
          {/* Create Incident Form */}
          <div className="bg-[#111625] border border-slate-800 rounded-xl p-5">
            <h4 className="text-sm font-bold text-white flex items-center gap-2 mb-4">
              <PlusCircle className="w-4 h-4 text-cyan-400" />
              Dispatch New Threat Report
            </h4>

            {formMsg && (
              <div className="mb-3 p-2 rounded bg-cyan-950/40 border border-cyan-500/30 text-[11px] font-mono text-cyan-300">
                {formMsg}
              </div>
            )}

            <form onSubmit={handleCreateIncident} className="space-y-3">
              <div>
                <label className="block text-xs text-slate-300 mb-1" htmlFor="inc-title">
                  Report Headline
                </label>
                <input
                  id="inc-title"
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Unusual Outbound Payload"
                  className="w-full bg-[#0b1120] border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-400 font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs text-slate-300 mb-1" htmlFor="inc-category">
                    Category
                  </label>
                  <select
                    id="inc-category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-[#0b1120] border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-cyan-400"
                  >
                    <option value="Network Anomaly">Network Anomaly</option>
                    <option value="Endpoint Drift">Endpoint Drift</option>
                    <option value="Auth Tampering">Auth Tampering</option>
                    <option value="Exfiltration Probe">Exfiltration Probe</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs text-slate-300 mb-1" htmlFor="inc-severity">
                    Severity
                  </label>
                  <select
                    id="inc-severity"
                    value={severity}
                    onChange={(e) => setSeverity(e.target.value as any)}
                    className="w-full bg-[#0b1120] border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-cyan-400"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Critical">Critical</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs text-slate-300 mb-1" htmlFor="inc-desc">
                  Technical Analysis / Notes
                </label>
                <textarea
                  id="inc-desc"
                  required
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Provide event indicators..."
                  className="w-full bg-[#0b1120] border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-400 font-mono"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-gradient-to-r from-cyan-400 to-blue-600 hover:from-cyan-300 hover:to-blue-500 text-slate-950 font-semibold text-xs rounded-lg transition-all shadow-[0_0_15px_rgba(0,242,254,0.2)] cursor-pointer"
              >
                Broadcast Incident Report
              </button>
            </form>
          </div>

          {/* Terminal Audit Log Widget */}
          <div className="bg-[#070a10] border border-slate-800 rounded-xl overflow-hidden font-mono text-xs">
            <div className="bg-[#0f1422] px-3.5 py-2 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span className="text-slate-400 text-[11px] ml-2">secops_audit_stream.log</span>
              </div>
              <Terminal className="w-3.5 h-3.5 text-slate-500" />
            </div>

            <div className="p-3.5 space-y-2 max-h-48 overflow-y-auto">
              {logs.map((log) => (
                <div key={log.id} className="flex items-start gap-2 text-[11px] leading-tight">
                  <span className="text-slate-500">[{log.timestamp.slice(11, 19)}]</span>
                  <span
                    className={`font-bold ${
                      log.level === 'CRITICAL'
                        ? 'text-rose-400'
                        : log.level === 'WARN'
                        ? 'text-amber-400'
                        : 'text-cyan-400'
                    }`}
                  >
                    {log.level}
                  </span>
                  <span className="text-slate-300">{log.event}</span>
                </div>
              ))}
            </div>

            <div className="p-2 border-t border-slate-800/80 text-center bg-[#0a0d14]">
              {/* Vulnerability CN-AC-02: Missing Authorization Route Link */}
              <a
                href="/api/system-logs"
                target="_blank"
                className="text-[11px] text-cyan-400 hover:text-cyan-300 transition-colors"
              >
                View Full Audit Raw Stream (API) &rarr;
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
