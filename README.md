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
| `DATABASE_URL_UNPOOLED` | Neon **unpooled** connection string — used by `prisma db push`/migrations. |
| `BLOB_READ_WRITE_TOKEN` | Vercel Blob store token. |

`DATABASE_URL`, `DATABASE_URL_UNPOOLED` and `BLOB_READ_WRITE_TOKEN` are injected automatically on
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

## Privacy note

The Blob store is created with `--access public`. Photo URLs contain a random suffix and
are not listed anywhere, but anyone who has a URL can open it without logging in. Since
these are photos of real people, consider switching the store to `--access private` and
serving presigned URLs if that is not acceptable for Crowdproductions.

The app also stores personal data (contact details, date of birth, body measurements),
so the usual GDPR housekeeping applies: keep the password to the people who need it, and
delete profiles when an extra asks you to — deleting an extra also deletes their photos
from Blob.

## Deploying

Once the Vercel GitHub App has access to this private repository, pushing to `main`
deploys automatically and `vercel deploy --prod` works from the project directory.

If a deployment is created but never builds (status stays `UNKNOWN`, no build logs,
and `vercel redeploy` answers *"This deployment can not be redeployed"*), Vercel could
not fetch the repository. Grant the Vercel GitHub App access to
`steijehillewaert/crowd-caster` at https://github.com/apps/vercel/installations/select_target
and redeploy.

As a stopgap, a deploy made from outside a git checkout uploads the source directly and
builds fine:

```bash
rsync -a --exclude node_modules --exclude .next --exclude .git --exclude '.env*' ./ /tmp/cc-deploy/
cd /tmp/cc-deploy && vercel deploy --prod --yes
```
