import en from "./en.js";
import ru from "./ru.js";
import tg from "./tg.js";

export const LANGUAGES = [
  { code: "en", label: "English", short: "EN" },
  { code: "ru", label: "Русский", short: "RU" },
  { code: "tg", label: "Тоҷикӣ", short: "TJ" },
];

const DICTS = { en, ru, tg };
export const DEFAULT_LANG = "en";

export function isSupported(code) {
  return Object.prototype.hasOwnProperty.call(DICTS, code);
}

// First visit: honour the browser's preferred languages before falling back.
export function detectLang() {
  const stored = safeGet("lang");
  if (stored && isSupported(stored)) return stored;

  for (const tag of navigator.languages || [navigator.language || ""]) {
    const base = String(tag).toLowerCase().split("-")[0];
    if (isSupported(base)) return base;
  }
  return DEFAULT_LANG;
}

function safeGet(key) {
  try {
    return localStorage.getItem(key);
  } catch {
    return null; // private mode
  }
}

// Russian needs three forms: 1 черновик / 2 черновика / 5 черновиков.
// Tajik and English do not inflect after a numeral, so they pass through.
function pluralIndex(lang, n) {
  if (lang !== "ru") return n === 1 ? 0 : 1;
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return 0;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return 1;
  return 2;
}

// Strings may carry pipe-separated plural forms; {name} placeholders are
// substituted from `vars`. A count is passed as `vars.n`.
export function translate(lang, key, vars) {
  const dict = DICTS[lang] || DICTS[DEFAULT_LANG];
  let text = dict[key];

  if (text === undefined) {
    text = DICTS[DEFAULT_LANG][key];
    if (text === undefined) {
      if (import.meta.env?.DEV) console.warn(`[i18n] missing key: ${key}`);
      return key;
    }
  }

  if (text.includes("|")) {
    const forms = text.split("|").map((s) => s.trim());
    const idx = Math.min(pluralIndex(lang, Number(vars?.n) || 0), forms.length - 1);
    text = forms[idx];
  }

  if (vars) {
    text = text.replace(/\{(\w+)\}/g, (match, name) =>
      vars[name] === undefined ? match : String(vars[name])
    );
  }
  return text;
}

// Used for dates and numbers so they follow the chosen language, not the OS.
export const LOCALES = { en: "en-US", ru: "ru-RU", tg: "tg-TJ" };
