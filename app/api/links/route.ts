import { NextRequest, NextResponse } from "next/server";
import { customAlphabet } from "nanoid";
import { getSession } from "@/lib/auth";
import { createLink, getAllLinks, codeExists } from "@/lib/db";
import { isReserved } from "@/lib/reserved";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Base62 alfabe, 7 karakter → ~3.5 trilyon kombinasyon
const generateId = customAlphabet(
  "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
  7
);

const ALLOWED_PROTOCOLS = new Set(["http:", "https:"]);

function uniqueRandomCode(): string | null {
  for (let i = 0; i < 10; i++) {
    const code = generateId();
    if (!isReserved(code) && !codeExists(code)) return code;
  }
  return null;
}

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  return NextResponse.json(getAllLinks());
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  const { url, customCode } = await req.json();

  if (!url) return NextResponse.json({ error: "URL gerekli" }, { status: 400 });

  // Görev 1: Protokol whitelist kontrolü (Stored XSS önlemi)
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return NextResponse.json({ error: "Geçersiz URL formatı" }, { status: 400 });
  }

  if (!ALLOWED_PROTOCOLS.has(parsed.protocol)) {
    return NextResponse.json(
      { error: "Sadece HTTP ve HTTPS protokolleri desteklenmektedir" },
      { status: 400 }
    );
  }

  let code: string;

  if (customCode?.trim()) {
    code = customCode.trim();

    if (!/^[a-zA-Z0-9_-]+$/.test(code)) {
      return NextResponse.json(
        { error: "Kod yalnızca harf, rakam, - ve _ içerebilir" },
        { status: 400 }
      );
    }

    if (isReserved(code)) {
      return NextResponse.json(
        { error: `"${code}" yönetimsel bir path olduğu için kullanılamaz` },
        { status: 400 }
      );
    }

    if (codeExists(code)) {
      return NextResponse.json(
        { error: "Bu kod zaten kullanımda, farklı bir kod deneyin" },
        { status: 409 }
      );
    }
  } else {
    const generated = uniqueRandomCode();
    if (!generated) {
      return NextResponse.json(
        { error: "Benzersiz kod üretilemedi, tekrar deneyin" },
        { status: 500 }
      );
    }
    code = generated;
  }

  const link = createLink(code, url);
  return NextResponse.json(link, { status: 201 });
}
