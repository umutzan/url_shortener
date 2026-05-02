import { NextRequest, NextResponse } from "next/server";
import { findByCode, incrementHits } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;
  const link = findByCode(code);

  if (!link) {
    return NextResponse.redirect(new URL("/", req.url), { status: 302 });
  }

  const cookieName = `visited_${code}`;
  const response = NextResponse.redirect(link.original, { status: 302 });

  if (!req.cookies.get(cookieName)) {
    incrementHits(code);
    response.cookies.set(cookieName, "1", {
      httpOnly: true,
      sameSite: "lax",
      maxAge: 86400,
    });
  }

  return response;
}
