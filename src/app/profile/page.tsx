'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  User as UserIcon,
  Key,
  Shield,
  FileText,
  Upload,
  Coins,
  Send,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react';
import { User } from '@/lib/auth';

export default function ProfilePage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const targetIdParam = searchParams.get('id');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [targetUser, setTargetUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Credit transfer state
  const [transferRecipient, setTransferRecipient] = useState('');
  const [transferAmount, setTransferAmount] = useState('');
  const [transferMsg, setTransferMsg] = useState<string | null>(null);

  // Form fields
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [department, setDepartment] = useState('');
  const [role, setRole] = useState<'admin' | 'analyst' | 'user'>('user');
  const [bio, setBio] = useState('');

  // Upload state
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [isAvatar, setIsAvatar] = useState(false);
  const [uploadMsg, setUploadMsg] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProfiles() {
      setLoading(true);
      try {
        // Fetch current user or target user via IDOR lookup
        const lookupUrl = targetIdParam
          ? `/api/user/lookup?id=${targetIdParam}`
          : `/api/user/lookup?id=1`; // fallback or self

        const res = await fetch(lookupUrl);
        const data = await res.json();

        if (res.ok && data.success && data.user) {
          const u = data.user;
          setTargetUser(u);
          setFullName(u.full_name || '');
          setEmail(u.email || '');
          setPhone(u.phone || '');
          setDepartment(u.department || '');
          setRole(u.role || 'user');
          setBio(u.bio || '');
        } else {
          setError(data.error || 'Failed to resolve dossier');
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchProfiles();
  }, [targetIdParam]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null);
    setError(null);

    try {
      // Vulnerability CN-CSRF-01: No CSRF token
      // Vulnerability CN-AC-01: IDOR user_id
      // Vulnerability CN-AC-03: Mass Assignment role
      const res = await fetch('/api/user/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: targetUser?.id,
          full_name: fullName,
          email,
          phone,
          department,
          role,
          bio,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setMsg(data.message || 'Profile successfully updated.');
        if (targetUser) {
          setTargetUser({ ...targetUser, full_name: fullName, email, role, department });
        }
      } else {
        setError(data.error || 'Update failed');
      }
    } catch (err: any) {
      setError('Network communication failed: ' + err.message);
    }
  };

  const handleTransferCredits = async (e: React.FormEvent) => {
    e.preventDefault();
    setTransferMsg(null);
    try {
      const res = await fetch('/api/transfer-credits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipient: transferRecipient,
          amount: transferAmount,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setTransferMsg(`Success: Reallocated ${data.transferred} credits to @${data.recipient}. New balance: ${data.newBalance}`);
        if (targetUser) {
          setTargetUser({ ...targetUser, credits: data.newBalance });
        }
      } else {
        setTransferMsg('Error: ' + data.error);
      }
    } catch (err: any) {
      setTransferMsg('Error: ' + err.message);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFile) return;
    setUploadMsg(null);

    const formData = new FormData();
    formData.append('attachment', uploadFile);
    if (isAvatar) formData.append('is_avatar', '1');

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setUploadMsg(`File uploaded: ${data.url}`);
        if (isAvatar && targetUser) {
          setTargetUser({ ...targetUser, avatar: data.filename });
        }
      } else {
        setUploadMsg('Error: ' + data.error);
      }
    } catch (err: any) {
      setUploadMsg('Upload failed: ' + err.message);
    }
  };

  if (loading) {
    return <div className="text-center py-16 text-slate-500 font-mono text-sm">Resolving dossier metadata...</div>;
  }

  if (!targetUser) {
    return (
      <div className="p-6 bg-[#111625] border border-rose-500/40 rounded-xl text-rose-300 font-mono text-sm">
        {error || 'Target operator dossier not found.'}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header with IDOR Dossier Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl overflow-hidden border border-cyan-500/40 bg-slate-950 flex items-center justify-center shadow-[0_0_15px_rgba(0,242,254,0.3)] shrink-0">
            <img src="/cybernex-logo.png" alt="CyberNex Logo" className="w-full h-full object-cover scale-105" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              Operator Credentials & Settings
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Manage personal security clearance, cryptographic tokens, and telemetry files
            </p>
          </div>
        </div>

        {/* Vulnerability CN-AC-01 Helper: Quick IDOR switcher */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-slate-500">Switch Dossier:</span>
          <button
            onClick={() => router.push('/profile?id=1')}
            className={`px-2.5 py-1 text-xs font-mono rounded border transition-colors cursor-pointer ${
              targetUser.id === 1
                ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/40'
                : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
            }`}
          >
            #1 Admin
          </button>
          <button
            onClick={() => router.push('/profile?id=2')}
            className={`px-2.5 py-1 text-xs font-mono rounded border transition-colors cursor-pointer ${
              targetUser.id === 2
                ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/40'
                : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
            }`}
          >
            #2 Alice
          </button>
          <button
            onClick={() => router.push('/profile?id=3')}
            className={`px-2.5 py-1 text-xs font-mono rounded border transition-colors cursor-pointer ${
              targetUser.id === 3
                ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/40'
                : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
            }`}
          >
            #3 Bob
          </button>
        </div>
      </div>

      {/* Status Messages */}
      {msg && (
        <div className="p-3.5 rounded-lg bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs font-mono flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{msg}</span>
        </div>
      )}

      {error && (
        <div className="p-3.5 rounded-lg bg-rose-950/40 border border-rose-500/40 text-rose-300 text-xs font-mono flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Grid: Left Details & Right Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Col: Dossier Overview */}
        <div className="space-y-6">
          <div className="bg-[#111625] border border-slate-800 rounded-xl p-6 text-center">
            {/* Avatar */}
            <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-cyan-400 to-indigo-600 p-0.5 shadow-[0_0_20px_rgba(0,242,254,0.3)] mb-4 overflow-hidden">
              <div className="w-full h-full rounded-full bg-[#0b1120] flex items-center justify-center overflow-hidden">
                {targetUser.avatar && targetUser.avatar !== 'default.png' ? (
                  <img
                    src={`/uploads/${targetUser.avatar}`}
                    alt="Avatar"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as any).src = '/uploads/sample_threat_report.txt';
                    }}
                  />
                ) : (
                  <span className="text-2xl font-bold font-mono text-cyan-400">
                    {targetUser.username.slice(0, 2).toUpperCase()}
                  </span>
                )}
              </div>
            </div>

            <h2 className="text-lg font-bold text-white">{targetUser.full_name}</h2>
            <p className="text-xs text-slate-400 font-mono mt-0.5">@{targetUser.username}</p>

            <div className="mt-3">
              <span
                className={`inline-block px-3 py-1 rounded-full text-xs font-mono font-bold uppercase border ${
                  targetUser.role === 'admin'
                    ? 'bg-rose-500/15 text-rose-400 border-rose-500/40'
                    : targetUser.role === 'analyst'
                    ? 'bg-blue-500/15 text-blue-400 border-blue-500/40'
                    : 'bg-slate-700/40 text-slate-300 border-slate-600'
                }`}
              >
                CLEARANCE: {targetUser.role}
              </span>
            </div>

            {/* Dossier Meta */}
            <div className="mt-6 pt-6 border-t border-slate-800 text-left space-y-3.5 text-xs">
              <div>
                <span className="text-slate-500 uppercase tracking-wider text-[10px] block">Operator ID</span>
                <span className="font-mono text-slate-200">#00{targetUser.id}</span>
              </div>

              <div>
                <span className="text-slate-500 uppercase tracking-wider text-[10px] block">Department</span>
                <span className="text-slate-200">{targetUser.department || 'Security Operations'}</span>
              </div>

              <div>
                <span className="text-slate-500 uppercase tracking-wider text-[10px] block">SecOps Credits</span>
                <span className="font-mono text-cyan-400 font-bold">{targetUser.credits} PTS</span>
              </div>

              <div>
                <span className="text-slate-500 uppercase tracking-wider text-[10px] block">API Secret Key</span>
                {/* Vulnerability CN-SEC-01: Information Disclosure */}
                <code className="text-amber-400 font-mono text-[11px] break-all">
                  {targetUser.api_key || 'NOT_PROVISIONED'}
                </code>
              </div>
            </div>
          </div>

          {/* Credit Allocation Transfer Widget (Business Logic Flaw) */}
          <div className="bg-[#111625] border border-slate-800 rounded-xl p-5">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-1">
              <Coins className="w-4 h-4 text-cyan-400" />
              Credit Allocation Transfer
            </h3>
            <p className="text-[11px] text-slate-400 mb-3">
              Reassign SecOps computational credits to another analyst
            </p>

            {transferMsg && (
              <div className="mb-3 p-2 rounded bg-cyan-950/40 border border-cyan-500/30 text-[11px] font-mono text-cyan-300 break-all">
                {transferMsg}
              </div>
            )}

            <form onSubmit={handleTransferCredits} className="space-y-3">
              <div>
                <label className="block text-[11px] text-slate-300 mb-1" htmlFor="transfer-recipient">
                  Recipient Username
                </label>
                <input
                  id="transfer-recipient"
                  type="text"
                  required
                  value={transferRecipient}
                  onChange={(e) => setTransferRecipient(e.target.value)}
                  placeholder="e.g. admin"
                  className="w-full bg-[#0b1120] border border-slate-700 rounded px-2.5 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-400 font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-300 mb-1" htmlFor="transfer-amount">
                  Amount (Credits)
                </label>
                <input
                  id="transfer-amount"
                  type="number"
                  required
                  value={transferAmount}
                  onChange={(e) => setTransferAmount(e.target.value)}
                  placeholder="100"
                  className="w-full bg-[#0b1120] border border-slate-700 rounded px-2.5 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-400 font-mono"
                />
              </div>

              <button
                type="submit"
                className="w-full py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded transition-colors cursor-pointer"
              >
                Execute Credit Reallocation
              </button>
            </form>
          </div>
        </div>

        {/* Right 2 Cols: Profile Edit Form, Uploads, Document Viewer */}
        <div className="lg:col-span-2 space-y-6">
          {/* Modify Profile Form */}
          <div className="bg-[#111625] border border-slate-800 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-white">Modify Operator Profile</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Update contact coordinates and operational parameters
                </p>
              </div>
              {targetUser.id !== 1 && (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/30">
                  IDOR DOSSIER #{targetUser.id}
                </span>
              )}
            </div>

            {/* Vulnerability CN-CSRF-01: No CSRF Protection */}
            {/* Vulnerability CN-AC-03: Mass Assignment (role modification) */}
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <input type="hidden" name="user_id" value={targetUser.id} />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-slate-300 mb-1" htmlFor="edit-name">
                    Full Name
                  </label>
                  <input
                    id="edit-name"
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full bg-[#0b1120] border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div>
                  <label className="block text-xs text-slate-300 mb-1" htmlFor="edit-email">
                    Email Address
                  </label>
                  <input
                    id="edit-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-[#0b1120] border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-slate-300 mb-1" htmlFor="edit-phone">
                    Direct Phone
                  </label>
                  <input
                    id="edit-phone"
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-[#0b1120] border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div>
                  <label className="block text-xs text-slate-300 mb-1" htmlFor="edit-dept">
                    Department Unit
                  </label>
                  <input
                    id="edit-dept"
                    type="text"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full bg-[#0b1120] border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-slate-300 mb-1" htmlFor="edit-role">
                  Security Role Clearance (Mass Assignment Flaw)
                </label>
                <select
                  id="edit-role"
                  value={role}
                  onChange={(e) => setRole(e.target.value as any)}
                  className="w-full bg-[#0b1120] border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-400"
                >
                  <option value="user">User / Operator (Tier 1)</option>
                  <option value="analyst">Analyst (Tier 2)</option>
                  <option value="admin">Administrator (Tier 1 CISO)</option>
                </select>
                <span className="text-[11px] text-slate-500 mt-1 block">
                  Assign clearance tier directly to operator profile.
                </span>
              </div>

              <div>
                <label className="block text-xs text-slate-300 mb-1" htmlFor="edit-bio">
                  Operator Scope & Bio
                </label>
                <textarea
                  id="edit-bio"
                  rows={2}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full bg-[#0b1120] border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-400"
                />
              </div>

              <button
                type="submit"
                className="px-5 py-2.5 bg-gradient-to-r from-cyan-400 to-blue-600 hover:from-cyan-300 hover:to-blue-500 text-slate-950 font-semibold text-xs rounded-lg transition-all shadow-[0_0_15px_rgba(0,242,254,0.25)] cursor-pointer"
              >
                Commit Changes
              </button>
            </form>
          </div>

          {/* File Upload Card (Unrestricted File Upload) */}
          <div className="bg-[#111625] border border-slate-800 rounded-xl p-6">
            <h3 className="text-base font-bold text-white flex items-center gap-2 mb-1">
              <Upload className="w-5 h-5 text-cyan-400" />
              Upload Telemetry Attachment or Avatar
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Attach threat logs or profile icons directly to storage (No extension restrictions)
            </p>

            {uploadMsg && (
              <div className="mb-4 p-2.5 rounded bg-cyan-950/40 border border-cyan-500/30 text-xs font-mono text-cyan-300 break-all">
                {uploadMsg}
              </div>
            )}

            <form onSubmit={handleUpload} className="space-y-4">
              <div>
                <input
                  type="file"
                  required
                  onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                  className="block w-full text-xs text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-slate-800 file:text-cyan-400 hover:file:bg-slate-700 cursor-pointer"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  id="is-avatar-box"
                  type="checkbox"
                  checked={isAvatar}
                  onChange={(e) => setIsAvatar(e.target.checked)}
                  className="rounded border-slate-700 text-cyan-500 focus:ring-0 cursor-pointer"
                />
                <label htmlFor="is-avatar-box" className="text-xs text-slate-300 cursor-pointer">
                  Assign this file as active profile avatar
                </label>
              </div>

              <button
                type="submit"
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
              >
                Upload Attachment
              </button>
            </form>
          </div>

          {/* Document Vault (Path Traversal Target) */}
          <div className="bg-[#111625] border border-slate-800 rounded-xl p-6">
            <h3 className="text-base font-bold text-white flex items-center gap-2 mb-1">
              <FileText className="w-5 h-5 text-cyan-400" />
              SecOps Document Vault Access
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Retrieve stored audit records and baseline scans
            </p>

            <div className="flex items-center justify-between p-3.5 bg-[#0b1120] border border-slate-800 rounded-lg">
              <div>
                <span className="font-semibold text-xs text-white block">sample_threat_report.txt</span>
                <span className="text-[11px] text-slate-500">Baseline perimeter audit snapshot</span>
              </div>

              {/* Vulnerability CN-FILE-02: Path Traversal link */}
              <a
                href="/api/download?file=sample_threat_report.txt"
                target="_blank"
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-cyan-400 text-xs rounded transition-colors"
              >
                View Document &rarr;
              </a>
            </div>

            <div className="mt-3 text-[11px] font-mono text-slate-500">
              Vault Retrieval Endpoint: <code>/api/download?file=&lt;filename&gt;</code>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
