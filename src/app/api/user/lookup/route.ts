import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const username = searchParams.get('username');
    const db = getDb();

    if (id) {
      // -----------------------------------------------------------------------
      // Vulnerability CN-INJ-03: SQL Injection in ID lookup
      // -----------------------------------------------------------------------
      const sql = `SELECT * FROM users WHERE id = ${id}`;
      try {
        const user = db.prepare(sql).get();
        if (user) {
          // -------------------------------------------------------------------
          // Vulnerability CN-SEC-01: Excessive Information Disclosure
          // Leaks plain password, api_key, reset_token in response
          // -------------------------------------------------------------------
          return NextResponse.json({ success: true, user });
        }
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      } catch (sqlErr: any) {
        return NextResponse.json(
          { error: 'SQL Error: ' + sqlErr.message, query: sql },
          { status: 500 }
        );
      }
    }

    if (username) {
      const sql = `SELECT * FROM users WHERE username = '${username}'`;
      try {
        const user = db.prepare(sql).get();
        if (user) {
          return NextResponse.json({ success: true, user });
        }
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      } catch (sqlErr: any) {
        return NextResponse.json(
          { error: 'SQL Error: ' + sqlErr.message, query: sql },
          { status: 500 }
        );
      }
    }

    // Unauthenticated full users list
    const users = db.prepare('SELECT id, username, email, full_name, role, credits, api_key FROM users').all();
    return NextResponse.json({ success: true, users });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
