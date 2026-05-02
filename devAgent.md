# devAgent.md — Proje Durum Notu

Bu dosya bir sonraki agent'ın projeyi sıfırdan anlaması için yazılmıştır.

---

## Proje Nedir?

Next.js 16 (App Router) + SQLite tabanlı **link kısaltma servisi**.
Tek kullanıcılı, admin panelli. `.env.local` dosyasındaki kullanıcı adı/bcrypt hash ile giriş yapılır, JWT cookie ile oturum korunur.

---

## Stack

| Teknoloji | Kullanım |
|---|---|
| Next.js 16 (App Router) | Framework |
| TypeScript | Dil |
| Tailwind CSS v4 | Stil (tam karanlık mod) |
| better-sqlite3 | Veritabanı (Node.js runtime) |
| jose | JWT imzalama + doğrulama (hem middleware hem API route'larda) |
| bcryptjs | Parola doğrulama (bcrypt.compareSync) |
| nanoid (customAlphabet) | 7 karakterli Base62 kısa kod üretimi |
| qrcode | QR kod PNG üretimi |

---

## Dosya Haritası

```
/
├── middleware.ts                   # Edge: JWT koruması + kısa kod rewrite
├── next.config.ts                  # Güvenlik HTTP başlıkları
├── lib/
│   ├── db.ts                       # SQLite bağlantısı, CRUD helpers (codeExists dahil)
│   ├── auth.ts                     # JWT sign/verify, getSession, bcrypt validateCredentials
│   └── reserved.ts                 # Kısa kod olarak yasak path listesi
├── app/
│   ├── page.tsx                    # / → session varsa /dashboard, yoksa /login
│   ├── layout.tsx                  # Root layout
│   ├── globals.css                 # Tailwind import + dark renk değişkenleri
│   ├── login/
│   │   └── page.tsx                # Giriş formu (client component)
│   ├── dashboard/
│   │   ├── page.tsx                # Server Component: session kontrol + baseUrl hesapla
│   │   └── LinkManager.tsx         # Client Component: tüm dashboard UI
│   └── api/
│       ├── auth/
│       │   ├── login/route.ts      # POST: rate limit → bcrypt doğrula → JWT cookie (strict)
│       │   └── logout/route.ts     # POST /api/auth/logout → cookie sıfırlar
│       ├── links/
│       │   ├── route.ts            # GET (liste), POST (oluştur, protokol whitelist + nanoid)
│       │   └── [code]/route.ts     # DELETE /api/links/:code
│       ├── qr/
│       │   └── [code]/route.ts     # GET /api/qr/:code → PNG QR kodu döner
│       └── r/
│           └── [code]/route.ts     # Middleware rewrite → DB → redirect
├── data/
│   └── links.db                    # SQLite DB (auto-created, gitignore'da olmalı)
└── .env.local                      # Kimlik bilgileri (asla commit'leme)
```

---

## .env.local Yapısı

```
ADMIN_USERNAME=admin
ADMIN_PASSWORD_HASH=<bcrypt hash>   # Düz metin şifre YOK, sadece hash
JWT_SECRET=<min 32 char rastgele string>
```

### Hash Nasıl Üretilir?

```bash
node -e "const b=require('bcryptjs'); console.log(b.hashSync('şifren', 12));"
```

Çıktıyı kopyalayıp `.env.local` içindeki `ADMIN_PASSWORD_HASH=` satırına yapıştır.

---

## Güvenlik Önlemleri (Uygulandı)

| # | Önlem | Detay |
|---|---|---|
| 1 | **Protokol whitelist** | Yalnızca `http:` ve `https:` kabul edilir; `javascript:`, `data:` vb. → 400 |
| 2 | **Yüksek entropi kod** | `nanoid` Base62, 7 karakter → ~3.5 trilyon kombinasyon |
| 3 | **Bcrypt parola** | `.env.local`'da düz metin yok; `bcrypt.compareSync` ile doğrulama |
| 4 | **Cookie SameSite=Strict** | CSRF koruması maksimuma çıkarıldı |
| 5 | **Rate limiting** | IP bazlı, 1 dakikada 5 başarısız deneme → 429 |
| 6 | **Security headers** | `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy` |

---

## Veritabanı Şeması

```sql
CREATE TABLE links (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  code        TEXT    NOT NULL UNIQUE,   -- 7 char Base62 veya custom kod
  original    TEXT    NOT NULL,          -- hedef URL (http/https zorunlu)
  hits        INTEGER NOT NULL DEFAULT 0,
  created_at  TEXT    NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX idx_links_code ON links(code);
```

DB dosyası: `data/links.db` — sunucu ilk başladığında otomatik oluşur.

---

## Yönlendirme Mantığı

```
Kullanıcı → bizimsitemiz.com/aBc1234
  → middleware.ts yakalar
  → /api/r/aBc1234 'ye rewrite eder
  → DB'de code = 'aBc1234' aranır
  → bulunursa: hits++ → 302 redirect → original URL
  → bulunmazsa: 302 redirect → /
```

---

## Auth Akışı

```
POST /api/auth/login  { username, password }
  → IP rate limit kontrolü (5 deneme / 1 dakika)
  → bcrypt.compareSync(password, ADMIN_PASSWORD_HASH)
  → eşleşirse: JWT (8 saat) → httpOnly + SameSite=Strict cookie
  → eşleşmezse: hata kaydı → 401

middleware.ts (Edge Runtime)
  → /dashboard/* için cookie okur → jose ile doğrular
  → token yoksa/geçersizse → /login'e redirect
  → /login'e giderken token geçerliyse → /dashboard'a redirect

GET /api/links (ve diğer korumalı API'ler)
  → lib/auth.ts:getSession() ile Node.js tarafında da doğrulama yapılır
```

**Önemli:** Hem middleware hem API route'lar artık yalnızca `jose` kullanır. `signToken` ve `verifyToken` async'tir — çağıran her yerde `await` gerekir.

---

## Kısa Kod Kuralları

- **Varsayılan:** `nanoid` `customAlphabet("[a-zA-Z0-9]", 7)` → 7 char Base62 (~3.5T kombinasyon)
- **Özel kod:** Kullanıcı dashboard'da toggle açarak kendi kodunu girer
- **Geçerli karakterler:** `[a-zA-Z0-9_-]`
- **Rezerve path'ler** (`lib/reserved.ts`): `dashboard`, `login`, `api`, `_next`, `admin`, `auth`, `public`, `static`, `favicon`, `favicon.ico`, `robots.txt`, `sitemap.xml`
- Otomatik kod üretiminde çakışma varsa 10 kez yeniden denenir; özel kodda çakışma varsa 409 döner

---

## Dashboard Özellikleri

- Link oluşturma formu (URL + opsiyonel özel kod toggle'ı)
- Tüm linklerin tablosu: kısa URL, hedef, tıklanma sayısı, tarih
- Her satırda: panoya kopyala (✓ geri bildirimiyle), QR modal, sil
- QR modal: 400×400 PNG görüntüsü + PNG indirme butonu
- Çıkış yapma butonu

---

## Tema

Tam karanlık mod — sistem tercihinden bağımsız, her zaman dark.

Renk paleti:
- Arka plan: `#0f1117`
- Kart/panel: `#1a1d27`
- Kenarlık: `#2a2d3a`
- Hover satır: `#1f2233`
- Vurgu: `blue-600` / `blue-500`
- Metin: `white` → `slate-300` → `slate-500` → `slate-600` (hiyerarşi)

---

## Önemli Teknik Notlar

1. `better-sqlite3` yalnızca Node.js runtime'da çalışır. Middleware'de kullanılamaz; bu yüzden yönlendirme mantığı `/api/r/[code]` route'unda tutulur ve middleware oraya rewrite yapar.
2. `nanoid` artık aktif olarak kullanılıyor (`customAlphabet`, Base62, 7 karakter).
3. `bcryptjs` artık aktif: `lib/auth.ts` → `validateCredentials` içinde `bcrypt.compareSync`.
4. DB WAL modu açık, foreign key'ler aktif.
5. QR PNG response'unda `buffer as unknown as BodyInit` cast'i kullanılıyor — `qrcode` paketi `Buffer` döner, Next.js `Response` ise `BodyInit` bekler; bu TS uyumsuzluğunu gidermek için yapılmıştır.
6. Rate limiting memory-tabanlıdır — process restart'ta sıfırlanır. Multi-instance deploy için Redis gibi harici store gerekir.

---

## Henüz Yapılmayanlar / Potansiyel Geliştirmeler

- [ ] Link düzenleme (URL veya kod güncelleme)
- [ ] Sayfalama (çok sayıda link olunca tablo uzar)
- [ ] Link bazlı tıklanma grafiği / analitik
- [ ] Çoklu kullanıcı desteği (şu an tek admin)
- [ ] Link son kullanma tarihi (expiry)
- [x] `data/` klasörünü `.gitignore`'a ekle (DB dosyası commit'lenmemeli) — **Tamamlandı**
- [ ] Rate limiting için Redis/harici store (şu an memory-tabanlı, restart'ta sıfırlanır)
