import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const filename = searchParams.get('file');

    if (!filename) {
      return new NextResponse("Missing 'file' parameter. Example: /api/download?file=sample_threat_report.txt", {
        status: 400,
      });
    }

    // -------------------------------------------------------------------------
    // Vulnerability CN-FILE-02: Path Traversal (Directory Traversal)
    // Directly concatenates user input with upload directory without path verification
    // -------------------------------------------------------------------------
    const isServerless = Boolean(
      process.env.VERCEL ||
      process.env.AWS_LAMBDA_FUNCTION_NAME ||
      process.env.NETLIFY
    );
    let targetPath = path.join(process.cwd(), 'public', 'uploads', filename);

    if (!fs.existsSync(targetPath) && isServerless) {
      const tmpPath = path.join('/tmp', 'uploads', filename);
      if (fs.existsSync(tmpPath)) {
        targetPath = tmpPath;
      }
    }

    if (!fs.existsSync(targetPath)) {
      return new NextResponse(
        `File not found: '${filename}'. Looked in: ${targetPath}`,
        { status: 404 }
      );
    }

    const fileBuffer = fs.readFileSync(targetPath);
    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Content-Disposition': `inline; filename="${path.basename(filename)}"`,
      },
    });
  } catch (err: any) {
    return new NextResponse('Internal Error: ' + err.message, { status: 500 });
  }
}
