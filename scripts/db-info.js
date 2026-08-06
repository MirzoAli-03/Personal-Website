// Utility: print the current database schema and row counts.
// Run with: npm run db:info
require("dotenv").config();
const { sql } = require("../server/db");

(async () => {
  const cols = await sql`
    SELECT table_name, column_name, data_type
    FROM information_schema.columns
    WHERE table_schema = 'public'
    ORDER BY table_name, ordinal_position
  `;

  const grouped = {};
  for (const c of cols) (grouped[c.table_name] ||= []).push(`${c.column_name} (${c.data_type})`);

  for (const [table, columns] of Object.entries(grouped)) {
    const [{ count }] = await sql(`SELECT count(*)::int AS count FROM ${table}`);
    console.log(`\n${table} — ${count} row(s)`);
    for (const col of columns) console.log(`  ${col}`);
  }
})().catch((e) => {
  console.error("Failed:", e.message);
  process.exit(1);
});
