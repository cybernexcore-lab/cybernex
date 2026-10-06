import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET() {
  try {
    const db = getDb();
    // -------------------------------------------------------------------------
    // Vulnerability CN-AC-02: Missing Authorization Check on System Logs
    // Administrative event logs are returned without checking authentication or role
    // -------------------------------------------------------------------------
    const logs = db.prepare('SELECT * FROM system_logs ORDER BY id DESC').all();
    return NextResponse.json({
      success: true,
      count: logs.length,
      system_logs: logs,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
