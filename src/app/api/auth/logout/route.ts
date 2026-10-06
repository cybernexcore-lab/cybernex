import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  // Vulnerability CN-AUTH-05: Insecure Logout via GET (vulnerable to CSRF)
  const response = NextResponse.redirect(new URL('/login?msg=Logged%20out%20successfully', req.url));
  response.cookies.delete('cn_auth_token');
  response.cookies.delete('cn_uid');
  response.cookies.delete('cn_user');
  return response;
}

export async function POST(req: NextRequest) {
  const response = NextResponse.json({ success: true, message: 'Logged out' });
  response.cookies.delete('cn_auth_token');
  response.cookies.delete('cn_uid');
  response.cookies.delete('cn_user');
  return response;
}
