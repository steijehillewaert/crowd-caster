# Crowd Caster

Extras catalogue for **Crowdproductions**. Private, password-protected, deployed on Vercel.

## What it does

- **Extras database** — name, contact, gender, date of birth (age is derived), nationality,
  languages, location, sizes (height, weight, clothing, chest/waist/hips, shoe, hair, eyes,
  tattoos/piercings), day and hourly fee, licence/car, availability, free-form notes.
- **Photos** — multiple per extra, uploaded straight from the browser to Vercel Blob, one
  marked as the cover shot used in the grid.
- **Productions & bookings** — record which extra worked on which production, in what role,
  on what date, for what fee. Productions are created on the fly when you type a new name.
- **Filtering** — free-text search plus gender, city, age range, height range, clothing size,
  availability and "has worked on production X".
- **Login** — one shared team password, checked in constant time, exchanged for an
  HMAC-signed session cookie that is valid for 30 days. Everything except `/login` is gated.

## Stack

Next.js 16 (App Router, server actions) · React 19 · Tailwind CSS 4 · Prisma 6 ·
Neon Postgres · Vercel Blob.

## Environment variables

| Variable | What it is |
| --- | --- |
| `APP_PASSWORD` | The password the team types on the login screen. |
| `SESSION_SECRET` | Secret that signs the session cookie. `openssl rand -base64 32`. |
| `DATABASE_URL` | Neon **pooled** connection string. |
| `DIRECT_URL` | Neon **unpooled** connection string — used by `prisma db push`/migrations. |
| `BLOB_READ_WRITE_TOKEN` | Vercel Blob store token. |

`DATABASE_URL`, `DIRECT_URL` and `BLOB_READ_WRITE_TOKEN` are injected automatically on
Vercel once the Neon and Blob stores are connected to the project. `APP_PASSWORD` and
`SESSION_SECRET` you set yourself.

## Local development

```bash
npm install
cp .env.example .env      # then fill it in
npx prisma db push        # create the tables
npm run dev
```

Open http://localhost:3000 and sign in with `APP_PASSWORD`.

`vercel env pull .env` fills in the Neon and Blob values from the linked Vercel project.

## Changing the password

Update `APP_PASSWORD` in the Vercel project settings and redeploy. Rotating
`SESSION_SECRET` at the same time signs everyone out immediately.

## Schema changes

Edit `prisma/schema.prisma`, then:

```bash
npx prisma db push
```

`prisma generate` runs automatically after every `npm install`.
