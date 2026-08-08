// Utility: show which database the app is actually connected to, and what is
// in admin_users. Useful when more than one Neon project is in play.
// Run with: node scripts/db-target.js
require("dotenv").config();
const { sql } = require("../server/db");

(async () => {
  const host = (process.env.DATABASE_URL || "").split("@")[1]?.split("/")[0] || "unknown";
  const [info] = await sql`SELECT current_database() AS db, current_user AS role`;
  console.log(`host     : ${host}`);
  console.log(`database : ${info.db}`);
  console.log(`role     : ${info.role}`);

  const rows = await sql`SELECT id, username, password_hash, created_at FROM admin_users ORDER BY id`;
  console.log(`\nadmin_users (${rows.length} row(s)):`);
  for (const r of rows) {
    // Only the shape of the hash is printed, never enough to be useful.
    const looksBcrypt = /^\$2[aby]\$\d{2}\$/.test(r.password_hash);
    console.log(
      `  id=${r.id}  username=${r.username}  ` +
        `hash=${looksBcrypt ? "bcrypt (valid)" : "NOT A HASH — login will always fail"}  ` +
        `len=${r.password_hash.length}`
    );
  }
})().catch((e) => {
  console.error("Failed:", e.message);
  process.exit(1);
});
