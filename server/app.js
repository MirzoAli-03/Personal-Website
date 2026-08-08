const fs = require("fs");
const path = require("path");
const express = require("express");
const cookieParser = require("cookie-parser");

const { attachUser } = require("./auth");
const { guard, missingVars } = require("./config-check");
const { errorPage } = require("./fallback");
const apiRoutes = require("./routes/api");
const imageRoutes = require("./routes/images");

const ROOT = path.join(__dirname, "..");

// Serverless bundlers lay the app root out differently than a local checkout,
// so probe the plausible locations rather than assuming one.
function resolveDir(name) {
  const candidates = [
    path.join(ROOT, name),
    path.join(process.cwd(), name),
    path.join("/var/task", name),
  ];
  return candidates.find((dir) => fs.existsSync(dir)) || null;
}

const clientDist = resolveDir(path.join("client", "dist"));

const app = express();

app.set("trust proxy", 1);

app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));
app.use(cookieParser());
app.use(attachUser);

// Answers even when nothing else can: no templates, no database unless
// the config is complete.
app.get("/healthz", async (req, res) => {
  const missing = missingVars();
  const out = {
    ok: missing.length === 0,
    missingEnv: missing,
    clientBuilt: Boolean(clientDist),
    node: process.version,
  };
  if (missing.length === 0) {
    try {
      const { sql } = require("./db");
      await sql`SELECT 1`;
      out.database = "reachable";
    } catch (err) {
      out.ok = false;
      out.database = `unreachable: ${err.message}`;
    }
  }
  res.status(out.ok ? 200 : 503).json(out);
});

app.use(guard);

app.use("/api", apiRoutes);
app.use("/images", imageRoutes);

// Built React bundle. Hashed assets are immutable; index.html must not be
// cached or clients pin to a stale build.
if (clientDist) {
  app.use(
    express.static(clientDist, {
      index: false,
      setHeaders(res, filePath) {
        if (filePath.endsWith("index.html")) {
          res.setHeader("Cache-Control", "no-cache");
        } else if (filePath.includes(`${path.sep}assets${path.sep}`)) {
          res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
        }
      },
    })
  );
}

// Client-side routing: every non-API path returns the SPA shell.
app.get("*", (req, res, next) => {
  if (req.path.startsWith("/api/") || req.path.startsWith("/images/")) return next();
  if (!clientDist) {
    return res
      .status(503)
      .type("html")
      .send(errorPage("The client bundle is missing. Run `npm run build` and redeploy."));
  }
  res.sendFile(path.join(clientDist, "index.html"));
});

app.use((req, res) => {
  res.status(404).json({ error: "Not found" });
});

// Must never throw: an exception raised inside an Express error handler is
// unhandled and takes down the whole serverless function.
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(err);
  try {
    if (res.headersSent) return;
    const status = err.status || 500;
    const message =
      status >= 500 && process.env.NODE_ENV === "production"
        ? "Server error"
        : err.message || "Server error";

    if (req.path.startsWith("/api/") || req.accepts("html") !== "html") {
      return res.status(status).json({ error: message, code: err.code || undefined });
    }
    res.status(status).type("html").send(errorPage(message));
  } catch (fatal) {
    console.error("Error handler itself failed:", fatal);
    if (!res.headersSent) res.status(500).type("text/plain").send("Server error");
  }
});

module.exports = app;
