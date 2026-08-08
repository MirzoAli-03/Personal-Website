// Utility: list the admin accounts that exist in the database.
// Never prints password hashes. Run with: npm run whoami
require("dotenv").config();
const { sql } = require("../server/db");

(async () => {
  const rows = await sql`SELECT id, username, created_at FROM admin_users ORDER BY id`;
  if (rows.length === 0) {
    console.log("No admin users exist. Set ADMIN_PASSWORD in .env and run `npm run setup`.");
    return;
  }
  console.log(`${rows.length} admin account(s):`);
  for (const r of rows) {
    console.log(`  ${r.username}  (created ${new Date(r.created_at).toLocaleDateString()})`);
  }
})().catch((e) => {
  console.error("Failed:", e.message);
  process.exit(1);
});
