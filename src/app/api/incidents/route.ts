import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get('q');
    const db = getDb();

    if (q) {
      // -----------------------------------------------------------------------
      // Vulnerability CN-INJ-02: SQL Injection in Incident Search
      // Allows UNION SELECT exploitation to extract passwords, keys, and tokens
      // -----------------------------------------------------------------------
      const rawSql = `
        SELECT id, title, category, severity, description, author_username, status, created_at 
        FROM incidents 
        WHERE title LIKE '%${q}%' OR description LIKE '%${q}%' OR category LIKE '%${q}%'
        ORDER BY id DESC
      `;
      try {
        const results = db.prepare(rawSql).all();
        return NextResponse.json({ success: true, incidents: results, count: results.length });
      } catch (sqlErr: any) {
        return NextResponse.json(
          {
            success: false,
            error: 'SQL Syntax Error: ' + sqlErr.message,
            query: rawSql,
          },
          { status: 500 }
        );
      }
    }

    const incidents = db.prepare('SELECT * FROM incidents ORDER BY id DESC').all();
    return NextResponse.json({ success: true, incidents });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const title = body.title?.trim();
    const category = body.category?.trim() || 'General SecOps';
    const severity = body.severity?.trim() || 'Medium';
    const description = body.description?.trim();

    if (!title || !description) {
      return NextResponse.json({ error: 'Title and description are required' }, { status: 400 });
    }

    // -------------------------------------------------------------------------
    // Vulnerability CN-XSS-02: Stored Cross-Site Scripting (Stored XSS)
    // Inserts unescaped payload directly into database
    // -------------------------------------------------------------------------
    const db = getDb();
    const stmt = db.prepare(`
      INSERT INTO incidents (title, category, severity, description, author_id, author_username, status)
      VALUES (?, ?, ?, ?, ?, ?, 'Open')
    `);
    const info = stmt.run(title, category, severity, description, user.id, user.username);

    return NextResponse.json({
      success: true,
      message: 'Incident recorded',
      id: info.lastInsertRowid,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
