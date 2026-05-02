# Link Shortener

A self-hosted link shortener with QR code generation, built with Next.js 16 (App Router) and SQLite.

> Vibe-coded for personal use after my university club kept running into limitations with third-party link shorteners and QR code tools during events — needed something simple, self-hosted, and fully in control.

## Features

- Shorten any URL with an auto-generated or custom code
- QR code generation (PNG, downloadable)
- Hit counter with F5/spam protection via cookies
- Single-admin authentication (JWT cookie, 8h session)
- Configurable site URL and homepage redirect from the dashboard
- Fully dark UI

## Stack

| | |
|---|---|
| Next.js 16 (App Router) | Framework |
| TypeScript | Language |
| Tailwind CSS v4 | Styling |
| better-sqlite3 | Database |
| jose | JWT auth |
| nanoid | Short code generation |
| qrcode | QR PNG output |

## Setup

**1. Install dependencies**

```bash
npm install
```

**2. Create `.env.local`**

```env
ADMIN_USERNAME=admin
ADMIN_PASSWORD=yourpassword
JWT_SECRET=a-random-string-at-least-32-characters-long
SITE_URL=https://your-domain.com   # optional, also configurable from the dashboard
```

**3. Run**

```bash
npm run dev
```

The SQLite database is created automatically at `data/links.db` on first run.

## Usage

- Go to `/login` and sign in
- The dashboard lets you create/delete links, generate QR codes, and configure site settings
- Short links resolve at `yourdomain.com/<code>`
- The homepage (`/`) can be pointed to any URL from the dashboard settings panel

## Notes

- Single-user only — one admin account via `.env.local`
- Rate limiting is memory-based; resets on server restart
- Not designed for high-traffic or multi-user scenarios
