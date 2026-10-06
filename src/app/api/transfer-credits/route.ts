import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const recipient = body.recipient?.trim();
    const amount = parseInt(body.amount, 10);

    if (!recipient || isNaN(amount)) {
      return NextResponse.json({ error: 'Invalid recipient or integer amount' }, { status: 400 });
    }

    const db = getDb();
    const target = db.prepare('SELECT * FROM users WHERE username = ?').get(recipient) as any;
    if (!target) {
      return NextResponse.json({ error: 'Recipient operator not found' }, { status: 404 });
    }

    // -------------------------------------------------------------------------
    // Vulnerability CN-MISC-03: Business Logic Flaw (Negative Value Transfer)
    // Does NOT check if amount <= 0!
    // If amount is -500: sender.credits - (-500) = sender.credits + 500!
    // -------------------------------------------------------------------------
    const sender = db.prepare('SELECT credits FROM users WHERE id = ?').get(user.id) as any;
    if (amount > sender.credits) {
      return NextResponse.json({ error: 'Insufficient computational credits' }, { status: 400 });
    }

    db.prepare('UPDATE users SET credits = credits - ? WHERE id = ?').run(amount, user.id);
    db.prepare('UPDATE users SET credits = credits + ? WHERE id = ?').run(amount, target.id);

    const updatedSender = db.prepare('SELECT credits FROM users WHERE id = ?').get(user.id) as any;

    return NextResponse.json({
      success: true,
      transferred: amount,
      recipient,
      newBalance: updatedSender.credits,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
