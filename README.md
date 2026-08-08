# Personal Website + Admin Panel

Personal site (blog, portfolio, contact) with a password-protected admin panel.
React front end, Express JSON API, content in **Neon Postgres**. Images are stored
in the database as `bytea`, so there is no external file storage to configure.

**Stack:** React 18 + Vite + MUI · Express · Neon serverless Postgres · JWT cookie auth · Vercel

## Quick start

```bash
npm install && npm run build
```

Create your admin account (set `ADMIN_PASSWORD` in `.env` first):

```bash
npm run setup
```

```bash
npm run dev
```

- Site → http://localhost:5173
- Admin → http://localhost:5173/admin

`npm run dev` serves the **built** React bundle from Express. For hot reload while
working on the UI, run the API and the Vite dev server side by side:

```bash
npm run dev
```

```bash
npm run dev:client
```

Then use http://localhost:5174 — Vite proxies `/api`, `/images`, and `/healthz`
to Express on 5173, so cookies stay same-origin.

## Structure

```
api/index.js          Vercel serverless entry (exports the Express app)
server/
  index.js            Local dev server
  app.js              Express setup, static hosting, error handling
  db.js               Neon connection (lazy — see note below)
  auth.js             JWT cookie sessions, bcrypt
  queries.js          All SQL, in one place
  config-check.js     Guards against missing env vars
  fallback.js         Template-free error pages
  routes/
    api.js            The whole JSON API
    images.js         Serves image bytes from Postgres
client/
  src/
    api.js            Fetch wrapper + browser-side image downscaling
    theme.js          MUI theme, light and dark
    context/          Settings, session, and theme state
    components/       Layouts, cards, editor, image picker
    pages/            Public pages
    pages/admin/      Admin panel
scripts/
  setup-db.js         Creates tables + admin user (safe to re-run)
  db-info.js          Prints schema and row counts
```

## The admin panel

| Section | What you can do |
|---|---|
| **Dashboard** | Counts for posts, projects, images, storage used |
| **Posts** | Rich-text editor, cover image, tag, auto slug, publish/draft, delete |
| **Projects** | Title, description, tags, link, year, cover, featured, sort order |
| **Images** | Bulk upload, browse, copy URL, delete |
| **Settings** | Name, heading, tagline, bio, skills, email, social links |

Drafts are invisible publicly — excluded from the blog list and 404 by direct URL
until you tick **Published**.

### Images

Uploads are downscaled to 1600px and converted to WebP **in your browser** before
being sent, which keeps requests under Vercel's ~4.5MB body limit and the database
small. A 2.9MB PNG lands around 14KB. Server limits: 4MB per file, and only
JPEG/PNG/WebP/GIF/AVIF are accepted. Images are served from `/images/:id` with a
one-year immutable cache header.

### Post bodies

The editor stores HTML and post bodies are rendered unescaped so your formatting
works. That is safe because only you can log in — but it means **anyone with admin
access can inject scripts into your site**. Keep the password strong.

The editor uses `contenteditable` with `document.execCommand`. It is deprecated but
universally supported and dependency-free; swap in TipTap if you ever need tables,
collaborative editing, or a real undo stack.

## Languages

The interface ships in English, Russian, and Tajik. A switcher sits in the nav on
both the public site and the admin panel; the choice is saved to `localStorage`,
and a first-time visitor gets whichever of the three their browser prefers.

**Interface only.** Your posts, projects, and settings text stay exactly as you
wrote them — switching language changes the chrome around your content, not the
content. Writing a post in three languages would mean writing it three times, so
that was deliberately left out.

Translations live in `client/src/i18n/{en,ru,tg}.js` as flat key/value files.
English is the fallback: a key missing from another locale renders the English
string rather than breaking.

```bash
npm --prefix client run i18n:check
```

That verifies all three locales define the same keys and prints the Russian
plural forms, which have three cases (`1 черновик`, `2 черновика`, `5 черновиков`).

> The Tajik strings were machine-authored and are worth a read-through by a
> native speaker — particularly the admin-panel wording.

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

1. Push to a Git repo (`.env` is excluded by `.gitignore`).
2. Import the repo at vercel.com.
3. Add **`DATABASE_URL`** and **`JWT_SECRET`** under Settings → Environment
   Variables. Vercel sets `NODE_ENV=production` itself.
4. Deploy.

`vercel.json` builds the React app, serves `client/dist` from the CDN, and routes
only `/api/*`, `/images/*`, and `/healthz` to the serverless function. Everything
else falls back to `index.html` for client-side routing.

Your admin user already exists in Neon, so the same login works in production.
`ADMIN_PASSWORD` is not needed on Vercel.

## Troubleshooting a deploy

Visit `/healthz`. It reports config and database status without exposing values:

```json
{ "ok": true, "missingEnv": [], "clientBuilt": true, "database": "reachable" }
```

- **`missingEnv` non-empty** → add those variables in Vercel, then redeploy. The
  site serves a 503 page naming them until you do.
- **`database: "unreachable"`** → `DATABASE_URL` is set but wrong, or the Neon
  password was rotated without updating it.
- **`clientBuilt: false`** → the Vite build did not run or did not land where the
  server expects.

### Why a crash page instead of an error page

Express treats an exception thrown *inside* an error handler as unhandled, which
kills the whole serverless function and produces Vercel's
`FUNCTION_INVOCATION_FAILED` with no detail. So the error handler and config guard
serve plain HTML from `server/fallback.js` and never depend on the React bundle —
they must survive the very conditions they exist to report. For the same reason
`db.js` builds its client lazily instead of throwing at module load.

## SEO note

This is a client-rendered SPA, so crawlers and social link previews that don't run
JavaScript see an empty shell. Google executes JS and will index it, but previews
on some platforms won't show post titles. The `ejs-version` branch holds the
earlier server-rendered implementation if you want to compare or revert.

## Changing your admin password

Set `ADMIN_PASSWORD` in `.env` and re-run:

```bash
npm run setup
```

## Useful commands

```bash
npm run db:info
```
