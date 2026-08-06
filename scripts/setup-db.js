require("dotenv").config();
const bcrypt = require("bcryptjs");
const { sql } = require("../server/db");

async function main() {
  console.log("Connecting to Neon...");
  const [{ version }] = await sql`SELECT version()`;
  console.log("Connected:", version.split(",")[0]);

  console.log("Creating tables...");

  await sql`
    CREATE TABLE IF NOT EXISTS admin_users (
      id            SERIAL PRIMARY KEY,
      username      TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS images (
      id           SERIAL PRIMARY KEY,
      filename     TEXT NOT NULL,
      mime_type    TEXT NOT NULL,
      byte_size    INTEGER NOT NULL,
      width        INTEGER,
      height       INTEGER,
      alt_text     TEXT NOT NULL DEFAULT '',
      data         BYTEA NOT NULL,
      created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS posts (
      id             SERIAL PRIMARY KEY,
      slug           TEXT NOT NULL UNIQUE,
      title          TEXT NOT NULL,
      excerpt        TEXT NOT NULL DEFAULT '',
      body           TEXT NOT NULL DEFAULT '',
      tag            TEXT NOT NULL DEFAULT 'Notes',
      cover_image_id INTEGER REFERENCES images(id) ON DELETE SET NULL,
      published      BOOLEAN NOT NULL DEFAULT false,
      published_at   TIMESTAMPTZ,
      created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at     TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS projects (
      id             SERIAL PRIMARY KEY,
      title          TEXT NOT NULL,
      description    TEXT NOT NULL DEFAULT '',
      tags           TEXT[] NOT NULL DEFAULT '{}',
      url            TEXT NOT NULL DEFAULT '',
      link_label     TEXT NOT NULL DEFAULT 'View',
      year           TEXT NOT NULL DEFAULT '',
      cover_image_id INTEGER REFERENCES images(id) ON DELETE SET NULL,
      featured       BOOLEAN NOT NULL DEFAULT false,
      sort_order     INTEGER NOT NULL DEFAULT 0,
      created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `;

  // Single-row table; the id=1 CHECK keeps it that way.
  await sql`
    CREATE TABLE IF NOT EXISTS site_settings (
      id            INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1),
      full_name     TEXT NOT NULL DEFAULT 'Your Name',
      tagline       TEXT NOT NULL DEFAULT '',
      hero_heading  TEXT NOT NULL DEFAULT '',
      bio           TEXT NOT NULL DEFAULT '',
      skills        TEXT[] NOT NULL DEFAULT '{}',
      email         TEXT NOT NULL DEFAULT '',
      github_url    TEXT NOT NULL DEFAULT '',
      linkedin_url  TEXT NOT NULL DEFAULT '',
      twitter_url   TEXT NOT NULL DEFAULT '',
      updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `;

  await sql`CREATE INDEX IF NOT EXISTS posts_published_idx ON posts (published, published_at DESC)`;
  await sql`CREATE INDEX IF NOT EXISTS projects_sort_idx ON projects (sort_order, id)`;

  console.log("Tables ready.");

  // Seed the settings row if the site has never been configured.
  const settings = await sql`SELECT id FROM site_settings WHERE id = 1`;
  if (settings.length === 0) {
    await sql`
      INSERT INTO site_settings (id, full_name, tagline, hero_heading, bio, skills, email)
      VALUES (
        1,
        'Your Name',
        'Developer, writer, and builder',
        'Building things at the intersection of code and curiosity.',
        'Replace this bio from the admin panel at /admin.',
        ARRAY['JavaScript','Node.js','PostgreSQL'],
        'you@example.com'
      )
    `;
    console.log("Seeded site_settings.");
  }

  // Create or update the admin account from env.
  const username = process.env.ADMIN_USERNAME;
  const password = process.env.ADMIN_PASSWORD;

  if (!password) {
    const existing = await sql`SELECT username FROM admin_users LIMIT 1`;
    if (existing.length === 0) {
      console.error(
        "\nNo admin user exists and ADMIN_PASSWORD is empty in .env.\n" +
          "Set ADMIN_PASSWORD to a strong password and run `npm run setup` again."
      );
      process.exit(1);
    }
    console.log(`Admin user '${existing[0].username}' already exists; password unchanged.`);
  } else {
    if (password.length < 10) {
      console.error("\nADMIN_PASSWORD must be at least 10 characters.");
      process.exit(1);
    }
    const hash = await bcrypt.hash(password, 12);
    await sql`
      INSERT INTO admin_users (username, password_hash)
      VALUES (${username}, ${hash})
      ON CONFLICT (username) DO UPDATE SET password_hash = EXCLUDED.password_hash
    `;
    console.log(`Admin user '${username}' is ready.`);
    console.log("You can now blank out ADMIN_PASSWORD in .env — it is no longer needed.");
  }

  console.log("\nSetup complete. Start the site with: npm run dev");
}

main().catch((err) => {
  console.error("\nSetup failed:", err.message);
  process.exit(1);
});
