import { NextRequest, NextResponse } from "next/server";
import { signToken, validateCredentials, COOKIE_NAME } from "@/lib/auth";

export const runtime = "nodejs";

// TODO: Memory-based rate limit serverless ortamda güvenilir çalışmaz.
// Her lambda/worker instance kendi Map'ini taşır; restart veya scale-out'ta sayaç sıfırlanır.
// Üretim ortamı için Redis veya Upstash (@upstash/ratelimit) gibi harici bir store'a geçirilmelidir.
interface Attempt {
  count: number;
  resetAt: number;
}

const attempts = new Map<string, Attempt>();
const MAX_ATTEMPTS = 5;
const WINDOW_MS = 60 * 1000; // 1 dakika

function getClientIp(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
    req.headers.get("x-real-ip") ??
    "unknown"
  );
}

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = attempts.get(ip);

  if (!entry || now > entry.resetAt) {
    return false;
  }

  return entry.count >= MAX_ATTEMPTS;
}

function recordFailure(ip: string): void {
  const now = Date.now();
  const entry = attempts.get(ip);

  if (!entry || now > entry.resetAt) {
    attempts.set(ip, { count: 1, resetAt: now + WINDOW_MS });
  } else {
    entry.count += 1;
  }
}

function clearAttempts(ip: string): void {
  attempts.delete(ip);
}

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);

  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: "Çok fazla hatalı deneme. 1 dakika bekleyin." },
      { status: 429 }
    );
  }

  const { username, password } = await req.json();

  if (!validateCredentials(username, password)) {
    recordFailure(ip);
    return NextResponse.json(
      { error: "Kullanıcı adı veya şifre hatalı" },
      { status: 401 }
    );
  }

  clearAttempts(ip);

  const token = await signToken(username);

  const response = NextResponse.json({ ok: true });
  response.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict", // Görev 4: lax → strict
    maxAge: 60 * 60 * 8, // 8 saat
    path: "/",
  });

  return response;
}
