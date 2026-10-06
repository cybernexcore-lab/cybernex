import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const db = getDb();
    
    // -------------------------------------------------------------------------
    // Vulnerability CN-AC-02: Missing Authorization Check
    // Any caller can delete any incident without authentication or role verification
    // -------------------------------------------------------------------------
    db.prepare('DELETE FROM incidents WHERE id = ?').run(Number(id));
    return NextResponse.json({ success: true, message: `Incident #${id} purged.` });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Vulnerability: Deletion via GET request (CSRF)
  try {
    const { id } = await params;
    const db = getDb();
    db.prepare('DELETE FROM incidents WHERE id = ?').run(Number(id));
    return NextResponse.redirect(new URL('/dashboard?msg=Incident+purged', req.url));
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
