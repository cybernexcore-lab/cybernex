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
  Terminal,
  Fingerprint,
  Cpu,
  Layers,
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
        // CN-AC-01 IDOR: Resolves user based on targetIdParam query without clearance check
        const lookupUrl = targetIdParam
          ? `/api/user/lookup?id=${targetIdParam}`
          : `/api/user/lookup?id=1`;

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
          setError(data.error || 'Failed to resolve dossier record');
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
        setMsg('Dossier record updated in central defensive ledger.');
        if (targetUser) {
          setTargetUser({
            ...targetUser,
            full_name: fullName,
            email,
            phone,
            department,
            role,
            bio,
          });
        }
      } else {
        setError(data.error || 'Dossier mutation rejected');
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleTransferCredits = async (e: React.FormEvent) => {
    e.preventDefault();
    setTransferMsg(null);
    try {
      // Vulnerability CN-MISC-02: Negative credit transfer business logic flaw
      const res = await fetch('/api/transfer-credits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipient: transferRecipient,
          amount: Number(transferAmount),
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setTransferMsg(`[SUCCESS] Transferred ${transferAmount} credits to @${transferRecipient}. New balance: ${data.sender_credits} PTS`);
        if (targetUser) {
          setTargetUser({ ...targetUser, credits: data.sender_credits });
        }
        setTransferAmount('');
        setTransferRecipient('');
      } else {
        setTransferMsg('Transaction Fault: ' + (data.error || 'Failed'));
      }
    } catch (err: any) {
      setTransferMsg('Network protocol fault: ' + err.message);
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
      // Vulnerability CN-FILE-01: Unrestricted file upload
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setUploadMsg(`File written to storage: ${data.url}`);
        if (isAvatar && targetUser) {
          setTargetUser({ ...targetUser, avatar: data.filename });
        }
      } else {
        setUploadMsg('Storage Error: ' + data.error);
      }
    } catch (err: any) {
      setUploadMsg('Upload failed: ' + err.message);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-24 font-mono text-xs text-cyan-400 animate-pulse">
        [INITIALIZING CIPHER] RESOLVING CLASSIFIED DOSSIER TELEMETRY...
      </div>
    );
  }

  if (!targetUser) {
    return (
      <div className="p-6 bg-[#070b13] border border-rose-500/50 text-rose-300 font-mono text-xs tactical-cut">
        {error || 'Target operator dossier not indexed.'}
      </div>
    );
  }

  return (
    <div className="space-y-7">
      {/* Page Header with IDOR Dossier Switcher */}
      <div className="bg-[#070b13] border border-[#152033] p-5 sm:p-6 tactical-cut flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 bg-[#030508] border border-cyan-500/40 flex items-center justify-center tactical-cut-sm shadow-[0_0_15px_rgba(0,242,254,0.2)]">
            <Fingerprint className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold uppercase tracking-wider text-white">
              OPERATOR DOSSIER // CLASSIFIED
            </h1>
            <p className="text-xs font-mono text-slate-400 mt-0.5">
              CLEARANCE PROFILE, CRYPTOGRAPHIC IDENTITIES & COMPUTATIONAL LEDGER
            </p>
          </div>
        </div>

        {/* Vulnerability CN-AC-01 Helper: Quick IDOR switcher */}
        <div className="flex items-center gap-2 font-mono text-xs">
          <span className="text-slate-500 text-[11px] uppercase">SWITCH DOSSIER:</span>
          <button
            onClick={() => router.push('/profile?id=1')}
            className={`px-3 py-1 text-xs font-mono uppercase tracking-wider tactical-cut-sm border transition-all cursor-pointer ${
              targetUser.id === 1
                ? 'bg-rose-500/20 text-rose-400 border-rose-500/60 shadow-[0_0_12px_rgba(255,0,60,0.3)]'
                : 'bg-[#030508] text-slate-400 border-[#152033] hover:text-white hover:border-slate-500'
            }`}
          >
            #1 ADMIN
          </button>
          <button
            onClick={() => router.push('/profile?id=2')}
            className={`px-3 py-1 text-xs font-mono uppercase tracking-wider tactical-cut-sm border transition-all cursor-pointer ${
              targetUser.id === 2
                ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/60 shadow-[0_0_12px_rgba(0,242,254,0.3)]'
                : 'bg-[#030508] text-slate-400 border-[#152033] hover:text-white hover:border-slate-500'
            }`}
          >
            #2 ALICE
          </button>
          <button
            onClick={() => router.push('/profile?id=3')}
            className={`px-3 py-1 text-xs font-mono uppercase tracking-wider tactical-cut-sm border transition-all cursor-pointer ${
              targetUser.id === 3
                ? 'bg-slate-700/40 text-slate-200 border-slate-500'
                : 'bg-[#030508] text-slate-400 border-[#152033] hover:text-white hover:border-slate-500'
            }`}
          >
            #3 BOB
          </button>
        </div>
      </div>

      {/* Status Messages */}
      {msg && (
        <div className="p-3.5 bg-emerald-950/40 border border-emerald-500/50 text-emerald-300 text-xs font-mono flex items-center gap-2 tactical-cut-sm">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{msg}</span>
        </div>
      )}

      {error && (
        <div className="p-3.5 bg-rose-950/40 border border-rose-500/50 text-rose-300 text-xs font-mono flex items-center gap-2 tactical-cut-sm">
          <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Grid: Left Details & Right Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Col: Dossier Overview & Credit Transfer */}
        <div className="space-y-6">
          <div className="bg-[#070b13] border border-[#152033] tactical-cut p-6 text-center shadow-xl">
            {/* Avatar */}
            <div className="w-24 h-24 mx-auto tactical-cut-sm bg-[#030508] border-2 border-cyan-500/40 p-1 shadow-[0_0_20px_rgba(0,242,254,0.25)] mb-4 overflow-hidden">
              <div className="w-full h-full bg-[#070b13] flex items-center justify-center overflow-hidden">
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
                  <span className="text-3xl font-extrabold font-mono text-cyan-400">
                    {targetUser.username.slice(0, 2).toUpperCase()}
                  </span>
                )}
              </div>
            </div>

            <h2 className="text-lg font-bold text-white uppercase tracking-wider">{targetUser.full_name}</h2>
            <p className="text-xs text-slate-400 font-mono mt-0.5">@{targetUser.username}</p>

            <div className="mt-3">
              <span
                className={`inline-block px-3 py-1 text-[11px] font-mono font-bold uppercase border tactical-cut-sm ${
                  targetUser.role === 'admin'
                    ? 'bg-rose-500/15 text-rose-400 border-rose-500/50 shadow-[0_0_12px_rgba(255,0,60,0.25)]'
                    : targetUser.role === 'analyst'
                    ? 'bg-cyan-500/15 text-cyan-400 border-cyan-500/50 shadow-[0_0_12px_rgba(0,242,254,0.25)]'
                    : 'bg-slate-800/40 text-slate-300 border-slate-600'
                }`}
              >
                CLEARANCE // {targetUser.role.toUpperCase()}
              </span>
            </div>

            {/* Dossier Meta */}
            <div className="mt-6 pt-6 border-t border-[#152033] text-left space-y-3 font-mono text-xs">
              <div>
                <span className="text-slate-500 text-[10px] uppercase block tracking-wider">OPERATOR IDENTIFIER</span>
                <span className="text-slate-200 font-bold">#00{targetUser.id}</span>
              </div>

              <div>
                <span className="text-slate-500 text-[10px] uppercase block tracking-wider">ASSIGNED DIVISION</span>
                <span className="text-slate-200">{targetUser.department || 'Security Operations'}</span>
              </div>

              <div>
                <span className="text-slate-500 text-[10px] uppercase block tracking-wider">COMPUTATIONAL CREDITS</span>
                <span className="text-cyan-400 font-bold text-sm">{targetUser.credits} PTS</span>
              </div>

              <div>
                <span className="text-slate-500 text-[10px] uppercase block tracking-wider">
                  API SECRET TOKEN (DISCLOSURE)
                </span>
                {/* Vulnerability CN-SEC-01: Information Disclosure */}
                <code className="text-amber-400 font-mono text-[11px] break-all bg-[#030508] p-1.5 border border-amber-900/40 block mt-1">
                  {targetUser.api_key || 'NOT_PROVISIONED'}
                </code>
              </div>
            </div>
          </div>

          {/* Credit Allocation Transfer Widget (Business Logic Flaw) */}
          <div className="bg-[#070b13] border border-[#152033] tactical-cut p-5 shadow-xl">
            <h3 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2 mb-1">
              <Coins className="w-4 h-4 text-cyan-400" />
              <span>CREDIT ALLOCATION DISPATCH</span>
            </h3>
            <p className="text-[11px] font-mono text-slate-400 mb-4">
              REALLOCATE SECOPS COMPUTATIONAL CREDITS TO ANOTHER OPERATOR
            </p>

            {transferMsg && (
              <div className="mb-4 p-2.5 bg-cyan-950/40 border border-cyan-500/40 text-xs font-mono text-cyan-300 break-all">
                {transferMsg}
              </div>
            )}

            <form onSubmit={handleTransferCredits} className="space-y-3 font-mono text-xs">
              <div>
                <label className="block text-[10px] uppercase text-slate-400 mb-1" htmlFor="transfer-recipient">
                  Recipient Alias
                </label>
                <input
                  id="transfer-recipient"
                  type="text"
                  required
                  value={transferRecipient}
                  onChange={(e) => setTransferRecipient(e.target.value)}
                  placeholder="e.g. admin or alice"
                  className="w-full bg-[#030508] border border-[#1e293b] px-3 py-2 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-400 font-mono tactical-cut-sm"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase text-slate-400 mb-1" htmlFor="transfer-amount">
                  Credit Quantity (Pts)
                </label>
                <input
                  id="transfer-amount"
                  type="number"
                  required
                  value={transferAmount}
                  onChange={(e) => setTransferAmount(e.target.value)}
                  placeholder="100"
                  className="w-full bg-[#030508] border border-[#1e293b] px-3 py-2 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-400 font-mono tactical-cut-sm"
                />
              </div>

              <button
                type="submit"
                className="w-full tactical-btn tactical-btn-cyan text-xs py-2 cursor-pointer shadow-[0_0_12px_rgba(0,242,254,0.2)]"
              >
                EXECUTE TRANSFER
              </button>
            </form>
          </div>
        </div>

        {/* Right 2 Cols: Profile Edit Form, Uploads, Document Viewer */}
        <div className="lg:col-span-2 space-y-6">
          {/* Modify Profile Form */}
          <div className="bg-[#070b13] border border-[#152033] tactical-cut p-6 shadow-xl">
            <div className="flex items-center justify-between mb-5 pb-4 border-b border-[#152033]">
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                  MODIFY OPERATOR DOSSIER ATTRIBUTES
                </h3>
                <p className="text-xs font-mono text-slate-400 mt-0.5">
                  UPDATE FIELD PARAMETERS & CLEARANCE TIER
                </p>
              </div>
              {targetUser.id !== 1 && (
                <span className="text-[10px] font-mono px-2 py-0.5 bg-rose-500/10 text-rose-400 border border-rose-500/40 uppercase font-bold">
                  IDOR TARGET #{targetUser.id}
                </span>
              )}
            </div>

            {/* Vulnerability CN-CSRF-01: No CSRF Protection */}
            {/* Vulnerability CN-AC-03: Mass Assignment (role modification) */}
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <input type="hidden" name="user_id" value={targetUser.id} />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-mono uppercase text-slate-300 mb-1" htmlFor="edit-name">
                    Full Name & Callout
                  </label>
                  <input
                    id="edit-name"
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full bg-[#030508] border border-[#1e293b] px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-cyan-400 font-mono tactical-cut-sm"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono uppercase text-slate-300 mb-1" htmlFor="edit-email">
                    Direct Email Node
                  </label>
                  <input
                    id="edit-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-[#030508] border border-[#1e293b] px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-cyan-400 font-mono tactical-cut-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-mono uppercase text-slate-300 mb-1" htmlFor="edit-phone">
                    Comms Frequency / Phone
                  </label>
                  <input
                    id="edit-phone"
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-[#030508] border border-[#1e293b] px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-cyan-400 font-mono tactical-cut-sm"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono uppercase text-slate-300 mb-1" htmlFor="edit-dept">
                    Department Sector
                  </label>
                  <input
                    id="edit-dept"
                    type="text"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full bg-[#030508] border border-[#1e293b] px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-cyan-400 font-mono tactical-cut-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase text-slate-300 mb-1" htmlFor="edit-role">
                  Security Clearance Tier (Mass Assignment Flaw)
                </label>
                <select
                  id="edit-role"
                  value={role}
                  onChange={(e) => setRole(e.target.value as any)}
                  className="w-full bg-[#030508] border border-[#1e293b] px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-400 font-mono tactical-cut-sm"
                >
                  <option value="user">User / Operator (Tier 3)</option>
                  <option value="analyst">Analyst (Tier 2)</option>
                  <option value="admin">Administrator (Tier 1 CISO)</option>
                </select>
                <span className="text-[10px] font-mono text-slate-500 mt-1 block">
                  Modify clearance parameter directly to execute privilege escalation.
                </span>
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase text-slate-300 mb-1" htmlFor="edit-bio">
                  Operator Synopsis & Bio
                </label>
                <textarea
                  id="edit-bio"
                  rows={2}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full bg-[#030508] border border-[#1e293b] px-3.5 py-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-400 font-mono tactical-cut-sm"
                />
              </div>

              <button
                type="submit"
                className="tactical-btn tactical-btn-cyan text-xs py-2.5 px-6 cursor-pointer shadow-[0_0_15px_rgba(0,242,254,0.25)]"
              >
                COMMIT DOSSIER RECORD
              </button>
            </form>
          </div>

          {/* File Upload Card (Unrestricted File Upload) */}
          <div className="bg-[#070b13] border border-[#152033] tactical-cut p-6 shadow-xl">
            <h3 className="text-sm font-bold uppercase tracking-wider text-white flex items-center gap-2 mb-1">
              <Upload className="w-4 h-4 text-cyan-400" />
              <span>STORAGE UPLOAD GATEWAY (UNRESTRICTED)</span>
            </h3>
            <p className="text-xs font-mono text-slate-400 mb-4">
              ATTACH TELEMETRY LOGS, EXPLOITS, OR AVATAR GRAPHICS (NO MIME RESTRICTIONS)
            </p>

            {uploadMsg && (
              <div className="mb-4 p-3 bg-cyan-950/40 border border-cyan-500/40 text-xs font-mono text-cyan-300 break-all">
                {uploadMsg}
              </div>
            )}

            <form onSubmit={handleUpload} className="space-y-4">
              <div>
                <input
                  type="file"
                  required
                  onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                  className="block w-full text-xs font-mono text-slate-400 file:mr-4 file:py-2.5 file:px-4 file:border-0 file:text-xs file:font-mono file:font-bold file:bg-[#152033] file:text-cyan-400 hover:file:bg-cyan-500 hover:file:text-black cursor-pointer"
                />
              </div>

              <div className="flex items-center gap-2 font-mono text-xs text-slate-300">
                <input
                  id="is-avatar-box"
                  type="checkbox"
                  checked={isAvatar}
                  onChange={(e) => setIsAvatar(e.target.checked)}
                  className="rounded border-[#1e293b] text-cyan-500 focus:ring-0 cursor-pointer"
                />
                <label htmlFor="is-avatar-box" className="cursor-pointer">
                  Deploy as active agent visual avatar
                </label>
              </div>

              <button
                type="submit"
                className="tactical-btn tactical-btn-neutral text-xs py-2 px-5 cursor-pointer"
              >
                UPLOAD TO REPOSITORY
              </button>
            </form>
          </div>

          {/* Document Vault (Path Traversal Target) */}
          <div className="bg-[#070b13] border border-[#152033] tactical-cut p-6 shadow-xl">
            <h3 className="text-sm font-bold uppercase tracking-wider text-white flex items-center gap-2 mb-1">
              <FileText className="w-4 h-4 text-cyan-400" />
              <span>DOCUMENT REPOSITORY VAULT (DIRECTORY TRAVERSAL)</span>
            </h3>
            <p className="text-xs font-mono text-slate-400 mb-4">
              DOWNLOAD STORED LOG ARTIFACTS AND HISTORICAL ARCHIVES
            </p>

            <div className="flex items-center justify-between p-3.5 bg-[#030508] border border-[#152033] tactical-cut-sm">
              <div>
                <span className="font-bold text-xs text-white block font-mono">sample_threat_report.txt</span>
                <span className="text-[11px] text-slate-500 font-mono">Audited perimeter baseline report</span>
              </div>

              {/* Vulnerability CN-FILE-02: Path Traversal link */}
              <a
                href="/api/download?file=sample_threat_report.txt"
                target="_blank"
                className="tactical-btn tactical-btn-cyan text-[11px] py-1.5 px-3"
              >
                RETRIEVE &rarr;
              </a>
            </div>

            <div className="mt-3 text-[11px] font-mono text-slate-500">
              Direct Query Endpoint: <code>/api/download?file=&lt;filepath&gt;</code>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
