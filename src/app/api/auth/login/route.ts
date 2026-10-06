import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { encodeInsecureToken, User } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    let username = '';
    let password = '';
    let redirectUrl = '/dashboard';

    const contentType = req.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      const body = await req.json();
      username = body.username || '';
      password = body.password || '';
      redirectUrl = body.redirect || redirectUrl;
    } else {
      const formData = await req.formData();
      username = (formData.get('username') as string) || '';
      password = (formData.get('password') as string) || '';
      redirectUrl = (formData.get('redirect') as string) || redirectUrl;
    }

    const db = getDb();

    // -------------------------------------------------------------------------
    // Vulnerability CN-INJ-01: SQL Injection in Authentication
    // Direct string interpolation into raw SQL query
    // -------------------------------------------------------------------------
    const rawSql = `SELECT * FROM users WHERE username = '${username}' AND password = '${password}'`;

    let user: User | undefined;
    try {
      user = db.prepare(rawSql).get() as User | undefined;
    } catch (sqlErr: any) {
      // -----------------------------------------------------------------------
      // Vulnerability CN-SEC-02: Verbose SQL Database Error Output
      // -----------------------------------------------------------------------
      return NextResponse.json(
        {
          error: 'SQL Database Query Error: ' + sqlErr.message,
          query: rawSql,
        },
        { status: 500, headers: { 'Server': 'CyberNex-SecOps/2.4.1 (Next.js/16 Node/24)' } }
      );
    }

    if (user) {
      const token = encodeInsecureToken(user.id, user.username, user.role);

      // -----------------------------------------------------------------------
      // Vulnerability CN-MISC-01: Open Redirect
      // -----------------------------------------------------------------------
      const response = NextResponse.json({
        success: true,
        redirect: redirectUrl,
        user: { id: user.id, username: user.username, role: user.role },
      });

      // Vulnerability CN-AUTH-04 & CN-SEC-04: Insecure Cookie Flags (httpOnly=false, secure=false)
      response.cookies.set('cn_auth_token', token, {
        path: '/',
        httpOnly: false,
        secure: false,
      });
      response.cookies.set('cn_uid', String(user.id), {
        path: '/',
        httpOnly: false,
        secure: false,
      });
      response.cookies.set('cn_user', user.username, {
        path: '/',
        httpOnly: false,
        secure: false,
      });

      return response;
    } else {
      // -----------------------------------------------------------------------
      // Vulnerability CN-AUTH-03: Username Enumeration
      // Differentiates between missing username vs incorrect password
      // -----------------------------------------------------------------------
      const checkUser = db.prepare(`SELECT * FROM users WHERE username = '${username.replace(/'/g, "''")}'`).get();
      if (!checkUser) {
        return NextResponse.json(
          { error: 'Directory lookup failed: Specified operator username does not exist in CyberNex directory.' },
          { status: 401 }
        );
      } else {
        return NextResponse.json(
          { error: `Authentication rejected: Invalid security key/password for operator '${username}'.` },
          { status: 401 }
        );
      }
    }
  } catch (err: any) {
    return NextResponse.json({ error: 'Internal Server Error: ' + err.message }, { status: 500 });
  }
}
