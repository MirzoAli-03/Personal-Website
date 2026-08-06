function slugify(input) {
  return String(input)
    .toLowerCase()
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

module.exports = { slugify, formatDate, readingTime, parseTags, toBool, toIntOrNull };
