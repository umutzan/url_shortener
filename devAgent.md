# devAgent.md — Project Status Notes

This file is written so the next agent can understand the project from scratch.

---

## What Is This?

A **link shortening service** built with Next.js 16 (App Router) + SQLite.
Single-user, admin-panel driven. Login is handled via username/password in `.env.local`, session is protected with a JWT cookie.

---

## Stack

| Technology | Usage |
|---|---|
| Next.js 16 (App Router) | Framework |
| TypeScript | Language |
| Tailwind CSS v4 | Styling (always dark mode) |
| better-sqlite3 | Database (Node.js runtime only) |
| jose | JWT signing + verification (middleware and API routes) |
| nanoid (customAlphabet) | 7-char Base62 short code generation |
| qrcode | QR code PNG generation |

---

## File Map

```
/
├── middleware.ts                   # Edge: JWT protection + short code rewrite
├── next.config.ts                  # Security HTTP headers
├── lib/
│   ├── db.ts                       # SQLite connection, CRUD helpers, settings table
│   ├── auth.ts                     # JWT sign/verify, getSession, validateCredentials (plain text)
│   ├── siteUrl.ts                  # getSiteUrl() — DB > SITE_URL env > localhost:3000
│   └── reserved.ts                 # Reserved paths that cannot be used as short codes
├── app/
│   ├── page.tsx                    # / → default_redirect if set, else session → /dashboard or /login
│   ├── layout.tsx                  # Root layout
│   ├── globals.css                 # Tailwind import + dark color variables
│   ├── login/
│   │   └── page.tsx                # Login form (client component)
│   ├── dashboard/
│   │   ├── page.tsx                # Server Component: session check + pass settings/baseUrl
│   │   └── LinkManager.tsx         # Client Component: full dashboard UI
│   └── api/
│       ├── auth/
│       │   ├── login/route.ts      # POST: rate limit → plain text compare → JWT cookie (strict)
│       │   └── logout/route.ts     # POST /api/auth/logout → clears cookie
│       ├── links/
│       │   ├── route.ts            # GET (list), POST (create, protocol whitelist + nanoid)
│       │   └── [code]/route.ts     # DELETE /api/links/:code
│       ├── qr/
│       │   └── [code]/route.ts     # GET /api/qr/:code → returns PNG QR code
│       ├── r/
│       │   └── [code]/route.ts     # Middleware rewrite → DB lookup → redirect (with hit cookie)
│       └── settings/
│           └── route.ts            # GET/POST site settings (session protected)
├── data/
│   └── links.db                    # SQLite DB (auto-created, in .gitignore)
└── .env.local                      # Credentials (never commit)
```

---

## .env.local Structure

```
ADMIN_USERNAME=admin
ADMIN_PASSWORD=plaintextpassword    # Plain text for now — should be hashed later
JWT_SECRET=<random string, min 32 chars>
SITE_URL=https://your-domain.com    # Optional; also configurable from the dashboard
```

---

## Security Measures (Applied)

| # | Measure | Detail |
|---|---|---|
| 1 | **Protocol whitelist** | Only `http:` and `https:` accepted; `javascript:`, `data:` etc. → 400 |
| 2 | **High entropy code** | `nanoid` Base62, 7 chars → ~3.5 trillion combinations |
| 3 | ~~**Bcrypt password**~~ | Removed — `ADMIN_PASSWORD` is plain text in `.env.local` for now; should be hashed later |
| 4 | **Cookie SameSite=Strict** | Maximum CSRF protection |
| 5 | **Rate limiting** | IP-based, 5 failed attempts per minute → 429 |
| 6 | **Security headers** | `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy` |
| 7 | **F5 spam protection** | `visited_<code>` cookie (httpOnly, sameSite: lax, 24h) prevents hit count inflation on refresh |

---

## Database Schema

```sql
CREATE TABLE links (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  code        TEXT    NOT NULL UNIQUE,   -- 7 char Base62 or custom code
  original    TEXT    NOT NULL,          -- target URL (http/https required)
  hits        INTEGER NOT NULL DEFAULT 0,
  created_at  TEXT    NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX idx_links_code ON links(code);

CREATE TABLE settings (
  key   TEXT PRIMARY KEY,
  value TEXT NOT NULL DEFAULT ''
);
```

