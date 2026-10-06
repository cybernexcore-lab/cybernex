import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const action = body.action;
    const db = getDb();

    if (action === 'find_user') {
      const username = body.username?.trim();
      const user = db.prepare(`
        SELECT u.id, u.username, pr.security_question, pr.reset_token 
        FROM users u 
        LEFT JOIN password_resets pr ON u.id = pr.user_id 
        WHERE u.username = ?
      `).get(username) as any;

      if (!user) {
        return NextResponse.json({ error: 'Specified operator was not found in directory.' }, { status: 404 });
      }

      // -----------------------------------------------------------------------
      // Vulnerability CN-MISC-02: Weak Password Reset (Token Leakage)
      // Response inadvertently leaks the valid reset token!
      // -----------------------------------------------------------------------
      return NextResponse.json({
        success: true,
        user: {
          username: user.username,
          security_question: user.security_question,
        },
        _debug_token: user.reset_token, // Leaked reset token
      });
    }

    if (action === 'verify_answer') {
      const username = body.username?.trim();
      const answer = body.answer?.trim()?.toLowerCase();
      const record = db.prepare(`
        SELECT u.id, pr.reset_token, pr.security_answer 
        FROM users u 
        JOIN password_resets pr ON u.id = pr.user_id 
        WHERE u.username = ?
      `).get(username) as any;

      if (record && record.security_answer?.toLowerCase() === answer) {
        return NextResponse.json({
          success: true,
          token: record.reset_token,
        });
      }
      return NextResponse.json({ error: 'Security question verification failed.' }, { status: 401 });
    }

    if (action === 'reset_pass') {
      const username = body.username?.trim();
      const token = body.token?.trim();
      const newPassword = body.new_password?.trim();

      // Vulnerability CN-AUTH-02: Weak Password Policy
      if (!newPassword) {
        return NextResponse.json({ error: 'Password cannot be empty.' }, { status: 400 });
      }

      const user = db.prepare(`
        SELECT u.id, pr.reset_token 
        FROM users u 
        JOIN password_resets pr ON u.id = pr.user_id 
        WHERE u.username = ?
      `).get(username) as any;

      if (user && user.reset_token === token) {
        db.prepare('UPDATE users SET password = ? WHERE id = ?').run(newPassword, user.id);
        return NextResponse.json({
          success: true,
          message: 'Password successfully updated! You may now authenticate.',
        });
      }
      return NextResponse.json({ error: 'Invalid or expired password reset token.' }, { status: 400 });
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
