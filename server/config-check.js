const REQUIRED = ["DATABASE_URL", "JWT_SECRET"];

function missingVars() {
  return REQUIRED.filter((name) => !process.env[name]);
}

// Short-circuits every request when the deployment is misconfigured, so the
// cause is visible in the browser rather than buried in serverless logs.
function guard(req, res, next) {
  const missing = missingVars();
  if (missing.length === 0) return next();

  console.error(`Missing required environment variable(s): ${missing.join(", ")}`);

  if (req.path === "/healthz") return next();

  res.status(503);
  if (req.accepts("html") === "html") {
    return res.render("misconfigured", { missing });
  }
  return res.json({ error: "Server not configured", missing });
}

module.exports = { REQUIRED, missingVars, guard };
