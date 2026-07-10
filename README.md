# Class of 2006 — 20-Year Reunion Memorial

A password-protected memorial site for our middle & high school years (2003–2006),
built for the 20-year reunion. Features a scroll-animated timeline of milestones
(with photo/video galleries), a filterable album page, background music, and a
no-account guestbook.

Built on [Nuxt UI](https://ui.nuxt.com) + [Nuxt Content](https://content.nuxt.com).

## Quick start

```bash
pnpm install
cp .env.example .env   # then edit .env to set your passwords
pnpm dev               # http://localhost:3000
```

The dev server redirects you to `/login`. Enter the `NUXT_SITE_PASSWORD` to enter.

## Configuration

All secrets live in `.env` (gitignored):

| Variable | What it does | Default |
|----------|-------------|---------|
| `NUXT_SITE_PASSWORD` | Password visitors need to view the site | `class-of-2006` |
| `NUXT_ADMIN_PASSWORD` | Password for `/admin` (guestbook moderation) | `admin-2006` |
| `NUXT_PUBLIC_SITE_URL` | Public URL, used for OG image generation | _(empty)_ |

**Change both passwords before launch** and share the site password privately
with classmates.

## How the site is structured

| Route | Purpose |
|-------|---------|
| `/` | Hero + vertical scroll timeline of milestones |
| `/album` | Every photo & video, filterable by year / type / category |
| `/guestbook` | Leave and read messages (no account needed) |
| `/admin` | Moderate guestbook messages (not in the nav) |
| `/login` | Password gate |

## Adding & editing content

Content lives in [`content/`](./content) and is validated by schemas in
[`content.config.ts`](./content.config.ts).

### Add a milestone

Create a new YAML file in `content/milestones/`, e.g. `2005-10-festival.yml`:

```yaml
date: 2005-10-15
period: "Autumn 2005"
title: "Autumn Festival"
description: "The stalls, the snacks, and the rain that didn't stop us."
category: event          # milestone | event | memory | trip
cover:
  src: /photos/festival.jpg
  alt: "The festival stalls"
gallery:
  - type: image
    src: /photos/festival-1.jpg
    alt: "Snack stall"
    caption: "The snack stall that sold out in 20 minutes."
  - type: video
    src: https://www.youtube.com/watch?v=XXXXXXXXXXX
    caption: "The performance"
```

Drop the photos into `public/photos/`. See
[`public/photos/README.md`](./public/photos/README.md) for format tips and
[`public/music/README.md`](./public/music/README.md) for the background track.

Milestones are ordered by `date` automatically.

## Background music

Place a licensed MP3 at `public/music/background.mp3`. Visitors click the
floating music button (bottom-right) to play — browsers block autoplay, so it
never starts on its own. Preference and volume persist across reloads.

## Guestbook

Messages are stored in `.data/messages.json` (auto-created, gitignored). The
site is already password-gated, so posted messages appear immediately. To
moderate, visit `/admin` and enter the admin password.

A simple rate limit (one message per 10s per client) and a honeypot field keep
naive bots out.

## Privacy

- The whole site is behind a password — share it only with classmates.
- `public/robots.txt` disallows crawling, and pages carry `noindex` meta.
- Photos show people who were minors in 2003–2006. Be thoughtful about what you
  publish, and let classmates opt out.

## Production

This site needs a running server (not static hosting) because of the password
middleware and guestbook. Deploy to any Node host (Vercel, Netlify Functions,
a VPS, etc.):

```bash
pnpm build
node .output/server/index.mjs
```

Set the env variables on your host. Make sure `.data/` is writable (for the
guestbook) — on serverless hosts without a persistent filesystem, swap the
JSON DB in `server/utils/db.ts` for a real database (e.g. SQLite/Postgres).

## Scripts

| Command | Action |
|---------|--------|
| `pnpm dev` | Start dev server |
| `pnpm build` | Build for production |
| `pnpm preview` | Preview the production build |
| `pnpm typecheck` | Run TypeScript checks |
| `pnpm lint` | Lint the codebase |
