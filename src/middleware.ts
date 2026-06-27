import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Лёгкая проверка для Edge Runtime (без Prisma).
 * Полная server-side валидация сессии — в requireAuth() на страницах.
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isProtected =
    pathname.startsWith("/dashboard") || pathname.startsWith("/my-prompts");

  if (!isProtected) {
    return NextResponse.next();
  }

  const sessionToken =
    request.cookies.get("authjs.session-token")?.value ??
    request.cookies.get("__Secure-authjs.session-token")?.value;

  if (!sessionToken) {
    const loginUrl = new URL("/login", request.nextUrl.origin);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/my-prompts/:path*"],
};
