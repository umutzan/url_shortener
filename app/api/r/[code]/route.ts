import { NextRequest, NextResponse } from "next/server";
import { findByCode, incrementHits } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;
  const link = findByCode(code);

  if (!link) {
    return NextResponse.redirect(new URL("/", _req.url), { status: 302 });
  }

  incrementHits(code);
  return NextResponse.redirect(link.original, { status: 302 });
}
