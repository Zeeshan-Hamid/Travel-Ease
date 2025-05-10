import { NextResponse } from 'next/server';

export function middleware(req) {
  console.log(`Request: ${req.method} ${req.url}`);
  return NextResponse.next();
}

export const config = {
  matcher: '/api/:path*',
} 