DB file: `data/links.db` — created automatically on first server start.

Known settings keys: `site_url`, `default_redirect`.

---

## Redirect Logic

```
User → oursite.com/aBc1234
  → middleware.ts intercepts
  → rewrites to /api/r/aBc1234
  → DB lookup for code = 'aBc1234'
  → if found: hits++ (unless visited_aBc1234 cookie present) → 302 redirect → original URL
  → if not found: 302 redirect → /
```

---

## Auth Flow

```
POST /api/auth/login  { username, password }
  → IP rate limit check (5 attempts / 1 minute)
  → password === ADMIN_PASSWORD (plain text — should be hashed later)
  → match: JWT (8h) → httpOnly + SameSite=Strict cookie
  → no match: record failure → 401

middleware.ts (Edge Runtime)
  → reads cookie for /dashboard/* → verifies with jose
  → missing/invalid token → redirect to /login
  → valid token on /login → redirect to /dashboard

GET /api/links (and other protected APIs)
  → also verified server-side via lib/auth.ts:getSession()
```

**Important:** Both middleware and API routes use only `jose`. `signToken` and `verifyToken` are async — always `await` them.

---

## Short Code Rules

- **Default:** `nanoid` `customAlphabet("[a-zA-Z0-9]", 7)` → 7 char Base62 (~3.5T combinations)
- **Custom code:** User enables a toggle in the dashboard and types their own code
- **Valid characters:** `[a-zA-Z0-9_-]`
- **Reserved paths** (`lib/reserved.ts`): `dashboard`, `login`, `api`, `_next`, `admin`, `auth`, `public`, `static`, `favicon`, `favicon.ico`, `robots.txt`, `sitemap.xml`
- Auto-generated codes retry up to 10 times on collision; custom codes return 409 on collision

---

## Dashboard Features

- Settings panel (above link creator): configure Site URL and homepage redirect — saved to DB
- Link creation form (URL + optional custom code toggle)
- Full links table: short URL, target, hit count, date
- Per-row actions: copy to clipboard (with ✓ feedback), QR modal, delete
- QR modal: 400×400 PNG image + download button
- Logout button

---

## Site URL Resolution

`getSiteUrl()` in `lib/siteUrl.ts` is async and follows this priority:
1. `site_url` setting in DB (set via dashboard)
2. `SITE_URL` environment variable
3. `http://localhost:3000` (fallback)

Used in: `app/dashboard/page.tsx` and `app/api/qr/[code]/route.ts`.

---

## Theme

Always dark mode — independent of system preference.

Color palette:
- Background: `#0f1117`
- Card/panel: `#1a1d27`
- Border: `#2a2d3a`
- Row hover: `#1f2233`
- Accent: `blue-600` / `blue-500`
- Text: `white` → `slate-300` → `slate-500` → `slate-600` (hierarchy)

---

## Important Technical Notes

1. `better-sqlite3` only works in Node.js runtime. Cannot be used in middleware — that's why redirect logic lives in `/api/r/[code]` and middleware rewrites there.
2. `nanoid` is active: `customAlphabet`, Base62, 7 chars.
3. `bcryptjs` was removed — `validateCredentials` now does `password === process.env.ADMIN_PASSWORD`.
4. DB WAL mode enabled, foreign keys active.
5. QR PNG response uses `buffer as unknown as BodyInit` cast — `qrcode` returns a `Buffer`, Next.js `Response` expects `BodyInit`.
6. Rate limiting is memory-based — resets on process restart. Needs Redis or external store for multi-instance deployments.
7. `getSetting` / `setSetting` in `lib/db.ts` use upsert (`INSERT ... ON CONFLICT DO UPDATE`) on the `settings` table.

---

## TODO / Potential Improvements

- [ ] Link editing (update URL or code)
- [ ] Pagination (table grows with many links)
- [ ] Per-link click analytics / charts
- [ ] Multi-user support (currently single admin)
- [ ] Link expiry date
- [x] Add `data/` to `.gitignore` — **Done**
- [ ] **Password security:** `ADMIN_PASSWORD` is plain text. Should migrate to bcrypt or Argon2 — change `validateCredentials` in `lib/auth.ts` and use `ADMIN_PASSWORD_HASH` in `.env.local`
- [ ] Rate limiting with Redis/external store (currently memory-based, resets on restart)
