import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { deleteLink } from "@/lib/db";

export const runtime = "nodejs";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  const { code } = await params;
  deleteLink(code);
  return NextResponse.json({ ok: true });
}
