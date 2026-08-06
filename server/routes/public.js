const express = require("express");
const q = require("../queries");
const { formatDate, readingTime } = require("../utils");

const router = express.Router();

// Every public view needs settings for the nav, footer, and meta tags.
router.use(async (req, res, next) => {
  try {
    res.locals.settings = await q.getSettings();
    res.locals.formatDate = formatDate;
    res.locals.readingTime = readingTime;
    next();
  } catch (err) {
    next(err);
  }
});

router.get("/", async (req, res, next) => {
  try {
    const [projects, posts] = await Promise.all([
      q.listProjects({ featuredOnly: true, limit: 3 }),
      q.listPublishedPosts(2),
    ]);
    res.render("index", { page: "index", title: null, projects, posts });
  } catch (err) {
    next(err);
  }
});

router.get("/projects", async (req, res, next) => {
  try {
    const projects = await q.listProjects();
    res.render("projects", { page: "projects", title: "Projects", projects });
  } catch (err) {
    next(err);
  }
});

router.get("/blog", async (req, res, next) => {
  try {
    const posts = await q.listPublishedPosts();
    res.render("blog", { page: "blog", title: "Blog", posts });
  } catch (err) {
    next(err);
  }
});

router.get("/blog/:slug", async (req, res, next) => {
  try {
    const post = await q.getPostBySlug(req.params.slug);
    if (!post) return next();
    res.render("post", { page: "blog", title: post.title, post });
  } catch (err) {
    next(err);
  }
});

router.get("/contact", (req, res) => {
  res.render("contact", { page: "contact", title: "Contact" });
});

module.exports = router;
