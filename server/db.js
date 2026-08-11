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

/*
  Retry only failures that happened *before* the query could reach the server:
  a DNS lookup that never resolved, or a connection that never opened. Those
  cannot have executed anything, so replaying them is safe even for INSERTs.

  Deliberately excluded: ECONNRESET, socket hang-ups, and anything after the
  request was sent. Those may have run server-side, and retrying an INSERT that
  actually succeeded would duplicate a row.

  Worth having because the database is remote — a single dropped lookup would
  otherwise blank the whole page with a 500.
*/
const PRE_SEND_FAILURES = new Set(["UND_ERR_CONNECT_TIMEOUT", "ENOTFOUND", "EAI_AGAIN"]);
const MAX_ATTEMPTS = 3;

function isRetryable(err) {
  const code = err?.sourceError?.cause?.code || err?.cause?.code || err?.code;
  return PRE_SEND_FAILURES.has(code);
}

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Accepts both tagged-template usage (sql`SELECT 1`) and direct calls.
async function sql(...args) {
  for (let attempt = 1; ; attempt++) {
    try {
      return await getClient()(...args);
    } catch (err) {
      if (attempt >= MAX_ATTEMPTS || !isRetryable(err)) throw err;
      console.warn(
        `Database unreachable (${err?.sourceError?.cause?.code || "unknown"}), ` +
          `retry ${attempt} of ${MAX_ATTEMPTS - 1}`
      );
      await wait(200 * attempt);
    }
  }
}

module.exports = { sql, getClient };
