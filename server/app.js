const fs = require("fs");
const path = require("path");
const express = require("express");
const cookieParser = require("cookie-parser");

const { attachUser } = require("./auth");
const { guard, missingVars } = require("./config-check");
const { errorPage, notFoundPage, renderSafe } = require("./fallback");
const publicRoutes = require("./routes/public");
const adminRoutes = require("./routes/admin");
const imageRoutes = require("./routes/images");

// Serverless bundlers place the app root differently than a local checkout, so
// probe the plausible locations rather than assuming one.
function resolveViewsDir() {
  const candidates = [
    path.join(__dirname, "..", "views"),
    path.join(process.cwd(), "views"),
    path.join("/var/task", "views"),
  ];
  const found = candidates.find((dir) => fs.existsSync(dir));
  if (!found) {
    console.error("views/ not found. Tried:", candidates.join(", "));
  }
  return found || candidates[0];
}

const app = express();

app.set("view engine", "ejs");
app.set("views", resolveViewsDir());
app.set("trust proxy", 1);

app.use(express.urlencoded({ extended: true, limit: "1mb" }));
app.use(express.json({ limit: "1mb" }));
app.use(cookieParser());
app.use(attachUser);

app.use(
  "/assets",
  express.static(path.join(__dirname, "..", "assets"), { maxAge: "1h" })
);

// Reports config and database reachability without exposing any values.
app.get("/healthz", async (req, res) => {
  const missing = missingVars();
  const out = {
    ok: missing.length === 0,
    missingEnv: missing,
    viewsDir: fs.existsSync(app.get("views")),
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

app.use("/images", imageRoutes);
app.use("/admin", adminRoutes);
app.use("/", publicRoutes);

app.use((req, res) => {
  res.status(404);
  if (req.accepts("html") !== "html") {
    return res.json({ error: "Not found" });
  }
  renderSafe(res, "404", { title: "Not found" }, notFoundPage());
});

// Must never throw: an exception raised inside an Express error handler is
// unhandled and takes down the whole serverless function.
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(err);
  try {
    const status = err.status || 500;
    const message =
      process.env.NODE_ENV === "production" ? "Server error" : err.message;

    if (res.headersSent) return;

    res.status(status);
    if (req.path.startsWith("/admin/api/") || req.accepts("html") !== "html") {
      return res.json({ error: message });
    }
    res.type("html").send(errorPage(message));
  } catch (fatal) {
    console.error("Error handler itself failed:", fatal);
    if (!res.headersSent) res.status(500).type("text/plain").send("Server error");
  }
});

module.exports = app;
