// Russian and Tajik Cyrillic to Latin. Without this a Cyrillic title slugs to
// nothing and falls back to a timestamp, so every non-English post would get an
// unreadable URL.
const TRANSLIT = {
  а: "a", б: "b", в: "v", г: "g", д: "d", е: "e", ё: "yo", ж: "zh", з: "z",
  и: "i", й: "y", к: "k", л: "l", м: "m", н: "n", о: "o", п: "p", р: "r",
  с: "s", т: "t", у: "u", ф: "f", х: "kh", ц: "ts", ч: "ch", ш: "sh",
  щ: "shch", ъ: "", ы: "y", ь: "", э: "e", ю: "yu", я: "ya",
  // Tajik-specific letters
  ғ: "gh", ӣ: "i", қ: "q", ӯ: "u", ҳ: "h", ҷ: "j",
};

function transliterate(input) {
  return String(input)
    .toLowerCase()
    .replace(/[Ѐ-ӿ]/g, (char) => (char in TRANSLIT ? TRANSLIT[char] : ""));
}

function slugify(input) {
  return transliterate(input)
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function formatDate(value) {
  if (!value) return "";
  return new Date(value).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

// Rough reading time from the text content of an HTML body.
function readingTime(html) {
  const words = String(html || "")
    .replace(/<[^>]*>/g, " ")
    .split(/\s+/)
    .filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

function parseTags(input) {
  if (Array.isArray(input)) return input;
  return String(input || "")
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
}

function toBool(value) {
  return value === true || value === "true" || value === "on" || value === "1";
}

function toIntOrNull(value) {
  const n = Number(value);
  return Number.isInteger(n) && n > 0 ? n : null;
}

module.exports = { slugify, transliterate, formatDate, readingTime, parseTags, toBool, toIntOrNull };
