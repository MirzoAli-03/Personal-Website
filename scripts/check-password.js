// Utility: check whether a candidate password matches the stored admin hash.
// Usage: node scripts/check-password.js "some password"
require("dotenv").config();
const bcrypt = require("bcryptjs");
const { sql } = require("../server/db");

const candidate = process.argv[2];
if (!candidate) {
  console.error('Usage: node scripts/check-password.js "password to test"');
  process.exit(1);
}

(async () => {
  const rows = await sql`SELECT username, password_hash FROM admin_users WHERE username = ${process.env.ADMIN_USERNAME || "admin"}`;
  if (rows.length === 0) {
    console.log("No such admin user.");
    return;
  }
  const ok = await bcrypt.compare(candidate, rows[0].password_hash);
  console.log(`user "${rows[0].username}" — supplied password ${ok ? "MATCHES" : "does NOT match"}`);
})().catch((e) => {
  console.error("Failed:", e.message);
  process.exit(1);
});
