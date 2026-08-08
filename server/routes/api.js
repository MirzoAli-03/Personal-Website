const express = require("express");
const multer = require("multer");

const q = require("../queries");
const { issueSession, clearSession, verifyCredentials } = require("../auth");
const { slugify, parseTags, toBool, toIntOrNull } = require("../utils");

const router = express.Router();

const MAX_UPLOAD_BYTES = 4 * 1024 * 1024;
const ALLOWED_MIME = new Set(["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"]);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_UPLOAD_BYTES, files: 1 },
  fileFilter: (req, file, cb) => {
    if (!ALLOWED_MIME.has(file.mimetype)) {
      return cb(new Error("Unsupported file type. Use JPEG, PNG, WebP, GIF, or AVIF."));
    }
    cb(null, true);
  },
});

// Wraps async handlers so rejections reach the error middleware.
const wrap = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

// `code` is optional and lets the client translate known failures.
const bad = (message, status = 400, code = null) =>
  Object.assign(new Error(message), { status, code });

/* ---------------- Auth ---------------- */

router.post(
  "/login",
  wrap(async (req, res) => {
    const { username, password } = req.body || {};
    const user = await verifyCredentials(String(username || ""), String(password || ""));
    if (!user) throw bad("Incorrect username or password.", 401, "bad_credentials");
    issueSession(res, user);
    res.json({ user });
  })
);

router.post("/logout", (req, res) => {
  clearSession(res);
  res.json({ ok: true });
});

router.get("/me", (req, res) => {
  res.json({ user: req.admin ? { username: req.admin.username } : null });
});

/* ---------------- Public reads ---------------- */

router.get(
  "/settings",
  wrap(async (req, res) => res.json(await q.getSettings()))
);

router.get(
  "/posts",
  wrap(async (req, res) => {
    const limit = req.query.limit ? Number(req.query.limit) : null;
    res.json(await q.listPublishedPosts(Number.isInteger(limit) ? limit : null));
  })
);

router.get(
  "/posts/:slug",
  wrap(async (req, res) => {
    const post = await q.getPostBySlug(req.params.slug);
    if (!post) throw bad("Post not found", 404);
    res.json(post);
  })
);

router.get(
  "/projects",
  wrap(async (req, res) => {
    const featuredOnly = req.query.featured === "true";
    const limit = req.query.limit ? Number(req.query.limit) : null;
    res.json(await q.listProjects({ featuredOnly, limit: Number.isInteger(limit) ? limit : null }));
  })
);

/* ---------------- Everything below requires a session ---------------- */

// Always 401 — never redirect. The shared requireAuth sends browsers to a login
// page, which an API client cannot act on.
router.use((req, res, next) => {
  if (!req.admin) return res.status(401).json({ error: "Not authenticated" });
  next();
});

/* ---------------- Admin: posts ---------------- */

router.get(
  "/admin/posts",
  wrap(async (req, res) => res.json(await q.listAllPosts()))
);

router.get(
  "/admin/posts/:id",
  wrap(async (req, res) => {
    const post = await q.getPostById(Number(req.params.id));
    if (!post) throw bad("Post not found", 404);
    res.json(post);
  })
);

async function readPost(body, id = null) {
  const title = String(body.title || "").trim();
  if (!title) throw bad("Title is required.");

  let slug = slugify(body.slug || title) || `post-${Date.now()}`;
  if (await q.slugExists(slug, id)) {
    let n = 2;
    while (await q.slugExists(`${slug}-${n}`, id)) n++;
    slug = `${slug}-${n}`;
  }

  return {
    slug,
    title,
    excerpt: String(body.excerpt || "").trim(),
    body: String(body.body || ""),
    tag: String(body.tag || "Notes").trim() || "Notes",
    cover_image_id: toIntOrNull(body.cover_image_id),
    published: toBool(body.published),
  };
}

router.post(
  "/admin/posts",
  wrap(async (req, res) => {
    const id = await q.createPost(await readPost(req.body || {}));
    res.status(201).json({ id });
  })
);

router.put(
  "/admin/posts/:id",
  wrap(async (req, res) => {
    const id = Number(req.params.id);
    await q.updatePost(id, await readPost(req.body || {}, id));
    res.json({ id });
  })
);

router.delete(
  "/admin/posts/:id",
  wrap(async (req, res) => {
    await q.deletePost(Number(req.params.id));
    res.json({ ok: true });
  })
);

/* ---------------- Admin: projects ---------------- */

router.get(
  "/admin/projects/:id",
  wrap(async (req, res) => {
    const project = await q.getProjectById(Number(req.params.id));
    if (!project) throw bad("Project not found", 404);
    res.json(project);
  })
);

function readProject(body) {
  const title = String(body.title || "").trim();
  if (!title) throw bad("Title is required.");
  return {
    title,
    description: String(body.description || "").trim(),
    tags: parseTags(body.tags),
    url: String(body.url || "").trim(),
    link_label: String(body.link_label || "View").trim() || "View",
    year: String(body.year || "").trim(),
    cover_image_id: toIntOrNull(body.cover_image_id),
    featured: toBool(body.featured),
    sort_order: Number(body.sort_order) || 0,
  };
}

router.post(
  "/admin/projects",
  wrap(async (req, res) => {
    const id = await q.createProject(readProject(req.body || {}));
    res.status(201).json({ id });
  })
);

router.put(
  "/admin/projects/:id",
  wrap(async (req, res) => {
    await q.updateProject(Number(req.params.id), readProject(req.body || {}));
    res.json({ ok: true });
  })
);

router.delete(
  "/admin/projects/:id",
  wrap(async (req, res) => {
    await q.deleteProject(Number(req.params.id));
    res.json({ ok: true });
  })
);

/* ---------------- Admin: images ---------------- */

router.get(
  "/admin/images",
  wrap(async (req, res) => res.json(await q.listImages()))
);

router.post(
  "/admin/images",
  upload.single("image"),
  wrap(async (req, res) => {
    if (!req.file) throw bad("No file received.");
    const id = await q.createImage({
      filename: req.file.originalname.slice(0, 200),
      mime_type: req.file.mimetype,
      byte_size: req.file.size,
      width: Number(req.body.width) || null,
      height: Number(req.body.height) || null,
      alt_text: String(req.body.alt_text || "").slice(0, 300),
      data: req.file.buffer,
    });
    res.status(201).json({ id, url: `/images/${id}` });
  })
);

router.delete(
  "/admin/images/:id",
  wrap(async (req, res) => {
    await q.deleteImage(Number(req.params.id));
    res.json({ ok: true });
  })
);

/* ---------------- Admin: settings ---------------- */

router.put(
  "/admin/settings",
  wrap(async (req, res) => {
    const b = req.body || {};
    await q.updateSettings({
      full_name: String(b.full_name || "").trim() || "Your Name",
      role: String(b.role || "").trim(),
      location: String(b.location || "").trim(),
      tagline: String(b.tagline || "").trim(),
      hero_heading: String(b.hero_heading || "").trim(),
      bio: String(b.bio || "").trim(),
      avatar_image_id: toIntOrNull(b.avatar_image_id),
      skills: parseTags(b.skills),
      email: String(b.email || "").trim(),
      github_url: String(b.github_url || "").trim(),
      linkedin_url: String(b.linkedin_url || "").trim(),
      twitter_url: String(b.twitter_url || "").trim(),
    });
    res.json({ ok: true });
  })
);

module.exports = router;
