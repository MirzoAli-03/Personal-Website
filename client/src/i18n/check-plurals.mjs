// Sanity-checks the Russian plural forms and the fallback behaviour.
import { translate } from "./index.js";

console.log("Russian plural forms for drafts:");
for (const n of [0, 1, 2, 3, 4, 5, 11, 21, 22, 25, 101, 111]) {
  console.log(`  ${String(n).padStart(3)} -> ${translate("ru", "dash.drafts", { n })}`);
}

console.log("\nEnglish:");
for (const n of [0, 1, 2]) console.log(`  ${n} -> ${translate("en", "dash.drafts", { n })}`);

console.log("\nTajik:");
for (const n of [1, 5]) console.log(`  ${n} -> ${translate("tg", "dash.drafts", { n })}`);

console.log("\nInterpolation:", translate("ru", "dash.welcome", { name: "admin" }));
console.log("Missing key returns key:", translate("ru", "no.such.key"));
console.log("Reading time (tg):", translate("tg", "post.minRead", { n: 4 }));
