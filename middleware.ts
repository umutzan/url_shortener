import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const COOKIE_NAME = "auth_token";

// /dashboard ve alt path'leri token gerektiriyor
const PROTECTED_PREFIXES = ["/dashboard"];

// Kısa kod yönlendirmesi için statik/API path'leri atla
const BYPASS_PREFIXES = ["/api/", "/login", "/_next/", "/favicon.ico"];

async function getPayload(token: string) {
  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET!);
    const { payload } = await jwtVerify(token, secret);
    return payload;
  } catch {
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // --- 1. Korumalı route kontrolü ---
  if (PROTECTED_PREFIXES.some((p) => pathname.startsWith(p))) {
    const token = request.cookies.get(COOKIE_NAME)?.value;
    const payload = token ? await getPayload(token) : null;

    if (!payload) {
      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = "/login";
      return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
  }

  // --- 2. Giriş sayfasına zaten oturum açmışsa dashboard'a yönlendir ---
  if (pathname === "/login") {
    const token = request.cookies.get(COOKIE_NAME)?.value;
    const payload = token ? await getPayload(token) : null;

    if (payload) {
      const dashUrl = request.nextUrl.clone();
      dashUrl.pathname = "/dashboard";
      return NextResponse.redirect(dashUrl);
    }

    return NextResponse.next();
  }

  // --- 3. Statik / API path'leri geç ---
  if (BYPASS_PREFIXES.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  // --- 4. Ana sayfa geç ---
  if (pathname === "/") {
    return NextResponse.next();
  }

  // --- 5. /abc123 kısa kod yönlendirmesi ---
  const code = pathname.slice(1);
  if (!/^[a-zA-Z0-9_-]+$/.test(code)) {
    return NextResponse.next();
  }

  const apiUrl = request.nextUrl.clone();
  apiUrl.pathname = `/api/r/${code}`;
  return NextResponse.rewrite(apiUrl);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
