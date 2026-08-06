const { neon } = require("@neondatabase/serverless");

let client = null;

// Built lazily so a missing DATABASE_URL surfaces as a readable error page
// instead of throwing at module load — on serverless that reads as an opaque
// FUNCTION_INVOCATION_FAILED with nothing useful in the response.
function getClient() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not set");
  }
  if (!client) {
    client = neon(process.env.DATABASE_URL);
  }
  return client;
}

// Accepts both tagged-template usage (sql`SELECT 1`) and direct calls.
function sql(...args) {
  return getClient()(...args);
}

module.exports = { sql, getClient };
