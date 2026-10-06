import { NextResponse } from 'next/server';

export async function GET() {
  // ---------------------------------------------------------------------------
  // Vulnerability CN-SEC-01: Excessive Information Disclosure via Debug Route
  // ---------------------------------------------------------------------------
  return NextResponse.json({
    status: 'debug_mode_enabled',
    framework: 'Next.js 16 (Node ' + process.version + ')',
    platform: process.platform,
    cwd: process.cwd(),
    env: {
      NODE_ENV: process.env.NODE_ENV,
      JWT_SECRET: 'cybernex_insecure_jwt_secret_token_2026',
      DATABASE_BACKUP_LOCATION: 'database/cybernex_backup.sql',
      CYBERNEX_FLAG_MASTER: 'CN-FLAG{fl4g_d3bug_3xposur3_m4st3r}',
    },
    uptime: process.uptime(),
  });
}
