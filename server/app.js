const fs = require("fs");
const path = require("path");
const express = require("express");
const cookieParser = require("cookie-parser");

const { attachUser } = require("./auth");
const { guard, missingVars } = require("./config-check");
const publicRoutes = require("./routes/public");
const adminRoutes = require("./routes/admin");
const imageRoutes = require("./routes/images");

const app = express();

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "..", "views"));
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
  res.status(404).render("404", { title: "Not found" });
});

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(err);
  const status = err.status || 500;
  if (req.path.startsWith("/admin/api/") || req.accepts("html") !== "html") {
    return res.status(status).json({ error: err.message || "Server error" });
  }
  res.status(status).render("error", {
    title: "Something went wrong",
    message: process.env.NODE_ENV === "production" ? "Server error" : err.message,
  });
});

module.exports = app;
