import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getSetting, setSetting } from "@/lib/db";

export const runtime = "nodejs";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  return NextResponse.json({
    site_url: getSetting("site_url") ?? "",
    default_redirect: getSetting("default_redirect") ?? "",
  });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  const body = await req.json();

  if ("site_url" in body) setSetting("site_url", body.site_url ?? "");
  if ("default_redirect" in body) setSetting("default_redirect", body.default_redirect ?? "");

  return NextResponse.json({ ok: true });
}
