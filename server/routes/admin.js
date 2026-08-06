const express = require("express");
const multer = require("multer");

const q = require("../queries");
const { issueSession, clearSession, requireAuth, verifyCredentials } = require("../auth");
const { slugify, formatDate, parseTags, toBool, toIntOrNull } = require("../utils");

const router = express.Router();

// Vercel caps serverless request bodies around 4.5MB; the browser downscales
// images before upload, and this is the server-side backstop.
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

/* ---------------- Login ---------------- */

router.get("/login", (req, res) => {
  if (req.admin) return res.redirect("/admin");
  res.render("admin/login", { title: "Sign in", error: null, next: req.query.next || "/admin" });
});

router.post("/login", async (req, res, next) => {
  try {
    const { username, password } = req.body;
    const user = await verifyCredentials(String(username || ""), String(password || ""));
    if (!user) {
      return res.status(401).render("admin/login", {
        title: "Sign in",
        error: "Incorrect username or password.",
        next: req.body.next || "/admin",
      });
    }
    issueSession(res, user);
    // Only accept same-site relative paths — an absolute URL here would be an
    // open redirect.
    const dest = String(req.body.next || "/admin");
    res.redirect(dest.startsWith("/") && !dest.startsWith("//") ? dest : "/admin");
  } catch (err) {
    next(err);
  }
});

router.post("/logout", (req, res) => {
  clearSession(res);
  res.redirect("/admin/login");
});

/* ---------------- Everything below requires a session ---------------- */

router.use(requireAuth);

router.use((req, res, next) => {
  res.locals.formatDate = formatDate;
  next();
});

/* ---------------- Dashboard ---------------- */

router.get("/", async (req, res, next) => {
  try {
    const [posts, projects, images, settings] = await Promise.all([
      q.listAllPosts(),
      q.listProjects(),
      q.listImages(),
      q.getSettings(),
    ]);
    res.render("admin/dashboard", {
      title: "Dashboard",
      section: "dashboard",
      posts,
      projects,
      images,
      settings,
    });
  } catch (err) {
    next(err);
  }
});

/* ---------------- Posts ---------------- */

router.get("/posts", async (req, res, next) => {
  try {
    res.render("admin/posts", {
      title: "Posts",
      section: "posts",
      posts: await q.listAllPosts(),
    });
  } catch (err) {
    next(err);
  }
});

router.get("/posts/new", async (req, res, next) => {
  try {
    res.render("admin/post-form", {
      title: "New post",
      section: "posts",
      post: null,
      images: await q.listImages(),
      error: null,
    });
  } catch (err) {
    next(err);
  }
});

router.get("/posts/:id/edit", async (req, res, next) => {
  try {
    const post = await q.getPostById(Number(req.params.id));
    if (!post) return next();
    res.render("admin/post-form", {
      title: "Edit post",
      section: "posts",
      post,
      images: await q.listImages(),
      error: null,
    });
  } catch (err) {
    next(err);
  }
});

async function readPostForm(req, id = null) {
  const title = String(req.body.title || "").trim();
  if (!title) throw Object.assign(new Error("Title is required."), { status: 400 });

  let slug = slugify(req.body.slug || title);
  if (!slug) slug = `post-${Date.now()}`;

  // Slugs are the public URL and must stay unique.
  if (await q.slugExists(slug, id)) {
    let n = 2;
    while (await q.slugExists(`${slug}-${n}`, id)) n++;
    slug = `${slug}-${n}`;
  }

  return {
    slug,
    title,
    excerpt: String(req.body.excerpt || "").trim(),
    body: String(req.body.body || ""),
    tag: String(req.body.tag || "Notes").trim() || "Notes",
    cover_image_id: toIntOrNull(req.body.cover_image_id),
    published: toBool(req.body.published),
  };
}

router.post("/posts", async (req, res, next) => {
  try {
    const id = await q.createPost(await readPostForm(req));
    res.redirect(`/admin/posts/${id}/edit?saved=1`);
  } catch (err) {
    next(err);
  }
});

router.post("/posts/:id", async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    await q.updatePost(id, await readPostForm(req, id));
    res.redirect(`/admin/posts/${id}/edit?saved=1`);
  } catch (err) {
    next(err);
  }
});

router.post("/posts/:id/delete", async (req, res, next) => {
  try {
    await q.deletePost(Number(req.params.id));
    res.redirect("/admin/posts");
  } catch (err) {
    next(err);
  }
});

