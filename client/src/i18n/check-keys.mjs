// Verifies every locale defines exactly the same keys as English.
// Run with: node src/i18n/check-keys.mjs   (from the client directory)
import en from "./en.js";
import ru from "./ru.js";
import tg from "./tg.js";

const base = Object.keys(en).sort();
let failed = false;

for (const [name, dict] of [["ru", ru], ["tg", tg]]) {
  const keys = Object.keys(dict);
  const missing = base.filter((k) => !keys.includes(k));
  const extra = keys.filter((k) => !base.includes(k));
  const untranslated = base.filter((k) => dict[k] === en[k] && en[k].length > 3);

  console.log(`\n${name}: ${keys.length} keys`);
  if (missing.length) { failed = true; console.log(`  MISSING (${missing.length}):`, missing.join(", ")); }
  if (extra.length) { failed = true; console.log(`  EXTRA (${extra.length}):`, extra.join(", ")); }
  if (untranslated.length) console.log(`  same as English (${untranslated.length}):`, untranslated.join(", "));
  if (!missing.length && !extra.length) console.log("  keys match English");
}

console.log(`\nen: ${base.length} keys`);
process.exit(failed ? 1 : 0);
