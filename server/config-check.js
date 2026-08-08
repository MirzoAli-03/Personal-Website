const { misconfiguredPage } = require("./fallback");

// DATABASE_URL is the only hard requirement. JWT_SECRET is optional — auth.js
// derives a stable session key from DATABASE_URL when it is absent, so a host
// that can inject the database URL automatically needs no manual setup at all.
const REQUIRED = ["DATABASE_URL"];

function missingVars() {
  return REQUIRED.filter((name) => !process.env[name]);
}

// Short-circuits every request when the deployment is misconfigured, so the
// cause is visible in the browser rather than buried in serverless logs.
// Deliberately does not use res.render — see fallback.js.
function guard(req, res, next) {
  const missing = missingVars();
  if (missing.length === 0) return next();

  console.error(`Missing required environment variable(s): ${missing.join(", ")}`);

  if (req.path === "/healthz") return next();

  res.status(503);
  if (req.accepts("html") === "html") {
    return res.type("html").send(misconfiguredPage(missing));
  }
  // `code` lets the client show a translated message; `error` is the fallback.
  return res.json({ error: "Server not configured", code: "not_configured", missing });
}

module.exports = { REQUIRED, missingVars, guard };
