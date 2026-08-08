const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { sql } = require("./db");

const COOKIE_NAME = "admin_session";
const MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

let derived = null;

// Prefer an explicit JWT_SECRET. Without one, derive a stable key from
// DATABASE_URL so the app needs only a single environment variable to run —
// which matters because a host's Neon integration can set DATABASE_URL
// automatically while JWT_SECRET would always be manual.
//
// This gives up nothing: anyone holding DATABASE_URL can already read and write
// every row directly, so being able to forge a session grants no further access.
// Rotating the database password invalidates existing sessions, which is
// correct behaviour anyway.
//
// Read at call time, not module load — see the note in db.js.
function secret() {
  if (process.env.JWT_SECRET) return process.env.JWT_SECRET;

  if (!process.env.DATABASE_URL) {
    throw new Error("Neither JWT_SECRET nor DATABASE_URL is set");
  }
  if (!derived) {
    derived = crypto
      .createHmac("sha256", process.env.DATABASE_URL)
      .update("admin-session-key:v1")
      .digest("base64url");
  }
  return derived;
}

function secretSource() {
  return process.env.JWT_SECRET ? "JWT_SECRET" : "derived from DATABASE_URL";
}

function issueSession(res, user) {
  const token = jwt.sign({ sub: user.id, username: user.username }, secret(), {
    expiresIn: MAX_AGE_MS / 1000,
  });
  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: MAX_AGE_MS,
    path: "/",
  });
}

function clearSession(res) {
  res.clearCookie(COOKIE_NAME, { path: "/" });
}

function readSession(req) {
  const token = req.cookies?.[COOKIE_NAME];
  if (!token) return null;
  try {
    return jwt.verify(token, secret());
  } catch {
    return null;
  }
}

// Attaches req.admin when a valid session cookie is present. Never blocks.
function attachUser(req, res, next) {
  req.admin = readSession(req);
  res.locals.admin = req.admin;
  next();
}

// Gates admin pages: redirects browsers to login, 401s API calls.
function requireAuth(req, res, next) {
  if (req.admin) return next();
  if (req.path.startsWith("/api/") || req.accepts("html") !== "html") {
    return res.status(401).json({ error: "Not authenticated" });
  }
  const next_ = encodeURIComponent(req.originalUrl);
  return res.redirect(`/admin/login?next=${next_}`);
}

async function verifyCredentials(username, password) {
  const rows = await sql`
    SELECT id, username, password_hash FROM admin_users WHERE username = ${username}
  `;
  if (rows.length === 0) {
    // Compare against a dummy hash so a missing user costs the same as a wrong
    // password — otherwise response timing leaks which usernames exist.
    await bcrypt.compare(password, "$2a$12$0000000000000000000000000000000000000000000000000000");
    return null;
  }
  const user = rows[0];
  const ok = await bcrypt.compare(password, user.password_hash);
  return ok ? { id: user.id, username: user.username } : null;
}

module.exports = {
  issueSession,
  clearSession,
  attachUser,
  requireAuth,
  verifyCredentials,
  secretSource,
};
