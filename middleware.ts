// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PROTECTED_PATHS = [
  '/dashboard',
  '/account',
  '/wallet',
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

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
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
    '/account/:path*',
    '/wallet/:path*',
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
