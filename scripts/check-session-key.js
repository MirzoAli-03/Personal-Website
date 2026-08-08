// Verifies the app works with DATABASE_URL alone, and that a session issued by
// one process is still accepted by the next — the property that would break if
// the derived key were not stable.
require("dotenv").config();
delete process.env.JWT_SECRET; // simulate a host with only DATABASE_URL set

const http = require("http");

function request(port, path, { method = "GET", body, cookie } = {}) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : null;
    const req = http.request(
      {
        port,
        path,
        method,
        headers: {
          Accept: "application/json",
          ...(data ? { "Content-Type": "application/json", "Content-Length": Buffer.byteLength(data) } : {}),
          ...(cookie ? { Cookie: cookie } : {}),
        },
      },
      (res) => {
        let out = "";
        res.on("data", (c) => (out += c));
        res.on("end", () => resolve({ status: res.statusCode, body: out, setCookie: res.headers["set-cookie"] }));
      }
    );
    req.on("error", reject);
    if (data) req.write(data);
    req.end();
  });
}

function boot(port) {
  // Fresh module registry each time, so this really is a cold start.
  for (const k of Object.keys(require.cache)) delete require.cache[k];
  require("dotenv").config();
  delete process.env.JWT_SECRET;
  const app = require("../server/app");
  return new Promise((resolve) => {
    const server = app.listen(port, () => resolve(server));
  });
}

(async () => {
  const password = process.argv[2];
  if (!password) {
    console.error('Usage: node scripts/check-session-key.js "admin password"');
    process.exit(1);
  }

  let server = await boot(5401);
  const health = await request(5401, "/healthz");
  console.log("healthz:", health.body);

  const login = await request(5401, "/api/login", {
    method: "POST",
    body: { username: process.env.ADMIN_USERNAME || "admin", password },
  });
  console.log("login  :", login.status);
  const cookie = (login.setCookie || []).map((c) => c.split(";")[0]).join("; ");

  const me1 = await request(5401, "/api/admin/posts", { cookie });
  console.log("admin call, same process :", me1.status);
  await new Promise((r) => server.close(r));

  // Restart — a derived key must produce the same secret, or the cookie dies.
  server = await boot(5402);
  const me2 = await request(5402, "/api/admin/posts", { cookie });
  console.log("admin call, after restart:", me2.status, me2.status === 200 ? "(session survived)" : "(SESSION LOST)");
  await new Promise((r) => server.close(r));

  process.exit(me1.status === 200 && me2.status === 200 ? 0 : 1);
})().catch((e) => {
  console.error("Failed:", e.message);
  process.exit(1);
});
