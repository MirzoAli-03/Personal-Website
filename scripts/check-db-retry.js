// Verifies the retry policy: pre-send failures replay, anything that may have
// executed server-side does not.
require("dotenv").config();
const path = require("path");

function loadDb(fakeClient) {
  delete require.cache[require.resolve("../server/db")];
  delete require.cache[require.resolve("@neondatabase/serverless")];
  const mod = require.resolve("@neondatabase/serverless");
  require.cache[mod] = { id: mod, filename: mod, loaded: true, exports: { neon: () => fakeClient } };
  return require("../server/db");
}

function failingClient(code, failures) {
  let calls = 0;
  const fn = async () => {
    calls++;
    if (calls <= failures) {
      const err = new Error("Error connecting to database: fetch failed");
      err.sourceError = { cause: { code } };
      throw err;
    }
    return [{ ok: true }];
  };
  fn.calls = () => calls;
  return fn;
}

(async () => {
  // 1. Transient DNS failure, recovers on the second attempt
  let c = failingClient("ENOTFOUND", 1);
  let { sql } = loadDb(c);
  let out = await sql`SELECT 1`;
  console.log(`ENOTFOUND x1 -> ${JSON.stringify(out)} after ${c.calls()} attempt(s)`);

  // 2. Connect timeout that never clears, gives up after MAX_ATTEMPTS
  c = failingClient("UND_ERR_CONNECT_TIMEOUT", 99);
  ({ sql } = loadDb(c));
  try {
    await sql`SELECT 1`;
    console.log("persistent timeout -> unexpectedly succeeded");
  } catch {
    console.log(`persistent timeout -> gave up after ${c.calls()} attempt(s)`);
  }

  // 3. ECONNRESET may have executed server-side, so it must NOT be replayed
  c = failingClient("ECONNRESET", 99);
  ({ sql } = loadDb(c));
  try {
    await sql`INSERT INTO t VALUES (1)`;
  } catch {
    console.log(`ECONNRESET -> ${c.calls()} attempt(s) (must be 1, no replay)`);
  }

  // 4. A real SQL error is deterministic and must not be retried
  c = async () => {
    const err = new Error('relation "nope" does not exist');
    err.code = "42P01";
    throw err;
  };
  let calls = 0;
  const counted = async (...a) => { calls++; return c(...a); };
  ({ sql } = loadDb(counted));
  try {
    await sql`SELECT * FROM nope`;
  } catch {
    console.log(`SQL error -> ${calls} attempt(s) (must be 1, no replay)`);
  }
})().catch((e) => {
  console.error("Harness failed:", e.message);
  process.exit(1);
});
