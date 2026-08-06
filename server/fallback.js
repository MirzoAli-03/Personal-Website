// Plain-HTML responses with zero template dependency.
//
// Everything here must work when views/ is missing entirely — these are the
// paths that run *because* something is already broken, so a failure inside
// them (e.g. res.render throwing) becomes an unhandled exception and crashes
// the whole serverless function.

function escape(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  })[c]);
}

function page(title, heading, bodyHtml) {
  return `<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex">
<title>${escape(title)}</title>
<style>
  body{margin:0;background:#111114;color:#ececef;
    font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;
    line-height:1.6;display:flex;min-height:100vh;align-items:center;justify-content:center;padding:24px}
  .card{max-width:640px}
  h1{font-size:1.7rem;letter-spacing:-.02em;margin:0 0 .5em}
  p{color:#9a9aa4;margin:0 0 1em}
  code{background:#1a1a1f;border:1px solid #2a2a30;border-radius:5px;padding:2px 7px;font-size:.9em}
  ul{padding-left:1.2em}
  a{color:#7c93ff}
  @media(prefers-color-scheme:light){
    body{background:#fff;color:#1a1a1e}p{color:#5c5c66}
    code{background:#f5f5f7;border-color:#e4e4e8}a{color:#3454d1}
  }
</style></head>
<body><div class="card"><h1>${escape(heading)}</h1>${bodyHtml}</div></body></html>`;
}

function misconfiguredPage(missing) {
  const items = missing.map((n) => `<li><code>${escape(n)}</code></li>`).join("");
  return page(
    "Setup required",
    "This site isn't configured yet.",
    `<p>The server started, but these environment variables are missing:</p>
     <ul>${items}</ul>
     <p>Add them in your host's dashboard (Vercel: Project → Settings →
     Environment Variables), then redeploy. Only names are shown here, never values.</p>`
  );
}

function errorPage(message) {
  return page("Something went wrong", "Something went wrong",
    `<p>${escape(message)}</p><p><a href="/">Go home</a></p>`);
}

function notFoundPage() {
  return page("Not found", "Page not found",
    `<p>That page doesn't exist, or it may have moved.</p><p><a href="/">Go home</a></p>`);
}

// Attempts a normal template render, falling back to plain HTML if the view
// engine fails for any reason (missing templates, bad locals, bundling issues).
function renderSafe(res, view, locals, fallbackHtml) {
  res.render(view, locals, (err, html) => {
    if (err) {
      console.error(`View "${view}" failed to render:`, err.message);
      return res.type("html").send(fallbackHtml);
    }
    res.type("html").send(html);
  });
}

module.exports = { page, misconfiguredPage, errorPage, notFoundPage, renderSafe };
