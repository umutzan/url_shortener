import { NextRequest, NextResponse } from "next/server";
import QRCode from "qrcode";
import { findByCode } from "@/lib/db";
import { getSiteUrl } from "@/lib/siteUrl";

export const runtime = "nodejs";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;
  const link = findByCode(code);

  if (!link) {
    return NextResponse.json({ error: "Bulunamadı" }, { status: 404 });
  }

  const shortUrl = `${await getSiteUrl()}/${code}`;

  const buffer = await QRCode.toBuffer(shortUrl, {
    width: 400,
    margin: 2,
    color: { dark: "#111827", light: "#ffffff" },
  });

  return new Response(buffer as unknown as BodyInit, {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "public, max-age=86400, immutable",
      "Content-Disposition": `inline; filename="qr-${code}.png"`,
    },
  });
}
