// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PROTECTED_PATHS = [
  "/dashboard",
  "/game1",
  "/game2",
  "/game3",
  "/game4",
  "/bethistory",
  "/deposithistory",
  "/transactionhistory",
  "/withdrawalhistory",
  "/profile",
  "/changepassword",
  "/addMoney",
  "/withMoney",
  "/support",
];

//Admin-only paths
const ADMIN_ONLY_PATH = ["/dashboard"];

// Pages that use client-side authentication only
const CLIENT_PROTECTED = ["/account", "/wallet"];

function decodeJWT(token: string) {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const payload = JSON.parse(Buffer.from(parts[1], "base64").toString());
    return payload;
  } catch {
    return null;
  }
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Check if this is a client-protected route (account/wallet)
  const isClientProtected = CLIENT_PROTECTED.some((p) =>
    pathname.startsWith(p),
  );
  if (isClientProtected) {
    // Let client-side authentication handle these pages
    return NextResponse.next();
  }

  const token = req.cookies.get("token")?.value;

  //check admin-only routes
  const isAdminOnly = ADMIN_ONLY_PATH.some((p) => pathname.startsWith(p));
  if (isAdminOnly) {
    if (!token) {
      const loginUrl = req.nextUrl.clone();
      loginUrl.pathname = "/login";
      loginUrl.searchParams.set("msg", "Please login to continue");
      return NextResponse.redirect(loginUrl);
    }

    // Decode token and check role
    const decoded = decodeJWT(token);
    if (!decoded || decoded.role !== "admin") {
      const homeUrl = req.nextUrl.clone();
      homeUrl.pathname = "/";
      homeUrl.searchParams.set(
        "msg",
        "Access denied. Admin privileges required.",
      );
      return NextResponse.redirect(homeUrl);
    }
  }

  // Check server-side protected routes
  const isProtected = PROTECTED_PATHS.some((p) => pathname.startsWith(p));
  if (isProtected) {
    const token = req.cookies.get("token")?.value;
    if (!token) {
      const loginUrl = req.nextUrl.clone();
      loginUrl.pathname = "/login";
      loginUrl.searchParams.set("msg", "Please login to continue");
      return NextResponse.redirect(loginUrl);
    }
  }
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/game1/:path*",
    "/game2/:path*",
    "/game3/:path*",
    "/bethistory/:path*",
    "/deposithistory/:path*",
    "/transactionhistory/:path*",
    "/withdrawalhistory/:path*",
    "/profile/:path*",
    "/changepassword/:path*",
    "/addMoney/:path*",
    "/withMoney/:path*",
    "/support/:path*",
    '/account/:path*',
    '/wallet/:path*',
  ],
};
