import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { getCurrentUser } from '@/lib/auth';
import { getDb } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get('attachment') as File | null;
    const isAvatar = formData.get('is_avatar') === '1';

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // -------------------------------------------------------------------------
    // Vulnerability CN-FILE-01: Unrestricted File Upload (Local Demo)
    // No extension check, no MIME check. File saved with original filename.
    // -------------------------------------------------------------------------
    const filename = file.name;
    const isServerless = Boolean(
      process.env.VERCEL ||
      process.env.AWS_LAMBDA_FUNCTION_NAME ||
      process.env.NETLIFY
    );
    const uploadDir = isServerless
      ? path.join('/tmp', 'uploads')
      : path.join(process.cwd(), 'public', 'uploads');

    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const destinationPath = path.join(uploadDir, filename);

    fs.writeFileSync(destinationPath, buffer);

    if (isAvatar) {
      const db = getDb();
      db.prepare('UPDATE users SET avatar = ? WHERE id = ?').run(filename, user.id);
    }

    return NextResponse.json({
      success: true,
      message: `File uploaded to /uploads/${filename}`,
      filename,
      url: `/uploads/${filename}`,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
