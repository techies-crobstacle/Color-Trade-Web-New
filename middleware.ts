// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PROTECTED_PATHS = [
  '/dashboard',
  '/game1',
  '/game2', 
  '/game3',
  '/game4',
  '/bethistory',
  '/deposithistory',
  '/transactionhistory',
  '/withdrawalhistory',
  '/profile',
  '/changepassword',
  '/addMoney',
  '/withMoney',
  '/support',
];

// Pages that use client-side authentication only
const CLIENT_PROTECTED = ['/account', '/wallet'];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  
  // Check if this is a client-protected route (account/wallet)
  const isClientProtected = CLIENT_PROTECTED.some((p) => pathname.startsWith(p));
  if (isClientProtected) {
    // Let client-side authentication handle these pages
    return NextResponse.next();
  }
  
  // Check server-side protected routes
  const isProtected = PROTECTED_PATHS.some((p) => pathname.startsWith(p));
  if (isProtected) {
    const token = req.cookies.get('token')?.value;
    if (!token) {
      const loginUrl = req.nextUrl.clone();
      loginUrl.pathname = '/login';
      loginUrl.searchParams.set('msg', 'Please login to continue');
      return NextResponse.redirect(loginUrl);
    }
  }
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/game1/:path*',
    '/game2/:path*',
    '/game3/:path*',
    '/game4/:path*',
    '/bethistory/:path*',
    '/deposithistory/:path*',
    '/transactionhistory/:path*',
    '/withdrawalhistory/:path*',
    '/profile/:path*',
    '/changepassword/:path*',
    '/addMoney/:path*',
    '/withMoney/:path*',
    '/support/:path*',
  ],
};
;
