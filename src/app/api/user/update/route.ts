import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let body: any = {};
    const contentType = req.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      body = await req.json();
    } else {
      const formData = await req.formData();
      body = Object.fromEntries(formData.entries());
    }

    // -------------------------------------------------------------------------
    // Vulnerability CN-AC-01: Insecure Direct Object Reference (IDOR)
    // Target user ID is taken directly from the client payload
    // -------------------------------------------------------------------------
    const targetUserId = body.user_id ? Number(body.user_id) : currentUser.id;

    const email = body.email || currentUser.email;
    const phone = body.phone !== undefined ? body.phone : (currentUser.phone || '');
    const bio = body.bio !== undefined ? body.bio : (currentUser.bio || '');
    const fullName = body.full_name || currentUser.full_name;

    // -------------------------------------------------------------------------
    // Vulnerability CN-AC-03: Mass Assignment / Privilege Escalation
    // Allows any operator to promote themselves to 'admin' by submitting role='admin'
    // -------------------------------------------------------------------------
    const role = body.role || currentUser.role;
    const department = body.department || currentUser.department;

    const db = getDb();
    db.prepare(`
      UPDATE users 
      SET email = ?, phone = ?, bio = ?, full_name = ?, role = ?, department = ?
      WHERE id = ?
    `).run(email, phone, bio, fullName, role, department, targetUserId);

    return NextResponse.json({
      success: true,
      message: `Profile #${targetUserId} successfully updated.`,
      updatedUser: {
        id: targetUserId,
        email,
        role,
        department,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
