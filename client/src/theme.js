import { createTheme } from "@mui/material/styles";

const shared = {
  shape: { borderRadius: 12 },
  typography: {
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    h1: { fontWeight: 700, letterSpacing: "-0.03em", lineHeight: 1.15 },
    h2: { fontWeight: 700, letterSpacing: "-0.02em" },
    h3: { fontWeight: 700, letterSpacing: "-0.02em" },
    h4: { fontWeight: 600 },
    h5: { fontWeight: 600 },
    h6: { fontWeight: 600 },
    button: { textTransform: "none", fontWeight: 600 },
  },
  components: {
    MuiButton: {
      styleOverrides: { root: { borderRadius: 8, paddingInline: 20 } },
    },
    MuiCard: {
      styleOverrides: {
        root: { transition: "transform .15s ease, border-color .15s ease" },
      },
    },
    MuiTextField: { defaultProps: { size: "small" } },
    MuiChip: { styleOverrides: { root: { fontWeight: 600 } } },
  },
};

export function buildTheme(mode) {
  return createTheme({
    ...shared,
    palette:
      mode === "dark"
        ? {
            mode: "dark",
            primary: { main: "#7c93ff" },
            background: { default: "#111114", paper: "#1a1a1f" },
            text: { primary: "#ececef", secondary: "#9a9aa4" },
            divider: "#2a2a30",
          }
        : {
            mode: "light",
            primary: { main: "#3454d1" },
            background: { default: "#ffffff", paper: "#ffffff" },
            text: { primary: "#1a1a1e", secondary: "#5c5c66" },
            divider: "#e4e4e8",
          },
  });
}
