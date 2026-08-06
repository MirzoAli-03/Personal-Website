# Personal Website + Admin Panel

Server-rendered personal site (blog, portfolio, contact) with a password-protected
admin panel. Content lives in **Neon Postgres**; images are stored in the database
as `bytea`, so there is no external file storage to configure.

**Stack:** Node + Express + EJS · Neon serverless Postgres · JWT cookie auth · Vercel

## Quick start

```bash
npm install
```

Then create your admin account (set `ADMIN_PASSWORD` in `.env` first):

```bash
npm run setup
```

```bash
npm run dev
```

- Public site → http://localhost:5173
- Admin panel → http://localhost:5173/admin

## Structure

```
api/index.js          Vercel serverless entry (exports the Express app)
server/
  index.js            Local dev server
  app.js              Express setup, middleware, error handling
  db.js               Neon connection
  auth.js             JWT cookie sessions, bcrypt, requireAuth
  queries.js          All SQL, in one place
  utils.js            slugify, dates, reading time
  routes/
    public.js         Home, projects, blog, post, contact
    admin.js          Login + full CRUD
    images.js         Serves image bytes from Postgres
views/                EJS templates (public + admin/)
assets/css|js         Styles and client scripts
scripts/
  setup-db.js         Creates tables + admin user (safe to re-run)
  db-info.js          Prints schema and row counts
```

## The admin panel

| Section | What you can do |
|---|---|
| **Dashboard** | Counts for posts, projects, images, storage used |
| **Posts** | Rich-text editor, cover image, tag, auto slug, publish/draft toggle, delete |
| **Projects** | Title, description, tags, link, year, cover, featured flag, sort order |
| **Images** | Bulk upload, browse, copy URL, delete |
| **Settings** | Name, heading, tagline, bio, skills, email, social links |

Drafts are invisible publicly — they're excluded from `/blog` and return 404 by
direct URL until you tick **Published**.

### Images

Uploads are downscaled to 1600px and converted to WebP **in your browser** before
being sent, which keeps requests under Vercel's ~4.5MB body limit and keeps the
database small. A 2.9MB PNG typically lands around 13KB. Server-side limits: 4MB
per file, and only JPEG/PNG/WebP/GIF/AVIF are accepted.

Images are served from `/images/:id` with a one-year immutable cache header.

### Post bodies

The editor stores HTML, and post bodies are rendered unescaped so your formatting
works. That is safe here because only you can log in — but it does mean **anyone with
admin access can inject scripts into your site**. Keep the password strong and don't
share the account.

## Environment variables

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | Neon connection string |
| `JWT_SECRET` | Signs session cookies. Random, secret, required. |
| `ADMIN_USERNAME` | Login name (default `admin`) |
| `ADMIN_PASSWORD` | Only read by `npm run setup`; blank it afterwards |
| `NODE_ENV` | `production` enables the `Secure` cookie flag |

`.env` is gitignored. Never commit it.

## Deploying to Vercel

1. Push this folder to a Git repo (`.env` is excluded by `.gitignore`).
2. Import the repo at vercel.com — no build command needed.
3. Add **`DATABASE_URL`** and **`JWT_SECRET`** under Settings → Environment Variables,
   and set **`NODE_ENV`** to `production`.
4. Deploy.

`vercel.json` routes every request to the Express app and explicitly bundles
`views/` and `assets/`, which Vercel's file tracing would otherwise miss.

Your admin user already exists in Neon, so the same login works in production.
You do not need to set `ADMIN_PASSWORD` on Vercel.

## Changing your admin password

Set `ADMIN_PASSWORD` in `.env` to the new value and re-run:

```bash
npm run setup
```

It updates the existing user's hash in place.

## Useful commands

```bash
npm run db:info
```