/* ---------------- Projects ---------------- */

router.get("/projects", async (req, res, next) => {
  try {
    res.render("admin/projects", {
      title: "Projects",
      section: "projects",
      projects: await q.listProjects(),
    });
  } catch (err) {
    next(err);
  }
});

router.get("/projects/new", async (req, res, next) => {
  try {
    res.render("admin/project-form", {
      title: "New project",
      section: "projects",
      project: null,
      images: await q.listImages(),
    });
  } catch (err) {
    next(err);
  }
});

router.get("/projects/:id/edit", async (req, res, next) => {
  try {
    const project = await q.getProjectById(Number(req.params.id));
    if (!project) return next();
    res.render("admin/project-form", {
      title: "Edit project",
      section: "projects",
      project,
      images: await q.listImages(),
    });
  } catch (err) {
    next(err);
  }
});

function readProjectForm(req) {
  const title = String(req.body.title || "").trim();
  if (!title) throw Object.assign(new Error("Title is required."), { status: 400 });
  return {
    title,
    description: String(req.body.description || "").trim(),
    tags: parseTags(req.body.tags),
    url: String(req.body.url || "").trim(),
    link_label: String(req.body.link_label || "View").trim() || "View",
    year: String(req.body.year || "").trim(),
    cover_image_id: toIntOrNull(req.body.cover_image_id),
    featured: toBool(req.body.featured),
    sort_order: Number(req.body.sort_order) || 0,
  };
}

router.post("/projects", async (req, res, next) => {
  try {
    await q.createProject(readProjectForm(req));
    res.redirect("/admin/projects");
  } catch (err) {
    next(err);
  }
});

router.post("/projects/:id", async (req, res, next) => {
  try {
    await q.updateProject(Number(req.params.id), readProjectForm(req));
    res.redirect("/admin/projects");
  } catch (err) {
    next(err);
  }
});

router.post("/projects/:id/delete", async (req, res, next) => {
  try {
    await q.deleteProject(Number(req.params.id));
    res.redirect("/admin/projects");
  } catch (err) {
    next(err);
  }
});

/* ---------------- Images ---------------- */

router.get("/images", async (req, res, next) => {
  try {
    res.render("admin/images", {
      title: "Images",
      section: "images",
      images: await q.listImages(),
      maxBytes: MAX_UPLOAD_BYTES,
    });
  } catch (err) {
    next(err);
  }
});

router.post("/images", upload.single("image"), async (req, res, next) => {
  try {
    if (!req.file) throw Object.assign(new Error("No file received."), { status: 400 });
    const id = await q.createImage({
      filename: req.file.originalname.slice(0, 200),
      mime_type: req.file.mimetype,
      byte_size: req.file.size,
      width: Number(req.body.width) || null,
      height: Number(req.body.height) || null,
      alt_text: String(req.body.alt_text || "").slice(0, 300),
      data: req.file.buffer,
    });
    if (req.get("accept")?.includes("application/json")) {
      return res.json({ id, url: `/images/${id}` });
    }
    res.redirect("/admin/images");
  } catch (err) {
    next(err);
  }
});

router.post("/images/:id/delete", async (req, res, next) => {
  try {
    await q.deleteImage(Number(req.params.id));
    res.redirect("/admin/images");
  } catch (err) {
    next(err);
  }
});

/* ---------------- Site settings ---------------- */

router.get("/settings", async (req, res, next) => {
  try {
    res.render("admin/settings", {
      title: "Site settings",
      section: "settings",
      settings: await q.getSettings(),
      saved: req.query.saved === "1",
    });
  } catch (err) {
    next(err);
  }
});

router.post("/settings", async (req, res, next) => {
  try {
    await q.updateSettings({
      full_name: String(req.body.full_name || "").trim() || "Your Name",
      tagline: String(req.body.tagline || "").trim(),
      hero_heading: String(req.body.hero_heading || "").trim(),
      bio: String(req.body.bio || "").trim(),
      skills: parseTags(req.body.skills),
      email: String(req.body.email || "").trim(),
      github_url: String(req.body.github_url || "").trim(),
      linkedin_url: String(req.body.linkedin_url || "").trim(),
      twitter_url: String(req.body.twitter_url || "").trim(),
    });
    res.redirect("/admin/settings?saved=1");
  } catch (err) {
    next(err);
  }
});

module.exports = router;
