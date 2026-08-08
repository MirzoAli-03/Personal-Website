import { createContext, useContext, useEffect, useMemo, useState, useCallback } from "react";
import { api } from "../api";
import { detectLang, translate, isSupported, LOCALES } from "../i18n";

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [mode, setMode] = useState(() => {
    try {
      const stored = localStorage.getItem("theme");
      if (stored) return stored;
    } catch {
      // localStorage unavailable (private mode) — fall through to the OS setting.
    }
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  });

  const [lang, setLangState] = useState(detectLang);
  const [settings, setSettings] = useState(null);
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);

  const setLang = useCallback((next) => {
    if (!isSupported(next)) return;
    setLangState(next);
    try {
      localStorage.setItem("lang", next);
    } catch {
      // Non-fatal: the choice just won't persist across reloads.
    }
  }, []);

  // Screen readers and browser translation prompts both read this.
  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const t = useCallback((key, vars) => translate(lang, key, vars), [lang]);

  const formatDate = useCallback(
    (value) =>
      value
        ? new Date(value).toLocaleDateString(LOCALES[lang] || "en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
          })
        : "",
    [lang]
  );

  const toggleMode = useCallback(() => {
    setMode((prev) => {
      const next = prev === "dark" ? "light" : "dark";
      try {
        localStorage.setItem("theme", next);
      } catch {
        // Non-fatal: the theme just won't persist across reloads.
      }
      return next;
    });
  }, []);

  const refreshSettings = useCallback(async () => {
    const data = await api.getSettings();
    setSettings(data);
    return data;
  }, []);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      // Settings drive the nav and footer; a failure here shouldn't block the
      // app, so fall back to a usable default.
      const [settingsResult, meResult] = await Promise.allSettled([
        api.getSettings(),
        api.me(),
      ]);
      if (cancelled) return;

      setSettings(
        settingsResult.status === "fulfilled"
          ? settingsResult.value
          : { full_name: "Personal Website", skills: [] }
      );
      setUser(meResult.status === "fulfilled" ? meResult.value.user : null);
      setReady(true);
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(async (username, password) => {
    const { user: loggedIn } = await api.login(username, password);
    setUser(loggedIn);
    return loggedIn;
  }, []);

  const logout = useCallback(async () => {
    await api.logout();
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({
      mode,
      toggleMode,
      lang,
      setLang,
      t,
      formatDate,
      settings,
      setSettings,
      refreshSettings,
      user,
      login,
      logout,
      ready,
    }),
    [mode, toggleMode, lang, setLang, t, formatDate, settings, refreshSettings, user, login, logout, ready]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used inside AppProvider");
  return ctx;
}
