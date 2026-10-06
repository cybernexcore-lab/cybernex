import { cookies } from 'next/headers';
import { getDb } from './db';

export interface User {
  id: number;
  username: string;
  password?: string;
  email: string;
  full_name: string;
  role: 'admin' | 'analyst' | 'user';
  bio?: string;
  avatar?: string;
  credits: number;
  api_key?: string;
  phone?: string;
  department?: string;
  reset_token?: string;
  created_at?: string;
}

export interface Incident {
  id: number;
  title: string;
  category: string;
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  description: string;
  author_id: number;
  author_username: string;
  status: string;
  created_at: string;
}

export interface SystemLog {
  id: number;
  event: string;
  level: string;
  source_ip: string;
  details?: string;
  timestamp: string;
}

/**
 * Deliberate Vulnerability CN-AUTH-04: Predictable, tamperable client-side token
 */
export function encodeInsecureToken(userId: number, username: string, role: string): string {
  const payload = JSON.stringify({ uid: userId, user: username, role });
  return Buffer.from(payload, 'utf-8').toString('base64');
}

export function decodeInsecureToken(tokenStr: string): { uid: number; user: string; role: string } | null {
  try {
    const raw = Buffer.from(tokenStr, 'base64').toString('utf-8');
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

/**
 * Resolves current user from cookies.
 * Vulnerable to cookie tampering (cn_uid or cn_auth_token).
 */
export async function getCurrentUser(): Promise<User | null> {
  const cookieStore = await cookies();

  let targetId: number | null = null;

  // Check direct UID cookie first (IDOR / session flaw)
  const uidCookie = cookieStore.get('cn_uid')?.value;
  if (uidCookie && !isNaN(Number(uidCookie))) {
    targetId = Number(uidCookie);
  }

  // Check base64 token
  const tokenCookie = cookieStore.get('cn_auth_token')?.value;
  if (!targetId && tokenCookie) {
    const decoded = decodeInsecureToken(tokenCookie);
    if (decoded && decoded.uid) {
      targetId = decoded.uid;
    }
  }

  if (!targetId) {
    return null;
  }

  const db = getDb();
  const row = db.prepare('SELECT * FROM users WHERE id = ?').get(targetId) as User | undefined;
  return row || null;
}
