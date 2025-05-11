import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(req) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET || "your_nextauth_secret_key" });
  const { pathname } = req.nextUrl;

  // Protect admin routes
  if (pathname.startsWith('/admin')) {
    if (!token || !token.isAdmin) {
      return NextResponse.redirect(new URL('/auth/login', req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
}; 