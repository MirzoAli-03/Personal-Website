const { neon } = require("@neondatabase/serverless");

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set. Copy .env.example to .env and fill it in.");
}

// HTTP driver — one round trip per query, no pool to exhaust across serverless
// invocations. Tagged-template usage parameterises values, so it is injection-safe.
const sql = neon(process.env.DATABASE_URL);

module.exports = { sql };
