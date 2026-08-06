const { sql } = require("./db");

/* ---------------- Site settings ---------------- */

async function getSettings() {
  const rows = await sql`SELECT * FROM site_settings WHERE id = 1`;
  return rows[0] || {};
}

async function updateSettings(data) {
  await sql`
    UPDATE site_settings SET
      full_name    = ${data.full_name},
      tagline      = ${data.tagline},
      hero_heading = ${data.hero_heading},
      bio          = ${data.bio},
      skills       = ${data.skills},
      email        = ${data.email},
      github_url   = ${data.github_url},
      linkedin_url = ${data.linkedin_url},
      twitter_url  = ${data.twitter_url},
      updated_at   = now()
    WHERE id = 1
  `;
}

/* ---------------- Posts ---------------- */

async function listPublishedPosts(limit = null) {
  if (limit) {
    return sql`
      SELECT id, slug, title, excerpt, tag, cover_image_id, published_at
      FROM posts WHERE published = true
      ORDER BY published_at DESC NULLS LAST, id DESC
      LIMIT ${limit}
    `;
  }
  return sql`
    SELECT id, slug, title, excerpt, tag, cover_image_id, published_at
    FROM posts WHERE published = true
    ORDER BY published_at DESC NULLS LAST, id DESC
  `;
}

async function listAllPosts() {
  return sql`
    SELECT id, slug, title, excerpt, tag, published, published_at, updated_at
    FROM posts ORDER BY COALESCE(published_at, created_at) DESC, id DESC
  `;
}

async function getPostBySlug(slug) {
  const rows = await sql`SELECT * FROM posts WHERE slug = ${slug} AND published = true`;
  return rows[0] || null;
}

async function getPostById(id) {
  const rows = await sql`SELECT * FROM posts WHERE id = ${id}`;
  return rows[0] || null;
}

async function slugExists(slug, excludeId = null) {
  const rows = excludeId
    ? await sql`SELECT 1 FROM posts WHERE slug = ${slug} AND id <> ${excludeId}`
    : await sql`SELECT 1 FROM posts WHERE slug = ${slug}`;
  return rows.length > 0;
}

async function createPost(d) {
  const rows = await sql`
    INSERT INTO posts (slug, title, excerpt, body, tag, cover_image_id, published, published_at)
    VALUES (${d.slug}, ${d.title}, ${d.excerpt}, ${d.body}, ${d.tag},
            ${d.cover_image_id}, ${d.published}, ${d.published ? new Date() : null})
    RETURNING id
  `;
  return rows[0].id;
}

async function updatePost(id, d) {
  // Stamp published_at the first time a post goes live; keep the original date after.
  await sql`
    UPDATE posts SET
      slug = ${d.slug},
      title = ${d.title},
      excerpt = ${d.excerpt},
      body = ${d.body},
      tag = ${d.tag},
      cover_image_id = ${d.cover_image_id},
      published = ${d.published},
      published_at = CASE
        WHEN ${d.published} AND published_at IS NULL THEN now()
        WHEN ${d.published} THEN published_at
        ELSE NULL
      END,
      updated_at = now()
    WHERE id = ${id}
  `;
}

async function deletePost(id) {
  await sql`DELETE FROM posts WHERE id = ${id}`;
}

/* ---------------- Projects ---------------- */

async function listProjects({ featuredOnly = false, limit = null } = {}) {
  if (featuredOnly && limit) {
    return sql`SELECT * FROM projects WHERE featured = true ORDER BY sort_order, id LIMIT ${limit}`;
  }
  if (featuredOnly) {
    return sql`SELECT * FROM projects WHERE featured = true ORDER BY sort_order, id`;
  }
  return sql`SELECT * FROM projects ORDER BY sort_order, id`;
}

async function getProjectById(id) {
  const rows = await sql`SELECT * FROM projects WHERE id = ${id}`;
  return rows[0] || null;
}

async function createProject(d) {
  const rows = await sql`
    INSERT INTO projects (title, description, tags, url, link_label, year, cover_image_id, featured, sort_order)
    VALUES (${d.title}, ${d.description}, ${d.tags}, ${d.url}, ${d.link_label},
            ${d.year}, ${d.cover_image_id}, ${d.featured}, ${d.sort_order})
    RETURNING id
  `;
  return rows[0].id;
}

async function updateProject(id, d) {
  await sql`
    UPDATE projects SET
      title = ${d.title},
      description = ${d.description},
      tags = ${d.tags},
      url = ${d.url},
      link_label = ${d.link_label},
      year = ${d.year},
      cover_image_id = ${d.cover_image_id},
      featured = ${d.featured},
      sort_order = ${d.sort_order}
    WHERE id = ${id}
  `;
}

async function deleteProject(id) {
  await sql`DELETE FROM projects WHERE id = ${id}`;
}

/* ---------------- Images ---------------- */

// Deliberately excludes `data` — never pull image bytes into a list view.
async function listImages() {
  return sql`
    SELECT id, filename, mime_type, byte_size, width, height, alt_text, created_at
    FROM images ORDER BY created_at DESC, id DESC
  `;
}

async function getImageData(id) {
  const rows = await sql`SELECT mime_type, data FROM images WHERE id = ${id}`;
  return rows[0] || null;
}

async function createImage(d) {
  const rows = await sql`
    INSERT INTO images (filename, mime_type, byte_size, width, height, alt_text, data)
    VALUES (${d.filename}, ${d.mime_type}, ${d.byte_size}, ${d.width}, ${d.height},
            ${d.alt_text}, ${d.data})
    RETURNING id
  `;
  return rows[0].id;
}

async function updateImageAlt(id, alt) {
  await sql`UPDATE images SET alt_text = ${alt} WHERE id = ${id}`;
}

async function deleteImage(id) {
  await sql`DELETE FROM images WHERE id = ${id}`;
}

module.exports = {
  getSettings,
  updateSettings,
  listPublishedPosts,
  listAllPosts,
  getPostBySlug,
  getPostById,
  slugExists,
  createPost,
  updatePost,
  deletePost,
  listProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
  listImages,
  getImageData,
  createImage,
  updateImageAlt,
  deleteImage,
};
